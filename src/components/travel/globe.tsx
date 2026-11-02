/*
shared prototype globe. cobe renders the dotted sphere; markers list the
trips. theme-aware monochrome, no brand colors, spins slowly on its own.

markerFocus: lat/lng the globe should slowly rotate toward (hover a trip)
*/

import createGlobe, { type COBEOptions } from "cobe";
import { useEffect, useRef } from "react";

interface GlobeMarker {
	location: [number, number];
}

export function TravelGlobe({
	markers,
	focus,
	size = 260,
	opacity = 0.9,
}: {
	markers: GlobeMarker[];
	/** [lat, lng] for gentle rotate-toward; undefined keeps free spin */
	focus?: [number, number];
	size?: number;
	opacity?: number;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const focusRef = useRef(focus);

	focusRef.current = focus;

	useEffect(() => {
		let currentPhi = 0;
		let currentTheta = 0.3;

		const options: COBEOptions = {
			devicePixelRatio: 2,
			width: size * 2,
			height: size * 2,
			phi: 0,
			theta: 0.3,
			dark: 1,
			diffuse: 1.4,
			mapSamples: 16000,
			mapBrightness: 4,
			baseColor: [0.14, 0.14, 0.16],
			markerColor: [1, 1, 1],
			glowColor: [0.07, 0.07, 0.08],
			markers: markers.map((m) => ({ location: m.location, size: 0.055 })),
		};

		if (!canvasRef.current) return undefined;

		const globe = createGlobe(canvasRef.current, options);

		// cobe v2 dropped onRender: drive phi/theta ourselves with rAF + update()
		let raf = 0;

		const tick = () => {
			if (focusRef.current) {
				const [lat, lng] = focusRef.current;
				const targetPhi = -((lng * Math.PI) / 180);
				const targetTheta = (lat * Math.PI) / 180;

				currentPhi += (targetPhi - currentPhi) * 0.06;
				currentTheta += (targetTheta - currentTheta) * 0.06;
			} else {
				currentPhi += 0.0022;
			}

			globe.update({
				phi: currentPhi,
				theta: Math.max(-0.9, Math.min(0.9, currentTheta)),
			});

			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			globe.destroy();
		};
	}, [markers, size]);

	return (
		<canvas
			ref={canvasRef}
			width={size}
			height={size}
			style={{ width: size, height: size, opacity, pointerEvents: "none" }}
			aria-hidden
		/>
	);
}
