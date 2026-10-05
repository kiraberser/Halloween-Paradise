"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import { AuthShell, Label } from "@/components/AuthShell";
import { BuyButton } from "@/components/BuyTicket";
import { PhotoPicker } from "@/components/PhotoPicker";
import { TicketModal } from "@/components/TicketModal";
import { api, apiError } from "@/lib/api";
import { useAuth, type User } from "@/lib/auth";
import { GENEROS, mediaUrl } from "@/lib/event";

export default function PerfilPage() {
  return (
    <Suspense>
      <Perfil />
    </Suspense>
  );
}

function Perfil() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, setUser, logout } = useAuth();
  const [foto, setFoto] = useState<File | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [verBoleto, setVerBoleto] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (!user) return null;

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
    <AuthShell
      title={`Hola, ${user.first_name || user.username}`}
      subtitle={
        params.get("bienvenida")
          ? "Tu cuenta está lista 🎃 En la entrada te buscamos por tu nombre."
          : user.foto_perfil
            ? "Tu foto ya está en la lista para la ofrenda."
            : "Aún no subes tu foto para la ofrenda."
      }
    >
      {user.boleto ? (
        <button
          type="button"
          onClick={() => setVerBoleto(true)}
          className="mb-5 flex w-full items-center gap-3 rounded-xl border border-green-400/40 bg-green-500/10 p-3 text-left transition hover:border-green-400"
        >
          <Ticket className="shrink-0 text-green-300" />
          <span className="flex-1 text-sm">
            <b className="block text-bone">Ver mi boleto</b>
            <span className="text-white/70">{user.boleto.folio} · {user.boleto.estado_display}</span>
          </span>
        </button>
      ) : (
        <p className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
          Aún no tienes boleto asignado. Cuando el staff lo registre aparecerá aquí.
        </p>
      )}
      {verBoleto && user.boleto && <TicketModal boleto={user.boleto} persona={user} onClose={() => setVerBoleto(false)} />}
      <form onSubmit={submit} className="grid gap-4">
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          {user.genero === "M" ? (
            <Link href="/#boletos" className="btn-ghost">Ver precios</Link>
          ) : (
            <BuyButton className="btn-ghost" />
          )}
          <button type="button" onClick={() => { logout(); router.push("/"); }} className="text-sm text-white/60 hover:text-bone">
            Cerrar sesión
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
