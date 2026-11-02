import { QueryClientProvider } from "@tanstack/react-query";
import { domAnimation, LazyMotion } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import { queryClient } from "#/lib/query-client";

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
