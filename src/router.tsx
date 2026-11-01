import { createRouter as createTanStackRouter } from "@tanstack/react-router";
// keeps @tanstack/react-start's module augmentation visible to tsserver;
// oxlint-disable-next-line unicorn/require-module-specifiers
import type {} from "@tanstack/react-start";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
