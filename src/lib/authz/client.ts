/* browser side of better-auth: signIn via the server plugin's oauth2 route. */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

interface Oauth2SignIn {
	oauth2: (opts: { providerId: string; callbackURL: string }) => Promise<void>;
}

interface SignInProxy {
	oauth2: Oauth2SignIn["oauth2"];
}

/**
 * signIn is a runtime proxy whose oauth2 method is registered by the server's
 * genericOAuth plugin; the exported type doesn't reflect it.
 */
function hasOauth2(value: unknown): value is SignInProxy {
	// SAFETY: proven by the property check before any caller touches oauth2.
	const v = value as SignInProxy;

	return typeof v.oauth2 === "function";
}

export function startAuthentikLogin(callbackURL = "/admin"): Promise<void> {
	const signIn: unknown = authClient.signIn;

	if (!hasOauth2(signIn)) {
		return Promise.reject(new Error("oauth2 sign-in unavailable"));
	}

	return signIn.oauth2({ providerId: "authentik", callbackURL });
}
