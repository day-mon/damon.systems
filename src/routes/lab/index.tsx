import { createFileRoute, Link } from "@tanstack/react-router";

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

	return (
		<main className="mx-auto max-w-3xl animate-in fade-in px-4 py-16 duration-[400ms] ease-out">
			<h1 className="mb-12 text-3xl font-light tracking-tight">lab</h1>

			<div className="grid gap-6">
				{posts.map((post) => (
					<Link
						key={post.slug}
						to="/lab/$slug"
						params={{ slug: post.slug }}
						className="group block border border-border p-6 text-inherit no-underline transition-colors duration-200 hover:bg-accent/50"
					>
						<div className="mb-2 flex items-baseline justify-between gap-4">
							<h2 className="text-lg font-medium underline-offset-2 group-hover:underline">
								{post.title}
							</h2>
							<time className="shrink-0 font-mono text-xs text-muted-foreground">
								{formatDate(post.date)}
							</time>
						</div>
						<p className="text-sm text-muted-foreground">{post.description}</p>
						{post.tags.length > 0 && (
							<div className="mt-3 flex flex-wrap gap-1.5">
								{post.tags.map((tag) => (
									<span
										key={tag}
										className="text-xs text-muted-foreground opacity-60"
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</Link>
				))}
			</div>

			{posts.length === 0 && (
				<p className="text-sm text-muted-foreground">no posts yet.</p>
			)}
		</main>
	);
}
