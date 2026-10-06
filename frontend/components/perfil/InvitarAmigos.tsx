"use client";

import { useEffect, useState } from "react";
import { Check, Copy, MessageCircle, Share2, UsersRound } from "lucide-react";
import { EVENT } from "@/lib/event";
import { Tarjeta } from "./Tarjeta";

/** Compartir la fiesta con mensaje ya escrito. */
export function InvitarAmigos() {
  const [url, setUrl] = useState("");
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin);
    setPuedeCompartir(typeof navigator.share === "function");
  }, []);

  const mensaje =
    `🎃 ¡Vamos a ${EVENT.name}! ${EVENT.dateLabel} en ${EVENT.city}. ` +
    `Preventa: mujeres $50 y hombres $80 (ellas con drink de bienvenida antes de las 11). Regístrate aquí: ${url}`;

  const compartir = async () => {
    try {
      await navigator.share({ title: EVENT.name, text: mensaje });
    } catch {
      /* la persona canceló el menú de compartir */
    }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <Tarjeta titulo="Invita a tus amigos" icono={<UsersRound size={16} />}>
      <p className="text-sm text-white/70">Entre más, mejor. Mándales la invitación con un clic.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {puedeCompartir && (
          <button type="button" onClick={compartir} className="btn-primary !py-2.5 text-sm">
            <Share2 size={16} /> Compartir
          </button>
        )}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${puedeCompartir ? "btn-ghost" : "btn-primary"} !py-2.5 text-sm`}
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
        <button type="button" onClick={copiar} className="btn-ghost !py-2.5 text-sm" aria-live="polite">
          {copiado ? <><Check size={16} className="text-green-400" /> ¡Link copiado!</> : <><Copy size={16} /> Copiar link</>}
        </button>
      </div>
    </Tarjeta>
  );
}
