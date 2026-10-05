"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell, Label } from "@/components/AuthShell";
import { api, apiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { GENEROS } from "@/lib/event";

export default function RegistroPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    if (form.get("password") !== form.get("password2")) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    form.delete("password2");
    if (!form.get("fecha_nacimiento")) form.delete("fecha_nacimiento");
    setSending(true);
    try {
      await api.post("/auth/register/", form);
      await login(String(form.get("email")), String(form.get("password")));
      router.push("/perfil?bienvenida=1");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthShell title="Únete al paraíso" subtitle="Crea tu cuenta para entrar a la fiesta. Tu foto la subes después en tu perfil.">
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="first_name">Nombre</Label>
            <input id="first_name" name="first_name" required className="field" autoComplete="given-name" />
          </div>
          <div>
            <Label htmlFor="last_name">Apellidos</Label>
            <input id="last_name" name="last_name" required className="field" autoComplete="family-name" />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Correo</Label>
          <input id="email" name="email" type="email" required className="field" autoComplete="email" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="telefono">Teléfono / WhatsApp</Label>
            <input id="telefono" name="telefono" type="tel" className="field" autoComplete="tel" />
          </div>
          <div>
            <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
            <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" className="field [color-scheme:dark]" />
          </div>
        </div>
        <div>
          <Label htmlFor="genero">Género</Label>
          <select id="genero" name="genero" className="field" defaultValue="N">
            {GENEROS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <input id="password" name="password" type="password" required minLength={8} className="field" autoComplete="new-password" />
          </div>
          <div>
            <Label htmlFor="password2">Confirmar</Label>
            <input id="password2" name="password2" type="password" required minLength={8} className="field" autoComplete="new-password" />
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p>}
        <button className="btn-primary mt-2" disabled={sending}>{sending ? "Creando cuenta…" : "Crear cuenta"}</button>
        <p className="text-center text-sm text-white/60">
          ¿Ya tienes cuenta? <Link href="/login" className="text-pumpkin hover:underline">Inicia sesión</Link>
        </p>
      </form>
    </AuthShell>
  );
}
