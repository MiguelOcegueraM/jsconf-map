import type { Session, SessionType, Stage } from "./types";

export const DAYS = ["2026-10-29", "2026-10-30"] as const;
export type Day = (typeof DAYS)[number];

export const DAY_LABELS: Record<Day, { short: string; long: string; n: string }> = {
  "2026-10-29": { short: "29 oct", long: "Jueves 29 de octubre", n: "Día 1" },
  "2026-10-30": { short: "30 oct", long: "Viernes 30 de octubre", n: "Día 2" },
};

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
  stageId: null;
  type: SessionType;
  title: string;
  description?: string;
  locationNote?: string;
};

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
    id: "d1-registro", day: "2026-10-29", startTime: "09:00", endTime: "10:00",
    stageId: null, type: "registration", title: "Registro y bienvenida",
    locationNote: "Registro & Lobby",
    description: "Recoge tu gafete en el stand de café de la esquina sureste.",
  },
  { id: "d1-coffee-1", day: "2026-10-29", startTime: "12:00", endTime: "12:30", stageId: null, type: "coffee", title: "Coffee break", locationNote: "NPM Zone" },
  { id: "d1-lunch", day: "2026-10-29", startTime: "13:30", endTime: "15:00", stageId: null, type: "lunch", title: "Comida", locationNote: "Jardín sur" },
  { id: "d1-coffee-2", day: "2026-10-29", startTime: "16:30", endTime: "16:50", stageId: null, type: "coffee", title: "Coffee break", locationNote: "NPM Zone" },
  { id: "d1-happy", day: "2026-10-29", startTime: "18:00", endTime: "20:00", stageId: null, type: "party", title: "Happy Hour", locationNote: "NPM Zone · jardín norte", description: "Cerveza, tacos y networking bajo las lonas." },

  // ─────────────────────────── DÍA 2 ───────────────────────────
  {
    id: "d2-registro", day: "2026-10-30", startTime: "09:00", endTime: "10:00",
    stageId: null, type: "registration", title: "Registro",
    locationNote: "Registro & Lobby",
    description: "Si ya tienes gafete del día 1, pasa directo.",
  },
  { id: "d2-coffee-1", day: "2026-10-30", startTime: "12:00", endTime: "12:30", stageId: null, type: "coffee", title: "Coffee break", locationNote: "NPM Zone" },
  { id: "d2-lunch", day: "2026-10-30", startTime: "13:30", endTime: "15:00", stageId: null, type: "lunch", title: "Comida", locationNote: "Jardín sur" },
  { id: "d2-coffee-2", day: "2026-10-30", startTime: "16:30", endTime: "16:50", stageId: null, type: "coffee", title: "Coffee break", locationNote: "NPM Zone" },
  { id: "d2-party", day: "2026-10-30", startTime: "18:00", endTime: "21:00", stageId: null, type: "party", title: "Closing Party", locationNote: "NPM Zone · jardín norte" },
];

export const GENERAL_SESSIONS: Session[] = GENERAL.map((s) => ({
  ...s,
  description: s.description ?? null,
  locationNote: s.locationNote ?? null,
  speakerName: null,
  speakerRole: null,
  language: null,
  sponsor: null,
  speakers: [],
}));
