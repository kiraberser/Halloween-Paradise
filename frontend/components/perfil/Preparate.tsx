"use client";

import { useEffect, useState } from "react";
import { Check, Clock, ListChecks } from "lucide-react";
import type { User } from "@/lib/auth";
import { Tarjeta } from "./Tarjeta";

const CLAVE_DISFRAZ = "hp_disfraz_listo";

/** Checklist para llegar listo a la fiesta. */
export function Preparate({ user }: { user: User }) {
  // "Disfraz listo" no lo sabe el sistema: lo marca la persona y se recuerda en este navegador.
  const [disfraz, setDisfraz] = useState(false);

  useEffect(() => {
    try {
      setDisfraz(localStorage.getItem(`${CLAVE_DISFRAZ}_${user.id}`) === "1");
    } catch {
      /* almacenamiento no disponible: la casilla empieza sin marcar */
    }
  }, [user.id]);

  const toggleDisfraz = () => {
    const nuevo = !disfraz;
    setDisfraz(nuevo);
    try {
      localStorage.setItem(`${CLAVE_DISFRAZ}_${user.id}`, nuevo ? "1" : "0");
    } catch {
      /* sin almacenamiento: solo dura mientras la página esté abierta */
    }
  };

  const boletoListo = !!user.boleto && user.boleto.estado !== "cancelado";
  const pasos = [
    { label: "Cuenta creada", hecho: true },
    { label: "Foto de perfil", hecho: !!user.foto_perfil, ayuda: "Súbela en Mis datos" },
    {
      label: "Boleto",
      hecho: boletoListo,
      ayuda: boletoListo && user.boleto?.estado === "pendiente" ? "Pendiente de pago" : "Aún sin asignar",
    },
  ];
  const completados = pasos.filter((p) => p.hecho).length + (disfraz ? 1 : 0);

  return (
    <Tarjeta titulo={`Prepárate · ${completados}/4`} icono={<ListChecks size={16} />}>
      <ul className="space-y-2.5 text-sm">
        {pasos.map((p) => (
          <li key={p.label} className="flex items-center gap-3">
            <Marca hecho={p.hecho} />
            <span className={p.hecho ? "text-bone" : "text-white/70"}>{p.label}</span>
            {!p.hecho && p.ayuda && <span className="ml-auto text-xs text-white/45">{p.ayuda}</span>}
          </li>
        ))}
        <li>
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={disfraz} onChange={toggleDisfraz} className="peer sr-only" />
            <Marca hecho={disfraz} interactiva />
            <span className={disfraz ? "text-bone" : "text-white/70"}>Disfraz listo</span>
            {!disfraz && <span className="ml-auto text-xs text-white/45">Toca para marcar</span>}
          </label>
        </li>
      </ul>
      <p className="mt-4 flex items-start gap-2 rounded-xl bg-pumpkin/10 p-3 text-xs text-pumpkin-soft">
        <Clock size={15} className="mt-px shrink-0" />
        <span>
          Llega antes de las 11:00 PM
          {user.genero === "M" ? ": recibes un drink de bienvenida y en puerta pagas menos." : "; la entrada se llena rápido."}
        </span>
      </p>
    </Tarjeta>
  );
}

function Marca({ hecho, interactiva = false }: { hecho: boolean; interactiva?: boolean }) {
  return (
    <span
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
        hecho ? "border-green-400 bg-green-400 text-night" : "border-white/30"
      } ${interactiva ? "peer-focus-visible:ring-2 peer-focus-visible:ring-pumpkin" : ""}`}
      aria-hidden
    >
      {hecho && <Check size={13} strokeWidth={3} />}
    </span>
  );
}
