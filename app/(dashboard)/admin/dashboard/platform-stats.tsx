import { serverFetcher } from "@/lib/server-fetcher";
import type { PlatformDashboardStats } from "@/lib/queries/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatKES } from "@/lib/format";
import { RevenueByCompanyChart, VehicleStatusChart, BookingStatusChart } from "./platform-charts";

export async function PlatformStatsSection() {
  const data = await serverFetcher<PlatformDashboardStats>("/dashboard/platform");

  return (
    <>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Platform Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            accent={0}
            title="Companies"
            value={data.companies.total}
            sub={`${data.companies.active} active · ${data.companies.trial} trial`}
          />
          <StatCard accent={1} title="Users" value={data.users.total} />
          <StatCard accent={2} title="Total Revenue" value={formatKES(data.revenue.total)} />
          <StatCard
            accent={3}
            title="Total Bookings"
            value={data.bookings.total}
            sub={`${data.bookings.active} active · ${data.bookings.pending} pending`}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Fleet &amp; Bookings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <VehicleStatusChart data={data.vehicles} />
          <BookingStatusChart data={data.bookings} />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Companies</h2>
        <RevenueByCompanyChart data={data.byCompany} />
      </div>
    </>
  );
}
