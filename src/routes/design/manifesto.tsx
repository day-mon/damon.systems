/* Hallmark · macrostructure: Manifesto · theme: custom near-black (expanded display sans · amber accent) · scope: home preview
 * pre-emit critique: P5 H5 E4 S4 R5 V5
 */
import "@fontsource-variable/archivo/standard.css";

import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/design/manifesto")({
	head: () => ({ meta: [{ title: "design · manifesto" }] }),
	component: Manifesto,
});

const BG = "oklch(0.13 0 0)";
const FG = "oklch(0.93 0 0)";
const ACCENT = "oklch(0.82 0.15 75)";
const MUTED = "oklch(0.55 0 0)";
const RULE = "oklch(1 0 0 / 12%)";

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

const LINES = [
	"i keep the gpus warm.",
	"i scraped every parking ticket in pittsburgh.",
	"i go outside sometimes.",
] as const;

const styles = stylex.create({
	page: {
		minHeight: "100vh",
		backgroundColor: BG,
		color: FG,
		fontFamily: "'Archivo Variable', system-ui, sans-serif",
		display: "flex",
		flexDirection: "column",
	},
	topline: {
		display: "flex",
		justifyContent: "space-between",
		paddingInline: 24,
		paddingBlock: 16,
		fontSize: "0.75rem",
		color: MUTED,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		fontVariationSettings: "'wdth' 75",
	},
	hero: {
		flexGrow: 1,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		paddingInline: 24,
		paddingBlock: 48,
		borderTop: `1px solid ${RULE}`,
		borderBottom: `1px solid ${RULE}`,
	},
	line: {
		display: "block",
		margin: 0,
		fontSize: "clamp(2.75rem, 9.5vw, 7.5rem)",
		fontWeight: 800,
		fontVariationSettings: "'wdth' 125",
		lineHeight: 1.02,
		letterSpacing: "-0.02em",
		textWrap: "balance",
	},
	lineAccent: {
		color: ACCENT,
	},
	meta: {
		display: "flex",
		gap: 24,
		paddingInline: 24,
		paddingBlock: 24,
		fontSize: "0.875rem",
		color: MUTED,
	},
	metaName: {
		color: FG,
		fontWeight: 600,
	},
	destinations: {
		display: "flex",
		flexWrap: "wrap",
		gap: 32,
		paddingInline: 24,
		paddingBottom: 40,
	},
	dest: {
		display: "inline-flex",
		alignItems: "baseline",
		gap: 8,
		textDecoration: "none",
		color: FG,
		fontSize: "1.125rem",
		fontWeight: 600,
		borderBottom: `2px solid ${ACCENT}`,
		paddingBottom: 2,
		transitionProperty: "color, border-color",
		transitionDuration: "0.15s",
	},
	destArrow: {
		color: ACCENT,
	},
});

function Manifesto() {
	return (
		<div {...stylex.props(styles.page)}>
			<p {...stylex.props(styles.topline)}>
				<span>damon montague</span>
				<span>{getAge()} · software engineer</span>
			</p>

			<main {...stylex.props(styles.hero)}>
				<h1>
					{LINES.map((text, i) => (
						<span
							key={text}
							{...stylex.props(styles.line, i === 1 && styles.lineAccent)}
						>
							{text}
						</span>
					))}
				</h1>
			</main>

			<div {...stylex.props(styles.meta)}>
				<span>
					<span {...stylex.props(styles.metaName)}>currently:</span> coreweave,
					keeping accelerators angry at scale
				</span>
				<span>
					<span {...stylex.props(styles.metaName)}>previously:</span> pitt
					johnstown, computer science
				</span>
			</div>

			<nav {...stylex.props(styles.destinations)} aria-label="go further">
				<Link to="/lab" {...stylex.props(styles.dest)}>
					read the lab <span {...stylex.props(styles.destArrow)}>↗</span>
				</Link>
				<Link to="/projects" {...stylex.props(styles.dest)}>
					see the work <span {...stylex.props(styles.destArrow)}>↗</span>
				</Link>
				<Link to="/about" {...stylex.props(styles.dest)}>
					know the human <span {...stylex.props(styles.destArrow)}>↗</span>
				</Link>
				<Link to="/contact" {...stylex.props(styles.dest)}>
					say hello <span {...stylex.props(styles.destArrow)}>↗</span>
				</Link>
			</nav>
		</div>
	);
}
