/*
trip writes: meta.json upload + photo upload. server-side only — the scoped
b2 key lives in process env.
*/

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";

import { BUCKET, b2S3, publicUrlFor } from "./b2";
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

export async function uploadPhotos(
	slug: string,
	files: { name: string; bytes: Buffer }[],
): Promise<string[]> {
	const urls: string[] = [];

	for (const f of files) {
		const digest = createHash("sha1").update(f.bytes).digest("hex").slice(0, 8);
		const key = `travel/${slug}/${digest}.${photoExt(f.name)}`;

		await b2S3().send(
			new PutObjectCommand({
				Bucket: BUCKET(),
				Key: key,
				Body: f.bytes,
				ContentType: `image/${photoExt(f.name)}`,
				CacheControl: "public, max-age=31536000, immutable",
			}),
		);

		urls.push(publicUrlFor(key));
	}

	return urls;
}
