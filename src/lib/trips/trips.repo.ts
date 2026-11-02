/*
trip reads: list folders on b2, parse meta.json files, cache in-process.
b2 is the source of truth; the cache just stops every page load from hitting
the api. ttl keeps edits eventually-visible without a deploy.
*/

import { logger } from "#/lib/logger";

import { b2Configured, fetchJson, listPrefix, publicUrlFor } from "./b2";
import { TripMetaSchema, clampRating, type Trip } from "./types";

const TRAVEL_PREFIX = "travel/";
const TTL_MS = 10 * 60 * 1000;

const PHOTO_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

let cache: { at: number; trips: Trip[] } | null = null;

async function loadAllTrips(): Promise<Trip[]> {
	const { folders } = await listPrefix(TRAVEL_PREFIX);

	const slugs = folders
		.map((f) => f.slice(TRAVEL_PREFIX.length).replace(/\/$/, ""))
		.filter(Boolean);

	const trips: Trip[] = [];

	for (const slug of slugs) {
		try {
			const [metaRaw, photos] = await Promise.all([
				fetchJson(`${TRAVEL_PREFIX}${slug}/meta.json`),
				listPrefix(`${TRAVEL_PREFIX}${slug}/`),
			]);

			const parsed = TripMetaSchema.safeParse(metaRaw);

			if (!parsed.success) {
				logger.warn({ slug, issues: parsed.error.issues.map((i) => i.path.join(".")) }, "trip meta.json failed schema; skipped");

				continue;
			}

			const meta = { ...parsed.data, rating: clampRating(parsed.data.rating) };

			const photoUrls = photos.files
				.filter((f) => PHOTO_EXT.test(f))
				.map(publicUrlFor);

			trips.push({ ...meta, slug, photos: photoUrls });
		} catch (err) {
			logger.warn({ slug, err: String(err) }, "trip load failed; skipped");
		}
	}

	return trips.toSorted((a, b) => b.dates[0].localeCompare(a.dates[0]));
}

export async function getTrips(): Promise<Trip[]> {
	if (!b2Configured()) return [];

	if (cache && Date.now() - cache.at < TTL_MS) return cache.trips;

	try {
		const trips = await loadAllTrips();

		cache = { at: Date.now(), trips };

		return trips;
	} catch (err) {
		logger.warn({ err: String(err) }, "b2 trip listing failed; serving empty");

		return cache?.trips ?? [];
	}
}

export async function getTrip(slug: string): Promise<Trip | undefined> {
	const trips = await getTrips();

	return trips.find((t) => t.slug === slug);
}
