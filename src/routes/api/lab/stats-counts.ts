import { createFileRoute } from "@tanstack/react-router";

import { json } from "#/lib/json";
import { pghTicketService } from "#/lib/pgh-ticket/pgh.service";
import type { TicketFilters } from "#/lib/pgh-ticket/types";

export const Route = createFileRoute("/api/lab/stats-counts")({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => {
				try {
					const url = new URL(request.url);
					const filters: TicketFilters | undefined =
						url.searchParams.get("status") || url.searchParams.get("year")
							? {
									status: url.searchParams.get("status") ?? undefined,
									year: url.searchParams.get("year") ?? undefined,
								}
							: undefined;
					const data = await pghTicketService.getStatsCounts(filters);
					return json(data, {
						headers: {
							"Cache-Control":
								"public, max-age=300, stale-while-revalidate=3600",
						},
					});
				} catch (error) {
					console.error("/api/lab/stats-counts error:", error);
					return Response.json({ error: "internal error" }, { status: 500 });
				}
			},
		},
	},
});
