import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { serverFetcher } from "@/lib/server-fetcher";
import type { Booking } from "@/lib/queries/bookings";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatKES, formatDate } from "@/lib/format";

export async function BookingsData({ search, status }: { search: string; status: string }) {
  const bookings = await serverFetcher<Booking[]>(
    "/bookings",
    status !== "all" ? { status } : undefined
  );

  // The backend doesn't offer free-text search on this resource — filter the
  // already-fetched page server-side rather than adding client-side filtering.
  const q = search.toLowerCase();
  const filtered = q
    ? bookings.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.customer.fullName.toLowerCase().includes(q) ||
          `${b.vehicle.make} ${b.vehicle.model}`.toLowerCase().includes(q) ||
          b.vehicle.registrationNumber.toLowerCase().includes(q)
      )
    : bookings;

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
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState
                  icon={CalendarCheck}
                  title="No bookings found"
                  description={
                    search || status !== "all"
                      ? "No bookings match your filters."
                      : "Create your first booking to get started."
                  }
                  actionLabel={!search && status === "all" ? "New Booking" : undefined}
                  actionHref={!search && status === "all" ? "/bookings/new" : undefined}
                />
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm">
                  <Link href={`/bookings/${booking.id}`} className="text-primary hover:underline font-medium">
                    {booking.id.slice(0, 8).toUpperCase()}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  {booking.customer.fullName}
                </TableCell>
                <TableCell className="text-sm">
                  {booking.vehicle.make} {booking.vehicle.model}
                  <span className="block text-xs text-muted-foreground font-mono">
                    {booking.vehicle.registrationNumber}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(booking.startDate)}
                  <span className="text-muted-foreground mx-1">→</span>
                  {formatDate(booking.endDate)}
                </TableCell>
                <TableCell className="font-medium">{formatKES(booking.totalAmount)}</TableCell>
                <TableCell>
                  <StatusBadge type="booking" status={booking.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge type="payment" status={booking.paymentStatus} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
