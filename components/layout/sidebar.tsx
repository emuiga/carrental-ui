"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/permissions";
import {
  LayoutDashboard,
  Car,
  Users,
  CalendarCheck,
  CreditCard,
  Settings,
  Building2,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  companyOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, companyOnly: true },
  { label: "Vehicles", href: "/vehicles", icon: Car, companyOnly: true },
  { label: "Customers", href: "/customers", icon: Users, companyOnly: true },
  { label: "Bookings", href: "/bookings", icon: CalendarCheck, companyOnly: true },
  { label: "Payments", href: "/payments", icon: CreditCard, companyOnly: true },
  { label: "Settings", href: "/settings", icon: Settings, companyOnly: true },
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, adminOnly: true },
  { label: "Companies", href: "/admin/companies", icon: Building2, adminOnly: true },
  { label: "Approvals", href: "/admin/approvals", icon: ClipboardCheck, adminOnly: true },
];

export function Sidebar({ session }: { session: SessionUser | null }) {
  const pathname = usePathname();
  const isPlatformLevel = session?.permissions.includes("companies.manage") ?? false;

  const visible = navItems.filter((item) => {
    if (item.adminOnly) return isPlatformLevel;
    if (item.companyOnly) return !isPlatformLevel;
    return true;
  });

  return (
    <aside className="flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Car className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-sidebar-foreground">
            {isPlatformLevel ? "Admin HQ" : (session?.companySlug ?? "FleetMS")}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 text-sm">
        <ul className="space-y-1.5">
          {visible.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href} className="relative">
                {active && (
                  <span className="absolute right-0 top-0 bottom-0 w-0.5 rounded-full bg-sidebar-primary" />
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg bg-sidebar-accent/50 px-3 py-2">
          <p className="text-xs font-medium text-sidebar-foreground truncate">
            {session?.firstName} {session?.lastName}
          </p>
          <p className="text-xs text-sidebar-foreground/60 capitalize truncate">
            {session?.roleName}
          </p>
        </div>
      </div>
    </aside>
  );
}
