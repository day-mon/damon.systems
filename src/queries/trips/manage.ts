/*
admin trip mutations. every entry point re-checks the authentik session:
authentik only issues sessions to damon-systems-admins, so presence ==
permission. never trust a slug from the wire without sanitize.
*/

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { authz } from "#/lib/authz/service";
import { TripMetaSchema } from "#/lib/trips/types";
import { renderTripOgImage } from "#/components/trip-og-card";
import { storage } from "#/lib/trips/storage/service";



function sanitizeSlug(raw: string): string {
	const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

	if (!slug) throw new Error("slug is empty after sanitize");

	return slug;
}

async function requireSession() {
	const s = await authz.getSession(getRequestHeaders());

	if (!s) throw new Error("unauthenticated");

	return s;
}

export const saveTripMeta = createServerFn({ method: "POST" })
	.validator((d: { slug: string; previousSlug?: string; meta: unknown }) => ({
		slug: sanitizeSlug(d.slug),
		previousSlug: d.previousSlug ? sanitizeSlug(d.previousSlug) : undefined,
		meta: TripMetaSchema.parse(d.meta),
	}))
	.handler(({ data }) =>
		requireSession()
			.then(async () => {
				if (data.previousSlug && data.previousSlug !== data.slug) {
					await storage.renameTrip(data.previousSlug, data.slug);
				}

				return storage.saveMeta(data.slug, data.meta);
			})
			// og card regenerate is best-effort — never fail the save over a card
			.then(() =>
				Promise.all([storage.countPhotos(data.slug), storage.cardPhotos(data.slug)])
					.then(([n, photos]) => renderTripOgImage(data.meta, n, photos))
					.then((png) => storage.saveOgPng(data.slug, png))
					.catch((e) => console.error("og render failed", e)),
			)
			.then(() => ({ ok: true })),
	);
