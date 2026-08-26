import * as stylex from "@stylexjs/stylex";
import { Link, useLocation } from "@tanstack/react-router";

import { ThemeSwitch } from "./theme-switch";

const styles = stylex.create({
	nav: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
	},
	homeLink: {
		fontSize: "1rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		textDecoration: "none",
	},
	spacer: {
		flexGrow: 1,
	},
});

export function Navbar() {
	const { pathname } = useLocation();
	const isHome = pathname === "/" || pathname === "";

	// design system preview routes carry their own chrome
	if (pathname.startsWith("/design")) return null;

	return (
		<nav {...stylex.props(styles.nav)}>
			{!isHome && (
				<Link to="/" {...stylex.props(styles.homeLink)}>
					damon
				</Link>
			)}
			<div {...stylex.props(styles.spacer)} />
			<ThemeSwitch />
		</nav>
	);
}
