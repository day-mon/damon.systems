/*
coord picker — small maplibre map; click drops/moves the pin and reports
lat/lng up. shares the ticket map's openfreemap-dark style.
*/

import * as maplibregl from "maplibre-gl";
import MaplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { useEffect, useRef } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

if (typeof window !== "undefined") {
	maplibregl.setWorkerUrl(MaplibreWorkerUrl);
}

interface Props {
	lat: string;
	lng: string;
	onPick: (lat: number, lng: number) => void;
}

const DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";

export default function CoordPicker({ lat, lng, onPick }: Props) {
	const ref = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const markerRef = useRef<maplibregl.Marker | null>(null);
	const onPickRef = useRef(onPick);
	onPickRef.current = onPick;

	useEffect(() => {
		if (!ref.current || mapRef.current) return;

		const map = new maplibregl.Map({
			container: ref.current,
			style: DARK_STYLE,
			center: [0, 30],
			zoom: 1.4,
			attributionControl: false,
		});

		map.on("click", (e) => {
			const { lat: la, lng: lo } = e.lngLat;
			const m = markerRef.current;

			if (m) m.setLngLat([lo, la]);
			else markerRef.current = new maplibregl.Marker().setLngLat([lo, la]).addTo(map);

			onPickRef.current(la, lo);
		});

		mapRef.current = map;

		return () => {
			mapRef.current = null;
			markerRef.current = null;
			map.remove();
		};
	}, []);

	// reflect external lat/lng (edit mode) once it changes into a valid pair
	useEffect(() => {
		const la = Number(lat);
		const lo = Number(lng);

		if (!Number.isFinite(la) || !Number.isFinite(lo) || (la === 0 && lo === 0)) return;

		const m = markerRef.current;
		const map = mapRef.current;

		if (!map) return;

		if (m) m.setLngLat([lo, la]);
		else markerRef.current = new maplibregl.Marker().setLngLat([lo, la]).addTo(map);

		// only jump the view when it's still at the idle world view
		if (map.getZoom() < 1.5) {
			map.jumpTo({ center: [lo, la], zoom: 4 });
		}
	}, [lat, lng]);

	return (
		<div
			ref={ref}
			className="h-52 w-full overflow-hidden rounded-lg border border-border"
			data-testid="coord-picker"
		/>
	);
}
