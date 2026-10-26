"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { ReminderSession } from "@/app/api/sesiones/route";
import { EVENT_OFFSET } from "@/lib/agenda";
import { useFavorites } from "./use-favorites";
import { useI18n } from "@/lib/i18n/client";

/**
 * Recordatorios locales: 10 minutos antes de cada favorito, una notificación
 * del sistema. Todo vive en el dispositivo —sin cuentas ni servidor de push—
 * así que el aviso sale mientras la app (o la PWA instalada) siga viva en
 * segundo plano. Para un aviso garantizado con la app cerrada está el
 * "Añadir al calendario", cuyo .ics trae su propia alarma.
 */

const KEY = "jsconf-mx-2026:reminders";
const FIRED_KEY = "jsconf-mx-2026:reminders-fired";
const CACHE_KEY = "jsconf-mx-2026:reminder-sessions";
const EVENT = "jsconf-reminders-change";
export const REMINDER_LEAD_MIN = 10;

export type ReminderState = "unsupported" | "denied" | "off" | "on";

function supported() {
  return typeof window !== "undefined" && "Notification" in window;
}

function readState(): ReminderState {
  if (!supported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  let enabled = false;
  try {
    enabled = window.localStorage.getItem(KEY) === "on";
  } catch {}
  return enabled && Notification.permission === "granted" ? "on" : "off";
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function setEnabled(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useReminders() {
  const state = useSyncExternalStore(subscribe, readState, () => "off" as const);
  const { t } = useI18n();

  const enable = useCallback(async () => {
    if (!supported()) return;
    const permission = await Notification.requestPermission();
    setEnabled(permission === "granted");
    if (permission === "granted") {
      await notify(t.reminders.onTitle, {
        body: t.reminders.onBody(REMINDER_LEAD_MIN),
        tag: "jsconf-reminders-on",
      });
    }
  }, [t]);

  const disable = useCallback(() => setEnabled(false), []);

  return { state, enable, disable };
}

/**
 * En Android Chrome `new Notification()` lanza error: ahí sólo vale la del
 * service worker. En escritorio (y en dev, sin worker) sirve la directa.
 */
async function notify(title: string, options: NotificationOptions & { data?: unknown }) {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, { icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", ...options });
      return;
    }
  } catch {}
  try {
    new Notification(title, { icon: "/icons/icon-192.png", ...options });
  } catch {}
}

function readFired(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(FIRED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function markFired(id: string) {
  try {
    window.localStorage.setItem(FIRED_KEY, JSON.stringify([...readFired(), id]));
  } catch {}
}

async function loadSessions(): Promise<ReminderSession[]> {
  try {
    const res = await fetch("/api/sesiones");
    if (!res.ok) throw new Error();
    const data: ReminderSession[] = await res.json();
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
    return data;
  } catch {
    try {
      return JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? "[]");
    } catch {
      return [];
    }
  }
}

/** Se monta una vez en el shell: programa los avisos de los favoritos. */
export function ReminderScheduler() {
  const { state } = useReminders();
  const { ids } = useFavorites();
  const { t } = useI18n();

  useEffect(() => {
    if (state !== "on" || ids.length === 0) return;
    let cancelled = false;
    const timers: number[] = [];

    loadSessions().then((sessions) => {
      if (cancelled) return;
      const fired = new Set(readFired());

      for (const s of sessions) {
        if (!ids.includes(s.id) || fired.has(s.id)) continue;
        const start = new Date(`${s.day}T${s.startTime}:00${EVENT_OFFSET}`).getTime();
        const at = start - REMINDER_LEAD_MIN * 60_000;
        const delay = at - Date.now();
        // Ya empezó: no tiene caso avisar. Si la app se abre dentro de la
        // ventana de 10 minutos, avisa en ese momento.
        if (Date.now() >= start) continue;
        // setTimeout se desborda arriba de ~24.8 días.
        if (delay > 2_000_000_000) continue;

        timers.push(
          window.setTimeout(() => {
            markFired(s.id);
            notify(t.reminders.soon(REMINDER_LEAD_MIN, s.title), {
              body: `${s.startTime} · ${s.where}`,
              tag: `jsconf-${s.id}`,
              data: { url: `/agenda?dia=${s.day}#${s.id}` },
            });
          }, Math.max(delay, 0)),
        );
      }
    });

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [state, ids, t]);

  return null;
}
