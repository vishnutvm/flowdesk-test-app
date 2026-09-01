"use client";

// Tiny fetch wrapper used by the FlowDesk store's data actions to talk to
// the app/api/** route handlers. Every response is JSON; a non-2xx response
// is expected to carry `{ error: string }`, matching the shape returned by
// lib/db/api-helpers.ts's `jsonError`.
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }

  const body = await parseJson(res);
  if (!res.ok) {
    const message = body && typeof body === "object" && "error" in body ? String((body as { error: unknown }).error) : "Request failed. Please try again.";
    return { ok: false, error: message };
  }
  return { ok: true, data: body as T };
}
