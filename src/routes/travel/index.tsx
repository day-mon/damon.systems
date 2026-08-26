import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { TRIPS } from "#/content/trips";

export const Route = createFileRoute("/travel/")({
	head: () => ({
		meta: [
			{ title: "damon | travel" },
			{
				name: "description",
				content: "trips, photos, and where they happened",
			},
		],
	}),
	component: TravelIndex,
});

const fadeIn = stylex.keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
});

const styles = stylex.create({
	main: {
		maxWidth: "48rem",
		marginInline: "auto",
		paddingInline: 16,
		paddingBlock: 64,
		animationName: fadeIn,
		animationDuration: "0.4s",
		animationTimingFunction: "ease-out",
	},
	title: {
		fontSize: "1.875rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		marginBottom: 48,
	},
	grid: {
		display: "grid",
		gap: 24,
	},
	card: {
		display: "block",
		padding: 24,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
		textDecoration: "none",
		color: "inherit",
		transitionProperty: "background-color",
		transitionDuration: "0.2s",
		backgroundColor: {
			default: null,
			":hover": "color-mix(in oklab, var(--accent) 50%, transparent)",
		},
	},
	cardTitleHover: {
		textDecoration: "underline",
		textUnderlineOffset: 2,
	},
	headRow: {
		display: "flex",
		alignItems: "baseline",
		justifyContent: "space-between",
		gap: 16,
		marginBottom: 8,
	},
	cardTitle: {
		fontSize: "1.125rem",
		fontWeight: 500,
	},
	time: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
		fontFamily: "monospace",
		flexShrink: 0,
	},
	desc: {
		fontSize: "0.875rem",
		color: "var(--muted-foreground)",
	},
	photoCount: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
		opacity: 0.6,
		marginTop: 12,
	},
	empty: {
		color: "var(--muted-foreground)",
		fontSize: "0.875rem",
	},
});

const SHORT_DATE: Intl.DateTimeFormatOptions = {
	year: "numeric",
	month: "short",
	day: "numeric",
};

function dateRangeLabel(start: string, end: string): string {
	const [s, e] = [start, end].map((d) =>
		new Date(`${d}T00:00:00`).toLocaleDateString("en-US", SHORT_DATE),
	);
	return s === e ? s : `${s} – ${e}`;
}

function TravelIndex() {
	const [hovered, setHovered] = useState<string | null>(null);

	return (
		<main {...stylex.props(styles.main)}>
			<h1 {...stylex.props(styles.title)}>travel</h1>

			<div {...stylex.props(styles.grid)}>
				{TRIPS.map((trip) => (
					<Link
						key={trip.slug}
						to="/travel/$slug"
						params={{ slug: trip.slug }}
						onMouseEnter={() => setHovered(trip.slug)}
						onMouseLeave={() => setHovered(null)}
						{...stylex.props(styles.card)}
					>
						<div {...stylex.props(styles.headRow)}>
							<h2
								{...stylex.props(
									styles.cardTitle,
									hovered === trip.slug && styles.cardTitleHover,
								)}
							>
								{trip.title}
							</h2>
							<time {...stylex.props(styles.time)}>
								{dateRangeLabel(trip.dateRange.start, trip.dateRange.end)}
							</time>
						</div>
						<p {...stylex.props(styles.desc)}>{trip.blurb}</p>
						{trip.photos.length > 0 && (
							<p {...stylex.props(styles.photoCount)}>
								{trip.photos.length} photo{trip.photos.length === 1 ? "" : "s"}
							</p>
						)}
					</Link>
				))}
			</div>

			{TRIPS.length === 0 && (
				<p {...stylex.props(styles.empty)}>
					no trips yet — sync an icloud album to add one.
				</p>
			)}
		</main>
	);
}
