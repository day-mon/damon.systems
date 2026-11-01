import { createFileRoute, Link } from "@tanstack/react-router";
import { m, useReducedMotion } from "motion/react";

import SplitText from "#/components/ui/SplitText";
import { useResolvedTheme } from "#/lib/theme";

export const Route = createFileRoute("/")({ component: Home });

const NAV = [
	{ to: "/about", label: "about" },
	{ to: "/projects", label: "projects" },
	{ to: "/lab", label: "lab" },
	{ to: "/contact", label: "contact" },
] as const;

function Home() {
	const theme = useResolvedTheme();
	const isDark = theme === "dark";
	const reduceMotion = useReducedMotion();

	return (
		<main className="relative flex min-h-screen flex-col items-center justify-center px-8">
			{/*
				near-invisible dot texture fills the page's dead space.
				pure css after webgl dither proved fragile (gpu-crashed grey
				film on damon's chrome). boring, unbreakable.
			*/}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10"
				style={{
					opacity: isDark ? 0.045 : 0.06,
					backgroundImage:
						"radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
					backgroundSize: "32px 32px",
					backgroundPosition: "16px 16px",
				}}
			/>
			{reduceMotion ? (
				<h1 className="m-0 text-5xl font-light tracking-tight">damon</h1>
			) : (
				<SplitText
					tag="h1"
					text="damon"
					className="m-0 text-5xl font-light tracking-tight"
					splitType="chars"
					trigger="load"
					effect="rise"
					staggerFrom="start"
					delay={40}
				/>
			)}
			<p className="mt-3 text-lg opacity-60">software engineer</p>
			<nav className="mt-8 flex flex-col gap-3 text-center text-lg">
				{NAV.map((link, i) => (
					<m.span
						key={link.to}
						initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: 0.15 + i * 0.04,
							duration: 0.3,
							ease: [0.23, 1, 0.32, 1],
						}}
					>
						<Link
							to={link.to}
							className="inline-block transition-transform duration-[160ms] ease-out active:scale-[0.97]"
						>
							{link.label}
						</Link>
					</m.span>
				))}
			</nav>
		</main>
	);
}
