"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Pager } from "@/components/dashboard/Pager";
import { api, apiError } from "@/lib/api";
import { money } from "@/lib/event";

type Mov = {
  id: number; concepto: string; tipo: string; tipo_display: string; naturaleza: string; naturaleza_display: string;
  categoria: string; categoria_display: string; monto: string; fecha: string; proveedor: string; notas: string;
};
type Page = { count: number; next: string | null; previous: string | null; results: Mov[] };

const TIPOS = [["costo", "Costo"], ["gasto", "Gasto"]];
const NATURALEZAS = [["fijo", "Fijo"], ["variable", "Variable"]];
const CATEGORIAS = [
  ["renta", "Renta del lugar"], ["sonido", "Sonido / DJ"], ["iluminacion", "Iluminación"], ["decoracion", "Decoración"],
  ["bebidas", "Bebidas"], ["seguridad", "Seguridad"], ["publicidad", "Publicidad"], ["staff", "Staff"],
  ["permisos", "Permisos"], ["otros", "Otros"],
];

const hoy = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local

export default function GastosPage() {
  const [data, setData] = useState<Page | null>(null);
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState({ tipo: "", naturaleza: "" });
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .get<Page>("/expenses/", { params: { page, tipo: filtro.tipo || undefined, naturaleza: filtro.naturaleza || undefined } })
      .then((r) => setData(r.data))
      .catch((e) => setError(apiError(e)));
  }, [page, filtro]);
  useEffect(load, [load]);

  const crear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError("");
    try {
      await api.post("/expenses/", new FormData(formEl));
      formEl.reset();
      setPage(1);
      load();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const borrar = async (m: Mov) => {
    if (!confirm(`¿Eliminar "${m.concepto}"?`)) return;
    await api.delete(`/expenses/${m.id}/`).catch((e) => setError(apiError(e)));
    load();
  };

  const totalPagina = data?.results.reduce((s, m) => s + Number(m.monto), 0) ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Costos y gastos</h1>

      <form onSubmit={crear} className="grid gap-3 rounded-2xl border border-white/10 bg-night-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input name="concepto" required placeholder="Concepto" className="field lg:col-span-2" />
        <input name="monto" type="number" min={0} step="0.01" required placeholder="Monto" className="field" />
        <input name="fecha" type="date" defaultValue={hoy()} className="field [color-scheme:dark]" />
        <select name="tipo" required className="field" defaultValue="costo">
          {TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="naturaleza" required className="field" defaultValue="fijo">
          {NATURALEZAS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="categoria" className="field" defaultValue="otros">
          {CATEGORIAS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input name="proveedor" placeholder="Proveedor (opcional)" className="field" />
        <input name="comprobante" type="file" accept="image/*,application/pdf" className="field text-sm file:mr-3 file:rounded-full file:border-0 file:bg-witch file:px-3 file:py-1 file:text-bone sm:col-span-2 lg:col-span-3" />
        <button className="btn-primary !py-2.5"><Plus size={18} /> Registrar</button>
      </form>

      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <select value={filtro.tipo} onChange={(e) => { setFiltro({ ...filtro, tipo: e.target.value }); setPage(1); }} className="field max-w-[180px]">
          <option value="">Costos y gastos</option>
          {TIPOS.map(([v, l]) => <option key={v} value={v}>Solo {l.toLowerCase()}s</option>)}
        </select>
        <select value={filtro.naturaleza} onChange={(e) => { setFiltro({ ...filtro, naturaleza: e.target.value }); setPage(1); }} className="field max-w-[180px]">
          <option value="">Fijos y variables</option>
          {NATURALEZAS.map(([v, l]) => <option key={v} value={v}>Solo {l.toLowerCase()}s</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-night-2 text-left text-xs uppercase tracking-wider text-white/50">
            <tr>
              {["Fecha", "Concepto", "Tipo", "Naturaleza", "Categoría", "Proveedor", "Monto", ""].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.results.map((m) => (
              <tr key={m.id} className="hover:bg-white/[.02]">
                <td className="px-3 py-2.5 text-white/60">{m.fecha}</td>
                <td className="px-3 py-2.5 font-medium">{m.concepto}</td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.tipo === "costo" ? "bg-pumpkin/15 text-pumpkin-soft" : "bg-witch/30 text-purple-200"}`}>{m.tipo_display}</span>
                </td>
                <td className="px-3 py-2.5 text-white/70">{m.naturaleza_display}</td>
                <td className="px-3 py-2.5 text-white/70">{m.categoria_display}</td>
                <td className="px-3 py-2.5 text-white/60">{m.proveedor || "—"}</td>
                <td className="px-3 py-2.5 font-semibold tabular-nums">{money(m.monto)}</td>
                <td className="px-3 py-2.5">
                  <button onClick={() => borrar(m)} className="text-white/40 hover:text-red-400" aria-label="Eliminar"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {data && !data.results.length && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-white/40">No hay registros.</td></tr>
            )}
          </tbody>
          {!!data?.results.length && (
            <tfoot className="bg-night-2">
              <tr>
                <td colSpan={6} className="px-3 py-3 text-right text-xs uppercase tracking-wider text-white/50">Total (esta página)</td>
                <td className="px-3 py-3 font-bold tabular-nums text-pumpkin">{money(totalPagina)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <Pager count={data?.count ?? 0} page={page} hasNext={!!data?.next} hasPrev={!!data?.previous} setPage={setPage} />
    </div>
  );
}
