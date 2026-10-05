"use client";

import { useEffect, useState } from "react";
import { Ghost, Skull, Crown } from "lucide-react";
import { api } from "@/lib/api";
import { money } from "@/lib/event";
import { BuyButton } from "./BuyTicket";

type Tipo = { id: number; nombre: string; descripcion: string; precio: string };

const ICONS = [Ghost, Skull, Crown];

export function TicketSection() {
  const [tipos, setTipos] = useState<Tipo[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<Tipo[]>("/ticket-types/").then((r) => setTipos(r.data)).catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 p-8 text-center text-white/70">
        Los precios se publican muy pronto. Escríbenos para apartar tu lugar.
        <div className="mt-4"><BuyButton /></div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {(tipos ?? Array.from({ length: 3 }, () => null)).map((t, i) => {
        const Icon = ICONS[i % ICONS.length];
        const destacado = i === Math.min(1, (tipos?.length ?? 3) - 1);
        return (
          <article
            key={t?.id ?? i}
            className={`relative flex flex-col rounded-2xl border p-6 transition hover:-translate-y-1 ${
              destacado
                ? "glow-witch border-witch-glow/60 bg-gradient-to-b from-witch/40 to-night-2"
                : "border-white/10 bg-night-2"
            }`}
          >
            {destacado && (
              <span className="absolute -top-3 left-6 rounded-full bg-pumpkin px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-night">
                El más pedido
              </span>
            )}
            <Icon className="text-pumpkin" size={30} />
            <h3 className="mt-4 font-display text-3xl">{t?.nombre ?? "· · ·"}</h3>
            <p className="mt-1 min-h-[3rem] text-sm text-white/65">{t?.descripcion}</p>
            <p className="mt-4 text-4xl font-bold">
              {t ? money(t.precio) : <span className="inline-block h-9 w-28 animate-pulse rounded bg-white/10" />}
              <span className="ml-1 text-sm font-normal text-white/50">MXN</span>
            </p>
            <BuyButton tipo={t?.nombre} className={`${destacado ? "btn-primary" : "btn-ghost"} mt-6 w-full`} />
          </article>
        );
      })}
    </div>
  );
}
