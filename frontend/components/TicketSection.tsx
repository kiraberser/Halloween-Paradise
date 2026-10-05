"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, Drama, GlassWater, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/event";
import { BuyButton } from "./BuyTicket";

type Tipo = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  genero: "M" | "H" | "";
  modalidad: "gratis" | "preventa" | "puerta";
  activo: boolean;
};

const MODALIDAD: Record<Tipo["modalidad"], { label: string; className: string }> = {
  gratis: { label: "Con registro", className: "bg-green-500/15 text-green-300" },
  preventa: { label: "Preventa", className: "bg-pumpkin/20 text-pumpkin-soft" },
  puerta: { label: "En puerta", className: "bg-white/10 text-white/60" },
};

const GRUPOS = [
  { genero: "M", titulo: "Mujeres", acento: "border-witch-glow/60 from-witch/35" },
  { genero: "H", titulo: "Hombres", acento: "border-pumpkin/50 from-pumpkin/15" },
] as const;

export function TicketSection() {
  const { user } = useAuth();
  const [tipos, setTipos] = useState<Tipo[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // El staff recibe también los tipos inactivos; en la landing solo se muestran los activos.
    api.get<Tipo[]>("/ticket-types/").then((r) => setTipos(r.data.filter((t) => t.activo))).catch(() => setError(true));
  }, []);

  const preventa = tipos?.find((t) => t.modalidad === "preventa");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-pumpkin/40 bg-pumpkin/10 p-4">
        <UserPlus className="shrink-0 text-pumpkin" />
        <p className="flex-1 text-sm text-white/85">
          <b className="text-bone">Todos los asistentes deben registrarse en la página</b>, incluso quienes entran gratis.
          En la entrada te buscamos por tu nombre.
        </p>
        {!user && <Link href="/registro" className="btn-primary !px-5 !py-2 text-sm">Registrarme</Link>}
      </div>

      {error ? (
        <p className="rounded-2xl border border-white/10 p-6 text-center text-white/70">
          No pudimos cargar los precios. Intenta de nuevo en unos minutos.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {GRUPOS.map(({ genero, titulo, acento }) => {
            const filas = tipos?.filter((t) => t.genero === genero) ?? null;
            return (
              <section key={genero} className={`rounded-2xl border bg-gradient-to-b to-night-2 p-5 sm:p-6 ${acento}`}>
                <h3 className="font-display text-4xl">{titulo}</h3>
                <ul className="mt-4 divide-y divide-white/10">
                  {(filas ?? Array.from({ length: 3 }, () => null)).map((t, i) => (
                    <li key={t?.id ?? i} className="flex items-center justify-between gap-4 py-3.5">
                      <div className="min-w-0">
                        <p className="font-semibold">{t?.nombre ?? <span className="inline-block h-4 w-40 animate-pulse rounded bg-white/10" />}</p>
                        {t && (
                          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-white/60">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${MODALIDAD[t.modalidad].className}`}>
                              {MODALIDAD[t.modalidad].label}
                            </span>
                            {t.descripcion}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 text-right text-2xl font-bold tabular-nums sm:text-3xl">
                        {t ? (Number(t.precio) === 0 ? <span className="text-green-300">GRATIS</span> : money(t.precio)) : null}
                      </p>
                    </li>
                  ))}
                </ul>

                {genero === "M" ? (
                  <p className="mt-4 flex items-start gap-2 text-sm text-white/70">
                    <GlassWater size={18} className="mt-0.5 shrink-0 text-witch-glow" />
                    El drink de bienvenida con vaso es para mujeres disfrazadas que lleguen antes de las 11:00 PM.
                  </p>
                ) : (
                  preventa && (
                    <BuyButton tipo={preventa.nombre} className="btn-primary mt-4 w-full">
                      Comprar preventa · {money(preventa.precio)}
                    </BuyButton>
                  )
                )}
              </section>
            );
          })}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <p className="flex items-start gap-3 rounded-2xl border border-white/10 bg-night-2 p-4 text-sm text-white/75">
          <Drama className="mt-0.5 shrink-0 text-pumpkin" />
          <span>
            <b className="text-bone">¿Qué cuenta como disfraz?</b> Disfraz completo o maquillaje de catrina/catrín.
            Unas orejitas o un accesorio no cuentan; el staff de la entrada tiene la última palabra.
          </span>
        </p>
        <p className="flex items-start gap-3 rounded-2xl border border-white/10 bg-night-2 p-4 text-sm text-white/75">
          <Clock className="mt-0.5 shrink-0 text-pumpkin" />
          <span>
            <b className="text-bone">Llega temprano.</b> La hora que cuenta es la de tu llegada a la entrada,
            no la de tu registro.
          </span>
        </p>
      </div>
    </div>
  );
}
