"use server";

import "server-only";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, schema } from "./db";
import {
  ADMIN_COOKIE,
  COOKIE_OPTIONS,
  createSessionToken,
  passwordMatches,
} from "./auth";
import { DAYS } from "./seed-data";

const TYPES = [
  "keynote",
  "talk",
  "workshop",
  "lightning",
  "registration",
  "coffee",
  "lunch",
  "party",
  "closing",
] as const;

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const sessionSchema = z
  .object({
    id: z.string().min(1).optional(),
    day: z.enum(DAYS),
    startTime: z.string().regex(HHMM, "Usa el formato HH:mm"),
    endTime: z.string().regex(HHMM, "Usa el formato HH:mm"),
    stageId: z.string().transform((v) => (v === "" || v === "none" ? null : v)),
    type: z.enum(TYPES),
    title: z.string().trim().max(200).optional(),
    speakerName: z.string().trim().max(120).optional(),
    speakerRole: z.string().trim().max(160).optional(),
    track: z.string().trim().max(60).optional(),
    description: z.string().trim().max(1000).optional(),
    locationNote: z.string().trim().max(120).optional(),
  })
  .refine((v) => v.endTime > v.startTime, {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["endTime"],
  })
  .refine((v) => v.title || v.speakerName, {
    message: "Pon al menos un título o un speaker",
    path: ["title"],
  });

/**
 * Al terminar una acción de formulario, React resetea los campos no
 * controlados a su `defaultValue`. Si sólo devolviéramos el error, el
 * organizador perdería todo lo que escribió, así que la acción regresa
 * también los valores enviados para re-sembrar el formulario.
 */
export type ActionState =
  | { error?: string; values?: Record<string, string> }
  | undefined;

/** Los campos vacíos del formulario se guardan como NULL, no como "". */
function blankToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

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

export async function saveSession(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const submitted = Object.fromEntries(formData) as Record<string, string>;
  const parsed = sessionSchema.safeParse(submitted);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos.",
      values: submitted,
    };
  }

  const { id, title, speakerName, speakerRole, track, description, locationNote, ...rest } =
    parsed.data;

  const values = {
    ...rest,
    title: blankToNull(title),
    speakerName: blankToNull(speakerName),
    speakerRole: blankToNull(speakerRole),
    track: blankToNull(track),
    description: blankToNull(description),
    locationNote: blankToNull(locationNote),
  };

  const db = await getDb();
  if (id) {
    // El id nunca se regenera al editar: los favoritos de los asistentes
    // viven en sus teléfonos y apuntan justo a este id.
    await db.update(schema.sessions).set(values).where(eq(schema.sessions.id, id));
  } else {
    await db.insert(schema.sessions).values({ id: createId(), ...values });
  }

  redirect("/admin");
}

export async function deleteSession(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const db = await getDb();
  await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
  redirect("/admin");
}
