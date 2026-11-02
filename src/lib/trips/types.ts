/*
trip data lives on backblaze b2: travel/<slug>/{meta.json, *.jpg|webp|heic?}
meta.json is hand-authored per trip; photos are whatever lands in the folder
via scripts/travel-upload.ts. keeping the schema deliberately dumb.
*/

import { z } from "zod";

export const TripStopSchema = z.object({
	name: z.string().min(1),
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
});

export type TripStop = z.infer<typeof TripStopSchema>;

const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const CurrentMeta = z.object({
	name: z.string().min(1),
	place: z.string().min(1),
	dates: z.tuple([DateString, DateString]),
	rating: z.number().min(0).max(5),
	stops: z.array(TripStopSchema).min(1),
	blurb: z.string().min(1),
});

/* legacy metas pinned one lat/lng at the root — the union discriminates on stops */
const LegacyMeta = CurrentMeta.omit({ stops: true }).extend({
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
});

export const TripMetaSchema = z.union([CurrentMeta, LegacyMeta]).transform((m) =>
	"stops" in m
		? m
		: {
				name: m.name,
				place: m.place,
				dates: m.dates,
				rating: m.rating,
				blurb: m.blurb,
				stops: [{ name: m.place, lat: m.lat, lng: m.lng }],
			},
);

export type TripMeta = z.infer<typeof TripMetaSchema>;

/** geographic middle of the route — for globe focus / copy fallbacks */
export function tripCenter(stops: TripStop[]): [number, number] {
	const n = Math.max(1, stops.length);
	const lat = stops.reduce((s, t) => s + t.lat, 0) / n;
	const lng = stops.reduce((s, t) => s + t.lng, 0) / n;

	return [lat, lng];
}

export interface TripPhoto {
	/** original full-res */
	full: string;
	/** 2048w webp */
	large: string;
	/** 800w webp */
	thumb: string;
}

export interface Trip extends TripMeta {
	slug: string;
	photos: TripPhoto[];
}

const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

export function formatTripDates([a, b]: [string, string]): string {
	// new Date("YYYY-MM-DD") is UTC midnight and slips back a day in the west
	const [ya, ma] = a.split("-").map(Number);
	const [yb, mb] = b.split("-").map(Number);

	return `${MONTHS[ma - 1]} ${ya}${yb !== ya ? ` – ${MONTHS[mb - 1]} ${yb}` : ""}`;
}

export function formatCoords(lat: number, lng: number): string {
	const ns = lat >= 0 ? "N" : "S";
	const ew = lng >= 0 ? "E" : "W";

	return `${Math.abs(lat).toFixed(2)}° ${ns}, ${Math.abs(lng).toFixed(2)}° ${ew}`;
}

export const TRAVEL_BASE = "https://damon-travel.s3.us-east-005.backblazeb2.com";

/** public url of a trip's generated share card (refreshed on every save) */
export function ogImageFor(slug: string, fallback?: string): string {
	return `${TRAVEL_BASE}/travel/${encodeURIComponent(slug)}/og.png${fallback ? "?v=" : ""}${fallback ?? ""}`;
}

export function clampRating(rating: number): number {
	return Math.min(5, Math.max(0, rating));
}
