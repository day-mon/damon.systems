import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<main className="flex min-h-screen animate-in fade-in flex-col items-center justify-center px-8 duration-[400ms] ease-out">
			<h1 className="m-0 text-5xl font-light tracking-tight">damon</h1>
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
