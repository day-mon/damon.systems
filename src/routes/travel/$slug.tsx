import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { getTrip } from "#/content/trips";

export const Route = createFileRoute("/travel/$slug")({
	// trip manifests are plain json so the whole trip survives loader
	// serialization; photos resolve under /travel/<slug>/ at render time
	loader: ({ params }) => {
		const trip = getTrip(params.slug);
		if (!trip) {
			throw notFound();
		}
		return trip;
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData
					? `damon | travel | ${loaderData.title}`
					: "damon | travel",
			},
			{ name: "description", content: loaderData?.blurb ?? "" },
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
		columns: 3,
		columnGap: 16,
		"@media (max-width: 768px)": {
			columns: 2,
		},
		"@media (max-width: 480px)": {
			columns: 1,
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
	const trip = Route.useLoaderData();

	return (
		<main {...stylex.props(styles.main)}>
			<header {...stylex.props(styles.header)}>
				<Link to="/travel" {...stylex.props(styles.back)}>
					&larr; all trips
				</Link>
				<time {...stylex.props(styles.time)}>
					{dateRangeLabel(trip.dateRange.start, trip.dateRange.end)}
				</time>
				<h1 {...stylex.props(styles.title)}>{trip.title}</h1>
				<p {...stylex.props(styles.blurb)}>{trip.blurb}</p>
			</header>

			{trip.photos.length > 0 ? (
				<div {...stylex.props(styles.masonry)}>
					{trip.photos.map((photo) => (
						<figure key={photo.file} {...stylex.props(styles.tile)}>
							<img
								src={`/travel/${trip.slug}/${photo.file}`}
								alt={photo.caption || `${trip.title} photo`}
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
			) : (
				<p {...stylex.props(styles.empty)}>no photos on this trip yet.</p>
			)}
		</main>
	);
}
