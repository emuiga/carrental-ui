"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateVehicle } from "@/lib/queries/vehicles";
import { VehicleForm, type VehicleFormValues } from "@/components/vehicles/vehicle-form";

export function NewVehicleForm() {
  const router = useRouter();
  const createMutation = useCreateVehicle();

  async function handleSubmit(data: VehicleFormValues) {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Vehicle added successfully");
      router.push("/vehicles");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add vehicle");
    }
  }

  return <VehicleForm onSubmit={handleSubmit} loading={createMutation.isPending} />;
}
