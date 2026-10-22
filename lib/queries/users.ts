import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleRef: { id: string; name: string };
  isActive: boolean;
  createdAt: string;
}

export interface UserPayload {
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  companyId?: string;
}

export function useUsers(companyId?: string) {
  return useQuery<User[]>({
    queryKey: ["users", companyId],
    queryFn: () => api.get("/api/users", companyId ? { companyId } : undefined),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserPayload) => api.post("/api/auth/register", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<UserPayload> & { isActive?: boolean }) =>
      api.patch(`/api/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
