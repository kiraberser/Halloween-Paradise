"use client";

import Link from "next/link";
import { Sparkles, Ticket } from "lucide-react";
import { BuyButton } from "@/components/BuyTicket";
import { TicketCard } from "@/components/TicketModal";
import type { User } from "@/lib/auth";
import { Tarjeta } from "./Tarjeta";

/** Boleto en grande (listo para enseñar en la puerta) o cómo conseguirlo. */
export function MiBoleto({ user }: { user: User }) {
  if (user.boleto) {
    return (
      <section aria-label="Mi boleto" className="mx-auto w-full max-w-sm">
        <TicketCard boleto={user.boleto} persona={user} fondo="bg-night" />
      </section>
    );
  }

  return (
    <Tarjeta titulo="Mi boleto" icono={<Ticket size={16} />}>
      {user.genero === "M" ? (
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 shrink-0 text-pumpkin" />
          <div className="text-sm text-white/75">
            <p className="text-base font-semibold text-bone">Tu entrada es gratis si vienes disfrazada.</p>
            <p className="mt-1">
              Antes de las 11 PM además recibes un drink de bienvenida. El staff registra tu boleto y aparecerá aquí;
              sin disfraz la entrada es de $80.
            </p>
            <Link href="/#boletos" className="btn-ghost mt-4 !py-2 text-sm">Ver precios</Link>
          </div>
        </div>
      ) : user.genero === "H" ? (
        <div className="text-sm text-white/75">
          <p className="text-base font-semibold text-bone">Aún no tienes boleto.</p>
          <p className="mt-1">Con la preventa pagas $70 vengas o no disfrazado; en puerta son $90 disfrazado o $120 sin disfraz.</p>
          <BuyButton className="btn-primary mt-4 w-full sm:w-auto">Comprar preventa · $70</BuyButton>
        </div>
      ) : (
        <div className="text-sm text-white/75">
          <p className="text-base font-semibold text-bone">Aún no tienes boleto.</p>
          <p className="mt-1">Cuando el staff lo registre aparecerá aquí con tu código QR.</p>
          <Link href="/#boletos" className="btn-ghost mt-4 !py-2 text-sm">Ver precios</Link>
        </div>
      )}
    </Tarjeta>
  );
}
