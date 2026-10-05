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

export function Countdown() {
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setLeft(diff(EVENT.date));
    const id = setInterval(() => setLeft(diff(EVENT.date)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex gap-2 sm:gap-4" aria-label="Cuenta regresiva para la fiesta">
      {Object.entries(left ?? { días: 0, horas: 0, min: 0, seg: 0 }).map(([label, value]) => (
        <div
          key={label}
          className="min-w-[68px] rounded-xl border border-white/10 bg-night-2/80 px-3 py-2 text-center backdrop-blur sm:min-w-[84px]"
        >
          <div className="font-display text-3xl text-pumpkin tabular-nums sm:text-4xl">
            {left ? String(value).padStart(2, "0") : "--"}
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">{label}</div>
        </div>
      ))}
    </div>
  );
}
