import { Skeleton } from "@astryxdesign/core/Skeleton";
import * as stylex from "@stylexjs/stylex";

const SKELETON_WIDTHS = [80, 120, 65, 95, 75, 110];

const styles = stylex.create({
	wrap: {
		display: "flex",
		flexDirection: "column",
		gap: 24,
	},
	header: {
		display: "flex",
		alignItems: "center",
		gap: 12,
	},
	hint: {
		fontSize: "0.75rem",
		color: "var(--muted-foreground)",
		margin: 0,
	},
	rows: {
		display: "flex",
		flexDirection: "column",
		gap: 12,
	},
	row: {
		display: "flex",
		alignItems: "center",
		gap: 8,
	},
});

export function ProjectsSkeleton() {
	return (
		<div {...stylex.props(styles.wrap)}>
			<div {...stylex.props(styles.header)}>
				<Skeleton width={96} height={24} radius={1} />
				<Skeleton width={16} height={16} radius="rounded" />
			</div>

			<p {...stylex.props(styles.hint)}>loading from github…</p>

			<div {...stylex.props(styles.rows)}>
				{SKELETON_WIDTHS.map((w, i) => (
					<div key={w} {...stylex.props(styles.row)}>
						<Skeleton width={w} height={16} radius={1} index={i} />
						<Skeleton width={w * 0.5} height={12} radius={1} index={i + 1} />
						<Skeleton width="100%" height={12} radius={1} index={i + 2} />
					</div>
				))}
			</div>
		</div>
	);
}
