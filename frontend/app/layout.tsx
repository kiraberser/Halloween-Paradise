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

export const metadata: Metadata = {
  title: "Halloween Paradise — 31 de octubre · Martínez de la Torre",
  description:
    "La fiesta de Halloween más grande de Martínez de la Torre, Veracruz. 31 de octubre. Regístrate y sube tu foto para la decoración de la fiesta.",
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
