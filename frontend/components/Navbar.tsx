"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { mediaUrl } from "@/lib/event";
import { BuyButton } from "./BuyTicket";

export function Navbar() {
  const { user, loading } = useAuth();
  const foto = mediaUrl(user?.foto_perfil);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-night/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="whitespace-nowrap font-display text-lg text-pumpkin sm:text-2xl">
          Halloween <span className="text-witch-glow">Paradise</span>
        </Link>
        <div className="flex items-center gap-1.5 text-sm sm:gap-2">
          <Link href="/#boletos" className="hidden px-3 py-2 text-white/75 hover:text-bone md:inline">Boletos</Link>
          <Link href="/#ofrenda" className="hidden px-3 py-2 text-white/75 hover:text-bone md:inline">Ofrenda</Link>
          <Link href="/#faq" className="hidden px-3 py-2 text-white/75 hover:text-bone md:inline">FAQ</Link>
          {!loading &&
            (user ? (
              <>
                {user.is_staff && (
                  <Link href="/dashboard" className="btn-ghost hidden !px-3 !py-1.5 sm:inline-flex">Dashboard</Link>
                )}
                <Link href="/perfil" className="flex items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3 hover:border-pumpkin">
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={foto} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-witch text-xs font-bold">
                      {user.first_name?.[0] ?? "?"}
                    </span>
                  )}
                  <span className="hidden sm:inline">{user.first_name || "Perfil"}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 text-white/75 hover:text-bone">Entrar</Link>
                <Link href="/registro" className="btn-ghost hidden !px-4 !py-1.5 sm:inline-flex">Registrarme</Link>
              </>
            ))}
          <BuyButton className="btn-primary whitespace-nowrap !px-3 !py-2 text-sm sm:!px-4"><span className="sm:hidden">Boletos</span><span className="hidden sm:inline">Comprar boleto</span></BuyButton>
        </div>
      </nav>
    </header>
  );
}
