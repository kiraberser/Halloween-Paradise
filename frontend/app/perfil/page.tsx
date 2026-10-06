"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Hourglass, LogOut, PartyPopper } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { Navbar } from "@/components/Navbar";
import { PapelPicado } from "@/components/PapelPicado";
import { InvitarAmigos } from "@/components/perfil/InvitarAmigos";
import { MiBoleto } from "@/components/perfil/MiBoleto";
import { MisDatos } from "@/components/perfil/MisDatos";
import { Preparate } from "@/components/perfil/Preparate";
import { StaffPanel } from "@/components/perfil/StaffPanel";
import { Tarjeta } from "@/components/perfil/Tarjeta";
import { useAuth } from "@/lib/auth";
import { EVENT, mediaUrl } from "@/lib/event";

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
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (!user) return null;

  const bienvenida = !!params.get("bienvenida");
  const foto = mediaUrl(user.foto_perfil);
  const nombre = user.first_name || user.username;

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-60px)] bg-[radial-gradient(ellipse_at_top,rgba(107,33,168,.35),transparent_60%)] pb-16">
        <PapelPicado count={9} />
        <div className="mx-auto max-w-3xl space-y-5 px-4 pt-8">
          {/* Encabezado */}
          <header className="rise flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-pumpkin bg-night-2 sm:h-20 sm:w-20">
              {foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-2xl font-bold text-witch-glow">{nombre[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-4xl text-pumpkin sm:text-5xl">Hola, {nombre}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/60">
                {user.is_superuser ? (
                  <span className="rounded-full bg-pumpkin px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-night">Admin</span>
                ) : user.is_staff ? (
                  <span className="rounded-full bg-witch px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bone">Staff</span>
                ) : null}
                <span className="truncate">{user.email}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => { logout(); router.push("/"); }}
              className="hidden items-center gap-1.5 text-sm text-white/50 hover:text-bone sm:flex"
            >
              <LogOut size={15} /> Salir
            </button>
          </header>

          {bienvenida && (
            <p className="rise flex items-center gap-3 rounded-2xl border border-green-400/40 bg-green-500/10 p-4 text-sm text-green-200">
              <PartyPopper className="shrink-0" />
              Tu cuenta está lista 🎃 Sube tu foto en “Mis datos” y revisa cómo conseguir tu boleto.
            </p>
          )}

          {user.is_staff && <StaffPanel />}

          <MiBoleto user={user} />

          <div className="grid gap-5 md:grid-cols-2">
            <Tarjeta titulo="Faltan" icono={<Hourglass size={16} />}>
              <Countdown compacto />
              <p className="mt-4 text-sm text-white/60">{EVENT.dateLabel} · {EVENT.city}</p>
            </Tarjeta>
            <Preparate user={user} />
          </div>

          <InvitarAmigos />

          <MisDatos user={user} abierto={bienvenida || !user.foto_perfil} />

          <button
            type="button"
            onClick={() => { logout(); router.push("/"); }}
            className="mx-auto flex items-center gap-1.5 text-sm text-white/50 hover:text-bone sm:hidden"
          >
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </main>
    </>
  );
}
