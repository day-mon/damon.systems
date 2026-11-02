/*
server-side session read for route guards. calls better-auth's session
endpoint in-process (same headers/cookies as the incoming request).
*/

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { getAuth, isAdminEmail } from "#/lib/authz/better";

export interface SessionUser {
	name: string;
	email: string;
	isAdmin: boolean;
}

export const mySession = createServerFn({ method: "GET" }).handler(() =>
	getAuth()
		.api.getSession({ headers: getRequestHeaders() })
		.then((s): SessionUser | null =>
			s
				? {
						name: s.user.name || "admin",
						email: s.user.email,
						isAdmin: isAdminEmail(s.user.email),
					}
				: null,
		)
		.catch(() => null),
);
