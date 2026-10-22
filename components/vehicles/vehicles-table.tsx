"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Car } from "lucide-react";
import { useDeleteVehicle, type Vehicle } from "@/lib/queries/vehicles";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatKES } from "@/lib/format";

export function VehiclesTable({ vehicles, search }: { vehicles: Vehicle[]; search: string }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteVehicle();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Vehicle deleted");
      setDeleteId(null);
      // The list is server-rendered (see vehicles-data.tsx), not driven by
      // useVehicles() here — refresh the Server Component to re-fetch it.
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete vehicle");
    }
  }

  if (vehicles.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="p-0">
            <EmptyState
              icon={Car}
              title="No vehicles found"
              description={search ? "No vehicles match your search." : "Add your first vehicle to get started."}
              actionLabel={!search ? "Add Vehicle" : undefined}
              actionHref={!search ? "/vehicles/new" : undefined}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">
              <Link href={`/vehicles/${vehicle.id}`} className="hover:text-primary transition-colors">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Link>
            </TableCell>
            <TableCell className="font-mono text-sm">{vehicle.registrationNumber}</TableCell>
            <TableCell className="capitalize text-sm">{vehicle.category}</TableCell>
            <TableCell>{formatKES(vehicle.dailyRate)}/day</TableCell>
            <TableCell>
              <StatusBadge type="vehicle" status={vehicle.status} />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/vehicles/${vehicle.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteId(vehicle.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete vehicle?"
        description="This action cannot be undone. The vehicle will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
