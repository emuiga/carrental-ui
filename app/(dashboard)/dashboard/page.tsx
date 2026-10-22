import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardStatsSection } from "./dashboard-stats";
import { DashboardStatsSkeleton } from "./dashboard-skeleton";

export const metadata = {
  title: "Dashboard",
  description: "Overview of your fleet operations",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your fleet operations" />

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStatsSection />
      </Suspense>
    </div>
  );
}
