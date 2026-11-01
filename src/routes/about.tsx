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

function About() {
	return (
		<main className="mx-auto max-w-3xl animate-in fade-in px-8 pt-12 pb-20 leading-relaxed duration-[400ms] ease-out">
			<h1 className="mb-8 text-2xl font-light tracking-tight">about</h1>

			<div className="flex flex-col gap-4 text-muted-foreground">
				<AboutIsland />
			</div>

			<p className="mt-8 text-muted-foreground">
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
