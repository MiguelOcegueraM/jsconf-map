import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Para trabajar en remoto contra el dev server a través de un túnel rápido
   * de Cloudflare (`cloudflared tunnel --url ...`). Solo aplica en `next dev`.
   */
  allowedDevOrigins: ["*.trycloudflare.com"],
  /**
   * Fotos de ponentes: las sirve el blob storage de jsconf-agenda. Pasan por
   * el optimizador para llegar a 2x del tamaño real en vez del original.
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/ponentes/**",
      },
    ],
  },
};

export default nextConfig;
