import { createFileRoute, Link } from "@tanstack/react-router";

import Dither from "#/components/ui/Dither";
import SplitText from "#/components/ui/SplitText";
import { useResolvedTheme } from "#/lib/theme";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const theme = useResolvedTheme();
	const isDark = theme === "dark";

	return (
		<main className="relative flex min-h-screen animate-in fade-in flex-col items-center justify-center px-8 duration-[400ms] ease-out">
			{/* near-invisible dither texture to fill the page's dead space.
			    backgroundColor must exactly match --background or it reads as a film. */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10"
				style={{ opacity: isDark ? 0.12 : 0.18 }}
			>
				<Dither
					waveColor={isDark ? [1, 1, 1] : [0, 0, 0]}
					backgroundColor={isDark ? [9 / 255, 9 / 255, 11 / 255] : [1, 1, 1]}
					colorNum={4}
					pixelSize={2}
					waveSpeed={0.03}
					waveFrequency={4}
					waveAmplitude={0.6}
					contrast={1.6}
					enableMouseInteraction={false}
					className="size-full"
				/>
			</div>
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
