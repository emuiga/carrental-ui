"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, ChevronDown, MoreHorizontal, Pencil, PauseCircle, PlayCircle, Users, FolderOpen, FileText, Loader2 } from "lucide-react";
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
} from "@/components/ui/dialog";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCompany,
  useUpdateCompany,
  useUpdateCompanyFeatures,
} from "@/lib/queries/companies";
import { RoleManager } from "@/components/admin/role-manager";
import { UserManager } from "@/components/admin/user-manager";
import { DocumentManager } from "@/components/admin/document-manager";
import { ApprovalActions } from "@/components/admin/approval-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";

const detailsSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  subscriptionStatus: z.enum(["trial", "active", "inactive"]),
});

type DetailsValues = z.infer<typeof detailsSchema>;

const FEATURES: { key: string; label: string; description: string }[] = [
  { key: "sms", label: "SMS Notifications", description: "Send SMS alerts to customers" },
  { key: "mpesa", label: "M-Pesa Integration", description: "Accept M-Pesa payments" },
  { key: "reports", label: "Advanced Reports", description: "Detailed analytics and exports" },
  { key: "portal", label: "Customer Portal", description: "Self-service portal for customers" },
  { key: "gps", label: "GPS Tracking", description: "Real-time vehicle tracking" },
];

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: company, isLoading } = useCompany(id);
  const updateMutation = useUpdateCompany(id);
  const featuresMutation = useUpdateCompanyFeatures(id);

  const [features, setFeatures] = useState<Record<string, boolean> | null>(null);
  const [tab, setTab] = useState("details");
  const [editOpen, setEditOpen] = useState(false);

  const currentFeatures = features ?? company?.enabledFeatures ?? {};

  const form = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema) as Resolver<any>,
    values: company
      ? {
          name: company.name,
          email: company.email,
          phone: company.phone ?? "",
          address: company.address ?? "",
          subscriptionStatus: company.subscriptionStatus as "trial" | "active" | "inactive",
        }
      : undefined,
  });

  async function onSaveDetails(data: DetailsValues) {
    try {
      await updateMutation.mutateAsync(data);
      toast.success("Company updated");
      setEditOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update company");
    }
  }

  async function onSaveFeatures() {
    try {
      await featuresMutation.mutateAsync(currentFeatures);
      toast.success("Features saved");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save features");
    }
  }

  function toggleFeature(key: string) {
    setFeatures((prev) => ({
      ...(prev ?? company?.enabledFeatures ?? {}),
      [key]: !currentFeatures[key],
    }));
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!company) return <p className="text-muted-foreground">Company not found.</p>;

  const suspending = updateMutation.isPending;

  async function toggleSuspend() {
    try {
      await updateMutation.mutateAsync({
        subscriptionStatus: company!.subscriptionStatus === "inactive" ? "active" : "inactive",
      });
      toast.success(company!.subscriptionStatus === "inactive" ? "Company activated" : "Company suspended");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{company.name}</h1>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-mono font-medium text-accent-foreground">
              /{company.slug}
            </span>
            <StatusBadge type="subscription" status={company.subscriptionStatus} />
            <StatusBadge type="approval" status={company.approvalStatus} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">View and manage tenant company details</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <MoreHorizontal className="mr-1.5 h-4 w-4" />
                Actions
                <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleSuspend} disabled={suspending}>
                {company.subscriptionStatus === "inactive" ? (
                  <PlayCircle className="mr-2 h-4 w-4" />
                ) : (
                  <PauseCircle className="mr-2 h-4 w-4" />
                )}
                {company.subscriptionStatus === "inactive" ? "Activate" : "Suspend"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTab("documents")}>
                <FileText className="mr-2 h-4 w-4" />
                Manage Documents
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTab("users")}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTab("roles")}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Manage Roles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" asChild>
            <Link href="/admin/companies"><ArrowLeft className="mr-1.5 h-4 w-4" />Back</Link>
          </Button>
        </div>
      </div>

      {company.approvalStatus === "pending_review" && <ApprovalActions companyId={id} />}
      {company.approvalStatus === "rejected" && company.rejectionReason && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm font-semibold text-foreground">Rejected</p>
          <p className="text-xs text-muted-foreground mt-0.5">{company.rejectionReason}</p>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Users", value: company._count?.users ?? 0 },
          { label: "Vehicles", value: company._count?.vehicles ?? 0 },
          { label: "Bookings", value: company._count?.bookings ?? 0 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="details">Company Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        {/* Details tab */}
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="divide-y divide-border p-0">
              <div className="grid gap-x-8 gap-y-4 px-6 py-5 sm:grid-cols-2">
                <p className="col-span-full text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Company Details
                </p>
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-semibold text-foreground">{company.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Login Slug</p>
                  <p className="text-sm font-semibold font-mono text-foreground">{company.slug}</p>
                </div>
              </div>
              <div className="grid gap-x-8 gap-y-4 px-6 py-5 sm:grid-cols-2">
                <p className="col-span-full text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Contact Information
                </p>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold text-foreground">{company.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-semibold text-foreground">{company.phone || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-semibold text-foreground">{company.address || "—"}</p>
                </div>
              </div>
              <div className="grid gap-x-8 gap-y-4 px-6 py-5 sm:grid-cols-2">
                <p className="col-span-full text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status &amp; Information
                </p>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge type="subscription" status={company.subscriptionStatus} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="text-sm font-semibold text-foreground">{formatDate(company.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <DocumentManager companyId={id} />
        </TabsContent>

        {/* Features tab */}
        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Enabled Features</CardTitle>
              <CardDescription className="text-xs">
                Control which features this company has access to.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {FEATURES.map((feature, i) => (
                <div key={feature.key}>
                  {i > 0 && <Separator />}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <Label className="text-sm font-medium">{feature.label}</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                    </div>
                    <Switch
                      checked={!!currentFeatures[feature.key]}
                      onCheckedChange={() => toggleFeature(feature.key)}
                    />
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-end pt-4">
                <Button onClick={onSaveFeatures} disabled={featuresMutation.isPending}>
                  {featuresMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Features
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <UserManager companyId={id} />
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <RoleManager companyId={id} />
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaveDetails)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="subscriptionStatus" render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
