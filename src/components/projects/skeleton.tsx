import { Skeleton } from "@astryxdesign/core/Skeleton";
import * as stylex from "@stylexjs/stylex";

/*
skeleton mirrors ProjectsList's loaded layout 1:1 so the swap is a crossfade,
not a reflow. measured against the real dom: rows are 21px-tall flex lines on
an 8px gap pitched 33px apart, columns are

  [repo name ~120px strong] [stars ~30px] [lang ~36px] [link icon 12px] [description flex]

and the header is a 77x32 "projects" h1 with a 28x28 refresh badge beside it.
*/

// name widths sampled to look like the real repo mix (kebab-case names of
// wildly different lengths, longest first like the loaded star-sorted list).
// row count = 19, the actual number of repos rendered on load, so the swap
// is a crossfade - not a layout jump.
const NAME_WIDTHS = [
	120, 148, 96, 104, 88, 132, 116, 92, 152, 108, 124, 84, 140, 100, 112, 96,
	128, 92, 108,
];

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
		height: 32,
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
		height: 21,
	},
	desc: { flex: 1 },
});

export function ProjectsSkeleton() {
	return (
		<div {...stylex.props(styles.wrap)}>
			<div {...stylex.props(styles.header)}>
				<Skeleton width={77} height={28} radius={1} />
				<Skeleton width={28} height={28} radius={1} />
			</div>

			<div {...stylex.props(styles.rows)}>
				{NAME_WIDTHS.map((w, i) => (
					<div key={w} {...stylex.props(styles.row)}>
						<Skeleton width={w} height={14} radius={1} index={i} />
						<Skeleton width={30} height={12} radius={1} index={i + 1} />
						<Skeleton width={36} height={12} radius={1} index={i + 2} />
						<Skeleton width={12} height={12} radius={1} index={i + 3} />
						<div {...stylex.props(styles.desc)}>
							<Skeleton width="100%" height={12} radius={1} index={i + 4} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
