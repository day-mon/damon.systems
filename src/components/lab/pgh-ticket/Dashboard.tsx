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
import { cn } from "~/lib/utils";
import { BreakdownPanel } from "./BreakdownPanel";
import { ClientTicketMap } from "./ClientTicketMap";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { FilterPanel } from "./FilterPanel";
import { StatBar } from "./StatBar";
import { TicketTable } from "./TicketTable";

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
		<div
			className={cn(
				"flex flex-col gap-6 transition-opacity duration-200",
				isRefetching && "opacity-60",
			)}
		>
			{isRefetching && (
				<div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-accent" />
			)}
			{counts.data && <StatBar stats={counts.data} />}
			<FilterPanel
				filters={filterValues}
				onFilter={handleFilter}
				filterOpts={filterOpts.data ?? EMPTY_FILTER_OPTS}
				pointLimit={pointLimit}
				onPointLimit={setPointLimit}
			/>
			<div className="flex gap-2">
				<button
					type="button"
					className={cn(
						"cursor-pointer border px-3 py-1.5 text-xs",
						view === "map"
							? "border-foreground bg-accent text-foreground"
							: "border-border bg-transparent text-muted-foreground",
					)}
					onClick={() => handleView("map")}
				>
					map
				</button>
				<button
					type="button"
					className={cn(
						"cursor-pointer border px-3 py-1.5 text-xs",
						view === "table"
							? "border-foreground bg-accent text-foreground"
							: "border-border bg-transparent text-muted-foreground",
					)}
					onClick={() => handleView("table")}
				>
					table
				</button>
			</div>
			{view === "map" ? (
				<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
					<div>
						<ClientTicketMap points={points.data ?? []} />
					</div>
					<div className="flex flex-col">
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
