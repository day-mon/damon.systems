/* Hallmark · macrostructure: Index-First · theme: custom dark terminal (mono · phosphor accent) · scope: home preview
 * pre-emit critique: P4 H5 E4 S5 R4 V5
 */
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";

import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/design/index-first")({
	head: () => ({ meta: [{ title: "design · index-first" }] }),
	component: IndexFirst,
});

const BG = "oklch(0.16 0.01 260)";
const FG = "oklch(0.92 0.02 260)";
const MUTED = "oklch(0.62 0.02 260)";
const ACCENT = "oklch(0.84 0.16 155)";
const RULE = "oklch(1 0 0 / 8%)";

const ENTRIES = [
	{
		n: "01",
		label: "about",
		to: "/about",
		note: "who i am, fun fact roulette",
	},
	{
		n: "02",
		label: "projects",
		to: "/projects",
		note: "things i build, live from github",
	},
	{
		n: "03",
		label: "lab",
		to: "/lab",
		note: "scraping pittsburgh's parking tickets and what it taught me",
	},
	{
		n: "04",
		label: "contact",
		to: "/contact",
		note: "email, discord, wherever people find me",
	},
] as const;

const styles = stylex.create({
	page: {
		minHeight: "100vh",
		backgroundColor: BG,
		color: FG,
		fontFamily: "'JetBrains Mono', monospace",
		padding: 24,
		display: "flex",
		flexDirection: "column",
		maxWidth: "72rem",
		marginInline: "auto",
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "baseline",
		paddingBottom: 16,
		borderBottom: `1px solid ${RULE}`,
		fontSize: "0.75rem",
		color: MUTED,
		textTransform: "uppercase",
		letterSpacing: "0.1em",
	},
	nickname: {
		color: ACCENT,
		fontWeight: 700,
	},
	title: {
		fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
		fontWeight: 700,
		lineHeight: 0.95,
		letterSpacing: "-0.04em",
		paddingBlock: 48,
	},
	titleMuted: {
		color: MUTED,
	},
	index: {
		flexGrow: 1,
	},
	row: {
		display: "grid",
		gridTemplateColumns: {
			default: "2.5rem 1fr 2rem",
			"@media (min-width: 640px)": "6rem 10rem 1fr 2rem",
		},
		alignItems: "baseline",
		gap: 16,
		paddingBlock: 20,
		borderTop: `1px solid ${RULE}`,
		textDecoration: "none",
		color: "inherit",
		transitionProperty: "background-color",
		transitionDuration: "0.15s",
	},
	rowHover: {
		backgroundColor: "oklch(1 0 0 / 3%)",
	},
	num: {
		color: ACCENT,
		fontSize: "0.875rem",
	},
	rowLabel: {
		fontSize: "1.5rem",
		fontWeight: 700,
		letterSpacing: "-0.02em",
	},
	rowNote: {
		fontSize: "0.75rem",
		color: MUTED,
		display: { default: "none", "@media (min-width: 640px)": "block" },
	},
	arrow: {
		justifySelf: "end",
		opacity: 0,
		transitionProperty: "opacity, background-color",
		transitionDuration: "0.15s",
	},
	arrowVisible: {
		opacity: 1,
		color: ACCENT,
	},
	rowLabelHover: {
		textDecoration: "underline",
		textDecorationColor: ACCENT,
		textUnderlineOffset: 4,
	},
	footer: {
		display: "flex",
		justifyContent: "space-between",
		paddingTop: 16,
		borderTop: `1px solid ${RULE}`,
		fontSize: "0.75rem",
		color: MUTED,
	},
	footerLink: {
		color: "inherit",
		textDecoration: "none",
	},
});

function IndexFirst() {
	const [hovered, setHovered] = useState<number | null>(null);

	return (
		<div {...stylex.props(styles.page)}>
			<header {...stylex.props(styles.header)}>
				<span {...stylex.props(styles.nickname)}>damon.montague</span>
				<span>systems engineer · coreweave</span>
			</header>

			<h1 {...stylex.props(styles.title)}>
				place for things i make{" "}
				<span {...stylex.props(styles.titleMuted)}>and think about</span>
			</h1>

			<nav {...stylex.props(styles.index)} aria-label="site index">
				{ENTRIES.map((e, i) => (
					<Link
						key={e.n}
						to={e.to}
						onMouseEnter={() => setHovered(i)}
						onMouseLeave={() => setHovered(null)}
						{...stylex.props(styles.row, hovered === i && styles.rowHover)}
					>
						<span {...stylex.props(styles.num)}>{e.n}</span>
						<span
							{...stylex.props(
								styles.rowLabel,
								hovered === i && styles.rowLabelHover,
							)}
						>
							{e.label}
						</span>
						<span {...stylex.props(styles.rowNote)}>{e.note}</span>
						<span
							{...stylex.props(
								styles.arrow,
								hovered === i && styles.arrowVisible,
							)}
						>
							→
						</span>
					</Link>
				))}
			</nav>

			<footer {...stylex.props(styles.footer)}>
				<span>© {new Date().getFullYear()}</span>
				<Link to="/" {...stylex.props(styles.footerLink)}>
					← current site
				</Link>
			</footer>
		</div>
	);
}
