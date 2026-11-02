/*
server-side session read for route guards. calls better-auth's session
endpoint in-process (same headers/cookies as the incoming request).
*/

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { getAuth } from "#/lib/authz/better";

export interface SessionUser {
	name: string;
	email: string;
}

export const mySession = createServerFn({ method: "GET" }).handler(() =>
	getAuth()
		.api.getSession({ headers: getRequestHeaders() })
		// authentik only lets group members complete the flow for this app,
		// so a valid session is definitionally admin.
		.then((s): SessionUser | null =>
			s ? { name: s.user.name || "admin", email: s.user.email } : null,
		)
		.catch(() => null),
);
