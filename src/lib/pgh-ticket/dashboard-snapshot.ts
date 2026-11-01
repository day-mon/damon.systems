/*
Frozen-dataset snapshot for the pgh-ticket dashboard.

the 4.7m-row tickets table makes every unfiltered dashboard widget a
full seq scan (~7s each on this hardware, ~half a minute total for the
initial page load, worse before the current single-pass rewrite). the
dataset does not change, so the answer is boring: compute the
unfiltered payload once, store it in a table, read it back in
milliseconds.

self-healing design: nothing external creates or refreshes this. on
first access after deploy, ensureDashboardSnapshot() notices the empty
table and rebuilds in the background; concurrent requests fall back to
the live path until the snapshot exists. rebuild is only needed if
data ever changes - re-run by deleting the rows (app re-creates).
*/

import { postgresClient } from "#/lib/db/client";
import { logger } from "#/lib/logger";
import type { StatItem } from "./types";

export interface DashboardCounts {
	total: number;
	openTickets: number;
	totalAmount: number;
	geocodedCount: number;
	totalLocations: number;
	dateRange: { min_date: string; max_date: string } | null;
}

export interface DashboardBreakdowns {
	byStatus: StatItem[];
	byState: StatItem[];
	topOfficers: StatItem[];
	topPlates: StatItem[];
	topLocations: StatItem[];
	topViolations: StatItem[];
	byMake: StatItem[];
	byYear: StatItem[];
}

export interface DashboardFilterOptions {
	officers: string[];
	years: string[];
	statuses: string[];
	violations: string[];
	locations: string[];
}

interface SnapshotRow {
	key: string;
	payload: unknown;
}

let buildPromise: Promise<void> | null = null;

/**
 * read one snapshot entry; null when missing. rebuilds the snapshot
 * out-of-band whenever the table lacks any of the expected keys.
 * never throws: on anything unexpected, just report "no cache" so the
 * caller can fall back to the live query path.
 */
export async function readSnapshot<T>(key: string): Promise<T | null> {
	try {
		await postgresClient`create table if not exists dashboard_snapshot (
			key text primary key,
			payload jsonb not null,
			computed_at timestamptz not null default now()
		)`;

		const rows = await postgresClient<SnapshotRow[]>`
			select payload from dashboard_snapshot where key = ${key}
		`;

		if (rows.length === 0) {
			scheduleSnapshotBuild();
		}

		// SAFETY: payload is written by buildSnapshot below with exactly the
		// declared shapes; a stale shape desyncs the dashboard until the
		// row is deleted and rebuilt, which is the documented recovery.
		return (rows[0]?.payload as T | undefined) ?? null;
	} catch (err) {
		logger.warn({ err, key }, "dashboard snapshot read failed");

		return null;
	}
}

function scheduleSnapshotBuild(): void {
	if (buildPromise) return;

	buildPromise = (async () => {
		try {
			await buildSnapshot();
		} catch (err) {
			logger.error({ err }, "dashboard snapshot build failed");
		} finally {
			buildPromise = null;
		}
	})();

	// survives process exit mid-build; rows are only written at the end-ish
	void buildPromise.catch(() => undefined);
}

async function buildSnapshot(): Promise<void> {
	const sql = postgresClient;
	const t0 = Date.now();
	const log = logger.child({ job: "dashboard-snapshot" });

	const [counts] = await sql<
		{
			total: number;
			open_tickets: number;
			total_amount: number;
			min_date: string | null;
			max_date: string | null;
		}[]
	>`
		select
			count(*) as total,
			count(*) filter (where status = 'open') as open_tickets,
			coalesce(sum(case when amount_due like '$%' and status = 'open'
				then cast(replace(replace(amount_due,'$',''),',','') as double precision) end), 0) as total_amount,
			min(issue_date)::text as min_date, max(issue_date)::text as max_date
		from tickets
	`;

	const [geo] = await sql<
		{ c: number }[]
	>`select count(*) as c from locations where latitude is not null`;

	const [locs] = await sql<{ c: number }[]>`
		select count(*) as c from locations
	`;

	const countsPayload: DashboardCounts = {
		total: Number(counts.total),
		openTickets: Number(counts.open_tickets),
		totalAmount: Number(counts.total_amount),
		geocodedCount: Number(geo.c),
		totalLocations: Number(locs.c),
		dateRange:
			counts.min_date || counts.max_date
				? {
						min_date: counts.min_date ?? "",
						max_date: counts.max_date ?? "",
					}
				: null,
	};

	log.info({ elapsedMs: Date.now() - t0 }, "counts computed");

	// single shared group-scan; mirrors fetchBreakdowns' no-filter constants
	const group = async (
		colExpr: string,
		outputKey: string,
		emptyGuard: string,
		orderExpr: string,
	): Promise<StatItem[]> => {
		const rows = await sql.unsafe<Record<string, string | number>[]>(
			`select ${colExpr} as value, count(*) as count from tickets ${emptyGuard} group by 1 order by ${orderExpr} desc limit 10`,
		);

		return rows.map((r) => ({ [outputKey]: r.value, count: Number(r.count) }));
	};

	const breakdownsPayload: DashboardBreakdowns = {
		byStatus: await group("status", "status", "where status != ''", "count(*)"),
		byState: await group("state", "state", "where state != ''", "count(*)"),
		topOfficers: await group(
			"officer",
			"officer",
			"where officer != ''",
			"count(*)",
		),
		topPlates: await group(
			"license_plate",
			"license_plate",
			"where license_plate != ''",
			"count(*)",
		),
		topLocations: await group(
			"location",
			"location",
			"where location != ''",
			"count(*)",
		),
		topViolations: await group(
			"violation",
			"violation",
			"where violation != ''",
			"count(*)",
		),
		byMake: await group(
			"coalesce(nullif(vehicle_make,''),'Unknown')",
			"make",
			"",
			"count(*)",
		),
		byYear: await group(
			"extract(year from issue_date)::text",
			"year",
			"where issue_date is not null",
			"min(extract(year from issue_date))",
		),
	};

	log.info({ elapsedMs: Date.now() - t0 }, "breakdowns computed");

	const officers = (
		await sql<
			{ officer: string }[]
		>`select distinct officer from tickets where officer != '' order by officer`
	).map((r) => r.officer);

	const years = (
		await sql<
			{ year: string }[]
		>`select extract(year from issue_date)::text as year from tickets where issue_date is not null group by 1 order by 1 desc`
	).map((r) => r.year);

	const statuses = (
		await sql<
			{ status: string }[]
		>`select distinct status from tickets where status != '' order by status`
	).map((r) => r.status);

	const violations = (
		await sql<
			{ violation: string }[]
		>`select distinct violation from tickets where violation != '' order by violation`
	).map((r) => r.violation);

	const locations = (
		await sql<
			{ location: string }[]
		>`select distinct location from tickets where location != '' order by location limit 1000`
	).map((r) => r.location);

	const filterOptionsPayload: DashboardFilterOptions = {
		officers,
		years,
		statuses,
		violations,
		locations,
	};

	for (const [key, payload] of Object.entries({
		counts: countsPayload,
		breakdowns: breakdownsPayload,
		filter_options: filterOptionsPayload,
	})) {
		await sql`
			insert into dashboard_snapshot (key, payload)
			values (${key}, ${JSON.stringify(payload)}::jsonb)
			on conflict (key) do update set payload = excluded.payload,
				computed_at = now()
		`;
	}

	log.info(
		{ elapsedMs: Date.now() - t0, total: countsPayload.total },
		"dashboard snapshot built",
	);
}
