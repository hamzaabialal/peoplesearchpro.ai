"use client";

import { AttributionBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DonutLegend } from "@/components/ui/charts";
import { Menu } from "@/components/ui/menu";
import { Modal } from "@/components/ui/dialog";
import { ConfidenceMeter, ConfidenceRing } from "@/components/ui/status";
import { FactRow, SourceCite, SourceProvider } from "@/components/attribution/source";
import { DISCLAIMER } from "@/lib/data/mock";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils";
import type { IntelligenceReport, SourceType } from "@/types";
import { Download, MoreHorizontal, Printer, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const sections = [
  { id: "overview", n: "01", label: "Overview" },
  { id: "identity", n: "02", label: "Identity" },
  { id: "professional", n: "03", label: "Professional" },
  { id: "social", n: "04", label: "Social Intelligence" },
  { id: "behavior", n: "05", label: "Behavior & Preferences" },
  { id: "interaction", n: "06", label: "Interaction Intelligence" },
  { id: "adverse", n: "07", label: "Adverse Information" },
  { id: "context", n: "08", label: "Social Context" },
  { id: "breach", n: "09", label: "Breach Exposure" },
  { id: "sources", n: "10", label: "Sources & Verification" },
];

const adverseLabels: Record<string, string> = {
  criminal: "Criminal Records",
  regulatory: "Regulatory Actions",
  legal: "Legal Cases",
  sanctions: "Sanctions",
  administrative: "Administrative Penalties",
  media: "Negative Media",
  scandals: "Public Scandals",
};

const contentLabels: Record<string, string> = {
  sensitive: "Sensitive Content",
  alcohol: "Alcohol-related",
  crime: "Crime-related",
  offensive: "Offensive",
  toxic: "Toxic",
};

export function ReportView({
  report,
  sample,
}: {
  report: IntelligenceReport;
  sample?: boolean;
}) {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState("overview");
  const [share, setShare] = useState(false);
  const sources = report.sources;
  const filtered = sources.filter((s) => filter === "all" || s.type === filter);
  const mix = useMemo(() => {
    const colors: Record<SourceType, string> = {
      identity: "#5b7cff",
      professional: "#7b93ff",
      web: "#8b929c",
      social: "#3ddc97",
      breach: "#e8b84a",
      legal: "#e85d5d",
    };
    const counts = sources.reduce<Record<string, number>>((acc, s) => {
      acc[s.type] = (acc[s.type] ?? 0) + 1;
      return acc;
    }, {});
    return (Object.keys(counts) as SourceType[]).map((label) => ({
      label,
      value: counts[label],
      color: colors[label],
    }));
  }, [sources]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis?.target.id) setActive(vis.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <SourceProvider sources={sources}>
      <div className="mx-auto max-w-[1180px]">
        {sample ? (
          <p className="mb-4 rounded-[10px] border border-warning/30 bg-warning-dim px-4 py-2 text-[12px] text-warning">
            Sample dossier · {DISCLAIMER}
          </p>
        ) : null}

        <header className="mb-8 border-b border-border pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-success">
                Report ready
              </p>
              <h1 className="mt-2 text-[28px] font-medium tracking-tight md:text-[34px]">
                {report.person.fullName}
              </h1>
              <p className="mt-1 text-[14px] text-muted">
                Digital Identity & Background Intelligence
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link href={`/app/reports/${report.id}/pdf`}>
                  <Download size={14} /> Download PDF
                </Link>
              </Button>
              <Button variant="secondary" onClick={() => setShare(true)}>
                <Share2 size={14} /> Share
              </Button>
              <Link href={`/app/reports/${report.id}/pdf`}>
                <Button variant="outline">
                  <Printer size={14} /> Export
                </Button>
              </Link>
              <Menu
                trigger={
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal size={16} />
                  </Button>
                }
                items={[
                  { label: "Open PDF preview", href: `/app/reports/${report.id}/pdf` },
                  { label: "Copy report ID", onSelect: () => { navigator.clipboard.writeText(report.id); toast.success("Copied"); } },
                ]}
              />
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-[12px] sm:grid-cols-4">
            <Meta k="Report ID" v={report.id} />
            <Meta k="Generated" v={formatDateTime(report.generatedAt)} />
            <Meta k="Sources checked" v={String(report.sourcesChecked)} />
            <Meta k="Data freshness" v={report.dataFreshness} />
          </dl>
          <div className="mt-4 flex items-center gap-3 text-[12px] text-muted">
            Overall identity confidence
            <ConfidenceMeter value={report.identityConfidence} />
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
          <nav className="no-print mb-8 lg:sticky lg:top-20 lg:mb-0 lg:self-start">
            <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-faint">Dossier</p>
            <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-[12px] ${
                      active === s.id ? "bg-surface-2 text-text" : "text-muted hover:text-text"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-faint">{s.n}</span>
                    {s.label}
                    <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-success lg:inline-block" />
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-16 pb-24">
            <section id="overview" className="scroll-mt-24">
              <SectionKicker n="01" title="Overview" />
              <div className="mt-6 grid gap-6 md:grid-cols-[1fr_180px]">
                <div>
                  <h2 className="font-serif text-[28px] tracking-tight md:text-[34px]">
                    {report.person.fullName}
                  </h2>
                  <p className="mt-1 text-[13px] text-muted">Digital Identity Overview</p>
                  <div className="mt-4 rounded-[12px] border border-border bg-surface p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <AttributionBadge kind="ai" />
                      <span className="text-[11px] text-faint">Narrative synthesis — not a verified affidavit</span>
                    </div>
                    <p className="text-[14px] leading-relaxed text-text/90">{report.summary}</p>
                  </div>
                  <div className="mt-5 rounded-[12px] border border-border bg-surface p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Source mix</p>
                    <div className="mt-3">
                      <DonutLegend slices={mix} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-start">
                  <ConfidenceRing value={report.identityConfidence} label="identity" />
                  <p className="mt-2 text-center text-[11px] text-muted">Identity confidence</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {report.identifiers.map((id) => (
                  <div key={id.value} className="rounded-[10px] border border-border bg-surface px-4 py-3">
                    <p className="text-[13px]">
                      {id.value}
                      <SourceCite sourceIds={id.sourceIds} sources={sources} />
                    </p>
                    <div className="mt-2">
                      <AttributionBadge kind={id.kind} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="identity" className="scroll-mt-24">
              <SectionKicker n="02" title="Identity" />
              <div className="mt-6 flex items-start gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface-2 text-[18px]">
                  {report.person.avatarInitials}
                </div>
                <div>
                  <h3 className="text-[18px]">{report.person.fullName}</h3>
                  <p className="text-[13px] text-muted">{report.person.location}</p>
                  <div className="mt-2">
                    <ConfidenceMeter value={report.identityConfidence} />
                  </div>
                </div>
              </div>
              <Card className="mt-6 px-5">
                <h4 className="pt-5 text-[12px] uppercase tracking-[0.12em] text-faint">
                  Personal information
                </h4>
                <FactRow label="Full name" {...report.personal.fullName} sources={sources} />
                <FactRow label="Known names" {...report.personal.knownNames} sources={sources} />
                <FactRow label="Location" {...report.personal.location} sources={sources} />
                <FactRow label="Email" {...report.personal.email} sources={sources} />
                <FactRow label="Username" {...report.personal.username} sources={sources} />
              </Card>
              <Card className="mt-4 px-5 pb-2">
                <h4 className="pt-5 text-[12px] uppercase tracking-[0.12em] text-faint">Professional</h4>
                <FactRow
                  label="Current employer"
                  value={report.professional[0]?.employer ?? "—"}
                  kind="verified"
                  sourceIds={report.professional[0]?.sourceIds ?? []}
                  sources={sources}
                />
                <FactRow
                  label="Previous employers"
                  value={report.professional.slice(1).map((p) => p.employer).join(" · ")}
                  kind="public"
                  sourceIds={["src_03"]}
                  sources={sources}
                />
                <FactRow
                  label="Job titles"
                  value={report.professional.map((p) => p.role).join(" · ")}
                  kind="public"
                  sourceIds={["src_03"]}
                  sources={sources}
                />
                <FactRow
                  label="Industry"
                  value="Enterprise software / infrastructure"
                  kind="inference"
                  sourceIds={["src_12"]}
                  sources={sources}
                  note="Inferred from titles and public posts."
                />
              </Card>
              <Card className="mt-4 px-5 pb-2">
                <h4 className="pt-5 text-[12px] uppercase tracking-[0.12em] text-faint">Education</h4>
                {report.education.map((e) => (
                  <FactRow
                    key={e.institution}
                    label={e.institution}
                    value={`${e.degree} ${e.field} · ${e.years}`}
                    kind={e.kind}
                    sourceIds={e.sourceIds}
                    sources={sources}
                  />
                ))}
              </Card>
              <Card className="mt-4 px-5 pb-2">
                <h4 className="pt-5 text-[12px] uppercase tracking-[0.12em] text-faint">Social profiles</h4>
                {report.social.filter((s) => s.username !== "—").map((s) => (
                  <FactRow
                    key={s.platform}
                    label={s.platform}
                    value={s.username}
                    kind={s.kind}
                    sourceIds={s.sourceIds}
                    sources={sources}
                  />
                ))}
              </Card>
            </section>

            <section id="professional" className="scroll-mt-24">
              <SectionKicker n="03" title="Professional" />
              <p className="mt-2 text-[13px] text-muted">Vertical career timeline from public and provider records.</p>
              <ol className="relative mt-8 border-l border-border pl-6">
                {report.professional.map((role) => (
                  <li key={role.role + role.start} className="mb-8">
                    <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                    <p className="text-[15px] font-medium">{role.role}</p>
                    <p className="text-[13px] text-text">{role.employer}</p>
                    <p className="mt-1 text-[12px] text-muted">
                      {role.location} · {role.start} – {role.end ?? "Present"}
                      <SourceCite sourceIds={role.sourceIds} sources={sources} />
                    </p>
                    <div className="mt-2">
                      <ConfidenceMeter value={role.confidence} size="sm" />
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section id="social" className="scroll-mt-24">
              <SectionKicker n="04" title="Social Intelligence" />
              <p className="mt-2 max-w-2xl text-[13px] text-muted">
                Extracted from public profiles. This is not a social-media analytics product.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {report.social.map((p) => (
                  <Card key={p.platform} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[13px] font-medium">{p.platform}</p>
                        <p className="font-mono text-[12px] text-muted">{p.username}</p>
                      </div>
                      <AttributionBadge kind={p.kind} />
                    </div>
                    {p.username !== "—" ? (
                      <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px] text-muted">
                        <dt>Followers</dt>
                        <dd className="text-right text-text">{p.followers != null ? formatNumber(p.followers) : "—"}</dd>
                        <dt>Following</dt>
                        <dd className="text-right text-text">{p.following != null ? formatNumber(p.following) : "—"}</dd>
                        <dt>Posts</dt>
                        <dd className="text-right text-text">{p.posts ?? "—"}</dd>
                        <dt>Engagement</dt>
                        <dd className="text-right text-text">{p.engagement ?? "—"}</dd>
                      </dl>
                    ) : (
                      <p className="mt-3 text-[12px] text-faint">No confident public profile located.</p>
                    )}
                    {p.industry ? (
                      <p className="mt-2 text-[12px] text-muted">Industry: {p.industry}</p>
                    ) : null}
                    {p.categories.length ? (
                      <p className="mt-3 text-[11px] text-faint">{p.categories.join(" · ")}</p>
                    ) : null}
                    {p.sourceIds.length ? (
                      <div className="mt-2">
                        <SourceCite sourceIds={p.sourceIds} sources={sources} />
                      </div>
                    ) : null}
                  </Card>
                ))}
              </div>
              <h4 className="mt-10 text-[12px] uppercase tracking-[0.14em] text-faint">Top content</h4>
              <div className="mt-3 space-y-3">
                {report.topContent.map((c) => (
                  <Card key={c.excerpt} className="p-4">
                    <p className="text-[13px]">{c.excerpt}</p>
                    <p className="mt-2 text-[12px] text-muted">
                      {c.platform} · {formatDate(c.date)} · {c.likes} likes · {c.comments} comments
                      {c.views ? ` · ${formatNumber(c.views)} views` : ""} · {c.engagement}
                      <SourceCite sourceIds={c.sourceIds} sources={sources} />
                    </p>
                  </Card>
                ))}
              </div>
              <h4 className="mt-10 text-[12px] uppercase tracking-[0.14em] text-faint">Recent activity</h4>
              <ol className="mt-3 space-y-3">
                {report.recentActivity.map((a) => (
                  <li key={a.date + a.description} className="flex gap-4 text-[13px]">
                    <span className="w-24 shrink-0 text-[12px] text-faint">{formatDate(a.date)}</span>
                    <span>
                      <span className="text-muted">{a.platform} — </span>
                      {a.description}{" "}
                      <AttributionBadge kind={a.kind} />
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section id="behavior" className="scroll-mt-24">
              <SectionKicker n="05" title="Observed Public Behaviors & Preferences" />
              <p className="mt-3 rounded-[10px] border border-accent/25 bg-accent-dim px-4 py-3 text-[12px] text-accent-2">
                AI inferences from publicly available information. Not psychological diagnoses, verified personality traits, or definitive behavioral conclusions.
              </p>
              <div className="mt-6 space-y-4">
                {report.behavior.map((b) => (
                  <Card key={b.insight} className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <AttributionBadge kind="inference" />
                      <ConfidenceMeter value={b.confidence} size="sm" />
                    </div>
                    <p className="mt-3 text-[14px]">{b.insight}</p>
                    <p className="mt-2 text-[13px] text-muted">
                      Evidence: {b.evidence}
                      <SourceCite sourceIds={b.sourceIds} sources={sources} />
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            <section id="interaction" className="scroll-mt-24">
              <SectionKicker n="06" title="Interaction Intelligence" />
              <p className="mt-2 text-[13px] text-muted">
                AI-generated communication guidance based on publicly available information.
              </p>
              <p className="mt-3 text-[12px] text-faint">
                Disclaimer: this is AI-generated guidance and not a verified psychological assessment.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card className="p-5">
                  <h4 className="text-[11px] uppercase tracking-[0.12em] text-faint">Potential discussion areas</h4>
                  <ul className="mt-3 space-y-2 text-[13px]">
                    {report.discussionAreas.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-5">
                  <h4 className="text-[11px] uppercase tracking-[0.12em] text-faint">Topics to approach carefully</h4>
                  <ul className="mt-3 space-y-2 text-[13px]">
                    {report.carefulTopics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-5">
                  <h4 className="text-[11px] uppercase tracking-[0.12em] text-faint">Communication style</h4>
                  <ul className="mt-3 space-y-2 text-[13px]">
                    {report.communicationStyle.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </Card>
              </div>
            </section>

            <section id="adverse" className="scroll-mt-24">
              <SectionKicker n="07" title="Adverse Information" />
              <p className="mt-3 max-w-2xl text-[13px] text-muted">
                Absence of a hit is not a clearance. Language is constrained to what the checked sources returned.
              </p>
              <div className="mt-6 space-y-3">
                {report.adverse.map((a) => (
                  <Card key={a.category} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h4 className="text-[14px] font-medium">{adverseLabels[a.category]}</h4>
                      {!a.matched ? (
                        <span className="rounded-md border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-muted">
                          No matching information found
                        </span>
                      ) : (
                        <span className="rounded-md border border-danger/30 bg-danger-dim px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-danger">
                          Finding
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-[13px]">{a.finding}</p>
                    <p className="mt-2 text-[12px] text-muted">
                      {a.evidence}
                      <SourceCite sourceIds={a.sourceIds} sources={sources} />
                    </p>
                    <p className="mt-3 text-[11px] text-faint">
                      Sources checked: {a.sourcesChecked} · Last checked {formatDateTime(a.lastChecked)}
                      {a.confidence != null ? ` · Confidence ${a.confidence}%` : ""}
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            <section id="context" className="scroll-mt-24">
              <SectionKicker n="08" title="Social Context & Content Review" />
              <p className="mt-2 text-[13px] text-muted">Neutral review of publicly collected content. Not sensationalized.</p>
              <div className="mt-6 space-y-3">
                {report.contentReview.map((c) => (
                  <Card key={c.category} className="p-5">
                    <div className="flex justify-between gap-3">
                      <h4 className="text-[14px]">{contentLabels[c.category]}</h4>
                      <AttributionBadge kind="public" />
                    </div>
                    <p className="mt-2 text-[13px]">{c.finding}</p>
                    <p className="mt-1 text-[12px] text-muted">
                      {c.evidence}
                      <SourceCite sourceIds={c.sourceIds} sources={sources} />
                    </p>
                    {c.confidence != null ? (
                      <div className="mt-2">
                        <ConfidenceMeter value={c.confidence} size="sm" />
                      </div>
                    ) : null}
                  </Card>
                ))}
              </div>
            </section>

            <section id="breach" className="scroll-mt-24">
              <SectionKicker n="09" title="Data Breach Exposure" />
              <p className="mt-3 text-[13px] text-muted">
                Known breaches: {report.breaches.length}. Exposure does not indicate whether the individual caused or participated in the incident.
              </p>
              <div className="mt-6 space-y-3">
                {report.breaches.map((b) => (
                  <Card key={b.name} className="border-border p-5">
                    <p className="text-[14px] font-medium">{b.name}</p>
                    <p className="mt-1 text-[12px] text-faint">{formatDate(b.date)}</p>
                    <p className="mt-3 text-[13px] text-muted">
                      {b.description}
                      <SourceCite sourceIds={b.sourceIds} sources={sources} />
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {b.exposed.map((e) => (
                        <span key={e} className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px]">
                          {e}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section id="sources" className="scroll-mt-24">
              <SectionKicker n="10" title="Sources & Verification" />
              <div className="mt-4 flex flex-wrap gap-2">
                {["all", "identity", "web", "social", "breach", "legal"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-md px-3 py-1 text-[12px] capitalize ${
                      filter === f ? "bg-surface-2 text-text" : "text-muted hover:text-text"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                      <th className="py-2 pr-3">Source</th>
                      <th className="py-2 pr-3">Type</th>
                      <th className="py-2 pr-3">Date collected</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Confidence</th>
                      <th className="py-2">Data used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className="border-b border-border/80">
                        <td className="py-3 pr-3">
                          <span className="font-mono text-faint">
                            {String(s.index).padStart(2, "0")}
                          </span>{" "}
                          {s.name}
                        </td>
                        <td className="py-3 pr-3 capitalize">{s.type}</td>
                        <td className="py-3 pr-3">{formatDate(s.collectedAt)}</td>
                        <td className="py-3 pr-3">{s.status}</td>
                        <td className="py-3 pr-3">
                          <ConfidenceMeter value={s.confidence} size="sm" />
                        </td>
                        <td className="py-3 text-muted">{s.dataUsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Modal
        open={share}
        onOpenChange={setShare}
        title="Share report"
        description="Gated link for this demonstration. Recipients see the same labeled dossier."
        footer={
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                `${typeof window !== "undefined" ? window.location.origin : ""}/app/reports/${report.id}`,
              );
              toast.success("Share link copied");
              setShare(false);
            }}
          >
            Copy link
          </Button>
        }
      >
        <p className="font-mono text-[12px] text-muted">
          /app/reports/{report.id}
        </p>
      </Modal>
    </SourceProvider>
  );
}

function SectionKicker({ n, title }: { n: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[12px] text-accent-2">{n}</p>
      <h2 className="mt-1 font-serif text-[26px] tracking-tight">{title}</h2>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</dt>
      <dd className="mt-1 font-mono text-[12px] text-text">{v}</dd>
    </div>
  );
}
