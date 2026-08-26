/*
committed trip manifests live as json files in this directory. trips can
also be authored through the /admin portal - those land in the
travel_trips table and TripsService merges them with these (db wins on
slug collision). a manifest with sharedAlbumUrl renders its photos live
from icloud; otherwise photos come from the manifest's photos array.
*/

export interface TripPhoto {
	file: string;
	caption: string;
	takenAt: string;
	lat: number | null;
	lng: number | null;
}

export interface Trip {
	slug: string;
	title: string;
	location: string;
	dateRange: { start: string; end: string };
	blurb: string;
	photos: TripPhoto[];
	// when set, photos resolve live from this public icloud share at render
	// time instead of reading the committed photos array
	sharedAlbumUrl?: string;
}

// json modules lack slug/photo ordering guarantees; normalize both here
const files = import.meta.glob<Trip>("./*.json", {
	eager: true,
	import: "default",
});

export const TRIPS: Trip[] = Object.values(files)
	.map((trip) => ({
		...trip,
		photos: [...trip.photos].sort((a, b) => a.takenAt.localeCompare(b.takenAt)),
	}))
	.sort((a, b) => b.dateRange.start.localeCompare(a.dateRange.start));

export function getTrip(slug: string): Trip | undefined {
	return TRIPS.find((trip) => trip.slug === slug);
}
