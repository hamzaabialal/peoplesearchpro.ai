/**
 * Session token — a signed JWT kept in an httpOnly cookie.
 *
 * This module is Edge-safe (only `jose`, no `next/headers`, no DB) so it can be
 * imported from `src/proxy.ts` as well as from route handlers.
 */
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "psp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionRole = "customer" | "partner" | "admin";

export interface SessionPayload {
  /** signups.id */
  sub: string;
  email: string;
  name: string;
  role: SessionRole;
}

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
      role: (payload.role as SessionRole) ?? "customer",
    };
  } catch {
    return null;
  }
}
