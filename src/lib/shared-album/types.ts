/*
domain types shared by both icloud album generations (see the sibling
client modules) and by the travel routes consuming resolved albums.
*/

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

// slice of a resolved album for infinite-scroll consumers
export interface SharedAlbumPage {
	ok: boolean;
	albumTitle: string | null;
	photos: SharedPhoto[];
	total: number;
	offset: number;
}

export type ShareKind = "legacy" | "cloudkit";

export interface ShareToken {
	kind: ShareKind;
	token: string;
}

// old fragment links:  https://www.icloud.com/sharedalbum/#<token>
// modern cloudkit:     https://photos.icloud.com/shared/album/<token>
//                      https://share.icloud.com/photos/<token>
export function tokenFromShareUrl(shareUrl: string): ShareToken {
	const legacy = shareUrl.match(/sharedalbum\/#([\w-]+)/);
	if (legacy) return { kind: "legacy", token: legacy[1] };
	const cloudkit = shareUrl.match(/shared\/album\/([\w-]+)/);
	if (cloudkit) return { kind: "cloudkit", token: cloudkit[1] };
	const share = shareUrl.match(/share\.icloud\.com\/photos\/([\w-]+)/);
	if (share) return { kind: "cloudkit", token: share[1] };
	throw new Error("cannot parse icloud share token from url");
}
