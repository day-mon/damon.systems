import * as stylex from "@stylexjs/stylex";

import type { TicketFilters } from "#/lib/pgh-ticket/types";
import type { StatsBreakdownsResult } from "#/queries/internal/types";

const styles = stylex.create({
	list: {
		display: "flex",
		flexDirection: "column",
		gap: 4,
	},
	title: {
		fontSize: "0.75rem",
		fontWeight: 500,
		color: "var(--muted-foreground)",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		marginBottom: 8,
	},
	itemBtn: {
		width: "100%",
		textAlign: "left",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		paddingInline: 8,
		paddingBlock: 4,
		fontSize: "0.75rem",
		backgroundColor: "transparent",
		border: "none",
		color: "var(--foreground)",
		cursor: "pointer",
	},
	label: {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		marginRight: 8,
		color: "var(--foreground)",
	},
	count: {
		color: "var(--muted-foreground)",
		fontFamily: "monospace",
		flexShrink: 0,
	},
	groups: {
		display: "flex",
		flexDirection: "column",
		gap: 24,
	},
});

function fmtCount(n: number): string {
	if (n >= 1_000_000)
		return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;

	if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;

	return n.toLocaleString();
}

interface BreakdownRow {
	label: string;
	count: number;
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
			<h3 {...stylex.props(styles.title)}>{title}</h3>
			<div {...stylex.props(styles.list)}>
				{rows.map((row) => (
					<button
						key={row.label}
						type="button"
						{...stylex.props(styles.itemBtn)}
						onClick={() => onSelect(row.label)}
					>
						<span {...stylex.props(styles.label)}>{row.label}</span>
						<span
							{...stylex.props(styles.count)}
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
		<div {...stylex.props(styles.groups)}>
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
