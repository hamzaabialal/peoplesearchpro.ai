import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import { dashboardPath } from "@/lib/auth/roles";

/** Route groups that require a signed-in session. */
const PROTECTED = ["/app", "/admin", "/partner"];
/** Auth pages that a signed-in user should be bounced away from. */
const AUTH_PAGES = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isProtected && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Only admins get the admin area.
  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL(dashboardPath(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Guard pages only — skip API routes, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};
