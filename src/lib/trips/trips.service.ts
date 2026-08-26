/*
trips http surface - createServerFn must live at module scope. handlers
dynamic-import ./trips.service.impl so the service/repo/postgres graph
stays out of the client bundle (see impl header for why this is split).
*/

import { createServerFn } from "@tanstack/react-start";

import type { Trip } from "#/content/trips";

import type { SaveTripInput } from "./trips.service.impl";

export type { SaveResult, SaveTripInput } from "./trips.service.impl";

// --- http surface (server fns must live at module scope) ---------------

export const getTripsServer = createServerFn({ method: "GET" }).handler(
	async (): Promise<Trip[]> =>
		(await import("./trips.service.impl")).tripsService.listAll(),
);

export const getTripServer = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(
		async ({ data: slug }): Promise<Trip | null> =>
			(await import("./trips.service.impl")).tripsService.getBySlug(slug),
	);

export const saveTrip = createServerFn({ method: "POST" })
	.validator((input: SaveTripInput) => ({
		token: input.token ?? "",
		slug: input.slug?.trim() ?? "",
		title: input.title?.trim() ?? "",
		location: input.location?.trim() ?? "",
		start: input.start ?? "",
		end: input.end ?? "",
		blurb: input.blurb ?? "",
		sharedAlbumUrl: input.sharedAlbumUrl?.trim() ?? "",
	}))
	.handler(async ({ data }) =>
		(await import("./trips.service.impl")).tripsService.saveTrip(data),
	);

export const deleteTrip = createServerFn({ method: "POST" })
	.validator((input: { token: string; slug: string }) => input)
	.handler(async ({ data }) =>
		(await import("./trips.service.impl")).tripsService.deleteTrip(data),
	);
