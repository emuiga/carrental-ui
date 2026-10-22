"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUsers, useCreateUser, useDeleteUser } from "@/lib/queries/users";
import { useRoles } from "@/lib/queries/roles";
import { UserRoleAssign } from "@/components/admin/role-manager";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

const createUserSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  roleId: z.string().uuid("Select a role"),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

function CreateUserDialog({
  open,
  onOpenChange,
  companyId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId?: string;
}) {
  const { data: roles } = useRoles(companyId);
  const createMutation = useCreateUser();
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema) as Resolver<any>,
    defaultValues: { firstName: "", lastName: "", email: "", roleId: "" },
  });

  async function onSubmit(data: CreateUserValues) {
    try {
      await createMutation.mutateAsync({ ...data, companyId });
      toast.success("User created. They will receive an email to set their password.");
      onOpenChange(false);
      form.reset();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create user");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personal Information</p>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact Information</p>
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role Assignment</p>
            <FormField control={form.control} name="roleId" render={({ field }) => (
              <FormItem>
                <FormLabel>User Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <p className="text-xs text-muted-foreground">
              They&apos;ll receive an email with a link to set their own password.
            </p>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function UserManager({ companyId }: { companyId?: string }) {
  const { data: users, isLoading } = useUsers(companyId);
  const deleteMutation = useDeleteUser();
  const [createOpen, setCreateOpen] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = users?.filter((u) => {
    const q = search.toLowerCase();
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });
  const paged = filtered?.slice((page - 1) * pageSize, page * pageSize);

  async function handleDeactivate() {
    if (!deactivateId) return;
    try {
      await deleteMutation.mutateAsync(deactivateId);
      toast.success("User deactivated");
      setDeactivateId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to deactivate user");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-full bg-muted/50 pl-9 text-sm focus-visible:bg-card"
          />
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add User
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Add your first team member to get started."
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <TableToolbar
            pageSize={pageSize}
            onPageSizeChange={(n) => {
              setPageSize(n);
              setPage(1);
            }}
          />
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User Details</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created At</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </TableCell>
                  <TableCell>
                    <UserRoleAssign userId={user.id} currentRoleId={user.roleId} companyId={companyId} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="subscription" status={user.isActive ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeactivateId(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && (filtered?.length ?? 0) > 0 && (
            <TablePagination page={page} pageSize={pageSize} total={filtered?.length ?? 0} onPageChange={setPage} />
          )}
        </div>
      )}

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} companyId={companyId} />
      <ConfirmDialog
        open={!!deactivateId}
        onOpenChange={(o) => !o && setDeactivateId(null)}
        title="Delete user?"
        description="They will no longer be able to log in."
        confirmLabel="Delete"
        onConfirm={handleDeactivate}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
