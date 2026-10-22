import { CheckCircle2 } from "lucide-react";
import { getServerSession } from "@/lib/server-permissions";
import { serverFetcher } from "@/lib/server-fetcher";
import type { PermissionsByCategory } from "@/lib/queries/roles";
import { PageHeader } from "@/components/shared/page-header";
import { ChangePasswordDialog } from "@/components/shared/change-password-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const session = await getServerSession();
  const permissionsByCategory = await serverFetcher<PermissionsByCategory>("/permissions");
  const granted = new Set(session?.permissions ?? []);

  return (
    <div className="space-y-6">
      <PageHeader title="Your profile" description="Account details, role and permissions" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={`${session?.firstName ?? ""} ${session?.lastName ?? ""}`.trim() || "—"} />
          <Field label="Email" value={session?.email ?? "—"} />
          <Field label="Role" value={session?.roleName ?? "—"} />
          <Field label="Company" value={session?.companySlug ?? "Platform (all companies)"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Security</CardTitle>
          <ChangePasswordDialog trigger={<Button variant="outline">Change password</Button>} />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {Object.entries(permissionsByCategory).map(([category, permissions]) => {
            const held = permissions.filter((p) => granted.has(p.key));
            if (held.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {category}
                </h3>
                <ul className="space-y-1.5">
                  {held.map((p) => (
                    <li key={p.key} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <span className="text-foreground">{p.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground mt-0.5">{value}</p>
    </div>
  );
}
