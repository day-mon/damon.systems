import "../styles.css";

import * as stylex from "@stylexjs/stylex";
import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";

import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";
import { Providers } from "../providers";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "description", content: "damon - software engineer" },
			{ title: "damon" },
			{ property: "og:site_name", content: "damon" },
			{ property: "og:type", content: "website" },
		],
		links: [
			{ rel: "stylesheet", href: "/layers.css" },
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
			{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
			// StyleX dev-only CSS endpoint (prod build appends to the css asset)
			...(import.meta.env.DEV
				? [{ rel: "stylesheet", href: "/virtual:stylex.css" }]
				: []),
		],
		scripts: [
			...(import.meta.env.DEV
				? [{ src: "/@id/virtual:stylex:runtime", type: "module" }]
				: []),
		],
	}),
	notFoundComponent: NotFound,
	shellComponent: RootDocument,
});

const fadeIn = stylex.keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
});

const notFoundStyles = stylex.create({
	main: {
		display: "flex",
		minHeight: "100vh",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: 16,
		paddingInline: 32,
		animationName: fadeIn,
		animationDuration: "0.4s",
		animationTimingFunction: "ease-out",
	},
	code: {
		fontSize: "3rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		margin: 0,
	},
	muted: {
		fontSize: "1.125rem",
		opacity: 0.6,
		margin: 0,
	},
});

function NotFound() {
	return (
		<main {...stylex.props(notFoundStyles.main)}>
			<h1 {...stylex.props(notFoundStyles.code)}>404</h1>
			<p {...stylex.props(notFoundStyles.muted)}>page not found</p>
			<Link to="/">home</Link>
		</main>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<Providers>
					<Navbar />
					{children}
					<Footer />
				</Providers>

				<Scripts />
			</body>
		</html>
	);
}
