/*
hidden dither dial playground - tweak props live, paste the final values.
not linked from anywhere; delete once the real dither call is made.
*/
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	parseAsBoolean,
	parseAsFloat,
	parseAsInteger,
	useQueryStates,
} from "nuqs";

import Dither from "#/components/ui/Dither";
import { useResolvedTheme } from "#/lib/theme";

const DIALS = {
	waveSpeed: parseAsFloat.withDefault(0.05),
	waveFrequency: parseAsFloat.withDefault(3),
	waveAmplitude: parseAsFloat.withDefault(0.3),
	colorNum: parseAsInteger.withDefault(4),
	pixelSize: parseAsInteger.withDefault(2),
	scale: parseAsFloat.withDefault(1),
	contrast: parseAsFloat.withDefault(1),
	brightness: parseAsFloat.withDefault(0),
	mouse: parseAsBoolean.withDefault(false),
	opacity: parseAsFloat.withDefault(0.06),
	inverted: parseAsBoolean.withDefault(false),
} as const;

export const Route = createFileRoute("/design/dither")({
	component: DitherPlayground,
});

function NumberDial({
	label,
	value,
	step = 0.1,
	setTo,
}: {
	label: string;
	value: number;
	step?: number;
	setTo: (v: number) => void;
}) {
	return (
		<div className="flex items-center gap-3 border border-border px-6 py-3 text-sm">
			<span className="min-w-28">{label}</span>
			<button
				type="button"
				className="opacity-60 hover:opacity-100"
				onClick={() => setTo(Number((value - step).toFixed(3)))}
			>
				−
			</button>
			<span className="min-w-14 text-center font-semibold tabular-nums">
				{value}
			</span>
			<button
				type="button"
				className="opacity-60 hover:opacity-100"
				onClick={() => setTo(Number((value + step).toFixed(3)))}
			>
				+
			</button>
		</div>
	);
}

function ToggleDial({
	label,
	value,
	setTo,
}: {
	label: string;
	value: boolean;
	setTo: (v: boolean) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => setTo(!value)}
			className="block w-full border border-border px-6 py-3 text-left text-sm"
		>
			{label}: <span className="font-semibold">{value ? "on" : "off"}</span>
		</button>
	);
}

function DitherPlayground() {
	const theme = useResolvedTheme();
	const isDark = theme === "dark";
	const [dials, setDials] = useQueryStates(DIALS, { history: "replace" });

	// FLIP the demo's mental model: bg owns the field, waveColor owns the texture.
	const fg: [number, number, number] = dials.inverted
		? [9 / 255, 9 / 255, 11 / 255]
		: [1, 1, 1];

	const bgr: [number, number, number] = dials.inverted
		? [1, 1, 1]
		: [9 / 255, 9 / 255, 11 / 255];

	return (
		<main className="relative flex min-h-screen items-center justify-center">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10"
				style={{ opacity: dials.opacity }}
			>
				<Dither
					waveColor={isDark ? fg : bgr}
					backgroundColor={isDark ? bgr : fg}
					waveSpeed={dials.waveSpeed}
					waveFrequency={dials.waveFrequency}
					waveAmplitude={dials.waveAmplitude}
					colorNum={dials.colorNum}
					pixelSize={dials.pixelSize}
					scale={dials.scale}
					contrast={dials.contrast}
					brightness={dials.brightness}
					enableMouseInteraction={dials.mouse}
					className="size-full"
				/>
			</div>

			<div className="w-80 space-y-2 bg-background">
				<h1 className="m-0 mb-4 text-xl font-light">dither dials</h1>
				<NumberDial
					label="opacity"
					value={dials.opacity}
					step={0.01}
					setTo={(v) => setDials({ opacity: v })}
				/>
				<NumberDial
					label="pixelSize"
					value={dials.pixelSize}
					step={1}
					setTo={(v) => setDials({ pixelSize: v })}
				/>
				<NumberDial
					label="colorNum"
					value={dials.colorNum}
					step={1}
					setTo={(v) => setDials({ colorNum: v })}
				/>
				<NumberDial
					label="waveFrequency"
					value={dials.waveFrequency}
					setTo={(v) => setDials({ waveFrequency: v })}
				/>
				<NumberDial
					label="waveAmplitude"
					value={dials.waveAmplitude}
					setTo={(v) => setDials({ waveAmplitude: v })}
				/>
				<NumberDial
					label="waveSpeed"
					value={dials.waveSpeed}
					step={0.01}
					setTo={(v) => setDials({ waveSpeed: v })}
				/>
				<NumberDial
					label="contrast"
					value={dials.contrast}
					setTo={(v) => setDials({ contrast: v })}
				/>
				<NumberDial
					label="brightness"
					value={dials.brightness}
					setTo={(v) => setDials({ brightness: v })}
				/>
				<ToggleDial
					label="mouse"
					value={dials.mouse}
					setTo={(v) => setDials({ mouse: v })}
				/>
				<ToggleDial
					label="inverted"
					value={dials.inverted}
					setTo={(v) => setDials({ inverted: v })}
				/>
				<p className="pt-4 text-xs text-muted-foreground">
					dial it up, then paste me the url — every knob is in the query string.
				</p>
				<Link
					to="/"
					className="inline-block pt-2 text-xs text-muted-foreground underline underline-offset-2"
				>
					back home
				</Link>
			</div>
		</main>
	);
}
