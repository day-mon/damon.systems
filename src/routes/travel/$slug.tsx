import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { getTrip, type Trip } from "#/content/trips";
import { getSharedAlbum, type SharedPhoto } from "#/lib/icloud-shared";

interface WallPhoto {
	key: string;
	src: string;
	caption: string;
	takenAt: string;
	dims: { width: number; height: number } | null;
}

function wallPhotos(trip: Trip, live: SharedPhoto[] | null): WallPhoto[] {
	if (live) {
		return live.map((photo) => ({
			key: photo.key,
			src: photo.src,
			caption: photo.caption,
			takenAt: photo.takenAt,
			dims: { width: photo.width, height: photo.height },
		}));
	}
	return trip.photos.map((photo) => ({
		key: photo.file,
		src: `/travel/${trip.slug}/${photo.file}`,
		caption: photo.caption,
		takenAt: photo.takenAt,
		dims: null,
	}));
}

export const Route = createFileRoute("/travel/$slug")({
	// trips may carry a public icloud share url; when present, manifests +
	// signed photo urls resolve live (5-minute server cache) and the
	// committed photos array is ignored
	loader: async ({ params }) => {
		const trip = getTrip(params.slug);
		if (!trip) {
			throw notFound();
		}
		if (trip.sharedAlbumUrl) {
			const album = await getSharedAlbum({ data: trip.sharedAlbumUrl });
			return { trip, liveAlbum: album };
		}
		return { trip, liveAlbum: null };
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData
					? `damon | travel | ${loaderData.trip.title}`
					: "damon | travel",
			},
			{ name: "description", content: loaderData?.trip.blurb ?? "" },
		],
	}),
	component: TripPage,
});

const fadeIn = stylex.keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
});

const styles = stylex.create({
	main: {
		maxWidth: "72rem",
		marginInline: "auto",
		paddingInline: 16,
		paddingBlock: 64,
		animationName: fadeIn,
		animationDuration: "0.4s",
		animationTimingFunction: "ease-out",
	},
	header: {
		maxWidth: "42rem",
		marginBottom: 48,
	},
	back: {
		fontSize: "0.875rem",
		color: "var(--muted-foreground)",
		display: "inline-block",
		marginBottom: 16,
		textDecoration: "none",
	},
	time: {
		display: "block",
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
		fontFamily: "monospace",
		marginBottom: 8,
	},
	title: {
		fontSize: "1.875rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		margin: 0,
		marginBottom: 16,
	},
	blurb: {
		fontSize: "0.9375rem",
		color: "var(--muted-foreground)",
		lineHeight: 1.7,
		whiteSpace: "pre-line",
		margin: 0,
	},
	masonry: {
		// stylex px-suffixes "columns: N" into a column-width; use columnCount
		columnCount: 3,
		columnWidth: "auto",
		columnGap: 16,
		"@media (max-width: 768px)": {
			columnCount: 2,
		},
		"@media (max-width: 480px)": {
			columnCount: 1,
		},
	},
	tile: {
		display: "block",
		width: "100%",
		marginBottom: 16,
		breakInside: "avoid",
		borderRadius: 2,
		backgroundColor: "var(--muted)",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
	},
	photo: {
		display: "block",
		width: "100%",
		height: "auto",
	},
	caption: {
		display: "block",
		paddingInline: 12,
		paddingBlock: 8,
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
	},
	empty: {
		color: "var(--muted-foreground)",
		fontSize: "0.875rem",
	},
});

const LONG_DATE: Intl.DateTimeFormatOptions = {
	year: "numeric",
	month: "long",
	day: "numeric",
};

function dateRangeLabel(start: string, end: string): string {
	const [s, e] = [start, end].map((d) =>
		new Date(`${d}T00:00:00`).toLocaleDateString("en-US", LONG_DATE),
	);
	return s === e ? s : `${s} – ${e}`;
}

function TripPage() {
	const { trip, liveAlbum } = Route.useLoaderData();
	const photos = wallPhotos(
		trip,
		liveAlbum && liveAlbum.ok ? liveAlbum.photos : null,
	);

	return (
		<main {...stylex.props(styles.main)}>
			<header {...stylex.props(styles.header)}>
				<Link to="/travel" {...stylex.props(styles.back)}>
					&larr; all trips
				</Link>
				<time {...stylex.props(styles.time)}>
					{trip.location} ·{" "}
					{dateRangeLabel(trip.dateRange.start, trip.dateRange.end)}
				</time>
				<h1 {...stylex.props(styles.title)}>{trip.title}</h1>
				<p {...stylex.props(styles.blurb)}>{trip.blurb}</p>
			</header>

			{liveAlbum && !liveAlbum.ok && (
				<p {...stylex.props(styles.empty)}>
					this trip's icloud album is offline.
				</p>
			)}

			{photos.length > 0 && (
				<div {...stylex.props(styles.masonry)}>
					{photos.map((photo) => (
						<figure key={photo.key} {...stylex.props(styles.tile)}>
							<img
								src={photo.src}
								alt={photo.caption || `${trip.title} photo`}
								width={photo.dims?.width}
								height={photo.dims?.height}
								loading="lazy"
								{...stylex.props(styles.photo)}
							/>
							{photo.caption && (
								<figcaption {...stylex.props(styles.caption)}>
									{photo.caption}
								</figcaption>
							)}
						</figure>
					))}
				</div>
			)}

			{photos.length === 0 && (!liveAlbum || liveAlbum.ok) && (
				<p {...stylex.props(styles.empty)}>no photos on this trip yet.</p>
			)}
		</main>
	);
}
