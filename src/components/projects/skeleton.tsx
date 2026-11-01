import { Skeleton } from "~/components/ui/skeleton";

/*
skeleton mirrors ProjectsList's loaded layout 1:1 so the swap is a crossfade,
not a reflow. measured against the real dom: rows are 21px-tall flex lines on
an 8px gap pitched 33px apart, columns are

  [repo name ~120px strong] [stars ~30px] [lang ~36px] [link icon 12px] [description flex]

and the header is a 77x32 "projects" h1 with a 28x28 refresh badge beside it.

row count = 19, the actual number of repos rendered on load; name widths are
sampled to fake the star-sorted kebab-case mix.
*/
const NAME_WIDTHS: { id: string; w: number }[] = [
	{ id: "s01", w: 120 },
	{ id: "s02", w: 148 },
	{ id: "s03", w: 96 },
	{ id: "s04", w: 104 },
	{ id: "s05", w: 88 },
	{ id: "s06", w: 132 },
	{ id: "s07", w: 116 },
	{ id: "s08", w: 92 },
	{ id: "s09", w: 152 },
	{ id: "s10", w: 108 },
	{ id: "s11", w: 124 },
	{ id: "s12", w: 84 },
	{ id: "s13", w: 140 },
	{ id: "s14", w: 100 },
	{ id: "s15", w: 112 },
	{ id: "s16", w: 96 },
	{ id: "s17", w: 128 },
	{ id: "s18", w: 92 },
	{ id: "s19", w: 108 },
];

export function ProjectsSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex h-8 items-center gap-3">
				<Skeleton className="h-7 w-[77px] rounded-[1px]" />
				<Skeleton className="size-7 rounded-[1px]" />
			</div>

			<div className="flex flex-col gap-3">
				{NAME_WIDTHS.map(({ id, w }) => (
					<div key={id} className="flex h-[21px] items-center gap-2">
						<Skeleton className="h-3.5 rounded-[1px]" style={{ width: w }} />
						<Skeleton className="h-3 w-[30px] rounded-[1px]" />
						<Skeleton className="h-3 w-9 rounded-[1px]" />
						<Skeleton className="size-3 rounded-[1px]" />
						<Skeleton className="h-3 flex-1 rounded-[1px]" />
					</div>
				))}
			</div>
		</div>
	);
}
