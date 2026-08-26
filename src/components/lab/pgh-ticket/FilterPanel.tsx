import * as stylex from "@stylexjs/stylex";

import type { TicketFilters } from "#/lib/pgh-ticket/types";

const POINT_LIMITS = [5000, 10000, 20000, 50000, 100000];

const styles = stylex.create({
	grid: {
		display: "grid",
		gridTemplateColumns: {
			default: "repeat(2, 1fr)",
			"@media (min-width: 768px)": "repeat(3, 1fr)",
			"@media (min-width: 1024px)": "repeat(6, 1fr)",
		},
		gap: 12,
	},
	control: {
		height: 32,
		backgroundColor: "transparent",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
		paddingInline: 8,
		fontSize: "0.75rem",
		color: "var(--foreground)",
		width: "100%",
	},
	clearButton: {
		height: 32,
		backgroundColor: "transparent",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
		paddingInline: 8,
		fontSize: "0.75rem",
		color: "var(--foreground)",
		cursor: "pointer",
		width: "100%",
	},
});

interface FilterPanelProps {
	filters: TicketFilters;
	onFilter: (key: keyof TicketFilters, value: string | null) => void;
	filterOpts: Record<string, string[]>;
	pointLimit: number;
	onPointLimit: (v: number) => void;
}

export function FilterPanel({
	filters,
	onFilter,
	filterOpts,
	pointLimit,
	onPointLimit,
}: FilterPanelProps) {
	return (
		<div {...stylex.props(styles.grid)}>
			<select
				{...stylex.props(styles.control)}
				value={filters.status || ""}
				onChange={(e) => onFilter("status", e.target.value || null)}
			>
				<option value="">all statuses</option>
				{filterOpts.statuses?.map((s) => (
					<option key={s} value={s}>
						{s}
					</option>
				))}
			</select>

			<select
				{...stylex.props(styles.control)}
				value={filters.year || ""}
				onChange={(e) => onFilter("year", e.target.value || null)}
			>
				<option value="">all years</option>
				{filterOpts.years?.map((y) => (
					<option key={y} value={y}>
						{y}
					</option>
				))}
			</select>

			<select
				{...stylex.props(styles.control)}
				value={filters.violation || ""}
				onChange={(e) => onFilter("violation", e.target.value || null)}
			>
				<option value="">all violations</option>
				{filterOpts.violations?.map((v) => (
					<option key={v} value={v}>
						{v}
					</option>
				))}
			</select>

			<input
				{...stylex.props(styles.control)}
				placeholder="license plate…"
				value={filters.plate || ""}
				onChange={(e) => onFilter("plate", e.target.value || null)}
			/>

			<select
				{...stylex.props(styles.control)}
				value={pointLimit}
				onChange={(e) => onPointLimit(Number(e.target.value))}
			>
				{POINT_LIMITS.map((n) => (
					<option
						key={n}
						value={n}
					>{`${(n / 1000).toFixed(0)}k points`}</option>
				))}
			</select>

			<button
				type="button"
				{...stylex.props(styles.clearButton)}
				onClick={() => {
					onFilter("status", null);
					onFilter("year", null);
					onFilter("violation", null);
					onFilter("plate", null);
					onFilter("officer", null);
					onFilter("location", null);
					onFilter("dateFrom", null);
					onFilter("dateTo", null);
				}}
			>
				clear
			</button>
		</div>
	);
}
