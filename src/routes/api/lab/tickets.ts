import { createFileRoute } from "@tanstack/react-router";

import { json } from "#/lib/json";
import { pghTicketService } from "#/lib/pgh-ticket/pgh.service";
import type { TicketFilters } from "#/lib/pgh-ticket/types";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/api/lab/tickets")({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => {
				try {
					const url = new URL(request.url);
					const page = Math.max(
						1,
						Number.parseInt(url.searchParams.get("page") || "1", 10),
					);
					const filters: TicketFilters = {
						plate: url.searchParams.get("plate") ?? undefined,
						officer: url.searchParams.get("officer") ?? undefined,
						violation: url.searchParams.get("violation") ?? undefined,
						location: url.searchParams.get("location") ?? undefined,
						status: url.searchParams.get("status") ?? undefined,
						year: url.searchParams.get("year") ?? undefined,
						dateFrom: url.searchParams.get("dateFrom") ?? undefined,
						dateTo: url.searchParams.get("dateTo") ?? undefined,
					};
					const data = await pghTicketService.getTickets(
						page,
						PAGE_SIZE,
						filters,
					);
					return json(data, {
						headers: {
							"Cache-Control": filters?.plate
								? "no-cache"
								: "public, max-age=300, stale-while-revalidate=3600",
						},
					});
				} catch (error) {
					console.error("/api/lab/tickets error:", error);
					return Response.json({ error: "internal error" }, { status: 500 });
				}
			},
		},
	},
});
