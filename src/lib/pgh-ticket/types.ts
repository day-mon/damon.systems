export interface TicketFilters {
  officer?: string | null;
  year?: string | null;
  status?: string | null;
  violation?: string | null;
  location?: string | null;
  plate?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface StatItem {
  status?: string;
  state?: string;
  officer?: string;
  license_plate?: string;
  location?: string;
  violation?: string;
  make?: string;
  year?: string;
  count: number;
}

export interface Stats {
  total: number;
  openTickets: number;
  totalAmount: number;
  geocodedCount: number;
  totalLocations: number;
  dateRange: { min_date: string; max_date: string } | null;
  byStatus: StatItem[];
  byState: StatItem[];
  topOfficers: StatItem[];
  topPlates: StatItem[];
  topLocations: StatItem[];
  topViolations: StatItem[];
  byMake: StatItem[];
  byYear: StatItem[];
}

export interface TicketPoint {
  ticket_number: string;
  location: string;
  issue_date: string;
  status: string;
  violation: string;
  amount_due: string;
  latitude: number;
  longitude: number;
}

export interface TicketRow {
  ticket_number: string;
  license_plate: string;
  state: string;
  location: string;
  issue_date: string;
  status: string;
  violation: string;
  amount_due: string;
}
