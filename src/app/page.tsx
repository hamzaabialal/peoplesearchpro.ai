import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroDossier } from "@/features/marketing/hero-dossier";
import { MarketingFooter, MarketingHeader } from "@/layouts/marketing";
import { faq, plans, sampleReport } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <MarketingHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="grid-noise pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent-2">
              Digital identity intelligence
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-[36px] leading-[1.12] tracking-tight md:text-[52px]">
              Understand the Digital Identity Behind the Data.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
              AI-powered background intelligence built from publicly available
              information and approved data sources.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">Start Investigation</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/sample-report">View Sample Report</Link>
              </Button>
            </div>
            <p className="mt-6 max-w-lg text-[12px] text-faint">
              Demonstration product. All sample identities are fictional. Not a
              consumer reporting agency. AI inference is labeled separately from
              sourced facts.
            </p>
            </div>
            <div className="hidden lg:block">
              <HeroDossier />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Capabilities</p>
          <h2 className="mt-2 text-[28px] font-medium tracking-tight">Built around the dossier</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                t: "Identity resolution",
                d: "Collect identifiers, match against approved providers, and show confidence without collapsing possible matches into facts.",
              },
              {
                t: "Public research",
                d: "Web, professional, and social sources are attributed inline. Raw URLs stay in the source drawer, not the narrative.",
              },
              {
                t: "Adverse & breach",
                d: "Legal, sanctions, and credential exposure checks use constrained language: no matching information is not a clearance.",
              },
              {
                t: "AI analysis, labeled",
                d: "Summaries, behavior notes, and communication guidance are marked as inference — never as verified personality.",
              },
              {
                t: "Export & share",
                d: "View, share, export, and print a PDF that matches the in-product report typography and source footnotes.",
              },
              {
                t: "Credits & partners",
                d: "Subscription report credits, Stripe-ready billing, and a separate affiliate workspace for referrals.",
              },
            ].map((f) => (
              <Card key={f.t} className="p-5">
                <h3 className="text-[15px] font-medium">{f.t}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{f.d}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-bg-elevated">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <p className="text-[11px] uppercase tracking-[0.16em] text-faint">How it works</p>
            <h2 className="mt-2 text-[28px] font-medium tracking-tight">Eight stages, one report</h2>
            <ol className="mt-10 grid gap-3 md:grid-cols-4">
              {[
                "Identity resolution",
                "Person enrichment",
                "Public web research",
                "Social intelligence",
                "Breach exposure",
                "Adverse information",
                "AI analysis",
                "Report generation",
              ].map((s, i) => (
                <li key={s} className="rounded-[12px] border border-border bg-surface p-4">
                  <p className="font-mono text-[11px] text-accent-2">{String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-2 text-[14px]">{s}</p>
                </li>
              ))}
            </ol>
            <Link href="/how-it-works" className="mt-8 inline-block text-[13px] text-accent-2">
              Full methodology →
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Sample dossier</p>
              <h2 className="mt-2 text-[28px] font-medium tracking-tight">
                {sampleReport.person.fullName}
              </h2>
              <p className="mt-1 text-[13px] text-muted">Fictional subject · Identity confidence {sampleReport.identityConfidence}%</p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/sample-report">Open full sample</Link>
            </Button>
          </div>
          <Card className="mt-8 p-6">
            <p className="text-[11px] uppercase tracking-[0.12em] text-accent-2">AI-generated · labeled</p>
            <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-text/90">
              {sampleReport.summary}
            </p>
          </Card>
        </section>

        <section className="border-y border-border bg-bg-elevated">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Security posture</p>
            <h2 className="mt-2 text-[28px] font-medium tracking-tight">Designed for trust, not spectacle</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                "API credentials are never shown in the frontend.",
                "Verified facts, public sources, possible matches, and AI inference are visually distinct.",
                "Breach hits describe exposure, not culpability.",
              ].map((t) => (
                <p key={t} className="rounded-[12px] border border-border bg-surface p-5 text-[13px] leading-relaxed text-muted">
                  {t}
                </p>
              ))}
            </div>
            <Link href="/security" className="mt-8 inline-block text-[13px] text-accent-2">
              Security overview →
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Pricing</p>
          <h2 className="mt-2 text-[28px] font-medium tracking-tight">Report credits, not seats-first theater</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {plans.map((p) => (
              <Card key={p.id} className={`p-5 ${p.featured ? "border-accent/40" : ""}`}>
                {p.featured ? (
                  <p className="text-[10px] uppercase tracking-[0.14em] text-accent-2">Most used</p>
                ) : null}
                <h3 className="mt-1 text-[16px]">{p.name}</h3>
                <p className="mt-2 text-[22px] tracking-tight">
                  {p.price != null ? formatCurrency(p.price) : "Custom"}
                </p>
                <p className="mt-1 text-[12px] text-muted">{p.reportsPerMonth} reports / month</p>
                <ul className="mt-4 space-y-1.5 text-[12px] text-muted">
                  {p.modules.slice(0, 4).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          <Link href="/pricing" className="mt-8 inline-block text-[13px] text-accent-2">
            Compare plans →
          </Link>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-20">
            <h2 className="text-[28px] font-medium tracking-tight">Questions</h2>
            <dl className="mt-8 space-y-6">
              {faq.map((item) => (
                <div key={item.q}>
                  <dt className="text-[14px] font-medium">{item.q}</dt>
                  <dd className="mt-2 text-[13px] leading-relaxed text-muted">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
