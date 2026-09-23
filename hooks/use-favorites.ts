"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "jsconf-mx-2026:favorites";
const EVENT = "jsconf-favorites-change";

/**
 * Favoritos del asistente. Viven sólo en su dispositivo — sin login, sin
 * servidor — y son un puñado de IDs, así que localStorage basta.
 *
 * `useSyncExternalStore` mantiene sincronizadas todas las celdas, el contador
 * del menú y otras pestañas abiertas, y evita el parpadeo de hidratación
 * devolviendo un snapshot vacío en el servidor.
 */

let snapshot: string[] = [];
let raw = "";

function read(): string[] {
  if (typeof window === "undefined") return snapshot;
  let next = "";
  try {
    next = window.localStorage.getItem(KEY) ?? "";
  } catch {
    // Safari en modo privado, o cookies de sitio bloqueadas.
    return snapshot;
  }
  // Cacheamos por string crudo: getSnapshot debe devolver la misma referencia
  // mientras no cambie nada, o React entra en bucle de renders.
  if (next !== raw) {
    raw = next;
    try {
      const parsed: unknown = next ? JSON.parse(next) : [];
      snapshot = Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
    } catch {
      snapshot = [];
    }
  }
  return snapshot;
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Si no se puede persistir, al menos actualizamos la sesión en curso.
  }
  raw = JSON.stringify(ids);
  snapshot = ids;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const serverSnapshot: string[] = [];

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, read, () => serverSnapshot);

  const toggle = useCallback((id: string) => {
    const current = read();
    write(current.includes(id) ? current.filter((v) => v !== id) : [...current, id]);
  }, []);

  const add = useCallback((id: string) => {
    const current = read();
    if (!current.includes(id)) write([...current, id]);
  }, []);

  const remove = useCallback((id: string) => {
    const current = read();
    if (current.includes(id)) write(current.filter((v) => v !== id));
  }, []);

  const clear = useCallback(() => write([]), []);

  return { ids, has: (id: string) => ids.includes(id), toggle, add, remove, clear };
}

/** Vibración corta al cruzar el umbral del swipe. No todos los equipos la soportan. */
export function haptic(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* noop */
  }
}
