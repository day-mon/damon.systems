/*
travel landing: globe is the page. hovering a row steers the globe to that
marker; clicking opens the trip. trips come from b2 (travel/<slug>/*).
*/

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { TravelGlobe } from "#/components/travel/globe";
import { formatTripDates, type Trip } from "#/lib/trips/types";
import { tripsQuery } from "#/queries/trips/queries";

export const Route = createFileRoute("/travel/")({
	component: TravelIndexPage,
});

function Stars({ rating }: { rating: number }) {
	return (
		<span
			aria-label={`${rating} out of 5`}
			className="tabular-nums whitespace-nowrap tracking-tight"
		>
			{Array.from({ length: 5 }, (_, i) => (
				<span key={i} className={i < Math.floor(rating) ? "" : "opacity-25"}>
					{rating - Math.floor(rating) === 0.5 && i === Math.floor(rating)
						? "⯨"
						: "★"}
				</span>
			))}
		</span>
	);
}

function TravelIndexPage() {
	const { data: trips } = useSuspenseQuery(tripsQuery());
	const [hovered, setHovered] = useState<Trip | null>(null);

	if (trips.length === 0) {
		return (
			<div className="mx-auto max-w-lg px-8 py-24 text-center text-muted-foreground text-sm">
				no trips yet — coming eventually
			</div>
		);
	}

	const markers = trips.map((t) => ({
		// SAFETY: Trip lat/lng is a tuple by contract.
		location: [t.lat, t.lng] as [number, number],
	}));

	return (
		<div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-8 px-8 py-12 md:grid-cols-[minmax(0,380px)_1fr]">
			<div>
				<header className="mb-8">
					<h1 className="m-0 font-light text-2xl lowercase tracking-tight">
						travel
					</h1>
					<p className="m-0 mt-1 text-muted-foreground text-sm">
						{hovered ? hovered.place : "pick a row, watch the dot"}
					</p>
				</header>

				<ul className="m-0 list-none p-0">
					{trips.map((trip, i) => (
						<li
							key={trip.slug}
							className="animate-in fade-in duration-300 slide-in-from-bottom-1"
							style={{
								animationDelay: `${i * 40}ms`,
								animationFillMode: "backwards",
							}}
						>
							<Link
								to="/travel/$slug"
								params={{ slug: trip.slug }}
								onMouseEnter={() => setHovered(trip)}
								onMouseLeave={() => setHovered(null)}
								onFocus={() => setHovered(trip)}
								onBlur={() => setHovered(null)}
								className={`group flex w-full items-baseline justify-between gap-6 border-transparent border-b border-l-2 py-3 pl-3 text-left transition-colors duration-150 hover:border-border hover:border-l-foreground ${
									hovered?.slug === trip.slug
										? "border-l-foreground bg-accent/40"
										: ""
								}`}
							>
								<span className="text-sm">
									<span className="font-medium lowercase">{trip.name}</span>
									<span className="ml-3 text-muted-foreground text-xs">
										{formatTripDates(trip.dates)}
									</span>
								</span>
								<span className="text-muted-foreground text-xs opacity-60 transition-opacity group-hover:opacity-100">
									<Stars rating={trip.rating} />
								</span>
							</Link>
						</li>
					))}
				</ul>
			</div>

			<div className="relative hidden justify-end md:flex">
				<TravelGlobe
					markers={markers}
					size={520}
					opacity={hovered ? 1 : 0.72}
					focus={hovered ? [hovered.lat, hovered.lng] : undefined}
				/>
			</div>
		</div>
	);
}
