/*
trip writes: meta.json upload + photo upload. server-side only — the scoped
b2 key lives in process env.
*/

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";

import { BUCKET, b2S3, listPrefix, publicUrlFor } from "./b2";
import type { TripMeta } from "./types";

const photoExt = (name: string): string => {
	const m = /\.(jpe?g|png|webp|gif|avif)$/i.exec(name);

	if (!m) throw new Error(`unsupported photo type: ${name}`);

	return m[0].toLowerCase().replace("jpeg", "jpg");
};

export async function saveMeta(slug: string, meta: TripMeta): Promise<void> {
	await b2S3().send(
		new PutObjectCommand({
			Bucket: BUCKET(),
			Key: `travel/${slug}/meta.json`,
			Body: JSON.stringify(meta),
			ContentType: "application/json",
			CacheControl: "no-cache",
		}),
	);
}

export async function saveOgPng(slug: string, png: Buffer): Promise<string> {
	const key = `travel/${slug}/og.png`;

	await b2S3().send(
		new PutObjectCommand({
			Bucket: BUCKET(),
			Key: key,
			Body: png,
			ContentType: "image/png",
			// regenerated on every save, so keep caches honest
			CacheControl: "public, max-age=300, must-revalidate",
		}),
	);

	return publicUrlFor(key);
}

/** count real photos under travel/<slug>/ (ignores meta.json + og.png) */
export async function countPhotos(slug: string): Promise<number> {
	const { files } = await listPrefix(`travel/${slug}/`);

	return files.filter((k) => k !== `travel/${slug}/meta.json` && k !== `travel/${slug}/og.png`).length;
}

export async function uploadPhoto(
	slug: string,
	name: string,
	bytes: Buffer,
): Promise<string> {
	const digest = createHash("sha1").update(bytes).digest("hex").slice(0, 8);
	const ext = photoExt(name);
	const key = `travel/${slug}/${digest}.${ext}`;

	await b2S3().send(
		new PutObjectCommand({
			Bucket: BUCKET(),
			Key: key,
			Body: bytes,
			ContentType: `image/${ext}`,
			CacheControl: "public, max-age=31536000, immutable",
		}),
	);

	return publicUrlFor(key);
}
