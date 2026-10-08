"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, tokens } from "./api";

export type Boleto = {
  id: number;
  folio: string;
  codigo: string;
  tipo_nombre: string;
  precio: string;
  estado: "pendiente" | "pagado" | "cancelado";
  estado_display: string;
  canal: string;
  fecha_venta: string;
  ingreso: string | null;
};

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telefono: string;
  genero: string;
  genero_display: string;
  fecha_nacimiento: string | null;
  foto_perfil: string | null;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  boleto: Boleto | null;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  reload: () => Promise<void>;
  setUser: (u: User) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!tokens.access && !tokens.refresh) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User>("/auth/me/");
      setUser(data);
    } catch {
      tokens.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/token/", { username: email, password });
    tokens.set(data.access, data.refresh);
    const me = await api.get<User>("/auth/me/");
    setUser(me.data);
    return me.data;
  };

  const logout = () => {
    // Revoca el refresh token en el servidor (sin esperar: si falla, la sesión local se cierra igual).
    const refresh = tokens.refresh;
    if (refresh) api.post("/auth/logout/", { refresh }).catch(() => {});
    tokens.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, reload, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
