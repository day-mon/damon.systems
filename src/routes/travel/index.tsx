import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { TravelAtlas } from "#/components/travel/atlas";
import { tripsQuery } from "#/queries/trips/queries";

export const Route = createFileRoute("/travel/")({
	component: TravelIndexPage,
});

function TravelIndexPage() {
	// suspense render happens inside TravelAtlas; prefetch => instant paint
	useSuspenseQuery(tripsQuery());

	return <TravelAtlas />;
}
