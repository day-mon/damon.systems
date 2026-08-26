/* Hallmark · macrostructure: Conversational FAQ · theme: custom soft dark (grotesque questions · coral accent) · scope: home preview
 * pre-emit critique: P4 H4 E5 S4 R5 V5
 */
import "@fontsource-variable/archivo/standard.css";

import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createFileRoute("/design/faq")({
	head: () => ({ meta: [{ title: "design · faq" }] }),
	component: Faq,
});

const BG = "oklch(0.21 0.015 30)";
const FG = "oklch(0.95 0.01 30)";
const MUTED = "oklch(0.72 0.02 30)";
const CORAL = "oklch(0.78 0.14 40)";
const RULE = "oklch(1 0 0 / 12%)";

type QA = Array<{ q: string; a: ReactNode }>;

function buildQA(): QA {
	return [
		{
			q: "who are you?",
			a: (
				<>
					damon. 25, software engineer, united states. i graduated from pitt
					johnstown and now work at{" "}
					<Link to="/contact" {...stylex.props(styles.answerLink)}>
						coreweave
					</Link>
					. outside of work i go on walks and take pictures, which scales better
					than most hobbies.
				</>
			),
		},
		{
			q: "what do you actually do all day?",
			a: (
				<>
					keep accelerators happy in giant data centers, mostly. the{" "}
					<Link to="/projects" {...stylex.props(styles.answerLink)}>
						code i write for fun
					</Link>{" "}
					tends to be stranger than the code i write for money.
				</>
			),
		},
		{
			q: "i heard something about parking tickets?",
			a: (
				<>
					correct. one large fine turned into a polite, rate-limited, fully
					legal scrape of every parking ticket pittsburgh has on file. the{" "}
					<Link to="/lab" {...stylex.props(styles.answerLink)}>
						writeup is here
					</Link>
					, and there's a live map of the data attached to it.
				</>
			),
		},
		{
			q: "dogs or cats?",
			a: <>dogs. it's in writing on the about page, so it's law now.</>,
		},
		{
			q: "can i contact you?",
			a: (
				<>
					please do.{" "}
					<Link to="/contact" {...stylex.props(styles.answerLink)}>
						email and discord both land here
					</Link>
					. i like hearing from people who found this place by accident.
				</>
			),
		},
	];
}

const styles = stylex.create({
	page: {
		minHeight: "100vh",
		backgroundColor: BG,
		color: FG,
		fontFamily: "'Archivo Variable', system-ui, sans-serif",
		padding: 24,
	},
	sheet: {
		maxWidth: "44rem",
		marginInline: "auto",
	},
	masthead: {
		display: "flex",
		justifyContent: "space-between",
		paddingBlock: 16,
		fontSize: "0.85rem",
		color: MUTED,
	},
	title: {
		fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
		fontWeight: 800,
		fontVariationSettings: "'wdth' 120",
		letterSpacing: "-0.03em",
		lineHeight: 1.05,
		paddingBlock: 48,
	},
	titleAccent: { color: CORAL },
	details: {
		borderTop: `1px solid ${RULE}`,
		paddingBlock: 20,
	},
	detailsLast: {
		borderBottom: `1px solid ${RULE}`,
	},
	summary: {
		cursor: "pointer",
		fontSize: "1.5rem",
		fontWeight: 700,
		lineHeight: 1.25,
		display: "flex",
		alignItems: "baseline",
		gap: 12,
	},
	summaryMark: {
		color: CORAL,
		fontSize: "1.125rem",
	},
	answer: {
		paddingTop: 16,
		paddingLeft: 28,
		fontSize: "1.05rem",
		lineHeight: 1.7,
		color: MUTED,
	},
	answerLink: {
		color: FG,
		textDecoration: "none",
		borderBottom: `1px solid ${CORAL}`,
	},
	footer: {
		display: "flex",
		justifyContent: "space-between",
		paddingTop: 20,
		fontSize: "0.85rem",
		color: MUTED,
	},
	footerLink: { color: "inherit", textDecoration: "none" },
});

function Faq() {
	const items = buildQA();
	return (
		<div {...stylex.props(styles.page)}>
			<div {...stylex.props(styles.sheet)}>
				<header {...stylex.props(styles.masthead)}>
					<span>damon.systems</span>
					<span>an interview with one guest</span>
				</header>

				<h1 {...stylex.props(styles.title)}>
					asking damon{" "}
					<span {...stylex.props(styles.titleAccent)}>the obvious.</span>
				</h1>

				<main>
					{items.map((item, i) => (
						<details
							key={item.q}
							open={i === 0}
							{...stylex.props(
								styles.details,
								i === items.length - 1 && styles.detailsLast,
							)}
						>
							<summary {...stylex.props(styles.summary)}>
								<span {...stylex.props(styles.summaryMark)}>q{i + 1}</span>
								{item.q}
							</summary>
							<div {...stylex.props(styles.answer)}>{item.a}</div>
						</details>
					))}
				</main>

				<footer {...stylex.props(styles.footer)}>
					<span>© {new Date().getFullYear()} damon</span>
					<Link to="/design" {...stylex.props(styles.footerLink)}>
						← all candidates
					</Link>
				</footer>
			</div>
		</div>
	);
}
