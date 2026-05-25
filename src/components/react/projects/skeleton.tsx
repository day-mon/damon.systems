const SKELETON_WIDTHS = [80, 120, 65, 95, 75, 110];

export default function ProjectsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-6 w-24 bg-muted animate-pulse" />
        <div className="h-4 w-4 bg-muted animate-pulse rounded-full" />
      </div>

      <p className="text-xs text-muted-foreground">loading from github...</p>

      <div className="space-y-3">
        {SKELETON_WIDTHS.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="h-4 bg-muted animate-pulse rounded-sm"
              style={{ width: `${w}px`, animationDelay: `${i * 80}ms` }}
            />
            <div
              className="h-3 bg-muted animate-pulse rounded-sm hidden sm:block"
              style={{ width: `${w * 0.5}px`, animationDelay: `${i * 80}ms` }}
            />
            <div
              className="h-3 bg-muted animate-pulse rounded-sm flex-1"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
