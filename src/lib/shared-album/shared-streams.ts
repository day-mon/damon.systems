/*
legacy icloud shared streams (sharedalbum/#<token> links).

    p<partition>-sharedstreams.icloud.com/webstream  -> photo records
    webasseturls                                    -> signed cdn urls

the partition is derived from the token; a wrong-partition guess answers
with a 330 redirect that carries the correct host, so one retry settles it.
shape ported from llun/blog libs/apple/webstream.ts.
*/

import ky from "ky";

import type { SharedAlbumResult, SharedPhoto } from "./types";

interface Assets {
	items: Record<
		string,
		{ url_expiry: string; url_location: string; url_path: string }
	>;
	locations: Record<string, { hosts: string[]; scheme: string }>;
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

/**
 * Talks to apple's pre-cloudkit shared-streams endpoints.
 *
 * Partition routing is token-derived (and corrected by a 330 redirect on
 * guess misses), so the ky prefixUrl is built per-request from a host
 * template rather than fixed in the constructor.
 */
export class SharedStreamsClient {
	private static readonly PHOTO_APP_UA =
		"Photos/5.0 (Macintosh; OS X 10.15.4) AppleWebKit/605.1.15";
	private static readonly BASE62 =
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	private static readonly TARGET_WIDTH = 2048;

	private static base62ToInt(input: string): number {
		return Array.from(input).reduce(
			(acc, ch) => acc * 62 + SharedStreamsClient.BASE62.indexOf(ch),
			0,
		);
	}

	private static partitionFromToken(token: string): number {
		return token[0] === "A"
			? SharedStreamsClient.base62ToInt(token[1])
			: SharedStreamsClient.base62ToInt(token.substring(1, 3));
	}

	/**
	 * @param baseUrlTemplate - scheme://host root; partition substituted in
	 */
	constructor(
		private readonly baseUrlTemplate = "https://p%p-sharedstreams.icloud.com",
	) {}

	/** bound ky instance for one partition base */
	private http(partition: number) {
		return ky.create({
			prefix: this.baseUrlTemplate.replace(
				"%p",
				partition.toString().padStart(2, "0"),
			),
			headers: { "content-type": "text/plain" },
			throwHttpErrors: false,
		});
	}

	/**
	 * Resolve a legacy album token into its photo list.
	 * @param token - the `#<token>` fragment of an icloud sharedalbum url
	 * @throws {Error} when apple answers non-2xx at any step
	 */
	async resolve(token: string): Promise<SharedAlbumResult> {
		let partition = SharedStreamsClient.partitionFromToken(token);
		const request = {
			headers: {
				"content-type": "text/plain",
				"user-agent": SharedStreamsClient.PHOTO_APP_UA,
			},
			throwHttpErrors: false,
			body: JSON.stringify({ streamCtag: null }),
		};

		let res = await this.http(partition).post(
			`${token}/sharedstreams/webstream`,
			request,
		);
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
					[...sorted]
						.reverse()
						.find((d) => d.width <= SharedStreamsClient.TARGET_WIDTH) ??
					sorted[sorted.length - 1];
				return { photo, derivative };
			})
			.filter(
				(entry): entry is { photo: StreamPhoto; derivative: Derivative } =>
					entry !== null,
			);
		const checksums = photos.map((entry) => entry.derivative.checksum);

		const assetsRes = await this.http(partition).post(
			`${token}/sharedstreams/webasseturls`,
			{ body: JSON.stringify({ photoGuids: checksums }) },
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
}

export const sharedStreamsClient = new SharedStreamsClient();
