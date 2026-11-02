/*
login handoff page: immediately kicks off the authentik round trip and shows
a minimal "switching tracks" state while cookies + redirects churn.
*/

import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { startAuthentikLogin } from "#/lib/authz/client";

export const Route = createFileRoute("/auth/login")({ component: LoginPage });

function LoginPage() {
	useEffect(() => {
		startAuthentikLogin("/admin").catch(() => {
			// surface it plainly; this almost always means env not set server-side
			document.body.insertAdjacentHTML(
				"beforeend",
				'<p style="position:fixed;bottom:16px;left:16px;color:#ef4444;font-size:12px">login failed — check oidc env</p>',
			);
		});
	}, []);

	return (
		<main className="flex min-h-[60vh] items-center justify-center text-muted-foreground text-sm">
			signing you in via authentik…
		</main>
	);
}
