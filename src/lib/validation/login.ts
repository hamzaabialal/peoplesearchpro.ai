export { validateEmail } from "./signup";

export function validatePassword(value: string) {
  if (!value) return "Please enter your password";
  return null;
}
