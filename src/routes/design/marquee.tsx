/* Hallmark · macrostructure: Marquee Hero · theme: custom void dark (colossal name hero · electric indigo) · scope: home preview
 * pre-emit critique: P5 H5 E4 S4 R4 V5
 */
import "@fontsource-variable/archivo/standard.css";

import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/design/marquee")({
	head: () => ({ meta: [{ title: "design · marquee" }] }),
	component: Marquee,
});

const BG = "oklch(0.1 0.02 285)";
const FG = "oklch(0.95 0 0)";
const MUTED = "oklch(0.62 0.03 285)";
const INDIGO = "oklch(0.75 0.18 285)";

const LINKS = [
	{ to: "/about", label: "about", hint: "the person" },
	{ to: "/projects", label: "projects", hint: "the code" },
	{ to: "/lab", label: "lab", hint: "the writeups" },
	{ to: "/contact", label: "contact", hint: "the inbox" },
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
	hero: {
		flexGrow: 1,
		minHeight: "100vh",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		paddingInline: { default: 16, "@media (min-width: 768px)": 48 },
	},
	kicker: {
		fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
		color: INDIGO,
		letterSpacing: "0.2em",
		textTransform: "uppercase",
		marginBottom: 8,
	},
	name: {
		margin: 0,
		fontWeight: 900,
		fontVariationSettings: "'wdth' 130",
		lineHeight: 0.88,
		letterSpacing: "-0.035em",
		fontSize: "clamp(4rem, 17vw, 16rem)",
	},
	namePart: { display: "block" },
	nameGhost: {
		display: "block",
		color: "transparent",
		WebkitTextStroke: `1px ${FG}`,
	},
	heroSub: {
		marginTop: 32,
		display: "flex",
		flexWrap: "wrap",
		gap: 24,
		fontSize: "clamp(0.95rem, 2.5vw, 1.35rem)",
		color: MUTED,
		maxWidth: "48rem",
		lineHeight: 1.5,
	},
	scrollHint: {
		padding: 24,
		textAlign: "center",
		color: MUTED,
		fontSize: "0.8rem",
		letterSpacing: "0.25em",
		textTransform: "uppercase",
	},
	index: {
		paddingInline: { default: 24, "@media (min-width: 768px)": 48 },
		paddingBottom: 64,
		display: "grid",
		gridTemplateColumns: { default: "1fr 1fr" },
		gap: 48,
		maxWidth: "70rem",
	},
	idxLink: {
		textDecoration: "none",
		color: FG,
		display: "block",
		borderTop: `2px solid ${FG}`,
		paddingTop: 16,
	},
	idxLabel: {
		display: "block",
		fontSize: "clamp(2rem, 6vw, 3.5rem)",
		fontWeight: 800,
		letterSpacing: "-0.02em",
		lineHeight: 1,
	},
	idxHint: {
		display: "block",
		color: MUTED,
		marginTop: 8,
		fontSize: "0.95rem",
	},
	footer: {
		paddingInline: { default: 24, "@media (min-width: 768px)": 48 },
		paddingBlock: 24,
		display: "flex",
		justifyContent: "space-between",
		color: MUTED,
		fontSize: "0.8rem",
	},
	footerLink: { color: "inherit", textDecoration: "none" },
});

function Marquee() {
	return (
		<div {...stylex.props(styles.page)}>
			<header {...stylex.props(styles.hero)}>
				<p {...stylex.props(styles.kicker)}>a personal website, allegedly</p>
				<h1 {...stylex.props(styles.name)}>
					<span {...stylex.props(styles.namePart)}>damon</span>
					<span {...stylex.props(styles.nameGhost)}>montague</span>
				</h1>
				<p {...stylex.props(styles.heroSub)}>
					<span>software engineer at coreweave.</span>
					<span>parking ticket sovereign citizen (of postgres).</span>
					<span>hiker on weekends, scraper by night.</span>
				</p>
			</header>

			<p {...stylex.props(styles.scrollHint)}>↓ enter</p>

			<nav {...stylex.props(styles.index)} aria-label="destinations">
				{LINKS.map((l) => (
					<Link key={l.to} to={l.to} {...stylex.props(styles.idxLink)}>
						<span {...stylex.props(styles.idxLabel)}>{l.label}</span>
						<span {...stylex.props(styles.idxHint)}>{l.hint}</span>
					</Link>
				))}
			</nav>

			<footer {...stylex.props(styles.footer)}>
				<span>© {new Date().getFullYear()}</span>
				<Link to="/design" {...stylex.props(styles.footerLink)}>
					← all candidates
				</Link>
			</footer>
		</div>
	);
}
