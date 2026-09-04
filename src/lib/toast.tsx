"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
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

export function showSuccessToast(title: string, description: string) {
  toast.success(title, {
    description,
    position: "top-right",
    duration: 5000,
    closeButton: true,
    icon: <CheckCircle2 size={16} className="text-success" />,
    style: {
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderLeft: "3px solid var(--success)",
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
