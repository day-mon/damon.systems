import type { TicketFilters, TicketRow } from "#/lib/pgh-ticket/types";
import { useTickets } from "#/queries/internal/queries";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { SKEL_ROWS } from "./skel-rows";

const PAGE_SIZE = 20;

const columns: { key: keyof TicketRow; label: string }[] = [
	{ key: "ticket_number", label: "#" },
	{ key: "license_plate", label: "plate" },
	{ key: "location", label: "location" },
	{ key: "issue_date", label: "date" },
	{ key: "violation", label: "violation" },
	{ key: "status", label: "status" },
	{ key: "amount_due", label: "fine" },
];

function StatusBadge({ status }: { status: string }) {
	if (status === "open") return <Badge variant="destructive">{status}</Badge>;

	if (status === "paid" || status === "closed")
		return <Badge variant="secondary">{status}</Badge>;

	return <Badge variant="outline">{status}</Badge>;
}

interface TicketTableProps {
	filters: TicketFilters;
	page: number;
	sortKey: keyof TicketRow;
	sortDir: "asc" | "desc";
	onPageChange: (page: number) => void;
	onSortChange: (key: keyof TicketRow, dir: "asc" | "desc") => void;
}

export function TicketTable({
	filters,
	page,
	sortKey,
	sortDir,
	onPageChange,
	onSortChange,
}: TicketTableProps) {
	const { data, isFetching, isPlaceholderData, isPending, isError } =
		useTickets({
			...filters,
			page,
		});

	const tickets = data?.tickets ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	function handleSort(key: keyof TicketRow) {
		if (sortKey === key) {
			onSortChange(key, sortDir === "asc" ? "desc" : "asc");
		} else {
			onSortChange(key, "asc");
		}
	}

	const sorted = [...tickets].sort((a: TicketRow, b: TicketRow) => {
		const av = a[sortKey] || "";
		const bv = b[sortKey] || "";
		const cmp = String(av).localeCompare(String(bv));

		return sortDir === "asc" ? cmp : -cmp;
	});

	const pageItems: (number | "...")[] = [];

	for (let i = 1; i <= totalPages; i++) {
		if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
			pageItems.push(i);
		} else if (pageItems[pageItems.length - 1] !== "...") {
			pageItems.push("...");
		}
	}

	if (isError) {
		return <p className="text-xs">failed to load tickets</p>;
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="relative border border-border">
				{isFetching && !isPending && (
					<div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-accent" />
				)}
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((col) => (
								<TableHead
									key={col.key}
									className="cursor-pointer select-none text-xs"
									onClick={() => handleSort(col.key)}
								>
									{col.label}
									{sortKey === col.key && (sortDir === "asc" ? " ↑" : " ↓")}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody
						className={cn(
							"transition-opacity duration-150",
							isPlaceholderData && "opacity-50",
						)}
					>
						{isPending
							? SKEL_ROWS.map((rowId) => (
									<TableRow key={rowId}>
										{columns.map((col) => (
											<TableCell key={col.key}>
												<Skeleton className="h-3 w-4/5 rounded-[1px]" />
											</TableCell>
										))}
									</TableRow>
								))
							: sorted.map((t: TicketRow) => (
									<TableRow key={t.ticket_number}>
										<TableCell className="whitespace-nowrap font-mono text-xs">
											{t.ticket_number}
										</TableCell>
										<TableCell className="text-xs">{t.license_plate}</TableCell>
										<TableCell className="max-w-[200px] truncate text-xs">
											{t.location}
										</TableCell>
										<TableCell className="whitespace-nowrap font-mono text-xs">
											{t.issue_date}
										</TableCell>
										<TableCell className="max-w-[200px] truncate text-xs">
											{t.violation}
										</TableCell>
										<TableCell>
											<StatusBadge status={t.status} />
										</TableCell>
										<TableCell className="whitespace-nowrap font-mono text-xs">
											{t.amount_due}
										</TableCell>
									</TableRow>
								))}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between text-xs text-muted-foreground">
				<span>{total.toLocaleString()} tickets</span>
				<div className="flex items-center gap-0.5">
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => onPageChange(Math.max(1, page - 1))}
						className={cn(
							"min-w-8 cursor-pointer bg-transparent px-2 py-1 text-xs",
							page <= 1 && "cursor-default opacity-40",
						)}
					>
						prev
					</button>
					{pageItems.map((item, i) =>
						item === "..." ? (
							<span
								key={`dots-${pageItems[i - 1]}`}
								className="px-1 opacity-50"
							>
								…
							</span>
						) : (
							<button
								key={item}
								type="button"
								onClick={() => onPageChange(item)}
								className={cn(
									"min-w-8 cursor-pointer bg-transparent px-2 py-1 text-xs",
									item === page && "border border-border",
								)}
							>
								{item}
							</button>
						),
					)}
					<button
						type="button"
						disabled={page >= totalPages}
						onClick={() => onPageChange(Math.min(totalPages, page + 1))}
						className={cn(
							"min-w-8 cursor-pointer bg-transparent px-2 py-1 text-xs",
							page >= totalPages && "cursor-default opacity-40",
						)}
					>
						next
					</button>
				</div>
			</div>
		</div>
	);
}
