import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function VehiclesSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Vehicle</TableHead>
            <TableHead>Plate</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableSkeleton columns={6} />
      </Table>
    </div>
  );
}
