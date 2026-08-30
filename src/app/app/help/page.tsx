import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { faq } from "@/lib/data/mock";
import Link from "next/link";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Help" subtitle="How reports, sources, and credits work." />
      <Card className="mt-8 p-6">
        <dl className="space-y-6">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="text-[14px]">{f.q}</dt>
              <dd className="mt-2 text-[13px] text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-[13px] text-muted">
          Support:{" "}
          <a href="mailto:support@peoplesearchpro.ai" className="text-accent-2">
            support@peoplesearchpro.ai
          </a>
          {" · "}
          <Link href="/security" className="text-accent-2">
            Security
          </Link>
        </p>
      </Card>
    </div>
  );
}
