"use server";

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import {
  ADMIN_COOKIE,
  COOKIE_OPTIONS,
  createSessionToken,
  passwordMatches,
  verifySessionToken,
} from "./auth";
import { AGENDA_TAG, fetchAgendaSessions } from "./agenda-api";

export type ActionState = { error?: string } | undefined;

export async function login(_: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!passwordMatches(password)) {
    return { error: "Contraseña incorrecta." };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSessionToken(), COOKIE_OPTIONS);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export type SyncState =
  | {
      ok: true;
      total: number;
      byDay: Record<string, number>;
      at: string;
    }
  | { ok: false; error: string }
  | undefined;

/**
 * El botón secreto. Expira la copia cacheada de la API (`updateTag`: sin
 * servir nada viejo) y la vuelve a pedir en el acto, así que lo que reporta
 * es exactamente lo que la gente va a ver al recargar.
 *
 * Una server action es un endpoint POST público aunque la página esté detrás
 * del proxy, así que la sesión se vuelve a verificar aquí.
 */
export async function syncAgenda(): Promise<SyncState> {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(ADMIN_COOKIE)?.value))) {
    return { ok: false, error: "Tu sesión expiró. Vuelve a entrar al back office." };
  }

  updateTag(AGENDA_TAG);
  try {
    const { sessions } = await fetchAgendaSessions();
    const byDay: Record<string, number> = {};
    for (const s of sessions) byDay[s.day] = (byDay[s.day] ?? 0) + 1;
    return { ok: true, total: sessions.length, byDay, at: new Date().toISOString() };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo traer la agenda.",
    };
  }
}
