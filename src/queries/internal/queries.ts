import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { TicketFilters } from '~/lib/pgh-ticket/types';
import type { StatsResult, TicketsResult, PointsResult, FilterOptionsResult } from './types';

export const ticketKeys = createQueryKeys('tickets', {
  stats: (filters?: TicketFilters) => [filters],
  points: (filters?: TicketFilters, limit?: number) => [filters, limit],
  list: (filters?: TicketFilters, page?: number) => [filters, page],
  filters: null,
});

function buildParams(filters: TicketFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.status) p.set('status', filters.status);
  if (filters.year) p.set('year', filters.year);
  if (filters.violation) p.set('violation', filters.violation);
  if (filters.plate) p.set('plate', filters.plate);
  if (filters.location) p.set('location', filters.location);
  if (filters.dateFrom) p.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) p.set('dateTo', filters.dateTo);
  if (filters.officer) p.set('officer', filters.officer);
  return p;
}

export function useStats({
  status, year, violation, plate, location, dateFrom, dateTo, officer,
}: Partial<TicketFilters> = {}): UseQueryResult<StatsResult> {
  const filters: TicketFilters = { status, year, violation, plate, location, dateFrom, dateTo, officer };
  return useQuery<StatsResult>({
    queryKey: ticketKeys.stats(filters).queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/lab/stats?${buildParams(filters)}`);
      return res.json();
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function usePoints({
  status, year, violation, plate, location, dateFrom, dateTo, officer,
  limit = 20000,
}: Partial<TicketFilters & { limit: number }> = {}): UseQueryResult<PointsResult> {
  const filters: TicketFilters = { status, year, violation, plate, location, dateFrom, dateTo, officer };
  return useQuery<PointsResult>({
    queryKey: ticketKeys.points(filters, limit).queryKey,
    queryFn: async () => {
      const params = buildParams(filters);
      params.set('limit', String(limit));
      const res = await fetch(`/api/lab/points?${params}`);
      return res.json();
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useTickets({
  status, year, violation, plate, location, dateFrom, dateTo, officer,
  page = 1,
}: Partial<TicketFilters & { page: number }> = {}): UseQueryResult<TicketsResult> {
  const filters: TicketFilters = { status, year, violation, plate, location, dateFrom, dateTo, officer };
  return useQuery<TicketsResult>({
    queryKey: ticketKeys.list(filters, page).queryKey,
    queryFn: async () => {
      const p = new URLSearchParams();
      p.set('page', String(page));
      if (status) p.set('status', status);
      if (year) p.set('year', year);
      if (violation) p.set('violation', violation);
      if (plate) p.set('plate', plate);
      if (location) p.set('location', location);
      if (dateFrom) p.set('dateFrom', dateFrom);
      if (dateTo) p.set('dateTo', dateTo);
      if (officer) p.set('officer', officer);
      const res = await fetch(`/api/lab/tickets?${p.toString()}`);
      return res.json();
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
    queryFn: async () => {
      const res = await fetch('/api/lab/filters');
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
