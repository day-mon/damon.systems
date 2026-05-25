interface DescriptionProps {
	description: string;
	highlightedWords: string[];
}

export default function Description({
	description,
	highlightedWords,
}: DescriptionProps) {
	return (
		<div className="mb-2">
			{description.split(" ").map((word: string) => {
				const clean = word.replace(",", "");
				const isHighlighted = highlightedWords.includes(clean);
				return (
					<span
						key={word}
						className={isHighlighted ? "font-bold italic" : ""}
					>
						{word}{" "}
					</span>
				);
			})}
		</div>
	);
}
