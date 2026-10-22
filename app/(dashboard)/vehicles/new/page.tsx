import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewVehicleForm } from "@/components/vehicles/new-vehicle-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Add Vehicle",
  description: "Register a new vehicle to your fleet",
};

export default function NewVehiclePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vehicles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Add Vehicle" description="Register a new vehicle to your fleet" />
      </div>

      <Card>
        <CardContent className="p-6">
          <NewVehicleForm />
        </CardContent>
      </Card>
    </div>
  );
}
