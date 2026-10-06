/** Contenedor común de las secciones del perfil. */
export function Tarjeta({
  titulo, icono, children, className = "",
}: {
  titulo?: string;
  icono?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-night-2 p-5 ${className}`}>
      {titulo && (
        <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-witch-glow">
          {icono}
          {titulo}
        </h2>
      )}
      {children}
    </section>
  );
}
