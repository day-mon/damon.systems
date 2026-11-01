import {
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
} from "@astryxdesign/core/Table";
import * as stylex from "@stylexjs/stylex";

import type { TicketFilters, TicketRow } from "#/lib/pgh-ticket/types";
import { useTickets } from "#/queries/internal/queries";
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

const pulse = stylex.keyframes({
	"0%": { opacity: 1 },
	"50%": { opacity: 0.6 },
	"100%": { opacity: 1 },
});

const styles = stylex.create({
	wrap: {
		display: "flex",
		flexDirection: "column",
		gap: 12,
	},
	relative: {
		position: "relative",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
	},
	progress: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 2,
		backgroundColor: "var(--accent)",
		animationName: pulse,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
		zIndex: 10,
	},
	sortTh: {
		cursor: "pointer",
		userSelect: "none",
		fontSize: "0.75rem",
	},
	mono: {
		fontFamily: "monospace",
		whiteSpace: "nowrap",
		fontSize: "0.75rem",
	},
	truncate: {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		maxWidth: 200,
		fontSize: "0.75rem",
	},
	cellText: {
		fontSize: "0.75rem",
	},
	skelCell: {
		height: 12,
		width: "80%",
		backgroundColor: "var(--accent)",
		opacity: 0.4,
	},
	footer: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
	},
	pageControls: {
		display: "flex",
		alignItems: "center",
		gap: 2,
	},
	pageButton: {
		backgroundColor: "transparent",
		border: "none",
		color: "inherit",
		cursor: "pointer",
		paddingInline: 8,
		paddingBlock: 4,
		fontSize: "0.75rem",
		minWidth: 32,
	},
	pageButtonActive: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
	},
	pageButtonDisabled: {
		opacity: 0.4,
		cursor: "default",
	},
	dots: {
		paddingInline: 4,
		opacity: 0.5,
	},
	badgeBase: {
		fontSize: "0.65rem",
		paddingInline: 6,
		paddingBlock: 1,
	},
	badgeDestructive: {
		backgroundColor: "var(--destructive)",
		color: "var(--background)",
	},
	badgeSecondary: {
		backgroundColor: "var(--accent)",
		color: "var(--accent-foreground)",
	},
	badgeOutline: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
	},
});

function StatusBadge({ status }: { status: string }) {
	const variantStyle =
		status === "open"
			? styles.badgeDestructive
			: status === "paid" || status === "closed"
				? styles.badgeSecondary
				: styles.badgeOutline;

	return (
		<span {...stylex.props(styles.badgeBase, variantStyle)}>{status}</span>
	);
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
		return <p {...stylex.props(styles.cellText)}>failed to load tickets</p>;
	}

	return (
		<div {...stylex.props(styles.wrap)}>
			<div {...stylex.props(styles.relative)}>
				{isFetching && !isPending && <div {...stylex.props(styles.progress)} />}
				<Table density="compact" dividers="rows">
					<TableHeader>
						<TableRow>
							{columns.map((col) => (
								<TableHeaderCell
									key={col.key}
									onClick={() => handleSort(col.key)}
								>
									<span {...stylex.props(styles.sortTh)}>
										{col.label}
										{sortKey === col.key && (
											<span>{sortDir === "asc" ? " ↑" : " ↓"}</span>
										)}
									</span>
								</TableHeaderCell>
							))}
						</TableRow>
					</TableHeader>
					<TableBody
						style={{
							opacity: isPlaceholderData ? 0.5 : 1,
							transition: "opacity 0.15s",
						}}
					>
						{isPending
							? SKEL_ROWS.map((rowId) => (
									<TableRow key={rowId}>
										{columns.map((col) => (
											<TableCell key={col.key}>
												<div {...stylex.props(styles.skelCell)} />
											</TableCell>
										))}
									</TableRow>
								))
							: sorted.map((t: TicketRow) => (
									<TableRow key={t.ticket_number}>
										<TableCell>
											<span {...stylex.props(styles.mono)}>
												{t.ticket_number}
											</span>
										</TableCell>
										<TableCell>
											<span {...stylex.props(styles.cellText)}>
												{t.license_plate}
											</span>
										</TableCell>
										<TableCell>
											<span {...stylex.props(styles.truncate)}>
												{t.location}
											</span>
										</TableCell>
										<TableCell>
											<span {...stylex.props(styles.mono)}>{t.issue_date}</span>
										</TableCell>
										<TableCell>
											<span {...stylex.props(styles.truncate)}>
												{t.violation}
											</span>
										</TableCell>
										<TableCell>
											<StatusBadge status={t.status} />
										</TableCell>
										<TableCell>
											<span {...stylex.props(styles.mono)}>{t.amount_due}</span>
										</TableCell>
									</TableRow>
								))}
					</TableBody>
				</Table>
			</div>

			<div {...stylex.props(styles.footer)}>
				<span>{total.toLocaleString()} tickets</span>
				<div {...stylex.props(styles.pageControls)}>
					<button
						type="button"
						{...stylex.props(
							styles.pageButton,
							page <= 1 && styles.pageButtonDisabled,
						)}
						disabled={page <= 1}
						onClick={() => onPageChange(Math.max(1, page - 1))}
					>
						prev
					</button>
					{pageItems.map((item, i) =>
						item === "..." ? (
							<span
								key={`dots-${pageItems[i - 1]}`}
								{...stylex.props(styles.dots)}
							>
								…
							</span>
						) : (
							<button
								key={item}
								type="button"
								{...stylex.props(
									styles.pageButton,
									item === page && styles.pageButtonActive,
								)}
								onClick={() => onPageChange(item)}
							>
								{item}
							</button>
						),
					)}
					<button
						type="button"
						{...stylex.props(
							styles.pageButton,
							page >= totalPages && styles.pageButtonDisabled,
						)}
						disabled={page >= totalPages}
						onClick={() => onPageChange(Math.min(totalPages, page + 1))}
					>
						next
					</button>
				</div>
			</div>
		</div>
	);
}
