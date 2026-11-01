import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Dashboard } from "#/components/lab/pgh-ticket/Dashboard";
import { getLabPost } from "#/content/lab";

export const Route = createFileRoute("/lab/$slug/demo")({
	loader: ({ params }) => {
		const post = getLabPost(params.slug);

		if (!post?.demoComponent) {
			throw notFound();
		}

		return {
			slug: post.slug,
			title: post.title,
			description: post.description,
		};
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: loaderData ? `${loaderData.title} · demo` : "damon | lab" },
			{ name: "description", content: loaderData?.description ?? "" },
		],
	}),
	component: LabDemo,
});

function LabDemo() {
	const { slug, title } = Route.useLoaderData();

	return (
		<main className="min-h-[calc(100vh-8rem)] animate-in fade-in px-4 pb-16 duration-[400ms] ease-out">
			<div className="mx-auto max-w-6xl">
				<Link
					to="/lab/$slug"
					params={{ slug }}
					className="mb-4 inline-block pt-8 text-sm text-muted-foreground no-underline"
				>
					&larr; back to post
				</Link>

				<h1 className="mb-2 text-2xl font-light tracking-tight">
					{title} · explorer
				</h1>
				<p className="mb-2 text-xs text-muted-foreground">
					note: this is not the complete set of tickets, but running backfill
					daily
				</p>
				<p className="mb-8 text-xs text-muted-foreground">
					you may see data points outside the bounds of pittsburgh, this is a
					geocoding issue
				</p>

				<Dashboard />
			</div>
		</main>
	);
}
