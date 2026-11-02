/*
admin portal shell — guard once here, children inherit. renders just the
header chrome + outlet; pages live in admin.index.tsx / admin.trips.$slug.tsx.
*/

import { Outlet, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { authzClient } from "#/lib/authz/client";
import { mySession } from "#/queries/session/queries";

export const Route = createFileRoute("/admin")({
	head: () => ({ meta: [{ title: "damon | admin" }] }),
	beforeLoad: async () => {
		const session = await mySession();

		if (!session) throw redirect({ href: "/auth/login" });

		return { session };
	},
	component: AdminLayout,
});

function AdminLayout() {
	const { session } = Route.useRouteContext();
	const navigate = useNavigate();

	return (
		<main className="mx-auto max-w-3xl px-8 pt-12 pb-20">
			<div className="flex items-center justify-between">
				<h1 className="m-0 font-light text-2xl tracking-tight">admin</h1>
				<div className="flex items-baseline gap-4 text-xs">
					<span className="text-muted-foreground">{session.name}</span>
					<button
						type="button"
						onClick={() => {
							authzClient.signOut().then(() => navigate({ to: "/" }));
						}}
						className="text-muted-foreground transition-colors hover:text-foreground"
					>
						sign out
					</button>
				</div>
			</div>

			<Outlet />
		</main>
	);
}
