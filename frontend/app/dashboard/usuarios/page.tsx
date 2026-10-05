"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, Eye, Plus, Search, X } from "lucide-react";
import { Pager } from "@/components/dashboard/Pager";
import { TicketModal } from "@/components/TicketModal";
import { api, apiError } from "@/lib/api";
import type { Boleto, User } from "@/lib/auth";
import { mediaUrl, money } from "@/lib/event";

type Page = { count: number; next: string | null; previous: string | null; results: User[] };
type Tipo = { id: number; nombre: string; precio: string; genero: string; activo: boolean };

const FILTROS = [
  ["", "Todos"],
  ["con", "Con boleto"],
  ["pendiente", "Pendientes"],
  ["sin", "Sin boleto"],
] as const;

const ESTADOS = [["pagado", "Pagado"], ["pendiente", "Pendiente"], ["cancelado", "Cancelado"]];

export default function UsuariosPage() {
  const [data, setData] = useState<Page | null>(null);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState("");
  const [q, setQ] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [ver, setVer] = useState<{ boleto: Boleto; user: User } | null>(null);
  const [asignar, setAsignar] = useState<User | null>(null);

  // Espera a que el staff deje de escribir antes de buscar.
  useEffect(() => {
    const id = setTimeout(() => { setBusqueda(q.trim()); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [q]);

  const load = useCallback(() => {
    api
      .get<Page>("/users/", { params: { page, boleto: filtro || undefined, search: busqueda || undefined } })
      .then((r) => setData(r.data))
      .catch((e) => setError(apiError(e)));
  }, [page, filtro, busqueda]);

  useEffect(load, [load]);
  useEffect(() => {
    api.get<Tipo[]>("/ticket-types/").then((r) => setTipos(r.data.filter((t) => t.activo)));
  }, []);

  const cambiarEstado = async (boleto: Boleto, estado: string) => {
    setError("");
    try {
      await api.patch(`/sales/${boleto.id}/`, { estado });
      load();
    } catch (e) {
      setError(apiError(e));
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl">Usuarios</h1>
        <p className="text-sm text-white/60">Personas registradas y su boleto. Busca por nombre, correo, teléfono o folio.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative w-full max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar o escribir folio HP-…" className="field !pl-9" />
        </label>
        <div className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-night-2 p-1">
          {FILTROS.map(([valor, label]) => (
            <button
              key={valor}
              onClick={() => { setFiltro(valor); setPage(1); }}
              className={`rounded-full px-3 py-1.5 text-sm transition ${filtro === valor ? "bg-pumpkin font-semibold text-night" : "text-white/70 hover:text-bone"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-night-2 text-left text-xs uppercase tracking-wider text-white/50">
            <tr>
              {["Usuario", "Teléfono", "Género", "Registro", "¿Tiene boleto?", "Estado", ""].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.results.map((u) => {
              const foto = mediaUrl(u.foto_perfil);
              const b = u.boleto;
              return (
                <tr key={u.id} className="hover:bg-white/[.02]">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      {foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={foto} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-witch text-xs font-bold">{u.first_name?.[0] ?? "?"}</span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.first_name} {u.last_name}</p>
                        <p className="truncate text-xs text-white/50">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-white/70">{u.telefono || "—"}</td>
                  <td className="px-3 py-2.5 text-white/70">{u.genero_display}</td>
                  <td className="px-3 py-2.5 text-white/60">
                    {new Date(u.date_joined).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="px-3 py-2.5">
                    {!b ? (
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/50">Sin boleto</span>
                    ) : b.estado === "pagado" ? (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-semibold text-green-300">
                        <CheckCircle2 size={13} /> Sí · {b.folio}{b.ingreso ? " · entró" : ""}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-pumpkin/15 px-2.5 py-1 text-xs font-semibold text-pumpkin-soft">
                        <Clock3 size={13} /> Pendiente · {b.folio}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {b && (
                      <select
                        value={b.estado}
                        onChange={(e) => cambiarEstado(b, e.target.value)}
                        aria-label={`Estado del boleto de ${u.first_name}`}
                        className="rounded-lg border border-white/15 bg-night-2 px-2 py-1 text-xs"
                      >
                        {ESTADOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {b ? (
                      <button onClick={() => setVer({ boleto: b, user: u })} className="btn-ghost whitespace-nowrap !px-3 !py-1.5 text-xs">
                        <Eye size={14} /> Ver boleto
                      </button>
                    ) : (
                      <button onClick={() => setAsignar(u)} className="btn-primary whitespace-nowrap !px-3 !py-1.5 text-xs">
                        <Plus size={14} /> Asignar boleto
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {data && !data.results.length && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-white/40">No hay usuarios con ese filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager count={data?.count ?? 0} page={page} hasNext={!!data?.next} hasPrev={!!data?.previous} setPage={setPage} />

      {ver && <TicketModal boleto={ver.boleto} persona={ver.user} onClose={() => setVer(null)} />}
      {asignar && (
        <AsignarModal
          user={asignar}
          tipos={tipos}
          onClose={() => setAsignar(null)}
          onDone={() => { setAsignar(null); load(); }}
        />
      )}
    </div>
  );
}

function AsignarModal({ user, tipos, onClose, onDone }: { user: User; tipos: Tipo[]; onClose: () => void; onDone: () => void }) {
  // Primero los tipos que corresponden al género del usuario.
  const propios = tipos.filter((t) => !t.genero || t.genero === user.genero);
  const opciones = propios.length ? propios : tipos;
  const [tipo, setTipo] = useState<number>(opciones[0]?.id ?? 0);
  const [estado, setEstado] = useState("pagado");
  const [canal, setCanal] = useState("taquilla");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api.post("/sales/", {
        nombre: `${user.first_name} ${user.last_name}`.trim() || user.email,
        usuario: user.id,
        tipo,
        estado,
        canal,
        genero: user.genero,
      });
      onDone();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="asignar-title">
      <form onSubmit={guardar} onClick={(e) => e.stopPropagation()} className="glow-witch rise w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-night-2 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="asignar-title" className="font-display text-3xl text-pumpkin">Asignar boleto</h3>
            <p className="text-sm text-white/70">{user.first_name} {user.last_name} · {user.genero_display}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-white/60 hover:text-bone"><X /></button>
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block text-white/80">Tipo de boleto</span>
          <select value={tipo} onChange={(e) => setTipo(Number(e.target.value))} className="field">
            {opciones.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre} — {Number(t.precio) === 0 ? "Gratis" : money(t.precio)}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1.5 block text-white/80">Estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value)} className="field">
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-white/80">Canal</span>
            <select value={canal} onChange={(e) => setCanal(e.target.value)} className="field">
              <option value="taquilla">Taquilla</option>
              <option value="messenger">Messenger</option>
              <option value="instagram">Instagram</option>
            </select>
          </label>
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
        <button className="btn-primary w-full" disabled={sending || !tipo}>{sending ? "Asignando…" : "Asignar boleto"}</button>
      </form>
    </div>
  );
}
