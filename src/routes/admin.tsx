/*
hidden admin portal (/admin) - not linked anywhere in the ui.

paste an icloud share url, hit "fetch album" to pull the real photo
count and prefill the date range, fill the story bits, save. writes go
to the travel_trips postgres table through an ADMIN_TOKEN-guarded
server fn. presentational layer is astryx (Button/TextInput/TextArea/
DateInput/Heading/Text/HStack); tanstack form + query handle state.
*/

import { Button } from "@astryxdesign/core/Button";
import type { ISODateString } from "@astryxdesign/core/Calendar";
import { DateInput } from "@astryxdesign/core/DateInput";
import { FieldStatus } from "@astryxdesign/core/FieldStatus";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import * as stylex from "@stylexjs/stylex";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { saveTrip } from "#/lib/trips/trips.service";
import { useSharedAlbumPreview } from "#/queries/shared-album/queries";

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
	section: { marginBottom: 24 },
	grow: { flex: 1 },
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
	value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value) ? undefined : "YYYY-MM-DD";

// regex-guarded narrowing into astryx's branded ISO date type - empty or
// malformed input becomes undefined instead of a blind cast
function asIsoDate(v: string): ISODateString | undefined {
	return /^\d{4}-\d{2}-\d{2}$/.test(v) ? (v as ISODateString) : undefined;
}

function fieldError(errors: unknown[]) {
	return errors.length > 0
		? ({ type: "error", message: String(errors[0]) } as const)
		: undefined;
}

function AlbumStatus({
	query,
}: {
	query: ReturnType<typeof useSharedAlbumPreview>;
}) {
	const album = query.data;
	if (query.isFetching) {
		return (
			<Text type="supporting" color="secondary">
				resolving album…
			</Text>
		);
	}
	if (query.isError || (album && !album.ok)) {
		return (
			<FieldStatus
				type="error"
				message="album resolve failed"
				variant="detached"
			/>
		);
	}
	if (album?.ok) {
		const dates = album.photos.map((p) => p.takenAt.slice(0, 10)).sort();
		return (
			<Text type="supporting" color="secondary">
				{album.photos.length} photos · {dates[0] ?? "?"} →{" "}
				{dates[dates.length - 1] ?? "?"} (dates prefilled)
			</Text>
		);
	}
	return null;
}

function AdminPortal() {
	const navigate = useNavigate();
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
		// docs-canonical server error surface: async submit validator
		// returns the error string (lands in state.errors), onSubmit only
		// runs on success and navigates to the new trip page
		validators: {
			onSubmitAsync: async ({ value }) => {
				const result = await saveTrip({ data: value });
				return result.ok ? undefined : (result.error ?? "save failed");
			},
		},
		onSubmit: async ({ value }) => {
			await navigate({ to: "/travel/$slug", params: { slug: value.slug } });
		},
	});

	function FetchAlbumButton({ url }: { url: string }) {
		// manual-trigger query: enabled false, refetch on click. busy /
		// error / success all come off the query - no local state, and
		// a second click on an unchanged url is a five-minute cache hit.
		const query = useSharedAlbumPreview(url, { enabled: false });

		return (
			<div {...stylex.props(styles.section)}>
				<Button
					type="button"
					variant="secondary"
					label={query.isFetching ? "fetching…" : "fetch"}
					isDisabled={!url || query.isFetching}
					isLoading={query.isFetching}
					onClick={async () => {
						const res = await query.refetch();
						const album = res.data;
						if (!album?.ok) return;
						const dates = album.photos
							.map((p) => p.takenAt.slice(0, 10))
							.sort();
						if (dates.length > 0) {
							form.setFieldValue("start", dates[0]);
							form.setFieldValue("end", dates[dates.length - 1]);
						}
					}}
				/>
				<AlbumStatus query={query} />
			</div>
		);
	}

	return (
		<main {...stylex.props(styles.main)}>
			<Heading level={1}>admin · new trip</Heading>
			<Text type="supporting" color="secondary">
				hidden route, noindex. saves into postgres travel_trips — the commit
				manifest stays untouched.
			</Text>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div {...stylex.props(styles.section)}>
					<form.Field name="token" validators={{ onChange: required }}>
						{(field) => (
							<TextInput
								label="admin token"
								type="password"
								placeholder="ADMIN_TOKEN env"
								value={field.state.value}
								onChange={(v) => field.handleChange(v)}
								onBlur={field.handleBlur}
								status={fieldError(field.state.meta.errors)}
							/>
						)}
					</form.Field>
				</div>

				<div {...stylex.props(styles.section)}>
					<HStack gap={2} align="end">
						<div {...stylex.props(styles.grow)}>
							<form.Field name="sharedAlbumUrl">
								{(field) => (
									<TextInput
										label="icloud share url"
										placeholder="https://share.icloud.com/photos/…"
										value={field.state.value}
										onChange={(v) => field.handleChange(v)}
									/>
								)}
							</form.Field>
						</div>
						<form.Subscribe selector={(state) => state.values.sharedAlbumUrl}>
							{(url) => <FetchAlbumButton url={url} />}
						</form.Subscribe>
					</HStack>
				</div>

				<div {...stylex.props(styles.section)}>
					<HStack gap={2}>
						<div {...stylex.props(styles.grow)}>
							<form.Field name="slug" validators={{ onChange: slugRule }}>
								{(field) => (
									<TextInput
										label="slug"
										placeholder="kebab-case"
										value={field.state.value}
										onChange={(v) => field.handleChange(v)}
										onBlur={field.handleBlur}
										status={fieldError(field.state.meta.errors)}
									/>
								)}
							</form.Field>
						</div>
						<div {...stylex.props(styles.grow)}>
							<form.Field name="title" validators={{ onChange: required }}>
								{(field) => (
									<TextInput
										label="title"
										value={field.state.value}
										onChange={(v) => field.handleChange(v)}
										onBlur={field.handleBlur}
										status={fieldError(field.state.meta.errors)}
									/>
								)}
							</form.Field>
						</div>
					</HStack>
				</div>

				<div {...stylex.props(styles.section)}>
					<form.Field name="location" validators={{ onChange: required }}>
						{(field) => (
							<TextInput
								label="location"
								value={field.state.value}
								onChange={(v) => field.handleChange(v)}
								onBlur={field.handleBlur}
								status={fieldError(field.state.meta.errors)}
							/>
						)}
					</form.Field>
				</div>

				<div {...stylex.props(styles.section)}>
					<HStack gap={2}>
						<div {...stylex.props(styles.grow)}>
							<form.Field name="start" validators={{ onChange: dateRule }}>
								{(field) => (
									<DateInput
										label="start"
										value={asIsoDate(field.state.value)}
										onChange={(v) => field.handleChange(v ?? "")}
										status={fieldError(field.state.meta.errors)}
									/>
								)}
							</form.Field>
						</div>
						<div {...stylex.props(styles.grow)}>
							<form.Field name="end" validators={{ onChange: dateRule }}>
								{(field) => (
									<DateInput
										label="end"
										value={asIsoDate(field.state.value)}
										onChange={(v) => field.handleChange(v ?? "")}
										status={fieldError(field.state.meta.errors)}
									/>
								)}
							</form.Field>
						</div>
					</HStack>
				</div>

				<div {...stylex.props(styles.section)}>
					<form.Field name="blurb">
						{(field) => (
							<TextArea
								label="blurb"
								value={field.state.value}
								onChange={(v) => field.handleChange(v)}
								placeholder="two sentences max"
							/>
						)}
					</form.Field>
				</div>

				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
						errors: state.errors,
					})}
				>
					{({ canSubmit, isSubmitting, errors }) => (
						<>
							<Button
								type="submit"
								variant="primary"
								label={isSubmitting ? "saving…" : "save trip"}
								isDisabled={!canSubmit || isSubmitting}
								isLoading={isSubmitting}
							/>
							{errors.length > 0 && (
								<FieldStatus
									type="error"
									message={String(errors[0])}
									variant="detached"
								/>
							)}
						</>
					)}
				</form.Subscribe>
			</form>
		</main>
	);
}
