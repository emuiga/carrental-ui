import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CustomersSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableSkeleton columns={6} />
      </Table>
    </div>
  );
}
