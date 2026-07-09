import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  colWidths?: string;
  gridTemplateColumns?: string;
}

export function TableSkeleton({ rows = 6, cols = 5, colWidths = '1fr', gridTemplateColumns }: TableSkeletonProps) {
  const gridStyle = { gridTemplateColumns: gridTemplateColumns || Array(cols).fill(colWidths).join(' ') };

  return (
    <div className="divide-y divide-border/40">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 px-5 py-3.5 items-center"
          style={gridStyle}
        >
          {i === 0 ? (
            // First row gets name+subtitle
            <>
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-18" />
                </div>
              </div>
              {Array.from({ length: cols - 2 }).map((__, j) => (
                <Skeleton key={j} className="h-3 w-full" />
              ))}
              <Skeleton className="h-5 w-16 rounded-full" />
            </>
          ) : (
            Array.from({ length: cols }).map((__, j) => (
              <Skeleton
                key={j}
                className="h-3"
                style={{ width: j === 0 ? '75%' : j === cols - 1 ? '60%' : '85%' }}
              />
            ))
          )}
        </div>
      ))}
    </div>
  );
}
