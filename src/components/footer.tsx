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

function FooterLinks() {
	const [hovered, setHovered] = useState<number | null>(null);
	const reduceMotion = useReducedMotion();

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: hover-tracking container, not interactive
		<div
			className="flex gap-4 text-sm text-muted-foreground"
			onMouseLeave={() => setHovered(null)}
		>
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

export function Footer() {
	const { pathname } = useLocation();
	const isHome = pathname === "/" || pathname === "";

	if (isHome) return null;

	return (
		<footer className="fixed inset-x-0 bottom-0 bg-background p-4">
			<div className="mx-auto max-w-3xl">
				<FooterLinks />
			</div>
		</footer>
	);
}
