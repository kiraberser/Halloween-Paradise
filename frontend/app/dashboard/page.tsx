"use client";

import { useEffect, useState } from "react";
import { DollarSign, Receipt, TrendingUp, Ticket, Users, Wallet } from "lucide-react";
import { Card, DonutChart, HBarChart, IncomeChart, TimelineChart, VBarChart } from "@/components/dashboard/Charts";
import { api, apiError } from "@/lib/api";
import { EVENT, money } from "@/lib/event";

type Row = Record<string, string | number>;
type KPIs = {
  boletos_vendidos: number; boletos_pendientes: number; ingresaron: number; num_ventas: number; ingresos: string; costos: string;
  gastos: string; utilidad: string; ticket_promedio: string; usuarios_registrados: number; fotos_subidas: number;
  capacidad: number; ocupacion_pct: number;
};
type Data = {
  kpis: KPIs;
  demo: { ventas_por_genero: Row[]; usuarios_por_genero: Row[]; edades: Row[] };
  timeline: Row[];
  sales: { por_tipo: Row[]; por_canal: Row[]; por_estado: Row[]; cupos: Row[] };
  expenses: { por_categoria: Row[]; por_naturaleza: Row[] };
};

export default function DashboardPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/kpis/"),
      api.get("/dashboard/demographics/"),
      api.get("/dashboard/timeline/"),
      api.get("/dashboard/sales-breakdown/"),
      api.get("/dashboard/expenses-breakdown/"),
    ])
      .then(([k, d, t, s, e]) => setData({ kpis: k.data, demo: d.data, timeline: t.data, sales: s.data, expenses: e.data }))
      .catch((err) => setError(apiError(err)));
  }, []);

  const dias = Math.max(0, Math.ceil((EVENT.date.getTime() - Date.now()) / 86_400_000));

  if (error) return <p className="text-red-300">{error}</p>;
  if (!data) return <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-night-2" />)}</div>;

  const { kpis } = data;
  const utilidad = Number(kpis.utilidad);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-4xl text-bone">Resumen</h1>
          <p className="text-sm text-white/60">Faltan <b className="text-pumpkin">{dias} días</b> para el 31 de octubre</p>
        </div>
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-white/60">
            <span>Ocupación</span>
            <span>{kpis.boletos_vendidos} / {kpis.capacidad} · {kpis.ocupacion_pct}%</span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-pumpkin to-witch-glow" style={{ width: `${Math.min(100, kpis.ocupacion_pct)}%` }} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={Ticket} label="Boletos vendidos" value={kpis.boletos_vendidos.toLocaleString("es-MX")} hint={`${kpis.ingresaron} ya entraron · ${kpis.boletos_pendientes} pendientes`} accent />
        <Kpi icon={DollarSign} label="Ingresos" value={money(kpis.ingresos)} hint={`Promedio ${money(kpis.ticket_promedio)}`} />
        <Kpi icon={Wallet} label="Costos" value={money(kpis.costos)} />
        <Kpi icon={Receipt} label="Gastos" value={money(kpis.gastos)} />
        <Kpi icon={TrendingUp} label="Utilidad" value={money(utilidad)} tone={utilidad >= 0 ? "pos" : "neg"} />
        <Kpi icon={Users} label="Usuarios registrados" value={kpis.usuarios_registrados.toLocaleString("es-MX")} hint={`${kpis.fotos_subidas} con foto`} />
      </div>

      <Card title="Registros de usuarios y boletos vendidos en el tiempo">
        <TimelineChart data={data.timeline} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Boletos por género">
          <DonutChart data={data.demo.ventas_por_genero} nameKey="genero" valueKey="boletos" />
        </Card>
        <Card title="Usuarios por género">
          <DonutChart data={data.demo.usuarios_por_genero} nameKey="genero" valueKey="usuarios" />
        </Card>
        <Card title="Usuarios por rango de edad">
          <VBarChart data={data.demo.edades} nameKey="rango" valueKey="usuarios" name="Usuarios" />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Ingresos por día">
          <IncomeChart data={data.timeline} />
        </Card>
        <Card title="Boletos por tipo">
          <HBarChart data={data.sales.por_tipo} nameKey="tipo" bars={[{ key: "boletos", name: "Boletos" }]} height={224} />
        </Card>
        <Card title="Costos y gastos por categoría">
          <HBarChart data={data.expenses.por_categoria} nameKey="categoria" bars={[{ key: "monto", name: "Monto", color: "#9333ea" }]} currency height={300} />
        </Card>
        <div className="grid gap-4">
          <Card title="Fijos vs. variables">
            <HBarChart data={data.expenses.por_naturaleza} nameKey="naturaleza" bars={[{ key: "costos", name: "Costos" }, { key: "gastos", name: "Gastos" }]} currency height={130} />
          </Card>
          <Card title="Boletos por canal de venta">
            <HBarChart data={data.sales.por_canal} nameKey="canal" bars={[{ key: "boletos", name: "Boletos", color: "#ff9a3d" }]} height={130} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon, label, value, hint, accent, tone,
}: {
  icon: React.ElementType; label: string; value: string; hint?: string; accent?: boolean; tone?: "pos" | "neg";
}) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-pumpkin/50 bg-pumpkin/10" : "border-white/10 bg-night-2"}`}>
      <div className="flex items-center gap-2 text-xs text-white/60">
        <Icon size={14} className="text-pumpkin" /> {label}
      </div>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${tone === "neg" ? "text-red-400" : tone === "pos" ? "text-green-400" : "text-bone"}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-white/45">{hint}</p>}
    </div>
  );
}
