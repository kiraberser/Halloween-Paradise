"use client";

import { m, useReducedMotion } from "motion/react";
import { DURACION, EASE_REBOTE } from "./movimiento";

/**
 * Calaverita de azúcar decorativa.
 * Entrada: "pop" con rebote al aparecer en pantalla (`retraso` para escalonar).
 * Al pasar el mouse o tocarla: castañea la mandíbula y se le encienden los ojos.
 */
export function Calavera({ size = 44, retraso = 0, className = "" }: { size?: number; retraso?: number; className?: string }) {
  const reducido = useReducedMotion();

  return (
    <m.span
      aria-hidden
      className={`inline-block shrink-0 cursor-pointer ${className}`}
      style={{ width: size }}
      // Mismo estado inicial en servidor y cliente; con "reducir movimiento" la escala y el giro
      // se resuelven al instante y solo queda el fundido.
      initial={{ opacity: 0, scale: 0, rotate: -25 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={
        reducido
          ? { opacity: { duration: DURACION.rapida, delay: retraso }, scale: { duration: 0 }, rotate: { duration: 0 } }
          : { duration: DURACION.normal, delay: retraso, ease: EASE_REBOTE }
      }
      whileHover="risa"
      whileTap="risa"
    >
      <svg viewBox="0 0 64 72" className="w-full overflow-visible drop-shadow-[0_0_8px_rgba(250,250,250,.25)]">
        {/* Cráneo */}
        <path d="M32 3 C15 3 6 15 6 29 C6 39 11 45 16 48 L48 48 C53 45 58 39 58 29 C58 15 49 3 32 3Z" fill="#fafafa" />
        {/* Flor de cempasúchil en la frente */}
        {Array.from({ length: 6 }).map((_, i) => (
          <ellipse key={i} cx="32" cy="10.5" rx="2.3" ry="4" fill="#ff6b00" transform={`rotate(${i * 60} 32 14)`} />
        ))}
        <circle cx="32" cy="14" r="2.2" fill="#9333ea" />
        {/* Ojos: se encienden al reír */}
        <m.circle cx="21" cy="29" r="7" fill="#6b21a8" variants={{ risa: { fill: "#ff6b00" } }} transition={{ duration: 0.09 }} />
        <m.circle cx="43" cy="29" r="7" fill="#6b21a8" variants={{ risa: { fill: "#ff6b00" } }} transition={{ duration: 0.09 }} />
        <circle cx="21" cy="29" r="2.6" fill="#fafafa" />
        <circle cx="43" cy="29" r="2.6" fill="#fafafa" />
        {/* Puntitos decorativos */}
        <circle cx="12" cy="22" r="1.4" fill="#9333ea" />
        <circle cx="52" cy="22" r="1.4" fill="#9333ea" />
        {/* Nariz de corazón */}
        <path d="M32 36 C30 33.5 27.5 35.5 32 40 C36.5 35.5 34 33.5 32 36Z" fill="#0b0b0f" />
        {/* Mandíbula: castañea al reír */}
        <m.g
          variants={{ risa: { y: reducido ? 0 : [0, 4, 0, 4, 0] } }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <path d="M16 47 L48 47 C48 58 42 66 32 66 C22 66 16 58 16 47Z" fill="#fafafa" />
          <path d="M20 50 L44 50 M24 50 L24 56 M29 50 L29 57 M35 50 L35 57 M40 50 L40 56" stroke="#0b0b0f" strokeWidth="1.6" strokeLinecap="round" />
        </m.g>
      </svg>
    </m.span>
  );
}
