/*
b2 access via its s3-compatible endpoint — @aws-sdk/client-s3 against
https://s3.<region>.backblazeb2.com. no list-file capitalization quirks to
own, no 24h token cache to expire.

env contract (names, never values):
	B2_KEY_ID          backblaze application key id
	B2_APPLICATION_KEY the application key itself
	B2_BUCKET_NAME     bucket holding travel/ (defaults to "travel-albums")
	B2_REGION          bucket region, e.g. "us-west-004" (drives the endpoint)

bucket is public-read for media; keys are still used for listing.
*/

import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

import type { JsonObject } from "./json";

let s3: S3Client | null = null;

export const BUCKET = () => process.env.B2_BUCKET_NAME ?? "damon-travel";


const REGION = () => process.env.B2_REGION ?? "us-west-004";

export function b2Configured(): boolean {
	return Boolean(process.env.B2_KEY_ID && process.env.B2_APPLICATION_KEY);
}

export function b2S3(): S3Client {
	if (!s3) {
		s3 = new S3Client({
			region: REGION(),
			endpoint: `https://s3.${REGION()}.backblazeb2.com`,
			credentials: {
				accessKeyId: process.env.B2_KEY_ID ?? "",
				secretAccessKey: process.env.B2_APPLICATION_KEY ?? "",
			},
		});
	}

	return s3;
}

/** list objects + subfolders under a prefix, fully paginated */
export interface PrefixListing {
	files: string[];
	folders: string[];
}

export async function listPrefix(prefix: string): Promise<PrefixListing> {
	const out: PrefixListing = { files: [], folders: [] };

	let token: string | undefined;

	for (;;) {
		const page = await b2S3().send(
			new ListObjectsV2Command({
				Bucket: BUCKET(),
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

/** absolute public url for an object inside the bucket (bucket must be public-read) */
export function publicUrlFor(key: string): string {
	return `https://${BUCKET()}.s3.${REGION()}.backblazeb2.com/${key
		.split("/")
		.map(encodeURIComponent)
		.join("/")}`;
}

/** fetch an object as raw json; the caller's predicate decodes it into a domain type */
export async function fetchJson(key: string): Promise<JsonObject> {
	const res = await fetch(publicUrlFor(key));

	if (!res.ok) throw new Error(`b2 fetch ${key}: ${res.status}`);

	// SAFETY: travel/ objects are json docs we authored; the caller's predicate
	// proves every field before anyone reads them.
	return (await res.json()) as JsonObject;
}
