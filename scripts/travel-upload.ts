#!/usr/bin/env bun
/*
upload a trip folder to b2:  bun scripts/travel-upload.ts ./my-trip

the local folder must look like:
	my-trip/
		meta.json      name, place, dates, rating, stops (name+lat+lng list), blurb
		*.jpg|.png|.webp|.gif|.avif

it uploads to b2 as  travel/<folder-name>/<file>  — meta.json first (so the
manifest is never briefly present without data), then photos. requires
B2_KEY_ID + B2_APPLICATION_KEY (+ optional B2_BUCKET_NAME, B2_REGION) in env.
*/

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "#/lib/env";
import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

import { TripMetaSchema } from "#/lib/trips/types";

const CONTENT_TYPES = [
	[".jpg", "image/jpeg"],
	[".jpeg", "image/jpeg"],
	[".png", "image/png"],
	[".webp", "image/webp"],
	[".gif", "image/gif"],
	[".avif", "image/avif"],
] as const;

function contentTypeExt(name: string): string {
	const ext = extname(name).toLowerCase();

	for (const [e, ct] of CONTENT_TYPES) {
		if (e === ext) return ct;
	}

	return "application/octet-stream";
}

async function main() {
	const dir = process.argv[2];

	if (!dir) {
		console.error("usage: bun scripts/travel-upload.ts <local-trip-folder>");

		process.exit(1);
	}

	const slug = basename(dir.replace(/\/$/, ""));
	const names = await readdir(dir);

	if (!names.includes("meta.json")) {
		console.error(`✗ ${dir}/meta.json missing`);
		process.exit(1);
	}

	const meta = JSON.parse(await readFile(join(dir, "meta.json"), "utf8"));

	const parsed = TripMetaSchema.safeParse(meta);

	if (!parsed.success) {
		console.error("✗ meta.json failed schema:");
		console.error(parsed.error.message);
		process.exit(1);
	}

	
	const photos = names.filter((n) => contentTypeExt(n) !== "application/octet-stream");

	if (photos.length === 0) {
		console.error("✗ no photos found (jpg/png/webp/gif/avif)");
		process.exit(1);
	}

	const s3 = new S3Client({
		region: env.B2_REGION,
		endpoint: `https://s3.${env.B2_REGION}.backblazeb2.com`,
		credentials: {
			accessKeyId: env.B2_KEY_ID,
			secretAccessKey: env.B2_APPLICATION_KEY,
		},
	});

	const bucket = env.B2_BUCKET_NAME;

	const put = async (name: string) => {
		const key = `travel/${slug}/${name}`;

		await s3.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: key,
				Body: await readFile(join(dir, name)),
				ContentType: contentTypeExt(name),
			}),
		);

		console.log(`  ✓ ${key}`);
	};

	console.log(`uploading travel/${slug} (${photos.length} photos)…`);

	await put("meta.json");

	// parallel — every photo is an independent object PUT
	await Promise.all(photos.toSorted().map((name) => put(name)));

	console.log("done — live within ~10 min of the repo cache window");
}

await main();
