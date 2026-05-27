import type { TicketPoint, TicketRow } from '~/lib/pgh-ticket/types';

export interface StatsResult {
  total: number;
  openTickets: number;
  totalAmount: number;
  geocodedCount: number;
  totalLocations: number;
  dateRange: { min_date: string; max_date: string } | null;
  byStatus: { status: string; count: number }[];
  byState: { state: string; count: number }[];
  topOfficers: { officer: string; count: number }[];
  topPlates: { license_plate: string; count: number }[];
  topLocations: { location: string; count: number }[];
  topViolations: { violation: string; count: number }[];
  byMake: { make: string; count: number }[];
  byYear: { year: string; count: number }[];
}

export interface TicketsResult {
  tickets: TicketRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PointsResult = TicketPoint[];

export interface FilterOptionsResult {
  officers: string[];
  years: string[];
  statuses: string[];
  violations: string[];
  locations: string[];
}
