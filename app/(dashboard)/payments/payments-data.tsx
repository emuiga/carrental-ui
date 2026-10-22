import Link from "next/link";
import { CreditCard } from "lucide-react";
import { serverFetcher } from "@/lib/server-fetcher";
import type { Payment } from "@/lib/queries/payments";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatKES, formatDate } from "@/lib/format";

export async function PaymentsData({ search }: { search: string }) {
  const payments = await serverFetcher<Payment[]>("/payments");

  // No free-text search endpoint on this resource — filter server-side here
  // instead of shipping the full list to the client for filtering.
  const q = search.toLowerCase();
  const filtered = q
    ? payments.filter(
        (p) =>
          p.booking.id.toLowerCase().includes(q) ||
          p.booking.customer.fullName.toLowerCase().includes(q) ||
          (p.transactionRef ?? "").toLowerCase().includes(q)
      )
    : payments;

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
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState
                  icon={CreditCard}
                  title="No payments found"
                  description={search ? "No payments match your search." : "Payments will appear here once bookings are paid."}
                />
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm">
                  <Link href={`/bookings/${payment.booking.id}`} className="text-primary hover:underline">
                    {payment.booking.id.slice(0, 8).toUpperCase()}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  {payment.booking.customer.fullName}
                </TableCell>
                <TableCell className="font-medium">{formatKES(payment.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">
                    {payment.paymentMethod.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {payment.transactionRef ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge type="payment" status={payment.booking.paymentStatus} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
