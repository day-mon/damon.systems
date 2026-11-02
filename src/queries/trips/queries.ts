import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { trips } from "#/lib/trips/catalog";

export const listTripsServer = createServerFn({ method: "GET" }).handler(() =>
	trips.list(),
);

export const tripDetailServer = createServerFn({ method: "GET" })
	.validator((slug: string) => slug)
	.handler(({ data: slug }) => trips.get(slug));

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
