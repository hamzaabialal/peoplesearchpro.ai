import { NextResponse } from "next/server";

/**
 * NextResponse.json with Cache-Control: no-store.
 *
 * Every session-scoped API response needs this — without it, the browser
 * (or an intermediate cache) can serve one signed-in user's response to a
 * different user who later hits the exact same GET URL from the same
 * browser (e.g. after signing up a second account without signing out
 * first). `dynamic = "force-dynamic"` only opts the route out of Next's own
 * server-side caching; it does not stop the browser from caching the HTTP
 * response itself.
 */
export function jsonNoStore<T>(data: T, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(data, { ...init, headers });
}
