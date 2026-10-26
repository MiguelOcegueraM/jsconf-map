"use client";

import { useSyncExternalStore } from "react";
import { eventStamp } from "@/lib/agenda";

/**
 * La hora actual del evento como "YYYY-MM-DD HH:mm" (Guadalajara), que se
 * refresca cada 30 s para que las charlas terminadas salgan solas de la
 * agenda. En el servidor —y durante la hidratación— devuelve null: el HTML
 * trae la agenda completa y el cliente la recorta, sin desajustes.
 *
 * `?ahora=2026-10-30T11:15` fija la hora para probar cómo se ve la app en
 * pleno evento.
 */

const TICK_MS = 30_000;
let current: string | null = null;

function compute() {
  const override = new URLSearchParams(window.location.search).get("ahora");
  if (override && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(override)) {
    return override.replace("T", " ");
  }
  return eventStamp(new Date());
}

function subscribe(onChange: () => void) {
  const update = () => {
    const next = compute();
    if (next !== current) {
      current = next;
      onChange();
    }
  };
  update();
  const id = window.setInterval(update, TICK_MS);
  // Al volver a la pestaña (teléfono en el bolsillo) se recalcula al momento.
  document.addEventListener("visibilitychange", update);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", update);
  };
}

function getSnapshot() {
  return current ?? (current = compute());
}

export function useEventNow(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
