/*
app-wide query client singleton — used by Providers and by route loaders
(SSR-safe: module scope == one instance per process).
*/

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
	},
});
