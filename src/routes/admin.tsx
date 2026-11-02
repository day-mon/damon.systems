/*
admin portal — oidc-gated. not data-bearing yet; exists to prove the circle:
trip uploads, secrets, and other operator actions land here next.
*/

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { authClient } from "#/lib/authz/client";
import { mySession } from "#/queries/session/queries";

export const Route = createFileRoute("/admin")({
	head: () => ({ meta: [{ title: "damon | admin" }] }),
	beforeLoad: async () => {
		const session = await mySession();

		if (!session) throw redirect({ href: "/auth/login" });

		return { session };
	},
	component: AdminPage,
});

function AdminPage() {
	const { session } = Route.useRouteContext();
	const navigate = useNavigate();

	if (!session.isAdmin) {
		return (
			<main className="mx-auto max-w-3xl px-8 pt-12 pb-20 text-muted-foreground text-sm">
				signed in as {session.email}, but you're not on the admin list.
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-3xl px-8 pt-12 pb-20">
			<div className="flex items-center justify-between">
				<h1 className="m-0 font-light text-2xl tracking-tight">admin</h1>
				<button
					type="button"
					onClick={() => {
						authClient.signOut().then(() => navigate({ to: "/" }));
					}}
					className="text-muted-foreground text-xs transition-colors hover:text-foreground"
				>
					sign out
				</button>
			</div>

			<p className="mt-4 text-muted-foreground text-sm">
				signed in as <span className="text-foreground">{session.name}</span>
				{session.email ? (
					<>
						{" "}
						· <span className="text-foreground">{session.email}</span>
					</>
				) : null}
			</p>

			<section className="mt-10 border border-border p-5">
				<h2 className="m-0 font-medium text-base">trips</h2>
				<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
					upload workflow for now is a script: drop a folder with{" "}
					<code className="text-foreground">meta.json</code> + photos, run{" "}
					<code className="text-foreground">
						bun scripts/travel-upload.ts ./your-trip
					</code>
					. a web uploader goes here next.
				</p>
			</section>

			<section className="mt-4 border border-border p-5">
				<h2 className="m-0 font-medium text-base">site</h2>
				<p className="mt-2 text-muted-foreground text-sm">
					deploys are git-driven; argocd promotes on merge to main. nothing to
					press here.
				</p>
			</section>
		</main>
	);
}
