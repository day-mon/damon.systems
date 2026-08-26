import * as stylex from "@stylexjs/stylex";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/design/")({
	head: () => ({ meta: [{ title: "design previews" }] }),
	component: DesignHub,
});

const VARIANTS = [
	{
		to: "/design/index-first",
		name: "A · index-first",
		desc: "mono, dark, the homepage is the directory. phosphor accent, numbered rows.",
	},
	{
		to: "/design/manifesto",
		name: "B · manifesto",
		desc: "giant statement type. three declarations, four destinations. amber on near-black.",
	},
	{
		to: "/design/letter",
		name: "C · letter",
		desc: "serif note on warm paper. links woven into prose instead of a nav.",
	},
	{
		to: "/design/bento",
		name: "D · bento grid",
		desc: "playful tiles of unequal size: intro, writeup, demo, code, a fun fact.",
	},
	{
		to: "/design/ecosystem",
		name: "E · ecosystem",
		desc: "three-column data surfaces: featured dispatch, browse, elsewhere.",
	},
	{
		to: "/design/faq",
		name: "F · conversational faq",
		desc: "the site interviews itself. bold questions, honest answers.",
	},
	{
		to: "/design/marquee",
		name: "G · marquee hero",
		desc: "your name at 16rem, outlined. the whole viewport is the intro.",
	},
	{
		to: "/design/split",
		name: "H · split studio",
		desc: "text vs proof diptychs: real code, real stats, alternating columns.",
	},
];

const styles = stylex.create({
	wrap: {
		paddingTop: 48,
		paddingInline: 32,
		maxWidth: "48rem",
		marginInline: "auto",
		paddingBottom: 96,
	},
	h1: { fontSize: "1.75rem", fontWeight: 500, marginBottom: 8 },
	hint: { color: "var(--muted-foreground)", marginBottom: 40 },
	list: { display: "flex", flexDirection: "column", gap: 16 },
	card: {
		display: "block",
		padding: 24,
		border: "1px solid var(--border)",
		borderRadius: 8,
		textDecoration: "none",
		color: "inherit",
		transitionProperty: "background-color",
		transitionDuration: "0.15s",
	},
	name: { fontSize: "1.125rem", fontWeight: 600, marginBottom: 4 },
	desc: { color: "var(--muted-foreground)", fontSize: "0.9rem" },
});

function DesignHub() {
	return (
		<main {...stylex.props(styles.wrap)}>
			<h1 {...stylex.props(styles.h1)}>pick a direction</h1>
			<p {...stylex.props(styles.hint)}>
				eight candidates, six different page anatomies. winner gets ported
				across every route; losers get deleted.
			</p>
			<div {...stylex.props(styles.list)}>
				{VARIANTS.map((v) => (
					<Link key={v.to} to={v.to} {...stylex.props(styles.card)}>
						<p {...stylex.props(styles.name)}>{v.name} →</p>
						<p {...stylex.props(styles.desc)}>{v.desc}</p>
					</Link>
				))}
			</div>
		</main>
	);
}
