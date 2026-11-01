import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { getLabPost } from "#/content/lab";

export const Route = createFileRoute("/lab/$slug/")({
	// Content is a React component and cannot survive loader serialization;
	// carry everything except it and re-resolve Content in the component.
	loader: ({ params }) => {
		const post = getLabPost(params.slug);

		if (!post) {
			throw notFound();
		}

		return {
			slug: post.slug,
			title: post.title,
			description: post.description,
			dateIso: post.date.toISOString(),
			tags: post.tags,
			demoComponent: post.demoComponent,
		};
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData ? `damon | lab | ${loaderData.title}` : "damon | lab",
			},
			{ name: "description", content: loaderData?.description ?? "" },
		],
	}),
	component: LabPost,
});

function LabPost() {
	const meta = Route.useLoaderData();
	// loader 404-gates this slug; this guard only narrows Content lookup type
	const post = getLabPost(meta.slug);

	if (!post) {
		throw notFound();
	}

	const { Content } = post;

	return (
		<article className="mx-auto max-w-2xl animate-in fade-in px-4 py-16 duration-[400ms] ease-out">
			<Link
				to="/lab"
				className="mb-8 inline-block text-sm text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground"
			>
				&larr; all learnings
			</Link>

			<header className="mb-12">
				<time className="font-mono text-sm text-muted-foreground">
					{new Date(meta.dateIso).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</time>
				<h1 className="mt-2 mb-4 text-3xl font-light tracking-tight">
					{meta.title}
				</h1>
				{meta.tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{meta.tags.map((tag) => (
							<span
								key={tag}
								className="border border-border px-2 py-0.5 text-xs text-muted-foreground"
							>
								{tag}
							</span>
						))}
					</div>
				)}
			</header>

			{meta.demoComponent && (
				<Link
					to="/lab/$slug/demo"
					params={{ slug: meta.slug }}
					className="group mb-12 block border border-border p-6 text-inherit no-underline transition-colors duration-200 hover:bg-accent/20"
				>
					<div className="flex items-center justify-between">
						<div>
							<span className="block text-sm font-medium">
								explore the data
							</span>
							<span className="mt-1 block text-xs text-muted-foreground">
								interactive map, filters, and ticket lookup
							</span>
						</div>
						<span className="text-sm transition-transform duration-200 group-hover:translate-x-1">
							&rarr;
						</span>
					</div>
				</Link>
			)}

			<div className="mdx-body">
				<Content />
			</div>
		</article>
	);
}
