import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * PGlite trae un binario WASM y resuelve rutas con `fs`: si el bundler lo
   * empaqueta, esas rutas dejan de existir en runtime. Neon no lo necesita,
   * pero dejarlo declarado no cuesta nada y mantiene el dev local funcionando.
   */
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
