import postgres from "postgres";
import type {
	StatItem,
	Stats,
	TicketFilters,
	TicketPoint,
	TicketRow,
} from "./types";

const PG_URL =
	(typeof process !== "undefined" && process.env.PGH_DATABASE_URL) ||
	"postgresql://pgh_ticket:pgh_ticket@localhost:5432/pgh_ticket";

const sql = postgres(PG_URL, { max: 5 });

type SqlFragment = ReturnType<typeof sql>;

/** strip wildcard chars — all filters use exact = matching so * is meaningless */
function clean(v: string): string {
	return v.replace(/\*/g, '');
}

function buildWhere(f: TicketFilters): SqlFragment {
	const parts: SqlFragment[] = [
		sql`t.location IS NOT NULL AND t.location != ''`,
	];

	if (f.officer) parts.push(sql`t.officer = ${clean(f.officer)}`);
	if (f.year) {
		const y = parseInt(f.year, 10);
		if (!isNaN(y)) {
			parts.push(sql`t.issue_date >= ${`${y}-01-01`}::date`);
			parts.push(sql`t.issue_date < ${`${y + 1}-01-01`}::date`);
		}
	}
	if (f.status) parts.push(sql`t.status = ${clean(f.status)}`);
	if (f.violation) parts.push(sql`t.violation = ${clean(f.violation)}`);
	if (f.location) parts.push(sql`t.location = ${clean(f.location)}`);
	if (f.plate) parts.push(sql`t.license_plate ILIKE ${"%" + clean(f.plate) + "%"}`);
	if (f.dateFrom) parts.push(sql`t.issue_date >= ${clean(f.dateFrom)}::date`);
	if (f.dateTo) parts.push(sql`t.issue_date <= ${clean(f.dateTo)}::date`);

	let result = parts[0];
	for (let i = 1; i < parts.length; i++) {
		result = sql`${result} AND ${parts[i]}`;
	}
	return result;
}

function buildPointWhere(f: TicketFilters): SqlFragment {
	const base = buildWhere(f);
	return sql`${base} AND l.latitude IS NOT NULL AND t.location = l.raw_location`;
}

export async function getStatsCounts(filters: TicketFilters = {}) {
	const where = buildWhere(filters);
	const [row] = await sql`
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
	const r = row as Record<string, unknown>;
	return {
		total: Number(r.total ?? 0),
		openTickets: Number(r.open_tickets ?? 0),
		totalAmount: Number(r.total_amount ?? 0),
		geocodedCount: Number(r.geocoded_count ?? 0),
		totalLocations: Number(r.total_locations ?? 0),
		dateRange: (r.min_date || r.max_date)
			? { min_date: (r.min_date as string) ?? "", max_date: (r.max_date as string) ?? "" }
			: null,
	};
}

export async function getStatsBreakdowns(filters: TicketFilters = {}) {
	const where = buildWhere(filters);
	const [
		byStatus, byState, topOfficers, topPlates,
		topLocations, topViolations, byMake, byYear,
	] = await Promise.all([
		sql`SELECT t.status, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.status != '' GROUP BY t.status ORDER BY count DESC LIMIT 10`,
		sql`SELECT t.state, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.state != '' GROUP BY t.state ORDER BY count DESC LIMIT 10`,
		sql`SELECT t.officer, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.officer != '' GROUP BY t.officer ORDER BY count DESC LIMIT 10`,
		sql`SELECT t.license_plate, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.license_plate != '' GROUP BY t.license_plate ORDER BY count DESC LIMIT 10`,
		sql`SELECT t.location, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.location != '' GROUP BY t.location ORDER BY count DESC LIMIT 10`,
		sql`SELECT t.violation, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.violation != '' GROUP BY t.violation ORDER BY count DESC LIMIT 10`,
		sql`SELECT COALESCE(NULLIF(t.vehicle_make, ''), 'Unknown') AS make, COUNT(*) AS count FROM tickets t WHERE ${where} GROUP BY COALESCE(NULLIF(t.vehicle_make, ''), 'Unknown') ORDER BY count DESC LIMIT 10`,
		sql`SELECT EXTRACT(YEAR FROM t.issue_date)::text AS year, COUNT(*) AS count FROM tickets t WHERE ${where} AND t.issue_date IS NOT NULL GROUP BY EXTRACT(YEAR FROM t.issue_date) ORDER BY EXTRACT(YEAR FROM t.issue_date) DESC`,
	]);
	return {
		byStatus: byStatus as unknown as StatItem[],
		byState: byState as unknown as StatItem[],
		topOfficers: topOfficers as unknown as StatItem[],
		topPlates: topPlates as unknown as StatItem[],
		topLocations: topLocations as unknown as StatItem[],
		topViolations: topViolations as unknown as StatItem[],
		byMake: byMake as unknown as StatItem[],
		byYear: byYear as unknown as StatItem[],
	};
}

// Legacy — kept for existing code using Stats type
export async function getStats(filters: TicketFilters = {}): Promise<Stats> {
	const [counts, breakdowns] = await Promise.all([
		getStatsCounts(filters),
		getStatsBreakdowns(filters),
	]);
	return { ...counts, ...breakdowns };
}

export async function getTickets(
	page = 1,
	pageSize = 100,
	filters: TicketFilters = {},
): Promise<{
	tickets: TicketRow[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}> {
	const where = buildWhere(filters);
	const offset = (page - 1) * pageSize;

	const [countResult, rows] = await Promise.all([
		sql`SELECT COUNT(*) AS value FROM tickets t WHERE ${where}`,
		sql`
			SELECT t.ticket_number, t.license_plate, t.state, t.location,
						 TO_CHAR(t.issue_date, 'YYYY-MM-DD') AS issue_date,
						 t.status, t.violation, t.amount_due
			FROM tickets t
			WHERE ${where}
			ORDER BY t.issue_date DESC
			LIMIT ${pageSize} OFFSET ${offset}
		`,
	]);

	const total = Number((countResult as Record<string, unknown>[])[0]?.value ?? 0);

	return {
		tickets: rows as unknown as TicketRow[],
		total,
		page,
		pageSize,
		totalPages: Math.ceil(total / pageSize),
	};
}

export async function getPoints(
	limit = 20000,
	filters: TicketFilters = {},
): Promise<TicketPoint[]> {
	const where = buildPointWhere(filters);
	const capped = Math.min(limit, 1000000);

	const result = await sql`
    SELECT t.ticket_number, t.location, TO_CHAR(t.issue_date, 'YYYY-MM-DD') AS issue_date,
           t.status, t.violation, t.amount_due, l.latitude, l.longitude
    FROM tickets t
    INNER JOIN locations l ON t.location = l.raw_location
    WHERE ${where}
    ORDER BY t.issue_date DESC
    LIMIT ${capped}
  `;

	return result as unknown as TicketPoint[];
}

export async function getFilterOptions(): Promise<{
	officers: string[];
	years: string[];
	statuses: string[];
	violations: string[];
	locations: string[];
}> {
	const [officers, years, statuses, violations, locs] = await Promise.all([
		sql`SELECT DISTINCT t.officer FROM tickets t WHERE t.officer != '' ORDER BY t.officer`,
		sql`SELECT EXTRACT(YEAR FROM t.issue_date)::text AS year FROM tickets t WHERE t.issue_date IS NOT NULL GROUP BY EXTRACT(YEAR FROM t.issue_date) ORDER BY EXTRACT(YEAR FROM t.issue_date) DESC`,
		sql`SELECT DISTINCT t.status FROM tickets t WHERE t.status != '' ORDER BY t.status`,
		sql`SELECT DISTINCT t.violation FROM tickets t WHERE t.violation != '' ORDER BY t.violation`,
		sql`SELECT DISTINCT t.location FROM tickets t WHERE t.location != '' ORDER BY t.location LIMIT 1000`,
	]);

	return {
		officers: (officers as unknown as { officer: string }[]).flatMap((o) =>
			o.officer ? [o.officer] : [],
		),
		years: (years as unknown as { year: string }[]).flatMap((y) =>
			y.year ? [y.year] : [],
		),
		statuses: (statuses as unknown as { status: string }[]).flatMap((s) =>
			s.status ? [s.status] : [],
		),
		violations: (violations as unknown as { violation: string }[]).flatMap(
			(v) => (v.violation ? [v.violation] : []),
		),
		locations: (locs as unknown as { location: string }[]).flatMap((l) =>
			l.location ? [l.location] : [],
		),
	};
}

export async function searchPlates(
	query: string,
	limit = 10,
): Promise<string[]> {
	const result = await sql`
    SELECT DISTINCT t.license_plate
    FROM tickets t
    WHERE t.license_plate ILIKE ${"%" + query + "%"}
    LIMIT ${limit}
  `;
	return (result as unknown as { license_plate: string }[]).flatMap((r) =>
		r.license_plate ? [r.license_plate] : [],
	);
}
