import type { TicketFilters } from "#/lib/pgh-ticket/types";
import type { StatsBreakdownsResult } from "#/queries/internal/types";

interface BreakdownRow {
	label: string;
	count: number;
}

function fmtCount(n: number): string {
	if (n >= 1_000_000)
		return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;

	if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;

	return n.toLocaleString();
}

function TopList({
	title,
	items,
	onSelect,
}: {
	title: string;
	items: BreakdownRow[];
	onSelect: (v: string) => void;
}) {
	const rows = items.filter((r) => r.label);

	if (!rows.length) return null;

	return (
		<div>
			<h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{title}
			</h3>
			<div className="flex flex-col gap-1">
				{rows.map((row) => (
					<button
						key={row.label}
						type="button"
						className="flex w-full cursor-pointer items-center justify-between bg-transparent px-2 py-1 text-left text-xs text-foreground"
						onClick={() => onSelect(row.label)}
					>
						<span className="mr-2 truncate text-foreground">{row.label}</span>
						<span
							className="shrink-0 font-mono text-muted-foreground"
							title={row.count.toLocaleString()}
						>
							{fmtCount(row.count)}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}

export function BreakdownPanel({
	stats,
	onFilter,
}: {
	stats: StatsBreakdownsResult;
	onFilter: (key: keyof TicketFilters, value: string | null) => void;
}) {
	return (
		<div className="flex flex-col gap-6">
			<TopList
				title="top violations"
				items={stats.topViolations.map((r) => ({
					label: r.violation,
					count: r.count,
				}))}
				onSelect={(v) => onFilter("violation", v)}
			/>
			<TopList
				title="top locations"
				items={stats.topLocations.map((r) => ({
					label: r.location,
					count: r.count,
				}))}
				onSelect={(v) => onFilter("location", v)}
			/>
			<TopList
				title="top officers"
				items={stats.topOfficers.map((r) => ({
					label: r.officer,
					count: r.count,
				}))}
				onSelect={(v) => onFilter("officer", v)}
			/>
			<TopList
				title="by status"
				items={stats.byStatus.map((r) => ({ label: r.status, count: r.count }))}
				onSelect={(v) => onFilter("status", v)}
			/>
			<TopList
				title="by year"
				items={stats.byYear.map((r) => ({ label: r.year, count: r.count }))}
				onSelect={(v) => onFilter("year", v)}
			/>
		</div>
	);
}
