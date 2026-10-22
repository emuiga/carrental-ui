import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

/**
 * Generic loading placeholder for a data table's rows — rendered as the
 * Suspense fallback while a Server Component fetches the real rows, so the
 * page's static shell (header, table headings, filters) paints immediately.
 * Renders only <TableBody> — use inside an already-open <Table>/<TableHeader>.
 */
export function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
