const COLORS = ["#ff6b00", "#9333ea", "#fafafa", "#ff9a3d", "#6b21a8"];

/** Tira de papel picado en SVG; los recortes se pintan con el color de fondo. */
export function PapelPicado({ count = 9, bg = "#0b0b0f", className = "" }: { count?: number; bg?: string; className?: string }) {
  return (
    <div className={`pointer-events-none relative w-full ${className}`} aria-hidden>
      <div className="absolute inset-x-0 top-[6px] h-px bg-white/30" />
      <div className="flex justify-between gap-1 px-2">
        {Array.from({ length: count }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 60 70"
            className="animate-sway w-full max-w-[90px]"
            style={{ animationDelay: `${(i % 4) * 0.4}s` }}
          >
            <path
              d="M0 6 H60 V60 L55 66 L50 60 L45 66 L40 60 L35 66 L30 60 L25 66 L20 60 L15 66 L10 60 L5 66 L0 60 Z"
              fill={COLORS[i % COLORS.length]}
              opacity={0.92}
            />
            <g fill={bg}>
              {i % 2 === 0 ? (
                // Calaverita
                <>
                  <ellipse cx="30" cy="30" rx="11" ry="10" />
                  <rect x="24" y="36" width="12" height="7" rx="2" />
                  <circle cx="26" cy="29" r="3" fill={COLORS[i % COLORS.length]} />
                  <circle cx="34" cy="29" r="3" fill={COLORS[i % COLORS.length]} />
                  <path d="M30 32 l-1.6 3 h3.2z" fill={COLORS[i % COLORS.length]} />
                </>
              ) : (
                // Flor de cempasúchil
                <>
                  {Array.from({ length: 8 }).map((_, p) => (
                    <ellipse key={p} cx="30" cy="22" rx="3.2" ry="7" transform={`rotate(${p * 45} 30 31)`} />
                  ))}
                  <circle cx="30" cy="31" r="3.5" fill={COLORS[i % COLORS.length]} />
                </>
              )}
              <path d="M6 14 l3 3 -3 3 -3 -3z M54 14 l3 3 -3 3 -3 -3z M6 48 l3 3 -3 3 -3 -3z M54 48 l3 3 -3 3 -3 -3z" />
              <circle cx="18" cy="52" r="1.6" />
              <circle cx="30" cy="52" r="1.6" />
              <circle cx="42" cy="52" r="1.6" />
            </g>
          </svg>
        ))}
      </div>
    </div>
  );
}
