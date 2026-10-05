"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart,
} from "recharts";
import { money } from "@/lib/event";

export const PALETTE = ["#ff6b00", "#9333ea", "#fafafa", "#ff9a3d", "#6b21a8", "#c084fc"];

const axis = { stroke: "rgba(255,255,255,.45)", fontSize: 12, tickLine: false, axisLine: false };
const grid = <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />;
const tooltipStyle = {
  contentStyle: { background: "#15121c", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, color: "#fafafa" },
  labelStyle: { color: "#fafafa" },
  itemStyle: { color: "#fafafa" },
  cursor: { fill: "rgba(255,255,255,.04)" },
};

type Row = Record<string, string | number>;
const num = (rows: Row[], keys: string[]) => rows.map((r) => ({ ...r, ...Object.fromEntries(keys.map((k) => [k, Number(r[k])])) }));

export function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-night-2 p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-white/80">{title}</h3>
      {children}
    </section>
  );
}

export function Empty() {
  return <div className="grid h-full place-items-center text-sm text-white/40">Sin datos todavía</div>;
}

export function TimelineChart({ data }: { data: Row[] }) {
  if (!data.length) return <div className="h-72"><Empty /></div>;
  const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  return (
    <div className="h-72">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ left: -16, right: 8 }}>
          {grid}
          <XAxis dataKey="fecha" tickFormatter={fmt} {...axis} />
          <YAxis yAxisId="d" {...axis} allowDecimals={false} />
          <YAxis yAxisId="a" orientation="right" {...axis} allowDecimals={false} />
          <Tooltip {...tooltipStyle} labelFormatter={(l) => fmt(String(l))} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="d" dataKey="boletos" name="Boletos/día" fill={PALETTE[0]} radius={[4, 4, 0, 0]} />
          <Bar yAxisId="d" dataKey="registros" name="Registros/día" fill={PALETTE[1]} radius={[4, 4, 0, 0]} />
          <Line yAxisId="a" dataKey="boletos_acumulados" name="Boletos acumulados" stroke={PALETTE[3]} strokeWidth={2} dot={false} />
          <Line yAxisId="a" dataKey="registros_acumulados" name="Registros acumulados" stroke={PALETTE[5]} strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IncomeChart({ data }: { data: Row[] }) {
  if (!data.length) return <div className="h-56"><Empty /></div>;
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <AreaChart data={num(data, ["ingresos"])} margin={{ left: 0, right: 8 }}>
          <defs>
            <linearGradient id="ing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE[0]} stopOpacity={0.6} />
              <stop offset="100%" stopColor={PALETTE[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          {grid}
          <XAxis dataKey="fecha" {...axis} tickFormatter={(d) => String(d).slice(5)} />
          <YAxis {...axis} tickFormatter={(v) => `$${Number(v) / 1000}k`} />
          <Tooltip {...tooltipStyle} formatter={(v) => money(Number(v))} />
          <Area dataKey="ingresos" name="Ingresos" stroke={PALETTE[0]} fill="url(#ing)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data, nameKey, valueKey }: { data: Row[]; nameKey: string; valueKey: string }) {
  const rows = num(data, [valueKey]);
  if (!rows.length) return <div className="h-60"><Empty /></div>;
  return (
    <div className="h-60">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={rows} dataKey={valueKey} nameKey={nameKey} innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="#15121c" strokeWidth={2}>
            {rows.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HBarChart({
  data, nameKey, bars, currency = false, height = 240,
}: {
  data: Row[]; nameKey: string; bars: { key: string; name: string; color?: string }[]; currency?: boolean; height?: number;
}) {
  const rows = num(data, bars.map((b) => b.key));
  if (!rows.length) return <div style={{ height }}><Empty /></div>;
  const fmt = (v: number) => (currency ? money(v) : String(v));
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid stroke="rgba(255,255,255,.07)" horizontal={false} />
          <XAxis type="number" {...axis} tickFormatter={(v) => (currency ? `$${Number(v) / 1000}k` : String(v))} allowDecimals={false} />
          <YAxis type="category" dataKey={nameKey} {...axis} width={110} />
          <Tooltip {...tooltipStyle} formatter={(v) => fmt(Number(v))} />
          {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {bars.map((b, i) => (
            <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color ?? PALETTE[i]} radius={[0, 4, 4, 0]} stackId={bars.length > 1 ? "s" : undefined} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VBarChart({ data, nameKey, valueKey, name }: { data: Row[]; nameKey: string; valueKey: string; name: string }) {
  const rows = num(data, [valueKey]);
  if (!rows.length) return <div className="h-60"><Empty /></div>;
  return (
    <div className="h-60">
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ left: -16, right: 8 }}>
          {grid}
          <XAxis dataKey={nameKey} {...axis} />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey={valueKey} name={name} fill={PALETTE[1]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
