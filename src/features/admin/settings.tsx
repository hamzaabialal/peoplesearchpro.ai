"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Settings = {
  organization: string;
  supportEmail: string;
  logRetentionDays: string;
};
type Errors = Partial<Record<keyof Settings, string>>;

const FIELDS: { key: keyof Settings; label: string; hint?: string }[] = [
  { key: "organization", label: "Organization" },
  { key: "supportEmail", label: "Support email" },
  { key: "logRetentionDays", label: "Log retention (days)", hint: "1–3650" },
];

export function AdminSettings() {
  const [form, setForm] = useState<Settings | null>(null);
  const [saved, setSaved] = useState<Settings | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => {
        setForm(d.settings);
        setSaved(d.settings);
      })
      .catch((e) => setLoadError(e.message));
  }, []);

  const dirty = form && saved && JSON.stringify(form) !== JSON.stringify(saved);

  async function save() {
    if (!form) return;
    setSaving(true);
    setErrors({});
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        throw new Error(data.error ?? "Failed to save");
      }
      setForm(data.settings);
      setSaved(data.settings);
      toast.success(
        data.changed?.length ? `Saved (${data.changed.join(", ")})` : "No changes to save",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="max-w-xl">
        <PageHeader title="Admin settings" />
        <p className="mt-8 text-[13px] text-danger">{loadError}</p>
      </div>
    );
  }
  if (!form) {
    return <div className="mt-8 h-48 max-w-xl animate-pulse rounded-[12px] bg-surface" />;
  }

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Admin settings"
        subtitle="Stored in the database and recorded in the audit log on every change."
      />
      <Card className="mt-8 space-y-4 p-5">
        {FIELDS.map(({ key, label, hint }) => (
          <div key={key}>
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              aria-invalid={!!errors[key]}
              className={cn(errors[key] && "border-danger focus:border-danger/60")}
            />
            {errors[key] ? (
              <p className="mt-1 text-[12px] text-danger">{errors[key]}</p>
            ) : hint ? (
              <p className="mt-1 text-[12px] text-faint">{hint}</p>
            ) : null}
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : "Save"}
          </Button>
          {!dirty && !saving ? (
            <span className="text-[12px] text-faint">All changes saved</span>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
