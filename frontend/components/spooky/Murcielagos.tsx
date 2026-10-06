"use client";

import { useEffect, useState } from "react";
import { m, useReducedMotion } from "motion/react";

/**
 * Murciélagos que cruzan el cielo del hero de vez en cuando.
 * Trayectorias curvas con puntos intermedios (ningún tramo recorre más de 1/3 de pantalla)
 * y duraciones distintas para que nunca vuelen sincronizados.
 */
const VUELOS = [
  { top: "14%", size: 34, dur: 9, delay: 2, pausa: 9, y: [0, -40, 10, -30, -5, -50] },
  { top: "26%", size: 24, dur: 11, delay: 6, pausa: 13, y: [0, 25, -15, 20, -10, 15] },
  { top: "8%", size: 20, dur: 12.5, delay: 12, pausa: 11, y: [0, -20, 15, -25, 10, -10] },
];

export function Murcielagos() {
  const reducido = useReducedMotion();
  // El servidor no conoce la preferencia de movimiento: se dibujan solo tras montar
  // para que el primer HTML coincida (evita errores de hidratación).
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  if (!montado || reducido) return null; // sin bucles automáticos si se pidió menos movimiento

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {VUELOS.map((v, i) => (
        <m.div
          key={i}
          className="absolute left-0"
          style={{ top: v.top, width: v.size }}
          initial={{ x: "-12vw", opacity: 0 }}
          animate={{
            x: ["-12vw", "15vw", "38vw", "62vw", "85vw", "112vw"],
            y: v.y,
            opacity: [0, 1, 1, 1, 1, 0],
          }}
          transition={{
            duration: v.dur,
            delay: v.delay,
            repeat: Infinity,
            repeatDelay: v.pausa,
            ease: "easeInOut",
          }}
        >
          <Murcielago />
        </m.div>
      ))}
    </div>
  );
}

function Murcielago() {
  return (
    <svg viewBox="0 0 60 30" className="w-full drop-shadow-[0_0_6px_rgba(147,51,234,.6)]">
      <g fill="#120c1c" stroke="#6b21a8" strokeWidth="0.8">
        {/* Alas: aletean escalando en Y desde el cuerpo */}
        <path className="ala ala-izq" d="M30 14 C24 4 14 2 2 8 C8 10 10 14 9 18 C14 14 18 16 20 20 C22 16 26 15 30 16Z" />
        <path className="ala ala-der" d="M30 14 C36 4 46 2 58 8 C52 10 50 14 51 18 C46 14 42 16 40 20 C38 16 34 15 30 16Z" />
        <ellipse cx="30" cy="16" rx="4" ry="6" />
        <path d="M27 11 L26.5 7.5 L28.6 10 Z M33 11 L33.5 7.5 L31.4 10 Z" />
      </g>
      <circle cx="28.6" cy="14.5" r="0.9" fill="#ff6b00" />
      <circle cx="31.4" cy="14.5" r="0.9" fill="#ff6b00" />
    </svg>
  );
}
