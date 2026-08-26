import { createFileRoute } from "@tanstack/react-router";

import { json } from "#/lib/json";
import { pghTicketService } from "#/lib/pgh-ticket/pgh.service";

export const Route = createFileRoute("/api/lab/filters")({
	server: {
		handlers: {
			GET: async () => {
				try {
					const data = await pghTicketService.getFilterOptions();
					return json(data, {
						headers: {
							"Cache-Control":
								"public, max-age=300, stale-while-revalidate=3600",
						},
					});
				} catch (error) {
					console.error("/api/lab/filters error:", error);
					return Response.json({ error: "internal error" }, { status: 500 });
				}
			},
		},
	},
});
