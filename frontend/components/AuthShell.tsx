import { Navbar } from "./Navbar";
import { PapelPicado } from "./PapelPicado";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-60px)] bg-[radial-gradient(ellipse_at_top,rgba(107,33,168,.35),transparent_60%)]">
        <PapelPicado count={9} />
        <div className="mx-auto max-w-lg px-4 py-10">
          <h1 className="rise font-display text-4xl text-pumpkin sm:text-5xl">{title}</h1>
          {subtitle && <p className="rise rise-1 mt-2 text-white/70">{subtitle}</p>}
          <div className="rise rise-2 mt-8 rounded-2xl border border-white/10 bg-night-2/90 p-6 backdrop-blur">{children}</div>
        </div>
      </main>
    </>
  );
}

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-white/80">
      {children}
    </label>
  );
}
