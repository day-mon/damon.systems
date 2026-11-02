/*
shared pino logger. server-only usage (api middleware, services) - the
module is imported from src/start.ts / handlers, never from client
components. default json to stdout; pino keeps req fields structured so
log ingestion stays cheap later.
*/

import pino from "pino";

import { env } from "#/lib/env";

export const logger = pino({
	level: env.LOG_LEVEL,
	base: { service: "damon.systems" },
});
