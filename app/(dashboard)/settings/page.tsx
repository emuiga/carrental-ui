"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { useSession } from "@/lib/use-session";
import { getToken } from "@/lib/fetcher";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUsers, useCreateUser, useDeleteUser } from "@/lib/queries/users";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Add User Dialog ────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  role: z.enum(["admin", "manager", "staff"]),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

function AddUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createMutation = useCreateUser();
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema) as Resolver<any>,
    defaultValues: { firstName: "", lastName: "", email: "", password: "", role: "staff" },
  });

  async function onSubmit(data: CreateUserValues) {
    try {
      await createMutation.mutateAsync(data);
      toast.success("User created");
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
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
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
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
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

// ── 2FA Setup Flow ─────────────────────────────────────────────────────────────

type SetupData = { secret: string; qrCode: string; otpauth: string };

const codeSchema = z.object({ code: z.string().length(6, "Enter 6-digit code") });
type CodeValues = z.infer<typeof codeSchema>;

function TwoFATab({ twoFactorEnabled: initialEnabled }: { twoFactorEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [loadingSetup, setLoadingSetup] = useState(false);

  // Form for enabling (after QR scan)
  const enableForm = useForm<CodeValues>({
    resolver: zodResolver(codeSchema) as Resolver<any>,
    defaultValues: { code: "" },
  });

  // Form for disabling
  const disableForm = useForm<CodeValues>({
    resolver: zodResolver(codeSchema) as Resolver<any>,
    defaultValues: { code: "" },
  });

  async function startSetup() {
    setLoadingSetup(true);
    try {
      const res = await fetch(`${API_BASE}/auth/2fa/setup`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to generate setup data");
      const data = await res.json();
      setSetup(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to start setup");
    } finally {
      setLoadingSetup(false);
    }
  }

  async function onEnable(data: CodeValues) {
    if (!setup) return;
    try {
      const res = await fetch(`${API_BASE}/auth/2fa/enable`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ secret: setup.secret, code: data.code }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Invalid code");
        return;
      }
      toast.success("Two-factor authentication enabled");
      setEnabled(true);
      setSetup(null);
      enableForm.reset();
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function onDisable(data: CodeValues) {
    try {
      const res = await fetch(`${API_BASE}/auth/2fa/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ code: data.code }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Invalid code");
        return;
      }
      toast.success("Two-factor authentication disabled");
      setEnabled(false);
      disableForm.reset();
    } catch {
      toast.error("Something went wrong");
    }
  }

  // ── Enabled state ──
  if (enabled) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <CardTitle className="text-sm font-semibold">Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Your account is protected with an authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            2FA is currently <strong>enabled</strong>. You will be asked for a code each time you sign in.
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-900 mb-3">Disable 2FA</p>
            <p className="text-sm text-gray-500 mb-4">
              Enter your current authenticator code to confirm.
            </p>
            <Form {...disableForm}>
              <form onSubmit={disableForm.handleSubmit(onDisable)} className="space-y-4">
                <FormField
                  control={disableForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={disableForm.formState.isSubmitting}
                  className="gap-1.5"
                >
                  {disableForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldOff className="h-4 w-4" />
                  )}
                  Disable 2FA
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Setup in progress ──
  if (setup) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-sm font-semibold">Set Up Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Scan the QR code with Google Authenticator or any TOTP app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-lg border border-gray-200 p-3 inline-block bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setup.qrCode} alt="2FA QR Code" width={180} height={180} />
            </div>
          </div>

          {/* Manual entry secret */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Can&apos;t scan? Enter this key manually:</p>
            <code className="block bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs font-mono break-all text-gray-700">
              {setup.secret}
            </code>
          </div>

          {/* Verify code */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-900 mb-3">
              Enter the code shown in your app to confirm setup
            </p>
            <Form {...enableForm}>
              <form onSubmit={enableForm.handleSubmit(onEnable)} className="space-y-4">
                <FormField
                  control={enableForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setSetup(null); enableForm.reset(); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={enableForm.formState.isSubmitting}>
                    {enableForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enable 2FA
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Disabled state ──
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-400" />
          <CardTitle className="text-sm font-semibold">Two-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          Add an extra layer of security to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          2FA is currently <strong>disabled</strong>. We recommend enabling it to protect your account.
        </div>
        <Button onClick={startSetup} disabled={loadingSetup} className="gap-1.5">
          {loadingSetup ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Set up 2FA
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Settings Page ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: users, isLoading } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "admin";
  // Superadmins don't have a company — hide team tab
  const isSuperadmin = session?.user?.role === "superadmin";

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteUserMutation.mutateAsync(deleteId);
      toast.success("User removed");
      setDeleteId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to remove user");
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Settings" description="Manage your team and account" />

      <Tabs defaultValue={isSuperadmin ? "account" : "team"}>
        <TabsList>
          {!isSuperadmin && <TabsTrigger value="team">Team</TabsTrigger>}
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* ── Team ── */}
        {!isSuperadmin && (
          <TabsContent value="team" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Team Members</CardTitle>
                {isAdmin && (
                  <Button size="sm" onClick={() => setAddOpen(true)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Member
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {users?.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
                          {isAdmin && user.id !== session?.user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteId(user.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ── Account ── */}
        <TabsContent value="account" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Your Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{session?.user?.firstName} {session?.user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{session?.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <Badge variant="outline" className="text-xs capitalize">{session?.user?.role}</Badge>
              </div>
              {!isSuperadmin && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Company</span>
                  <span className="font-mono text-xs">{session?.user?.companySlug ?? "—"}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security / 2FA ── */}
        <TabsContent value="security" className="mt-4">
          <TwoFATab twoFactorEnabled={false} />
        </TabsContent>
      </Tabs>

      <AddUserDialog open={addOpen} onOpenChange={setAddOpen} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Remove team member?"
        description="This user will lose access to the platform."
        confirmLabel="Remove"
        onConfirm={handleDelete}
        loading={deleteUserMutation.isPending}
      />
    </div>
  );
}
