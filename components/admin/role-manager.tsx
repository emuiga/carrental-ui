"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, MoreHorizontal, Search } from "lucide-react";
import { usePermissionsList, useRoles, useCreateRole, useUpdateRolePermissions, useDeleteRole, useAssignUserRole } from "@/lib/queries/roles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShieldCheck } from "lucide-react";

function PermissionPicker({
  selected,
  onChange,
}: {
  selected: Set<string>;
  onChange: (keys: Set<string>) => void;
}) {
  const { data: categories, isLoading } = usePermissionsList();
  const [query, setQuery] = useState("");

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!categories) return null;

  function toggle(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  }

  function toggleCategory(keys: string[], checked: boolean) {
    const next = new Set(selected);
    for (const k of keys) {
      if (checked) next.add(k);
      else next.delete(k);
    }
    onChange(next);
  }

  const q = query.trim().toLowerCase();
  const filtered = Object.entries(categories)
    .map(([category, permissions]) => [
      category,
      q
        ? permissions.filter((p) => p.key.toLowerCase().includes(q) || p.label.toLowerCase().includes(q))
        : permissions,
    ] as const)
    .filter(([, permissions]) => permissions.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Permissions</p>
        <p className="text-xs text-muted-foreground">{selected.size} selected</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>
      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {filtered.map(([category, permissions]) => {
          const keys = permissions.map((p) => p.key);
          const allSelected = keys.every((k) => selected.has(k));
          return (
            <div key={category} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold capitalize text-foreground">{category}</p>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <Checkbox checked={allSelected} onCheckedChange={(v) => toggleCategory(keys, !!v)} />
                  Select All
                </label>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {permissions.map((p) => (
                  <label
                    key={p.key}
                    className="flex items-start gap-2 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-accent/50"
                  >
                    <Checkbox checked={selected.has(p.key)} onCheckedChange={() => toggle(p.key)} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.key}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreateRoleDialog({
  open,
  onOpenChange,
  companyId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId?: string;
}) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const createMutation = useCreateRole();

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
    try {
      await createMutation.mutateAsync({ name: name.trim(), companyId, permissions: [...selected] });
      toast.success("Role created");
      onOpenChange(false);
      setName("");
      setSelected(new Set());
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create role");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="role-name">Role Name</Label>
            <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Front Desk" />
          </div>
          <PermissionPicker selected={selected} onChange={setSelected} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditPermissionsDialog({
  role,
  open,
  onOpenChange,
}: {
  role: import("@/lib/queries/roles").Role;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(role.permissions));
  const updateMutation = useUpdateRolePermissions(role.id);

  async function handleSave() {
    try {
      await updateMutation.mutateAsync([...selected]);
      toast.success("Permissions updated");
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update permissions");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role.name} — Permissions</DialogTitle>
        </DialogHeader>
        <PermissionPicker selected={selected} onChange={setSelected} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleRow({ role }: { role: import("@/lib/queries/roles").Role }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteMutation = useDeleteRole();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(role.id);
      toast.success("Role deleted");
      setConfirmDelete(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete role");
    }
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{role.name}</span>
          {role.isSystem && <Badge variant="secondary" className="text-xs">System</Badge>}
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {role.permissions.length} permission{role.permissions.length === 1 ? "" : "s"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {role.userCount} member{role.userCount === 1 ? "" : "s"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit Permissions</DropdownMenuItem>
            {!role.isSystem && (
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmDelete(true)}>
                Delete Role
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      <EditPermissionsDialog role={role} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete role?"
        description={`"${role.name}" will be permanently removed. This only works if no users are currently assigned to it.`}
        onConfirm={handleDelete}
      />
    </TableRow>
  );
}

export function UserRoleAssign({
  userId,
  currentRoleId,
  companyId,
}: {
  userId: string;
  currentRoleId?: string | null;
  companyId?: string;
}) {
  const { data: roles } = useRoles(companyId);
  const assignMutation = useAssignUserRole();

  async function handleChange(roleId: string) {
    try {
      await assignMutation.mutateAsync({ userId, roleId });
      toast.success("Role updated");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update role");
    }
  }

  return (
    <Select value={currentRoleId ?? undefined} onValueChange={handleChange}>
      <SelectTrigger className="h-7 w-32 text-xs">
        <SelectValue placeholder="Assign role" />
      </SelectTrigger>
      <SelectContent>
        {roles?.map((role) => (
          <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RoleManager({ companyId }: { companyId?: string }) {
  const { data: roles, isLoading } = useRoles(companyId);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => roles?.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [roles, search]
  );
  const paged = filtered?.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by role name..."
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
          Add Role
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
          icon={ShieldCheck}
          title="No roles found"
          description={search ? "No roles match your search." : "Create your first custom role."}
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
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Permissions</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Members</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged?.map((role) => (
                <RoleRow key={role.id} role={role} />
              ))}
            </TableBody>
          </Table>
          {!isLoading && (filtered?.length ?? 0) > 0 && (
            <TablePagination page={page} pageSize={pageSize} total={filtered?.length ?? 0} onPageChange={setPage} />
          )}
        </div>
      )}

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} companyId={companyId} />
    </div>
  );
}
