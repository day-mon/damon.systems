/*
shared postgres client + drizzle instance. the pgh-ticket repo hangs
off these singletons so the pool is one per process, not per module.
*/

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

import { env } from "#/lib/env";

export const postgresClient = postgres(env.PGH_DATABASE_URL, { max: 5 });
export const db = drizzle(postgresClient, { schema });

export type DrizzleDb = typeof db;

export type PgClient = typeof postgresClient;
