import { createFileRoute } from "@tanstack/react-router";

import { ProjectsList } from "#/components/projects/list";

export const Route = createFileRoute("/projects")({
	head: () => ({
		meta: [
			{ title: "damon | projects" },
			{
				name: "description",
				content: "some of the things I have worked on via github",
			},
		],
	}),
	component: Projects,
});

function Projects() {
	return (
		<main className="mx-auto max-w-3xl animate-in fade-in px-8 pt-12 pb-20 duration-[400ms] ease-out">
			<ProjectsList />
		</main>
	);
}
