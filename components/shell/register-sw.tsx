"use client";

import { useEffect } from "react";

/**
 * Sólo en producción: en desarrollo el worker se pelearía con el HMR de
 * Turbopack sirviendo chunks viejos desde caché.
 */
export function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      // Un worker que quedó de un `npm start` en este mismo origen seguiría
      // sirviendo chunks viejos de /_next/static/ en dev (los nombres se
      // repiten), así que en desarrollo se da de baja.
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }

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
