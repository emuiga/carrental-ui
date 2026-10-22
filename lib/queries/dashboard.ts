import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";

export interface DashboardStats {
  revenue: { thisMonth: number; lastMonth: number; change: number };
  bookings: { total: number; pending: number; active: number; completed: number; cancelled: number };
  vehicles: { total: number; available: number; rented: number; maintenance: number };
  customers: { total: number };
}

export interface PlatformDashboardStats {
  companies: { total: number; active: number; trial: number; inactive: number };
  users: { total: number };
  vehicles: { total: number; available: number; rented: number; maintenance: number };
  bookings: { total: number; pending: number; active: number; completed: number; cancelled: number };
  revenue: { total: number };
  byCompany: {
    id: string;
    name: string;
    slug: string;
    subscriptionStatus: string;
    vehicleCount: number;
    bookingCount: number;
    userCount: number;
    revenue: number;
  }[];
}

export function useDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/api/dashboard"),
    // Aggregate stats tolerate brief staleness — see caching guidance in context.md.
    staleTime: 60 * 1000,
  });
}
