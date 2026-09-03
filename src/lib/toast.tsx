"use client";

import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function showErrorToast(title: string, description: string) {
  toast.error(title, {
    description,
    position: "top-right",
    duration: 5000,
    closeButton: true,
    icon: <AlertCircle size={16} className="text-danger" />,
    style: {
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderLeft: "3px solid var(--danger)",
      borderRadius: "12px",
      boxShadow: "var(--shadow)",
      padding: "14px 16px",
    },
    classNames: {
      title: "text-[13px] font-semibold text-text",
      closeButton: "bg-surface border-border-strong text-faint hover:text-text",
    },
    descriptionClassName: "mt-1 text-[12px] text-muted",
  });
}
