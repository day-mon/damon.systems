import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";

import { getSharedAlbum } from "#/lib/shared-album/shared-album.service";

export const sharedAlbumKeys = createQueryKeys("shared-album", {
	preview: (url: string) => [url],
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
