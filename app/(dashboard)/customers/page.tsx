import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { CustomersData } from "./customers-data";
import { CustomersSkeleton } from "./customers-skeleton";

export const metadata = {
  title: "Customers",
  description: "Manage customer records",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage customer records">
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </PageHeader>

      <SearchInput placeholder="Search customers..." />

      <Suspense key={q} fallback={<CustomersSkeleton />}>
        <CustomersData search={q} />
      </Suspense>
    </div>
  );
}
