/**
 * Isomorphic JWT permission decoding — no client-only or server-only APIs, so this
 * works from both Server Components (via lib/server-permissions.ts) and client
 * components/hooks (via lib/use-permissions.ts).
 */
function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof atob === "function") return atob(base64);
  return Buffer.from(base64, "base64").toString("utf8");
}

export type SessionUser = {
  id: string;
  email: string;
  companyId: string | null;
  companySlug: string | null;
  firstName: string | null;
  lastName: string | null;
  permissions: string[];
  roleId: string;
  roleName: string;
};

export function decodeSession(token: string | null | undefined): SessionUser | null {
  if (!token) return null;
  try {
    return JSON.parse(base64UrlDecode(token.split(".")[1])) as SessionUser;
  } catch {
    return null;
  }
}

export function decodePermissions(token: string | null | undefined): string[] {
  return decodeSession(token)?.permissions ?? [];
}

export function hasPermission(permissions: string[], key: string): boolean {
  return permissions.includes(key);
}

export function hasAnyPermission(permissions: string[], keys: string[]): boolean {
  return keys.some((key) => permissions.includes(key));
}
