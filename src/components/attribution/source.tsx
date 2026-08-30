"use client";

import { AttributionBadge } from "@/components/ui/badge";
import { ConfidenceMeter } from "@/components/ui/status";
import { Drawer } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import type { SourceRecord } from "@/types";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const Ctx = createContext<{
  openSource: (s: SourceRecord) => void;
} | null>(null);

export function SourceProvider({
  sources,
  children,
}: {
  sources: SourceRecord[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<SourceRecord | null>(null);
  const map = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);
  const openSource = useCallback(
    (s: SourceRecord) => setActive(s),
    [],
  );
  const openById = useCallback(
    (id: string) => {
      const s = map.get(id);
      if (s) setActive(s);
    },
    [map],
  );

  return (
    <Ctx.Provider value={{ openSource }}>
      <InnerOpenByIdContext.Provider value={openById}>
        {children}
      </InnerOpenByIdContext.Provider>
      <Drawer
        open={!!active}
        onOpenChange={(v) => !v && setActive(null)}
        title="Source record"
      >
        {active ? (
          <div className="space-y-5 text-[13px]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-faint">
                Source {String(active.index).padStart(2, "0")}
              </p>
              <h3 className="mt-1 text-[16px] font-medium">{active.name}</h3>
            </div>
            <Row label="Type" value={active.type} />
            <Row label="Collected" value={formatDateTime(active.collectedAt)} />
            <Row label="Status" value={active.status} />
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-faint">
                Confidence
              </p>
              <div className="mt-2">
                <ConfidenceMeter value={active.confidence} />
              </div>
            </div>
            <Row label="Data used" value={active.dataUsed} />
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-faint">
                Reference
              </p>
              <p className="mt-1 break-all font-mono text-[12px] text-muted">
                {active.reference}
              </p>
              <p className="mt-2 text-[12px] text-faint">
                Raw URLs are kept in this drawer, not inline in the dossier.
              </p>
            </div>
          </div>
        ) : null}
      </Drawer>
    </Ctx.Provider>
  );
}

const InnerOpenByIdContext = createContext<(id: string) => void>(() => {});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-faint">{label}</p>
      <p className="mt-1 capitalize text-text">{value}</p>
    </div>
  );
}

export function SourceCite({
  sourceIds,
  sources,
}: {
  sourceIds: string[];
  sources: SourceRecord[];
}) {
  const openById = useContext(InnerOpenByIdContext);
  const matched = sources.filter((s) => sourceIds.includes(s.id));
  if (!matched.length) return null;
  return (
    <span className="ml-1 inline-flex gap-1">
      {matched.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => openById(s.id)}
          className="rounded-md border border-border bg-surface-2 px-1 py-px font-mono text-[10px] text-muted hover:border-accent/40 hover:text-accent-2"
        >
          Source {String(s.index).padStart(2, "0")}
        </button>
      ))}
    </span>
  );
}

export function FactRow({
  label,
  value,
  kind,
  sourceIds,
  sources,
  note,
}: {
  label: string;
  value: string;
  kind: SourceRecord extends never ? never : import("@/types").AttributionKind;
  sourceIds: string[];
  sources: SourceRecord[];
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <p className="w-44 shrink-0 text-[12px] text-faint">{label}</p>
      <div className="flex-1">
        <p className="text-[13px] text-text">
          {value}
          <SourceCite sourceIds={sourceIds} sources={sources} />
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <AttributionBadge kind={kind} />
          {note ? <span className="text-[12px] text-muted">{note}</span> : null}
        </div>
      </div>
    </div>
  );
}

export function useSources() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("SourceProvider missing");
  return ctx;
}
