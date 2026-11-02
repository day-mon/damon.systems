/*
photo ingest — one file per call so uploads can stream per-file progress.
auth = authentik session (group-gated upstream).
*/

import { createFileRoute } from "@tanstack/react-router";

import { getAuth } from "#/lib/authz/better";
import { storage } from "#/lib/trips/storage/service";

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

const jsonError = (error: string, status: number) => Response.json({ error }, { status });

export const Route = createFileRoute("/api/trips/upload-photo")({
	server: {
		handlers: {
			POST: async ({ request }) =>
				getAuth()
					.api.getSession({ headers: request.headers })
					.then((session): Promise<FormData> =>
						session ? request.formData() : Promise.reject(new Error("unauthenticated")),
					)
					.then((fd) => {
						const slug = String(fd.get("slug") ?? "");
						const file = fd.get("photo");

						if (!SLUG.test(slug)) throw new Error("bad slug");

						if (!(file instanceof File)) throw new Error("no photo");

						return file.arrayBuffer().then(async (ab) => {
							const url = await storage.uploadPhoto(slug, file.name, Buffer.from(ab));

							return Response.json({ url });
						});
					})
					.catch((e) => {
						const message = e instanceof Error ? e.message : "upload failed";

						return jsonError(message, message === "unauthenticated" ? 401 : 400);
					}),
		},
	},
});
