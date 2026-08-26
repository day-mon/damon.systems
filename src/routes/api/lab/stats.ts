import { createFileRoute } from "@tanstack/react-router";

import { json } from "#/lib/json";
import { getStats } from "#/lib/pgh-ticket/db";
import type { TicketFilters } from "#/lib/pgh-ticket/types";

export const Route = createFileRoute("/api/lab/stats")({
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
					const data = await getStats(filters);
					return json(data, {
						headers: {
							"Cache-Control":
								"public, max-age=300, stale-while-revalidate=3600",
						},
					});
				} catch (error) {
					console.error("/api/lab/stats error:", error);
					return Response.json({ error: "internal error" }, { status: 500 });
				}
			},
		},
	},
});
