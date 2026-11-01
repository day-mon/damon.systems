import { createFileRoute, Link } from "@tanstack/react-router";
import SpotlightCard from "#/components/ui/SpotlightCard";
import { LAB_POSTS } from "#/content/lab";
import { useResolvedTheme } from "#/lib/theme";

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
	const theme = useResolvedTheme();

	const posts = LAB_POSTS.toSorted(
		(a, b) => b.date.getTime() - a.date.getTime(),
	);

	return (
		<main className="mx-auto max-w-3xl px-4 py-16">
			<h1 className="mb-12 text-3xl font-light tracking-tight">lab</h1>

			<div className="grid gap-6">
				{posts.map((post) => (
					<SpotlightCard
						key={post.slug}
						theme={theme}
						className="block border border-border"
					>
						<Link
							to="/lab/$slug"
							params={{ slug: post.slug }}
							className="group block p-6 text-inherit no-underline"
						>
							<div className="mb-2 flex items-baseline justify-between gap-4">
								<h2 className="text-lg font-medium underline-offset-2 group-hover:underline">
									{post.title}
								</h2>
								<time className="shrink-0 font-mono text-xs text-muted-foreground">
									{formatDate(post.date)}
								</time>
							</div>
							<p className="text-sm text-muted-foreground">
								{post.description}
							</p>
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
					</SpotlightCard>
				))}
			</div>

			{posts.length === 0 && (
				<p className="text-sm text-muted-foreground">no posts yet.</p>
			)}
		</main>
	);
}
