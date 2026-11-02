/* regenerate og cards for every trip:  bun --env-file=.env scripts/regen-og.ts */
import { renderTripOgImage } from "#/components/trip-og-card";
import { trips } from "#/lib/trips/catalog";
import { storage } from "#/lib/trips/storage/service";

const all = await trips.list();

for (const t of all) {
	const png = await renderTripOgImage(t, t.photos.length, await storage.cardPhotos(t.slug));
	await storage.saveOgPng(t.slug, png);
	console.log("✓", t.slug);
}
