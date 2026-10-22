import { StatCardSkeleton } from "@/components/dashboard/stat-card";
import { Table, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/table-skeleton";

export function PlatformStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
      <div className="sm:col-span-2 lg:col-span-4 rounded-lg border border-border bg-card overflow-hidden mt-2">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Vehicles</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableSkeleton columns={6} />
        </Table>
      </div>
    </div>
  );
}
