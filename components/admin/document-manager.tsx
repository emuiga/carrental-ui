"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, MoreHorizontal, Trash2, Download, Upload, Loader2 } from "lucide-react";
import {
  useCompanyDocuments,
  useUploadCompanyDocument,
  useDeleteCompanyDocument,
} from "@/lib/queries/companies";
import { downloadFile } from "@/lib/fetcher";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatFileSize, formatDate } from "@/lib/format";

const CATEGORIES = [
  { value: "registration", label: "Registration Certificate" },
  { value: "kra_pin", label: "KRA PIN" },
  { value: "license", label: "License" },
  { value: "other", label: "Other" },
];

function UploadDialog({
  open,
  onOpenChange,
  companyId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("other");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadCompanyDocument(companyId);

  async function handleUpload() {
    if (!file) return;
    try {
      await uploadMutation.mutateAsync({ file, category });
      toast.success("Document uploaded");
      onOpenChange(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to upload document");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <p className="text-xs text-muted-foreground">PDF, JPG or PNG, up to 10MB.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || uploadMutation.isPending}>
            {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DocumentManager({ companyId }: { companyId: string }) {
  const { data: documents, isLoading } = useCompanyDocuments(companyId);
  const deleteMutation = useDeleteCompanyDocument(companyId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = documents?.filter((d) => categoryFilter === "all" || d.category === categoryFilter);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Document deleted");
      setDeleteId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete document");
    }
  }

  async function handleDownload(docId: string, fileName: string) {
    try {
      await downloadFile(`/api/companies/${companyId}/documents/${docId}/download`, fileName);
    } catch {
      toast.error("Failed to download document");
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Company Documents</h3>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${filtered?.length ?? 0} document${filtered?.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-1.5 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : filtered?.length === 0 ? (
          <EmptyState icon={FileText} title="No documents uploaded yet" description="Upload a document to get started." />
        ) : (
          filtered?.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-destructive/10">
                <FileText className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{doc.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(doc.fileSize)} &middot; {formatDate(doc.uploadedAt)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload(doc.id, doc.fileName)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteId(doc.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} companyId={companyId} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete document?"
        description="This file will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
