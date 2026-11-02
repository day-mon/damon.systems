/*
DashboardSnapshot — frozen-dataset cache for the pgh-ticket dashboard.

the 4.7m-row tickets table makes every unfiltered dashboard widget a full seq
scan. the dataset doesn't change, so: compute the unfiltered payloads once,
store them per-key in a table, read back in ms. nothing external refreshes
it — first read after deploy notices the empty table and rebuilds in the
background while callers keep taking the live path. if the data ever does
change, delete the rows and the next read rebuilds.
*/

import { asc, count, desc, isNotNull, ne, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import postgres from "postgres";
import { z } from "zod";

import type { DrizzleDb } from "#/lib/db/client";
import { db, postgresClient } from "#/lib/db/client";
import {
	dashboardSnapshotTable,
	pghLocations,
	pghTickets,
} from "#/lib/db/schema";
import { logger } from "#/lib/logger";

import type { StatItem } from "./types";

// field-wise mirror of StatItem so the parsed shape IS the domain type,
// no index-signature theater

const StatItemSchema = z.object({
	status: z.string().optional(),
	state: z.string().optional(),
	officer: z.string().optional(),
	license_plate: z.string().optional(),
	location: z.string().optional(),
	violation: z.string().optional(),
	make: z.string().optional(),
	year: z.string().optional(),
	count: z.number(),
});

const CountsSchema = z.object({
	total: z.number(),
	openTickets: z.number(),
	totalAmount: z.number(),
	geocodedCount: z.number(),
	totalLocations: z.number(),
	dateRange: z.object({ min_date: z.string(), max_date: z.string() }).nullable(),
});

const BreakdownsSchema = z.object({
	byStatus: z.array(StatItemSchema),
	byState: z.array(StatItemSchema),
	topOfficers: z.array(StatItemSchema),
	topPlates: z.array(StatItemSchema),
	topLocations: z.array(StatItemSchema),
	topViolations: z.array(StatItemSchema),
	byMake: z.array(StatItemSchema),
	byYear: z.array(StatItemSchema),
});

const FilterOptionsSchema = z.object({
	officers: z.array(z.string()),
	years: z.array(z.string()),
	statuses: z.array(z.string()),
	violations: z.array(z.string()),
	locations: z.array(z.string()),
});

export type DashboardCounts = z.infer<typeof CountsSchema>;

export type DashboardBreakdowns = z.infer<typeof BreakdownsSchema>;

export type DashboardFilterOptions = z.infer<typeof FilterOptionsSchema>;

const SCHEMAS = {
	counts: CountsSchema,
	breakdowns: BreakdownsSchema,
	filter_options: FilterOptionsSchema,
} as const;

export type SnapshotKey = keyof typeof SCHEMAS;

export type SnapshotPayload<K extends SnapshotKey> = z.infer<(typeof SCHEMAS)[K]>;

type PgClient = ReturnType<typeof postgres>;

export class DashboardSnapshot {
	private buildPromise: Promise<void> | null = null;

	static create(orm: DrizzleDb = db, pg: PgClient = postgresClient): DashboardSnapshot {
		return new DashboardSnapshot(orm, pg);
	}

	private constructor(
		private readonly orm: DrizzleDb,
		private readonly pg: PgClient,
	) {}

	/**
	 * read one entry, null when missing or malformed (caller falls back to
	 * the live query path). a miss schedules an out-of-band rebuild.
	 */
	async read<K extends SnapshotKey>(key: K): Promise<SnapshotPayload<K> | null> {
		try {
			await this.ensureTable();

			const rows = await this.orm
				.select({ payload: dashboardSnapshotTable.payload })
				.from(dashboardSnapshotTable)
				.where(sql`${dashboardSnapshotTable.key} = ${key}`)
				.limit(1);

			if (rows.length === 0) {
				this.scheduleBuild();

				return null;
			}

			const parsed = SCHEMAS[key].safeParse(rows[0].payload);

			if (!parsed.success) {
				logger.warn({ key }, "dashboard snapshot row failed schema — delete the row to rebuild");

				return null;
			}

			// SAFETY: zod schema mirrors the payload shape built below field-for-field
			return parsed.data as SnapshotPayload<K>;
		} catch (err) {
			logger.warn({ err, key }, "dashboard snapshot read failed");

			return null;
		}
	}

	private scheduleBuild(): void {
		if (this.buildPromise) return;

		this.buildPromise = this.build();
		this.buildPromise
			.catch((err) => logger.error({ err }, "dashboard snapshot build failed"))
			.finally(() => {
				this.buildPromise = null;
			});
	}

	private async ensureTable(): Promise<void> {
		await this.pg`create table if not exists dashboard_snapshot (
			key text primary key,
			payload jsonb not null,
			computed_at timestamptz not null default now()
		)`;
	}

	private group(
		col: SQL | AnyPgColumn,
		outputKey: string,
		where?: SQL,
	): Promise<StatItem[]> {
		// SAFETY: drizzle accepts SQL and PgColumn identically under groupBy/select;
		// the union keeps call sites readable.
		const expr = col as SQL;

		return this.orm
			.select({ value: sql<string>`${expr}`, count: count() })
			.from(pghTickets)
			.where(where)
			.groupBy(expr)
			.orderBy(desc(count()))
			.limit(10)
			.then((rows) => rows.map((r) => ({ [outputKey]: r.value, count: Number(r.count) })));
	}

	private distinctList(col: SQL | AnyPgColumn, limit?: number): Promise<string[]> {
		const q = this.orm
			.selectDistinct({ value: sql<string>`${col}` })
			.from(pghTickets)
			.where(sql`${col} is not null and ${col} != ''`)
			.orderBy(asc(sql<string>`${col}`))
			.limit(limit ?? 10_000);

		return q.then((rows) => rows.map((r) => r.value));
	}

	private async build(): Promise<void> {
		const t0 = Date.now();
		const log = logger.child({ job: "dashboard-snapshot" });
		const orm = this.orm;

		// every query below is independent — one batch over the pool. the
		// pre-orm path ran these seriatim and cost ~30s per rebuild.
		const [
			[ticketCounts],
			[geo],
			[locs],
			byStatus,
			byState,
			topOfficers,
			topPlates,
			topLocations,
			topViolations,
			byMake,
			byYear,
			officers,
			statuses,
			violations,
			locations,
			yearsRows,
		] = await Promise.all([
			orm
				.select({
					total: count(),
					open_tickets: sql<number>`count(*) filter (where ${pghTickets.status} = 'open')`,
					total_amount: sql<number>`coalesce(sum(case when ${pghTickets.amountDue} like '$%' and ${pghTickets.status} = 'open'
						then cast(replace(replace(${pghTickets.amountDue},'$',''),',','') as double precision) end), 0)`,
					min_date: sql<string | null>`min(${pghTickets.issueDate})::text`,
					max_date: sql<string | null>`max(${pghTickets.issueDate})::text`,
				})
				.from(pghTickets),
			orm
				.select({ c: count() })
				.from(pghLocations)
				.where(isNotNull(pghLocations.latitude)),
			orm.select({ c: count() }).from(pghLocations),
			this.group(sql<string>`${pghTickets.status}`, "status", ne(pghTickets.status, "")),
			this.group(sql<string>`state`, "state", sql`state != ''`),
			this.group(sql<string>`officer`, "officer", sql`officer != ''`),
			this.group(sql<string>`license_plate`, "license_plate", sql`license_plate != ''`),
			this.group(sql<string>`location`, "location", sql`location != ''`),
			this.group(sql<string>`violation`, "violation", sql`violation != ''`),
			this.group(sql<string>`coalesce(nullif(vehicle_make,''),'Unknown')`, "make"),
			this.group(
				sql<string>`extract(year from issue_date)::text`,
				"year",
				sql`issue_date is not null`,
			),
			this.distinctList(sql<string>`${pghTickets.officer}`),
			this.distinctList(sql<string>`${pghTickets.status}`),
			this.distinctList(sql<string>`${pghTickets.violation}`),
			this.distinctList(sql<string>`${pghTickets.location}`, 1000),
			orm
				.selectDistinct({ value: sql<string>`extract(year from issue_date)::text` })
				.from(pghTickets)
				.where(isNotNull(pghTickets.issueDate))
				.orderBy(desc(sql<string>`extract(year from issue_date)`)),
		]);

		const countsPayload: DashboardCounts = {
			total: Number(ticketCounts.total),
			openTickets: Number(ticketCounts.open_tickets),
			totalAmount: Number(ticketCounts.total_amount),
			geocodedCount: Number(geo.c),
			totalLocations: Number(locs.c),
			dateRange:
				ticketCounts.min_date || ticketCounts.max_date
					? {
							min_date: ticketCounts.min_date ?? "",
							max_date: ticketCounts.max_date ?? "",
						}
					: null,
		};

		const breakdownsPayload: DashboardBreakdowns = {
			byStatus,
			byState,
			topOfficers,
			topPlates,
			topLocations,
			topViolations,
			byMake,
			byYear,
		};

		const filterOptionsPayload: DashboardFilterOptions = {
			officers,
			years: yearsRows.map((r) => r.value),
			statuses,
			violations,
			locations,
		};

		const entries: [SnapshotKey, unknown][] = [
			["counts", countsPayload],
			["breakdowns", breakdownsPayload],
			["filter_options", filterOptionsPayload],
		];

		await Promise.all(
			entries.map(([key, payload]) =>
				orm
					.insert(dashboardSnapshotTable)
					.values({ key, payload })
					.onConflictDoUpdate({
						target: dashboardSnapshotTable.key,
						set: { payload, computedAt: new Date() },
					}),
			),
		);

		log.info(
			{ elapsedMs: Date.now() - t0, total: countsPayload.total },
			"dashboard snapshot built",
		);
	}
}

export const dashboardSnapshot = DashboardSnapshot.create();
