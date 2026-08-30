"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/dialog";
import { useCredits } from "@/features/billing/credits";
import { matchQuality } from "@/lib/identity-quality";
import { investigationService } from "@/lib/services";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const steps = [
  { n: "01", title: "Identity" },
  { n: "02", title: "Contact" },
  { n: "03", title: "Professional" },
  { n: "04", title: "Location" },
  { n: "05", title: "Social profiles" },
  { n: "06", title: "Additional context" },
];

const empty = {
  fullName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  username: "",
  company: "",
  title: "",
  linkedin: "",
  city: "",
  state: "",
  country: "",
  instagram: "",
  x: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  other: "",
  notes: "",
};

export function InvestigationWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(empty);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();
  const { requireCredit } = useCredits();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("psp-draft");
      if (raw) setForm({ ...empty, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "fullName") {
        const parts = v.trim().split(/\s+/);
        next.firstName = parts[0] ?? "";
        next.lastName = parts.slice(1).join(" ");
      }
      if (k === "firstName" || k === "lastName") {
        next.fullName = [k === "firstName" ? v : next.firstName, k === "lastName" ? v : next.lastName]
          .filter(Boolean)
          .join(" ");
      }
      return next;
    });
  };

  const quality = useMemo(() => matchQuality(form), [form]);

  const start = () => {
    requireCredit(async () => {
      const { id } = await investigationService.create(form);
      toast.success("Investigation launched");
      router.push(`/app/investigations/${id}`);
    });
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-faint">
          Step {steps[step].n} of 06
        </p>
        <h1 className="mt-2 text-[26px] font-medium tracking-tight">{steps[step].title}</h1>
        <div className="mt-4 flex gap-1">
          {steps.map((s, i) => (
            <button
              key={s.n}
              onClick={() => setStep(i)}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-surface-3"}`}
            />
          ))}
        </div>

        <Card className="mt-8 space-y-4 p-5">
          {step === 0 && (
            <>
              <Field label="Full name">
                <Input value={form.fullName} onChange={set("fullName")} placeholder="Julian Hale" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name">
                  <Input value={form.firstName} onChange={set("firstName")} />
                </Field>
                <Field label="Last name">
                  <Input value={form.lastName} onChange={set("lastName")} />
                </Field>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <Field label="Email">
                <Input value={form.email} onChange={set("email")} placeholder="name@company.example" />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={set("phone")} />
              </Field>
              <Field label="Username">
                <Input value={form.username} onChange={set("username")} />
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <Field label="Company">
                <Input value={form.company} onChange={set("company")} />
              </Field>
              <Field label="Job title">
                <Input value={form.title} onChange={set("title")} />
              </Field>
              <Field label="LinkedIn URL">
                <Input value={form.linkedin} onChange={set("linkedin")} placeholder="https://" />
              </Field>
            </>
          )}
          {step === 3 && (
            <>
              <Field label="City">
                <Input value={form.city} onChange={set("city")} />
              </Field>
              <Field label="State">
                <Input value={form.state} onChange={set("state")} />
              </Field>
              <Field label="Country">
                <Input value={form.country} onChange={set("country")} />
              </Field>
            </>
          )}
          {step === 4 && (
            <>
              {(["instagram", "x", "facebook", "tiktok", "youtube"] as const).map((k) => (
                <Field key={k} label={k === "x" ? "X" : k[0].toUpperCase() + k.slice(1)}>
                  <Input value={form[k]} onChange={set(k)} placeholder="URL or handle" />
                </Field>
              ))}
              <Field label="Other profile URLs">
                <Input value={form.other} onChange={set("other")} />
              </Field>
            </>
          )}
          {step === 5 && (
            <Field label="Optional notes">
              <Textarea
                value={form.notes}
                onChange={set("notes")}
                placeholder="Known aliases, jurisdictions, or context for matching…"
              />
            </Field>
          )}
        </Card>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => router.push("/app")}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await investigationService.saveDraft(form);
              sessionStorage.setItem("psp-draft", JSON.stringify(form));
              toast.success("Draft saved");
            }}
          >
            Save draft
          </Button>
          <div className="ml-auto flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {step < 5 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button onClick={() => setConfirm(true)}>Start investigation</Button>
            )}
          </div>
        </div>
      </div>

      <aside>
        <Card className="p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Investigation quality</p>
          <p
            className={`mt-3 text-[22px] font-medium ${
              quality.level === "HIGH"
                ? "text-success"
                : quality.level === "MEDIUM"
                  ? "text-warning"
                  : "text-muted"
            }`}
          >
            {quality.level}
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-muted">
            Email, location, and profile URLs can improve identity matching. More identifiers reduce possible-match ambiguity.
          </p>
        </Card>
      </aside>

      <Modal
        open={confirm}
        onOpenChange={setConfirm}
        title="Ready to begin investigation?"
        description="One report credit will be reserved when processing starts."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={start}>Start Investigation</Button>
          </>
        }
      >
        <ul className="space-y-2 text-[13px] text-muted">
          <li>Estimated processing: 2–5 minutes</li>
          <li>Sources: Multiple approved providers</li>
          <li>Report credit: 1 credit</li>
        </ul>
      </Modal>
    </div>
  );
}
