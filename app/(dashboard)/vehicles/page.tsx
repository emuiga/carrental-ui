import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { VehiclesData } from "./vehicles-data";
import { VehiclesSkeleton } from "./vehicles-skeleton";

export const metadata = {
  title: "Vehicles",
  description: "Manage your fleet",
};

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicles" description="Manage your fleet">
        <Button asChild>
          <Link href="/vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Link>
        </Button>
      </PageHeader>

      <SearchInput placeholder="Search vehicles..." />

      <Suspense key={q} fallback={<VehiclesSkeleton />}>
        <VehiclesData search={q} />
      </Suspense>
    </div>
  );
}
