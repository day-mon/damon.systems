/*
PghTicketService - domain layer over PghTicketRepo. keeps the api route
handlers one line each and gives us one place to shape dashboard
responses (stats merges counts+breakdowns into the legacy Stats shape).
*/

import { type PghTicketRepo, pghTicketRepo } from "#/lib/pgh-ticket/pgh.repo";
import type { Stats, TicketFilters } from "#/lib/pgh-ticket/types";

export class PghTicketService {
	constructor(private repo: PghTicketRepo = pghTicketRepo) {}

	getStatsCounts(filters: TicketFilters = {}) {
		return this.repo.fetchCounts(filters);
	}

	getStatsBreakdowns(filters: TicketFilters = {}) {
		return this.repo.fetchBreakdowns(filters);
	}

	getTickets(page = 1, pageSize = 100, filters: TicketFilters = {}) {
		return this.repo.fetchPage(page, pageSize, filters);
	}

	getPoints(limit = 20000, filters: TicketFilters = {}) {
		return this.repo.fetchPoints(limit, filters);
	}

	getFilterOptions() {
		return this.repo.fetchFilterOptions();
	}

	async getStats(filters: TicketFilters = {}): Promise<Stats> {
		const [counts, breakdowns] = await Promise.all([
			this.repo.fetchCounts(filters),
			this.repo.fetchBreakdowns(filters),
		]);
		return { ...counts, ...breakdowns };
	}
}

export const pghTicketService = new PghTicketService();
