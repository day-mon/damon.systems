import * as stylex from "@stylexjs/stylex";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
	useQueryStates,
} from "nuqs";

import { useCallback, useState } from "react";

import { TICKET_SORT_KEYS, type TicketFilters } from "#/lib/pgh-ticket/types";
import {
	useFilterOptions,
	usePoints,
	useStatsBreakdowns,
	useStatsCounts,
} from "#/queries/internal/queries";
import type { FilterOptionsResult } from "#/queries/internal/types";
import { BreakdownPanel } from "./BreakdownPanel";
import { ClientTicketMap } from "./ClientTicketMap";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { FilterPanel } from "./FilterPanel";
import { StatBar } from "./StatBar";
import { TicketTable } from "./TicketTable";

const styles = stylex.create({
	wrap: {
		display: "flex",
		flexDirection: "column",
		gap: 24,
		transitionProperty: "opacity",
		transitionDuration: "0.2s",
	},
	dimmed: {
		opacity: 0.6,
	},
	refetchBar: {
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		height: 2,
		backgroundColor: "var(--accent)",
		zIndex: 50,
	},
	tabs: {
		display: "flex",
		gap: 8,
	},
	tab: {
		fontSize: "0.75rem",
		paddingInline: 12,
		paddingBlock: 6,
		borderWidth: 1,
		borderStyle: "solid",
		cursor: "pointer",
	},
	tabActive: {
		borderColor: "var(--foreground)",
		backgroundColor: "var(--accent)",
		color: "var(--foreground)",
	},
	tabInactive: {
		borderColor: "var(--border)",
		color: "var(--muted-foreground)",
		backgroundColor: "transparent",
	},
	mapGrid: {
		display: "grid",
		gridTemplateColumns: {
			default: "1fr",
			"@media (min-width: 1024px)": "2fr 1fr",
		},
		gap: 24,
	},
	sideSlot: {
		display: "flex",
		flexDirection: "column",
	},
	muted: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
	},
});

const EMPTY_FILTER_OPTS: FilterOptionsResult = {
	officers: [],
	years: [],
	statuses: [],
	violations: [],
	locations: [],
};

export function Dashboard() {
	const [state, setState] = useQueryStates({
		view: parseAsStringEnum(["map", "table"]).withDefault("map"),
		page: parseAsInteger.withDefault(1),
		sortKey: parseAsStringEnum([...TICKET_SORT_KEYS]).withDefault("issue_date"),
		sortDir: parseAsStringEnum(["asc", "desc"]).withDefault("desc"),
		officer: parseAsString,
		year: parseAsString,
		status: parseAsString,
		violation: parseAsString,
		plate: parseAsString,
		location: parseAsString,
		dateFrom: parseAsString,
		dateTo: parseAsString,
	});

	const [pointLimit, setPointLimit] = useState(20000);

	const { view, page, sortKey, sortDir, ...filters } = state;
	const filterValues: TicketFilters = filters;

	const counts = useStatsCounts(filterValues);
	const breakdowns = useStatsBreakdowns(filterValues);
	const points = usePoints({ ...filterValues, limit: pointLimit });
	const filterOpts = useFilterOptions();

	const handleFilter = useCallback(
		(key: keyof TicketFilters, value: string | null) => {
			setState({ [key]: value || null, page: 1 });
		},
		[setState],
	);

	const handleView = (v: "map" | "table") => {
		setState({ view: v, page: 1, sortKey: null, sortDir: null });
	};

	if (counts.isPending) {
		return <DashboardSkeleton />;
	}

	const isRefetching = counts.isFetching || points.isFetching;

	return (
		<div {...stylex.props(styles.wrap, isRefetching && styles.dimmed)}>
			{isRefetching && <div {...stylex.props(styles.refetchBar)} />}
			{counts.data && <StatBar stats={counts.data} />}
			<FilterPanel
				filters={filterValues}
				onFilter={handleFilter}
				filterOpts={filterOpts.data ?? EMPTY_FILTER_OPTS}
				pointLimit={pointLimit}
				onPointLimit={setPointLimit}
			/>
			<div {...stylex.props(styles.tabs)}>
				<button
					type="button"
					{...stylex.props(
						styles.tab,
						view === "map" ? styles.tabActive : styles.tabInactive,
					)}
					onClick={() => handleView("map")}
				>
					map
				</button>
				<button
					type="button"
					{...stylex.props(
						styles.tab,
						view === "table" ? styles.tabActive : styles.tabInactive,
					)}
					onClick={() => handleView("table")}
				>
					table
				</button>
			</div>
			{view === "map" ? (
				<div {...stylex.props(styles.mapGrid)}>
					<div>
						<ClientTicketMap points={points.data ?? []} />
					</div>
					<div {...stylex.props(styles.sideSlot)}>
						{breakdowns.data ? (
							<BreakdownPanel stats={breakdowns.data} onFilter={handleFilter} />
						) : (
							<DashboardSkeleton />
						)}
					</div>
				</div>
			) : (
				<TicketTable
					filters={filterValues}
					page={page ?? 1}
					sortKey={sortKey}
					sortDir={sortDir}
					onPageChange={(p) => setState({ page: p })}
					onSortChange={(k, d) => setState({ sortKey: k, sortDir: d })}
				/>
			)}
		</div>
	);
}
