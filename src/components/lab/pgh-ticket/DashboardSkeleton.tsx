import * as stylex from "@stylexjs/stylex";

const pulse = stylex.keyframes({
	"0%": { opacity: 1 },
	"50%": { opacity: 0.6 },
	"100%": { opacity: 1 },
});

const styles = stylex.create({
	wrap: {
		display: "flex",
		flexDirection: "column",
		gap: 24,
		animationName: pulse,
		animationDuration: "1.5s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
	statGrid: {
		display: "grid",
		gridTemplateColumns: {
			default: "repeat(2, 1fr)",
			"@media (min-width: 768px)": "repeat(3, 1fr)",
			"@media (min-width: 1024px)": "repeat(6, 1fr)",
		},
		gap: 12,
	},
	statCard: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
		padding: 12,
	},
	big: {
		height: 28,
		width: 80,
		backgroundColor: "var(--accent)",
		opacity: 0.5,
		marginBottom: 4,
	},
	tag: {
		height: 12,
		width: 48,
		backgroundColor: "var(--accent)",
		opacity: 0.3,
	},
	tagWide: {
		height: 12,
		width: 96,
		backgroundColor: "var(--accent)",
		opacity: 0.3,
	},
	tagNarrow: {
		height: 12,
		width: 32,
		backgroundColor: "var(--accent)",
		opacity: 0.3,
	},
	tagHead: {
		height: 12,
		width: 80,
		backgroundColor: "var(--accent)",
		opacity: 0.3,
		marginBottom: 12,
	},
	barRow: {
		display: "grid",
		gridTemplateColumns: {
			default: "repeat(2, 1fr)",
			"@media (min-width: 768px)": "repeat(3, 1fr)",
			"@media (min-width: 1024px)": "repeat(5, 1fr)",
		},
		gap: 12,
	},
	bar: {
		height: 32,
		backgroundColor: "var(--accent)",
		opacity: 0.2,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
	},
	main: {
		display: "grid",
		gridTemplateColumns: {
			default: "1fr",
			"@media (min-width: 1024px)": "2fr 1fr",
		},
		gap: 24,
	},
	map: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "var(--border)",
		height: 500,
		backgroundColor: "var(--accent)",
		opacity: 0.1,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	sideGroup: {
		display: "flex",
		flexDirection: "column",
		gap: 24,
	},
	rows: {
		display: "flex",
		flexDirection: "column",
		gap: 4,
	},
	row: {
		display: "flex",
		justifyContent: "space-between",
		paddingInline: 8,
		paddingBlock: 4,
	},
	muted: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
	},
});

const STAT_SLOTS = ["s1", "s2", "s3", "s4", "s5", "s6"];
const BAR_SLOTS = ["b1", "b2", "b3", "b4", "b5"];
const GROUP_SLOTS = ["g1", "g2", "g3", "g4"];
const ROW_SLOTS = ["r1", "r2", "r3", "r4", "r5"];

export function DashboardSkeleton() {
	return (
		<div {...stylex.props(styles.wrap)}>
			<div {...stylex.props(styles.statGrid)}>
				{STAT_SLOTS.map((slot) => (
					<div key={slot} {...stylex.props(styles.statCard)}>
						<div {...stylex.props(styles.big)} />
						<div {...stylex.props(styles.tag)} />
					</div>
				))}
			</div>
			<div {...stylex.props(styles.barRow)}>
				{BAR_SLOTS.map((slot) => (
					<div key={slot} {...stylex.props(styles.bar)} />
				))}
			</div>
			<div {...stylex.props(styles.main)}>
				<div {...stylex.props(styles.map)}>
					<span {...stylex.props(styles.muted)}>loading map…</span>
				</div>
				<div {...stylex.props(styles.sideGroup)}>
					{GROUP_SLOTS.map((slot) => (
						<div key={slot}>
							<div {...stylex.props(styles.tagHead)} />
							<div {...stylex.props(styles.rows)}>
								{ROW_SLOTS.map((slot) => (
									<div key={slot} {...stylex.props(styles.row)}>
										<div {...stylex.props(styles.tagWide)} />
										<div {...stylex.props(styles.tagNarrow)} />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
