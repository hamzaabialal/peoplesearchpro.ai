import type { SessionRole } from "./session";

/** Where a user lands after signing in, by role. */
export function dashboardPath(role: SessionRole | string | null | undefined): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "partner":
      return "/partner";
    default:
      return "/app";
  }
}
