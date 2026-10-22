"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { useDeleteCustomer, type Customer } from "@/lib/queries/customers";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CustomersTable({ customers, search }: { customers: Customer[]; search: string }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteCustomer();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Customer deleted");
      setDeleteId(null);
      // The list is server-rendered (see customers-data.tsx), not driven by
      // useCustomers() here — refresh the Server Component to re-fetch it.
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete customer");
    }
  }

  if (customers.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="p-0">
            <EmptyState
              icon={Users}
              title="No customers found"
              description={search ? "No customers match your search." : "Add your first customer to get started."}
              actionLabel={!search ? "Add Customer" : undefined}
              actionHref={!search ? "/customers/new" : undefined}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">
              <Link href={`/customers/${customer.id}`} className="hover:text-primary transition-colors">
                {customer.fullName}
              </Link>
            </TableCell>
            <TableCell className="text-sm">{customer.phone}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{customer.email ?? "—"}</TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs capitalize">
                {customer.customerType}
              </Badge>
            </TableCell>
            <TableCell className="text-sm">{customer._count?.bookings ?? 0}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/customers/${customer.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteId(customer.id)}
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
        title="Delete customer?"
        description="This will permanently remove the customer record."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
