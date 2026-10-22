import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { getServerSession } from "@/lib/server-permissions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar session={session} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav session={session} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
