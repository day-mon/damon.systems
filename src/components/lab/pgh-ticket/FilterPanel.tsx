import type { TicketFilters } from "#/lib/pgh-ticket/types";
import type { FilterOptionsResult } from "#/queries/internal/types";
import { Button } from "~/components/ui/button";

const POINT_LIMITS = [5000, 10000, 20000, 50000, 100000];

const controlClass =
	"h-8 bg-transparent border border-border px-2 text-xs text-foreground";

interface FilterPanelProps {
	filters: TicketFilters;
	onFilter: (key: keyof TicketFilters, value: string | null) => void;
	filterOpts: FilterOptionsResult;
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
		<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
			<select
				className={controlClass}
				aria-label="status filter"
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
				className={controlClass}
				aria-label="year filter"
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
				className={controlClass}
				aria-label="violation filter"
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
				className={`${controlClass} placeholder:text-muted-foreground`}
				aria-label="license plate"
				placeholder="license plate…"
				value={filters.plate || ""}
				onChange={(e) => onFilter("plate", e.target.value || null)}
			/>

			<select
				className={controlClass}
				aria-label="point limit"
				value={pointLimit}
				onChange={(e) => onPointLimit(Number(e.target.value))}
			>
				{POINT_LIMITS.map((n) => (
					<option key={n} value={n}>
						{(n / 1000).toFixed(0)}k points
					</option>
				))}
			</select>

			<Button
				variant="outline"
				size="sm"
				className="h-8"
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
			</Button>
		</div>
	);
}
