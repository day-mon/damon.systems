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
import { type SharedAlbumResult, tokenFromShareUrl } from "./types";

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
