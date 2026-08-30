"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { plans as seed } from "@/lib/data/mock";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [rows, setRows] = useState(seed.map((p) => ({ ...p, enabled: true })));

  return (
    <div>
      <PageHeader
        title="Plans"
        subtitle="Admin-configurable price, report limit, modules, API access, and AI level."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {rows.map((p, i) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px]">{p.name}</h2>
              <label className="flex items-center gap-2 text-[12px] text-muted">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) =>
                    setRows((r) => r.map((x, j) => (j === i ? { ...x, enabled: e.target.checked } : x)))
                  }
                />
                Enabled
              </label>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Price">
                <Input
                  value={p.price ?? ""}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((x, j) =>
                        j === i ? { ...x, price: e.target.value === "" ? null : Number(e.target.value) } : x,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="Report limit">
                <Input
                  value={String(p.reportsPerMonth)}
                  onChange={(e) =>
                    setRows((r) => r.map((x, j) => (j === i ? { ...x, reportsPerMonth: e.target.value } : x)))
                  }
                />
              </Field>
              <Field label="AI processing level">
                <Input
                  value={p.aiLevel}
                  onChange={(e) =>
                    setRows((r) => r.map((x, j) => (j === i ? { ...x, aiLevel: e.target.value } : x)))
                  }
                />
              </Field>
              <Field label="API access">
                <Input value={p.apiAccess ? "Enabled" : "Disabled"} readOnly />
              </Field>
            </div>
            <p className="mt-3 text-[12px] text-muted">Modules: {p.modules.join(", ")}</p>
            <Button className="mt-4" size="sm" onClick={() => toast.success(`${p.name} saved (demo)`)}>
              Save
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
