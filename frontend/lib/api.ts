import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "./event";

const ACCESS = "hp_access";
const REFRESH = "hp_refresh";

export const tokens = {
  get access() {
    return typeof window === "undefined" ? null : localStorage.getItem(ACCESS);
  },
  get refresh() {
    return typeof window === "undefined" ? null : localStorage.getItem(REFRESH);
  },
  set(access: string, refresh?: string) {
    localStorage.setItem(ACCESS, access);
    if (refresh) localStorage.setItem(REFRESH, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};

export const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  const access = tokens.access;
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const refresh = tokens.refresh;
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${API_URL}/api/auth/token/refresh/`, { refresh });
    tokens.set(data.access, data.refresh);
    return data.access;
  } catch {
    tokens.clear();
    return null;
  }
}

// Si el access token expiró, lo renueva una vez y repite la petición.
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
  if (error.response?.status === 401 && original && !original._retry && tokens.refresh) {
    original._retry = true;
    refreshing ??= refreshAccess().finally(() => (refreshing = null));
    const access = await refreshing;
    if (access) {
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    }
  }
  return Promise.reject(error);
});

/** Convierte errores de DRF ({campo: ["msg"]}) en un texto legible. */
export function apiError(err: unknown): string {
  const data = (err as AxiosError)?.response?.data as Record<string, unknown> | undefined;
  if (!data) return "No se pudo conectar con el servidor.";
  if (typeof data.detail === "string") return data.detail;
  return Object.entries(data)
    .map(([k, v]) => `${k === "non_field_errors" ? "" : k + ": "}${Array.isArray(v) ? v.join(" ") : v}`)
    .join(" · ");
}
