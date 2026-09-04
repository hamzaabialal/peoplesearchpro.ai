import type { SessionRole } from "./session";

/**
 * Hardcoded super-admin override. This email always resolves to the admin
 * role at login, regardless of what's stored in signups.role — a bootstrap
 * guarantee that survives even if the DB role is ever changed by mistake.
 * Use `resolveRole` (not signups.role directly) anywhere a login decides a
 * user's effective role.
 */
const HARDCODED_ADMIN_EMAIL = "aryaankhan6321@gmail.com";

export function isHardcodedAdmin(email: string | null | undefined): boolean {
  return !!email && email.trim().toLowerCase() === HARDCODED_ADMIN_EMAIL;
}

/**
 * Resolves a user's effective role for a login session: the hardcoded admin
 * override takes priority, then falls back to their stored signup role.
 */
export function resolveRole(user: {
  email: string;
  role: SessionRole | string | null | undefined;
}): SessionRole {
  if (isHardcodedAdmin(user.email)) return "admin";
  return (user.role as SessionRole) ?? "customer";
}

/** Where a user lands after signing in, by role. */
export function dashboardPath(role: SessionRole | string | null | undefined): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "partner":
      return "/user";
    default:
      return "/app";
  }
}
