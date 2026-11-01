import { Link, useLocation } from "@tanstack/react-router";

import { ThemeSwitch } from "./theme-switch";

export function Navbar() {
	const { pathname } = useLocation();
	const isHome = pathname === "/" || pathname === "";

	return (
		<nav className="flex items-center justify-between p-4">
			{!isHome && (
				<Link
					to="/"
					className="inline-block text-base font-light tracking-tight no-underline transition-transform duration-[160ms] ease-out hover:opacity-100 active:scale-[0.97]"
				>
					damon
				</Link>
			)}
			<div className="grow" />
			<ThemeSwitch />
		</nav>
	);
}
