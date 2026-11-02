/*
admin trip mutations. every entry point re-checks the authentik session:
authentik only issues sessions to damon-systems-admins, so presence ==
permission. never trust a slug from the wire without sanitize.
*/

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";

import { getAuth } from "#/lib/authz/better";
import type { TripMeta } from "#/lib/trips/types";
import { saveMeta, uploadPhotos } from "#/lib/trips/write";

const MetaInput = z.object({
	name: z.string().min(1),
	place: z.string().min(1),
	dates: z.tuple([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
	rating: z.number().min(0).max(5),
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
	blurb: z.string().min(1),
});

function sanitizeSlug(raw: string): string {
	const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

	if (!slug) throw new Error("slug is empty after sanitize");

	return slug;
}

async function requireSession() {
	const s = await getAuth().api.getSession({ headers: getRequestHeaders() });

	if (!s) throw new Error("unauthenticated");

	return s;
}

export const saveTripMeta = createServerFn({ method: "POST" })
	.validator((d: { slug: string; meta: unknown }) => ({
		slug: sanitizeSlug(d.slug),
		meta: MetaInput.parse(d.meta),
	}))
	.handler(({ data }) =>
		requireSession()
			.then(() => {
				// SAFETY: MetaInput mirrors TripMeta field-for-field.
				return saveMeta(data.slug, data.meta as TripMeta);
			})
			.then(() => ({ ok: true })),
	);

export const uploadTripPhotos = createServerFn({ method: "POST" })
	.validator((d: FormData) => {
		const slug = sanitizeSlug(String(d.get("slug") ?? ""));
		const files = d.getAll("photos").filter((f): f is File => f instanceof File);

		if (files.length === 0) throw new Error("no photos attached");

		return { slug, files };
	})
	.handler(({ data }) =>
		requireSession()
			.then(() =>
				Promise.all(
					data.files.map((f) =>
						f.arrayBuffer().then((ab) => ({ name: f.name, bytes: Buffer.from(ab) })),
					),
				),
			)
			.then((files) => uploadPhotos(data.slug, files))
			.then((urls) => ({ urls })),
	);
