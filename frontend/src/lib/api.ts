export type Part = {
  id: number;
  name: string;
  part_number: string;
  unit_price: number;
  manufacturer: string;
  location: string;
  min_stock: number;
  note: string;
  stock: number;
  created_at: string;
  updated_at: string;
};

export type Movement = {
  id: number;
  part: number;
  part_name?: string;
  part_number?: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string;
  occurred_at: string;
  created_at: string;
};

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown, message: string) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET" && method !== "HEAD") {
    const csrf = getCookie("csrftoken");
    if (csrf) headers["X-CSRFToken"] = csrf;
  }
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    credentials: "same-origin",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (data && (data.detail || JSON.stringify(data))) || `HTTP ${res.status}`;
    throw new ApiError(res.status, data, msg);
  }
  return data as T;
}

export const api = {
  get: <T,>(path: string) => request<T>("GET", path),
  post: <T,>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T,>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  put: <T,>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T,>(path: string) => request<T>("DELETE", path),
};
