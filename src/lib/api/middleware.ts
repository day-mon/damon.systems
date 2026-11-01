/*
global api middleware pair (registered on the start instance, see src/start.ts).
scoped to /api requests; everything else passes straight through.

logRequest - one structured line per api call: method, path, status, duration.
logApiError - logs thrown handler errors with route identity, then
rethrows so start's entry error conversion builds the generic 500 json.
together they replace per-route try/catch + handwritten Response.json 500s.
*/

import { createMiddleware } from "@tanstack/react-start";

import { logger } from "#/lib/logger";

/** first in the chain; wraps everything below it, owns the timing line. */
export const logRequest = createMiddleware().server(
	async ({ next, pathname, request }) => {
		if (!pathname.startsWith("/api")) {
			return await next();
		}

		const startedAt = performance.now();

		try {
			const result = await next();
			logger.info(
				{
					method: request.method,
					path: pathname,
					status: result.response.status,
					durationMs: Math.round(performance.now() - startedAt),
				},
				"request completed",
			);

			return result;
		} catch (error) {
			logger.info(
				{
					method: request.method,
					path: pathname,
					durationMs: Math.round(performance.now() - startedAt),
				},
				"request errored",
			);
			throw error;
		}
	},
);

/** innermost: sits right above the handler, owns the error detail line. */
export const logApiError = createMiddleware().server(
	async ({ next, pathname, request }) => {
		if (!pathname.startsWith("/api")) {
			return await next();
		}

		try {
			return await next();
		} catch (error) {
			logger.error(
				{ err: error, method: request.method, path: pathname },
				"handler threw",
			);
			throw error;
		}
	},
);
