import type { Session, SessionType, Stage } from "./types";
import type { Locale, Localized } from "./i18n/config";

export const DAYS = ["2026-10-29", "2026-10-30"] as const;
export type Day = (typeof DAYS)[number];

/**
 * Los ids son los mismos `sala` que devuelve jsconf-agenda, y los nombres los
 * que usa jsconf.mx: Stage A / Stage B / Taller A / Taller B. Antes eran
 * Main Stage, ASYNC Stage, The Sandbox y The Playground; la descripción
 * conserva el apodo para quien lo traiga en la cabeza.
 */
export const STAGES: Stage[] = [
  { id: "stage_a", name: "Stage A", shortName: "Stage A", kind: "main", zoneId: "stage-a", order: 1 },
  { id: "stage_b", name: "Stage B", shortName: "Stage B", kind: "async", zoneId: "stage-b", order: 2 },
  { id: "taller_a", name: "Taller A", shortName: "Taller A", kind: "workshop", zoneId: "taller-a", order: 3 },
  { id: "taller_b", name: "Taller B", shortName: "Taller B", kind: "workshop", zoneId: "taller-b", order: 4 },
];

type GeneralSession = {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
  type: SessionType;
  title: Localized;
  description?: Localized;
  locationNote?: Localized;
};

const LOBBY: Localized = { es: "Registro & Lobby", en: "Registration & Lobby" };
const NPM: Localized = { es: "NPM Zone", en: "NPM Zone" };
const SOUTH: Localized = { es: "Jardín sur", en: "South garden" };
const NORTH_NPM: Localized = { es: "NPM Zone · jardín norte", en: "NPM Zone · north garden" };
const COFFEE: Localized = { es: "Coffee break", en: "Coffee break" };
const LUNCH: Localized = { es: "Comida", en: "Lunch" };

/**
 * Sólo actividades generales: la API de jsconf-agenda no las trae. Las
 * charlas, keynotes y talleres llegan de ahí (lib/agenda-api.ts) — aquí no
 * se inventa ninguna.
 *
 * Los horarios caen en los huecos que deja el programa oficial (ningún
 * escenario tiene sesión): 12:00–12:30, 13:30–15:00 y 16:30–16:50. El
 * registro desde las 9:00 lo publica jsconf.mx. Si cambian, se editan aquí.
 */
const GENERAL: GeneralSession[] = [
  // ─────────────────────────── DÍA 1 ───────────────────────────
  {
    id: "d1-registro", day: "2026-10-29", startTime: "09:00", endTime: "10:00", type: "registration",
    title: { es: "Registro y bienvenida", en: "Registration & welcome" },
    locationNote: LOBBY,
    description: {
      es: "Recoge tu gafete en la esquina sureste del jardín sur, junto al acceso.",
      en: "Pick up your badge in the south-east corner of the south garden, by the entrance.",
    },
  },
  { id: "d1-coffee-1", day: "2026-10-29", startTime: "12:00", endTime: "12:30", type: "coffee", title: COFFEE, locationNote: NPM },
  { id: "d1-lunch", day: "2026-10-29", startTime: "13:30", endTime: "15:00", type: "lunch", title: LUNCH, locationNote: SOUTH },
  { id: "d1-coffee-2", day: "2026-10-29", startTime: "16:30", endTime: "16:50", type: "coffee", title: COFFEE, locationNote: NPM },
  {
    id: "d1-happy", day: "2026-10-29", startTime: "18:00", endTime: "20:00", type: "party",
    title: { es: "Happy Hour", en: "Happy Hour" },
    locationNote: NORTH_NPM,
    description: {
      es: "Cerveza, tacos y networking bajo las lonas.",
      en: "Beer, tacos and networking under the canopies.",
    },
  },

  // ─────────────────────────── DÍA 2 ───────────────────────────
  {
    id: "d2-registro", day: "2026-10-30", startTime: "09:00", endTime: "10:00", type: "registration",
    title: { es: "Registro", en: "Registration" },
    locationNote: LOBBY,
    description: {
      es: "Si ya tienes gafete del día 1, pasa directo.",
      en: "Already have your day-1 badge? Walk straight in.",
    },
  },
  { id: "d2-coffee-1", day: "2026-10-30", startTime: "12:00", endTime: "12:30", type: "coffee", title: COFFEE, locationNote: NPM },
  { id: "d2-lunch", day: "2026-10-30", startTime: "13:30", endTime: "15:00", type: "lunch", title: LUNCH, locationNote: SOUTH },
  { id: "d2-coffee-2", day: "2026-10-30", startTime: "16:30", endTime: "16:50", type: "coffee", title: COFFEE, locationNote: NPM },
  {
    id: "d2-party", day: "2026-10-30", startTime: "18:00", endTime: "21:00", type: "party",
    title: { es: "Closing Party", en: "Closing Party" },
    locationNote: NORTH_NPM,
  },
];

/** Las actividades generales ya en el idioma de quien mira. */
export function generalSessions(locale: Locale): Session[] {
  return GENERAL.map((s) => ({
    id: s.id,
    day: s.day,
    startTime: s.startTime,
    endTime: s.endTime,
    stageId: null,
    type: s.type,
    title: s.title[locale],
    description: s.description?.[locale] ?? null,
    locationNote: s.locationNote?.[locale] ?? null,
    speakerName: null,
    speakerRole: null,
    language: null,
    sponsor: null,
    speakers: [],
  }));
}
