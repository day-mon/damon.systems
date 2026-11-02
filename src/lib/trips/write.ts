/*
trip writes: meta.json upload + photo upload with derivative sizes.
server-side only — the scoped b2 key lives in process env.

layout in the bucket:
  travel/<slug>/meta.json
  travel/<slug>/og.png                    share card
  travel/<slug>/<digest>.<ext>            original (click-through)
  travel/<slug>/large/<digest>.webp       2048w (strip wall)
  travel/<slug>/thumb/<digest>.webp        800w (dome tiles)
*/

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import sharp from "sharp";

import { BUCKET, b2S3, listPrefix, publicUrlFor } from "./b2";
import type { TripMeta } from "./types";

const photoExt = (name: string): string => {
	const m = /\.(jpe?g|png|webp|gif|avif)$/i.exec(name);

	if (!m) throw new Error(`unsupported photo type: ${name}`);

	return m[0].toLowerCase().replace("jpeg", "jpg");
};

const put = (key: string, body: Buffer, contentType: string) =>
	b2S3().send(
		new PutObjectCommand({
			Bucket: BUCKET(),
			Key: key,
			Body: body,
			ContentType: contentType,
			CacheControl: "public, max-age=31536000, immutable",
		}),
	);

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

export interface PhotoSet {
	digest: string;
	full: string;
	large: string;
	thumb: string;
}

export async function uploadPhoto(
	slug: string,
	name: string,
	originalBytes: Buffer,
): Promise<PhotoSet> {
	const digest = createHash("sha1").update(originalBytes).digest("hex").slice(0, 8);
	const ext = photoExt(name);

	const [large, thumb] = await Promise.all([
		sharp(originalBytes).rotate().resize(2048).toFormat("webp", { quality: 82 }).toBuffer(),
		sharp(originalBytes).rotate().resize(800).toFormat("webp", { quality: 80 }).toBuffer(),
	]);

	await Promise.all([
		put(`travel/${slug}/${digest}.${ext}`, originalBytes, `image/${ext}`),
		put(`travel/${slug}/large/${digest}.webp`, large, "image/webp"),
		put(`travel/${slug}/thumb/${digest}.webp`, thumb, "image/webp"),
	]);

	return {
		digest,
		full: publicUrlFor(`travel/${slug}/${digest}.${ext}`),
		large: publicUrlFor(`travel/${slug}/large/${digest}.webp`),
		thumb: publicUrlFor(`travel/${slug}/thumb/${digest}.webp`),
	};
}

export async function saveOgPng(slug: string, png: Buffer): Promise<string> {
	const key = `travel/${slug}/og.png`;

	await put(key, png, "image/png");

	return publicUrlFor(key);
}

/** count originals under travel/<slug>/ (derivatives/meta/og don't count) */
export async function countPhotos(slug: string): Promise<number> {
	const { files } = await listPrefix(`travel/${slug}/`);

	return files.filter(
		(k) =>
			/\.(jpe?g|png|webp|gif|avif)$/i.test(k) &&
			!k.includes("/large/") &&
			!k.includes("/thumb/") &&
			!k.endsWith("/og.png"),
	).length;
}
