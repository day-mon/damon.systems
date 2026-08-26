/*
live resolution of public icloud shared albums — both generations:

  legacy "shared streams" (sharedalbum/#<token>):
    p<partition>-sharedstreams.icloud.com/webstream -> photo records
    webasseturls -> signed cdn urls per checksum

  modern cloudkit shares (share.icloud.com/photos/<token> or
  photos.icloud.com/shared/album/<token>), retired the legacy link format
  with ios/macos 26:
    POST ckdatabasews.icloud.com/.../public/records/resolve
      -> zone + short-lived anonymous access token + partition host + title
    POST <partition host>/.../shared/records/query (publicAccessAuthToken)
      -> CPLMaster records with inline downloadURLs; paged via continuationMarker

the cloudkit shape below ports starbrightlab/immortal commit 92463f0.
runs server-side via a server fn (no cors on apple's hosts) with a 5-minute
in-module cache so steady-state is two requests per window, not per visitor.
*/

import { createServerFn } from "@tanstack/react-start";
import ky from "ky";

const PHOTO_APP_UA =
	"Photos/5.0 (Macintosh; OS X 10.15.4) AppleWebKit/605.1.15";
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const CACHE_TTL_MS = 5 * 60 * 1000;
const TARGET_WIDTH = 2048;

// --- cloudkit constants (telemetry params, not auth — any value is accepted)
const CK_HOST = "https://ckdatabasews.icloud.com";
const CK_CONTAINER = "com.apple.photos.cloud";
const CK_BUILD = "2630Build17";
const CK_PARAMS = `clientBuildNumber=${CK_BUILD}&clientMasteringNumber=${CK_BUILD}`;
const CK_RECORD_TYPE = "CPLAssetAndMasterByAssetDateWithoutHiddenOrDeleted";
const CK_PAGE_SIZE = 200;
const CK_MAX_PAGES = 50;

// --- shared result types

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

// --- token + transport helpers

type ShareKind = "legacy" | "cloudkit";

function tokenFromShareUrl(shareUrl: string): {
	kind: ShareKind;
	token: string;
} {
	const legacy = shareUrl.match(/sharedalbum\/#([\w-]+)/);
	if (legacy) return { kind: "legacy", token: legacy[1] };
	const cloudkit = shareUrl.match(/shared\/album\/([\w-]+)/);
	if (cloudkit) return { kind: "cloudkit", token: cloudkit[1] };
	const share = shareUrl.match(/share\.icloud\.com\/photos\/([\w-]+)/);
	if (share) return { kind: "cloudkit", token: share[1] };
	throw new Error("cannot parse icloud share token from url");
}

// --- legacy shared streams

const base62ToInt = (input: string) =>
	Array.from(input).reduce((acc, ch) => acc * 62 + BASE62.indexOf(ch), 0);

function partitionFromToken(token: string): number {
	return token[0] === "A"
		? base62ToInt(token[1])
		: base62ToInt(token.substring(1, 3));
}

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
	derivatives: Record<string, Derivative>;
}

interface Stream {
	streamName?: string;
	photos?: StreamPhoto[];
}

interface Assets {
	items: Record<
		string,
		{ url_expiry: string; url_location: string; url_path: string }
	>;
	locations: Record<string, { hosts: string[]; scheme: string }>;
}

const streamBase = (partition: number, token: string) =>
	`https://p${partition.toString().padStart(2, "0")}-sharedstreams.icloud.com/${token}/sharedstreams`;

async function resolveLegacy(token: string): Promise<SharedAlbumResult> {
	let partition = partitionFromToken(token);
	const request = {
		headers: {
			"content-type": "text/plain",
			"user-agent": PHOTO_APP_UA,
		},
		throwHttpErrors: false,
		body: JSON.stringify({ streamCtag: null }),
	};

	let res = await ky.post(`${streamBase(partition, token)}/webstream`, request);
	if (res.status === 330) {
		const hint = await res.json<{ "X-Apple-MMe-Host": string }>();
		const redirected = await ky.post(
			`https://${hint["X-Apple-MMe-Host"]}/${token}/sharedstreams/webstream`,
			request,
		);
		if (!redirected.ok) throw new Error(`webstream ${redirected.status}`);
		const redirectedPartition = Number.parseInt(
			redirected.headers.get("x-apple-user-partition") ?? "0",
			10,
		);
		if (redirectedPartition) partition = redirectedPartition;
		res = redirected;
	}
	if (!res.ok) throw new Error(`webstream ${res.status}`);
	const stream = await res.json<Stream>();

	const photos = (stream.photos ?? [])
		.map((photo) => {
			const all = Object.values(photo.derivatives);
			if (all.length === 0) return null;
			const sorted = [...all].sort(
				(a: Derivative, b: Derivative) => a.width - b.width,
			);
			const derivative =
				[...sorted].reverse().find((d) => d.width <= TARGET_WIDTH) ??
				sorted[sorted.length - 1];
			return { photo, derivative };
		})
		.filter(
			(entry): entry is { photo: StreamPhoto; derivative: Derivative } =>
				entry !== null,
		);
	const checksums = photos.map((entry) => entry.derivative.checksum);

	const assetsRes = await ky.post(
		`${streamBase(partition, token)}/webasseturls`,
		{
			headers: { "content-type": "text/plain" },
			body: JSON.stringify({ photoGuids: checksums }),
		},
	);
	if (!assetsRes.ok) throw new Error(`webasseturls ${assetsRes.status}`);
	const assets = await assetsRes.json<Assets>();

	return {
		ok: true,
		albumTitle: stream.streamName ?? null,
		photos: photos
			.map(({ photo, derivative }) => {
				const item = assets.items[derivative.checksum];
				const location = item && assets.locations[item.url_location];
				if (!item || !location) return null;
				return {
					key: photo.photoGuid,
					src: `${location.scheme}://${location.hosts[0]}${item.url_path}`,
					caption: photo.caption ?? "",
					takenAt: photo.dateCreated,
					width: derivative.width,
					height: derivative.height,
				};
			})
			.filter((photo): photo is SharedPhoto => photo !== null)
			.sort((a, b) => a.takenAt.localeCompare(b.takenAt)),
	};
}

// --- modern cloudkit shares

interface CkValue {
	value: unknown;
	type?: string;
}

interface CkResolveResult {
	zoneID: {
		zoneName: string;
		ownerRecordName: string;
		zoneType: string;
	};
	anonymousPublicAccess: { token: string; databasePartition: string };
	share?: { fields?: Record<string, CkValue> };
}

interface CkMasterRecord {
	recordType: string;
	recordName: string;
	fields?: Record<string, CkValue>;
	created?: { timestamp: number };
}

interface CkQueryResponse {
	records?: CkMasterRecord[];
	continuationMarker?: string;
}

const ckString = (fields: Record<string, CkValue>, key: string): string =>
	String((fields[key]?.value as string | undefined) ?? "");

const ckNumber = (fields: Record<string, CkValue>, key: string): number =>
	Number((fields[key]?.value as number | undefined) ?? 0);

function ckPickSource(
	fields: Record<string, CkValue>,
): { src: string; width: number; height: number } | null {
	// smallest derivative whose long edge (tracked as width) still covers the
	// target; fall back to the largest available. res*Vid*Res are video tracks.
	let best: { src: string; width: number; height: number } | null = null;
	let fallback: { src: string; width: number; height: number } | null = null;
	for (const [key, entry] of Object.entries(fields)) {
		if (!key.startsWith("res") || !key.endsWith("Res") || key.includes("Vid")) {
			continue;
		}
		const value = entry.value as { downloadURL?: string } | undefined;
		const src = value?.downloadURL;
		if (!src || src === "null") continue;
		const stem = key.slice(0, -"Res".length);
		const width = ckNumber(fields, `${stem}Width`);
		const height = ckNumber(fields, `${stem}Height`);
		const candidate = { src, width, height };
		if (width >= TARGET_WIDTH && (best === null || width < best.width)) {
			best = candidate;
		}
		if (fallback === null || width > fallback.width) {
			fallback = candidate;
		}
	}
	return best ?? fallback;
}

async function resolveCloudKit(token: string): Promise<SharedAlbumResult> {
	// 1. anonymous resolve: mints the short-lived access token + tells us which
	//    partition host actually holds the records
	const resolveRes = await ky.post(
		`${CK_HOST}/database/1/${CK_CONTAINER}/production/public/records/resolve?${CK_PARAMS}`,
		{ json: { shortGUIDs: [{ value: token }] } },
	);
	if (!resolveRes.ok) throw new Error(`records/resolve ${resolveRes.status}`);
	const resolved = (await resolveRes.json<{ results?: CkResolveResult[] }>())
		.results?.[0];
	if (!resolved) throw new Error("records/resolve returned no results");
	const { zoneID, anonymousPublicAccess: access } = resolved;
	const partition = access.databasePartition.replace(/:443$/, "");
	const albumTitle =
		(resolved.share?.fields?.["cloudkit.title"]?.value as string | undefined) ??
		null;

	// 2. page the shared zone; downloadURLs arrive inline
	const queryUrl =
		`${partition}/database/1/${CK_CONTAINER}/production/shared/records/query?${CK_PARAMS}` +
		`&publicAccessAuthToken=${encodeURIComponent(access.token)}`;

	const photos: SharedPhoto[] = [];
	let marker: string | null = null;
	let pages = 0;
	do {
		const body: Record<string, unknown> = {
			query: {
				recordType: CK_RECORD_TYPE,
				filterBy: [
					{
						fieldName: "direction",
						comparator: "EQUALS",
						fieldValue: { value: "DESCENDING", type: "STRING" },
					},
				],
			},
			zoneID,
			resultsLimit: CK_PAGE_SIZE,
			...(marker ? { continuationMarker: marker } : {}),
		};
		const resResponse = await ky.post(queryUrl, { json: body });
		if (!resResponse.ok) throw new Error(`records/query ${resResponse.status}`);
		const page: CkQueryResponse = await resResponse.json();
		for (const record of page.records ?? []) {
			if (record.recordType !== "CPLMaster" || !record.fields) continue;
			const itemType = ckString(record.fields, "itemType").toLowerCase();
			if (itemType.includes("movie") || itemType.includes("video")) continue;
			const source = ckPickSource(record.fields);
			if (!source) continue;
			// originalCreationDate = when the photo was taken; importDate /
			// the record's own creation timestamp are upload-side fallbacks
			const takenAtMs =
				ckNumber(record.fields, "originalCreationDate") ||
				ckNumber(record.fields, "importDate") ||
				record.created?.timestamp ||
				0;
			photos.push({
				key: record.recordName,
				src: source.src,
				caption: "",
				takenAt: new Date(takenAtMs).toISOString(),
				width: source.width,
				height: source.height,
			});
		}
		marker = page.continuationMarker || null;
		pages++;
	} while (marker && pages < CK_MAX_PAGES);

	photos.sort((a, b) => a.takenAt.localeCompare(b.takenAt));
	return { ok: true, albumTitle, photos };
}

// --- entry point (server fn; 5-minute in-module cache)

async function resolveSharedAlbum(
	shareUrl: string,
): Promise<SharedAlbumResult> {
	const cached = cache.get(shareUrl);
	if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
		return cached.value;
	}

	const { kind, token } = tokenFromShareUrl(shareUrl);
	const value =
		kind === "legacy"
			? await resolveLegacy(token)
			: await resolveCloudKit(token);
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
