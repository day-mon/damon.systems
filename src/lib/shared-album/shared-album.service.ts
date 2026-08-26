/*
shared-album service: the single public entry point for turning an icloud
share url into a resolved photo list.

picks the right generation (legacy shared streams vs modern cloudkit) off
the url shape, caches results in-module for five minutes, and exposes the
resolution through a server fn so client-side route loaders can call it
without tripping over cors on apple's hosts.
*/

import { createServerFn } from "@tanstack/react-start";

import { cloudKitClient } from "./cloudkit";
import { sharedStreamsClient } from "./shared-streams";
import {
	type SharedAlbumPage,
	type SharedAlbumResult,
	tokenFromShareUrl,
} from "./types";

const CACHE_TTL_MS = 5 * 60 * 1000;

export class SharedAlbumService {
	private cache = new Map<string, { at: number; value: SharedAlbumResult }>();

	async resolve(shareUrl: string): Promise<SharedAlbumResult> {
		const cached = this.cache.get(shareUrl);
		if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
			return cached.value;
		}

		const { kind, token } = tokenFromShareUrl(shareUrl);
		const value =
			kind === "legacy"
				? await sharedStreamsClient.resolve(token)
				: await cloudKitClient.resolve(token);
		this.cache.set(shareUrl, { at: Date.now(), value });
		return value;
	}

	/**
	 * Paged view over resolve() for infinite-scroll consumers: the full
	 * album resolves once and pages slice the cached result, so scrolling
	 * past the five-minute ttl may refresh page one mid-scroll but never
	 * refetches apple's api per scroll event.
	 */
	async resolvePage(
		shareUrl: string,
		offset: number,
		limit: number,
	): Promise<SharedAlbumPage> {
		const album = await this.resolve(shareUrl);
		return {
			ok: album.ok,
			albumTitle: album.albumTitle,
			photos: album.photos.slice(offset, offset + limit),
			total: album.photos.length,
			offset,
		};
	}
}

export const sharedAlbumService = new SharedAlbumService();

export const getSharedAlbum = createServerFn({ method: "GET" })
	.validator((shareUrl: string) => {
		if (!shareUrl) throw new Error("shareUrl is required");
		return shareUrl;
	})
	.handler(async ({ data: shareUrl }) => {
		try {
			return await sharedAlbumService.resolve(shareUrl);
		} catch (err) {
			console.error("[shared-album] resolve failed:", err);
			return { ok: false, albumTitle: null, photos: [] };
		}
	});

// paged variant for infinite scroll - same cache, sliced output
export const getSharedAlbumPage = createServerFn({ method: "GET" })
	.validator(
		(input: { url: string; offset: number; limit: number }) => ({
			url: input.url,
			offset: Math.max(0, Math.floor(Number(input.offset) || 0)),
			limit: Math.min(
				200,
				Math.max(1, Math.floor(Number(input.limit) || 60)),
			),
		}),
	)
	.handler(async ({ data }) => {
		try {
			return await sharedAlbumService.resolvePage(
				data.url,
				data.offset,
				data.limit,
			);
		} catch (err) {
			console.error("[shared-album] page resolve failed:", err);
			return {
				ok: false,
				albumTitle: null,
				photos: [],
				total: 0,
				offset: data.offset,
			};
		}
	});
