"use client";

import { useEffect, useRef, useState } from "react";
import { m, useInView, useReducedMotion } from "motion/react";
import { DURACION, EASE_REBOTE } from "./movimiento";

const RADIO_ALERTA = 220; // px: distancia del cursor a la que el gato "se despierta"

/**
 * Gato negro sentado sobre el borde de una sección.
 * Ambiente: cola que se mece y parpadeo. Susto suave: al acercarse el cursor (o, en celular,
 * al entrar en pantalla) abre los ojos brillantes, eriza las orejas y sigue al cursor con la mirada.
 */
export function GatoNegro({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducido = useReducedMotion();
  const enPantalla = useInView(ref, { amount: 0.8 });
  const [alerta, setAlerta] = useState(false);
  const [mirada, setMirada] = useState({ x: 0, y: 0 });

  // Escritorio: proximidad del cursor (con requestAnimationFrame para no recalcular de más).
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 3);
        const dist = Math.hypot(dx, dy);
        setAlerta(dist < RADIO_ALERTA);
        setMirada({ x: Math.max(-1, Math.min(1, dx / 160)) * 1.6, y: Math.max(-1, Math.min(1, dy / 160)) * 1.2 });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // Celular: se despierta un momento cada vez que aparece en pantalla.
  useEffect(() => {
    if (window.matchMedia("(hover: hover)").matches || !enPantalla) return;
    setAlerta(true);
    const id = setTimeout(() => setAlerta(false), 1800);
    return () => clearTimeout(id);
  }, [enPantalla]);

  const transicion = { duration: reducido ? 0 : DURACION.normal, ease: EASE_REBOTE };

  return (
    <div ref={ref} className={`pointer-events-none select-none ${className}`} aria-hidden>
      <svg viewBox="0 0 100 110" className="w-full overflow-visible drop-shadow-[0_0_10px_rgba(147,51,234,.55)]">
        {/* Cola: se mece en CSS; al alertarse se eriza (sube) */}
        {/* Motion (erizarse) y CSS (mecerse) en elementos distintos: si comparten transform, CSS gana. */}
        <m.g style={{ transformOrigin: "70px 98px" }} animate={alerta ? { scaleY: 1.12, y: -4 } : { scaleY: 1, y: 0 }} transition={transicion}>
          <path
            className="gato-cola"
            d="M70 98 C92 96 96 76 88 62 C84 55 90 48 95 52"
            fill="none"
            stroke="#1a1426"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </m.g>
        {/* Cuerpo sentado */}
        <path d="M30 104 C22 80 30 58 50 56 C70 58 78 80 70 104 Z" fill="#1a1426" stroke="#6b21a8" strokeWidth="1.5" />
        {/* Orejas: se paran al alertarse */}
        <m.g
          style={{ transformOrigin: "50px 40px" }}
          animate={alerta ? { scaleY: 1.15, y: -2 } : { scaleY: 1, y: 0 }}
          transition={transicion}
        >
          <path d="M32 34 L30 12 L46 26 Z M68 34 L70 12 L54 26 Z" fill="#1a1426" stroke="#6b21a8" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M33 29 L32 18 L41 25 Z M67 29 L68 18 L59 25 Z" fill="#9333ea" opacity="0.5" />
        </m.g>
        {/* Cabeza */}
        <ellipse cx="50" cy="42" rx="22" ry="19" fill="#1a1426" stroke="#6b21a8" strokeWidth="1.5" />
        {/* Ojos: parpadean en CSS; al alertarse se abren más y brillan */}
        <g className={alerta ? "" : "gato-parpadeo"} style={{ transformOrigin: "50px 41px" }}>
          <m.g
            animate={alerta ? { scaleY: 1.25 } : { scaleY: 0.75 }}
            style={{ transformOrigin: "50px 41px" }}
            transition={transicion}
          >
            <ellipse cx="41" cy="41" rx="5" ry="5.5" fill="#ff9a3d" className={alerta ? "gato-ojo-brilla" : ""} />
            <ellipse cx="59" cy="41" rx="5" ry="5.5" fill="#ff9a3d" className={alerta ? "gato-ojo-brilla" : ""} />
            {/* Pupilas: rendija cuando está tranquilo, redondas y siguiendo al cursor en alerta */}
            <m.g animate={{ x: alerta ? mirada.x : 0, y: alerta ? mirada.y : 0 }} transition={{ duration: DURACION.rapida }}>
              <m.ellipse cx="41" cy="41" ry="4.2" fill="#0b0b0f" animate={{ rx: alerta ? 2.6 : 1 }} transition={transicion} />
              <m.ellipse cx="59" cy="41" ry="4.2" fill="#0b0b0f" animate={{ rx: alerta ? 2.6 : 1 }} transition={transicion} />
            </m.g>
          </m.g>
        </g>
        {/* Nariz y bigotes */}
        <path d="M48 48 L52 48 L50 50.5 Z" fill="#ff6b00" />
        <path d="M44 50 L30 47 M44 52 L31 54 M56 50 L70 47 M56 52 L69 54" stroke="#6b21a8" strokeWidth="0.9" strokeLinecap="round" />
      </svg>
    </div>
  );
}
