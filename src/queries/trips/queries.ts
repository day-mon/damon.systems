import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getTrip, getTrips } from "#/lib/trips/trips.repo";

export const listTripsServer = createServerFn({ method: "GET" }).handler(() =>
	getTrips(),
);

export const tripDetailServer = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data: slug }) => getTrip(slug));

export const tripsQuery = () =>
	queryOptions({
		queryKey: ["trips"],
		queryFn: () => listTripsServer(),
		staleTime: 60_000,
	});

export const tripQuery = (slug: string) =>
	queryOptions({
		queryKey: ["trips", slug],
		queryFn: () => tripDetailServer({ data: slug }),
		staleTime: 60_000,
	});
