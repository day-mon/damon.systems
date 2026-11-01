import { RefreshCw } from "lucide-react";

/*
skeleton rules followed here:
- static chrome is REAL: the h1 and refresh affordance live in markup,
  not as grey boxes pretending to be loading.
- pulse rows are statistical, not literal: name widths sample the real
  star-sorted kebab-case distribution, only ~30% of rows have a star
  count (loaded state shows them only when stars > 0), and description
  bars vary in length instead of forming a uniform wall.
- rows stagger in like the loaded list does (30ms) so the skeleton ->
  data swap reads as "the data arrived", not "the layout rebuilt".
*/
import { Skeleton } from "~/components/ui/skeleton";

interface SkeletonRow {
	id: string;
	name: number;
	stars: boolean;
	icon: boolean;
	desc: number;
}

const ROWS: SkeletonRow[] = [
	{ id: "s01", name: 120, stars: true, icon: true, desc: 64 },
	{ id: "s02", name: 148, stars: true, icon: false, desc: 47 },
	{ id: "s03", name: 96, stars: false, icon: true, desc: 71 },
	{ id: "s04", name: 104, stars: true, icon: false, desc: 38 },
	{ id: "s05", name: 88, stars: false, icon: true, desc: 55 },
	{ id: "s06", name: 132, stars: true, icon: false, desc: 62 },
	{ id: "s07", name: 116, stars: false, icon: true, desc: 44 },
	{ id: "s08", name: 92, stars: false, icon: false, desc: 76 },
	{ id: "s09", name: 152, stars: true, icon: true, desc: 52 },
	{ id: "s10", name: 108, stars: false, icon: false, desc: 41 },
	{ id: "s11", name: 124, stars: true, icon: true, desc: 68 },
	{ id: "s12", name: 84, stars: false, icon: false, desc: 59 },
	{ id: "s13", name: 140, stars: true, icon: true, desc: 36 },
	{ id: "s14", name: 100, stars: false, icon: false, desc: 73 },
	{ id: "s15", name: 112, stars: false, icon: true, desc: 48 },
	{ id: "s16", name: 96, stars: true, icon: false, desc: 61 },
	{ id: "s17", name: 128, stars: false, icon: true, desc: 43 },
	{ id: "s18", name: 92, stars: false, icon: false, desc: 69 },
	{ id: "s19", name: 108, stars: false, icon: true, desc: 57 },
];

export function ProjectsSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex h-8 items-center gap-3">
				<h1 className="m-0 text-2xl font-light tracking-tight">projects</h1>
				{/* mirroring the refresh button's disabled-spinning state */}
				<RefreshCw size={14} className="animate-spin opacity-40" />
			</div>

			<ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm">
				{ROWS.map(({ id, name, stars, icon, desc }, i) => (
					<li
						key={id}
						className="flex h-[21px] animate-in fade-in items-center gap-2 duration-200"
						style={{ animationDelay: `${i * 30}ms` }}
					>
						<Skeleton className="h-3.5 rounded-[1px]" style={{ width: name }} />
						{stars && <Skeleton className="h-3 w-[30px] rounded-[1px]" />}
						<Skeleton className="h-3 w-9 rounded-[1px]" />
						{icon && <Skeleton className="size-3 rounded-[1px]" />}
						<Skeleton
							className="h-3 rounded-[1px]"
							style={{ width: `${desc}%` }}
						/>
					</li>
				))}
			</ul>
		</div>
	);
}
