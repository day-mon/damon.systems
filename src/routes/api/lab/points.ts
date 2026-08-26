import { createFileRoute } from "@tanstack/react-router";

import { json } from "#/lib/json";
import { pghTicketService } from "#/lib/pgh-ticket/pgh.service";
import type { TicketFilters } from "#/lib/pgh-ticket/types";

export const Route = createFileRoute("/api/lab/points")({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => {
				try {
					const url = new URL(request.url);
					const limit = Math.min(
						Number.parseInt(url.searchParams.get("limit") || "20000", 10),
						100_000,
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

					const points = await pghTicketService.getPoints(limit, filters);
					return json(points, {
						headers: {
							"Cache-Control":
								"public, max-age=300, stale-while-revalidate=3600",
						},
					});
				} catch (error) {
					console.error("/api/lab/points error:", error);
					return Response.json({ error: "internal error" }, { status: 500 });
				}
			},
		},
	},
});
