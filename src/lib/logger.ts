/*
shared pino logger. server-only usage (api middleware, services) - the
module is imported from src/start.ts / handlers, never from client
components. default json to stdout; pino keeps req fields structured so
log ingestion stays cheap later.
*/

import pino from "pino";

export const logger = pino({
	level: process.env.LOG_LEVEL ?? "info",
	base: { service: "damon.systems" },
});
