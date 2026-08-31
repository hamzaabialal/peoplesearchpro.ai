"use client";

import { AttributionBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceMeter } from "@/components/ui/status";
import { DISCLAIMER } from "@/lib/data/mock";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { IntelligenceReport } from "@/types";
import { toast } from "sonner";

const adverseLabels: Record<string, string> = {
  criminal: "Criminal Records",
  regulatory: "Regulatory Actions",
  legal: "Legal Cases",
  sanctions: "Sanctions",
  administrative: "Administrative Penalties",
  media: "Negative Media",
  scandals: "Public Scandals",
};

export function PdfDocument({ report }: { report: IntelligenceReport }) {
  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted">PDF preview · print to save</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.print()}>Download PDF</Button>
          <Button variant="secondary" onClick={() => window.print()}>
            Print
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Share link copied");
            }}
          >
            Share
          </Button>
        </div>
      </div>
      <article className="mx-auto max-w-[820px] space-y-14 rounded-[4px] border border-border bg-surface p-10 print:max-w-none print:border-0 print:bg-white print:p-0 print:text-black">
        <header>
          <p className="font-mono text-[11px] text-accent-2">
            PeopleSearch Pro · {report.id} · Generated {formatDateTime(report.generatedAt)}
          </p>
          <p className="mt-10 font-mono text-[56px] leading-none text-faint">01</p>
          <h1 className="mt-2 font-serif text-[34px] tracking-tight">{report.person.fullName}</h1>
          <p className="mt-1 text-[14px] text-muted">Digital Identity & Background Intelligence</p>
          <div className="mt-4">
            <ConfidenceMeter value={report.identityConfidence} />
          </div>
          <p className="mt-6 text-[11px] text-faint">{DISCLAIMER}</p>
        </header>

        <section>
          <p className="font-mono text-[48px] leading-none text-faint">01</p>
          <h2 className="mt-2 font-serif text-[22px]">Overview</h2>
          <p className="mt-3 text-[14px] leading-relaxed">{report.summary}</p>
          <p className="mt-3 text-[12px]">
            <AttributionBadge kind="ai" /> Narrative is AI-generated.
          </p>
        </section>

        <section>
          <p className="font-mono text-[48px] leading-none text-faint">02</p>
          <h2 className="mt-2 font-serif text-[22px]">Identity</h2>
          <ul className="mt-4 space-y-2 text-[13px]">
            <li>Name — {report.personal.fullName.value}</li>
            <li>Known names — {report.personal.knownNames.value}</li>
            <li>Location — {report.personal.location.value}</li>
            <li>Email — {report.personal.email.value}</li>
            <li>Username — {report.personal.username.value}</li>
          </ul>
        </section>

        <section>
          <p className="font-mono text-[48px] leading-none text-faint">03</p>
          <h2 className="mt-2 font-serif text-[22px]">Professional</h2>
          <ul className="mt-4 space-y-3 text-[13px]">
            {report.professional.map((p) => (
              <li key={p.role + p.start}>
                {p.role}, {p.employer} · {p.location} · {p.start}–{p.end ?? "Present"}
                {p.sourceIds
                  .map((id) => {
                    const src = report.sources.find((s) => s.id === id);
                    return src ? ` [Source ${String(src.index).padStart(2, "0")}]` : "";
                  })
                  .join("")}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="font-mono text-[48px] leading-none text-faint">04</p>
          <h2 className="mt-2 font-serif text-[22px]">Social intelligence</h2>
          <ul className="mt-4 space-y-2 text-[13px]">
            {report.social
              .filter((s) => s.username !== "—")
              .map((s) => (
                <li key={s.platform}>
                  {s.platform}: {s.username}
                  {s.followers != null ? ` · ${s.followers} followers` : ""}
                </li>
              ))}
          </ul>
        </section>

        <section>
          <p className="font-mono text-[48px] leading-none text-faint">05</p>
          <h2 className="mt-2 font-serif text-[22px]">Behavior & preferences</h2>
          <p className="mt-2 text-[12px] text-muted">AI inferences from publicly available information.</p>
          <ul className="mt-4 space-y-2 text-[13px]">
            {report.behavior.map((b) => (
              <li key={b.insight}>
                {b.insight} ({b.confidence}%)
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="font-mono text-[48px] leading-none text-faint">06</p>
          <h2 className="mt-2 font-serif text-[22px]">Interaction intelligence</h2>
          <p className="mt-2 text-[12px] text-muted">
            AI-generated communication guidance. Not a verified psychological assessment.
          </p>
          <p className="mt-3 text-[13px]">Discussion: {report.discussionAreas.join(" · ")}</p>
          <p className="mt-2 text-[13px]">Approach carefully: {report.carefulTopics.join(" · ")}</p>
          <p className="mt-2 text-[13px]">Style: {report.communicationStyle.join(" · ")}</p>
        </section>

        <section>
          <p className="font-mono text-[48px] leading-none text-faint">07</p>
          <h2 className="mt-2 font-serif text-[22px]">Adverse information</h2>
          <ul className="mt-4 space-y-2 text-[13px] text-muted">
            {report.adverse.map((a) => (
              <li key={a.category}>
                <span className="text-text">{adverseLabels[a.category]}:</span> {a.finding}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="font-mono text-[48px] leading-none text-faint">08</p>
          <h2 className="mt-2 font-serif text-[22px]">Social context</h2>
          <ul className="mt-4 space-y-2 text-[13px]">
            {report.contentReview.map((c) => (
              <li key={c.category}>
                {c.category}: {c.finding}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="font-mono text-[48px] leading-none text-faint">09</p>
          <h2 className="mt-2 font-serif text-[22px]">Breach exposure</h2>
          <p className="mt-2 text-[12px] text-muted">
            Exposure does not indicate the individual caused or participated in the incident.
          </p>
          {report.breaches.map((b) => (
            <p key={b.name} className="mt-3 text-[13px]">
              {b.name} ({formatDate(b.date)}) — {b.exposed.join(", ")}
            </p>
          ))}
        </section>

        <footer className="border-t border-border pt-6">
          <p className="font-mono text-[48px] leading-none text-faint">10</p>
          <p className="mt-2 text-[12px] font-medium">Sources & verification</p>
          <ol className="mt-3 space-y-1 font-mono text-[11px] text-faint">
            {report.sources.map((s) => (
              <li key={s.id}>
                [{String(s.index).padStart(2, "0")}] {s.name} · {s.type} · {s.status} · conf {s.confidence}% ·{" "}
                {s.dataUsed}
              </li>
            ))}
          </ol>
          <p className="mt-8 text-right font-mono text-[11px] text-faint">
            Page 1 · {report.id} · {formatDateTime(report.generatedAt)}
          </p>
        </footer>
      </article>
    </div>
  );
}
