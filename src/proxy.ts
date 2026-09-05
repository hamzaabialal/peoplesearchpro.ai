import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { isTrialExpired } from "@/lib/trial";

/** Route groups that require a signed-in session. */
const PROTECTED = ["/app", "/admin"];

/**
 * Reachable under /app even with an expired trial and no plan chosen.
 * /app/user (the affiliate/referral dashboard) is its own thing — earning or
 * checking referral commissions shouldn't be blocked by the product trial.
 */
const TRIAL_EXEMPT = ["/app/billing", "/app/settings", "/app/user"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Only admins get the admin area.
  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // Trial (see src/lib/trial.ts for the length): once it's expired with no
  // plan chosen, /app is locked to billing (to pick a plan), settings, and
  // the affiliate dashboard — every other /app page bounces to billing.
  // Admins are exempt (they're operators, not product trial users).
  if (session && session.role !== "admin" && pathname.startsWith("/app")) {
    const isExempt = TRIAL_EXEMPT.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (!isExempt) {
      const rows = await sql`SELECT plan, created_at FROM signups WHERE id = ${session.sub} LIMIT 1`;
      const row = rows[0] as { plan: string | null; created_at: string } | undefined;
      if (row && isTrialExpired(row.created_at, row.plan)) {
        const url = new URL("/app/billing", request.url);
        url.searchParams.set("reason", "trial_expired");
        return NextResponse.redirect(url);
      }
    }
  }

  // /login and /signup are always reachable, signed in or not — clicking
  // "Sign up" / "Start Investigation" should always open the form itself,
  // never silently skip to a dashboard.
  return NextResponse.next();
}

export const config = {
  // Guard pages only — skip API routes, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};
