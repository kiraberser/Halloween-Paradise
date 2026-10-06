"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { DURACION, EASE_REBOTE, EASE_SALIDA } from "./movimiento";

type Lado = "izq" | "der" | "abajo";

// Fuera de pantalla → asomado. La entrada dura más que la salida (lo que aparece importa más).
const POSES: Record<Lado, { fuera: object; dentro: object; className: string }> = {
  izq: { fuera: { x: -110, rotate: 20 }, dentro: { x: -18, rotate: 12 }, className: "left-0 top-[58vh]" },
  der: { fuera: { x: 110, rotate: -20 }, dentro: { x: 18, rotate: -12 }, className: "right-0 top-[42vh]" },
  abajo: { fuera: { y: 120 }, dentro: { y: 26 }, className: "bottom-0 left-[12%]" },
};

const aleatorio = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Fantasmita que se asoma por un borde, dice "¡Buu!" y se esconde.
 * Susto suave: aparece cada 30–45 s (menos seguido en celular); al tocarlo huye girando.
 * Con "reducir movimiento" no aparece (nada se reproduce solo).
 */
export function Fantasma() {
  const reducido = useReducedMotion();
  const [lado, setLado] = useState<Lado | null>(null);
  const [huyendo, setHuyendo] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const programar = useCallback((segundos: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      // No asustar si la pestaña no está visible.
      if (document.hidden) return programar(10);
      const lados: Lado[] = ["izq", "der", "abajo"];
      setHuyendo(false);
      setLado(lados[Math.floor(Math.random() * lados.length)]);
    }, segundos * 1000);
  }, []);

  useEffect(() => {
    if (reducido) return;
    const movil = window.matchMedia("(max-width: 640px)").matches;
    programar(movil ? 12 : 8);
    return () => clearTimeout(timer.current);
  }, [reducido, programar]);

  // Se queda asomado ~3 s y se esconde.
  useEffect(() => {
    if (!lado || huyendo) return;
    const id = setTimeout(() => setLado(null), 3200);
    return () => clearTimeout(id);
  }, [lado, huyendo]);

  const alEsconderse = () => {
    const movil = window.matchMedia("(max-width: 640px)").matches;
    programar(movil ? aleatorio(50, 70) : aleatorio(30, 45));
  };

  const asustar = () => {
    setHuyendo(true);
    setTimeout(() => setLado(null), 450);
  };

  if (reducido) return null;
  const pose = lado ? POSES[lado] : null;

  return (
    <AnimatePresence onExitComplete={alEsconderse}>
      {lado && pose && (
        <m.button
          key={lado}
          type="button"
          onClick={asustar}
          aria-label="Fantasma"
          tabIndex={-1}
          className={`fixed z-30 w-16 cursor-pointer sm:w-20 ${pose.className}`}
          initial={{ ...pose.fuera, opacity: 0 }}
          animate={
            huyendo
              ? { rotate: 360, scale: 0.2, opacity: 0, transition: { duration: 0.45, ease: EASE_SALIDA } }
              : { ...pose.dentro, opacity: 1, transition: { duration: DURACION.lenta, ease: EASE_REBOTE } }
          }
          exit={{ ...pose.fuera, opacity: 0, transition: { duration: DURACION.normal, ease: EASE_SALIDA } }}
        >
          {/* Globito "¡Buu!": aparece con un pop después de asomarse */}
          {!huyendo && (
            <m.span
              className={`absolute -top-9 whitespace-nowrap rounded-full bg-bone px-2.5 py-1 font-display text-lg leading-none text-witch shadow-lg ${
                lado === "der" ? "right-6" : "left-6"
              }`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { delay: 0.45, duration: DURACION.normal, ease: EASE_REBOTE } }}
            >
              ¡Buu!
            </m.span>
          )}
          <FantasmaSvg />
        </m.button>
      )}
    </AnimatePresence>
  );
}

function FantasmaSvg() {
  return (
    <svg viewBox="0 0 80 96" className="fantasma-flota w-full drop-shadow-[0_0_18px_rgba(250,250,250,.45)]">
      {/* Cuerpo con borde ondulado (el borde ondea en CSS como movimiento secundario) */}
      <path
        className="fantasma-cola"
        d="M40 4 C18 4 8 22 8 44 L8 84 C13 78 18 78 22 86 C27 78 33 78 37 86 C42 78 48 78 52 86 C57 78 62 78 66 86 C69 80 72 79 72 84 L72 44 C72 22 62 4 40 4Z"
        fill="#fafafa"
      />
      <ellipse cx="29" cy="40" rx="5.5" ry="7.5" fill="#0b0b0f" />
      <ellipse cx="51" cy="40" rx="5.5" ry="7.5" fill="#0b0b0f" />
      <circle cx="31" cy="37.5" r="1.8" fill="#fafafa" />
      <circle cx="53" cy="37.5" r="1.8" fill="#fafafa" />
      <ellipse cx="40" cy="57" rx="5" ry="6.5" fill="#0b0b0f" />
      <ellipse cx="21" cy="51" rx="4.5" ry="2.6" fill="#ff9a3d" opacity="0.55" />
      <ellipse cx="59" cy="51" rx="4.5" ry="2.6" fill="#ff9a3d" opacity="0.55" />
    </svg>
  );
}
