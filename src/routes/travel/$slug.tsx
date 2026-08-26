import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import type { Trip } from "#/content/trips";
import { getTripServer } from "#/lib/trips/trips.service";
import { useSharedAlbumPages } from "#/queries/shared-album/queries";

interface WallPhoto {
	key: string;
	src: string;
	caption: string;
	takenAt: string;
	dims: { width: number; height: number } | null;
}

function manifestPhotos(trip: Trip): WallPhoto[] {
	return trip.photos.map((photo) => ({
		key: photo.file,
		src: `/travel/${trip.slug}/${photo.file}`,
		caption: photo.caption,
		takenAt: photo.takenAt,
		dims: null,
	}));
}

export const Route = createFileRoute("/travel/$slug")({
	// trips may carry a public icloud share url; the loader must NOT resolve
	// the album (apple paging would block first paint). the url passes
	// through and the photos stream in client-side via infinite query.
	loader: async ({ params }) => {
		const trip = await getTripServer({ data: params.slug });
		if (!trip) {
			throw notFound();
		}
		return { trip };
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
		position: "relative",
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
		// hides until onLoad flips PhotoTile to photoLoaded
		opacity: 0,
	},
	caption: {
		display: "block",
		paddingInline: 12,
		paddingBlock: 8,
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
	},
	shimmer: {
		backgroundColor: "var(--muted)",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
		display: "block",
		width: "100%",
		marginBottom: 16,
		breakInside: "avoid",
		borderRadius: 2,
		animationName: stylex.keyframes({
			from: { opacity: 0.55 },
			to: { opacity: 0.9 },
		}),
		animationDuration: "0.9s",
		animationIterationCount: "infinite",
		animationDirection: "alternate",
	},
	photoLoaded: {
		opacity: 1,
		transitionProperty: "opacity",
		transitionDuration: "0.4s",
		transitionTimingFunction: "ease-out",
	},
	shimmerFill: {
		position: "absolute",
		inset: 0,
		backgroundColor: "var(--muted)",
		animationName: stylex.keyframes({
			from: { opacity: 0.55 },
			to: { opacity: 0.85 },
		}),
		animationDuration: "0.9s",
		animationIterationCount: "infinite",
		animationDirection: "alternate",
	},
	sentinel: {
		height: 1,
		marginTop: 24,
		fontSize: "0.875rem",
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

function PhotoTile({
	photo,
	tripTitle,
}: {
	photo: WallPhoto;
	tripTitle: string;
}) {
	const [loaded, setLoaded] = useState(false);
	return (
		<figure
			{...stylex.props(styles.tile)}
			style={
				photo.dims
					? { aspectRatio: `${photo.dims.width} / ${photo.dims.height}` }
					: undefined
			}
		>
			{!loaded && <div {...stylex.props(styles.shimmerFill)} />}
			<img
				src={photo.src}
				alt={photo.caption || `${tripTitle} photo`}
				width={photo.dims?.width}
				height={photo.dims?.height}
				loading="lazy"
				decoding="async"
				onLoad={() => setLoaded(true)}
				{...stylex.props(styles.photo, loaded && styles.photoLoaded)}
			/>
			{photo.caption && (
				<figcaption {...stylex.props(styles.caption)}>
					{photo.caption}
				</figcaption>
			)}
		</figure>
	);
}

function SharedAlbumWall({ url, trip }: { url: string; trip: Trip }) {
	const query = useSharedAlbumPages(url);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	// fetchNextPage when the sentinel scrolls into view
	useEffect(() => {
		const node = sentinelRef.current;
		if (!node) return;
		const observer = new IntersectionObserver((entries) => {
			if (
				entries[0].isIntersecting &&
				query.hasNextPage &&
				!query.isFetchingNextPage
			) {
				query.fetchNextPage();
			}
		});
		observer.observe(node);
		return () => observer.disconnect();
	}, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

	const pages = query.data?.pages ?? [];
	const photos: WallPhoto[] = pages.flatMap((page) =>
		page.ok
			? page.photos.map((photo) => ({
					key: photo.key,
					src: photo.src,
					caption: photo.caption,
					takenAt: photo.takenAt,
					dims: { width: photo.width, height: photo.height },
				}))
			: [],
	);

	return (
		<>
			{query.isError && (
				<p {...stylex.props(styles.empty)}>
					this trip's icloud album is offline.
				</p>
			)}
			{photos.length > 0 && (
				<div {...stylex.props(styles.masonry)}>
					{photos.map((photo) => (
						<PhotoTile key={photo.key} photo={photo} tripTitle={trip.title} />
					))}
				</div>
			)}
			{query.hasNextPage && (
				<div ref={sentinelRef} {...stylex.props(styles.sentinel)}>
					{query.isFetchingNextPage ? "loading more…" : ""}
				</div>
			)}
		</>
	);
}

function TripPage() {
	const { trip } = Route.useLoaderData();

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

			{trip.sharedAlbumUrl ? (
				<SharedAlbumWall url={trip.sharedAlbumUrl} trip={trip} />
			) : (
				(() => {
					const photos = manifestPhotos(trip);
					return photos.length > 0 ? (
						<div {...stylex.props(styles.masonry)}>
							{photos.map((photo) => (
								<PhotoTile
									key={photo.key}
									photo={photo}
									tripTitle={trip.title}
								/>
							))}
						</div>
					) : (
						<p {...stylex.props(styles.empty)}>no photos on this trip yet.</p>
					);
				})()
			)}
		</main>
	);
}
