import { MarketingFooter, MarketingHeader } from "@/layouts/marketing";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Security" };

export default function Page() {
  return (
    <div className="min-h-screen bg-bg">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Trust</p>
        <h1 className="mt-3 text-[36px] font-medium tracking-tight">Security</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          PeopleSearch Pro is an intelligence workspace over public and approved
          third-party data. It is not a surveillance appliance and not a consumer
          reporting agency under the FCRA. Operators remain responsible for lawful use.
        </p>
        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-[18px]">Data providers</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Identity enrichment, search, social collection, YouTube, Apify actors, and
              Have I Been Pwned are called from the backend. The frontend never displays
              API keys, tokens, or secrets.
            </p>
          </section>
          <section>
            <h2 className="text-[18px]">Attribution</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Every material fact in a report can be opened to a source record: name,
              type, collection date, confidence, and reference. AI-generated text is
              badged separately from verified and public sources.
            </p>
          </section>
          <section>
            <h2 className="text-[18px]">Adverse language</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              The product will not state that a person has no criminal record. It will
              state that no matching information was found in the sources checked for
              that report.
            </p>
          </section>
          <section>
            <h2 className="text-[18px]">Access control</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Customer, partner, and admin environments are separate. Shared reports use
              gated links. Billing is prepared for Stripe Customer Portal.
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
