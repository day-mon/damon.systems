/*
AuthzClient — browser side of the auth surface. better-auth's client wraps
the api routes; the genericOAuth plugin registers "authentik" into the
standard social sign-in surface.
*/

import { createAuthClient } from "better-auth/react";

type BetterAuthClient = ReturnType<typeof createAuthClient>;

export class AuthzClient {
	private static _instance: AuthzClient | null = null;

	static create(): AuthzClient {
		return new AuthzClient();
	}

	private constructor(
		private readonly auth: BetterAuthClient = createAuthClient(),
	) {}

	signInWithAuthentik(callbackURL = "/admin"): Promise<void> {
		return this.auth.signIn
			.social({ provider: "authentik", callbackURL })
			.then(() => undefined);
	}

	signOut(): Promise<void> {
		return this.auth.signOut().then(() => undefined);
	}
}

export const authzClient = AuthzClient.create();
