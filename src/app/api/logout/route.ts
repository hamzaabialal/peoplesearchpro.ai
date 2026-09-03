import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/server";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

// Allows a plain `<a href="/api/logout">` to work as a sign-out link.
export async function GET(request: Request) {
  await clearSession();
  return NextResponse.redirect(new URL("/login", request.url));
}
