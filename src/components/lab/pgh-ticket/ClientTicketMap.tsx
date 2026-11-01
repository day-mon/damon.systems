import { lazy, Suspense, useEffect, useState } from "react";

import type { TicketPoint } from "#/lib/pgh-ticket/types";

const LazyTicketMap = lazy(() =>
	import("./TicketMap").then((m) => ({ default: m.TicketMap })),
);

function Fallback() {
	return (
		<div className="flex h-[500px] items-center justify-center border border-border bg-accent">
			<span className="text-xs text-muted-foreground">loading map…</span>
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
