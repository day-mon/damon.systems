/*
admin trip editor — tanstack form fields, map-click coords, photo uploads that
stream in the background while you're free to wander. same page handles create
(slug "new") and edit.
*/

import { useForm } from "@tanstack/react-form";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

import type { TripMeta } from "#/lib/trips/types";
import { uploadStore } from "#/lib/upload-store";
import { saveTripMeta } from "#/queries/trips/manage";
import { tripQuery } from "#/queries/trips/queries";
import CoordPicker from "./admin.trips.$slug/-coord-picker";

export const Route = createFileRoute("/admin/trips/$slug")({
	component: TripEditorPage,
});

interface TripForm {
	slug: string;
	slugManual: boolean;
	name: string;
	place: string;
	from: string;
	to: string;
	rating: number;
	lat: string;
	lng: string;
	blurb: string;
	photos: File[];
}

const EMPTY: TripForm = {
	slug: "",
	slugManual: false,
	name: "",
	place: "",
	from: "",
	to: "",
	rating: 4,
	lat: "",
	lng: "",
	blurb: "",
	photos: [],
};

function slugify(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const INPUT =
	"w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring";

const LABEL = "mb-1 block text-muted-foreground text-xs";

async function streamPhotos(slug: string, files: File[]): Promise<void> {
	for (const f of files) {
		const fd = new FormData();
		fd.set("slug", slug);
		fd.set("photo", f);

		const res = await fetch("/api/trips/upload-photo", { method: "POST", body: fd });
		const body: { url?: string; error?: string } = await res.json().catch(() => ({}));

		if (!res.ok || !body.url) {
			throw new Error(body.error ?? `${f.name} → http ${res.status}`);
		}

		const j = uploadStore.get();

		if (j) uploadStore.progress(j.done + 1);
	}
}

function TripEditorPage() {
	const { slug: routeSlug } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isNew = routeSlug === "new";

	const baseQuery = tripQuery(routeSlug);
	const { data: trip } = useQuery({ ...baseQuery, queryFn: isNew ? skipToken : baseQuery.queryFn });

	const [serverError, setServerError] = useState<string | null>(null);
	// object-url previews keyed to the actual File objects held in form state
	const photoPreviews = useRef(new Map<File, string>());

	const form = useForm({
		defaultValues: EMPTY,
		onSubmit: ({ value }) => submit(value),
	});

	// edit mode: once the trip lands, seed every field
	if (!isNew && trip && form.state.values.name === "") {
		form.reset({
			slug: routeSlug,
			slugManual: true,
			name: trip.name,
			place: trip.place,
			from: trip.dates[0],
			to: trip.dates[1],
			rating: trip.rating,
			lat: String(trip.lat),
			lng: String(trip.lng),
			blurb: trip.blurb,
			photos: [],
		});
	}

	const submit = (value: TripForm) => {
		const useSlug = value.slug || slugify(value.name);

		const meta: TripMeta = {
			name: value.name,
			place: value.place,
			dates: [value.from, value.to],
			rating: value.rating,
			lat: Number(value.lat),
			lng: Number(value.lng),
			blurb: value.blurb,
		};

		saveTripMeta({ data: { slug: useSlug, meta } })
			.then(() => {
				const files = value.photos;

				if (files.length > 0) {
					uploadStore.start({ slug: useSlug, name: value.name, done: 0, total: files.length });
					streamPhotos(useSlug, files)
						.then(() => {
							uploadStore.finish();
							queryClient.invalidateQueries({ queryKey: ["trips"] });
							queryClient.invalidateQueries({ queryKey: ["trips", useSlug] });
						})
						.catch((e) => {
							if (uploadStore.get()) {
								uploadStore.fail(e instanceof Error ? e.message : "upload failed");
							}
						});
				}

				navigate({ to: "/travel/$slug", params: { slug: useSlug } });
			})
			.catch((e) => setServerError(e instanceof Error ? e.message : "save failed"));
	};

	return (
		<div className="mt-10">
			<div className="flex items-baseline justify-between">
				<h2 className="m-0 font-light text-2xl tracking-tight">
					{isNew ? "new trip" : "edit · trip"}
				</h2>
				<Link to="/admin" className="text-muted-foreground text-xs hover:text-foreground">
					← admin
				</Link>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="mt-6 grid grid-cols-2 gap-4"
			>
				<div className="col-span-2">
					<form.Field
						name="name"
						validators={{ onSubmit: ({ value }) => (!value.trim() ? "required" : undefined) }}
					>
						{(f) => (
							<>
								<label className={LABEL} htmlFor={f.name}>name</label>
								<input
									id={f.name}
									className={INPUT}
									value={f.state.value}
									onBlur={f.handleBlur}
									onChange={(e) => {
										f.handleChange(e.target.value);

										if (isNew && !form.state.values.slugManual) {
											form.setFieldValue("slug", slugify(e.target.value));
										}
									}}
									placeholder="alaska"
								/>
							</>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field
						name="slug"
						validators={{ onSubmit: ({ value }) => (!value.trim() ? "required" : undefined) }}
					>
						{(f) => (
							<>
								<label className={LABEL} htmlFor={f.name}>slug</label>
								<input
									id={f.name}
									className={INPUT}
									value={f.state.value}
									onBlur={f.handleBlur}
									onInput={() => form.setFieldValue("slugManual", true)}
									onChange={(e) => f.handleChange(e.target.value)}
									placeholder="alaska-2025"
								/>
							</>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="place">
						{(f) => (
							<>
								<label className={LABEL} htmlFor={f.name}>place (itin)</label>
								<input
									id={f.name}
									className={INPUT}
									value={f.state.value}
									onBlur={f.handleBlur}
									onChange={(e) => f.handleChange(e.target.value)}
									placeholder="anchorage → denali"
								/>
							</>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="from" validators={{ onSubmit: ({ value }) => (!value ? "required" : undefined) }}>
						{(f) => (
							<>
								<label className={LABEL} htmlFor={f.name}>from</label>
								<input
									id={f.name}
									type="date"
									className={INPUT}
									value={f.state.value}
									onBlur={f.handleBlur}
									onChange={(e) => f.handleChange(e.target.value)}
								/>
							</>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="to" validators={{ onSubmit: ({ value }) => (!value ? "required" : undefined) }}>
						{(f) => (
							<>
								<label className={LABEL} htmlFor={f.name}>to</label>
								<input
									id={f.name}
									type="date"
									className={INPUT}
									value={f.state.value}
									onBlur={f.handleBlur}
									onChange={(e) => f.handleChange(e.target.value)}
								/>
							</>
						)}
					</form.Field>
				</div>

				<div className="col-span-2">
					<form.Field name="rating">
						{(f) => (
							<>
								<label className={LABEL} htmlFor={f.name}>
									rating — <span className="text-foreground">{f.state.value}</span> / 5
								</label>
								<input
									id={f.name}
									type="range"
									min={0}
									max={5}
									step={0.5}
									value={f.state.value}
									onChange={(e) => f.handleChange(Number(e.target.value))}
									className="w-full accent-foreground"
								/>
							</>
						)}
					</form.Field>
				</div>

				<div className="col-span-2">
					<label className={LABEL}>where (click the map)</label>
					<form.Subscribe selector={(s) => [s.values.lat, s.values.lng]}>
						{([lat, lng]) => (
							<CoordPicker
								lat={String(lat)}
								lng={String(lng)}
								onPick={(la, lo) => {
									form.setFieldValue("lat", la.toFixed(5));
									form.setFieldValue("lng", lo.toFixed(5));
								}}
							/>
						)}
					</form.Subscribe>
				</div>

				<div>
					<form.Field name="lat" validators={{ onSubmit: ({ value }) => (!value ? "pin the map" : undefined) }}>
						{(f) => (
							<>
								<label className={LABEL} htmlFor={f.name}>lat</label>
								<input
									id={f.name}
									className={INPUT}
									value={f.state.value}
									onBlur={f.handleBlur}
									onChange={(e) => f.handleChange(e.target.value)}
									placeholder="61.2"
									inputMode="decimal"
								/>
							</>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="lng" validators={{ onSubmit: ({ value }) => (!value ? "pin the map" : undefined) }}>
						{(f) => (
							<>
								<label className={LABEL} htmlFor={f.name}>lng</label>
								<input
									id={f.name}
									className={INPUT}
									value={f.state.value}
									onBlur={f.handleBlur}
									onChange={(e) => f.handleChange(e.target.value)}
									placeholder="-149.9"
									inputMode="decimal"
								/>
							</>
						)}
					</form.Field>
				</div>

				<div className="col-span-2">
					<form.Field
						name="blurb"
						validators={{ onSubmit: ({ value }) => (!value.trim() ? "required" : undefined) }}
					>
						{(f) => (
							<>
								<label className={LABEL} htmlFor={f.name}>blurb (wheels-down review)</label>
								<textarea
									id={f.name}
									className={`${INPUT} min-h-28`}
									value={f.state.value}
									onBlur={f.handleBlur}
									onChange={(e) => f.handleChange(e.target.value)}
									placeholder="what it felt like when the wheels touched down…"
								/>
							</>
						)}
					</form.Field>
				</div>

				<div className="col-span-2">
					<form.Field name="photos">
						{(f) => {
							for (const file of f.state.value) {
								if (!photoPreviews.current.has(file)) {
									photoPreviews.current.set(file, URL.createObjectURL(file));
								}
							}

							return (
								<>
									<label className={LABEL}>photos — upload happens in the background</label>
									<input
										type="file"
										multiple
										accept="image/*"
										className="text-sm"
										onChange={(e) => f.handleChange(Array.from(e.target.files ?? []))}
									/>
									{f.state.value.length > 0 && (
										<div className="mt-3 grid grid-cols-4 gap-2">
											{f.state.value.map((file) => (
												<img
													key={file.name + file.size}
													src={photoPreviews.current.get(file)}
													alt={file.name}
													className="aspect-square w-full rounded object-cover"
												/>
											))}
										</div>
									)}
								</>
							);
						}}
					</form.Field>
				</div>
			</form>

			<div className="mt-6 flex items-center gap-4">
				<form.Subscribe selector={(s) => [s.isSubmitting]}>
					{([submitting]) => (
						<button
							type="button"
							onClick={() => form.handleSubmit()}
							disabled={submitting}
							className="rounded-lg border border-border px-4 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-50"
						>
							{submitting ? "saving…" : isNew ? "create trip" : "save"}
						</button>
					)}
				</form.Subscribe>
				{serverError && <span className="text-destructive text-xs">{serverError}</span>}
			</div>
		</div>
	);
}
