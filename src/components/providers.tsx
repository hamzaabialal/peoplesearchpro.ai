"use client";

import { CommandPalette } from "@/features/command-palette/command-palette";
import { CreditsProvider } from "@/features/billing/credits";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <CreditsProvider>
        {children}
        <CommandPalette />
        <Toaster
          theme="light"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              color: "var(--text)",
            },
          }}
        />
      </CreditsProvider>
    </TooltipProvider>
  );
}
