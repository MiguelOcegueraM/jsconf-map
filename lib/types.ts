/**
 * Modelo de la agenda. No hay base de datos: las charlas llegan de la API de
 * jsconf-agenda (lib/agenda-api.ts) y los escenarios y actividades generales
 * viven en código (lib/program.ts).
 */

export type StageKind = "main" | "async" | "workshop";

export type Stage = {
  /** El `sala` de jsconf-agenda: stage_a, stage_b, taller_a, taller_b. */
  id: string;
  name: string;
  shortName: string;
  kind: StageKind;
  /** Su polígono en el mapa (lib/venue.ts). */
  zoneId: string;
  order: number;
};

export type SessionType =
  | "keynote"
  | "talk"
  | "workshop"
  | "lightning"
  | "registration"
  | "coffee"
  | "lunch"
  | "party"
  | "closing";

export type SessionLanguage = "es" | "en";

export type SessionSpeaker = {
  id: string;
  name: string;
  honorific: string | null;
  role: string | null;
  company: string | null;
  photoUrl: string | null;
};

export type Session = {
  id: string;
  /** "2026-10-29" | "2026-10-30" — fecha local de Guadalajara, nunca UTC. */
  day: string;
  /** "HH:mm" hora local. Guadalajara es UTC-6 fijo desde 2022. */
  startTime: string;
  endTime: string;
  /** null = actividad general (lunch, coffee, party): ocupa todo el ancho. */
  stageId: string | null;
  type: SessionType;
  /** null = título aún por anunciar; la UI cae al nombre del speaker. */
  title: string | null;
  speakerName: string | null;
  speakerRole: string | null;
  description: string | null;
  /** Texto libre para actividades sin escenario ("NPM Zone", "Lobby"). */
  locationNote: string | null;
  /** "es" | "en". null en actividades generales. */
  language: SessionLanguage | null;
  sponsor: string | null;
  speakers: SessionSpeaker[];
};
