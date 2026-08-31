"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border-strong)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--text)",
  boxShadow: "var(--shadow)",
};

export function AreaSeries({
  data,
  x,
  y,
  color = "#5b7cff",
}: {
  data: Record<string, string | number>[];
  x: string;
  y: string;
  color?: string;
}) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${y}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(9,11,15,0.08)" vertical={false} />
          <XAxis dataKey={x} tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey={y} stroke={color} fill={`url(#g-${y})`} strokeWidth={1.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarSeries({
  data,
  x,
  y,
  color = "#5b7cff",
}: {
  data: Record<string, string | number>[];
  x: string;
  y: string;
  color?: string;
}) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(9,11,15,0.08)" vertical={false} />
          <XAxis dataKey={x} tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--text-faint)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey={y} fill={color} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HorizontalBars({
  data,
}: {
  data: { label: string; amount: number }[];
}) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex justify-between text-[12px]">
            <span className="text-muted">{d.label}</span>
            <span className="tabular-nums">{d.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${(d.amount / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const colors = ["#5b7cff", "#3ddc97", "#e8b84a", "#e85d5d", "#7b93ff"];
  return (
    <div className="flex h-16 items-end gap-1">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            background: colors[i % colors.length],
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

export function DonutLegend({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
        {(() => {
          const r = 34;
          const c = 2 * Math.PI * r;
          let offset = 0;
          return slices.map((s) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={s.label}
                cx="48"
                cy="48"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="10"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          });
        })()}
        <circle cx="48" cy="48" r="24" fill="var(--surface)" />
      </svg>
      <ul className="space-y-1.5 text-[12px]">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
            {s.label}
            <span className="tabular-nums text-text">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
