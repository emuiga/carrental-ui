"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ClipboardCheck } from "lucide-react";
import { useCompanies } from "@/lib/queries/companies";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export default function ApprovalsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const { data: companies, isLoading } = useCompanies(statusFilter === "all" ? undefined : statusFilter);

  const filtered = companies?.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  const paged = filtered?.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader title="Approvals" description="Review and approve or reject company registrations" />

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-full bg-muted/50 pl-9 text-sm focus-visible:bg-card"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All Status</SelectItem>
          </SelectContent>
        </Select>
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
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Org Code</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Submitted</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    icon={ClipboardCheck}
                    title="Nothing to review"
                    description="No companies match this filter right now."
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
                  <TableCell className="text-sm text-muted-foreground">{company.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(company.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge type="approval" status={company.approvalStatus} />
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
    </div>
  );
}
