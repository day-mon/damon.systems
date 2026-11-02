/*
one-off backfill: for every trip, fetch each original and mint the
large/thumb webp derivatives next to it. idempotent — digests are
content-addressed, so re-runs overwrite cleanly.

  B2_KEY_ID=... B2_APPLICATION_KEY=... bun scripts/backfill-derivatives.ts
*/

import { storage } from "#/lib/trips/storage/service";

const { folders } = await storage.listPrefix("travel/");
const ORIGINAL = /^travel\/([^/]+)\/([a-f0-9]+)\.(jpe?g|png|webp|gif|avif)$/i;

// jobs collected first, then pooled — folders enumerate serially but uploads fan out
const jobs: { slug: string; key: string }[] = [];

for (const folder of folders) {
	const slug = folder.slice("travel/".length).replace(/\/$/, "");
	// oxlint-disable-next-line no-await-in-loop -- listing folders serially is fine (one request per trip folder)
	const { files } = await storage.listPrefix(folder);

	for (const key of files) {
		if (ORIGINAL.test(key)) jobs.push({ slug, key });
	}
}

const CONCURRENCY = 4;
let cursor = 0;

const pool = Array.from({ length: CONCURRENCY }, () =>
	(async () => {
		for (;;) {
			// oxlint-disable-next-line no-await-in-loop -- each worker processes its queue serially; workers themselves run in parallel
			const job = jobs[cursor++];

			if (!job) return;

			// oxlint-disable-next-line no-await-in-loop -- worker queue is serial by design; the N workers are the parallelism
			const res = await fetch(storage.publicUrlFor(job.key));

			if (!res.ok) {
				console.error(`✗ fetch ${job.key}: ${res.status}`);
				continue;
			}

			// oxlint-disable-next-line no-await-in-loop
			const bytes = Buffer.from(await res.arrayBuffer());

			// oxlint-disable-next-line no-await-in-loop
			const out = await storage.uploadPhoto(
				job.slug,
				job.key.split("/").pop() ?? "photo.jpg",
				bytes,
			);

			console.log(`✓ ${job.slug}/${out.digest} (${cursor}/${jobs.length})`);
		}
	})(),
);

await Promise.all(pool);

console.log(`done — ${jobs.length} originals`);
