import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PaymentsSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Booking</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableSkeleton columns={7} />
      </Table>
    </div>
  );
}
