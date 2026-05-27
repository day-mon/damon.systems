import { useCallback, useState, useMemo, lazy, Suspense } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { useQueryStates, parseAsString, parseAsStringEnum, parseAsInteger } from 'nuqs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { TicketFilters, TicketRow } from '~/lib/pgh-ticket/types';
import type { StatsCountsResult, StatsBreakdownsResult } from '~/queries/internal/types';
import { useStatsCounts, useStatsBreakdowns, usePoints, useFilterOptions } from '~/queries/internal/queries';
import StatBar from './StatBar';
import FilterPanel from './FilterPanel';
import BreakdownPanel from './BreakdownPanel';
import TicketTable from './TicketTable';
import Skeleton from './Skeleton';

const TicketMap = lazy(() => import('./TicketMap'));

function DashboardInner() {
  const [state, setState] = useQueryStates({
    view: parseAsStringEnum(['map', 'table']).withDefault('map'),
    page: parseAsInteger.withDefault(1),
    sortKey: parseAsString.withDefault('issue_date'),
    sortDir: parseAsStringEnum(['asc', 'desc']).withDefault('desc'),
    officer: parseAsString,
    year: parseAsString,
    status: parseAsString,
    violation: parseAsString,
    plate: parseAsString,
    location: parseAsString,
    dateFrom: parseAsString,
    dateTo: parseAsString,
  });

  const [pointLimit, setPointLimit] = useState(20000);

  const { view, page, sortKey, sortDir, ...filters } = state;
  const filterValues: TicketFilters = filters;

  const counts = useStatsCounts(filterValues);
  const breakdowns = useStatsBreakdowns(filterValues);
  const points = usePoints({ ...filterValues, limit: pointLimit });
  const filterOpts = useFilterOptions();

  const handleFilter = useCallback((key: keyof TicketFilters, value: string | null) => {
    setState({ [key]: value || null, page: 1 });
  }, [setState]);

  const handleView = (v: 'map' | 'table') => {
    setState({ view: v, page: 1, sortKey: null, sortDir: null });
  };

  // Show skeleton only until counts arrive (fastest query)
  if (counts.isPending) {
    return <Skeleton />;
  }

  const isRefetching = counts.isFetching || points.isFetching;

  // Merge counts + breakdowns for the full stats object
  const stats = counts.data;
  const fullStats = stats && breakdowns.data ? { ...stats, ...breakdowns.data } as StatsCountsResult & StatsBreakdownsResult : null;

  return (
    <div className="space-y-6">
      {isRefetching && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-accent animate-pulse z-50" />
      )}
      <div className="space-y-6" style={{ opacity: isRefetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {stats && <StatBar stats={stats} />}
        <FilterPanel filters={filterValues} onFilter={handleFilter} filterOpts={(filterOpts.data ?? {}) as Record<string, string[]>} pointLimit={pointLimit} onPointLimit={setPointLimit} />
        <div className="flex gap-2">
          <button
            type="button"
            className={`text-xs px-3 py-1.5 border transition-colors ${
              view === 'map'
                ? 'border-foreground bg-accent text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleView('map')}
          >
            map
          </button>
          <button
            type="button"
            className={`text-xs px-3 py-1.5 border transition-colors ${
              view === 'table'
                ? 'border-foreground bg-accent text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleView('table')}
          >
            table
          </button>
        </div>
        {view === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="border border-border h-[500px] bg-accent/10 flex items-center justify-center"><span className="text-xs text-muted-foreground">loading map...</span></div>}>
              <TicketMap points={points.data ?? []} />
            </Suspense>
          </div>
            <div>
              {breakdowns.data
                ? <BreakdownPanel stats={breakdowns.data} onFilter={handleFilter} />
                : <Skeleton />
              }
            </div>
          </div>
        ) : (
          <TicketTable
            filters={filterValues}
            page={page ?? 1}
            sortKey={(sortKey as keyof TicketRow) ?? 'issue_date'}
            sortDir={(sortDir as 'asc' | 'desc') ?? 'desc'}
            onPageChange={(p) => setState({ page: p })}
            onSortChange={(k, d) => setState({ sortKey: k, sortDir: d })}
          />
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 } },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <DashboardInner />
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
