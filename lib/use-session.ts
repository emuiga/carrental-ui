"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/fetcher";

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  companyId: string | null;
  companySlug: string | null;
  firstName: string | null;
  lastName: string | null;
};

function decodeJwtPayload(token: string): SessionUser | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Reads the JWT stored client-side and exposes it session-shaped, mirroring the old next-auth `useSession()` call sites. */
export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const token = getToken();
    setUser(token ? decodeJwtPayload(token) : null);
  }, []);

  return { data: user ? { user } : null };
}
