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
  
  // Only set Content-Type to JSON if body is not FormData
  if (!(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthTokenFromCookie();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: "include" });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    
    // Handle 401 Unauthorized first - clear invalid token and redirect to login
    if (!res.ok && res.status === 401) {
      // Clear the invalid token cookie
      if (typeof document !== "undefined") {
        document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
        // Redirect to login page immediately
        window.location.href = "/login";
      }
      // Return error result (redirect will happen, but this ensures proper typing)
      return { ok: false, error: { status: res.status, message: json?.detail || res.statusText } };
    }
    
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
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
  put: <T, B = unknown>(path: string, body?: B) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T, B = unknown>(path: string, body?: B) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};


