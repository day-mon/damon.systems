import type { TicketFilters } from '~/lib/pgh-ticket/types';
import { Button } from '~/components/ui/button';

interface Props {
  filters: TicketFilters;
  onFilter: (key: keyof TicketFilters, value: string | null) => void;
  filterOpts: Record<string, string[]>;
  pointLimit: number;
  onPointLimit: (v: number) => void;
}

const POINT_LIMITS = [5000, 10000, 20000, 50000, 100000];

export default function FilterPanel({ filters, onFilter, filterOpts, pointLimit, onPointLimit }: Props) {
  const sel = 'h-8 bg-transparent border border-border px-2 text-xs text-foreground';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <select className={sel} value={filters.status || ''} onChange={(e) => onFilter('status', e.target.value || null)}>
        <option value="">all statuses</option>
        {filterOpts.statuses?.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select className={sel} value={filters.year || ''} onChange={(e) => onFilter('year', e.target.value || null)}>
        <option value="">all years</option>
        {filterOpts.years?.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>

      <select className={sel} value={filters.violation || ''} onChange={(e) => onFilter('violation', e.target.value || null)}>
        <option value="">all violations</option>
        {filterOpts.violations?.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>

      <input
        className={sel + ' placeholder:text-muted-foreground'}
        placeholder="license plate…"
        value={filters.plate || ''}
        onChange={(e) => onFilter('plate', e.target.value || null)}
      />

      <select className={sel} value={pointLimit} onChange={(e) => onPointLimit(Number(e.target.value))}>
        {POINT_LIMITS.map((n) => <option key={n} value={n}>{(n / 1000).toFixed(0)}k points</option>)}
      </select>

      <Button variant="outline" size="xs" className="h-8" onClick={() => {
        onFilter('status', null);
        onFilter('year', null);
        onFilter('violation', null);
        onFilter('plate', null);
        onFilter('officer', null);
        onFilter('location', null);
        onFilter('dateFrom', null);
        onFilter('dateTo', null);
      }}>
        clear
      </Button>
    </div>
  );
}
