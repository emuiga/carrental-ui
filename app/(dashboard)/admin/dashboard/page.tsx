import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PlatformStatsSection } from "./platform-stats";
import { PlatformStatsSkeleton } from "./platform-skeleton";

export const metadata = {
  title: "Platform Dashboard",
  description: "Overview across all tenant companies",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Platform Dashboard" description="Overview across all tenant companies" />

      <Suspense fallback={<PlatformStatsSkeleton />}>
        <PlatformStatsSection />
      </Suspense>
    </div>
  );
}
