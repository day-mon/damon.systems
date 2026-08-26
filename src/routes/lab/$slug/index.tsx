import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { getLabPost } from "#/content/lab";

export const Route = createFileRoute("/lab/$slug/")({
	head: ({ params }) => {
		const post = getLabPost(params.slug);
		return {
			meta: [
				{ title: post ? `damon | lab | ${post.title}` : "damon | lab" },
				{ name: "description", content: post?.description ?? "" },
			],
		};
	},
	component: LabPost,
});

const fadeIn = stylex.keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
});

const styles = stylex.create({
	article: {
		maxWidth: "42rem",
		marginInline: "auto",
		paddingInline: 16,
		paddingBlock: 64,
		animationName: fadeIn,
		animationDuration: "0.4s",
		animationTimingFunction: "ease-out",
	},
	back: {
		fontSize: "0.875rem",
		display: "inline-block",
		marginBottom: 32,
		textDecoration: "none",
		transitionProperty: "color",
		transitionDuration: "0.2s",
		color: {
			default: "var(--muted-foreground)",
			":hover": "var(--foreground)",
		},
	},
	header: {
		marginBottom: 48,
	},
	time: {
		fontSize: "0.875rem",
		color: "var(--muted-foreground)",
		fontFamily: "monospace",
	},
	title: {
		fontSize: "1.875rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		marginTop: 8,
		marginBottom: 16,
	},
	tag: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
		paddingInline: 8,
		paddingBlock: 2,
	},
	tags: {
		display: "flex",
		flexWrap: "wrap",
		gap: 8,
	},
	demoCard: {
		display: "block",
		marginBottom: 48,
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
			":hover": "color-mix(in oklab, var(--accent) 20%, transparent)",
		},
	},
	demoArrow: {
		fontSize: "0.875rem",
		transitionProperty: "transform",
		transitionDuration: "0.2s",
	},
	demoArrowHover: {
		transform: "translateX(4px)",
	},
	demoInner: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
	},
	demoTitle: {
		fontSize: "0.875rem",
		fontWeight: 500,
		display: "block",
	},
	demoSub: {
		display: "block",
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
		marginTop: 4,
	},
});

function LabPost() {
	const { slug } = Route.useParams();
	const post = getLabPost(slug ?? "");
	if (!post) {
		throw notFound();
	}

	const { Content } = post;

	return (
		<article {...stylex.props(styles.article)}>
			<Link to="/lab" {...stylex.props(styles.back)}>
				&larr; all learnings
			</Link>

			<header {...stylex.props(styles.header)}>
				<time {...stylex.props(styles.time)}>
					{post.date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</time>
				<h1 {...stylex.props(styles.title)}>{post.title}</h1>
				{post.tags.length > 0 && (
					<div {...stylex.props(styles.tags)}>
						{post.tags.map((tag) => (
							<span key={tag} {...stylex.props(styles.tag)}>
								{tag}
							</span>
						))}
					</div>
				)}
			</header>

			{post.demoComponent && (
				<Link
					to="/lab/$slug/demo"
					params={{ slug: post.slug }}
					{...stylex.props(styles.demoCard)}
				>
					<div {...stylex.props(styles.demoInner)}>
						<div>
							<span {...stylex.props(styles.demoTitle)}>explore the data</span>
							<span {...stylex.props(styles.demoSub)}>
								interactive map, filters, and ticket lookup
							</span>
						</div>
						<span {...stylex.props(styles.demoArrow)}>&rarr;</span>
					</div>
				</Link>
			)}

			<div className="mdx-body">
				<Content />
			</div>
		</article>
	);
}
