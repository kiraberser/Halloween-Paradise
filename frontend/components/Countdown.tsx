"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    días: Math.floor(ms / 86_400_000),
    horas: Math.floor(ms / 3_600_000) % 24,
    min: Math.floor(ms / 60_000) % 60,
    seg: Math.floor(ms / 1000) % 60,
  };
}

/** `compacto`: los recuadros se reparten el ancho disponible (para tarjetas angostas). */
export function Countdown({ compacto = false }: { compacto?: boolean }) {
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setLeft(diff(EVENT.date));
    const id = setInterval(() => setLeft(diff(EVENT.date)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`flex ${compacto ? "gap-2" : "gap-2 sm:gap-4"}`} aria-label="Cuenta regresiva para la fiesta">
      {Object.entries(left ?? { días: 0, horas: 0, min: 0, seg: 0 }).map(([label, value]) => (
        <div
          key={label}
          className={`rounded-xl border border-white/10 bg-night-2/80 py-2 text-center backdrop-blur ${
            compacto ? "min-w-0 flex-1 px-1" : "min-w-[68px] px-3 sm:min-w-[84px]"
          }`}
        >
          <div className="font-display text-3xl text-pumpkin tabular-nums sm:text-4xl">
            {left ? String(value).padStart(2, "0") : "--"}
          </div>
          <div className={`text-[11px] uppercase text-white/60 ${compacto ? "tracking-wider" : "tracking-[0.2em]"}`}>{label}</div>
        </div>
      ))}
    </div>
  );
}
