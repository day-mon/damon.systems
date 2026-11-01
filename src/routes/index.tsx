import { createFileRoute, Link } from "@tanstack/react-router";

import SplitText from "#/components/ui/SplitText";
import { useResolvedTheme } from "#/lib/theme";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const theme = useResolvedTheme();
	const isDark = theme === "dark";

	return (
		<main className="relative flex min-h-screen animate-in fade-in flex-col items-center justify-center px-8 duration-[400ms] ease-out">
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
			<p className="mt-3 text-lg opacity-60">software engineer</p>
			<nav className="mt-8 flex flex-col gap-3 text-center text-lg">
				<Link to="/about">about</Link>
				<Link to="/projects">projects</Link>
				<Link to="/lab">lab</Link>
				<Link to="/contact">contact</Link>
			</nav>
		</main>
	);
}
