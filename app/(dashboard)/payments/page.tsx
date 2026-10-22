import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { PaymentsData } from "./payments-data";
import { PaymentsSkeleton } from "./payments-skeleton";

export const metadata = {
  title: "Payments",
  description: "All recorded payments",
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="All recorded payments" />

      <SearchInput placeholder="Search payments..." />

      <Suspense key={q} fallback={<PaymentsSkeleton />}>
        <PaymentsData search={q} />
      </Suspense>
    </div>
  );
}
