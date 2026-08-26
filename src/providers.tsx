import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

type AnchorProps = ComponentProps<"a"> & { href?: string };

function RouterLinkAdapter({ href = "/", ...rest }: AnchorProps) {
	const isExternal = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
	if (isExternal) {
		return <a href={href} {...rest} />;
	}
	return <Link to={href} {...rest} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Theme theme={neutralTheme}>
			<LinkProvider component={RouterLinkAdapter}>{children}</LinkProvider>
		</Theme>
	);
}
