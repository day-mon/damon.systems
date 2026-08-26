/*
live resolution of public icloud shared albums.

the public "shared website" endpoint family is undocumented but stable;
the shape below ports llun/blog libs/apple/webstream.ts:

  token -> p<partition>-sharedstreams.icloud.com/<token>/sharedstreams
    POST webstream     -> photo records (guids, dims, dates, captions, derivative checksums)
    POST webasseturls  -> signed cdn urls per checksum (expire in a few hours)

runs server-side via a server fn so client-side navigation never touches
apple directly (no cors on these endpoints). results are cached in-module
for 5 minutes so steady-state cost is 2 requests per cache window for the
whole site, not per visitor.
*/

import { createServerFn } from "@tanstack/react-start";
import ky from "ky";

const PHOTO_APP_UA =
	"Photos/5.0 (Macintosh; OS X 10.15.4) AppleWebKit/605.1.15";
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const CACHE_TTL_MS = 5 * 60 * 1000;
const TARGET_WIDTH = 2048;

interface Derivative {
	fileSize: number;
	checksum: string;
	width: number;
	height: number;
}

interface StreamPhoto {
	photoGuid: string;
	caption?: string;
	dateCreated: string;
	width?: number;
	height?: number;
	derivatives: Record<string, Derivative>;
}

interface Stream {
	streamName?: string;
	photos?: StreamPhoto[];
	partition?: number;
}

interface Assets {
	items: Record<
		string,
		{ url_expiry: string; url_location: string; url_path: string }
	>;
	locations: Record<string, { hosts: string[]; scheme: string }>;
}

export interface SharedPhoto {
	key: string;
	src: string;
	caption: string;
	takenAt: string;
	width: number;
	height: number;
}

export interface SharedAlbumResult {
	ok: boolean;
	albumTitle: string | null;
	photos: SharedPhoto[];
}

const cache = new Map<string, { at: number; value: SharedAlbumResult }>();

const base62ToInt = (input: string) =>
	Array.from(input).reduce((acc, ch) => acc * 62 + BASE62.indexOf(ch), 0);

function partitionFromToken(token: string): number {
	return token[0] === "A"
		? base62ToInt(token[1])
		: base62ToInt(token.substring(1, 3));
}

function tokenFromShareUrl(shareUrl: string): string {
	const match = shareUrl.match(/sharedalbum\/#([\w-]+)/);
	if (!match) throw new Error(`cannot parse icloud share token from url`);
	return match[1];
}

const streamBase = (partition: number, token: string) =>
	`https://p${partition.toString().padStart(2, "0")}-sharedstreams.icloud.com/${token}/sharedstreams`;

async function fetchStream(
	token: string,
): Promise<{ stream: Stream; partition: number }> {
	let partition = partitionFromToken(token);
	const request = {
		headers: {
			"content-type": "text/plain",
			"user-agent": PHOTO_APP_UA,
		},
		// 330 = "you hit the wrong partition, go here instead"
		throwHttpErrors: false,
		body: JSON.stringify({ streamCtag: null }),
	};

	const res = await ky.post(
		`${streamBase(partition, token)}/webstream`,
		request,
	);
	if (res.status === 330) {
		const hint = await res.json<{ "X-Apple-MMe-Host": string }>();
		const host = hint["X-Apple-MMe-Host"];
		const redirected = await ky.post(
			`https://${host}/${token}/sharedstreams/webstream`,
			request,
		);
		if (!redirected.ok) throw new Error(`webstream ${redirected.status}`);
		const redirectedPartition = Number.parseInt(
			redirected.headers.get("x-apple-user-partition") ?? "0",
			10,
		);
		if (redirectedPartition) partition = redirectedPartition;
		return { stream: await redirected.json<Stream>(), partition };
	}
	if (!res.ok) throw new Error(`webstream ${res.status}`);
	return { stream: await res.json<Stream>(), partition };
}

async function fetchAssetUrls(
	partition: number,
	token: string,
	checksums: string[],
): Promise<Assets> {
	const res = await ky.post(`${streamBase(partition, token)}/webasseturls`, {
		headers: { "content-type": "text/plain" },
		body: JSON.stringify({ photoGuids: checksums }), // endpoint takes checksums under the photoGuids key
	});
	if (!res.ok) throw new Error(`webasseturls ${res.status}`);
	return res.json<Assets>();
}

function pickDerivative(photo: StreamPhoto): Derivative | null {
	const all = Object.values(photo.derivatives);
	if (all.length === 0) return null;
	// largest derivative at or under TARGET_WIDTH; fall back to the biggest available
	const sorted = [...all].sort(
		(a: Derivative, b: Derivative) => a.width - b.width,
	);
	return (
		[...sorted].reverse().find((d) => d.width <= TARGET_WIDTH) ??
		sorted[sorted.length - 1]
	);
}

function urlFor(assets: Assets, checksum: string): string | null {
	const item = assets.items[checksum];
	if (!item) return null;
	const location = assets.locations[item.url_location];
	if (!location) return null;
	return `${location.scheme}://${location.hosts[0]}${item.url_path}`;
}

async function resolveSharedAlbum(
	shareUrl: string,
): Promise<SharedAlbumResult> {
	const cached = cache.get(shareUrl);
	if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
		return cached.value;
	}

	const token = tokenFromShareUrl(shareUrl);
	const { stream, partition } = await fetchStream(token);
	const photos = (stream.photos ?? [])
		.map((photo) => ({ photo, derivative: pickDerivative(photo) }))
		.filter(
			(entry): entry is { photo: StreamPhoto; derivative: Derivative } =>
				entry.derivative !== null,
		);
	const checksums = photos.map((entry) => entry.derivative.checksum);
	const assets = await fetchAssetUrls(partition, token, checksums);

	const value: SharedAlbumResult = {
		ok: true,
		albumTitle: stream.streamName ?? null,
		photos: photos
			.map(({ photo, derivative }) => {
				const src = urlFor(assets, derivative.checksum);
				if (!src) return null;
				return {
					key: photo.photoGuid,
					src,
					caption: photo.caption ?? "",
					takenAt: photo.dateCreated,
					width: derivative.width,
					height: derivative.height,
				};
			})
			.filter((photo): photo is SharedPhoto => photo !== null)
			.sort((a, b) => a.takenAt.localeCompare(b.takenAt)),
	};

	cache.set(shareUrl, { at: Date.now(), value });
	return value;
}

export const getSharedAlbum = createServerFn({ method: "GET" })
	.inputValidator((shareUrl: string) => {
		if (!shareUrl) throw new Error("shareUrl is required");
		return shareUrl;
	})
	.handler(async ({ data: shareUrl }) => {
		try {
			return await resolveSharedAlbum(shareUrl);
		} catch (err) {
			console.error("[icloud-shared] resolve failed:", err);
			return { ok: false, albumTitle: null, photos: [] };
		}
	});
