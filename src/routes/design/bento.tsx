/* Hallmark · macrostructure: Bento Grid · theme: custom warm dark (rounded sans cell grid · teal accent) · scope: home preview
 * pre-emit critique: P4 H4 E5 S4 R4 V5
 */
import "@fontsource-variable/archivo/standard.css";

import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/design/bento")({
	head: () => ({ meta: [{ title: "design · bento" }] }),
	component: Bento,
});

const BG = "oklch(0.155 0.008 240)";
const FG = "oklch(0.93 0 0)";
const MUTED = "oklch(0.65 0.01 240)";
const TEAL = "oklch(0.8 0.12 185)";
const CELL = "oklch(0.20 0.01 240)";
const CELL_ALT = "oklch(0.24 0.02 200)";
const RULE = "oklch(1 0 0 / 10%)";

const styles = stylex.create({
	page: {
		minHeight: "100vh",
		backgroundColor: BG,
		color: FG,
		fontFamily: "'Archivo Variable', system-ui, sans-serif",
		padding: { default: 16, "@media (min-width: 768px)": 32 },
	},
	topline: {
		display: "flex",
		justifyContent: "space-between",
		fontSize: "0.8rem",
		color: MUTED,
		marginBottom: 16,
	},
	grid: {
		display: "grid",
		gap: 16,
		gridTemplateColumns: {
			default: "1fr",
			"@media (min-width: 768px)": "1fr 1fr 1fr",
		},
		maxWidth: "68rem",
		marginInline: "auto",
	},
	cell: {
		backgroundColor: CELL,
		borderRadius: 16,
		padding: 24,
		textDecoration: "none",
		color: "inherit",
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-end",
		minHeight: 180,
		transitionProperty: "background-color, transform",
		transitionDuration: "0.2s",
	},
	cellWide: {
		gridColumn: { default: null, "@media (min-width: 768px)": "span 2" },
	},
	cellAlt: {
		backgroundColor: CELL_ALT,
	},
	cellKicker: {
		fontSize: "0.75rem",
		color: TEAL,
		letterSpacing: "0.12em",
		textTransform: "uppercase",
		marginBottom: 8,
	},
	cellTitle: {
		fontSize: "1.75rem",
		fontWeight: 700,
		lineHeight: 1.1,
		letterSpacing: "-0.01em",
		fontVariationSettings: "'wdth' 110",
	},
	cellBig: {
		fontSize: "clamp(2.25rem, 5vw, 3.25rem)",
	},
	cellBody: {
		fontSize: "0.9rem",
		color: MUTED,
		marginTop: 8,
		lineHeight: 1.55,
	},
	fact: {
		fontSize: "1.05rem",
		lineHeight: 1.5,
		fontWeight: 500,
		marginTop: 8,
	},
	footer: {
		display: "flex",
		justifyContent: "space-between",
		maxWidth: "68rem",
		marginInline: "auto",
		paddingBlockStart: 16,
		marginTop: 16,
		borderTop: `1px solid ${RULE}`,
		fontSize: "0.8rem",
		color: MUTED,
	},
	footerLink: { color: "inherit", textDecoration: "none" },
});

function Bento() {
	return (
		<div {...stylex.props(styles.page)}>
			<header {...stylex.props(styles.topline)}>
				<span>damon — homepage, tiled edition</span>
				<span>hover a tile</span>
			</header>

			<main {...stylex.props(styles.grid)}>
				<div {...stylex.props(styles.cell, styles.cellWide)}>
					<p {...stylex.props(styles.cellKicker)}>intro</p>
					<h1 {...stylex.props(styles.cellTitle, styles.cellBig)}>
						damon builds things,
						<br />
						breaks things, documents both.
					</h1>
					<p {...stylex.props(styles.cellBody)}>
						software engineer at coreweave. pitt grad. amateur hiker,
						over-committed scraper operator.
					</p>
				</div>

				<Link to="/lab" {...stylex.props(styles.cell, styles.cellAlt)}>
					<p {...stylex.props(styles.cellKicker)}>featured writeup</p>
					<p {...stylex.props(styles.cellTitle)}>a city's parking tickets →</p>
					<p {...stylex.props(styles.cellBody)}>
						how one four-digit fine became a full scrape of pittsburgh's ticket
						data — legality, rate limits, regex archaeology.
					</p>
				</Link>

				<Link
					to="/lab/$slug"
					params={{ slug: "pgh-ticket" }}
					{...stylex.props(styles.cell)}
				>
					<p {...stylex.props(styles.cellKicker)}>live demo</p>
					<p {...stylex.props(styles.cellTitle)}>map the tickets →</p>
					<p {...stylex.props(styles.cellBody)}>
						the actual database, mapped and filterable. don't judge the skeleton
						loading, judge the density.
					</p>
				</Link>

				<Link to="/projects" {...stylex.props(styles.cell)}>
					<p {...stylex.props(styles.cellKicker)}>code</p>
					<p {...stylex.props(styles.cellTitle)}>things i ship →</p>
					<p {...stylex.props(styles.cellBody)}>
						indexed straight from github. mostly typescript, occasionally
						regrettable bash.
					</p>
				</Link>

				<div {...stylex.props(styles.cell)}>
					<p {...stylex.props(styles.cellKicker)}>fun fact</p>
					<p {...stylex.props(styles.fact)}>
						played divisional paintball for 2 years. been to universal in
						florida 10 times.
					</p>
				</div>

				<div {...stylex.props(styles.cell)}>
					<p {...stylex.props(styles.cellKicker)}>offline</p>
					<p {...stylex.props(styles.cellTitle)}>goes outside</p>
					<p {...stylex.props(styles.cellBody)}>
						walks, hikes, photos of everything in between.
					</p>
				</div>

				<Link to="/contact" {...stylex.props(styles.cell, styles.cellWide)}>
					<p {...stylex.props(styles.cellKicker)}>reach out</p>
					<p {...stylex.props(styles.cellTitle)}>say hello anytime →</p>
					<p {...stylex.props(styles.cellBody)}>
						hi@damon.systems works. discord works too if you guess the handle.
					</p>
				</Link>
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
