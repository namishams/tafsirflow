// mirrors mobile/src/lib/api.ts – same-origin requests from the browser (the session cookie signs them in).
export const SITE = "";

export class ApiError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  const res = await fetch(path, {
    method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    const d = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, d.error ?? `http_${res.status}`);
  }
  return (await res.json()) as T;
}
