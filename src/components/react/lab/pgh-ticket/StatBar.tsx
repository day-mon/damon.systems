import type { StatsCountsResult } from '~/queries/internal/types';

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

function fmtFull(n: number): string {
  return n.toLocaleString();
}

interface Props {
  stats: StatsCountsResult;
}

export default function StatBar({ stats }: Props) {
  const cards = [
    { label: 'tickets', value: fmt(stats.total), full: fmtFull(stats.total) },
    { label: 'open', value: fmt(stats.openTickets), full: fmtFull(stats.openTickets) },
    { label: 'unpaid fines', value: '$' + fmt(stats.totalAmount), full: '$' + fmtFull(stats.totalAmount) },
    { label: 'locations', value: fmt(stats.totalLocations), full: fmtFull(stats.totalLocations) },
  ];

  if (stats.dateRange) {
    cards.push({
      label: 'range',
      value: `${stats.dateRange.min_date} - ${stats.dateRange.max_date}`,
      full: `${stats.dateRange.min_date} - ${stats.dateRange.max_date}`,
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="border border-border p-3" title={c.full}>
          <div className="text-2xl font-light tracking-tight">{c.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
