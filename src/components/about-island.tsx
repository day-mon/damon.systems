import { useState } from "react";

const BIRTH_DATE = new Date("2001-02-02");

function getAge(): number {
	const now = new Date();
	let age = now.getFullYear() - BIRTH_DATE.getFullYear();
	const monthDelta = now.getMonth() - BIRTH_DATE.getMonth();

	if (
		monthDelta < 0 ||
		(monthDelta === 0 && now.getDate() < BIRTH_DATE.getDate())
	) {
		age--;
	}

	return age;
}

const FUN_FACTS = [
	"i do not have a favorite color",
	"i like lowercase letters",
	"i have been to universal in florida 10 times",
	"i played divisional paintball for 2 years",
];

export function AboutIsland() {
	const [funFact] = useState(
		() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)],
	);

	const age = getAge();

	return (
		<>
			<p>im damon, a {age} year old software engineer based in the usa.</p>
			<p>im currently at coreweave keeping the gpus warm.</p>
			<p>
				i attended the university of pittsburgh @ johnstown and graduated with a
				bachelors in computer science.
			</p>
			<p>fun fact: {funFact}.</p>
		</>
	);
}
