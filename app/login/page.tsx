"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Car, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { setToken } from "@/lib/fetcher";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ── Schemas ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  companySlug: z.string().optional(),
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

const otpSchema = z.object({
  code: z.string().length(6, "Enter 6-digit code"),
});

type LoginValues = z.infer<typeof loginSchema>;
type OtpValues = z.infer<typeof otpSchema>;

// ── OTP Step ──────────────────────────────────────────────────────────────────

function TwoFAStep({
  pendingToken,
  onBack,
}: {
  pendingToken: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<OtpValues>({
    resolver: zodResolver(otpSchema) as Resolver<any>,
    defaultValues: { code: "" },
  });

  async function onSubmit(data: OtpValues) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/2fa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken, code: data.code }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Invalid code");
        return;
      }
      setToken(json.token);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Two-factor authentication</h2>
      <p className="text-sm text-gray-500 mb-6">
        Enter the 6-digit code from your authenticator app.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back to login
          </button>
        </form>
      </Form>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema) as Resolver<any>,
    defaultValues: { companySlug: "", email: "", password: "" },
  });

  async function onSubmit(data: LoginValues) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          companySlug: isSuperadmin ? undefined : (data.companySlug || undefined),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Invalid credentials");
        return;
      }

      if (json.requires2FA) {
        setPendingToken(json.pendingToken);
        return;
      }

      setToken(json.token);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 mb-4">
            <Car className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FleetMS</h1>
          <p className="text-sm text-gray-500 mt-1">Car Rental Management</p>
        </div>

        {/* 2FA step */}
        {pendingToken ? (
          <TwoFAStep
            pendingToken={pendingToken}
            onBack={() => {
              setPendingToken(null);
              form.reset();
            }}
          />
        ) : (
          /* Credentials step */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>

            {/* Superadmin toggle */}
            <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
              <Label htmlFor="superadmin-toggle" className="text-sm text-gray-700 cursor-pointer">
                Sign in as superadmin
              </Label>
              <Switch
                id="superadmin-toggle"
                checked={isSuperadmin}
                onCheckedChange={(val) => {
                  setIsSuperadmin(val);
                  form.reset({ companySlug: "", email: "", password: "" });
                }}
              />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!isSuperadmin && (
                  <FormField
                    control={form.control}
                    name="companySlug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. safari-rentals"
                            autoComplete="organization"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
