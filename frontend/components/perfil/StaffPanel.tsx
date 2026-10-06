"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, ScanLine, ShieldCheck, Ticket, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Tarjeta } from "./Tarjeta";

type Resumen = { boletos_vendidos: number; ingresaron: number; usuarios_registrados: number };

const ACCESOS = [
  { href: "/dashboard/escanear", label: "Escanear QR", icon: ScanLine, destacado: true },
  { href: "/dashboard/ventas", label: "Registrar venta", icon: Ticket },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
  { href: "/dashboard", label: "Panel", icon: BarChart3 },
];

/** Accesos rápidos y cifras del evento para el staff (sin datos de dinero). */
export function StaffPanel() {
  const [resumen, setResumen] = useState<Resumen | null>(null);

  useEffect(() => {
    // Si falla, simplemente no se muestran las cifras.
    api.get<Resumen>("/dashboard/kpis/").then((r) => setResumen(r.data)).catch(() => setResumen(null));
  }, []);

  return (
    <Tarjeta titulo="Staff" icono={<ShieldCheck size={16} />} className="border-witch-glow/40 bg-gradient-to-b from-witch/25 to-night-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACCESOS.map(({ href, label, icon: Icon, destacado }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center text-sm font-semibold transition active:scale-[.98] ${
              destacado
                ? "border-pumpkin bg-pumpkin text-night hover:bg-pumpkin-soft"
                : "border-white/15 bg-night/60 text-bone hover:border-pumpkin"
            }`}
          >
            <Icon size={26} />
            {label}
          </Link>
        ))}
      </div>
      {resumen && (
        <dl className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl bg-night/50 py-3 text-center">
          {[
            ["Vendidos", resumen.boletos_vendidos],
            ["Ya entraron", resumen.ingresaron],
            ["Registrados", resumen.usuarios_registrados],
          ].map(([label, valor]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="text-[11px] uppercase tracking-wider text-white/50">{label}</dt>
              <dd className="text-2xl font-bold tabular-nums">{Number(valor).toLocaleString("es-MX")}</dd>
            </div>
          ))}
        </dl>
      )}
    </Tarjeta>
  );
}
