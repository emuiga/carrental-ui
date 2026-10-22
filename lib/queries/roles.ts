import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";

export interface Role {
  id: string;
  name: string;
  companyId: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
}

export interface Permission {
  key: string;
  category: string;
  label: string;
  description: string;
}

export type PermissionsByCategory = Record<string, Permission[]>;

export function usePermissionsList() {
  return useQuery<PermissionsByCategory>({
    queryKey: ["permissions"],
    queryFn: () => api.get("/api/permissions"),
    staleTime: 10 * 60 * 1000,
  });
}

export function useRoles(companyId?: string) {
  return useQuery<Role[]>({
    queryKey: ["roles", companyId],
    queryFn: () => api.get("/api/roles", companyId ? { companyId } : undefined),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; companyId?: string; permissions: string[] }) =>
      api.post("/api/roles", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUpdateRolePermissions(roleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissions: string[]) => api.put(`/api/roles/${roleId}/permissions`, { permissions }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => api.del(`/api/roles/${roleId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useAssignUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      api.patch(`/api/users/${userId}/role`, { roleId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
