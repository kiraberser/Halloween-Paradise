"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassWater, Ticket } from "lucide-react";
import { BuyButton } from "@/components/BuyTicket";
import { TicketCard } from "@/components/TicketModal";
import { api } from "@/lib/api";
import type { User } from "@/lib/auth";
import { money } from "@/lib/event";
import { Tarjeta } from "./Tarjeta";

type Tipo = { id: number; nombre: string; precio: string; genero: string; modalidad: string; activo: boolean };

/** Boleto en grande (listo para enseñar en la puerta) o cómo conseguirlo, con los precios vigentes. */
export function MiBoleto({ user }: { user: User }) {
  const [tipos, setTipos] = useState<Tipo[] | null>(null);
  const tieneBoleto = !!user.boleto;

  useEffect(() => {
    if (tieneBoleto) return;
    // Precios desde la API para no repetirlos a mano en el código.
    api.get<Tipo[]>("/ticket-types/").then((r) => setTipos(r.data.filter((t) => t.activo))).catch(() => setTipos([]));
  }, [tieneBoleto]);

  if (user.boleto) {
    return (
      <section aria-label="Mi boleto" className="mx-auto w-full max-w-sm">
        <TicketCard boleto={user.boleto} persona={user} fondo="bg-night" />
      </section>
    );
  }

  const propios = tipos?.filter((t) => t.genero === user.genero) ?? [];
  const preventa = propios.find((t) => t.modalidad === "preventa");
  const enPuerta = propios.filter((t) => t.modalidad === "puerta");

  return (
    <Tarjeta titulo="Mi boleto" icono={<Ticket size={16} />}>
      <p className="text-base font-semibold text-bone">Aún no tienes boleto.</p>
      {propios.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-white/75">
            Con la preventa pagas {preventa ? money(preventa.precio) : "menos"}. En puerta:{" "}
            {enPuerta.map((t) => `${t.nombre.replace(/^(Mujer|Hombre)\s·\s/, "")} ${money(t.precio)}`).join(" · ")}.
          </p>
          {user.genero === "M" && (
            <p className="mt-2 flex items-start gap-2 text-sm text-white/70">
              <GlassWater size={16} className="mt-0.5 shrink-0 text-witch-glow" />
              Si llegas antes de las 11 PM recibes un drink de bienvenida.
            </p>
          )}
          {preventa && (
            <BuyButton tipo={preventa.nombre} className="btn-primary mt-4 w-full sm:w-auto">
              Comprar preventa · {money(preventa.precio)}
            </BuyButton>
          )}
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-white/75">Cuando el staff lo registre aparecerá aquí con tu código QR.</p>
          <Link href="/#boletos" className="btn-ghost mt-4 !py-2 text-sm">Ver precios</Link>
        </>
      )}
    </Tarjeta>
  );
}
