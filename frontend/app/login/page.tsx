"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell, Label } from "@/components/AuthShell";
import { apiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    setSending(true);
    try {
      const user = await login(String(form.get("email")), String(form.get("password")));
      router.push(user.is_staff ? "/dashboard" : "/perfil");
    } catch (err) {
      setError(apiError(err) || "Correo o contraseña incorrectos.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthShell title="Bienvenido de vuelta" subtitle="Entra a tu cuenta de Halloween Paradise.">
      <form onSubmit={submit} className="grid gap-4">
        <div>
          <Label htmlFor="email">Correo o usuario</Label>
          <input id="email" name="email" required className="field" autoComplete="username" />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <input id="password" name="password" type="password" required className="field" autoComplete="current-password" />
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p>}
        <button className="btn-primary mt-2" disabled={sending}>{sending ? "Entrando…" : "Entrar"}</button>
        <p className="text-center text-sm text-white/60">
          ¿No tienes cuenta? <Link href="/registro" className="text-pumpkin hover:underline">Regístrate</Link>
        </p>
      </form>
    </AuthShell>
  );
}
