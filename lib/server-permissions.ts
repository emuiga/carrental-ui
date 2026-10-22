import "server-only";
import { cookies } from "next/headers";
import { decodePermissions, decodeSession, hasPermission, type SessionUser } from "@/lib/permissions";

export async function getServerSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get("session_token")?.value);
}

export async function getServerPermissions(): Promise<string[]> {
  const cookieStore = await cookies();
  return decodePermissions(cookieStore.get("session_token")?.value);
}

export async function hasServerPermission(key: string): Promise<boolean> {
  return hasPermission(await getServerPermissions(), key);
}
