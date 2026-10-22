import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";
import type { Payment } from "@/lib/queries/payments";

export interface Booking {
  id: string;
  status: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  depositPaid: number;
  notes: string | null;
  pickupLocation: string | null;
  returnLocation: string | null;
  startMileage: number | null;
  endMileage: number | null;
  createdAt: string;
  vehicle: { id: string; make: string; model: string; registrationNumber: string };
  customer: { id: string; fullName: string; phone: string };
  payments?: Payment[];
}

export interface BookingPayload {
  vehicleId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  depositPaid?: number;
  notes?: string;
  pickupLocation?: string;
  returnLocation?: string;
  startMileage?: number;
}

export interface BookingUpdatePayload {
  notes?: string;
  pickupLocation?: string;
  returnLocation?: string;
  startMileage?: number;
  endMileage?: number;
  depositPaid?: number;
}

export function useBookings(params?: Record<string, string>) {
  return useQuery<Booking[]>({
    queryKey: ["bookings", params],
    queryFn: () => api.get("/api/bookings", params),
  });
}

export function useBooking(id: string) {
  return useQuery<Booking>({
    queryKey: ["bookings", id],
    queryFn: () => api.get(`/api/bookings/${id}`),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BookingPayload) => api.post("/api/bookings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateBookingStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => api.patch(`/api/bookings/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["bookings", id] });
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateBooking(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BookingUpdatePayload) => api.patch(`/api/bookings/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["bookings", id] });
    },
  });
}
