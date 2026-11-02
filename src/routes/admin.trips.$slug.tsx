/*
admin trip editor — meta fields + photo upload. the same page handles create
(slug "new") and edit (existing slug): save meta, then stream photos to b2.
*/

import { skipToken, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import type { TripMeta } from "#/lib/trips/types";
import { saveTripMeta, uploadTripPhotos } from "#/queries/trips/manage";
import { tripQuery } from "#/queries/trips/queries";
import { mySession } from "#/queries/session/queries";

export const Route = createFileRoute("/admin/trips/$slug")({
	beforeLoad: async () => {
		const session = await mySession();

		if (!session) throw redirect({ href: "/auth/login" });

		return { session };
	},
	component: TripEditorPage,
});

interface FormState {
	slug: string;
	name: string;
	place: string;
	from: string;
	to: string;
	rating: number;
	lat: string;
	lng: string;
	blurb: string;
}

const EMPTY: FormState = {
	slug: "",
	name: "",
	place: "",
	from: "",
	to: "",
	rating: 4,
	lat: "",
	lng: "",
	blurb: "",
};

function useField(setUrlFn: (p: (s: FormState) => FormState) => void) {
	return function set<K extends keyof FormState>(key: K) {
		return (
			e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
		) =>
			setUrlFn((s) => ({
				...s,
				[key]: key === "rating" ? Number(e.target.value) : e.target.value,
			}));
	};
}

function slugify(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function TripEditorPage() {
	const { slug } = Route.useParams();
	const navigate = useNavigate();
	const isNew = slug === "new";

	const baseQuery = tripQuery(slug);
	const { data: trip } = useQuery({ ...baseQuery, queryFn: isNew ? skipToken : baseQuery.queryFn });

	const [form, setForm] = useState<FormState>(() => EMPTY);
	const [slugTouched, setSlugTouched] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [photos, setPhotos] = useState<FileList | null>(null);
	const [previews, setPreviews] = useState<string[]>([]);
	const [status, setStatus] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	// fill once the trip data arrives (edit mode)
	if (!isNew && trip && !loaded) {
		setForm({
			slug,
			name: trip.name,
			place: trip.place,
			from: trip.dates[0],
			to: trip.dates[1],
			rating: trip.rating,
			lat: String(trip.lat),
			lng: String(trip.lng),
			blurb: trip.blurb,
		});
		setLoaded(true);
	}

	const set = useField(setForm);

	const onPickPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPhotos(e.target.files);
		setPreviews(
			Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)),
		);
	};

	const submit = () => {
		const useSlug = form.slug || slugify(form.name);

		if (!useSlug || !form.name) {
			setStatus("name and slug are required");

			return;
		}

		setBusy(true);
		setStatus("saving meta…");

		const meta: TripMeta = {
			name: form.name,
			place: form.place,
			dates: [form.from, form.to],
			rating: form.rating,
			lat: Number(form.lat),
			lng: Number(form.lng),
			blurb: form.blurb,
		};

		saveTripMeta({ data: { slug: useSlug, meta } })
			.then(() => {
				if (!photos || photos.length === 0) return null;

				setStatus(`uploading ${photos.length} photo(s)…`);

				const fd = new FormData();
				fd.set("slug", useSlug);

				for (const f of Array.from(photos)) fd.append("photos", f);

				return uploadTripPhotos({ data: fd });
			})
			.then(() => {
				setStatus("saved ✓");
				setBusy(false);
				navigate({ to: "/admin" });
			})
			.catch((e) => {
				setBusy(false);
				setStatus(String(e));
			});
	};

	const inputCls = "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring";
	const labelCls = "mb-1 block text-muted-foreground text-xs";

	return (
		<main className="mx-auto max-w-2xl px-8 pt-12 pb-20">
			<div className="flex items-baseline justify-between">
				<h1 className="m-0 font-light text-2xl tracking-tight">
					{isNew ? "new trip" : `edit · ${form.name || slug}`}
				</h1>
				<Link
					to="/admin"
					className="text-muted-foreground text-xs hover:text-foreground"
				>
					← admin
				</Link>
			</div>

			<div className="mt-6 grid grid-cols-2 gap-4">
				<div className="col-span-2">
					<label className={labelCls}>name</label>
					<input
						className={inputCls}
						value={form.name}
						onChange={(e) => {
							set("name")(e);

							if (isNew && !slugTouched) {
								setForm((s0) => ({ ...s0, name: e.target.value, slug: slugify(e.target.value) }));
							}
						}}
						placeholder="japan"
					/>
				</div>

				<div>
					<label className={labelCls}>slug</label>
					<input
						className={inputCls}
						value={form.slug}
						onFocus={() => setSlugTouched(true)}
						onInput={() => setSlugTouched(true)}
						onChange={set("slug")}
						placeholder="japan-2024"
					/>
				</div>

				<div>
					<label className={labelCls}>place (itin)</label>
					<input className={inputCls} value={form.place} onChange={set("place")} placeholder="tokyo → kyoto" />
				</div>

				<div>
					<label className={labelCls}>from</label>
					<input type="date" className={inputCls} value={form.from} onChange={set("from")} />
				</div>

				<div>
					<label className={labelCls}>to</label>
					<input type="date" className={inputCls} value={form.to} onChange={set("to")} />
				</div>

				<div>
					<label className={labelCls}>rating</label>
					<select className={inputCls} value={form.rating} onChange={set("rating")}>
						{[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((r) => (
							<option key={r} value={r}>{r}</option>
						))}
					</select>
				</div>

				<div>
					<label className={labelCls}>lat</label>
					<input className={inputCls} value={form.lat} onChange={set("lat")} placeholder="35.68" inputMode="decimal" />
				</div>

				<div>
					<label className={labelCls}>lng</label>
					<input className={inputCls} value={form.lng} onChange={set("lng")} placeholder="139.69" inputMode="decimal" />
				</div>

				<div className="col-span-2">
					<label className={labelCls}>blurb (wheels-down review)</label>
					<textarea
						className={`${inputCls} min-h-28`}
						value={form.blurb}
						onChange={set("blurb")}
						placeholder="what it felt like when the wheels touched down…"
					/>
				</div>

				<div className="col-span-2">
					<label className={labelCls}>photos</label>
					<input type="file" multiple accept="image/*" onChange={onPickPhotos} className="text-sm" />
				</div>

				{previews.length > 0 && (
					<div className="col-span-2 grid grid-cols-4 gap-2">
						{previews.map((p) => (
							<img key={p} src={p} alt="" className="aspect-square w-full rounded object-cover" />
						))}
					</div>
				)}
			</div>

			<div className="mt-6 flex items-center gap-4">
				<button
					type="button"
					onClick={submit}
					disabled={busy}
					className="rounded-lg border border-border px-4 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-50"
				>
					{busy ? "working…" : isNew ? "create trip" : "save"}
				</button>
				{status && <span className="text-muted-foreground text-xs">{status}</span>}
			</div>
		</main>
	);
}
