import { createFileRoute } from "@tanstack/react-router";

import { authz } from "#/lib/authz/service";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }: { request: Request }) =>
				authz.handler(request),
			POST: ({ request }: { request: Request }) =>
				authz.handler(request),
		},
	},
});
