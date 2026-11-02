/* regenerate og cards for every trip:  bun --env-file=.env.b2 scripts/regen-og.ts */
import { renderTripOgImage } from "#/lib/og/trip-card";
import { trips } from "#/lib/trips/catalog";
import { storage } from "#/lib/trips/storage/service";

const all = await trips.list();

for (const t of all) {
	const png = await renderTripOgImage(t, t.photos.length);
	await storage.saveOgPng(t.slug, png);
	console.log("✓", t.slug);
}
