import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Semantic tones map to the design tokens in globals.css (--warning, --success,
 * --info, --destructive) — never introduce a raw Tailwind palette color here.
 */
type Tone = "warning" | "info" | "success" | "destructive" | "neutral";

const toneClass: Record<Tone, string> = {
  warning: "bg-warning/15 text-warning-foreground border-warning/30",
  info: "bg-info/15 text-info-foreground border-info/30 dark:text-info",
  success: "bg-success/15 text-success-foreground border-success/30 dark:text-success",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

const bookingStatusMap: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "warning" },
  active: { label: "Active", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "destructive" },
};

const paymentStatusMap: Record<string, { label: string; tone: Tone }> = {
  unpaid: { label: "Unpaid", tone: "destructive" },
  partial: { label: "Partial", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
};

const vehicleStatusMap: Record<string, { label: string; tone: Tone }> = {
  available: { label: "Available", tone: "success" },
  rented: { label: "Rented", tone: "info" },
  maintenance: { label: "Maintenance", tone: "warning" },
};

const subscriptionMap: Record<string, { label: string; tone: Tone }> = {
  trial: { label: "Trial", tone: "warning" },
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
};

const approvalMap: Record<string, { label: string; tone: Tone }> = {
  pending_review: { label: "Pending Review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "destructive" },
};

type BadgeType = "booking" | "payment" | "vehicle" | "subscription" | "approval";

export function StatusBadge({ type, status }: { type: BadgeType; status: string }) {
  const map = {
    booking: bookingStatusMap,
    payment: paymentStatusMap,
    vehicle: vehicleStatusMap,
    subscription: subscriptionMap,
    approval: approvalMap,
  }[type];

  const config = map[status] ?? { label: status, tone: "neutral" as Tone };

  return (
    <Badge variant="outline" className={cn("text-xs font-medium", toneClass[config.tone])}>
      {config.label}
    </Badge>
  );
}
