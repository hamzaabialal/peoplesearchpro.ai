export const ROLE_OPTIONS = ["customer", "partner"] as const;
export type SignupRole = (typeof ROLE_OPTIONS)[number];

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/;

export function validateName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your full name";
  if (trimmed.length < 2 || !NAME_REGEX.test(trimmed)) return "Please enter a valid name";
  return null;
}

export function validateEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your email address";
  if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address";
  return null;
}

export function passwordChecks(value: string) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: SPECIAL_CHAR_REGEX.test(value),
  };
}

export function validatePassword(value: string) {
  if (!value) return "Please enter a password";
  const checks = passwordChecks(value);
  const missing: string[] = [];
  if (!checks.length) missing.push("at least 8 characters");
  if (!checks.upper) missing.push("1 uppercase letter");
  if (!checks.lower) missing.push("1 lowercase letter");
  if (!checks.number) missing.push("1 number");
  if (!checks.special) missing.push("1 special character");
  if (missing.length) return `Missing: ${missing.join(", ")}`;
  return null;
}

export function passwordStrength(value: string): { label: "Weak" | "Medium" | "Strong"; score: number } {
  if (!value) return { label: "Weak", score: 0 };
  const checks = passwordChecks(value);
  let score = Object.values(checks).filter(Boolean).length;
  if (value.length >= 12) score += 1;
  if (score <= 2) return { label: "Weak", score };
  if (score <= 4) return { label: "Medium", score };
  return { label: "Strong", score };
}

export function validateRole(value: string) {
  if (!value) return "Please select a role to continue";
  if (!ROLE_OPTIONS.includes(value as SignupRole)) return "Please select a valid role";
  return null;
}
