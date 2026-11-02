/*
admin trip editor (existing trip) — suspense pattern, same as public pages.
*/

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { TripForm } from "#/components/trip-form";
import { tripQuery } from "#/queries/trips/queries";

export const Route = createFileRoute("/admin/trips/$slug")({
	component: TripEditPage,
});

function TripEditPage() {
	const { slug } = Route.useParams();
	const { data: trip } = useSuspenseQuery(tripQuery(slug));

	if (!trip) throw notFound();

	return (
		<div className="mt-10">
			<TripForm trip={trip} routeSlug={slug} />
		</div>
	);
}
