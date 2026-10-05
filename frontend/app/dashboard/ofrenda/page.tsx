"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { mediaUrl } from "@/lib/event";

type Foto = { id: number; nombre: string; foto_perfil: string; foto_impresion: string | null };

const MARCOS = ["#ff6b00", "#9333ea", "#ff9a3d", "#6b21a8"];

export default function OfrendaPage() {
  const [fotos, setFotos] = useState<Foto[] | null>(null);
  const [error, setError] = useState("");
  const [porHoja, setPorHoja] = useState(6);

  useEffect(() => {
    api.get<Foto[]>("/users/photos/").then((r) => setFotos(r.data)).catch((e) => setError(apiError(e)));
  }, []);

  const cols = porHoja === 4 ? 2 : porHoja === 6 ? 2 : 3;

  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Hoja de ofrenda</h1>
          <p className="text-sm text-white/60">
            {fotos ? `${fotos.length} fotos de invitados` : "Cargando…"} · Imprime en tamaño carta y recorta por la línea.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={porHoja} onChange={(e) => setPorHoja(Number(e.target.value))} className="field !w-auto">
            <option value={4}>4 por hoja (grandes)</option>
            <option value={6}>6 por hoja</option>
            <option value={12}>12 por hoja (chicas)</option>
          </select>
          <button onClick={() => window.print()} className="btn-primary !py-2.5" disabled={!fotos?.length}>
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </div>

      {error && <p className="text-red-300">{error}</p>}
      {fotos && !fotos.length && <p className="text-white/50">Aún nadie ha subido su foto.</p>}

      <div className="grid gap-4 print:gap-[6mm]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {fotos?.map((f, i) => (
          <figure
            key={f.id}
            className="break-inside-avoid rounded-md border-[6px] bg-white p-2 text-center text-night print:rounded-none print:border-[4mm]"
            style={{ borderColor: MARCOS[i % MARCOS.length], breakAfter: (i + 1) % porHoja === 0 ? "page" : "auto" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl(f.foto_impresion ?? f.foto_perfil) ?? ""}
              alt={f.nombre}
              className={`w-full object-cover ${porHoja === 12 ? "aspect-square" : "aspect-[4/5]"}`}
            />
            <figcaption className="mt-2 font-display text-xl leading-tight" style={{ color: "#6b21a8" }}>
              {f.nombre}
            </figcaption>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">Halloween Paradise · 2026</p>
          </figure>
        ))}
      </div>
    </div>
  );
}
