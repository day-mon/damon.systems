import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { TripJourney } from "#/components/travel/journey";
import { tripQuery } from "#/queries/trips/queries";

export const Route = createFileRoute("/travel/$slug")({
	component: TripDetailPage,
});

function TripDetailPage() {
	const { slug } = Route.useParams();
	const { data: trip, isSuccess } = useSuspenseQuery(tripQuery(slug));

	if (isSuccess && !trip) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
				<p className="text-muted-foreground text-sm">
					no trip named “{slug}” (yet?)
				</p>
				<Link
					to="/travel"
					className="text-muted-foreground text-xs underline-offset-4 hover:text-foreground hover:underline"
				>
					← everything else
				</Link>
			</div>
		);
	}

	return trip ? (
		<>
			<div className="fixed top-16 left-4 z-40 hidden md:block">
				<Link
					to="/travel"
					className="text-muted-foreground text-xs transition-colors hover:text-foreground"
				>
					← everything else
				</Link>
			</div>
			<TripJourney trip={trip} />
		</>
	) : null;
}
