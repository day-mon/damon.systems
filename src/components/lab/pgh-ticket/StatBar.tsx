import type { StatsCountsResult } from "#/queries/internal/types";

function fmt(n: number): string {
	if (n >= 1_000_000)
		return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;

	if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;

	return n.toLocaleString();
}

export function StatBar({ stats }: { stats: StatsCountsResult }) {
	const cards = [
		{
			label: "tickets",
			value: fmt(stats.total),
			full: stats.total.toLocaleString(),
		},
		{
			label: "open",
			value: fmt(stats.openTickets),
			full: stats.openTickets.toLocaleString(),
		},
		{
			label: "unpaid fines",
			value: `$${fmt(stats.totalAmount)}`,
			full: `$${stats.totalAmount.toLocaleString()}`,
		},
		{
			label: "locations",
			value: fmt(stats.totalLocations),
			full: stats.totalLocations.toLocaleString(),
		},
	];

	if (stats.dateRange) {
		const range = `${stats.dateRange.min_date} - ${stats.dateRange.max_date}`;
		cards.push({ label: "range", value: range, full: range });
	}

	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
			{cards.map((c) => (
				<div key={c.label} title={c.full} className="border border-border p-3">
					<div className="text-2xl font-light tracking-tight">{c.value}</div>
					<div className="mt-1 text-xs text-muted-foreground">{c.label}</div>
				</div>
			))}
		</div>
	);
}
