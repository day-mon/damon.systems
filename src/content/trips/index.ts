/*
travel trips live as json files in this directory, produced by
scripts/travel-sync + a hand-written blurb. photos are served from
public/travel/<slug>/ and referenced by filename from the manifest.
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
	dateRange: { start: string; end: string };
	blurb: string;
	photos: TripPhoto[];
}

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
