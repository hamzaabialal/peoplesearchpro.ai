export const COMMAND_PALETTE_EVENT = "psp:command";

export function openCommandPalette() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COMMAND_PALETTE_EVENT));
}
