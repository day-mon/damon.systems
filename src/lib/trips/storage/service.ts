/*
TripsStorage — everything the app does against b2 for trips. bucket layout:

  travel/<slug>/meta.json
  travel/<slug>/og.png                  share card
  travel/<slug>/<digest>.<ext>          original (click-through)
  travel/<slug>/large/<digest>.webp     2048w (strip wall)
  travel/<slug>/thumb/<digest>.webp     800w  (dome tiles)
*/

import {
	CopyObjectCommand,
	DeleteObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import sharp from "sharp";

import { env } from "#/lib/env";

import type { JsonObject } from "../json";
import { TRAVEL_BASE, type TripMeta } from "../types";

export interface StorageConfig {
	keyId: string;
	applicationKey: string;
	bucket: string;
	region: string;
}

export interface PrefixListing {
	files: string[];
	folders: string[];
}

export interface PhotoSet {
	digest: string;
	full: string;
	large: string;
	thumb: string;
}

const PHOTO_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;
const CACHE_FOREVER = "public, max-age=31536000, immutable";

export class TripsStorage {
	private readonly s3: S3Client;

	private constructor(private readonly config: StorageConfig) {
		this.s3 = new S3Client({
			region: config.region,
			endpoint: `https://s3.${config.region}.backblazeb2.com`,
			credentials: {
				accessKeyId: config.keyId,
				secretAccessKey: config.applicationKey,
			},
		});
	}

	static create(overrides: Partial<StorageConfig> = {}): TripsStorage {
		return new TripsStorage({
			keyId: overrides.keyId ?? env.B2_KEY_ID ?? "",
			applicationKey: overrides.applicationKey ?? env.B2_APPLICATION_KEY ?? "",
			bucket: overrides.bucket ?? env.B2_BUCKET_NAME,
			region: overrides.region ?? env.B2_REGION,
		});
	}

	publicUrlFor(key: string): string {
		return `${TRAVEL_BASE}/${key
			.split("/")
			.map(encodeURIComponent)
			.join("/")}`;
	}

	async listPrefix(prefix: string): Promise<PrefixListing> {
		const out: PrefixListing = { files: [], folders: [] };

		let token: string | undefined;

		for (;;) {
			// oxlint-disable-next-line no-await-in-loop -- s3 pagination: next token comes from the previous page
			const page = await this.s3.send(
				new ListObjectsV2Command({
					Bucket: this.config.bucket,
					Prefix: prefix,
					Delimiter: "/",
					ContinuationToken: token,
				}),
			);

			for (const c of page.Contents ?? []) {
				if (c.Key) out.files.push(c.Key);
			}

			for (const p of page.CommonPrefixes ?? []) {
				if (p.Prefix) out.folders.push(p.Prefix);
			}

			if (!page.IsTruncated) break;

			token = page.NextContinuationToken;
		}

		return out;
	}

	async fetchJson(key: string): Promise<JsonObject> {
		const res = await fetch(this.publicUrlFor(key));

		if (!res.ok) throw new Error(`b2 fetch ${key}: ${res.status}`);

		// SAFETY: travel/ objects are json docs we authored; callers prove shape
		// with the zod schema before reading fields.
		return (await res.json()) as JsonObject;
	}

	async saveMeta(slug: string, meta: TripMeta): Promise<void> {
		await this.put(
			`travel/${slug}/meta.json`,
			Buffer.from(JSON.stringify(meta)),
			"application/json",
			"no-cache",
		);
	}

	async saveOgPng(slug: string, png: Buffer): Promise<string> {
		const key = `travel/${slug}/og.png`;

		await this.put(key, png, "image/png", "public, max-age=300, must-revalidate");

		return this.publicUrlFor(key);
	}

	async uploadPhoto(slug: string, name: string, originalBytes: Buffer): Promise<PhotoSet> {
		const digest = createHash("sha1").update(originalBytes).digest("hex").slice(0, 8);
		const ext = this.photoExt(name);

		const [large, thumb, og] = await Promise.all([
			sharp(originalBytes).rotate().resize(2048).toFormat("webp", { quality: 82 }).toBuffer(),
			sharp(originalBytes).rotate().resize(800).toFormat("webp", { quality: 80 }).toBuffer(),
			// jpg, not webp — satori's image loader only sniffs png/jpeg and this stays private to og
			sharp(originalBytes).rotate().resize(1000).toFormat("jpeg", { quality: 82 }).toBuffer(),
		]);

		await Promise.all([
			this.put(`travel/${slug}/${digest}.${ext}`, originalBytes, `image/${ext}`, CACHE_FOREVER),
			this.put(`travel/${slug}/large/${digest}.webp`, large, "image/webp", CACHE_FOREVER),
			this.put(`travel/${slug}/thumb/${digest}.webp`, thumb, "image/webp", CACHE_FOREVER),
			this.put(`travel/${slug}/og/${digest}.jpg`, og, "image/jpeg", CACHE_FOREVER),
		]);

		return {
			digest,
			full: this.publicUrlFor(`travel/${slug}/${digest}.${ext}`),
			large: this.publicUrlFor(`travel/${slug}/large/${digest}.webp`),
			thumb: this.publicUrlFor(`travel/${slug}/thumb/${digest}.webp`),
		};
	}

	/** 2048w webp of the first original by digest-name (undefined = no photos yet) */
	/** og-card sources: up to `max` og/<digest>.jpg urls, digest-sorted for stability */
	async cardPhotos(slug: string, max = 4): Promise<string[]> {
		const { files } = await this.listPrefix(`travel/${slug}/`);

		return files
			.filter((k) => /^travel\/[^/]+\/[^/]+\.(jpe?g|png|gif|avif|webp)$/i.test(k))
			.toSorted()
			.map((k) => /\/([a-f0-9]+)\.[a-z]+$/i.exec(k)?.[1])
			.filter((d): d is string => d !== undefined)
			.slice(0, max)
			.map((d) => this.publicUrlFor(`travel/${slug}/og/${d}.jpg`));
	}

	/** move every object under travel/old/ to travel/new/ (old keys deleted) */
	async renameTrip(from: string, to: string): Promise<{ moved: number }> {
		const { files, folders } = await this.listPrefix(`travel/${from}/`);

		const keys = [...files, ...folders];

		if (folders.length > 0) {
			// derivative dirs: list their contents too
			for (const dir of folders) {
				const { files: inner } = await this.listPrefix(dir);

				keys.push(...inner);
			}
		}

		if (keys.length === 0) return { moved: 0 };

		const moved = await Promise.all(
			keys.map((k) =>
				this.s3
					.send(
						new CopyObjectCommand({
							Bucket: this.config.bucket,
							Key: k.replace(`travel/${from}/`, `travel/${to}/`),
							CopySource: `${this.config.bucket}/${k}`,
						}),
					)
					.then(() => k),
			),
		);

		await Promise.all(
			moved.map((k) =>
				this.s3.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: k })),
			),
		);

		return { moved: moved.length };
	}

	async countPhotos(slug: string): Promise<number> {
		const { files } = await this.listPrefix(`travel/${slug}/`);

		return files.filter(
			(k) =>
				PHOTO_EXT.test(k) && !k.includes("/large/") && !k.includes("/thumb/") && !k.endsWith("/og.png"),
		).length;
	}

	private put(key: string, body: Buffer, contentType: string, cacheControl: string) {
		return this.s3.send(
			new PutObjectCommand({
				Bucket: this.config.bucket,
				Key: key,
				Body: body,
				ContentType: contentType,
				CacheControl: cacheControl,
			}),
		);
	}

	private photoExt(name: string): string {
		const m = PHOTO_EXT.exec(name);

		if (!m) throw new Error(`unsupported photo type: ${name}`);

		return m[1].toLowerCase().replace("jpeg", "jpg");
	}
}

export const storage = TripsStorage.create();
