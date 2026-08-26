/*
hidden admin portal (/admin) - not linked anywhere in the ui.

paste an icloud share url, hit "fetch album" to pull the real photo
count and date range, fill the story bits, save. writes go to the
travel_trips postgres table through an ADMIN_TOKEN-guarded server fn.
*/

import * as stylex from "@stylexjs/stylex";
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
	row: {
		display: "flex",
		gap: 16,
	},
	half: {
		flex: 1,
		display: "flex",
		flexDirection: "column",
		gap: 6,
	},
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
		marginTop: 8,
	},
	urootButton: {
		marginTop: 0,
	},
	urUrlInput: {
		flex: 1,
	},
	status: {
		marginTop: 12,
		fontSize: "0.8125rem",
		fontFamily: "IBM Plex Mono Variable, monospace",
		color: {
			default: "rgb(var(--colors-foregroundMuted))",
			"[data-state=error] &": "tomato",
		},
	},
	notice: {
		fontSize: "0.75rem",
		fontFamily: "IBM Plex Mono Variable, monospace",
		color: "rgb(var(--colors-foregroundMuted))",
		marginBottom: 16,
	},
});

function AdminPortal() {
	const [form, setForm] = useState({
		runnerToken: "",
		slug: "",
		title: "",
		location: "",
		start: "",
		end: "",
		blurb: "",
		sharedAlbumUrl: "",
	});
	const [status, setStatus] = useState<{ kind: string; text: string } | null>(
		null,
	);
	const [busy, setBusy] = useState(false);

	const set = (key: keyof typeof form) => (value: string) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	async function fetchAlbum() {
		setBusy(true);
		setStatus({ kind: "info", text: "resolving album…" });
		const album = await getSharedAlbum({ data: form.sharedAlbumUrl });
		setBusy(false);
		if (!album.ok) {
			setStatus({ kind: "error", text: "album resolve failed" });
			return;
		}
		const dates = album.photos.map((p) => p.takenAt.slice(0, 10)).sort();
		setForm((prev) => ({
			...prev,
			start: dates[0] ?? prev.start,
			end: dates[dates.length - 1] ?? prev.end,
		}));
		setStatus({
			kind: "info",
			text: `${album.photos.length} photos, ${dates[0] ?? "?"} → ${dates[dates.length - 1] ?? "?"} (dates prefilled)`,
		});
	}

	async function save() {
		setBusy(true);
		const result = await saveTrip({
			data: {
				token: form.runnerToken,
				slug: form.slug,
				title: form.title,
				location: form.location,
				start: form.start,
				end: form.end,
				blurb: form.blurb,
				sharedAlbumUrl: form.sharedAlbumUrl,
			},
		});
		setBusy(false);
		if (!result.ok) {
			setStatus({ kind: "error", text: result.error ?? "save failed" });
			return;
		}
		window.location.assign(`/travel/${form.slug}`);
	}

	const input = (key: keyof typeof form, placeholder = "") => ({
		value: form[key],
		placeholder,
		onChange: (e: { target: { value: string } }) => set(key)(e.target.value),
	});

	return (
		<main {...stylex.props(styles.main)}>
			<h1 {...stylex.props(styles.title)}>admin · new trip</h1>
			<p {...stylex.props(styles.notice)}>
				hidden route, noindex. saves into postgres travel_trips — the commit
				manifest stays untouched.
			</p>

			<div {...stylex.props(styles.field)}>
				<label {...stylex.props(styles.label)}>admin token</label>
				<input
					type="password"
					{...input("runnerToken", "ADMIN_TOKEN env")}
					{...stylex.props(styles.input)}
				/>
			</div>

			<div {...stylex.props(styles.field)}>
				<label {...stylex.props(styles.label)}>icloud share url</label>
				<div {...stylex.props(styles.row)}>
					<input
						{...input("sharedAlbumUrl", "https://share.icloud.com/photos/…")}
						{...stylex.props(styles.input, styles.urUrlInput)}
					/>
					<button
						type="button"
						disabled={busy || !form.sharedAlbumUrl}
						onClick={fetchAlbum}
						{...stylex.props(styles.button, styles.urootButton)}
					>
						fetch
					</button>
				</div>
			</div>

			<div {...stylex.props(styles.row)}>
				<div {...stylex.props(styles.field, styles.half)}>
					<label {...stylex.props(styles.label)}>slug</label>
					<input
						{...input("slug", "kebab-case")}
						{...stylex.props(styles.input)}
					/>
				</div>
				<div {...stylex.props(styles.field, styles.half)}>
					<label {...stylex.props(styles.label)}>title</label>
					<input {...input("title")} {...stylex.props(styles.input)} />
				</div>
			</div>

			<div {...stylex.props(styles.field)}>
				<label {...stylex.props(styles.label)}>location</label>
				<input {...input("location")} {...stylex.props(styles.input)} />
			</div>

			<div {...stylex.props(styles.row)}>
				<div {...stylex.props(styles.half)}>
					<label {...stylex.props(styles.label)}>start</label>
					<input
						type="date"
						{...input("start")}
						{...stylex.props(styles.input)}
					/>
				</div>
				<div {...stylex.props(styles.half)}>
					<label {...stylex.props(styles.label)}>end</label>
					<input
						type="date"
						{...input("end")}
						{...stylex.props(styles.input)}
					/>
				</div>
			</div>

			<div {...stylex.props(styles.field)}>
				<label {...stylex.props(styles.label)}>blurb</label>
				<textarea
					{...input("blurb")}
					{...stylex.props(styles.input, styles.textarea)}
				/>
			</div>

			<button
				type="button"
				disabled={busy}
				onClick={save}
				{...stylex.props(styles.button)}
			>
				save trip
			</button>
			{status && (
				<p data-state={status.kind} {...stylex.props(styles.status)}>
					{status.text}
				</p>
			)}
		</main>
	);
}
