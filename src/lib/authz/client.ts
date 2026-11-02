/* browser side of better-auth: the genericOAuth server plugin registers
   "authentik" into the standard social sign-in surface, no tricks needed. */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export function startAuthentikLogin(callbackURL = "/admin"): Promise<unknown> {
	return authClient.signIn.social({
		provider: "authentik",
		callbackURL,
	});
}
