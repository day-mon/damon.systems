import * as stylex from "@stylexjs/stylex";
import { createLink, useLocation } from "@tanstack/react-router";
import { m, useReducedMotion } from "motion/react";
import { useState } from "react";

const LINKS = [
	{ label: "about", to: "/about" },
	{ label: "projects", to: "/projects" },
	{ label: "lab", to: "/lab" },
	{ label: "contact", to: "/contact" },
] as const;

const LIFT_PX = -3;
const GROWTH = 1.03;
const FALLOFF = 0.4;

function liftForDistance(distance: number, active: boolean): number {
	if (active) return LIFT_PX;
	return LIFT_PX * FALLOFF ** Math.abs(distance);
}

const MotionLink = createLink(m.a);

const styles = stylex.create({
	wrap: {
		display: "flex",
		gap: 16,
		fontSize: "0.875rem",
		opacity: 0.7,
	},
});

function FooterLinks() {
	const [hovered, setHovered] = useState<number | null>(null);
	const reduceMotion = useReducedMotion();

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: hover-tracking container, not interactive
		<div {...stylex.props(styles.wrap)} onMouseLeave={() => setHovered(null)}>
			{LINKS.map(({ label, to }, i) => (
				<MotionLink
					key={label}
					to={to}
					initial={false}
					animate={
						reduceMotion
							? {}
							: {
									y:
										hovered === null
											? 0
											: liftForDistance(i - (hovered ?? 0), i === hovered),
									scale: hovered === null ? 1 : i === hovered ? GROWTH : 1,
								}
					}
					transition={{
						type: "spring",
						stiffness: hovered === null ? 500 : 300,
						damping: hovered === null ? 30 : 20,
						mass: 0.5,
					}}
					onMouseEnter={() => setHovered(i)}
				>
					{label}
				</MotionLink>
			))}
		</div>
	);
}

const footerStyles = stylex.create({
	footer: {
		position: "fixed",
		bottom: 0,
		left: 0,
		right: 0,
		padding: 16,
		backgroundColor: "Canvas",
	},
	inner: {
		maxWidth: "48rem",
		marginInline: "auto",
	},
});

export function Footer() {
	const { pathname } = useLocation();
	const isHome = pathname === "/" || pathname === "";
	if (isHome) return null;

	return (
		<footer {...stylex.props(footerStyles.footer)}>
			<div {...stylex.props(footerStyles.inner)}>
				<FooterLinks />
			</div>
		</footer>
	);
}
