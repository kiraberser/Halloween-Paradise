import { ImageResponse } from "next/og";
import { EVENT } from "@/lib/event";

// Vista previa al compartir el link (WhatsApp, Facebook, Instagram, X…). Inspirada en el hero.
export const alt = "Halloween Paradise · 31 de octubre · Martínez de la Torre, Veracruz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORES = ["#ff6b00", "#9333ea", "#fafafa", "#ff9a3d", "#6b21a8"];

/** Descarga de Google Fonts solo las letras usadas (TTF, que es lo que acepta ImageResponse). */
async function fuenteGoogle(familia: string, texto: string, peso = 400) {
  const url = `https://fonts.googleapis.com/css2?family=${familia.replace(/ /g, "+")}:wght@${peso}&text=${encodeURIComponent(texto)}`;
  const css = await (await fetch(url)).text();
  const archivo = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!archivo) throw new Error(`No se pudo cargar la fuente ${familia}`);
  return (await fetch(archivo)).arrayBuffer();
}

const TITULO = "HalloweenParadise";
const PROMO = "¡Preventa disponible! · Drink de bienvenida para ellas";
// La etiqueta de la ciudad se muestra en mayúsculas: hay que pedir también esas letras.
const TEXTOS = [EVENT.city, EVENT.city.toUpperCase(), EVENT.dateLabel, PROMO].join(" ");

export default async function Image() {
  const [wetPaint, bricolage, bricolageBold] = await Promise.all([
    fuenteGoogle("Rubik Wet Paint", TITULO),
    fuenteGoogle("Bricolage Grotesque", TEXTOS, 400),
    fuenteGoogle("Bricolage Grotesque", TEXTOS, 700),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0b0b0f",
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(107,33,168,.75), transparent 62%), radial-gradient(ellipse at 0% 100%, rgba(255,107,0,.25), transparent 55%)",
          fontFamily: "Bricolage",
          color: "#fafafa",
        }}
      >
        {/* Papel picado */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 18px" }}>
          {Array.from({ length: 11 }).map((_, i) => (
            <svg key={i} width="92" height="104" viewBox="0 0 60 70">
              <path
                d="M0 6 H60 V60 L55 66 L50 60 L45 66 L40 60 L35 66 L30 60 L25 66 L20 60 L15 66 L10 60 L5 66 L0 60 Z"
                fill={COLORES[i % COLORES.length]}
              />
              {i % 2 === 0 ? (
                <g fill="#0b0b0f">
                  <ellipse cx="30" cy="30" rx="11" ry="10" />
                  <rect x="24" y="36" width="12" height="7" rx="2" />
                  <circle cx="26" cy="29" r="3" fill={COLORES[i % COLORES.length]} />
                  <circle cx="34" cy="29" r="3" fill={COLORES[i % COLORES.length]} />
                </g>
              ) : (
                <g fill="#0b0b0f">
                  {Array.from({ length: 8 }).map((__, p) => (
                    <ellipse key={p} cx="30" cy="22" rx="3.2" ry="7" transform={`rotate(${p * 45} 30 31)`} />
                  ))}
                  <circle cx="30" cy="31" r="3.5" fill={COLORES[i % COLORES.length]} />
                </g>
              )}
            </svg>
          ))}
        </div>

        {/* Luna */}
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 120,
            width: 400,
            height: 400,
            borderRadius: 9999,
            backgroundImage: "radial-gradient(circle at 35% 35%, #fff7e6 0%, #ffd29a 35%, #ff9a3d 60%, transparent 72%)",
            opacity: 0.85,
          }}
        />

        {/* Calabaza con luz de vela */}
        <svg style={{ position: "absolute", right: 120, top: 210 }} width="330" height="330" viewBox="0 0 200 200">
          <path d="M100 40 q4 -18 18 -24" stroke="#4d7c0f" strokeWidth="7" fill="none" strokeLinecap="round" />
          <ellipse cx="100" cy="115" rx="78" ry="64" fill="#ff6b00" />
          <ellipse cx="70" cy="115" rx="34" ry="62" fill="#ff7d1f" />
          <ellipse cx="130" cy="115" rx="34" ry="62" fill="#ff7d1f" />
          <ellipse cx="100" cy="115" rx="26" ry="64" fill="#ff8a2e" />
          <g fill="#ffc14d">
            <path d="M58 95 l22 -6 -6 22z" />
            <path d="M142 95 l-22 -6 6 22z" />
            <path d="M100 112 l-8 12 h16z" />
            <path d="M52 132 q48 36 96 0 l-10 4 -6 10 -8 -8 -10 10 -8 -10 -10 10 -8 -10 -8 8 -6 -10z" />
          </g>
        </svg>

        {/* Texto */}
        <div style={{ display: "flex", flexDirection: "column", padding: "118px 0 0 72px", width: 800 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              border: "2px solid rgba(255,107,0,.5)",
              backgroundColor: "rgba(255,107,0,.12)",
              color: "#ff9a3d",
              borderRadius: 9999,
              padding: "8px 20px",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            {EVENT.city}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 22, fontFamily: "WetPaint", lineHeight: 0.9 }}>
            <span style={{ fontSize: 124, color: "#ff6b00", textShadow: "0 0 28px rgba(255,107,0,.6)" }}>Halloween</span>
            <span style={{ fontSize: 124, color: "#fafafa" }}>Paradise</span>
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 34, fontWeight: 700 }}>{EVENT.dateLabel}</div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 20,
              border: "2px solid rgba(147,51,234,.6)",
              backgroundColor: "rgba(107,33,168,.35)",
              borderRadius: 18,
              padding: "12px 22px",
              fontSize: 24,
            }}
          >
            {PROMO}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "WetPaint", data: wetPaint, weight: 400, style: "normal" },
        { name: "Bricolage", data: bricolage, weight: 400, style: "normal" },
        { name: "Bricolage", data: bricolageBold, weight: 700, style: "normal" },
      ],
    },
  );
}
