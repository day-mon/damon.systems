import { createFileRoute } from "@tanstack/react-router";

import { pghTicketService } from "#/lib/pgh-ticket/pgh.service";

export const Route = createFileRoute("/api/lab/filters")({
	server: {
		handlers: {
			GET: async () => {
				const data = await pghTicketService.getFilterOptions();

				return Response.json(data, {
					headers: {
						"Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
					},
				});
			},
		},
	},
});
