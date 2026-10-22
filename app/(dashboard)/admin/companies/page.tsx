"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Building2 } from "lucide-react";
import { useCompanies, useDeleteCompany } from "@/lib/queries/companies";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const { data: companies, isLoading } = useCompanies();
  const deleteMutation = useDeleteCompany();

  const filtered = companies?.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const paged = filtered?.slice((page - 1) * pageSize, page * pageSize);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Company deleted");
      setDeleteId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete company");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Companies" description="Manage all tenant companies">
        <Button asChild>
          <Link href="/admin/companies/new">
            <Plus className="mr-2 h-4 w-4" />
            New Company
          </Link>
        </Button>
      </PageHeader>

      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search by name, slug, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="rounded-full bg-muted/50 pl-9 text-sm focus-visible:bg-card"
        />
      </div>

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
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Org Code</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Address</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={Building2}
                    title="No companies found"
                    description={search ? "No companies match your search." : "Create your first tenant company."}
                    actionLabel={!search ? "New Company" : undefined}
                    actionHref={!search ? "/admin/companies/new" : undefined}
                  />
                </TableCell>
              </TableRow>
            ) : (
              paged?.map((company) => (
                <TableRow
                  key={company.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/admin/companies/${company.id}`)}
                >
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-mono font-medium text-accent-foreground">
                      {company.slug}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground">{company.email}</p>
                    <p className="text-xs text-muted-foreground">{company.phone || "—"}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{company.address || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge type="subscription" status={company.subscriptionStatus} />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/companies/${company.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(company.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isLoading && (filtered?.length ?? 0) > 0 && (
          <TablePagination page={page} pageSize={pageSize} total={filtered?.length ?? 0} onPageChange={setPage} />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete company?"
        description="This will permanently remove the company and all associated data."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
