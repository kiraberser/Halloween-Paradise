"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { Camera, Check, Copy, MessageCircle, UserPlus, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { INSTAGRAM_URL, MESSENGER_URL } from "@/lib/event";

const slug = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Ctx = { open: (tipo?: string) => void };
const BuyCtx = createContext<Ctx>({ open: () => {} });

export function BuyTicketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tipo, setTipo] = useState<string | null | undefined>(undefined);
  const [copiado, setCopiado] = useState(false);
  const isOpen = tipo !== undefined;
  const close = () => { setTipo(undefined); setCopiado(false); };

  // m.me admite ?ref= para saber desde qué boleto llegó la persona (p. ej. "hombre-preventa").
  const messenger = tipo ? `${MESSENGER_URL}?ref=${slug(tipo)}` : MESSENGER_URL;

  const copiar = async () => {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <BuyCtx.Provider value={{ open: (t) => setTipo(t ?? null) }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-title"
        >
          <div
            className="glow-witch rise w-full max-w-md rounded-2xl border border-white/10 bg-night-2 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 id="buy-title" className="font-display text-3xl text-pumpkin">
                {user ? "Compra tu preventa" : "Primero, regístrate"}
              </h3>
              <button onClick={close} aria-label="Cerrar" className="text-white/60 hover:text-bone">
                <X />
              </button>
            </div>

            {user ? (
              <>
                <p className="mt-1 text-sm text-white/70">
                  {tipo ? <>Boleto <b className="text-bone">{tipo}</b>. </> : null}
                  Escríbenos por chat y te apartamos tu lugar.
                </p>
                <div className="mt-4 rounded-xl border border-pumpkin/30 bg-pumpkin/10 p-3 text-sm">
                  <p className="text-white/80">Al escribir, comparte tu correo registrado:</p>
                  <button
                    type="button"
                    onClick={copiar}
                    aria-label={copiado ? "Correo copiado" : "Copiar correo"}
                    className="mt-1 inline-flex max-w-full items-center gap-2 font-semibold text-bone hover:text-pumpkin-soft"
                  >
                    <span className="truncate">{user.email}</span>
                    {copiado ? <Check size={16} className="shrink-0 text-green-400" /> : <Copy size={16} className="shrink-0" />}
                  </button>
                </div>
                <div className="mt-5 grid gap-3">
                  <a href={messenger} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                    <MessageCircle size={20} /> Ir a Messenger
                  </a>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-witch px-6 py-3 font-semibold text-bone transition hover:bg-witch-glow"
                  >
                    <Camera size={20} /> Ir a Instagram
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-white/70">
                  Todos los asistentes necesitan registro en la página, incluso quienes entran gratis.
                  Es rápido y de paso subes tu foto para la decoración.
                </p>
                <div className="mt-6 grid gap-3">
                  <Link href="/registro" onClick={close} className="btn-primary w-full">
                    <UserPlus size={20} /> Registrarme
                  </Link>
                  <Link href="/login" onClick={close} className="btn-ghost w-full">
                    Ya tengo cuenta
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </BuyCtx.Provider>
  );
}

export function BuyButton({ tipo, className = "btn-primary", children }: { tipo?: string; className?: string; children?: React.ReactNode }) {
  const { open } = useContext(BuyCtx);
  return (
    <button type="button" onClick={() => open(tipo)} className={className}>
      {children ?? "Comprar preventa"}
    </button>
  );
}
