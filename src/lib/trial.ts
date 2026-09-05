/**
 * Product trial rules. Pure logic, no DB/session imports — safe to use from
 * proxy.ts (edge middleware) as well as regular server/client code.
 */

/** Free trial length: 7 days. */
export const TRIAL_MINUTES = 7 * 24 * 60;

const MINUTE_MS = 60000;

/** True once TRIAL_MINUTES have passed since signup and no plan has been chosen. */
export function isTrialExpired(createdAt: Date | string, plan: string | null, now = new Date()): boolean {
  if (plan) return false;
  const start = new Date(createdAt).getTime();
  return (now.getTime() - start) / MINUTE_MS >= TRIAL_MINUTES;
}

/** The exact moment the trial ends (ignores whether a plan was chosen) —
 *  lets the client set a precise timer instead of polling. */
export function trialEndsAt(createdAt: Date | string): Date {
  return new Date(new Date(createdAt).getTime() + TRIAL_MINUTES * MINUTE_MS);
}

/** Minutes left in the trial (0 once expired), regardless of plan. */
export function trialMinutesRemaining(createdAt: Date | string, now = new Date()): number {
  const start = new Date(createdAt).getTime();
  const elapsed = (now.getTime() - start) / MINUTE_MS;
  return Math.max(0, Math.ceil(TRIAL_MINUTES - elapsed));
}

/** Human-readable "time left" label — scales from minutes up to days so the
 *  UI reads correctly whether TRIAL_MINUTES is a short test value or a real
 *  multi-day length. */
export function trialTimeRemainingLabel(createdAt: Date | string, now = new Date()): string {
  const minutes = trialMinutesRemaining(createdAt, now);
  if (minutes <= 0) return "ended";
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}
