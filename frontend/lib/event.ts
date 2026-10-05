// Datos del evento. Ajusta lugar, hora y enlaces cuando estén confirmados.
export const EVENT = {
  name: "Halloween Paradise",
  // Hora del centro de México (UTC-6, sin horario de verano).
  date: new Date("2026-10-31T21:00:00-06:00"),
  dateLabel: "Sábado 31 de octubre · 9:00 PM",
  city: "Martínez de la Torre, Veracruz",
  venue: "Lugar por confirmar",
  mapQuery: "Martínez de la Torre, Veracruz",
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const MESSENGER_URL = process.env.NEXT_PUBLIC_MESSENGER_URL ?? "https://m.me/halloweenparadise";
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://ig.me/m/halloweenparadise";

export function mediaUrl(path?: string | null) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_URL}${path}`;
}

export const money = (v: number | string) =>
  Number(v).toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

export const GENEROS = [
  { value: "H", label: "Hombre" },
  { value: "M", label: "Mujer" },
  { value: "O", label: "Otro" },
  { value: "N", label: "Prefiero no decir" },
];
