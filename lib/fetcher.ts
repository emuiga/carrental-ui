const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )session_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * `remember`: true persists the session for 30 days; false keeps it for the
 * current browser session only (cookie with no max-age, cleared on browser close).
 */
export function setToken(token: string, remember = true) {
  const maxAge = remember ? `; max-age=${30 * 24 * 60 * 60}` : "";
  document.cookie = `session_token=${encodeURIComponent(token)}; path=/${maxAge}`;
}

export function clearToken() {
  document.cookie = "session_token=; path=/; max-age=0";
}

export async function fetcher<T = unknown>(
  url: string,
  options?: RequestInit & { params?: Record<string, string | undefined> }
): Promise<T> {
  const { params, ...rest } = options ?? {};

  // Existing call sites use "/api/<resource>" paths — strip that prefix and
  // route straight to the backend API instead.
  const path = url.startsWith("/api/") ? url.slice(4) : url;
  let fullUrl = `${API_BASE}${path}`;

  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    if (qs) fullUrl = `${fullUrl}?${qs}`;
  }

  const token = getToken();

  const res = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...rest,
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

export const api = {
  get: <T>(url: string, params?: Record<string, string | undefined>) =>
    fetcher<T>(url, { method: "GET", params }),
  post: <T>(url: string, body: unknown) =>
    fetcher<T>(url, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown) =>
    fetcher<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) =>
    fetcher<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(url: string) =>
    fetcher<T>(url, { method: "DELETE" }),
};

/** Multipart upload — skips the JSON Content-Type header so the browser sets its own boundary. */
export async function uploadFile<T = unknown>(url: string, formData: FormData): Promise<T> {
  const path = url.startsWith("/api/") ? url.slice(4) : url;
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    let message = "Upload failed";
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {}
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

/** Downloads a file with the auth header attached, triggering a browser save. */
export async function downloadFile(url: string, fileName: string): Promise<void> {
  const path = url.startsWith("/api/") ? url.slice(4) : url;
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new ApiError("Download failed", res.status);

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
