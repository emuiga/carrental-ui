import { serverFetcher } from "@/lib/server-fetcher";
import type { DashboardStats } from "@/lib/queries/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKES } from "@/lib/format";
import { cn } from "@/lib/utils";

export async function DashboardStatsSection() {
  const data = await serverFetcher<DashboardStats>("/dashboard");

  return (
    <>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            accent={0}
            title="Revenue (This Month)"
            value={formatKES(data.revenue.thisMonth)}
            sub={`Last month: ${formatKES(data.revenue.lastMonth)}`}
            trend={data.revenue.change}
          />
          <StatCard
            accent={1}
            title="Total Bookings"
            value={data.bookings.total}
            sub={`${data.bookings.active} active · ${data.bookings.pending} pending`}
          />
          <StatCard
            accent={2}
            title="Fleet Size"
            value={data.vehicles.total}
            sub={`${data.vehicles.available} available · ${data.vehicles.rented} rented`}
          />
          <StatCard accent={3} title="Customers" value={data.customers.total} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground/80">Booking Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Pending", value: data.bookings.pending, tone: "bg-warning" },
              { label: "Active", value: data.bookings.active, tone: "bg-info" },
              { label: "Completed", value: data.bookings.completed, tone: "bg-success" },
              { label: "Cancelled", value: data.bookings.cancelled, tone: "bg-destructive" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", item.tone)} />
                <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground/80">Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Available", value: data.vehicles.available, tone: "bg-success" },
              { label: "Rented", value: data.vehicles.rented, tone: "bg-info" },
              { label: "Maintenance", value: data.vehicles.maintenance, tone: "bg-warning" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", item.tone)} />
                <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
