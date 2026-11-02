/*
one-off backfill: for every trip, fetch each original and mint the
large/thumb webp derivatives next to it. idempotent — digests are
content-addressed, so re-runs overwrite cleanly.

  B2_KEY_ID=... B2_APPLICATION_KEY=... bun scripts/backfill-derivatives.ts
*/

import { b2Configured, listPrefix, publicUrlFor } from "#/lib/trips/b2";
import { uploadPhoto } from "#/lib/trips/write";

if (!b2Configured()) {
	console.error("✗ B2 env missing");
	process.exit(1);
}

const { folders } = await listPrefix("travel/");
const ORIGINAL = /^travel\/([^/]+)\/([a-f0-9]+)\.(jpe?g|png|webp|gif|avif)$/i;

for (const folder of folders) {
	const slug = folder.slice("travel/".length).replace(/\/$/, "");
	const { files } = await listPrefix(folder);
	const originals = files.filter((k) => ORIGINAL.test(k));

	for (const key of originals) {
		const res = await fetch(publicUrlFor(key));

		if (!res.ok) {
			console.error(`✗ fetch ${key}: ${res.status}`);
			continue;
		}

		const bytes = Buffer.from(await res.arrayBuffer());
		const out = await uploadPhoto(slug, key.split("/").pop() ?? "photo.jpg", bytes);

		console.log(`✓ ${slug}/${out.digest}`);
	}
}
