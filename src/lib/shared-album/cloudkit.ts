/*
modern icloud cloudkit shares (the link format icloud photos emits since
ios/macos 26; legacy icloud.com/sharedalbum links were retired with it).

    POST ckdatabasews.icloud.com/.../public/records/resolve
      -> zone + short-lived anonymous access token + partition host + title
    POST <partition host>/.../shared/records/query (publicAccessAuthToken)
      -> CPLMaster records with inline cvws downloadURLs, paged by marker

request/field shape ported from starbrightlab/immortal commit 92463f0 and
verified live against a real shared album (2026-08).
*/

import ky, { type KyInstance } from "ky";

import type { SharedAlbumResult, SharedPhoto } from "./types";

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

/**
 * Anonymous cloudkit web-services client for public photo-library shares.
 *
 * Two hops, both POST: a partition-independent `records/resolve` against
 * the constructor-injected resolve host, then paged `records/query` against
 * the partition host the resolve hands back (ky prefixUrl per host).
 */
export class CloudKitClient {
	static readonly DEFAULT_RESOLVE_BASE = "https://ckdatabasews.icloud.com";
	/** photos library container id - shared albums all live under it */
	private static readonly CK_CONTAINER = "com.apple.photos.cloud";
	/**
	 * telemetry params, not auth - apple accepts any value, but keeping the
	 * observed build string makes requests indistinguishable from photos.web
	 */
	private static readonly CK_BUILD = "2630Build17";
	private static readonly CK_RECORD_TYPE =
		"CPLAssetAndMasterByAssetDateWithoutHiddenOrDeleted";
	private static readonly CK_PAGE_SIZE = 200;
	private static readonly CK_MAX_PAGES = 50;
	private static readonly TARGET_WIDTH = 2048;

	/**
	 * @param resolveBaseUrl - host that mints anonymous share tokens
	 */
	constructor(
		private readonly resolveBaseUrl = CloudKitClient.DEFAULT_RESOLVE_BASE,
	) {
		this.resolveHttp = ky.create({ prefix: this.resolveBaseUrl });
	}

	private readonly resolveHttp: KyInstance;

	/**
	 * Telemetry-only build params appended to every cloudkit call; apple
	 * accepts anything, keeping the observed build string makes requests
	 * indistinguishable from photos.web.
	 */
	private static get buildParams(): Record<string, string> {
		const b = CloudKitClient.CK_BUILD;
		return { clientBuildNumber: b, clientMasteringNumber: b };
	}

	/**
	 * Pick the smallest derivative covering TARGET_WIDTH (falling back to
	 * the largest available). `res*Vid*Res` entries are video tracks.
	 */
	private pickSource(
		fields: Record<string, CkValue>,
	): { src: string; width: number; height: number } | null {
		let best: { src: string; width: number; height: number } | null = null;
		let fallback: { src: string; width: number; height: number } | null = null;
		for (const [key, entry] of Object.entries(fields)) {
			if (
				!key.startsWith("res") ||
				!key.endsWith("Res") ||
				key.includes("Vid")
			) {
				continue;
			}
			const value = entry.value as { downloadURL?: string } | undefined;
			const src = value?.downloadURL;
			if (!src || src === "null") continue;
			const stem = key.slice(0, -"Res".length);
			const width = ckNumber(fields, `${stem}Width`);
			const height = ckNumber(fields, `${stem}Height`);
			const candidate = { src, width, height };
			if (
				width >= CloudKitClient.TARGET_WIDTH &&
				(best === null || width < best.width)
			) {
				best = candidate;
			}
			if (fallback === null || width > fallback.width) {
				fallback = candidate;
			}
		}
		return best ?? fallback;
	}

	/**
	 * Mint the anonymous access token + discover the partition host.
	 * @param token - the share token from a `share.icloud.com/photos/…` url
	 */
	private async resolveShare(token: string): Promise<CkResolveResult> {
		const res = await this.resolveHttp.post(
			`database/1/${CloudKitClient.CK_CONTAINER}/production/public/records/resolve`,
			{
				json: { shortGUIDs: [{ value: token }] },
				searchParams: CloudKitClient.buildParams,
			},
		);
		if (!res.ok) throw new Error(`records/resolve ${res.status}`);
		const record = (await res.json<{ results?: CkResolveResult[] }>())
			.results?.[0];
		if (!record) throw new Error("records/resolve returned no results");
		return record;
	}

	/**
	 * One page of the shared-zone asset index; downloadURLs arrive inline.
	 */
	private async queryAssets(
		partitionBase: string,
		accessToken: string,
		zoneID: CkResolveResult["zoneID"],
		marker: string | null,
	): Promise<CkQueryResponse> {
		// instance-level publicAccessAuthToken merges with the call-level
		// build params into one query string
		const http = ky.create({
			prefix: partitionBase,
			searchParams: { publicAccessAuthToken: accessToken },
		});
		const body: Record<string, unknown> = {
			query: {
				recordType: CloudKitClient.CK_RECORD_TYPE,
				filterBy: [
					{
						fieldName: "direction",
						comparator: "EQUALS",
						fieldValue: { value: "DESCENDING", type: "STRING" },
					},
				],
			},
			zoneID,
			resultsLimit: CloudKitClient.CK_PAGE_SIZE,
			...(marker ? { continuationMarker: marker } : {}),
		};
		const res = await http.post(
			`database/1/${CloudKitClient.CK_CONTAINER}/production/shared/records/query`,
			{ json: body, searchParams: CloudKitClient.buildParams },
		);
		if (!res.ok) throw new Error(`records/query ${res.status}`);
		return res.json();
	}

	/**
	 * Resolve a cloudkit share token into the full photo list, paging until
	 * the continuation marker runs out (50-page safety ceiling).
	 * @throws {Error} when apple answers non-2xx at any step
	 */
	async resolve(token: string): Promise<SharedAlbumResult> {
		const resolved = await this.resolveShare(token);
		const { zoneID, anonymousPublicAccess: access } = resolved;
		const partitionBase = access.databasePartition.replace(/:443$/, "");
		const albumTitle =
			(resolved.share?.fields?.["cloudkit.title"]?.value as
				| string
				| undefined) ?? null;

		const photos: SharedPhoto[] = [];
		let marker: string | null = null;
		let pages = 0;
		do {
			const page = await this.queryAssets(
				partitionBase,
				access.token,
				zoneID,
				marker,
			);
			for (const record of page.records ?? []) {
				if (record.recordType !== "CPLMaster" || !record.fields) continue;
				const itemType = ckString(record.fields, "itemType").toLowerCase();
				if (itemType.includes("movie") || itemType.includes("video")) continue;
				const source = this.pickSource(record.fields);
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
		} while (marker && pages < CloudKitClient.CK_MAX_PAGES);

		photos.sort((a, b) => a.takenAt.localeCompare(b.takenAt));
		return { ok: true, albumTitle, photos };
	}
}

export const cloudKitClient = new CloudKitClient();
