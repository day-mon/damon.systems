import "../styles.css";

import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
	useLocation,
} from "@tanstack/react-router";
import { m, useReducedMotion } from "motion/react";

import { Footer } from "../components/footer";
import { UploadPill } from "../components/upload-pill";
import { Navbar } from "../components/navbar";
import { Providers } from "../providers";

// hydrate the theme before paint to avoid a flash of the wrong scheme
const THEME_INIT = `(function(){const stored=localStorage.getItem("theme");const prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches;if(stored==="dark"||(!stored&&prefersDark)){document.documentElement.classList.add("dark")}})();`;

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
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
			{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
		],
		scripts: [{ children: THEME_INIT }],
	}),
	notFoundComponent: NotFound,
	shellComponent: RootDocument,
});

function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 px-8">
			<h1 className="m-0 text-5xl font-light tracking-tight">404</h1>
			<p className="m-0 text-lg opacity-60">page not found</p>
			<Link to="/">home</Link>
		</main>
	);
}

function RouteTransitions({ children }: { children: React.ReactNode }) {
	const { pathname } = useLocation();
	const reduceMotion = useReducedMotion();

	// enter-only: exit animations serialize behind loaders and leave the
	// viewport empty for a beat (the "weird stagger"). committed page enters
	// immediately: 200ms ease-out with a 4px rise.
	return (
		<m.div
			key={pathname}
			initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
		>
			{children}
		</m.div>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		// suppressHydrationWarning: THEME_INIT adds .dark client-side before paint
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<Providers>
					<Navbar />
					<RouteTransitions>{children}</RouteTransitions>
					<Footer />
					<UploadPill />
				</Providers>

				<Scripts />
			</body>
		</html>
	);
}
