import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		B2_KEY_ID: z.string().min(1),
		B2_APPLICATION_KEY: z.string().min(1),
		B2_BUCKET_NAME: z.string().min(1).default("damon-travel"),
		B2_REGION: z.string().min(1).default("us-east-005"),
		PGH_DATABASE_URL: z
			.string()
			.default("postgresql://pgh_ticket:pgh_ticket@localhost:5432/pgh_ticket"),
		AUTHENTIK_ISSUER: z.string().default("https://auth.montague.im/application/o/damon-systems/"),
		OIDC_CLIENT_ID: z.string().optional(),
		OIDC_CLIENT_SECRET: z.string().optional(),
		SESSION_SECRET: z.string().optional(),
		LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
