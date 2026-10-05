"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { GENEROS, money } from "@/lib/event";
import { Pager } from "@/components/dashboard/Pager";

type Tipo = { id: number; nombre: string; precio: string; activo: boolean };
type Venta = {
  id: number; folio: string; nombre: string; tipo: number; tipo_nombre: string; precio: string; cantidad: number; total: string;
  genero: string; genero_display: string; canal: string; estado: string; fecha_venta: string; notas: string;
};
type Page = { count: number; next: string | null; previous: string | null; results: Venta[] };

const CANALES = [["messenger", "Messenger"], ["instagram", "Instagram"], ["taquilla", "Taquilla"]];
const ESTADOS = [["pagado", "Pagado"], ["pendiente", "Pendiente"], ["cancelado", "Cancelado"]];
const ESTADO_COLOR: Record<string, string> = {
  pagado: "bg-green-500/15 text-green-300",
  pendiente: "bg-pumpkin/15 text-pumpkin-soft",
  cancelado: "bg-white/10 text-white/50",
};

export default function VentasPage() {
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [data, setData] = useState<Page | null>(null);
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [tipoSel, setTipoSel] = useState<number | "">("");
  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState("");

  const load = useCallback(() => {
    api
      .get<Page>("/sales/", { params: { page, estado: estado || undefined, search: q || undefined } })
      .then((r) => setData(r.data))
      .catch((e) => setError(apiError(e)));
  }, [page, estado, q]);

  useEffect(() => {
    // El staff recibe también los tipos desactivados; para registrar ventas solo sirven los activos.
    api.get<Tipo[]>("/ticket-types/").then((r) => setTipos(r.data.filter((t) => t.activo)));
  }, []);
  useEffect(load, [load]);

  const tipo = tipos.find((t) => t.id === tipoSel);
  const precioUnit = precio || tipo?.precio || "0";

  const crear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const body = Object.fromEntries(new FormData(formEl));
    if (!body.precio) delete body.precio;
    setError("");
    try {
      await api.post("/sales/", body);
      formEl.reset();
      setTipoSel("");
      setCantidad(1);
      setPrecio("");
      setPage(1);
      load();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const cambiarEstado = async (v: Venta, nuevo: string) => {
    await api.patch(`/sales/${v.id}/`, { estado: nuevo }).catch((e) => setError(apiError(e)));
    load();
  };

  const borrar = async (v: Venta) => {
    if (!confirm(`¿Eliminar la venta de ${v.nombre}?`)) return;
    await api.delete(`/sales/${v.id}/`).catch((e) => setError(apiError(e)));
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Ventas de boletos</h1>

      <form onSubmit={crear} className="grid gap-3 rounded-2xl border border-white/10 bg-night-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input name="nombre" required placeholder="Nombre del comprador" className="field lg:col-span-2" />
        <select name="tipo" required className="field" value={tipoSel} onChange={(e) => setTipoSel(Number(e.target.value) || "")}>
          <option value="">Tipo de boleto…</option>
          {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre} — {Number(t.precio) === 0 ? "Gratis" : money(t.precio)}</option>)}
        </select>
        <select name="genero" className="field" defaultValue="N">
          {GENEROS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <input name="cantidad" type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} className="field" placeholder="Cantidad" />
        <input name="precio" type="number" min={0} step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} className="field" placeholder={tipo ? `Precio (${tipo.precio})` : "Precio unitario"} />
        <select name="canal" className="field" defaultValue="messenger">
          {CANALES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select name="estado" className="field" defaultValue="pagado">
          {ESTADOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input name="notas" placeholder="Notas (opcional)" className="field sm:col-span-2 lg:col-span-3" />
        <button className="btn-primary !py-2.5">
          <Plus size={18} /> Registrar · {money(Number(precioUnit) * (cantidad || 0))}
        </button>
      </form>

      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Buscar por nombre…" className="field max-w-xs" />
        <select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1); }} className="field max-w-[180px]">
          <option value="">Todos los estados</option>
          {ESTADOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-night-2 text-left text-xs uppercase tracking-wider text-white/50">
            <tr>
              {["Fecha", "Folio", "Nombre", "Tipo", "Cant.", "Precio", "Total", "Género", "Canal", "Estado", ""].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.results.map((v) => (
              <tr key={v.id} className="hover:bg-white/[.02]">
                <td className="px-3 py-2.5 text-white/60">{new Date(v.fecha_venta).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-white/60">{v.folio}</td>
                <td className="px-3 py-2.5 font-medium">{v.nombre}</td>
                <td className="px-3 py-2.5">{v.tipo_nombre}</td>
                <td className="px-3 py-2.5 tabular-nums">{v.cantidad}</td>
                <td className="px-3 py-2.5 tabular-nums">{money(v.precio)}</td>
                <td className="px-3 py-2.5 font-semibold tabular-nums">{money(v.total)}</td>
                <td className="px-3 py-2.5 text-white/70">{v.genero_display}</td>
                <td className="px-3 py-2.5 capitalize text-white/70">{v.canal}</td>
                <td className="px-3 py-2.5">
                  <select
                    value={v.estado}
                    onChange={(e) => cambiarEstado(v, e.target.value)}
                    className={`rounded-full border-0 px-2 py-1 text-xs font-semibold ${ESTADO_COLOR[v.estado]}`}
                  >
                    {ESTADOS.map(([val, l]) => <option key={val} value={val} className="bg-night-2 text-bone">{l}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <button onClick={() => borrar(v)} className="text-white/40 hover:text-red-400" aria-label="Eliminar"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {data && !data.results.length && (
              <tr><td colSpan={11} className="px-3 py-8 text-center text-white/40">No hay ventas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager count={data?.count ?? 0} page={page} hasNext={!!data?.next} hasPrev={!!data?.previous} setPage={setPage} />
    </div>
  );
}
