import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

const fadeIn = stylex.keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
});

const styles = stylex.create({
	main: {
		display: "flex",
		minHeight: "100vh",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		paddingInline: 32,
		animationName: fadeIn,
		animationDuration: "0.4s",
		animationTimingFunction: "ease-out",
	},
	title: {
		fontSize: "3rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		margin: 0,
	},
	subtitle: {
		marginTop: 12,
		fontSize: "1.125rem",
		opacity: 0.6,
	},
	nav: {
		marginTop: 32,
		display: "flex",
		flexDirection: "column",
		gap: 12,
		fontSize: "1.125rem",
		textAlign: "center",
	},
});

function Home() {
	return (
		<main {...stylex.props(styles.main)}>
			<h1 {...stylex.props(styles.title)}>damon</h1>
			<p {...stylex.props(styles.subtitle)}>software engineer</p>

			<nav {...stylex.props(styles.nav)}>
				<Link to="/about">about</Link>
				<Link to="/projects">projects</Link>
				<Link to="/lab">lab</Link>
				<Link to="/contact">contact</Link>
			</nav>
		</main>
	);
}
