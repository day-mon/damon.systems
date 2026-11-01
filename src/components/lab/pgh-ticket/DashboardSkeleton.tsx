import { Skeleton } from "~/components/ui/skeleton";

const STAT_SLOTS = ["s1", "s2", "s3", "s4", "s5", "s6"];
const BAR_SLOTS = ["b1", "b2", "b3", "b4", "b5"];
const GROUP_SLOTS = ["g1", "g2", "g3", "g4"];
const ROW_SLOTS = ["r1", "r2", "r3", "r4", "r5"];

export function DashboardSkeleton() {
	return (
		<div className="flex flex-col gap-6 animate-pulse">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
				{STAT_SLOTS.map((slot) => (
					<div key={slot} className="border border-border p-3">
						<Skeleton className="mb-1 h-7 w-20 rounded-[1px]" />
						<Skeleton className="h-3 w-12 rounded-[1px]" />
					</div>
				))}
			</div>
			<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
				{BAR_SLOTS.map((slot) => (
					<Skeleton
						key={slot}
						className="h-8 rounded-[1px] border border-border"
					/>
				))}
			</div>
			<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
				<div className="flex h-[500px] items-center justify-center border border-border bg-accent/10">
					<span className="text-xs text-muted-foreground">loading map…</span>
				</div>
				<div className="flex flex-col gap-6">
					{GROUP_SLOTS.map((slot) => (
						<div key={slot}>
							<Skeleton className="mb-3 h-3 w-20 rounded-[1px]" />
							<div className="flex flex-col gap-1">
								{ROW_SLOTS.map((rowSlot) => (
									<div key={rowSlot} className="flex justify-between px-2 py-1">
										<Skeleton className="h-3 w-24 rounded-[1px]" />
										<Skeleton className="h-3 w-8 rounded-[1px]" />
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
