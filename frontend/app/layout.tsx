import type { Metadata } from "next";
import { Bricolage_Grotesque, Rubik_Wet_Paint } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { BuyTicketProvider } from "@/components/BuyTicket";
import "./globals.css";

const wetPaint = Rubik_Wet_Paint({
  variable: "--font-wet-paint",
  weight: "400",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const TITULO = "Halloween Paradise — 31 de octubre · Martínez de la Torre";
const DESCRIPCION =
  "La fiesta de Halloween más grande de Martínez de la Torre, Veracruz. 31 de octubre. Preventa disponible; regístrate y sube tu foto para la decoración de la fiesta.";

// URL pública del sitio para que las imágenes de vista previa tengan dirección absoluta.
// En Vercel se usa el dominio de producción automáticamente; se puede fijar con NEXT_PUBLIC_SITE_URL.
const SITIO =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: TITULO,
  description: DESCRIPCION,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Halloween Paradise",
    title: TITULO,
    description: DESCRIPCION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRIPCION,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body className={`${wetPaint.variable} ${bricolage.variable} grain antialiased`}>
        <AuthProvider>
          <BuyTicketProvider>{children}</BuyTicketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
