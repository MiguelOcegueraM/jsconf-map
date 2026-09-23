import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JSConf México 2026",
    short_name: "JSConf MX",
    description:
      "Mapa del venue, agenda y tus favoritos para JSConf México 2026 en Jardín Americana, Guadalajara.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafafa",
    theme_color: "#f22727",
    lang: "es-MX",
    categories: ["events", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Agenda", url: "/agenda" },
      { name: "Mis favoritos", url: "/favoritos" },
    ],
  };
}
