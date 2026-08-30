import { MarketingFooter, MarketingHeader } from "@/layouts/marketing";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "How it works" };

const stages = [
  {
    n: "01",
    t: "Collect identity",
    d: "Operators enter name, contact, professional, location, and public profile URLs. Email, location, and profile URLs raise matching quality.",
  },
  {
    n: "02",
    t: "Resolve & enrich",
    d: "Approved identity providers return candidate records. Possible matches stay labeled until corroboration exists.",
  },
  {
    n: "03",
    t: "Public web research",
    d: "An approved search provider ranks public documents: directories, conference pages, alumni mentions.",
  },
  {
    n: "04",
    t: "Social intelligence",
    d: "Public profiles are extracted as intelligence — not as a social analytics dashboard.",
  },
  {
    n: "05",
    t: "Adverse information",
    d: "Legal, sanctions, and media corpora are checked. Hits and non-hits use the same professional language.",
  },
  {
    n: "06",
    t: "Breach exposure",
    d: "Credential corpora such as Have I Been Pwned are queried. Exposure is not participation.",
  },
  {
    n: "07",
    t: "AI analysis",
    d: "Narrative, behavior, and interaction guidance are generated and labeled as inference.",
  },
  {
    n: "08",
    t: "Report generation",
    d: "A dossier with source footnotes, confidence, and export/PDF is produced. One report credit is consumed.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-bg">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Methodology</p>
        <h1 className="mt-3 text-[36px] font-medium tracking-tight">How it works</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          PeopleSearch Pro is a structured pipeline over public and licensed data.
          Processing typically takes two to five minutes. The product does not
          perform covert collection or access private accounts.
        </p>
        <ol className="mt-12 space-y-8">
          {stages.map((s) => (
            <li key={s.n} className="border-l border-border pl-5">
              <p className="font-mono text-[12px] text-accent-2">{s.n}</p>
              <h2 className="mt-1 text-[18px]">{s.t}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </main>
      <MarketingFooter />
    </div>
  );
}
