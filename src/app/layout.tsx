import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SalesMind AI - Die KI-Vertriebsakademie für DACH",
  description: "Die erste KI-Sales-Trainingsplattform, die deutsch denkt. Trainiere mit realistischen KI-Kunden und werde zum Top-Verkäufer.",
  keywords: ["Sales Training", "Vertrieb", "KI", "B2B", "DACH", "Verkaufstraining"],
  authors: [{ name: "SalesMind AI" }],
  openGraph: {
    title: "SalesMind AI - Die KI-Vertriebsakademie für DACH",
    description: "Die erste KI-Sales-Trainingsplattform, die deutsch denkt.",
    type: "website",
    locale: "de_DE"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
