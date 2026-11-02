/*
admin home — trip list + site notes. layout guard (src/routes/admin.tsx) has
already established the session by the time this renders.
*/

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { tripsQuery } from "#/queries/trips/queries";

export const Route = createFileRoute("/admin/")({
	component: AdminHome,
});

function AdminHome() {
	const { data: trips } = useSuspenseQuery(tripsQuery());

	return (
		<>
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
		</>
	);
}
