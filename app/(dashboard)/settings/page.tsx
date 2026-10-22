"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { useSession } from "@/lib/use-session";
import { usePermission } from "@/lib/use-permissions";
import { getToken } from "@/lib/fetcher";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RoleManager } from "@/components/admin/role-manager";
import { UserManager } from "@/components/admin/user-manager";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
            <ShieldCheck className="h-5 w-5 text-success" />
            <CardTitle className="text-sm font-semibold">Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Your account is protected with an authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-sm text-success">
            2FA is currently <strong>enabled</strong>. You will be asked for a code each time you sign in.
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-foreground mb-3">Disable 2FA</p>
            <p className="text-sm text-muted-foreground mb-4">
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
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-semibold">Set Up Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Scan the QR code with Google Authenticator or any TOTP app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-lg border border-border p-3 inline-block bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setup.qrCode} alt="2FA QR Code" width={180} height={180} />
            </div>
          </div>

          {/* Manual entry secret */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Can&apos;t scan? Enter this key manually:</p>
            <code className="block bg-muted/50 border border-border rounded px-3 py-2 text-xs font-mono break-all text-foreground">
              {setup.secret}
            </code>
          </div>

          {/* Verify code */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-foreground mb-3">
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
          <Shield className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">Two-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          Add an extra layer of security to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-warning/10 border border-warning/30 px-4 py-3 text-sm text-warning-foreground">
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

  const canManageRoles = usePermission("users.manage_role");
  // Platform-level users (superadmin) don't have a company — hide team tab
  const isSuperadmin = session?.user?.permissions.includes("companies.manage") ?? false;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Settings" description="Manage your team and account" />

      <Tabs defaultValue={isSuperadmin ? "account" : "team"}>
        <TabsList>
          {!isSuperadmin && <TabsTrigger value="team">Team</TabsTrigger>}
          {!isSuperadmin && canManageRoles && <TabsTrigger value="roles">Roles</TabsTrigger>}
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* ── Team ── */}
        {!isSuperadmin && (
          <TabsContent value="team" className="mt-4">
            <UserManager />
          </TabsContent>
        )}

        {/* ── Roles ── */}
        {!isSuperadmin && canManageRoles && (
          <TabsContent value="roles" className="mt-4">
            <RoleManager />
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
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{session?.user?.firstName} {session?.user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{session?.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="outline" className="text-xs capitalize">{session?.user?.roleName}</Badge>
              </div>
              {!isSuperadmin && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
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
    </div>
  );
}
