/*
TripsService - domain layer over TripsRepo.

merges committed json manifests with db rows (db wins on slug collision),
maps rows into the serializable Trip shape routes render, and guards the
write path with ADMIN_TOKEN. the createServerFn exports at the bottom are
the http surface - module-level so tanstack start can register them -
delegating to the TripsService singleton.
*/

import { createServerFn } from "@tanstack/react-start";

import { getTrip, TRIPS, type Trip } from "#/content/trips";
import type { TravelTripsRow } from "#/lib/db/schema";
import { tripsRepo } from "#/lib/trips/trips.repo";

const SLUG_RE = /^[a-z0-9-]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface SaveTripInput {
	token: string;
	slug: string;
	title: string;
	location: string;
	start: string;
	end: string;
	blurb: string;
	sharedAlbumUrl: string;
}

export interface SaveResult {
	ok: boolean;
	error?: string;
}

function rowToTrip(row: TravelTripsRow): Trip {
	return {
		slug: row.slug,
		title: row.title,
		location: row.location,
		dateRange: {
			start: row.startDate.slice(0, 10),
			end: row.endDate.slice(0, 10),
		},
		blurb: row.blurb,
		photos: (row.photos ?? []) as Trip["photos"],
		...(row.sharedAlbumUrl ? { sharedAlbumUrl: row.sharedAlbumUrl } : {}),
	};
}

export class TripsService {
	constructor(private repo = tripsRepo) {}

	async listAll(): Promise<Trip[]> {
		let dbTrips: Trip[] = [];
		try {
			dbTrips = (await this.repo.list()).map(rowToTrip);
		} catch (err) {
			// local dev has no PGH_DATABASE_URL - file manifests still work,
			// admin-authored trips just don't appear
			console.warn("[trips] db trips unavailable:", err);
		}
		const bySlug = new Map<string, Trip>();
		for (const trip of TRIPS) bySlug.set(trip.slug, trip);
		for (const trip of dbTrips) bySlug.set(trip.slug, trip);
		return [...bySlug.values()].sort((a, b) =>
			b.dateRange.start.localeCompare(a.dateRange.start),
		);
	}

	async getBySlug(slug: string): Promise<Trip | null> {
		try {
			const row = await this.repo.get(slug);
			if (row) return rowToTrip(row);
		} catch (err) {
			console.warn("[trips] db lookup failed:", err);
		}
		return getTrip(slug) ?? null;
	}

	private validate(raw: SaveTripInput): string | null {
		if (!process.env.ADMIN_TOKEN) return "ADMIN_TOKEN is not set on the server";
		if (raw.token !== process.env.ADMIN_TOKEN) return "wrong admin token";
		if (!raw.slug || !SLUG_RE.test(raw.slug)) {
			return "slug: lowercase letters, numbers, dashes only";
		}
		if (!raw.title) return "title is required";
		if (!raw.location) return "location is required";
		if (!DATE_RE.test(raw.start) || !DATE_RE.test(raw.end)) {
			return "dates must be YYYY-MM-DD";
		}
		if (raw.sharedAlbumUrl && !/^https:\/\/[^\s]+$/.test(raw.sharedAlbumUrl)) {
			return "album url must be an https url";
		}
		return null;
	}

	async saveTrip(input: SaveTripInput): Promise<SaveResult> {
		const error = this.validate(input);
		if (error) return { ok: false, error };
		try {
			await this.repo.upsert({
				slug: input.slug,
				title: input.title,
				location: input.location,
				startDate: input.start,
				endDate: input.end,
				blurb: input.blurb,
				sharedAlbumUrl: input.sharedAlbumUrl || null,
				photos: [],
			});
			return { ok: true };
		} catch (err) {
			console.error("[trips] save failed:", err);
			return { ok: false, error: "database write failed" };
		}
	}

	async deleteTrip(input: {
		token: string;
		slug: string;
	}): Promise<SaveResult> {
		const adminToken = process.env.ADMIN_TOKEN;
		if (!adminToken || input.token !== adminToken) {
			return { ok: false, error: "unauthorized" };
		}
		try {
			await this.repo.delete(input.slug);
			return { ok: true };
		} catch (err) {
			console.error("[trips] delete failed:", err);
			return { ok: false, error: "database delete failed" };
		}
	}
}

export const tripsService = new TripsService();

// --- http surface (server fns must live at module scope) ---------------

export const getTripsServer = createServerFn({ method: "GET" }).handler(() =>
	tripsService.listAll(),
);

export const getTripServer = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data: slug }) => tripsService.getBySlug(slug));

export const saveTrip = createServerFn({ method: "POST" })
	.validator((input: SaveTripInput) => ({
		token: input.token ?? "",
		slug: input.slug?.trim() ?? "",
		title: input.title?.trim() ?? "",
		location: input.location?.trim() ?? "",
		start: input.start ?? "",
		end: input.end ?? "",
		blurb: input.blurb ?? "",
		sharedAlbumUrl: input.sharedAlbumUrl?.trim() ?? "",
	}))
	.handler(({ data }) => tripsService.saveTrip(data));

export const deleteTrip = createServerFn({ method: "POST" })
	.validator((input: { token: string; slug: string }) => input)
	.handler(({ data }) => tripsService.deleteTrip(data));
