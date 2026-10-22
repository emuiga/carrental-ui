"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/fetcher";
import { decodePermissions, hasPermission } from "@/lib/permissions";

export function usePermissions(): string[] {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    setPermissions(decodePermissions(getToken()));
  }, []);

  return permissions;
}

export function usePermission(key: string): boolean {
  const permissions = usePermissions();
  return hasPermission(permissions, key);
}
