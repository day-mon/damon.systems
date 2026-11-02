import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

const BIRTH_DATE = new Date("2001-02-02");

const FUN_FACTS = [
	"i do not have a favorite color",
	"i like lowercase letters",
	"i have been to universal in florida 10 times",
	"i played divisional paintball for 2 years",
];

function getAge(): number {
	const now = new Date();
	let age = now.getFullYear() - BIRTH_DATE.getFullYear();
	const monthDelta = now.getMonth() - BIRTH_DATE.getMonth();

	if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < BIRTH_DATE.getDate())) {
		age--;
	}

	return age;
}

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [
			{ title: "damon | about" },
			{ name: "description", content: "about me" },
			{ property: "og:image", content: "/about.png" },
		],
	}),
	component: About,
});

function About() {
	return (
		<main className="mx-auto max-w-3xl px-8 pt-12 pb-20 leading-relaxed">
			<h1 className="mb-8 text-2xl font-light tracking-tight">about</h1>

			<AboutIntro />

			<p className="mt-8 text-muted-foreground">
				sometimes i{" "}
				<a
					href="https://www.alltrails.com/members/damon-montague"
					target="_blank"
					rel="noopener noreferrer"
				>
					hike
				</a>
				, take{" "}
				<a
					href="https://instagram.com/adopted"
					target="_blank"
					rel="noopener noreferrer"
				>
					pictures
				</a>
				, and{" "}
				<a
					href="https://github.com/day-mon"
					target="_blank"
					rel="noopener noreferrer"
				>
					code
				</a>
				.
			</p>
		</main>
	);
}

function AboutIntro() {
	// random fun fact pinned per mount — escaping rerenders reshuffling it
	const [funFact] = useState(
		() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)],
	);

	const age = getAge();

	return (
		<div className="flex flex-col gap-4 text-muted-foreground">
			<p>im damon, a {age} year old software engineer based in the usa.</p>
			<p>im currently at coreweave keeping the gpus warm.</p>
			<p>
				i attended the university of pittsburgh @ johnstown and graduated with a
				bachelors in computer science.
			</p>
			<p>fun fact: {funFact}.</p>
		</div>
	);
}
