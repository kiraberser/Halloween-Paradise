"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3, Home, Image as ImageIcon, LogOut, Receipt, ScanLine, Ticket, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Resumen", icon: BarChart3 },
  { href: "/dashboard/escanear", label: "Escanear QR", icon: ScanLine },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: Users },
  { href: "/dashboard/ventas", label: "Ventas", icon: Ticket },
  { href: "/dashboard/gastos", label: "Costos y gastos", icon: Receipt },
  { href: "/dashboard/imagenes", label: "Imágenes", icon: ImageIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-white/60">Cargando…</div>;
  }

  if (!user.is_staff) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="font-display text-5xl text-pumpkin">Acceso restringido</p>
          <p className="mt-2 text-white/70">El dashboard es solo para administradores.</p>
          <Link href="/" className="btn-ghost mt-6">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr] print:block">
      <aside className="no-print sticky top-0 z-30 border-b border-white/10 bg-night-2 md:h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <Link href="/" className="font-display text-xl text-pumpkin">
            Halloween <span className="text-witch-glow">Paradise</span>
          </Link>
          <p className="hidden text-xs uppercase tracking-[0.2em] text-white/40 md:mt-1 md:block">Dashboard</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-pumpkin text-night font-semibold" : "text-white/70 hover:bg-white/5 hover:text-bone"
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
          <div className="hidden md:mt-6 md:block md:border-t md:border-white/10 md:pt-3" />
          <Link href="/" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-bone">
            <Home size={16} /> Sitio
          </Link>
          <button onClick={() => { logout(); router.push("/"); }} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/60 hover:text-bone">
            <LogOut size={16} /> Salir
          </button>
        </nav>
      </aside>
      <main className="min-w-0 px-4 py-6 md:px-8 print:p-0">{children}</main>
    </div>
  );
}
