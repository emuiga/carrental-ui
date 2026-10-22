"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateCustomer } from "@/lib/queries/customers";
import { CustomerForm, type CustomerFormValues } from "@/components/customers/customer-form";

export function NewCustomerForm() {
  const router = useRouter();
  const createMutation = useCreateCustomer();

  async function handleSubmit(data: CustomerFormValues) {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Customer added");
      router.push("/customers");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add customer");
    }
  }

  return <CustomerForm onSubmit={handleSubmit} loading={createMutation.isPending} />;
}
