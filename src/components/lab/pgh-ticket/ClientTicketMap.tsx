import * as stylex from "@stylexjs/stylex";
import { lazy, Suspense, useEffect, useState } from "react";

import type { TicketPoint } from "#/lib/pgh-ticket/types";

const LazyTicketMap = lazy(() =>
	import("./TicketMap").then((m) => ({ default: m.TicketMap })),
);

const fallbackStyles = stylex.create({
	box: {
		height: 500,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
		backgroundColor: "var(--accent)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
	},
});

function Fallback() {
	return (
		<div {...stylex.props(fallbackStyles.box)}>
			<span {...stylex.props(fallbackStyles.label)}>loading map…</span>
		</div>
	);
}

/** Loads leaflet only in the browser; it is not SSR-safe. */
export function ClientTicketMap({ points }: { points: TicketPoint[] }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return <Fallback />;
	}
	return (
		<Suspense fallback={<Fallback />}>
			<LazyTicketMap points={points} />
		</Suspense>
	);
}
