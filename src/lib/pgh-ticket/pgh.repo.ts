/*
PghTicketRepo - the only module that knows the pgh tickets schema.

raw postgres-js tagged templates stay here on purpose: the dashboard's
filters are genuinely dynamic (9 optional predicates compose into a
shared WHERE fragment, two arities of it), and drizzle's query builder
buys nothing over a couple of composable sql`` fragments for that.
the table shapes still live declared in lib/db/schema.ts.
*/

import { type PgClient, postgresClient } from "#/lib/db/client";
import type {
	StatItem,
	TicketFilters,
	TicketPoint,
	TicketRow,
} from "#/lib/pgh-ticket/types";

type Sql = PgClient;

type SqlFragment = ReturnType<Sql>;

interface CountsRow {
	total: string | number;
	open_tickets: string | number;
	total_amount: string | number;
	geocoded_count: string | number;
	total_locations: string | number;
	min_date: string | null;
	max_date: string | null;
}

interface CountRow {
	value: string | number;
}

export class PghTicketRepo {
	constructor(private sql: Sql = postgresClient) {}

	private buildWhere(f: TicketFilters): SqlFragment {
		const sql = this.sql;

		const parts: SqlFragment[] = [
			sql`t.location IS NOT NULL AND t.location != ''`,
		];

		if (f.officer) parts.push(sql`t.officer = ${f.officer}`);

		if (f.year) {
			const y = Number.parseInt(f.year, 10);

			if (!Number.isNaN(y)) {
				parts.push(sql`t.issue_date >= ${`${y}-01-01`}::date`);
				parts.push(sql`t.issue_date < ${`${y + 1}-01-01`}::date`);
			}
		}

		if (f.status) parts.push(sql`t.status = ${f.status}`);

		if (f.violation) parts.push(sql`t.violation = ${f.violation}`);

		if (f.location) parts.push(sql`t.location = ${f.location}`);

		if (f.plate) parts.push(sql`t.license_plate ILIKE ${`%${f.plate}%`}`);

		if (f.dateFrom) parts.push(sql`t.issue_date >= ${f.dateFrom}::date`);

		if (f.dateTo) parts.push(sql`t.issue_date <= ${f.dateTo}::date`);

		let result = parts[0];

		for (let i = 1; i < parts.length; i++) {
			result = sql`${result} AND ${parts[i]}`;
		}

		return result;
	}

	private buildPointWhere(f: TicketFilters): SqlFragment {
		const base = this.buildWhere(f);

		return this
			.sql`${base} AND l.latitude IS NOT NULL AND t.location = l.raw_location`;
	}

	async fetchCounts(filters: TicketFilters = {}) {
		const sql = this.sql;
		const where = this.buildWhere(filters);

		const [r] = await sql<CountsRow[]>`
			SELECT
				(SELECT COUNT(*) FROM tickets t WHERE ${where}) AS total,
				(SELECT COUNT(*) FROM tickets t WHERE ${where} AND t.status = 'open') AS open_tickets,
				(SELECT COALESCE(SUM(CAST(REPLACE(REPLACE(t.amount_due, '$', ''), ',', '') AS double precision)), 0)
				 FROM tickets t WHERE ${where} AND t.amount_due LIKE '$%' AND t.status = 'open') AS total_amount,
				(SELECT COUNT(*) FROM locations WHERE latitude IS NOT NULL) AS geocoded_count,
				(SELECT COUNT(DISTINCT t.location) FROM tickets t WHERE ${where}) AS total_locations,
				(SELECT MIN(t.issue_date)::text FROM tickets t WHERE ${where}) AS min_date,
				(SELECT MAX(t.issue_date)::text FROM tickets t WHERE ${where}) AS max_date
		`;

		return {
			total: Number(r.total ?? 0),
			openTickets: Number(r.open_tickets ?? 0),
			totalAmount: Number(r.total_amount ?? 0),
			geocodedCount: Number(r.geocoded_count ?? 0),
			totalLocations: Number(r.total_locations ?? 0),
			dateRange:
				r.min_date || r.max_date
					? { min_date: r.min_date ?? "", max_date: r.max_date ?? "" }
					: null,
		};
	}

	async fetchBreakdowns(filters: TicketFilters = {}) {
		const sql = this.sql;
		const where = this.buildWhere(filters);

		const results = await Promise.allSettled([
			sql<
				StatItem[]
			>`SELECT t.status, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.status != '' GROUP BY t.status ORDER BY count DESC LIMIT 10`,
			sql<
				StatItem[]
			>`SELECT t.state, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.state != '' GROUP BY t.state ORDER BY count DESC LIMIT 10`,
			sql<
				StatItem[]
			>`SELECT t.officer, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.officer != '' GROUP BY t.officer ORDER BY count DESC LIMIT 10`,
			sql<
				StatItem[]
			>`SELECT t.license_plate, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.license_plate != '' GROUP BY t.license_plate ORDER BY count DESC LIMIT 10`,
			sql<
				StatItem[]
			>`SELECT t.location, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.location != '' GROUP BY t.location ORDER BY count DESC LIMIT 10`,
			sql<
				StatItem[]
			>`SELECT t.violation, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.violation != '' GROUP BY t.violation ORDER BY count DESC LIMIT 10`,
			sql<
				StatItem[]
			>`SELECT COALESCE(NULLIF(t.vehicle_make, ''), 'Unknown') AS make, COUNT(*) AS count FROM tickets t WHERE ${where} GROUP BY COALESCE(NULLIF(t.vehicle_make, ''), 'Unknown') ORDER BY count DESC LIMIT 10`,
			sql<
				StatItem[]
			>`SELECT EXTRACT(YEAR FROM t.issue_date)::text AS year, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.issue_date IS NOT NULL GROUP BY EXTRACT(YEAR FROM t.issue_date) ORDER BY EXTRACT(YEAR FROM t.issue_date) DESC LIMIT 10`,
		]);

		const empty: StatItem[] = [];

		const get = (i: number) =>
			results[i].status === "fulfilled" && results[i]
				? results[i].value
				: empty;

		return {
			byStatus: get(0),
			byState: get(1),
			topOfficers: get(2),
			topPlates: get(3),
			topLocations: get(4),
			topViolations: get(5),
			byMake: get(6),
			byYear: get(7),
		};
	}

	async fetchPage(page = 1, pageSize = 100, filters: TicketFilters = {}) {
		const sql = this.sql;
		const where = this.buildWhere(filters);
		const offset = (page - 1) * pageSize;

		const [countResult, rows] = await Promise.all([
			sql<CountRow[]>`SELECT COUNT(*) AS value FROM tickets t WHERE ${where}`,
			sql<TicketRow[]>`
				SELECT t.ticket_number, t.license_plate, t.state, t.location,
							 TO_CHAR(t.issue_date, 'YYYY-MM-DD') AS issue_date,
							 t.status, t.violation, t.amount_due
				FROM tickets t
				WHERE ${where}
				ORDER BY t.issue_date DESC
				LIMIT ${pageSize} OFFSET ${offset}
			`,
		]);

		const total = Number(countResult[0]?.value ?? 0);

		return {
			tickets: rows,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	}

	async fetchPoints(limit = 20000, filters: TicketFilters = {}) {
		const where = this.buildPointWhere(filters);
		const capped = Math.min(limit, 1_000_000);

		return this.sql<TicketPoint[]>`
			SELECT t.ticket_number, t.location, TO_CHAR(t.issue_date, 'YYYY-MM-DD') AS issue_date,
						 t.status, t.violation, t.amount_due, l.latitude, l.longitude
			FROM tickets t
			INNER JOIN locations l ON t.location = l.raw_location
			WHERE ${where}
			ORDER BY t.issue_date DESC
			LIMIT ${capped}
		`;
	}

	async fetchFilterOptions() {
		const sql = this.sql;

		const [officers, years, statuses, violations, locs] = await Promise.all([
			sql<
				{ officer: string }[]
			>`SELECT DISTINCT t.officer FROM tickets t WHERE t.officer != '' ORDER BY t.officer`,
			sql<
				{ year: string }[]
			>`SELECT EXTRACT(YEAR FROM t.issue_date)::text AS year FROM tickets t WHERE t.issue_date IS NOT NULL GROUP BY EXTRACT(YEAR FROM t.issue_date) ORDER BY EXTRACT(YEAR FROM t.issue_date) DESC`,
			sql<
				{ status: string }[]
			>`SELECT DISTINCT t.status FROM tickets t WHERE t.status != '' ORDER BY t.status`,
			sql<
				{ violation: string }[]
			>`SELECT DISTINCT t.violation FROM tickets t WHERE t.violation != '' ORDER BY t.violation`,
			sql<
				{ location: string }[]
			>`SELECT DISTINCT t.location FROM tickets t WHERE t.location != '' ORDER BY t.location LIMIT 1000`,
		]);

		return {
			officers: officers.flatMap((o) => (o.officer ? [o.officer] : [])),
			years: years.flatMap((y) => (y.year ? [y.year] : [])),
			statuses: statuses.flatMap((s) => (s.status ? [s.status] : [])),
			violations: violations.flatMap((v) => (v.violation ? [v.violation] : [])),
			locations: locs.flatMap((l) => (l.location ? [l.location] : [])),
		};
	}
}

export const pghTicketRepo = new PghTicketRepo();
