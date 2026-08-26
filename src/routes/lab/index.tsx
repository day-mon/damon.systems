import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { LAB_POSTS } from "#/content/lab";

export const Route = createFileRoute("/lab/")({
	head: () => ({
		meta: [
			{ title: "damon | lab" },
			{ name: "description", content: "projects and learnings" },
			{ property: "og:image", content: "/laptop.gif" },
		],
	}),
	component: LabIndex,
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
	tags: {
		display: "flex",
		flexWrap: "wrap",
		gap: 6,
		marginTop: 12,
	},
	tag: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
		opacity: 0.6,
	},
	empty: {
		color: "var(--muted-foreground)",
		fontSize: "0.875rem",
	},
});

function formatDate(d: Date): string {
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function LabIndex() {
	const posts = [...LAB_POSTS].sort(
		(a, b) => b.date.getTime() - a.date.getTime(),
	);
	const [hovered, setHovered] = useState<string | null>(null);

	return (
		<main {...stylex.props(styles.main)}>
			<h1 {...stylex.props(styles.title)}>lab</h1>

			<div {...stylex.props(styles.grid)}>
				{posts.map((post) => (
					<Link
						key={post.slug}
						to="/lab/$slug"
						params={{ slug: post.slug }}
						onMouseEnter={() => setHovered(post.slug)}
						onMouseLeave={() => setHovered(null)}
						{...stylex.props(styles.card)}
					>
						<div {...stylex.props(styles.headRow)}>
							<h2
								{...stylex.props(
									styles.cardTitle,
									hovered === post.slug && styles.cardTitleHover,
								)}
							>
								{post.title}
							</h2>
							<time {...stylex.props(styles.time)}>
								{formatDate(post.date)}
							</time>
						</div>
						<p {...stylex.props(styles.desc)}>{post.description}</p>
						{post.tags.length > 0 && (
							<div {...stylex.props(styles.tags)}>
								{post.tags.map((tag) => (
									<span key={tag} {...stylex.props(styles.tag)}>
										{tag}
									</span>
								))}
							</div>
						)}
					</Link>
				))}
			</div>

			{posts.length === 0 && (
				<p {...stylex.props(styles.empty)}>no posts yet.</p>
			)}
		</main>
	);
}
