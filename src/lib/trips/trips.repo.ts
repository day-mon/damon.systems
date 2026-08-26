/*
TripsRepo - the only code that knows the travel_trips table exists,
bootstraps it lazily on first touch (no migration runner), and owns all
crud for admin-portal-authored trips.
*/

import { desc, eq } from "drizzle-orm";

import { db, postgresClient } from "#/lib/db/client";
import {
	type NewTravelTripsRow,
	type TravelTripsRow,
	travelTrips,
} from "#/lib/db/schema";

export class TripsRepo {
	private tableReady: Promise<void> | null = null;

	private ensureTable(): Promise<void> {
		this.tableReady ??= (async () => {
			await postgresClient`
				CREATE TABLE IF NOT EXISTS travel_trips (
					slug TEXT PRIMARY KEY,
					title TEXT NOT NULL,
					location TEXT NOT NULL DEFAULT '',
					start_date DATE NOT NULL,
					end_date DATE NOT NULL,
					blurb TEXT NOT NULL DEFAULT '',
					shared_album_url TEXT,
					photos JSONB NOT NULL DEFAULT '[]'::jsonb,
					created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
					updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
				)
			`;
		})();
		return this.tableReady;
	}

	async list(): Promise<TravelTripsRow[]> {
		await this.ensureTable();
		return db.select().from(travelTrips).orderBy(desc(travelTrips.startDate));
	}

	async get(slug: string): Promise<TravelTripsRow | null> {
		await this.ensureTable();
		const rows = await db
			.select()
			.from(travelTrips)
			.where(eq(travelTrips.slug, slug))
			.limit(1);
		return rows[0] ?? null;
	}

	async upsert(row: NewTravelTripsRow): Promise<void> {
		await this.ensureTable();
		await db
			.insert(travelTrips)
			.values(row)
			.onConflictDoUpdate({
				target: travelTrips.slug,
				set: {
					title: row.title,
					location: row.location,
					startDate: row.startDate,
					endDate: row.endDate,
					blurb: row.blurb,
					sharedAlbumUrl: row.sharedAlbumUrl,
					photos: row.photos,
					updatedAt: new Date(),
				},
			});
	}

	async delete(slug: string): Promise<void> {
		await this.ensureTable();
		await db.delete(travelTrips).where(eq(travelTrips.slug, slug));
	}
}

export const tripsRepo = new TripsRepo();
