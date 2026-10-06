import Link from "next/link";
import { Camera, Music, PartyPopper, Shirt, Sparkles, Trophy } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { Navbar } from "@/components/Navbar";
import { PapelPicado } from "@/components/PapelPicado";
import { TicketSection } from "@/components/TicketSection";
import { Calavera } from "@/components/spooky/Calavera";
import { Fantasma } from "@/components/spooky/Fantasma";
import { GatoNegro } from "@/components/spooky/GatoNegro";
import { MovimientoProvider } from "@/components/spooky/movimiento";
import { Murcielagos } from "@/components/spooky/Murcielagos";
import { Petalos } from "@/components/spooky/Petalos";
import { EVENT, INSTAGRAM_URL, MESSENGER_URL } from "@/lib/event";

const INCLUYE = [
  { icon: Music, title: "DJ toda la noche", text: "Reggaetón, electrónica y los clásicos que no pueden faltar." },
  { icon: Trophy, title: "Concurso de disfraces", text: "Premios para el disfraz más terrorífico, creativo y en pareja." },
  { icon: Sparkles, title: "Show de luces y humo", text: "Ambientación de panteón embrujado de principio a fin." },
  { icon: Camera, title: "Photo spot", text: "Escenografía para tus fotos y decoración con las fotos de los invitados." },
];

const FAQ = [
  { q: "¿Tengo que registrarme?", a: "Sí. Todos los asistentes deben registrarse en la página, incluso si pagan en la puerta. En la entrada te buscamos por tu nombre." },
  { q: "¿Cómo compro la preventa?", a: "Regístrate, da clic en “Comprar preventa” y escríbenos por Messenger o Instagram con tu correo registrado. Te damos los datos de pago y te apartamos tu lugar." },
  { q: "¿Cuánto pagan las mujeres?", a: "Preventa $50. En puerta, $80 antes de las 11:00 PM y $100 después. Todas las que lleguen antes de las 11:00 PM reciben un drink de bienvenida con vaso." },
  { q: "¿Es obligatorio ir disfrazado?", a: "No, pero conviene: los hombres que pagan en puerta disfrazados pagan $100 en lugar de $150, y todos entran al concurso de disfraces." },
  { q: "¿Qué cuenta como disfraz?", a: "Disfraz completo o maquillaje de catrina/catrín. Unas orejitas o un accesorio no cuentan. El staff de la entrada tiene la última palabra." },
  { q: "¿Para qué es mi foto?", a: "Si subes tu foto en tu perfil, la imprimimos y la colocamos como parte de la decoración de la fiesta." },
  { q: "¿Hay edad mínima?", a: "Evento para mayores de edad. Se pedirá identificación en la entrada." },
];

export default function Home() {
  return (
    <MovimientoProvider>
      <Navbar />
      <main className="overflow-x-hidden">
        {/* HERO */}
        <section className="relative isolate min-h-[92vh] overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(107,33,168,.55),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(255,107,0,.18),transparent_50%)]" />
          <div className="moon absolute -right-24 top-16 -z-10 h-72 w-72 rounded-full opacity-80 sm:right-[8%] sm:h-96 sm:w-96" />
          <Murcielagos />
          <Petalos />
          <PapelPicado className="pt-1" />

          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-[1.3fr_1fr] md:pt-16">
            <div>
              <p className="rise rise-1 inline-flex items-center gap-2 rounded-full border border-pumpkin/40 bg-pumpkin/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-pumpkin-soft">
                <PartyPopper size={14} /> {EVENT.city}
              </p>
              <h1 className="rise rise-2 mt-5 font-display text-[3.4rem] leading-[0.9] sm:text-7xl lg:text-8xl">
                <span className="glow-pumpkin text-pumpkin">Halloween</span>
                <br />
                <span className="text-bone">Paradise</span>
              </h1>
              <p className="rise rise-3 mt-6 max-w-lg text-lg text-white/75">
                La noche más oscura del año se vive en Martínez. Música, disfraces, decoración de Día de Muertos y un paraíso
                lleno de calaveras. <b className="text-bone">{EVENT.dateLabel}.</b>
              </p>
              <p className="rise rise-3 mt-4 inline-flex items-center gap-2 rounded-xl border border-witch-glow/50 bg-witch/25 px-4 py-2 text-sm text-bone">
                <Sparkles size={16} className="shrink-0 text-pumpkin" />
                <span><b>Preventa mujeres $50</b> · drink de bienvenida si llegas antes de las 11 PM</span>
              </p>
              <div className="rise rise-4 mt-8 flex flex-wrap items-center gap-3">
                <Link href="/registro" className="btn-primary text-lg">Regístrate</Link>
                <a href="#boletos" className="btn-ghost">Ver precios</a>
              </div>
              <div className="rise rise-4 mt-10">
                <Countdown />
              </div>
            </div>

            <div className="relative mx-auto hidden aspect-square w-full max-w-sm md:block" aria-hidden>
              <div className="animate-float absolute inset-0 grid place-items-center">
                <Pumpkin />
              </div>
            </div>
          </div>
        </section>

        {/* QUÉ INCLUYE */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <SectionTitle kicker="La noche" title="Lo que te espera" adorno={<Calavera size={42} />} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INCLUYE.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-night-2 p-5 transition hover:border-pumpkin/50">
                <Icon className="text-witch-glow" />
                <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-white/65">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-pumpkin/40 p-5 text-white/80">
            <Shirt className="shrink-0 text-pumpkin" />
            <p><b className="text-bone">Dress code:</b> disfraz completo o maquillaje de catrina/catrín. Venir disfrazado te sale más barato y entras al concurso.</p>
          </div>
        </section>

        {/* BOLETOS */}
        <section id="boletos" className="relative scroll-mt-20 bg-gradient-to-b from-night via-[#140b1f] to-night py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle kicker="Boletos" title="Aparta tu lugar" />
            <p className="mt-3 max-w-xl text-white/65">
              Compra tu preventa y paga menos. En puerta, llegar temprano (mujeres) o disfrazado (hombres) también te ahorra. El cupo es limitado.
            </p>
            <div className="relative mt-24 sm:mt-16">
              {/* El gato se sienta sobre el borde del primer recuadro (base del dibujo ≈ borde) */}
              <GatoNegro className="absolute -top-[96px] right-3 z-10 w-[96px] sm:right-10" />
              <TicketSection />
            </div>
          </div>
        </section>

        {/* DECORACIÓN */}
        <section id="decoracion" className="scroll-mt-20">
          <PapelPicado count={11} />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="grid grid-cols-3 gap-3">
                {["#ff6b00", "#9333ea", "#fafafa", "#6b21a8", "#ff9a3d", "#ff6b00"].map((c, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-lg border-4 bg-night-2 p-1"
                    style={{ borderColor: c, transform: `rotate(${(i % 2 ? 1 : -1) * (2 + (i % 3))}deg)` }}
                  >
                    <div className="grid h-full place-items-center rounded bg-gradient-to-b from-white/5 to-white/0 text-3xl">
                      {["💀", "🕯️", "🌼", "🎃", "👻", "🦇"][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <SectionTitle kicker="Decoración" title="Tu foto en la fiesta" adorno={<Calavera size={40} retraso={0.1} />} />
              <p className="mt-4 text-white/75">
                Regístrate y sube tu foto en tu perfil. La imprimiremos y será parte de la decoración
                de la fiesta. Búscate entre las velas y el cempasúchil.
              </p>
              <Link href="/registro" className="btn-primary mt-6">Registrarme y subir foto</Link>
            </div>
          </div>
        </section>

        {/* UBICACIÓN */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <SectionTitle kicker="Ubicación" title={EVENT.venue} />
          <p className="mt-2 text-white/65">{EVENT.city} · {EVENT.dateLabel}</p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <iframe
              title="Mapa del evento"
              src={`https://www.google.com/maps?q=${encodeURIComponent(EVENT.mapQuery)}&output=embed`}
              className="h-72 w-full grayscale invert-[.9] hue-rotate-180"
              loading="lazy"
            />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-24">
          <SectionTitle kicker="Dudas" title="Preguntas frecuentes" adorno={<Calavera size={40} />} />
          <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10 bg-night-2">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {q}
                  <span className="text-pumpkin transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-white/70">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="relative overflow-hidden border-t border-white/5 bg-witch/20 py-16 text-center">
          <h2 className="font-display text-4xl sm:text-5xl">¿Te atreves?</h2>
          <p className="mt-2 text-white/70">Regístrate, ven disfrazado y llega antes de las 11. Nos vemos el 31 de octubre.</p>
          <Link href="/registro" className="btn-primary mt-6 text-lg">Regístrate</Link>
        </section>
        <Fantasma />
      </main>

      <footer className="border-t border-white/5 px-4 py-8 text-center text-sm text-white/50">
        <p className="font-display text-lg text-pumpkin">Halloween Paradise</p>
        <p className="mt-1">{EVENT.city} · 31 de octubre de 2026</p>
        <p className="mt-3 flex justify-center gap-4">
          <a href={MESSENGER_URL} target="_blank" rel="noopener noreferrer" className="hover:text-bone">Messenger</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-bone">Instagram</a>
        </p>
      </footer>
    </MovimientoProvider>
  );
}

function SectionTitle({ kicker, title, adorno }: { kicker: string; title: string; adorno?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-witch-glow">{kicker}</p>
      <h2 className="mt-2 flex items-end gap-3 font-display text-4xl text-bone sm:text-5xl">
        {title}
        {adorno}
      </h2>
    </div>
  );
}

function Pumpkin() {
  return (
    <svg viewBox="0 0 200 200" className="w-full drop-shadow-[0_0_60px_rgba(255,107,0,.45)]">
      <path d="M100 40 q4 -18 18 -24" stroke="#4d7c0f" strokeWidth="7" fill="none" strokeLinecap="round" />
      <ellipse cx="100" cy="115" rx="78" ry="64" fill="#ff6b00" />
      <ellipse cx="70" cy="115" rx="34" ry="62" fill="#ff7d1f" />
      <ellipse cx="130" cy="115" rx="34" ry="62" fill="#ff7d1f" />
      <ellipse cx="100" cy="115" rx="26" ry="64" fill="#ff8a2e" />
      {/* Cortes: fondo oscuro + luz de vela que titila encima */}
      <g fill="#2a1100">
        <path d="M58 95 l22 -6 -6 22z" />
        <path d="M142 95 l-22 -6 6 22z" />
        <path d="M100 112 l-8 12 h16z" />
        <path d="M52 132 q48 36 96 0 l-10 4 -6 10 -8 -8 -10 10 -8 -10 -10 10 -8 -10 -8 8 -6 -10z" />
      </g>
      <g className="vela" fill="#ffc14d" style={{ filter: "drop-shadow(0 0 6px #ffb347)" }}>
        <path d="M60 96 l17 -4.5 -4.5 16.5z" />
        <path d="M140 96 l-17 -4.5 4.5 16.5z" />
        <path d="M100 115 l-5.5 8 h11z" />
        <path d="M58 134 q42 30 84 0 l-8 3 -6 8 -7 -6 -9 8 -8 -8 -9 8 -7 -8 -7 6 -6 -8z" />
      </g>
    </svg>
  );
}
