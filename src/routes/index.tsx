import { createFileRoute, Link } from "@tanstack/react-router";

import Dither from "#/components/ui/Dither";
import SplitText from "#/components/ui/SplitText";
import TextType from "#/components/ui/TextType";
import { useResolvedTheme } from "#/lib/theme";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const theme = useResolvedTheme();
	const isDark = theme === "dark";

	return (
		<main className="relative flex min-h-screen animate-in fade-in flex-col items-center justify-center px-8 duration-[400ms] ease-out">
			{/* near-invisible dither texture to fill the page's dead space */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10"
				style={{ opacity: isDark ? 0.06 : 0.08 }}
			>
				<Dither
					waveColor={isDark ? [1, 1, 1] : [0, 0, 0]}
					backgroundColor={isDark ? [0.145, 0.145, 0.145] : [1, 1, 1]}
					colorNum={2}
					pixelSize={3}
					waveSpeed={0.02}
					waveFrequency={2.1}
					enableMouseInteraction={false}
					disableAnimation={false}
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
			<TextType
				as="p"
				text="software engineer"
				className="mt-3 font-mono text-lg opacity-60"
				cursorStyle="underscore"
				cursorCharacter="_"
				typingSpeed={70}
				loop={false}
				typeEffect="fade"
			/>
			<nav className="mt-8 flex flex-col gap-3 text-center text-lg">
				<Link to="/about">about</Link>
				<Link to="/projects">projects</Link>
				<Link to="/lab">lab</Link>
				<Link to="/contact">contact</Link>
			</nav>
		</main>
	);
}
