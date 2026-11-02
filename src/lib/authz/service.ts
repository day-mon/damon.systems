/*
Authz — the only auth surface the app uses. wraps better-auth (genericOAuth
against authentik, sessions/users in app postgres). authz is upstream: only
members of the damon-systems-admins group complete login, so a session IS an
admin. constructor validates env up front; construction is lazy so importing
this module into a ssr-rendered page doesn't crash when oidc vars are absent
locally.
*/

import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { Pool } from "pg";

import { env } from "#/lib/env";

export interface SessionIdentity {
	name: string;
	email: string;
}

type BetterAuth = ReturnType<typeof createBetterAuth>;

function createBetterAuth() {
	return betterAuth({
		// never derive baseURL from proxy headers: traefik terminates tls and
		// the in-cluster request is http, which would poison the oidc callback
		baseURL: "https://damon.systems",
		secret: env.SESSION_SECRET,
		database: new Pool({ connectionString: env.PGH_DATABASE_URL }),
		plugins: [
			genericOAuth({
				config: [
					{
						providerId: "authentik",
						clientId: env.OIDC_CLIENT_ID,
						clientSecret: env.OIDC_CLIENT_SECRET,
						discoveryUrl: `${env.AUTHENTIK_ISSUER}.well-known/openid-configuration`,
						scopes: ["openid", "email", "profile"],
						pkce: true,
					},
				],
			}),
		],
	});
}

export class Authz {
	private readonly auth: BetterAuth;

	private constructor() {
		this.auth = createBetterAuth();
	}

	static create(): Authz {
		return new Authz();
	}

	/** api route handler passthrough (/api/auth/$) */
	handler(request: Request): Promise<Response> {
		return this.auth.handler(request);
	}

	/** typed session read; null when signed out. headers = the request's. */
	getSession(headers: Headers): Promise<SessionIdentity | null> {
		return this.auth.api.getSession({ headers }).then((s) =>
			s ? { name: s.user.name || "admin", email: s.user.email } : null,
		);
	}

	/** raw better-auth api for cli/migrations */
	get betterAuth(): BetterAuth {
		return this.auth;
	}
}

export const authz = Authz.create();
