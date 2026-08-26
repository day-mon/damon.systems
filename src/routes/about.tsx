import * as stylex from "@stylexjs/stylex";
import { createFileRoute } from "@tanstack/react-router";

import { AboutIsland } from "#/components/about-island";

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [
			{ title: "damon | about" },
			{ name: "description", content: "about me" },
			{ property: "og:image", content: "/about.png" },
		],
	}),
	component: About,
});

const fadeIn = stylex.keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
});

const styles = stylex.create({
	main: {
		maxWidth: "48rem",
		marginInline: "auto",
		paddingTop: 48,
		paddingBottom: 80,
		paddingInline: 32,
		lineHeight: 1.625,
		animationName: fadeIn,
		animationDuration: "0.4s",
		animationTimingFunction: "ease-out",
	},
	title: {
		fontSize: "1.5rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		marginBottom: 32,
	},
	body: {
		opacity: 0.75,
		display: "flex",
		flexDirection: "column",
		gap: 16,
	},
	footerNote: {
		opacity: 0.75,
		marginTop: 32,
	},
});

function About() {
	return (
		<main {...stylex.props(styles.main)}>
			<h1 {...stylex.props(styles.title)}>about</h1>

			<div {...stylex.props(styles.body)}>
				<AboutIsland />
			</div>

			<p {...stylex.props(styles.footerNote)}>
				sometimes i{" "}
				<a
					href="https://www.alltrails.com/members/damon-montague"
					target="_blank"
					rel="noopener noreferrer"
				>
					hike
				</a>
				, take{" "}
				<a
					href="https://instagram.com/adopted"
					target="_blank"
					rel="noopener noreferrer"
				>
					pictures
				</a>
				, and{" "}
				<a
					href="https://github.com/day-mon"
					target="_blank"
					rel="noopener noreferrer"
				>
					code
				</a>
				.
			</p>
		</main>
	);
}
