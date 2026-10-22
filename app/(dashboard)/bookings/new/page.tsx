import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverFetcher } from "@/lib/server-fetcher";
import type { Vehicle } from "@/lib/queries/vehicles";
import type { Customer } from "@/lib/queries/customers";
import { NewBookingForm } from "@/components/bookings/new-booking-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "New Booking",
  description: "Create a rental booking",
};

export default async function NewBookingPage() {
  const [vehicles, customers] = await Promise.all([
    serverFetcher<Vehicle[]>("/vehicles", { status: "available" }),
    serverFetcher<Customer[]>("/customers"),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/bookings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="New Booking" description="Create a rental booking" />
      </div>

      <Card>
        <CardContent className="p-6">
          <NewBookingForm vehicles={vehicles} customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
