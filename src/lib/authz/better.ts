/*
auth core: better-auth + genericOAuth against authentik (auth.montague.im),
sessions+users live in the app postgres. replaces the hand-rolled hmac cookie
+ pkce glue with the maintained path.

env contract (names only):
  SESSION_SECRET       reused as the better-auth secret
  PGH_DATABASE_URL     app postgres (auth tables live alongside)
  AUTHENTIK_ISSUER     https://auth.montague.im/application/o/damon-systems/
  OIDC_CLIENT_ID / OIDC_CLIENT_SECRET
  ADMIN_EMAIL          comma-separated admin allowlist
*/

import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { Pool } from "pg";

const ISSUER = () =>
	process.env.AUTHENTIK_ISSUER ??
	"https://auth.montague.im/application/o/damon-systems/";

let auth: ReturnType<typeof createAuth> | null = null;

function createAuth() {
	return betterAuth({
		secret: process.env.SESSION_SECRET,
		database: new Pool({
			connectionString: process.env.PGH_DATABASE_URL,
		}),
		plugins: [
			genericOAuth({
				config: [
					{
						providerId: "authentik",
						clientId: process.env.OIDC_CLIENT_ID ?? "",
						clientSecret: process.env.OIDC_CLIENT_SECRET ?? "",
						discoveryUrl: `${ISSUER()}.well-known/openid-configuration`,
						scopes: ["openid", "email", "profile"],
						pkce: true,
					},
				],
			}),
		],
	});
}

export function getAuth(): ReturnType<typeof createAuth> {
	if (!auth) {
		auth = createAuth();
	}

	return auth;
}

export function isAdminEmail(email: string | undefined): boolean {
	if (!email) return false;

	const allow = (process.env.ADMIN_EMAIL ?? "damon@montague.im")
		.split(",")
		.map((e) => e.trim().toLowerCase());

	return allow.includes(email.toLowerCase());
}
