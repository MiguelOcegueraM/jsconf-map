import type { Session, SessionType, Stage } from "./db/schema";
import { DAYS, type Day } from "./seed-data";

/** Actividades generales: ocupan todo el ancho y no pertenecen a un escenario. */
const GENERAL: SessionType[] = ["registration", "coffee", "lunch", "party"];

export function isGeneral(s: Pick<Session, "type" | "stageId">) {
  return s.stageId === null || GENERAL.includes(s.type);
}

/** Sólo las charlas y workshops se pueden guardar en favoritos. */
export function isFavoritable(s: Pick<Session, "type" | "stageId">) {
  return !isGeneral(s);
}

export function isDay(value: string): value is Day {
  return (DAYS as readonly string[]).includes(value);
}

export type TimeSlot = { time: string; sessions: Session[] };

/** Agrupa por hora de inicio conservando el orden cronológico. */
export function groupByTime(sessions: Session[]): TimeSlot[] {
  const slots = new Map<string, Session[]>();
  for (const s of [...sessions].sort(byStart)) {
    const bucket = slots.get(s.startTime);
    if (bucket) bucket.push(s);
    else slots.set(s.startTime, [s]);
  }
  return [...slots].map(([time, list]) => ({ time, sessions: list }));
}

function byStart(a: Session, b: Session) {
  return a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime);
}

export function stageMap(stages: Stage[]) {
  return new Map(stages.map((s) => [s.id, s]));
}

/** Etiqueta visible de una sesión: cae al nombre del speaker si no hay título. */
export function sessionHeadline(s: Session) {
  return s.title ?? s.speakerName ?? "Sesión por anunciar";
}

export function hasProvisionalTitle(s: Session) {
  return s.title === null && s.speakerName !== null;
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  keynote: "Keynote",
  talk: "Charla",
  workshop: "Workshop",
  lightning: "Lightning talks",
  registration: "Registro",
  coffee: "Coffee break",
  lunch: "Comida",
  party: "Fiesta",
  closing: "Cierre",
};

/**
 * Estilo de las celdas especiales. Cada actividad general tiene su color para
 * que rompan la línea de tiempo y se distingan de un vistazo.
 */
export const GENERAL_STYLES: Partial<
  Record<SessionType, { wrapper: string; icon: string }>
> = {
  registration: {
    wrapper: "bg-js-blue-50 border-js-blue-300 text-js-blue-900",
    icon: "text-js-blue-600",
  },
  coffee: {
    wrapper: "bg-js-orange-50 border-js-orange-300 text-js-orange-900",
    icon: "text-js-orange-600",
  },
  lunch: {
    wrapper: "bg-js-olive-50 border-js-olive-300 text-js-olive-800",
    icon: "text-js-olive-600",
  },
  party: {
    wrapper: "bg-js-plum text-white border-js-plum",
    icon: "text-js-yellow-400",
  },
};

export const STAGE_ACCENTS: Record<
  string,
  { bar: string; chip: string; ring: string }
> = {
  "main-stage": {
    bar: "bg-js-red-500",
    chip: "bg-js-red-50 text-js-red-700 border-js-red-200",
    ring: "focus-visible:ring-js-red-400",
  },
  "async-stage": {
    bar: "bg-js-blue-500",
    chip: "bg-js-blue-50 text-js-blue-800 border-js-blue-200",
    ring: "focus-visible:ring-js-blue-400",
  },
  sandbox: {
    bar: "bg-js-yellow-500",
    chip: "bg-js-yellow-50 text-js-yellow-800 border-js-yellow-300",
    ring: "focus-visible:ring-js-yellow-400",
  },
  playground: {
    bar: "bg-js-orange-500",
    chip: "bg-js-orange-50 text-js-orange-800 border-js-orange-200",
    ring: "focus-visible:ring-js-orange-400",
  },
};

export const FALLBACK_ACCENT = {
  bar: "bg-neutral-400",
  chip: "bg-neutral-100 text-neutral-700 border-neutral-200",
  ring: "focus-visible:ring-neutral-400",
};

export function stageAccent(stageId: string | null) {
  return (stageId && STAGE_ACCENTS[stageId]) || FALLBACK_ACCENT;
}
