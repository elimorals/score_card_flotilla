import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Transit CDMX - Movilidad Inteligente",
  description:
    "Visualiza, planifica y explora el transporte publico de la Ciudad de Mexico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <NavBar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
