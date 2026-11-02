/*
admin trip creator — no data to load, straight into the shared form.
*/

import { createFileRoute } from "@tanstack/react-router";

import { TripForm } from "#/components/trip-form";

export const Route = createFileRoute("/admin/trips/new")({
	component: TripNewPage,
});

function TripNewPage() {
	return (
		<div className="mt-10">
			<TripForm trip={null} routeSlug="new" />
		</div>
	);
}
