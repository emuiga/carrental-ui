"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useUpdateCompanyApproval } from "@/lib/queries/companies";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function ApprovalActions({ companyId }: { companyId: string }) {
  const approvalMutation = useUpdateCompanyApproval(companyId);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function handleApprove() {
    try {
      await approvalMutation.mutateAsync({ status: "approved" });
      toast.success("Company approved");
      setApproveOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to approve company");
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      toast.error("A rejection reason is required");
      return;
    }
    try {
      await approvalMutation.mutateAsync({ status: "rejected", rejectionReason: reason.trim() });
      toast.success("Company rejected");
      setRejectOpen(false);
      setReason("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to reject company");
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-4">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">Pending review</p>
        <p className="text-xs text-muted-foreground">
          Review this company&apos;s documents, then approve or reject their registration.
        </p>
      </div>
      <Button variant="outline" onClick={() => setRejectOpen(true)}>
        <XCircle className="mr-1.5 h-4 w-4" />
        Reject
      </Button>
      <Button onClick={() => setApproveOpen(true)}>
        <CheckCircle2 className="mr-1.5 h-4 w-4" />
        Approve
      </Button>

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve this company?"
        description="They'll be notified by email and can start using the platform."
        confirmLabel="Approve"
        variant="default"
        onConfirm={handleApprove}
        loading={approvalMutation.isPending}
      />

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject this company?</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this registration is being rejected…"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={approvalMutation.isPending}>
              {approvalMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
