"use client";

import { useEffect } from "react";

/**
 * Mantiene la pantalla encendida mientras `active`. Si se apaga sola, iOS
 * suspende el audio web; el lock se pierde al cambiar de pestaña, así que se
 * vuelve a pedir al regresar. Donde no existe (Safari < 16.4) no hace nada.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const next = await navigator.wakeLock.request("screen");
        if (cancelled) next.release();
        else lock = next;
      } catch {}
    };

    request();
    document.addEventListener("visibilitychange", request);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", request);
      lock?.release().catch(() => {});
    };
  }, [active]);
}
