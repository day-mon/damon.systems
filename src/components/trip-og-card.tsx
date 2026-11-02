/*
trip og card — satori jsx → svg → resvg png. server-only; fonts are embedded
(./fonts.ts) so the pod renders offline.
*/

const require = createRequire(import.meta.url);

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import { formatTripDates } from "#/lib/trips/types";
import type { TripMeta } from "#/lib/trips/types";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const geistMono = (file: string): Buffer =>
	readFileSync(
		join(
			dirname(require.resolve("geist/package.json")),
			"dist/fonts/geist-mono",
			file,
		),
	);

const GEIST_MONO_REGULAR = geistMono("GeistMono-Regular.ttf");
const GEIST_MONO_BOLD = geistMono("GeistMono-Bold.ttf");

const BG = "#161616";
const FG = "#f4f4f4";
const MUTED = "#9b9b9b";
const BORDER = "rgba(255,255,255,0.1)";

const STARS = (rating: number): string => {
	const full = Math.floor(rating);
	const half = rating - full >= 0.5;

	return (
		"★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0))
	);
};

/** dotted-cap motif in the corner — echoes the travel globe, pure divs */
function Globe({ size = 340 }: { size?: number }) {
	const rows = 11;
	const dots: React.ReactNode[] = [];

	for (let r = 0; r < rows; r++) {
		const rowY = (r / (rows - 1)) * 2 - 1;
		const halfWidth = Math.sqrt(Math.max(0, 1 - rowY * rowY));
		const count = Math.max(2, Math.round(halfWidth * rows));

		const cols = Array.from({ length: count }, (_, c) => {
			const shade = 0.35 + 0.65 * (1 - Math.abs(rowY));

			return (
				<div
					key={`${r}-${c}`}
					style={{
						width: 5,
						height: 5,
						borderRadius: 9999,
						background: `rgba(244,244,244,${shade.toFixed(2)})`,
					}}
				/>
			);
		});

		dots.push(
			<div
				key={r}
				style={{ display: "flex", justifyContent: "space-between", height: 5 }}
			>
				{cols}
			</div>,
		);
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				width: size,
				height: size,
				opacity: 0.85,
			}}
		>
			{dots}
		</div>
	);
}

export async function renderTripOgImage(
	meta: TripMeta,
	photoCount: number,
	photos: string[] = [],
): Promise<Buffer> {
	const dateLine = formatTripDates(meta.dates);

	const svg = await satori(
		<div
			style={{
				display: "flex",
				width: OG_WIDTH,
				height: OG_HEIGHT,
				background: BG,
				color: FG,
				fontFamily: "Geist Mono",
				padding: 64,
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					flex: 1,
					paddingRight: 48,
				}}
			>
				<div style={{ display: "flex", flexDirection: "column" }}>
					<span style={{ color: MUTED, fontSize: 20, letterSpacing: 4 }}>
						DAMON.SYSTEMS — TRAVEL
					</span>

					<span
						style={{
							fontSize: 76,
							fontWeight: 700,
							marginTop: 36,
							lineHeight: 1.05,
						}}
					>
						{meta.name}
					</span>

					<span style={{ fontSize: 28, color: MUTED, marginTop: 18 }}>
						{meta.place}
					</span>

					<span style={{ fontSize: 24, color: MUTED, marginTop: 10 }}>
						{dateLine}
					</span>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						fontSize: 30,
						color: FG,
					}}
				>
					<span>{STARS(meta.rating)}</span>
					<span style={{ color: MUTED, fontSize: 22, marginLeft: 18 }}>
						{photoCount > 0
							? `${photoCount} photo${photoCount === 1 ? "" : "s"}`
							: "photos syncing"}
					</span>
				</div>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: 460,
					height: 502,
					borderRadius: 16,
					overflow: "hidden",
					border: `1px solid ${BORDER}`,
					background: "#101010",
				}}
			>
				{photos.length === 0 ? (
					<Globe />
				) : photos.length === 1 ? (
					<img
						src={photos[0]}
						style={{ width: 460, height: 502, objectFit: "cover" }}
						alt=""
					/>
				) : (
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							width: 460,
							height: 502,
							gap: 10,
						}}
					>
						{photos.slice(0, 4).map((src) => (
							<img
								key={src}
								src={src}
								style={{ width: 225, height: 246, objectFit: "cover" }}
								alt=""
							/>
						))}
					</div>
				)}
			</div>

			<div
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					right: 0,
					bottom: 0,
					border: `1px solid ${BORDER}`,
					borderRadius: 0,
					display: "flex",
				}}
			/>
		</div>,
		{
			width: OG_WIDTH,
			height: OG_HEIGHT,
			fonts: [
				{
					name: "Geist Mono",
					data: GEIST_MONO_REGULAR,
					weight: 400,
					style: "normal",
				},
				{
					name: "Geist Mono",
					data: GEIST_MONO_BOLD,
					weight: 700,
					style: "normal",
				},
			],
		},
	);

	const png = new Resvg(svg, { background: BG }).render();

	return Buffer.from(png.asPng());
}
