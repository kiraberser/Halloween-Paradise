"use client";

import { useState } from "react";
import { ChevronDown, UserRound } from "lucide-react";
import { Label } from "@/components/AuthShell";
import { PhotoPicker } from "@/components/PhotoPicker";
import { api, apiError } from "@/lib/api";
import { useAuth, type User } from "@/lib/auth";
import { GENEROS, mediaUrl } from "@/lib/event";

/** Formulario plegable para editar foto y datos personales. */
export function MisDatos({ user, abierto }: { user: User; abierto: boolean }) {
  const { setUser } = useAuth();
  const [foto, setFoto] = useState<File | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!form.get("fecha_nacimiento")) form.delete("fecha_nacimiento");
    if (foto) form.set("foto_perfil", foto);
    setSending(true);
    try {
      const { data } = await api.patch<User>("/auth/me/", form);
      setUser(data);
      setFoto(null);
      setMsg({ ok: true, text: "¡Listo! Tu perfil se guardó." });
    } catch (err) {
      setMsg({ ok: false, text: apiError(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <details open={abierto} className="group rounded-2xl border border-white/10 bg-night-2">
      <summary className="flex cursor-pointer list-none items-center gap-2 p-5 text-xs font-semibold uppercase tracking-[0.25em] text-witch-glow">
        <UserRound size={16} /> Mis datos
        <span className="ml-auto text-[11px] normal-case tracking-normal text-white/50">Foto, nombre, teléfono…</span>
        <ChevronDown size={18} className="text-white/50 transition group-open:rotate-180" />
      </summary>
      <form onSubmit={submit} className="grid gap-4 px-5 pb-5">
        <PhotoPicker current={mediaUrl(user.foto_perfil)} onChange={(f, err) => { setFoto(f); setMsg(err ? { ok: false, text: err } : null); }} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="first_name">Nombre</Label>
            <input id="first_name" name="first_name" defaultValue={user.first_name} className="field" />
          </div>
          <div>
            <Label htmlFor="last_name">Apellidos</Label>
            <input id="last_name" name="last_name" defaultValue={user.last_name} className="field" />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <input id="telefono" name="telefono" defaultValue={user.telefono} className="field" />
          </div>
          <div>
            <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
            <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" defaultValue={user.fecha_nacimiento ?? ""} className="field [color-scheme:dark]" />
          </div>
        </div>
        <div>
          <Label htmlFor="genero">Género</Label>
          <select id="genero" name="genero" defaultValue={user.genero} className="field">
            {GENEROS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        {msg && (
          <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"}`} role="status">
            {msg.text}
          </p>
        )}
        <button className="btn-primary" disabled={sending}>{sending ? "Guardando…" : "Guardar cambios"}</button>
      </form>
    </details>
  );
}
