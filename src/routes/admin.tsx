/*
hidden admin portal (/admin) - not linked anywhere in the ui.

paste an icloud share url, hit "fetch album" to pull the real photo
count and prefill the date range, fill the story bits, save. writes go
to the travel_trips postgres table through an ADMIN_TOKEN-guarded
server fn.
*/

import * as stylex from "@stylexjs/stylex";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { getSharedAlbum } from "#/lib/shared-album/shared-album.service";
import { saveTrip } from "#/lib/trips/trips.service";

export const Route = createFileRoute("/admin")({
	head: () => ({
		meta: [{ title: "admin" }, { name: "robots", content: "noindex" }],
	}),
	ssr: false,
	component: AdminPortal,
});

const fadeIn = stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });

const styles = stylex.create({
	main: {
		maxWidth: "36rem",
		marginInline: "auto",
		paddingInline: 16,
		paddingBlock: 64,
		animationName: fadeIn,
		animationDuration: "0.4s",
		animationTimingFunction: "ease-out",
	},
	title: {
		fontSize: "1.5rem",
		fontWeight: 300,
		letterSpacing: "-0.025em",
		marginBottom: 32,
	},
	field: {
		display: "flex",
		flexDirection: "column",
		gap: 6,
		marginBottom: 16,
	},
	label: {
		fontSize: "0.75rem",
		letterSpacing: "0.06em",
		textTransform: "uppercase",
		color: "rgb(var(--colors-foregroundMuted))",
	},
	input: {
		fontFamily: "Space Grotesk Variable, sans-serif",
		fontSize: "0.9375rem",
		color: "rgb(var(--colors-foreground))",
		backgroundColor: "transparent",
		border: "1px solid rgb(var(--colors-foreground) / 0.2)",
		borderRadius: 6,
		paddingInline: 10,
		paddingBlock: 8,
		outline: "none",
	},
	textarea: {
		minHeight: 72,
		resize: "vertical",
		fontFamily: "inherit",
	},
	row: { display: "flex", gap: 16 },
	half: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
	button: {
		fontFamily: "Space Grotesk Variable, sans-serif",
		fontSize: "0.875rem",
		fontWeight: 500,
		color: "rgb(var(--colors-background))",
		backgroundColor: "rgb(var(--colors-foreground))",
		border: "none",
		borderRadius: 6,
		paddingInline: 16,
		paddingBlock: 10,
		cursor: "pointer",
		opacity: { default: 1, ":disabled": 0.5 },
	},
	statusLine: {
		marginTop: 12,
		fontSize: "0.8125rem",
		fontFamily: "IBM Plex Mono Variable, monospace",
		color: "rgb(var(--colors-foregroundMuted))",
	},
	error: {
		fontSize: "0.75rem",
		fontFamily: "IBM Plex Mono Variable, monospace",
		color: "tomato",
	},
	notice: {
		fontSize: "0.75rem",
		fontFamily: "IBM Plex Mono Variable, monospace",
		color: "rgb(var(--colors-foregroundMuted))",
		marginBottom: 16,
	},
});

interface TripForm {
	token: string;
	sharedAlbumUrl: string;
	slug: string;
	title: string;
	location: string;
	start: string;
	end: string;
	blurb: string;
}

const required = ({ value }: { value: string }) =>
	!value ? "required" : undefined;
const slugRule = ({ value }: { value: string }) =>
	/^[a-z0-9-]+$/.test(value) ? undefined : "lowercase, numbers, dashes";
const dateRule = ({ value }: { value: string }) =>
	/^\d{4}-\d{2}-\d{2}$/.test(value) ? undefined : "YYYY-MM-DD";

function FieldError({ errors }: { errors: unknown[] }) {
	if (errors.length === 0) return null;
	return <span {...stylex.props(styles.error)}>{String(errors[0])}</span>;
}

function AdminPortal() {
	const [albumStatus, setAlbumStatus] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			token: "",
			sharedAlbumUrl: "",
			slug: "",
			title: "",
			location: "",
			start: "",
			end: "",
			blurb: "",
		} satisfies TripForm,
		onSubmit: async ({ value }) => {
			const result = await saveTrip({ data: value });
			if (!result.ok) {
				throw new Error(result.error ?? "save failed");
			}
			window.location.assign(`/travel/${value.slug}`);
		},
		onSubmitInvalid: () => undefined,
	});
	function FetchAlbumButton({
		onStatus,
	}: {
		onStatus: (s: string | null) => void;
	}) {
		const [busy, setBusy] = useState(false);
		return (
			<form.Subscribe selector={(state) => state.values.sharedAlbumUrl}>
				{(url) => (
					<button
						type="button"
						disabled={busy || !url}
						onClick={async () => {
							setBusy(true);
							onStatus("resolving album…");
							const album = await getSharedAlbum({ data: url });
							setBusy(false);
							if (!album.ok) {
								onStatus("album resolve failed");
								return;
							}
							const dates = album.photos
								.map((p) => p.takenAt.slice(0, 10))
								.sort();
							if (dates.length > 0) {
								form.setFieldValue("start", dates[0]);
								form.setFieldValue("end", dates[dates.length - 1]);
							}
							onStatus(
								`${album.photos.length} photos · ${dates[0] ?? "?"} → ${dates[dates.length - 1] ?? "?"} (dates prefilled)`,
							);
						}}
						{...stylex.props(styles.button)}
					>
						{busy ? "fetching…" : "fetch"}
					</button>
				)}
			</form.Subscribe>
		);
	}

	return (
		<main {...stylex.props(styles.main)}>
			<h1 {...stylex.props(styles.title)}>admin · new trip</h1>
			<p {...stylex.props(styles.notice)}>
				hidden route, noindex. saves into postgres travel_trips — the commit
				manifest stays untouched.
			</p>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.Field name="token" validators={{ onChange: required }}>
					{(field) => (
						<div {...stylex.props(styles.field)}>
							<label {...stylex.props(styles.label)}>admin token</label>
							<input
								type="password"
								placeholder="ADMIN_TOKEN env"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								{...stylex.props(styles.input)}
							/>
							<FieldError errors={field.state.meta.errors} />
						</div>
					)}
				</form.Field>

				<div {...stylex.props(styles.row)}>
					<div {...stylex.props(styles.half)}>
						<form.Field name="sharedAlbumUrl">
							{(field) => (
								<div {...stylex.props(styles.field)}>
									<label {...stylex.props(styles.label)}>
										icloud share url
									</label>
									<input
										placeholder="https://share.icloud.com/photos/…"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										{...stylex.props(styles.input)}
									/>
								</div>
							)}
						</form.Field>
					</div>
					<FetchAlbumButton onStatus={setAlbumStatus} />
				</div>
				{albumStatus && (
					<p {...stylex.props(styles.statusLine)}>{albumStatus}</p>
				)}

				<div {...stylex.props(styles.row)}>
					<div {...stylex.props(styles.half)}>
						<form.Field
							name="slug"
							validators={{ onChange: slugRule, onMount: undefined }}
						>
							{(field) => (
								<div {...stylex.props(styles.field)}>
									<label {...stylex.props(styles.label)}>slug</label>
									<input
										placeholder="kebab-case"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										{...stylex.props(styles.input)}
									/>
									<FieldError errors={field.state.meta.errors} />
								</div>
							)}
						</form.Field>
					</div>
					<div {...stylex.props(styles.half)}>
						<form.Field name="title" validators={{ onChange: required }}>
							{(field) => (
								<div {...stylex.props(styles.field)}>
									<label {...stylex.props(styles.label)}>title</label>
									<input
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										{...stylex.props(styles.input)}
									/>
									<FieldError errors={field.state.meta.errors} />
								</div>
							)}
						</form.Field>
					</div>
				</div>

				<form.Field name="location" validators={{ onChange: required }}>
					{(field) => (
						<div {...stylex.props(styles.field)}>
							<label {...stylex.props(styles.label)}>location</label>
							<input
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								{...stylex.props(styles.input)}
							/>
							<FieldError errors={field.state.meta.errors} />
						</div>
					)}
				</form.Field>

				<div {...stylex.props(styles.row)}>
					<div {...stylex.props(styles.half)}>
						<form.Field name="start" validators={{ onChange: dateRule }}>
							{(field) => (
								<div {...stylex.props(styles.field)}>
									<label {...stylex.props(styles.label)}>start</label>
									<input
										type="date"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										{...stylex.props(styles.input)}
									/>
									<FieldError errors={field.state.meta.errors} />
								</div>
							)}
						</form.Field>
					</div>
					<div {...stylex.props(styles.half)}>
						<form.Field name="end" validators={{ onChange: dateRule }}>
							{(field) => (
								<div {...stylex.props(styles.field)}>
									<label {...stylex.props(styles.label)}>end</label>
									<input
										type="date"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										{...stylex.props(styles.input)}
									/>
									<FieldError errors={field.state.meta.errors} />
								</div>
							)}
						</form.Field>
					</div>
				</div>

				<form.Field name="blurb">
					{(field) => (
						<div {...stylex.props(styles.field)}>
							<label {...stylex.props(styles.label)}>blurb</label>
							<textarea
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								{...stylex.props(styles.input, styles.textarea)}
							/>
						</div>
					)}
				</form.Field>

				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
						errors: state.errors,
					})}
				>
					{({ canSubmit, isSubmitting, errors }) => (
						<>
							<button
								type="submit"
								disabled={!canSubmit || isSubmitting}
								{...stylex.props(styles.button)}
							>
								{isSubmitting ? "saving…" : "save trip"}
							</button>
							{errors.length > 0 && (
								<p {...stylex.props(styles.error)}>{String(errors[0])}</p>
							)}
						</>
					)}
				</form.Subscribe>
			</form>
		</main>
	);
}
