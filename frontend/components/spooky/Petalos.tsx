/**
 * Pétalos de cempasúchil cayendo en el hero (solo CSS).
 * Valores fijos —no aleatorios— para que el HTML del servidor y del cliente coincidan.
 * Con "reducir movimiento" se ocultan (ver globals.css).
 */
const PETALOS = [
  { left: 4, delay: 0, dur: 11, size: 14, drift: 30 },
  { left: 14, delay: 6.5, dur: 13, size: 10, drift: -24 },
  { left: 23, delay: 2.2, dur: 10, size: 16, drift: 18 },
  { left: 35, delay: 9, dur: 14, size: 11, drift: -30 },
  { left: 47, delay: 4.1, dur: 12, size: 13, drift: 26 },
  { left: 58, delay: 11, dur: 11.5, size: 9, drift: -18 },
  { left: 66, delay: 1.3, dur: 13.5, size: 15, drift: 22 },
  { left: 74, delay: 7.7, dur: 10.5, size: 12, drift: -26 },
  { left: 82, delay: 3.4, dur: 12.5, size: 10, drift: 20 },
  { left: 89, delay: 10, dur: 14.5, size: 14, drift: -22 },
  { left: 95, delay: 5.2, dur: 11, size: 11, drift: 16 },
  { left: 52, delay: 12.5, dur: 13, size: 12, drift: -20 },
];

export function Petalos() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {PETALOS.map((p, i) => (
        <span
          key={i}
          // En celular solo la mitad (menos de 20 elementos ambientales, ligeros en batería).
          className={`petalo absolute -top-6 ${i % 2 ? "hidden sm:block" : ""}`}
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 1.4,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              "--deriva": `${p.drift}px`,
            } as React.CSSProperties
          }
        >
          <svg viewBox="0 0 10 14" className="h-full w-full">
            <path d="M5 0 C9 3 9 10 5 14 C1 10 1 3 5 0Z" fill={i % 3 ? "#ff9a3d" : "#ff6b00"} opacity="0.85" />
            <path d="M5 2 L5 12" stroke="#ffd29a" strokeWidth="0.6" opacity="0.6" />
          </svg>
        </span>
      ))}
    </div>
  );
}
