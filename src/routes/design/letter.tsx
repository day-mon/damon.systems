/* Hallmark · macrostructure: Letter · theme: custom warm paper (roman serif · ink)  · scope: home preview
 * pre-emit critique: P5 H4 E4 S5 R5 V5
 */
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/500.css";
import "@fontsource/newsreader/600.css";

import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/design/letter")({
	head: () => ({ meta: [{ title: "design · letter" }] }),
	component: Letter,
});

const PAPER = "oklch(0.955 0.01 90)";
const INK = "oklch(0.27 0.01 60)";
const INK_SOFT = "oklch(0.45 0.01 60)";
const VERMILION = "oklch(0.62 0.18 45)";
const RULE = "oklch(0 0 0 / 10%)";

const styleParts = stylex.create({
	page: {
		minHeight: "100vh",
		backgroundColor: PAPER,
		color: INK,
		colorScheme: "light",
		fontFamily: "'Newsreader', Georgia, serif",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: 24,
	},
	sheet: {
		width: "100%",
		maxWidth: "38rem",
	},
	masthead: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "baseline",
		paddingBlock: 16,
		borderBottom: `1px solid ${RULE}`,
		fontSize: "0.85rem",
		color: INK_SOFT,
		fontWeight: 500,
	},
	greeting: {
		fontSize: "1.6rem",
		fontWeight: 600,
		marginTop: 72,
		marginBottom: 32,
	},
	paragraph: {
		fontSize: "1.15rem",
		lineHeight: 1.75,
		marginBottom: 24,
	},
	link: {
		color: INK,
		textDecoration: "none",
		borderBottom: `1px solid ${VERMILION}`,
	},
	signatureRule: {
		borderTop: `1px solid ${RULE}`,
		marginTop: 72,
		paddingTop: 24,
		display: "flex",
		justifyContent: "space-between",
		alignItems: "baseline",
	},
	signature: {
		fontSize: "1.6rem",
		fontWeight: 500,
	},
	ps: {
		marginTop: 16,
		fontSize: "0.95rem",
		color: INK_SOFT,
	},
});

function Letter() {
	return (
		<div {...stylex.props(styleParts.page)}>
			<div {...stylex.props(styleParts.sheet)}>
				<header {...stylex.props(styleParts.masthead)}>
					<span>damon.systems</span>
					<span>pennsylvania · usa</span>
				</header>

				<main>
					<p {...stylex.props(styleParts.greeting)}>dear internet,</p>

					<p {...stylex.props(styleParts.paragraph)}>
						i'm damon — a software engineer in the united states. by day i{" "}
						<Link to="/about" {...stylex.props(styleParts.link)}>
							keep the gpus warm at coreweave
						</Link>
						; by night i wander, photograph, and occasionally over-engineer
						small personal problems into public writeups.
					</p>

					<p {...stylex.props(styleParts.paragraph)}>
						the{" "}
						<Link to="/lab" {...stylex.props(styleParts.link)}>
							lab
						</Link>{" "}
						is where those writeups live — most recently, how i scraped all of
						pittsburgh's parking tickets without getting banned, and the four
						digit fine that started it. if you like{" "}
						<Link to="/projects" {...stylex.props(styleParts.link)}>
							code more than prose
						</Link>
						, my projects are indexed in github and simple to browse.
					</p>

					<p {...stylex.props(styleParts.paragraph)}>
						if any of this resonates,{" "}
						<Link to="/contact" {...stylex.props(styleParts.link)}>
							i'd like to hear from you
						</Link>
						.
					</p>

					<div {...stylex.props(styleParts.signatureRule)}>
						<span {...stylex.props(styleParts.signature)}>— damon</span>
						<Link to="/lab" {...stylex.props(styleParts.link)}>
							start with the tickets →
						</Link>
					</div>

					<p {...stylex.props(styleParts.ps)}>
						ps — i don't have a favorite color. i do have a sql database of a
						city's parking tickets. priorities.
					</p>
				</main>
			</div>
		</div>
	);
}
