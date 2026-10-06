"use client";

import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, X } from "lucide-react";
import type { Boleto } from "@/lib/auth";
import { EVENT, mediaUrl, money } from "@/lib/event";

type Persona = { first_name: string; last_name: string; email: string; foto_perfil: string | null };

/** Boleto digital en ventana: lo abre el staff desde Usuarios. */
export function TicketModal({ boleto, persona, onClose }: { boleto: Boleto; persona: Persona; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Boleto ${boleto.folio}`}
    >
      <div className="my-auto w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <TicketCard boleto={boleto} persona={persona} onClose={onClose} />
      </div>
    </div>
  );
}

/**
 * Boleto digital: estado, folio, QR y datos del evento.
 * `fondo` debe coincidir con lo que hay detrás para que los recortes del perforado se vean.
 */
export function TicketCard({
  boleto, persona, onClose, fondo = "bg-black/80",
}: {
  boleto: Boleto;
  persona: Persona;
  onClose?: () => void;
  fondo?: string;
}) {
  const aceptada = boleto.estado === "pagado";
  const foto = mediaUrl(persona.foto_perfil);
  const nombre = `${persona.first_name} ${persona.last_name}`.trim() || persona.email;

  return (
    <article className="rise relative w-full overflow-hidden rounded-3xl bg-bone text-night shadow-[0_0_80px_rgba(147,51,234,.45)]">
      {onClose && (
        <button onClick={onClose} aria-label="Cerrar" className="absolute right-3 top-3 z-10 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50">
          <X size={18} />
        </button>
      )}

      {/* Encabezado */}
      <header className="relative bg-gradient-to-br from-witch via-[#3b0f63] to-night px-6 pb-6 pt-7 text-bone">
        <div className="absolute inset-x-0 top-0 flex h-2" aria-hidden>
          {["#ff6b00", "#9333ea", "#fafafa", "#ff9a3d", "#6b21a8", "#ff6b00", "#9333ea", "#fafafa"].map((c, i) => (
            <span key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
        <p className="font-display text-3xl leading-none text-pumpkin">Halloween</p>
        <p className="font-display text-3xl leading-none">Paradise</p>
        <p
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            aceptada ? "bg-green-400 text-night" : "bg-pumpkin text-night"
          }`}
        >
          {aceptada ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
          {aceptada ? "Invitación aceptada" : boleto.estado === "cancelado" ? "Cancelado" : "Pendiente de pago"}
        </p>
      </header>

      {/* Invitado */}
      <section className="flex items-center gap-4 px-6 pt-5">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-pumpkin bg-night/10">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-xl font-bold text-witch">{nombre[0]}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-night/50">Invitado</p>
          <p className="truncate text-lg font-bold">{nombre}</p>
          <p className="truncate text-sm text-night/60">{persona.email}</p>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 px-6 pt-4 text-sm">
        <div className="col-span-2">
          <dt className="text-[11px] uppercase tracking-[0.2em] text-night/50">Boleto</dt>
          <dd className="font-semibold">{boleto.tipo_nombre}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-night/50">Precio</dt>
          <dd className="font-semibold">{Number(boleto.precio) === 0 ? "Gratis" : money(boleto.precio)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-night/50">Emitido</dt>
          <dd className="font-semibold">
            {new Date(boleto.fecha_venta).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
          </dd>
        </div>
      </dl>

      {/* Perforado */}
      <div className="relative my-5 border-t-2 border-dashed border-night/20" aria-hidden>
        <span className={`absolute -left-3 -top-3 h-6 w-6 rounded-full ${fondo}`} />
        <span className={`absolute -right-3 -top-3 h-6 w-6 rounded-full ${fondo}`} />
      </div>

      {/* QR y folio */}
      <section className="flex items-center gap-5 px-6">
        <div className={`rounded-xl bg-white p-2 ring-1 ring-night/10 ${aceptada ? "" : "opacity-40"}`}>
          <QRCodeSVG value={`HP:${boleto.codigo}`} size={104} fgColor="#0b0b0f" level="M" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-night/50">Folio</p>
          <p className="font-mono text-xl font-bold tracking-wider text-witch">{boleto.folio}</p>
          <p className="mt-2 text-xs text-night/60">
            {aceptada
              ? "Muestra este boleto y una identificación en la entrada."
              : "Se activará cuando confirmemos tu pago."}
          </p>
        </div>
      </section>

      <footer className="mt-5 space-y-1.5 bg-night/5 px-6 py-4 text-sm text-night/70">
        <p className="flex items-center gap-2"><CalendarDays size={15} className="text-pumpkin" /> {EVENT.dateLabel}</p>
        <p className="flex items-center gap-2"><MapPin size={15} className="text-pumpkin" /> {EVENT.venue} · {EVENT.city}</p>
      </footer>
    </article>
  );
}
