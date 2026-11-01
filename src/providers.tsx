import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { domAnimation, LazyMotion } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
	},
});

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<NuqsAdapter>
				<LazyMotion features={domAnimation} strict>
					{children}
				</LazyMotion>
			</NuqsAdapter>
		</QueryClientProvider>
	);
}
