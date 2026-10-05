"use client";

import { createContext, useContext, useState } from "react";
import { Camera, MessageCircle, X } from "lucide-react";
import { INSTAGRAM_URL, MESSENGER_URL } from "@/lib/event";

type Ctx = { open: (tipo?: string) => void };
const BuyCtx = createContext<Ctx>({ open: () => {} });

export function BuyTicketProvider({ children }: { children: React.ReactNode }) {
  const [tipo, setTipo] = useState<string | null | undefined>(undefined);
  const isOpen = tipo !== undefined;

  // m.me admite ?ref= para saber desde qué boleto llegó la persona.
  const messenger = tipo ? `${MESSENGER_URL}?ref=${encodeURIComponent(tipo.toLowerCase())}` : MESSENGER_URL;

  return (
    <BuyCtx.Provider value={{ open: (t) => setTipo(t ?? null) }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
          onClick={() => setTipo(undefined)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-title"
        >
          <div
            className="glow-witch rise w-full max-w-md rounded-2xl border border-white/10 bg-night-2 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 id="buy-title" className="font-display text-3xl text-pumpkin">Compra tu boleto</h3>
                <p className="mt-1 text-sm text-white/70">
                  {tipo ? <>Boleto <b className="text-bone">{tipo}</b>. </> : null}
                  Escríbenos por chat y te apartamos tu lugar.
                </p>
              </div>
              <button onClick={() => setTipo(undefined)} aria-label="Cerrar" className="text-white/60 hover:text-bone">
                <X />
              </button>
            </div>
            <div className="mt-6 grid gap-3">
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
      {children ?? "Comprar boleto"}
    </button>
  );
}
