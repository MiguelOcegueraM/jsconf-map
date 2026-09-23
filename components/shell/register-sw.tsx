"use client";

import { useEffect } from "react";

/**
 * Sólo en producción: en desarrollo el worker se pelearía con el HMR de
 * Turbopack sirviendo chunks viejos desde caché.
 */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Sin service worker la app sigue funcionando; sólo pierde el offline.
      });
    };

    // Registrar después del load deja el ancho de banda libre para la
    // primera pintura.
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
