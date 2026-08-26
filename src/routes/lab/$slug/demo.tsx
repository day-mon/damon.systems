import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Dashboard } from "#/components/lab/pgh-ticket/Dashboard";
import { getLabPost } from "#/content/lab";

export const Route = createFileRoute("/lab/$slug/demo")({
	head: ({ params }) => {
		const post = getLabPost(params.slug);
		return {
			meta: [
				{ title: post ? `${post.title} · demo` : "damon | lab" },
				{ name: "description", content: post?.description ?? "" },
			],
		};
	},
	component: LabDemo,
});

const fadeIn = stylex.keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
});

const styles = stylex.create({
	main: {
		minHeight: "calc(100vh - 8rem)",
		paddingInline: 16,
		paddingBottom: 64,
		animationName: fadeIn,
		animationDuration: "0.4s",
		animationTimingFunction: "ease-out",
	},
	wrap: {
		maxWidth: "72rem",
		marginInline: "auto",
	},
	back: {
		fontSize: "0.875rem",
		color: "var(--muted-foreground)",
		display: "inline-block",
		marginBottom: 16,
		paddingTop: 32,
		textDecoration: "none",
	},
	title: {
		fontSize: "1.5rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		marginBottom: 8,
	},
	note: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
		marginBottom: 8,
	},
	noteLast: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
		marginBottom: 32,
	},
});

function LabDemo() {
	const { slug } = Route.useParams();
	const post = getLabPost(slug);

	if (!post?.demoComponent) {
		throw notFound();
	}

	return (
		<main {...stylex.props(styles.main)}>
			<div {...stylex.props(styles.wrap)}>
				<Link
					to="/lab/$slug"
					params={{ slug: post.slug }}
					{...stylex.props(styles.back)}
				>
					&larr; back to post
				</Link>

				<h1 {...stylex.props(styles.title)}>{post.title} · explorer</h1>
				<p {...stylex.props(styles.note)}>
					note: this is not the complete set of tickets, but running backfill
					daily
				</p>
				<p {...stylex.props(styles.noteLast)}>
					you may see data points outside the bounds of pittsburgh, this is a
					geocoding issue
				</p>

				<Dashboard />
			</div>
		</main>
	);
}
