export type ApiError = {
  status: number;
  message: string;
};

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function getAuthTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const token = getAuthTokenFromCookie();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: "include" });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
      return { ok: false, error: { status: res.status, message: json?.detail || res.statusText } };
    }
    return { ok: true, data: json as T };
  } catch (e) {
    return { ok: false, error: { status: 0, message: (e as Error).message } };
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T, B = unknown>(path: string, body?: B) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T, B = unknown>(path: string, body?: B) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};


