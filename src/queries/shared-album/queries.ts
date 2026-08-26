import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
	getSharedAlbum,
	getSharedAlbumPage,
} from "#/lib/shared-album/shared-album.service";

export const sharedAlbumKeys = createQueryKeys("shared-album", {
	preview: (url: string) => [url],
	pages: (url: string) => [url],
});

// 5-minute staleTime mirrors the server-side cache window - re-clicking
// fetch inside it is a cache hit end to end. retry: 0 because resolve
// failures (offline album, bad link) won't fix themselves in 60s.
// Pass { enabled: false } and drive it with refetch() when the fetch
// should only happen on an explicit user action.
export function useSharedAlbumPreview(
	url: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		...sharedAlbumKeys.preview(url),
		queryFn: () => getSharedAlbum({ data: url }),
		enabled: options?.enabled ?? url !== "",
		staleTime: 5 * 60 * 1000,
		retry: 0,
	});
}

// infinite-scroll paged album: server fn slices the 5-minute cached album,
// so every next-page hit after the first is an in-memory server slice
const PAGE_SIZE = 60;

export function useSharedAlbumPages(url: string) {
	return useInfiniteQuery({
		...sharedAlbumKeys.pages(url),
		queryFn: ({ pageParam }) =>
			getSharedAlbumPage({
				data: { url, offset: pageParam, limit: PAGE_SIZE },
			}),
		initialPageParam: 0,
		getNextPageParam: (last) => {
			if (!last.ok) return undefined;
			const consumed = last.offset + last.photos.length;
			return consumed < last.total ? consumed : undefined;
		},
		staleTime: 5 * 60 * 1000,
		retry: 0,
	});
}
