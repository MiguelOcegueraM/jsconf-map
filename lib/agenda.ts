import type { Session, SessionSpeaker, SessionType, Stage } from "./types";
import { DAYS, type Day } from "./program";

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

const STAGE_ORDER = ["stage_a", "stage_b", "taller_a", "taller_b"];

function byStart(a: Session, b: Session) {
  return (
    a.startTime.localeCompare(b.startTime) ||
    // A la misma hora, las generales primero y luego en orden de sala.
    Number(!isGeneral(a)) - Number(!isGeneral(b)) ||
    STAGE_ORDER.indexOf(a.stageId ?? "") - STAGE_ORDER.indexOf(b.stageId ?? "")
  );
}

export function stageMap(stages: Stage[]) {
  return new Map(stages.map((s) => [s.id, s]));
}

/** Etiqueta visible de una sesión: cae al nombre del speaker si no hay título. */
export function sessionHeadline(s: Session, untitled = "Sesión por anunciar") {
  return s.title ?? s.speakerName ?? untitled;
}

export function hasProvisionalTitle(s: Session) {
  return s.title === null && s.speakerName !== null;
}

/**
 * Los ponentes de la sesión. Las que vienen de la API traen la lista
 * completa con foto; las capturadas a mano en /admin sólo un nombre y cargo.
 */
export function sessionSpeakers(s: Session): SessionSpeaker[] {
  if (s.speakers?.length) return s.speakers;
  if (!s.speakerName) return [];
  return [
    {
      id: `manual-${s.id}`,
      name: s.speakerName,
      honorific: null,
      role: s.speakerRole,
      company: null,
      photoUrl: null,
    },
  ];
}

export function speakerDisplayName(p: SessionSpeaker) {
  return [p.honorific, p.name].filter(Boolean).join(" ");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}


/* ------------------------------------------------------------------ */
/*  Tonos (mismos que la agenda de jsconf.mx, repo cacao)              */
/* ------------------------------------------------------------------ */

export type SessionTone = "keynote" | "charla" | "taller" | "sponsored";

/** Las sesiones patrocinadas tienen su propio tono, sea cual sea su tipo. */
export function toneOf(s: Pick<Session, "type" | "sponsor">): SessionTone {
  if (s.sponsor) return "sponsored";
  if (s.type === "keynote") return "keynote";
  if (s.type === "workshop") return "taller";
  return "charla";
}


// Clases literales para que Tailwind las vea.
export const TONE_PILL: Record<SessionTone, string> = {
  keynote: "bg-js-red-700 text-white",
  charla: "bg-js-indigo-500 text-white",
  taller: "bg-js-blue-700 text-white",
  sponsored: "bg-js-yellow-500 text-js-indigo-900",
};

export const TONE_CARD: Record<SessionTone, string> = {
  keynote: "bg-[#fff5f5] shadow-[4px_4px_0_0_#ac1c1c]",
  charla: "bg-white shadow-[4px_4px_0_0_#2630c3]",
  taller: "bg-[#edf5f8] shadow-[4px_4px_0_0_#357088]",
  sponsored: "bg-[#fffaeb] shadow-[4px_4px_0_0_#f3ba20]",
};

/* ------------------------------------------------------------------ */
/*  Tiempo del evento                                                  */
/* ------------------------------------------------------------------ */

/**
 * Guadalajara es UTC-6 todo el año (México quitó el horario de verano en
 * 2022). Todo se compara como "YYYY-MM-DD HH:mm" en hora local del evento,
 * así el teléfono de alguien que viene de otro huso no mueve la agenda.
 */
export const EVENT_OFFSET = "-06:00";

export function eventStamp(date: Date) {
  const local = new Date(date.getTime() - 6 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 16).replace("T", " ");
}

export function sessionStart(s: Pick<Session, "day" | "startTime">) {
  return new Date(`${s.day}T${s.startTime}:00${EVENT_OFFSET}`);
}

export function sessionEnd(s: Pick<Session, "day" | "endTime">) {
  return new Date(`${s.day}T${s.endTime}:00${EVENT_OFFSET}`);
}

export type SessionStatus = "upcoming" | "live" | "past";

export function sessionStatus(
  s: Pick<Session, "day" | "startTime" | "endTime">,
  now: string,
): SessionStatus {
  if (`${s.day} ${s.endTime}` <= now) return "past";
  if (`${s.day} ${s.startTime}` <= now) return "live";
  return "upcoming";
}

/** Un día ya pasó cuando terminó su última sesión. */
export function isDayOver(day: Day, sessions: Session[], now: string) {
  const ofDay = sessions.filter((s) => s.day === day);
  if (ofDay.length === 0) return now.slice(0, 10) > day;
  const last = ofDay.reduce((max, s) => (s.endTime > max ? s.endTime : max), "00:00");
  return `${day} ${last}` <= now;
}

export function formatTime(time: string) {
  return time.replace(/^0/, "");
}

export function formatRange(s: { startTime: string; endTime: string }) {
  return `${formatTime(s.startTime)}–${formatTime(s.endTime)}`;
}
