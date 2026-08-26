import * as stylex from "@stylexjs/stylex";
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
		animationName: fadeIn,
		animationDuration: "0.4s",
		animationTimingFunction: "ease-out",
	},
});

function Projects() {
	return (
		<main {...stylex.props(styles.main)}>
			<ProjectsList />
		</main>
	);
}
