"use client";

import { LazyMotion, domAnimation } from "motion/react";

/**
 * Identidad de movimiento de la landing (personalidad "juguetona", skill motion-design):
 * una curva con rebote para entradas, aceleración para salidas y tres duraciones.
 */
export const EASE_REBOTE = [0.175, 0.885, 0.32, 1.275] as const;
export const EASE_SALIDA = [0.3, 0, 1, 1] as const;
export const DURACION = { rapida: 0.18, normal: 0.3, lenta: 0.6 } as const;

/** Carga solo las animaciones DOM de motion (~15 KB) para los componentes `m.*`. */
export function MovimientoProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
