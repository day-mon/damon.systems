/*
trip route map — maplibre canvas showing a trip's stops as numbered pins
connected by a dashed line (order = array order). `onPick` turns clicks into
"append a stop here", used by the admin editor; the public page leaves it
read-only.
*/

import * as maplibregl from "maplibre-gl";
import MaplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { useEffect, useRef } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

if (typeof window !== "undefined") {
	maplibregl.setWorkerUrl(MaplibreWorkerUrl);
}

export interface StopPoint {
	name: string;
	lat: number;
	lng: number;
}

interface Props {
	stops: StopPoint[];
	/** when set, clicking the map calls back with the pin coords */
	onPick?: (lat: number, lng: number) => void;
	className?: string;
}

const DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";
const SOURCE = "trip-route";

function buildData(stops: StopPoint[]): GeoJSON.FeatureCollection {
	const features: GeoJSON.Feature[] = [];

	if (stops.length > 1) {
		features.push({
			type: "Feature",
			properties: { kind: "line" },
			geometry: {
				type: "LineString",
				coordinates: stops.map((s) => [s.lng, s.lat]),
			},
		});
	}

	for (const [i, s] of stops.entries()) {
		features.push({
			type: "Feature",
			properties: { kind: "stop", i: i + 1, name: s.name },
			geometry: { type: "Point", coordinates: [s.lng, s.lat] },
		});
	}

	return { type: "FeatureCollection", features };
}

export default function TripStopsMap({ stops, onPick, className }: Props) {
	const ref = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const onPickRef = useRef(onPick);
	onPickRef.current = onPick;

	useEffect(() => {
		if (!ref.current || mapRef.current) return;

		const map = new maplibregl.Map({
			container: ref.current,
			style: DARK_STYLE,
			center: [0, 20],
			zoom: 1.2,
			attributionControl: false,
		});

		map.on("load", () => {
			map.addSource(SOURCE, { type: "geojson", data: buildData([]) });

			map.addLayer({
				id: "route-line",
				type: "line",
				source: SOURCE,
				filter: ["==", ["get", "kind"], "line"],
				paint: {
					"line-color": "#71717a",
					"line-width": 1.5,
					"line-dasharray": [3, 3],
				},
			});

			map.addLayer({
				id: "route-stops",
				type: "circle",
				source: SOURCE,
				filter: ["==", ["get", "kind"], "stop"],
				paint: {
					"circle-radius": 9,
					"circle-color": "#27272a",
					"circle-stroke-color": "#e4e4e7",
					"circle-stroke-width": 1.5,
				},
			});

			map.addLayer({
				id: "route-stop-idx",
				type: "symbol",
				source: SOURCE,
				filter: ["==", ["get", "kind"], "stop"],
				layout: {
					"text-field": ["to-string", ["get", "i"]],
					"text-size": 11,
				},
				paint: { "text-color": "#fafafa" },
			});

			map.addLayer({
				id: "route-stop-name",
				type: "symbol",
				source: SOURCE,
				filter: ["==", ["get", "kind"], "stop"],
				layout: {
					"text-field": ["get", "name"],
					"text-size": 11,
					"text-offset": [0, -1.6],
				},
				paint: {
					"text-color": "#a1a1aa",
					"text-halo-color": "#09090b",
					"text-halo-width": 1,
				},
			});
		});

		map.on("click", (e) => {
			onPickRef.current?.(e.lngLat.lat, e.lngLat.lng);
		});

		mapRef.current = map;

		return () => {
			mapRef.current = null;
			map.remove();
		};
	}, []);

	useEffect(() => {
		const map = mapRef.current;

		if (!map) return;

		const sync = () => {
			const source = map.getSource<maplibregl.GeoJSONSource>(SOURCE);

			if (!source) return;

			const data = buildData(stops);
			source.setData(data);

			if (stops.length === 0) return;

			if (stops.length === 1) {
				const s = stops[0];

				if (map.getZoom() < 1.5)
					map.jumpTo({ center: [s.lng, s.lat], zoom: 5 });

				return;
			}

			const bounds = new maplibregl.LngLatBounds();

			for (const s of stops) bounds.extend([s.lng, s.lat]);

			map.fitBounds(bounds, { padding: 56, maxZoom: 8, duration: 250 });
		};

		if (map.isStyleLoaded()) sync();
		else map.once("styledata", sync);
	}, [stops]);

	return <div ref={ref} className={className ?? "h-52 w-full"} />;
}
