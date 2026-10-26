import type { MetadataRoute } from "next";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  return {
    name: "JSConf México 2026",
    short_name: "JSConf MX",
    description: t.meta.appDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0f3a",
    theme_color: "#0b0f3a",
    lang: locale === "es" ? "es-MX" : "en",
    categories: ["events", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: t.nav.agenda, url: "/agenda" },
      { name: t.favorites.title, url: "/favoritos" },
      { name: t.nav.translation, url: "/traduccion" },
    ],
  };
}
