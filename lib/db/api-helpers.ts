// Small shared helpers for app/api/** route handlers.
import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Strips Mongo's internal `_id` from a `.lean()` query result so API
 * responses only ever expose the app-level string `id` field. `.toJSON()`
 * on a hydrated document already does this via the schema transform in
 * lib/db/models.ts; this covers the `.lean()` (plain object) case used for
 * list endpoints, where transforms don't run.
 */
export function stripMongoId<T extends { _id?: unknown }>(doc: T): Omit<T, "_id"> {
  const { _id, ...rest } = doc;
  void _id;
  return rest;
}

/**
 * Wraps a route handler body so any unexpected error (bad connection string,
 * Mongo timeout, etc.) is logged with structured metadata — never the raw
 * request body, which may contain user-entered content — and turned into a
 * clean 500 response instead of an unhandled exception / stack trace leak.
 */
export async function withErrorHandling(routeName: string, fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    console.error(JSON.stringify({ event: "api_error", route: routeName, message: err instanceof Error ? err.message : "unknown error" }));
    return jsonError("Internal server error.", 500);
  }
}
