/*
trip data lives on backblaze b2: travel/<slug>/{meta.json, *.jpg|webp|heic?}
meta.json is hand-authored per trip; photos are whatever lands in the folder
via scripts/travel-upload.ts. keeping the schema deliberately dumb.
*/

import type { JsonObject } from "./json";

export interface TripMeta {
	name: string;
	place: string;
	dates: [string, string];
	rating: number;
	lat: number;
	lng: number;
	blurb: string;
}

export interface Trip extends TripMeta {
	slug: string;
	photos: string[];
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

/**
 * boundary decoder for meta.json — a predicate so b2 json only becomes
 * TripMeta after every field is proven.
 */
export function isTripMeta(raw: JsonObject): raw is JsonObject & TripMeta {
	return (
		typeof raw.name === "string" &&
		typeof raw.place === "string" &&
		Array.isArray(raw.dates) &&
		raw.dates.length === 2 &&
		typeof raw.dates[0] === "string" &&
		typeof raw.dates[1] === "string" &&
		typeof raw.rating === "number" &&
		typeof raw.lat === "number" &&
		typeof raw.lng === "number" &&
		typeof raw.blurb === "string"
	);
}

export function clampRating(rating: number): number {
	return Math.min(5, Math.max(0, rating));
}
