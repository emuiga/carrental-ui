import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewCustomerForm } from "@/components/customers/new-customer-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Add Customer",
  description: "Register a new customer",
};

export default function NewCustomerPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Add Customer" description="Register a new customer" />
      </div>

      <Card>
        <CardContent className="p-6">
          <NewCustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
