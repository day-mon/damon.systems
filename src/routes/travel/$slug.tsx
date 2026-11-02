/*
trip detail: sphere or strip photo wall (visitors toggle via ?view=), essay
underneath. photos+meta come from b2 via the trip server fn.
*/

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { parseAsStringEnum, useQueryState } from "nuqs";

import DomeGallery from "#/components/ui/DomeGallery";
import { formatCoords, formatTripDates, ogImageFor, type Trip } from "#/lib/trips/types";
import { queryClient } from "#/lib/query-client";
import { tripQuery } from "#/queries/trips/queries";

export const Route = createFileRoute("/travel/$slug")({
	// prime the query so SSR head() has real trip data for og tags
	loader: ({ params }) => queryClient.ensureQueryData(tripQuery(params.slug)),
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: "damon | travel" }] };

		const title = `damon | travel | ${loaderData.name}`;
		const image = ogImageFor(loaderData.slug);

		return {
			meta: [
				{ title },
				{ name: "description", content: loaderData.blurb },
				{ property: "og:title", content: title },
				{ property: "og:description", content: loaderData.blurb },
				{ property: "og:image", content: image },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{ property: "og:url", content: `https://damon.systems/travel/${loaderData.slug}` },
				{ name: "twitter:card", content: "summary_large_image" },
			],
		};
	},
	component: TripDetailPage,
});

const VIEW_OPTIONS = ["sphere", "strip"] as const;

type View = (typeof VIEW_OPTIONS)[number];

function Toggle({
	view,
	onChange,
}: {
	view: View;
	onChange: (v: View) => void;
}) {
	return (
		<div
			role="tablist"
			aria-label="photo layout"
			className="inline-flex items-center rounded-full border border-border p-0.5"
		>
			{VIEW_OPTIONS.map((opt) => (
				<button
					key={opt}
					role="tab"
					aria-selected={view === opt}
					type="button"
					onClick={() => onChange(opt)}
					className={`rounded-full px-3 py-1 text-xs capitalize transition-colors duration-150 ${
						view === opt
							? "bg-accent text-foreground"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					{opt}
				</button>
			))}
		</div>
	);
}

export function TripJourney({ trip }: { trip: Trip }) {
	const [viewRaw, setView] = useQueryState(
		"view",
		parseAsStringEnum([...VIEW_OPTIONS]).withDefault("sphere"),
	);

	const view = viewRaw ?? "sphere";

	return (
		<div>
			<div className="mx-auto flex w-full max-w-5xl items-end justify-between px-8 pt-14">
				<div>
					<h1 className="m-0 font-light text-3xl lowercase tracking-tight">
						{trip.name}
					</h1>
					<p className="m-0 mt-2 flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
						<span>{trip.place}</span>
						<span aria-hidden>·</span>
						<span className="tabular-nums">
							{formatCoords(trip.lat, trip.lng)}
						</span>
						<span aria-hidden>·</span>
						<span>{formatTripDates(trip.dates)}</span>
						<span aria-hidden>·</span>
						<span
							aria-label={`${trip.rating} out of 5`}
							className="tabular-nums"
						>
							{trip.rating}★
						</span>
					</p>
				</div>

				<Toggle view={view} onChange={setView} />
			</div>

			{view === "sphere" ? (
				<div className="relative mx-auto h-[60vh] w-full max-w-5xl animate-in fade-in duration-200">
					<DomeGallery
						images={trip.photos.map((p) => p.thumb)}
						grayscale={false}
						segments={18}
						padFactor={0.22}
						maxRadius={420}
						overlayBlurColor="rgba(9,9,11,0.75)"
					/>
				</div>
			) : (
				<div className="mx-auto mt-8 flex w-full max-w-5xl animate-in fade-in flex-col gap-10 px-8 duration-200">
					{trip.photos.slice(0, 8).map((p, i) => (
						<a key={p.full} href={p.full} target="_blank" rel="noreferrer">
							<img
								src={p.large}
								alt={`${trip.name} ${i + 1}`}
								loading="lazy"
								className="w-full object-cover"
								style={{ aspectRatio: i % 3 === 1 ? "16/9" : "21/9" }}
							/>
						</a>
					))}
				</div>
			)}

			<article className="mx-auto w-full max-w-2xl px-8 py-14">
				<p className="text-foreground/90 text-sm leading-relaxed">
					{trip.blurb}
				</p>
				<p className="mt-6 text-muted-foreground text-xs">
					{trip.rating} / 5 — wheels down review ·{" "}
					{formatCoords(trip.lat, trip.lng)}
				</p>
			</article>
		</div>
	);
}

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

	if (!trip) return null;

	return (
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
	);
}
