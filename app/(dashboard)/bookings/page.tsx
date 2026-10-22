import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatusFilter } from "@/components/shared/status-filter";
import { Button } from "@/components/ui/button";
import { BookingsData } from "./bookings-data";
import { BookingsSkeleton } from "./bookings-skeleton";

export const metadata = {
  title: "Bookings",
  description: "Manage rental bookings",
};

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "all" } = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Manage rental bookings">
        <Button asChild>
          <Link href="/bookings/new">
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </PageHeader>

      <div className="flex gap-3 flex-wrap">
        <SearchInput placeholder="Search bookings..." />
        <StatusFilter options={STATUS_OPTIONS} />
      </div>

      <Suspense key={`${q}-${status}`} fallback={<BookingsSkeleton />}>
        <BookingsData search={q} status={status} />
      </Suspense>
    </div>
  );
}
