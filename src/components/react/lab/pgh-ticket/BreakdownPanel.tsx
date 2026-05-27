import type { Stats, TicketFilters } from '~/queries/internal/types';

interface Props {
  stats: Stats;
  onFilter: (key: keyof TicketFilters, value: string | null) => void;
}

function fmtCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

function TopList({
  title,
  items,
  labelKey,
  onSelect,
}: {
  title: string;
  items: { count: number }[];
  labelKey: string;
  onSelect: (v: string) => void;
}) {
  if (!items.length) return null;

  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
          const label = (item as Record<string, unknown>)[labelKey] as string;
          if (!label) return null;
          return (
            <button
              key={label}
              type="button"
              className="w-full text-left flex justify-between items-center px-2 py-1 text-xs hover:bg-accent/50 transition-colors group"
              onClick={() => onSelect(label)}
            >
              <span className="text-foreground truncate mr-2">{label}</span>
              <span className="text-muted-foreground group-hover:text-foreground font-mono shrink-0" title={item.count.toLocaleString()}>
                {fmtCount(item.count)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BreakdownPanel({ stats, onFilter }: Props) {
  return (
    <div className="space-y-6">
      <TopList
        title="top violations"
        items={stats.topViolations}
        labelKey="violation"
        onSelect={(v) => onFilter('violation', v)}
      />
      <TopList
        title="top locations"
        items={stats.topLocations}
        labelKey="location"
        onSelect={(v) => onFilter('location', v)}
      />
      <TopList
        title="top officers"
        items={stats.topOfficers}
        labelKey="officer"
        onSelect={(v) => onFilter('officer', v)}
      />
      <TopList
        title="by status"
        items={stats.byStatus}
        labelKey="status"
        onSelect={(v) => onFilter('status', v)}
      />
      <TopList
        title="by year"
        items={stats.byYear}
        labelKey="year"
        onSelect={(v) => onFilter('year', v)}
      />
    </div>
  );
}
