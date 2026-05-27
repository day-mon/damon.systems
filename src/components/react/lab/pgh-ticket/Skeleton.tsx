export default function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border p-3">
            <div className="h-7 w-20 bg-accent/50 mb-1" />
            <div className="h-3 w-12 bg-accent/30" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-accent/20 border border-border" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-border h-125 bg-accent/10 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">loading map…</span>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-accent/30 mb-3" />
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex justify-between px-2 py-1">
                    <div className="h-3 w-24 bg-accent/20" />
                    <div className="h-3 w-8 bg-accent/20" />
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
