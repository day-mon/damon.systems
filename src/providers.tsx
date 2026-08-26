import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { domAnimation, LazyMotion } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import type { ComponentProps } from "react";

type AnchorProps = ComponentProps<"a"> & { href?: string };

/** Bridges astryx's href-based Link to TanStack Router's to-based Link. */
function RouterLinkAdapter({ href = "/", ...rest }: AnchorProps) {
	const isExternal = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
	if (isExternal) {
		return <a href={href} {...rest} />;
	}
	return <Link to={href} {...rest} />;
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
	},
});

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Theme theme={neutralTheme}>
			<LinkProvider component={RouterLinkAdapter}>
				<QueryClientProvider client={queryClient}>
					<NuqsAdapter>
						<LazyMotion features={domAnimation} strict>
							{children}
						</LazyMotion>
					</NuqsAdapter>
				</QueryClientProvider>
			</LinkProvider>
		</Theme>
	);
}
