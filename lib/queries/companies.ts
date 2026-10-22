import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, uploadFile } from "@/lib/fetcher";

export interface Company {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  subscriptionStatus: string;
  approvalStatus: "pending_review" | "approved" | "rejected";
  rejectionReason: string | null;
  enabledFeatures: Record<string, boolean>;
  createdAt: string;
  _count?: { users: number; vehicles: number; bookings: number };
}

export interface CompanyPayload {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminEmail?: string;
  adminPassword?: string;
  approveImmediately?: boolean;
}

export interface CompanyDocument {
  id: string;
  companyId: string;
  category: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

// Feature flags and company metadata change rarely — cache longer than the
// 30s global default (see caching guidance in context.md).
const COMPANY_STALE_TIME = 5 * 60 * 1000;

export function useCompanies(approvalStatus?: string) {
  return useQuery<Company[]>({
    queryKey: ["companies", { approvalStatus }],
    queryFn: () => api.get("/api/companies", { approvalStatus }),
    staleTime: COMPANY_STALE_TIME,
  });
}

export function useCompany(id: string) {
  return useQuery<Company>({
    queryKey: ["companies", id],
    queryFn: () => api.get(`/api/companies/${id}`),
    enabled: !!id,
    staleTime: COMPANY_STALE_TIME,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyPayload) => api.post("/api/companies", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

export function useUpdateCompany(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CompanyPayload> & { subscriptionStatus?: string }) =>
      api.patch(`/api/companies/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["companies", id] });
    },
  });
}

export function useUpdateCompanyFeatures(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (features: Record<string, boolean>) =>
      api.put(`/api/companies/${id}/features`, features),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies", id] }),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/companies/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

export function useCompanyDocuments(companyId: string) {
  return useQuery<CompanyDocument[]>({
    queryKey: ["companies", companyId, "documents"],
    queryFn: () => api.get(`/api/companies/${companyId}/documents`),
    enabled: !!companyId,
  });
}

export function useUploadCompanyDocument(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, category }: { file: File; category: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      return uploadFile(`/api/companies/${companyId}/documents`, formData);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies", companyId, "documents"] }),
  });
}

export function useDeleteCompanyDocument(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => api.del(`/api/companies/${companyId}/documents/${docId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies", companyId, "documents"] }),
  });
}

export function useUpdateCompanyApproval(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { status: "approved" } | { status: "rejected"; rejectionReason: string }) =>
      api.patch(`/api/companies/${companyId}/approval`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["companies", companyId] });
    },
  });
}
