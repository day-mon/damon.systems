/*
shared postgres client + drizzle instance. every repo (trips, pgh ticket,
…) hangs off these singletons so the pool is one per process, not one
per module.
*/

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const PG_URL =
	(typeof process !== "undefined" && process.env.PGH_DATABASE_URL) ||
	"postgresql://pgh_ticket:pgh_ticket@localhost:5432/pgh_ticket";

export const postgresClient = postgres(PG_URL, { max: 5 });
export const db = drizzle(postgresClient);

export type DrizzleDb = typeof db;
export type PgClient = typeof postgresClient;
