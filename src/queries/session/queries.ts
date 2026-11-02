/*
server-side session read for route guards. calls better-auth's session
endpoint in-process (same headers/cookies as the incoming request).
*/

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { authz } from "#/lib/authz/service";

export interface SessionUser {
	name: string;
	email: string;
}

export const mySession = createServerFn({ method: "GET" }).handler(() =>
	authz
		.getSession(getRequestHeaders())
		.catch(() => null),
);
