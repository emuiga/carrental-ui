import "server-only";
import { cookies } from "next/headers";
import { ApiError } from "@/lib/fetcher";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Server Component data fetcher. Reads the JWT from the request cookie jar
 * (set by the client on login, per lib/fetcher.ts) and forwards it as a
 * Bearer token to the backend — mirrors the client fetcher's auth behavior
 * so Server Components can fetch the same authenticated endpoints.
 */
export async function serverFetcher<T = unknown>(
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  let fullUrl = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    if (qs) fullUrl = `${fullUrl}?${qs}`;
  }

  const res = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = "Something went wrong";
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {}
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}
