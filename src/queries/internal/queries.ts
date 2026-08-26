import { createQueryKeys } from "@lukemorales/query-key-factory";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { TicketFilters } from "#/lib/pgh-ticket/types";
import type {
	FilterOptionsResult,
	PointsResult,
	StatsBreakdownsResult,
	StatsCountsResult,
	TicketsResult,
} from "./types";

export const ticketKeys = createQueryKeys("tickets", {
	statsCounts: (filters?: TicketFilters) => [filters],
	statsBreakdowns: (filters?: TicketFilters) => [filters],
	points: (filters?: TicketFilters, limit?: number) => [filters, limit],
	list: (filters?: TicketFilters, page?: number) => [filters, page],
	filters: null,
});

// ky throws HTTPError on non-2xx, so callers don't need res.ok checks
async function fetchJson<T>(base: string, params: URLSearchParams): Promise<T> {
	// retry: 0 — tanstack query already owns retries; don't multiply attempts
	return ky(base, { searchParams: params, retry: 0 }).json<T>();
}

function buildParams(filters: TicketFilters): URLSearchParams {
	const p = new URLSearchParams();
	if (filters.status) p.set("status", filters.status);
	if (filters.year) p.set("year", filters.year);
	if (filters.violation) p.set("violation", filters.violation);
	if (filters.plate) p.set("plate", filters.plate);
	if (filters.location) p.set("location", filters.location);
	if (filters.dateFrom) p.set("dateFrom", filters.dateFrom);
	if (filters.dateTo) p.set("dateTo", filters.dateTo);
	if (filters.officer) p.set("officer", filters.officer);
	return p;
}

// Separate fast counts from slow breakdowns so UI loads progressively
export function useStatsCounts({
	status,
	year,
	violation,
	plate,
	location,
	dateFrom,
	dateTo,
	officer,
}: Partial<TicketFilters> = {}): UseQueryResult<StatsCountsResult> {
	const filters: TicketFilters = {
		status,
		year,
		violation,
		plate,
		location,
		dateFrom,
		dateTo,
		officer,
	};
	return useQuery<StatsCountsResult>({
		queryKey: ticketKeys.statsCounts(filters).queryKey,
		queryFn: () =>
			fetchJson<StatsCountsResult>(
				"/api/lab/stats-counts",
				buildParams(filters),
			),
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		placeholderData: (prev) => prev,
	});
}

export function useStatsBreakdowns({
	status,
	year,
	violation,
	plate,
	location,
	dateFrom,
	dateTo,
	officer,
}: Partial<TicketFilters> = {}): UseQueryResult<StatsBreakdownsResult> {
	const filters: TicketFilters = {
		status,
		year,
		violation,
		plate,
		location,
		dateFrom,
		dateTo,
		officer,
	};
	return useQuery<StatsBreakdownsResult>({
		queryKey: ticketKeys.statsBreakdowns(filters).queryKey,
		queryFn: () =>
			fetchJson<StatsBreakdownsResult>(
				"/api/lab/stats-breakdowns",
				buildParams(filters),
			),
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		placeholderData: (prev) => prev,
	});
}

export function usePoints({
	status,
	year,
	violation,
	plate,
	location,
	dateFrom,
	dateTo,
	officer,
	limit = 20000,
}: Partial<
	TicketFilters & { limit: number }
> = {}): UseQueryResult<PointsResult> {
	const filters: TicketFilters = {
		status,
		year,
		violation,
		plate,
		location,
		dateFrom,
		dateTo,
		officer,
	};
	return useQuery<PointsResult>({
		queryKey: ticketKeys.points(filters, limit).queryKey,
		queryFn: () => {
			const params = buildParams(filters);
			params.set("limit", String(limit));
			return fetchJson<PointsResult>("/api/lab/points", params);
		},
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		placeholderData: (prev) => prev,
	});
}

export function useTickets({
	status,
	year,
	violation,
	plate,
	location,
	dateFrom,
	dateTo,
	officer,
	page = 1,
}: Partial<
	TicketFilters & { page: number }
> = {}): UseQueryResult<TicketsResult> {
	const filters: TicketFilters = {
		status,
		year,
		violation,
		plate,
		location,
		dateFrom,
		dateTo,
		officer,
	};
	return useQuery<TicketsResult>({
		queryKey: ticketKeys.list(filters, page).queryKey,
		queryFn: () => {
			const params = buildParams(filters);
			params.set("page", String(page));
			return fetchJson<TicketsResult>("/api/lab/tickets", params);
		},
		staleTime: 0,
		gcTime: 0,
		refetchOnMount: true,
		placeholderData: (prev) => prev,
	});
}

export function useFilterOptions(): UseQueryResult<FilterOptionsResult> {
	return useQuery<FilterOptionsResult>({
		queryKey: ticketKeys.filters.queryKey,
		queryFn: () =>
			fetchJson<FilterOptionsResult>("/api/lab/filters", new URLSearchParams()),
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
}
