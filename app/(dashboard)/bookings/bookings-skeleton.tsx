import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function BookingsSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Booking #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableSkeleton columns={7} />
      </Table>
    </div>
  );
}
