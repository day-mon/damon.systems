/*
admin portal — oidc-gated. not data-bearing yet; exists to prove the circle:
trip uploads, secrets, and other operator actions land here next.
*/

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { authClient } from "#/lib/authz/client";
import { mySession } from "#/queries/session/queries";
import { tripsQuery } from "#/queries/trips/queries";

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
	const { data: trips } = useSuspenseQuery(tripsQuery());
	const navigate = useNavigate();

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
				<div className="flex items-baseline justify-between">
					<h2 className="m-0 font-medium text-base">trips</h2>
					<Link
						to="/admin/trips/$slug"
						params={{ slug: "new" }}
						className="text-muted-foreground text-xs hover:text-foreground"
					>
						+ new trip
					</Link>
				</div>
				<ul className="m-0 mt-3 list-none p-0">
					{trips.map((t) => (
						<li key={t.slug} className="border-border/50 border-b py-2 last:border-b-0">
							<Link
								to="/admin/trips/$slug"
								params={{ slug: t.slug }}
								className="flex items-baseline gap-4 no-underline"
							>
								<span className="w-40 truncate text-sm">{t.name}</span>
								<span className="flex-1 truncate text-muted-foreground text-xs">
									{t.place}
								</span>
								<span className="text-muted-foreground text-xs">
									{t.photos.length} photos
								</span>
							</Link>
						</li>
					))}
					{trips.length === 0 && (
						<li className="py-2 text-muted-foreground text-xs">
							no trips yet — create the first one
						</li>
					)}
				</ul>
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
