"use client";

export function Pager({ count, page, hasNext, hasPrev, setPage }: { count: number; page: number; hasNext: boolean; hasPrev: boolean; setPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between text-sm text-white/60">
      <span>{count} registros</span>
      <div className="flex gap-2">
        <button disabled={!hasPrev} onClick={() => setPage(page - 1)} className="btn-ghost !py-1.5 disabled:opacity-30">Anterior</button>
        <button disabled={!hasNext} onClick={() => setPage(page + 1)} className="btn-ghost !py-1.5 disabled:opacity-30">Siguiente</button>
      </div>
    </div>
  );
}
