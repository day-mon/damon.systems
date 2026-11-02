/*
TripCatalog — trip reads with a short in-process cache. b2 via TripsStorage
stays the source of truth; the ttl keeps edits visible without a deploy while
sparing the bucket a burst of per-page listing requests.
*/

import { logger } from "#/lib/logger";

import { TripsStorage } from "./storage/service";
import {
	TripMetaSchema,
	clampRating,
	type Trip,
	type TripPhoto,
} from "./types";

const TRAVEL_PREFIX = "travel/";
const ORIGINAL = /^travel\/[^/]+\/([a-f0-9]+)\.(jpe?g|png|webp|gif|avif)$/i;

export interface CatalogConfig {
	ttlMs: number;
}

export class TripCatalog {
	private cache: { at: number; trips: Trip[] } | null = null;

	static create(
		config: CatalogConfig = { ttlMs: 10 * 60 * 1000 },
		store = TripsStorage.create(),
	): TripCatalog {
		return new TripCatalog(config, store);
	}

	private constructor(
		private readonly config: CatalogConfig,
		private readonly store: TripsStorage,
	) {}

	async list(): Promise<Trip[]> {
		if (this.cache && Date.now() - this.cache.at < this.config.ttlMs)
			return this.cache.trips;

		try {
			const trips = await this.loadAll();

			this.cache = { at: Date.now(), trips };

			return trips;
		} catch (err) {
			logger.warn(
				{ err: String(err) },
				"b2 trip listing failed; serving empty",
			);

			return this.cache?.trips ?? [];
		}
	}

	async get(slug: string): Promise<Trip | undefined> {
		const trips = await this.list();

		return trips.find((t) => t.slug === slug);
	}

	invalidate(): void {
		this.cache = null;
	}

	private async loadAll(): Promise<Trip[]> {
		const { folders } = await this.store.listPrefix(TRAVEL_PREFIX);

		const slugs = folders
			.map((f) => f.slice(TRAVEL_PREFIX.length).replace(/\/$/, ""))
			.filter(Boolean);

		const jobs = slugs.map((slug) => this.loadOne(slug));
		const results = await Promise.all(jobs);

		return results
			.filter((t): t is Trip => t !== null)
			.toSorted((a, b) => b.dates[0].localeCompare(a.dates[0]));
	}

	private async loadOne(slug: string): Promise<Trip | null> {
		try {
			const [metaRaw, photos] = await Promise.all([
				this.store.fetchJson(`${TRAVEL_PREFIX}${slug}/meta.json`),
				this.store.listPrefix(`${TRAVEL_PREFIX}${slug}/`),
			]);

			const parsed = TripMetaSchema.safeParse(metaRaw);

			if (!parsed.success) {
				logger.warn(
					{ slug, issues: parsed.error.issues.map((i) => i.path.join(".")) },
					"trip meta.json failed schema; skipped",
				);

				return null;
			}

			const meta = { ...parsed.data, rating: clampRating(parsed.data.rating) };

			// originals carry the digest name; derivatives mirror it as webp
			const entries: TripPhoto[] = photos.files.flatMap((k) => {
				const m = ORIGINAL.exec(k);

				if (!m) return [];

				return [
					{
						full: this.store.publicUrlFor(k),
						large: this.store.publicUrlFor(
							`${TRAVEL_PREFIX}${slug}/large/${m[1]}.webp`,
						),
						thumb: this.store.publicUrlFor(
							`${TRAVEL_PREFIX}${slug}/thumb/${m[1]}.webp`,
						),
					},
				];
			});

			return Object.assign({}, meta, { slug, photos: entries });
		} catch (err) {
			logger.warn({ slug, err: String(err) }, "trip load failed; skipped");

			return null;
		}
	}
}

export const trips = TripCatalog.create();
