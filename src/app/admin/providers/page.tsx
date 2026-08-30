"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer, Modal } from "@/components/ui/dialog";
import { providers as seed } from "@/lib/data/mock";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [rows, setRows] = useState(seed);
  const [logs, setLogs] = useState<string | null>(null);
  const [cfg, setCfg] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Data sources"
        subtitle="Infrastructure control center. API credentials are never exposed in this UI."
      />
      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {rows.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px]">{p.name}</h2>
                <p className="mt-1 text-[12px] text-muted">Last request {formatDateTime(p.lastRequestAt)}</p>
              </div>
              <Badge
                tone={p.status === "healthy" ? "success" : p.status === "degraded" ? "warning" : "muted"}
              >
                {p.status}
              </Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px] text-muted">
              <dt>Requests today</dt>
              <dd className="text-right text-text">{p.requestsToday}</dd>
              <dt>Error rate</dt>
              <dd className="text-right text-text">{p.errorRate}%</dd>
              <dt>Monthly cost</dt>
              <dd className="text-right text-text">{formatCurrency(p.monthlyCost)}</dd>
              <dt>Daily limit</dt>
              <dd className="text-right text-text">{p.dailyLimit}</dd>
              <dt>Monthly budget</dt>
              <dd className="text-right text-text">{formatCurrency(p.monthlyBudget)}</dd>
            </dl>
            {p.alert ? (
              <p className="mt-3 rounded-md border border-warning/30 bg-warning-dim px-3 py-2 text-[12px] text-warning">
                Usage alert: {p.alert}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => setCfg(p.name)}>
                Configure
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRows((r) =>
                    r.map((x) =>
                      x.id === p.id
                        ? { ...x, status: x.status === "disabled" ? "healthy" : "disabled" }
                        : x,
                    ),
                  );
                  toast.success(p.status === "disabled" ? "Enabled" : "Disabled");
                }}
              >
                {p.status === "disabled" ? "Enable" : "Disable"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setLogs(p.name)}>
                View logs
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={!!cfg}
        onOpenChange={() => setCfg(null)}
        title={`Configure ${cfg ?? ""}`}
        description="Limits and routing only. Secrets are stored in the backend vault."
      >
        <p className="text-[13px] text-muted">
          Daily limit, monthly budget, and failover are editable in production via encrypted
          configuration. This demonstration does not accept or display credentials.
        </p>
      </Modal>
      <Drawer open={!!logs} onOpenChange={() => setLogs(null)} title={`${logs} logs`}>
        <pre className="font-mono text-[11px] leading-relaxed text-muted">
          {`[info] request accepted
[info] 200 enrichment
[warn] timeout budget 0.8
Secrets redacted.`}
        </pre>
      </Drawer>
    </div>
  );
}
