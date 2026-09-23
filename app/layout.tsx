import type { Metadata, Viewport } from "next";
import { Chango, Righteous, Poppins } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import { RegisterSW } from "@/components/shell/register-sw";
import "./globals.css";

const chango = Chango({ variable: "--font-chango", weight: "400", subsets: ["latin"] });
const righteous = Righteous({ variable: "--font-righteous", weight: "400", subsets: ["latin"] });
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JSConf México 2026",
    template: "%s · JSConf México 2026",
  },
  description:
    "Mapa del venue, agenda y tu selección de charlas para JSConf México 2026 — 29 y 30 de octubre, Jardín Americana, Guadalajara.",
  applicationName: "JSConf MX 2026",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "JSConf MX",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f22727",
  width: "device-width",
  initialScale: 1,
  // La app es una sola columna: el zoom del navegador sólo rompe el layout,
  // y el mapa trae su propio pinch-zoom accesible.
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${chango.variable} ${righteous.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="bg-neutral-50 min-h-full">
        <AppShell>{children}</AppShell>
        <RegisterSW />
      </body>
    </html>
  );
}
