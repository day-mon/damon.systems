import "../styles.css";

import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
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
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<Providers>{children}</Providers>

				<Scripts />
			</body>
		</html>
	);
}
