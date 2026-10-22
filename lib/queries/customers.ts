import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";

export interface Customer {
  id: string;
  fullName: string;
  idNumber: string;
  customerType: string;
  drivingLicense: string | null;
  licenseExpiry: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  nextOfKinName: string | null;
  nextOfKinPhone: string | null;
  employerDetails: string | null;
  createdAt: string;
  _count?: { bookings: number };
}

export interface CustomerPayload {
  fullName: string;
  idNumber: string;
  customerType?: string;
  drivingLicense?: string;
  licenseExpiry?: string;
  phone?: string;
  email?: string;
  address?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  employerDetails?: string;
}

export function useCustomers(params?: Record<string, string>) {
  return useQuery<Customer[]>({
    queryKey: ["customers", params],
    queryFn: () => api.get("/api/customers", params),
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ["customers", id],
    queryFn: () => api.get(`/api/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CustomerPayload) => api.post("/api/customers", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CustomerPayload>) => api.patch(`/api/customers/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers", id] });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}
