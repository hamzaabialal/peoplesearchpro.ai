import { AttributionBadge } from "@/components/ui/badge";
import { sampleReport } from "@/lib/data/mock";

export function HeroDossier() {
  const r = sampleReport;
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-border-strong bg-surface shadow-[var(--shadow)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-success">Report ready</p>
        <p className="font-mono text-[10px] text-faint">{r.id}</p>
      </div>
      <div className="p-5">
        <p className="font-serif text-[26px] tracking-tight">{r.person.fullName}</p>
        <p className="mt-1 text-[12px] text-muted">Digital Identity & Background Intelligence</p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full w-[87%] rounded-full bg-success" />
        </div>
        <p className="mt-1 text-[11px] text-faint">Identity confidence {r.identityConfidence}%</p>
        <p className="mt-4 line-clamp-4 text-[12px] leading-relaxed text-muted">{r.summary}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <AttributionBadge kind="verified" />
          <AttributionBadge kind="ai" />
          <AttributionBadge kind="inference" />
        </div>
        <ol className="mt-5 space-y-1.5 font-mono text-[11px] text-faint">
          {["01 Overview", "02 Identity", "03 Professional", "07 Adverse"].map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
