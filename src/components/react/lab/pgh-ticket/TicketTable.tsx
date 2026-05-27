import type { TicketRow, TicketFilters } from '~/lib/pgh-ticket/types';
import { useTickets } from '~/queries/internal/queries';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '~/components/ui/table';
import { Skeleton } from '~/components/ui/skeleton';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';


interface Props {
  filters: TicketFilters;
  page: number;
  sortKey: keyof TicketRow;
  sortDir: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onSortChange: (key: keyof TicketRow, dir: 'asc' | 'desc') => void;
}

const PAGE_SIZE = 20;

const columns: { key: keyof TicketRow; label: string }[] = [
  { key: 'ticket_number', label: '#' },
  { key: 'license_plate', label: 'plate' },
  { key: 'location', label: 'location' },
  { key: 'issue_date', label: 'date' },
  { key: 'violation', label: 'violation' },
  { key: 'status', label: 'status' },
  { key: 'amount_due', label: 'fine' },
];

export default function TicketTable({ filters, page, sortKey, sortDir, onPageChange, onSortChange }: Props) {
  const { data, isFetching, isPlaceholderData, isLoading } = useTickets({ ...filters, page });

  const tickets = data?.tickets ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSort = (key: keyof TicketRow) => {
    if (sortKey === key) {
      onSortChange(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(key, 'asc');
    }
  };

  const sorted = tickets.toSorted((a, b) => {
    const av = a[sortKey] || '';
    const bv = b[sortKey] || '';
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div className="space-y-3">
      <div className="relative border border-border">
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent animate-pulse z-10" />
        )}
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer hover:text-foreground select-none text-muted-foreground"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody style={{ opacity: isPlaceholderData ? 0.5 : 1, transition: 'opacity 0.15s' }}>
            {isLoading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        <Skeleton className="h-3 w-[80%]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : sorted.map((t) => (
                  <TableRow key={t.ticket_number}>
                    <TableCell className="font-mono">{t.ticket_number}</TableCell>
                    <TableCell>{t.license_plate}</TableCell>
                    <TableCell className="truncate max-w-[200px]">{t.location}</TableCell>
                    <TableCell className="whitespace-nowrap">{t.issue_date}</TableCell>
                    <TableCell className="truncate max-w-[200px]">{t.violation}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'open' ? 'destructive' : t.status === 'paid' || t.status === 'closed' ? 'secondary' : 'outline'}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono whitespace-nowrap">{t.amount_due}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{total.toLocaleString()} tickets</span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="xs"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            prev
          </Button>
          {(() => {
            const items: (number | '...')[] = [];
            for (let i = 1; i <= totalPages; i++) {
              if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
                items.push(i);
              } else if (items[items.length - 1] !== '...') {
                items.push('...');
              }
            }
            return items.map((item, i) =>
              item === '...' ? (
                <span key={`dots-${i}`} className="px-1 text-muted-foreground/50">…</span>
              ) : (
                <Button
                  key={item}
                  variant={item === page ? 'outline' : 'ghost'}
                  size="xs"
                  onClick={() => onPageChange(item)}
                  className="min-w-[2rem]"
                >
                  {item}
                </Button>
              ),
            );
          })()}
          <Button
            variant="ghost"
            size="xs"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            next
          </Button>
        </div>
      </div>
    </div>
  );
}
