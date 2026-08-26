/* Hallmark · macrostructure: Split Studio · theme: custom light studio (serif text vs mono proof diptych · rust accent) · scope: home preview
 * text alternates with real artifacts: live fun-fact, the actual recaptcha bypass from the lab post, the repo index.
 * pre-emit critique: P4 H5 E5 S5 R5 V4
 */
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/500.css";
import "@fontsource/newsreader/600.css";

import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/design/split")({
	head: () => ({ meta: [{ title: "design · split studio" }] }),
	component: Split,
});

const PAPER = "oklch(0.97 0.008 80)";
const INK = "oklch(0.25 0.01 60)";
const SOFT = "oklch(0.5 0.01 60)";
const RUST = "oklch(0.6 0.15 40)";
const RULE = "oklch(0 0 0 / 10%)";

const CODE_SNIPPET = `def _token() -> str:
    chars = string.ascii_letters + string.digits + "-_"
    return "03AFcWeA" + "".join(
        secrets.choice(chars) for _ in range(120)
    )`;

const styles = stylex.create({
	page: {
		minHeight: "100vh",
		backgroundColor: PAPER,
		color: INK,
		colorScheme: "light",
		fontFamily: "'Newsreader', Georgia, serif",
	},
	studioBar: {
		display: "flex",
		justifyContent: "space-between",
		paddingInline: 32,
		paddingBlock: 20,
		borderBottom: `1px solid ${RULE}`,
		fontSize: "0.85rem",
		color: SOFT,
	},
	pair: {
		display: "grid",
		gridTemplateColumns: {
			default: "1fr",
			"@media (min-width: 900px)": "1fr 1fr",
		},
		borderBottom: `1px solid ${RULE}`,
		minHeight: { default: null, "@media (min-width: 900px)": "60vh" },
	},
	textSide: {
		padding: 48,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
	},
	textSideReverse: {
		order: { default: 1, "@media (min-width: 900px)": 2 },
	},
	proofSide: {
		padding: 48,
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		backgroundColor: INK,
		color: PAPER,
		order: { default: 2, "@media (min-width: 900px)": 1 },
	},
	proofSideReverse: {
		order: { default: 2 },
		backgroundColor: "oklch(0.93 0.012 80)",
		color: INK,
	},
	num: {
		fontSize: "0.8rem",
		color: RUST,
		letterSpacing: "0.2em",
		marginBottom: 16,
		fontFamily: "'JetBrains Mono', monospace",
	},
	h2: {
		fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
		fontWeight: 600,
		lineHeight: 1.15,
		marginBottom: 16,
	},
	body: {
		fontSize: "1.05rem",
		lineHeight: 1.7,
		color: SOFT,
		maxWidth: "30rem",
	},
	cta: {
		marginTop: 24,
		display: "inline-block",
		color: INK,
		fontWeight: 600,
		textDecoration: "none",
		borderBottom: `2px solid ${RUST}`,
		width: "fit-content",
	},
	stat: {
		fontFamily: "'JetBrains Mono', monospace",
		fontSize: "clamp(2.5rem, 5vw, 4rem)",
		fontWeight: 400,
		lineHeight: 1.1,
	},
	statLabel: {
		fontFamily: "'JetBrains Mono', monospace",
		fontSize: "0.75rem",
		opacity: 0.6,
		letterSpacing: "0.15em",
		textTransform: "uppercase",
		marginTop: 8,
	},
	pre: {
		fontSize: "clamp(0.7rem, 1.5vw, 0.95rem)",
		lineHeight: 1.7,
		overflowX: "auto",
		fontFamily: "'JetBrains Mono', monospace",
	},
	preCaption: {
		fontFamily: "'JetBrains Mono', monospace",
		fontSize: "0.75rem",
		opacity: 0.6,
		marginBottom: 16,
		letterSpacing: "0.1em",
	},
	repoList: {
		fontFamily: "'JetBrains Mono', monospace",
		fontSize: "0.9rem",
		display: "flex",
		flexDirection: "column",
		gap: 20,
	},
	repo: {
		display: "flex",
		justifyContent: "space-between",
		borderBottom: `1px solid ${RULE}`,
		paddingBottom: 12,
	},
	repoName: { fontWeight: 400 },
	repoMeta: { color: SOFT, fontSize: "0.75rem" },
	footer: {
		display: "flex",
		justifyContent: "space-between",
		paddingInline: 32,
		paddingBlock: 20,
		fontSize: "0.85rem",
		color: SOFT,
	},
	footerLink: { color: "inherit", textDecoration: "none" },
});

function PairOne() {
	return (
		<section {...stylex.props(styles.pair)}>
			<div {...stylex.props(styles.textSide)}>
				<p {...stylex.props(styles.num)}>01 — who</p>
				<h2 {...stylex.props(styles.h2)}>
					damon montague, software engineer, keeps gpus warm at coreweave.
				</h2>
				<p {...stylex.props(styles.body)}>
					pitt johnstown grad. hikes as often as possible, photographs
					everything, maintains exactly one dangerous pipeline.
				</p>
				<Link to="/about" {...stylex.props(styles.cta)}>
					the long version →
				</Link>
			</div>
			<div {...stylex.props(styles.proofSide, styles.proofSideReverse)}>
				<p {...stylex.props(styles.stat)}>10×</p>
				<p {...stylex.props(styles.statLabel)}>
					times i have been to universal in florida. no regrets.
				</p>
			</div>
		</section>
	);
}

function PairTwo() {
	return (
		<section {...stylex.props(styles.pair)}>
			<div {...stylex.props(styles.proofSide)}>
				<p {...stylex.props(styles.preCaption)}>
					actual source — recaptcha being politely ignored
				</p>
				<pre {...stylex.props(styles.pre)}>{CODE_SNIPPET}</pre>
			</div>
			<div {...stylex.props(styles.textSide, styles.textSideReverse)}>
				<p {...stylex.props(styles.num)}>02 — the scrape</p>
				<h2 {...stylex.props(styles.h2)}>
					pittsburgh's parking tickets, the whole lot, legal.
				</h2>
				<p {...stylex.props(styles.body)}>
					a four-digit fine became a rate-limited, exception-grouped, resumable
					pipeline. sequential ids did most of the work.
				</p>
				<Link to="/lab" {...stylex.props(styles.cta)}>
					full writeup + live map →
				</Link>
			</div>
		</section>
	);
}

function PairThree() {
	return (
		<section {...stylex.props(styles.pair)}>
			<div {...stylex.props(styles.textSide)}>
				<p {...stylex.props(styles.num)}>03 — the rest</p>
				<h2 {...stylex.props(styles.h2)}>nineteen repos and counting.</h2>
				<p {...stylex.props(styles.body)}>
					everything i build ends up on github eventually. typescript mostly,
					unhinged python when scraping.
				</p>
				<Link to="/projects" {...stylex.props(styles.cta)}>
					browse the index →
				</Link>
			</div>
			<div {...stylex.props(styles.proofSide, styles.proofSideReverse)}>
				<div {...stylex.props(styles.repoList)}>
					<div {...stylex.props(styles.repo)}>
						<span {...stylex.props(styles.repoName)}>damon.systems</span>
						<span {...stylex.props(styles.repoMeta)}>this site</span>
					</div>
					<div {...stylex.props(styles.repo)}>
						<span {...stylex.props(styles.repoName)}>pgh-ticket</span>
						<span {...stylex.props(styles.repoMeta)}>the pipeline</span>
					</div>
					<div {...stylex.props(styles.repo)}>
						<span {...stylex.props(styles.repoMeta)}>
							github.com/damon-montague
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

function Split() {
	return (
		<div {...stylex.props(styles.page)}>
			<header {...stylex.props(styles.studioBar)}>
				<span>studio montague — est. 2001, pennsylvania</span>
				<span>text on one side, proof on the other</span>
			</header>

			<main>
				<PairOne />
				<PairTwo />
				<PairThree />
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
