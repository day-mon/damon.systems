import * as stylex from "@stylexjs/stylex";

import type { StatsCountsResult } from "#/queries/internal/types";

function fmt(n: number): string {
	if (n >= 1_000_000)
		return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;

	if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;

	return n.toLocaleString();
}

const styles = stylex.create({
	grid: {
		display: "grid",
		gridTemplateColumns: {
			default: "repeat(2, 1fr)",
			"@media (min-width: 768px)": "repeat(3, 1fr)",
			"@media (min-width: 1024px)": "repeat(5, 1fr)",
		},
		gap: 12,
	},
	card: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
		padding: 12,
	},
	value: {
		fontSize: "1.5rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
	},
	label: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
		marginTop: 4,
	},
});

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
		<div {...stylex.props(styles.grid)}>
			{cards.map((c) => (
				<div key={c.label} title={c.full} {...stylex.props(styles.card)}>
					<div {...stylex.props(styles.value)}>{c.value}</div>
					<div {...stylex.props(styles.label)}>{c.label}</div>
				</div>
			))}
		</div>
	);
}
