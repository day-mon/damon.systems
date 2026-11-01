import "maplibre-gl/dist/maplibre-gl.css";

import type { FeatureCollection, GeoJsonProperties, Point } from "geojson";
import * as maplibregl from "maplibre-gl";
import maplibreglWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";

import { useEffect, useRef } from "react";

import type { TicketPoint } from "#/lib/pgh-ticket/types";

const { Map: MlMap, Popup, LngLatBounds } = maplibregl;

type MapLibreMap = InstanceType<typeof MlMap>;

type MapLayerMouseEvent = maplibregl.MapLayerMouseEvent;

/*
dark basemap via openfreemap's public tile service - free, no api key.
carto's dark_all raster endpoint started demanding keys, so the map is a
vector stack now: maplibre + openfreemap dark style + native geojson
clustering (leaflet + markercluster plugin got dropped entirely).
*/

const STATUSES = [
	{ label: "open", color: "#ef4444" },
	{ label: "open in collections", color: "#f97316" },
	{ label: "paid", color: "#22c55e" },
	{ label: "closed", color: "#15803d" },
	{ label: "voided", color: "#a1a1aa" },
	{ label: "dismissed", color: "#eab308" },
	{ label: "suspended", color: "#8b5cf6" },
	{ label: "booted", color: "#ec4899" },
] as const;

function markerColor(status: string): string {
	if (status === "open in collections*") return "#f97316";

	return STATUSES.find((s) => s.label === status)?.color ?? "#a1a1aa";
}

function flattenPairs(ps: readonly (readonly [string, string])[]): string[] {
	return ps.flatMap(([label, color]) => [label, color]);
}

// maplibre match expressions want a flat label/output sequence, not pairs
const POINT_COLOR: unknown[] = [
	"match",
	["get", "status"],
	...flattenPairs([
		...STATUSES.map((s) => [s.label, s.color] as const),
		["open in collections*", "#f97316"] as const,
	]),
	"#a1a1aa",
];

// vite can't statically resolve maplibre's internal
// `new URL("./maplibre-gl-worker.mjs", import.meta.url)` (variable template),
// so the worker never made it into dist - register the real asset url instead.
maplibregl.setWorkerUrl(maplibreglWorkerUrl);

function pickPointProps(props: GeoJsonProperties): TicketPoint {
	const bag: Record<string, string | number | null> =
		// SAFETY: geojson properties bag holds the json values we wrote above
		(props as Record<string, string | number | null> | null) ?? {};

	const text = (key: string) => {
		const v = bag[key];

		return v == null ? "" : String(v);
	};

	return {
		ticket_number: text("ticket_number"),
		location: text("location"),
		issue_date: text("issue_date"),
		status: text("status"),
		violation: text("violation"),
		amount_due: text("amount_due"),
		latitude: 0,
		longitude: 0,
	};
}

function popupNode(p: TicketPoint): HTMLElement {
	const bg = "hsl(0 0% 9%)";
	const fg = "hsl(0 0% 98%)";
	const muted = "hsl(0 0% 64%)";
	const border = "hsl(0 0% 100% / 10%)";
	const color = markerColor(p.status);
	const amount = p.amount_due || "$0";

	const el = document.createElement("div");
	el.style.cssText = `font-family:Inter,sans-serif;font-size:11px;background:${bg};color:${fg};padding:10px 12px;border:1px solid ${border};line-height:1.5;min-width:180px`;
	el.innerHTML = `
		<div style="font-weight:500;font-size:12px;margin-bottom:2px;text-transform:lowercase">${p.violation || "unknown"}</div>
		<div style="color:${muted};font-size:11px">${p.location}</div>
		<div style="color:${muted};font-size:10px;margin-bottom:6px">${p.issue_date}</div>
		<div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid ${border}">
			<span style="font-weight:500;color:${color}">${amount}</span>
			<span style="font-size:10px;text-transform:lowercase;padding:1px 6px;background:${color}22;color:${color}">${p.status}</span>
		</div>`;

	return el;
}

export function TicketMap({ points }: { points: TicketPoint[] }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const popupRef = useRef<maplibregl.Popup | null>(null);

	useEffect(() => {
		const container = containerRef.current;

		if (!container) return undefined;

		const map = new MlMap({
			container,
			style: "https://tiles.openfreemap.org/styles/dark",
			attributionControl: {
				compact: true,
				customAttribution:
					'<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
			},
		});

		mapRef.current = map;

		map.on("load", () => {
			const geojson: FeatureCollection = {
				type: "FeatureCollection",
				features: points
					.filter((p) => p.latitude && p.longitude)
					.map((p) => ({
						type: "Feature" as const,
						geometry: {
							type: "Point" as const,
							coordinates: [p.longitude, p.latitude],
						},
						properties: {
							status: p.status,
							violation: p.violation,
							location: p.location,
							issue_date: p.issue_date,
							amount_due: p.amount_due,
						},
					})),
			};

			map.addSource("tickets", {
				type: "geojson",
				data: geojson,
				cluster: true,
				clusterRadius: 40,
				clusterMaxZoom: 14,
			});

			map.addLayer({
				id: "clusters",
				type: "circle",
				source: "tickets",
				filter: ["has", "point_count"],
				paint: {
					"circle-color": "hsl(0 0% 20%)",
					"circle-stroke-color": "hsl(0 0% 100% / 10%)",
					"circle-stroke-width": 2,
					"circle-radius": [
						"step",
						["get", "point_count"],
						15,
						10,
						18,
						100,
						21,
						1000,
						24,
					],
				},
			});

			map.addLayer({
				id: "cluster-count",
				type: "symbol",
				source: "tickets",
				filter: ["has", "point_count"],
				layout: {
					"text-field": [
						"case",
						[">=", ["get", "point_count"], 1000],
						[
							"concat",
							[
								"to-string",
								["round", ["*", ["/", ["get", "point_count"], 1000], 10]],
							],
							"k",
						],
						["get", "point_count_abbreviated"],
					],
					"text-size": 11,
					"text-font": ["Noto Sans Regular"],
				},
				paint: { "text-color": "hsl(0 0% 98%)" },
			});

			map.addLayer({
				id: "points",
				type: "circle",
				source: "tickets",
				filter: ["!", ["has", "point_count"]],
				paint: {
					"circle-radius": 3.5,
					// SAFETY: POINT_COLOR is a standard match expression literal
					// typed loosely by maplibre's deep ExpressionSpecification union.
					"circle-color": POINT_COLOR as never,
					"circle-opacity": 0.55,
				},
			});

			map.on("click", "points", (e: MapLayerMouseEvent) => {
				const f = e.features?.[0];

				if (!f) return;

				// SAFETY: the points layer only contains Point features written above.
				const geom = f.geometry as Point;

				const coords: [number, number] = [
					geom.coordinates[0],
					geom.coordinates[1],
				];

				popupRef.current?.remove();
				popupRef.current = new Popup({
					closeButton: false,
					offset: 12,
					maxWidth: "260px",
				})
					.setLngLat(coords)
					.setDOMContent(popupNode(pickPointProps(f.properties)))
					.addTo(map);
			});

			map.on("mouseenter", "points", () => {
				map.getCanvas().style.cursor = "pointer";
			});
			map.on("mouseleave", "points", () => {
				map.getCanvas().style.cursor = "";
			});

			// fit once to data bounds
			const filtered = points.filter((p) => p.latitude && p.longitude);

			if (filtered.length > 0) {
				const bounds = new LngLatBounds();

				for (const p of filtered) bounds.extend([p.longitude, p.latitude]);

				map.fitBounds(bounds, { padding: 40, maxZoom: 15, duration: 0 });
			}
		});

		return () => {
			popupRef.current?.remove();
			map.remove();
			mapRef.current = null;
		};
		// the source of rows is immutable once loaded; refit/re-source on new points
		// would fight maplibre's cluster state for no visual gain.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div style={{ border: "1px solid var(--border)", position: "relative" }}>
			<div ref={containerRef} style={{ height: 500, width: "100%" }} />
			<div
				style={{
					position: "absolute",
					right: 8,
					bottom: 24,
					background: "hsl(0 0% 9%)",
					border: "1px solid hsl(0 0% 100% / 10%)",
					padding: "8px 10px",
					fontFamily: "Inter, sans-serif",
					fontSize: 11,
					color: "hsl(0 0% 64%)",
					lineHeight: 1.6,
					pointerEvents: "none",
					zIndex: 5,
				}}
			>
				{STATUSES.map((s) => (
					<div
						key={s.label}
						style={{ display: "flex", alignItems: "center", gap: 6 }}
					>
						<span
							style={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								background: s.color,
								flexShrink: 0,
								display: "inline-block",
							}}
						/>
						<span>{s.label}</span>
					</div>
				))}
			</div>
		</div>
	);
}
