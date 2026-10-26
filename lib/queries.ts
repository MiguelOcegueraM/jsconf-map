import "server-only";
import { fetchAgendaSessions } from "./agenda-api";
import { GENERAL_SESSIONS, STAGES } from "./program";
import type { Session, Stage } from "./types";

export type Agenda = {
  stages: Stage[];
  sessions: Session[];
  /** La API no respondió: sólo hay actividades generales que mostrar. */
  unavailable: boolean;
  /** `generado_en` de jsconf-agenda: cuándo se publicó esta versión. */
  generatedAt: string | null;
};

/**
 * Programa completo = charlas de la API + actividades generales del código.
 * Si la API falla, la app no se cae: muestra registro, comidas y fiestas, y
 * un aviso; el service worker además conserva la última versión que vio
 * cada teléfono.
 */
export async function getAgenda(): Promise<Agenda> {
  let talks: Session[] = [];
  let generatedAt: string | null = null;
  let unavailable = false;

  try {
    ({ sessions: talks, generatedAt } = await fetchAgendaSessions());
  } catch (err) {
    console.error("[agenda]", err instanceof Error ? err.message : "falló la API");
    unavailable = true;
  }

  const sessions = [...GENERAL_SESSIONS, ...talks].sort(
    (a, b) => a.day.localeCompare(b.day) || a.startTime.localeCompare(b.startTime),
  );
  return { stages: STAGES, sessions, unavailable, generatedAt };
}
