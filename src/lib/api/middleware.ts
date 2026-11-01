/*
global request middleware (registered on the start instance): log the
error with route identity, then rethrow so start's entry error conversion
produces the generic 500 json response (see @tanstack/start
server-entry-point docs). scoped to /api; ssr and server fns pass through.
replaces per-route try/catch + handwritten Response.json 500s.
*/

import { createMiddleware } from "@tanstack/react-start";

export const logApiError = createMiddleware().server(
	async ({ next, request }) => {
		const { pathname } = new URL(request.url);

		if (!pathname.startsWith("/api")) {
			return await next();
		}

		try {
			return await next();
		} catch (error) {
			console.error(`${pathname} error:`, error);
			throw error;
		}
	},
);
