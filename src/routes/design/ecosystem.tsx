/* Hallmark · macrostructure: Ecosystem Index · theme: custom utilitarian dark (mono data surfaces · crimson accent) · scope: home preview
 * pre-emit critique: P4 H5 E5 S5 R5 V5
 */
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";

import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/design/ecosystem")({
	head: () => ({ meta: [{ title: "design · ecosystem" }] }),
	component: Ecosystem,
});

const BG = "oklch(0.17 0.01 250)";
const FG = "oklch(0.9 0.01 250)";
const MUTED = "oklch(0.6 0.015 250)";
const ACCENT = "oklch(0.7 0.19 25)";
const ACCENT_SOFT = "oklch(0.7 0.19 25 / 15%)";
const RULE = "oklch(1 0 0 / 8%)";

const styles = stylex.create({
	page: {
		minHeight: "100vh",
		backgroundColor: BG,
		color: FG,
		fontFamily: "'JetBrains Mono', monospace",
		fontSize: "0.85rem",
		lineHeight: 1.6,
	},
	masthead: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "baseline",
		paddingInline: 24,
		paddingBlock: 20,
		borderBottom: `1px solid ${RULE}`,
	},
	brand: {
		fontWeight: 700,
		fontSize: "1rem",
		letterSpacing: "-0.02em",
	},
	brandDot: { color: ACCENT },
	mastheadRight: {
		color: MUTED,
		fontSize: "0.75rem",
	},
	columns: {
		display: "grid",
		gridTemplateColumns: {
			default: "1fr",
			"@media (min-width: 920px)": "1.4fr 1fr 1fr",
		},
		maxWidth: "76rem",
		marginInline: "auto",
	},
	column: {
		padding: 24,
		borderRight: {
			default: null,
			"@media (min-width: 920px)": `1px solid ${RULE}`,
		},
		borderBottom: {
			default: `1px solid ${RULE}`,
			"@media (min-width: 920px)": null,
		},
	},
	columnLast: {
		borderRight: null,
	},
	colHead: {
		fontSize: "0.7rem",
		textTransform: "uppercase",
		letterSpacing: "0.14em",
		color: MUTED,
		marginBottom: 20,
		display: "flex",
		justifyContent: "space-between",
	},
	colHeadCount: { color: ACCENT },
	newsTitle: {
		fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
		fontWeight: 700,
		lineHeight: 1.15,
		letterSpacing: "-0.03em",
		marginBottom: 16,
	},
	newsLink: { color: FG, textDecoration: "none" },
	excerpt: { color: MUTED, marginBottom: 20, maxWidth: "36rem" },
	byline: {
		fontSize: "0.75rem",
		color: MUTED,
		display: "flex",
		gap: 16,
	},
	bylineAccent: { color: ACCENT },
	row: {
		display: "block",
		paddingBlock: 12,
		borderBottom: `1px solid ${RULE}`,
		textDecoration: "none",
		color: "inherit",
		transitionProperty: "background-color",
		transitionDuration: "0.1s",
	},
	rowTitle: { fontWeight: 700, display: "block" },
	rowMeta: { color: MUTED, fontSize: "0.75rem" },
	pill: {
		display: "inline-block",
		backgroundColor: ACCENT_SOFT,
		color: ACCENT,
		borderRadius: 999,
		paddingInline: 10,
		paddingBlock: 2,
		fontSize: "0.7rem",
		marginRight: 8,
	},
	footer: {
		paddingInline: 24,
		paddingBlock: 16,
		borderTop: `1px solid ${RULE}`,
		color: MUTED,
		display: "flex",
		justifyContent: "space-between",
		fontSize: "0.75rem",
	},
	footerLink: { color: "inherit", textDecoration: "none" },
});

function Ecosystem() {
	return (
		<div {...stylex.props(styles.page)}>
			<header {...stylex.props(styles.masthead)}>
				<span {...stylex.props(styles.brand)}>
					damon<span {...stylex.props(styles.brandDot)}>.</span>systems
				</span>
				<span {...stylex.props(styles.mastheadRight)}>
					personal index · updated continuously
				</span>
			</header>

			<main {...stylex.props(styles.columns)}>
				<section {...stylex.props(styles.column)}>
					<h2 {...stylex.props(styles.colHead)}>
						<span>featured_dispatch</span>
						<span {...stylex.props(styles.colHeadCount)}>01</span>
					</h2>
					<h1 {...stylex.props(styles.newsTitle)}>
						<Link to="/lab" {...stylex.props(styles.newsLink)}>
							how to (legally) scrape all of pittsburgh's parking tickets
						</Link>
					</h1>
					<p {...stylex.props(styles.excerpt)}>
						a four-digit fine, two paragraphs of legal research, postgres as a
						mirror, and one full mirror of a city's enforcement data. the
						writeup covers robots exemption, rate limits, and why sequential ids
						are a gift.
					</p>
					<div {...stylex.props(styles.byline)}>
						<span {...stylex.props(styles.bylineAccent)}>read →</span>
						<span>~30 min</span>
						<span>part 1 of n</span>
					</div>
				</section>

				<section {...stylex.props(styles.column)}>
					<h2 {...stylex.props(styles.colHead)}>
						<span>browse</span>
						<span {...stylex.props(styles.colHeadCount)}>03</span>
					</h2>
					<Link to="/about" {...stylex.props(styles.row)}>
						<span {...stylex.props(styles.rowTitle)}>
							<span {...stylex.props(styles.pill)}>who</span>about
						</span>
						<span {...stylex.props(styles.rowMeta)}>
							the human, the fun facts, the dogs-cats split
						</span>
					</Link>
					<Link to="/projects" {...stylex.props(styles.row)}>
						<span {...stylex.props(styles.rowTitle)}>
							<span {...stylex.props(styles.pill)}>code</span>projects
						</span>
						<span {...stylex.props(styles.rowMeta)}>
							19 repos, live from github, sorted by recent
						</span>
					</Link>
					<Link to="/lab" {...stylex.props(styles.row)}>
						<span {...stylex.props(styles.rowTitle)}>
							<span {...stylex.props(styles.pill)}>essays</span>lab
						</span>
						<span {...stylex.props(styles.rowMeta)}>
							writeups with interactive demos attached
						</span>
					</Link>
				</section>

				<section {...stylex.props(styles.column, styles.columnLast)}>
					<h2 {...stylex.props(styles.colHead)}>
						<span>elsewhere</span>
						<span {...stylex.props(styles.colHeadCount)}>04</span>
					</h2>
					<a
						href="https://github.com/damon-montague"
						target="_blank"
						rel="noreferrer"
						{...stylex.props(styles.row)}
					>
						<span {...stylex.props(styles.rowTitle)}>github ↗</span>
						<span {...stylex.props(styles.rowMeta)}>
							source for everything on this site
						</span>
					</a>
					<Link to="/contact" {...stylex.props(styles.row)}>
						<span {...stylex.props(styles.rowTitle)}>email / discord</span>
						<span {...stylex.props(styles.rowMeta)}>
							hi@damon.systems · discord if you can find me
						</span>
					</Link>
				</section>
			</main>

			<footer {...stylex.props(styles.footer)}>
				<span>© {new Date().getFullYear()} damon</span>
				<Link to="/design" {...stylex.props(styles.footerLink)}>
					← all candidates
				</Link>
			</footer>
		</div>
	);
}
