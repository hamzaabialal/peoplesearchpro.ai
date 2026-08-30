"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PipelineStatus } from "@/components/ui/status";
import { investigations, pipelineTemplate, sampleReport } from "@/lib/data/mock";
import type { ActivityEvent, PipelineStage } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const seedEvents: ActivityEvent[] = [
  { id: "e1", at: "0:04", message: "Identity provider returned 3 candidate records" },
  { id: "e2", at: "0:18", message: "Potential profile identified on LinkedIn (possible match)" },
  { id: "e3", at: "0:41", message: "Public web search completed — 28 documents ranked" },
  { id: "e4", at: "1:12", message: "Social graph collection finished for 2 platforms" },
  { id: "e5", at: "1:28", message: "Breach corpus queried for 1 email identifier" },
  { id: "e6", at: "1:44", message: "Legal and sanctions screens returned no matching records" },
  { id: "e7", at: "2:05", message: "AI analysis layer composing dossier narrative" },
  { id: "e8", at: "2:18", message: "Report generation complete" },
];

export function InvestigationPipeline({ id }: { id: string }) {
  const existing = investigations.find((i) => i.id === id);
  const alreadyDone = existing?.status === "completed";
  const failed = existing?.status === "failed";
  const router = useRouter();

  const [stages, setStages] = useState<PipelineStage[]>(() =>
    alreadyDone
      ? pipelineTemplate.map((s) => ({ ...s, status: "complete", progress: 100, sourceCount: 2, processingMs: 8000 }))
      : pipelineTemplate.map((s) => ({ ...s })),
  );
  const [elapsed, setElapsed] = useState(alreadyDone ? existing?.elapsedSeconds ?? 120 : 0);
  const [events, setEvents] = useState<ActivityEvent[]>(alreadyDone ? seedEvents : []);
  const [done, setDone] = useState(alreadyDone);

  useEffect(() => {
    if (alreadyDone || failed) return;
    let t = 0;
    const timer = setInterval(() => {
      t += 1;
      setElapsed(t);
      setStages((prev) => {
        const next = prev.map((s) => ({ ...s }));
        const idx = Math.min(Math.floor(t / 4), next.length - 1);
        next.forEach((s, i) => {
          if (i < idx) {
            s.status = "complete";
            s.progress = 100;
            s.sourceCount = s.sourceCount || 1 + (i % 3);
            s.processingMs = 3500 + i * 400;
          } else if (i === idx) {
            s.status = "processing";
            s.progress = Math.min(100, ((t % 4) + 1) * 25);
            s.sourceCount = Math.max(s.sourceCount, 1);
          }
        });
        return next;
      });
      if (t === 4) setEvents((e) => [...e, seedEvents[0]]);
      if (t === 8) setEvents((e) => [...e, seedEvents[1]]);
      if (t === 12) setEvents((e) => [...e, seedEvents[2]]);
      if (t === 16) setEvents((e) => [...e, seedEvents[3]]);
      if (t === 20) setEvents((e) => [...e, seedEvents[4]]);
      if (t === 24) setEvents((e) => [...e, seedEvents[5]]);
      if (t === 28) setEvents((e) => [...e, seedEvents[6]]);
      if (t === 32) {
        setEvents((e) => [...e, seedEvents[7]]);
        setStages((prev) => prev.map((s) => ({ ...s, status: "complete", progress: 100 })));
        setDone(true);
        clearInterval(timer);
      }
    }, 450);
    return () => clearInterval(timer);
  }, [alreadyDone, failed]);

  const person = existing?.person.fullName ?? "New subject";
  const sources = stages.reduce((a, s) => a + s.sourceCount, 0);
  const records = useMemo(() => Math.min(148, elapsed * 4), [elapsed]);

  if (failed) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-[24px] font-medium">{person}</h1>
        <p className="mt-4 rounded-[12px] border border-danger/30 bg-danger-dim p-5 text-[13px]">
          Identity resolution returned no usable candidates for the identifiers provided. Provider affected: Search Provider.
        </p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => router.push("/app/investigations/new")}>Retry with more identifiers</Button>
          <Button variant="secondary" asChild>
            <Link href="/app/help">Support</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Investigation {id}</p>
          <h1 className="mt-1 text-[26px] font-medium tracking-tight">{person}</h1>
        </div>
        {done ? (
          <Button asChild>
            <Link href={`/app/reports/${existing?.reportId ?? sampleReport.id}`}>Open report</Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Elapsed" value={`${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`} />
        <Stat label="Sources discovered" value={String(sources)} />
        <Stat label="Records processed" value={String(records)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-3">
          {stages.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium">{s.name}</p>
                <PipelineStatus status={s.status} />
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-faint">
                Sources {s.sourceCount} · {s.processingMs ? `${(s.processingMs / 1000).toFixed(1)}s` : "—"}
              </p>
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-faint">Live activity</p>
          <ol className="mt-4 space-y-3">
            {events.length === 0 ? (
              <li className="text-[12px] text-muted">Awaiting provider responses…</li>
            ) : (
              events.map((e) => (
                <li key={e.id} className="flex gap-3 text-[12px]">
                  <span className="font-mono text-faint">{e.at}</span>
                  <span>{e.message}</span>
                </li>
              ))
            )}
          </ol>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{label}</p>
      <p className="mt-1 font-mono text-[20px]">{value}</p>
    </Card>
  );
}
