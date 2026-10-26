import "server-only";
import type { Session, SessionSpeaker, SessionType } from "./types";
import { DAYS, STAGES } from "./program";

/**
 * Cliente de jsconf-agenda (`GET /api/v1/ponentes.json`), la misma fuente que
 * usa jsconf.mx. La respuesta está organizada por ponente; aquí se aplana a
 * una sesión por `sesion_id`.
 *
 * Sin base de datos: la respuesta queda en la caché de datos de Next con el
 * tag `agenda`. El botón secreto de /admin/sync la expira (`updateTag`) y el
 * siguiente request trae la versión nueva. La URL lleva el token de acceso:
 * sólo se usa en el servidor y nunca se imprime.
 */

export const AGENDA_TAG = "agenda";
/** Red de seguridad si nadie pica el botón: se refresca sola cada 10 min. */
const REVALIDATE_SECONDS = 600;

type Sesion = {
  sesion_id: string;
  titulo: string;
  resumen: string | null;
  idioma: string;
  tipo: string;
  patrocinador: string | null;
  horario: {
    fecha: string;
    sala: string;
    inicio: string;
    fin: string;
  };
};

type Ponente = {
  ponente_id: string;
  nombre: string;
  tratamiento: string | null;
  cargo: string | null;
  empresa: string | null;
  foto_url: string | null;
  sesiones: Sesion[];
};

const TYPE_MAP: Record<string, SessionType> = {
  keynote: "keynote",
  charla: "talk",
  taller: "workshop",
};

const STAGE_IDS = new Set(STAGES.map((s) => s.id));
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function optionalString(value: unknown): string | null {
  return isString(value) && value.trim() !== "" ? value.trim() : null;
}

function isSesion(value: unknown): value is Sesion {
  if (!isRecord(value) || !isRecord(value.horario)) return false;
  const { horario } = value;
  return (
    isString(value.sesion_id) &&
    isString(value.titulo) &&
    isString(horario.fecha) &&
    isString(horario.sala) &&
    isString(horario.inicio) &&
    isString(horario.fin)
  );
}

function isPonente(value: unknown): value is Ponente {
  return (
    isRecord(value) &&
    isString(value.ponente_id) &&
    isString(value.nombre) &&
    Array.isArray(value.sesiones) &&
    value.sesiones.every(isSesion)
  );
}

/**
 * Una sesión co-presentada aparece bajo cada uno de sus ponentes, así que se
 * agrupa por `sesion_id`. Lo que no encaja (otra fecha, sala o tipo
 * desconocidos) se descarta por sesión: una fila rara no tumba la agenda.
 */
export function normalizePonentes(payload: unknown): Session[] {
  if (!isRecord(payload) || !Array.isArray(payload.ponentes)) {
    throw new Error("La respuesta de la API no tiene la forma esperada.");
  }
  const ponentes = payload.ponentes.filter(isPonente);
  const sessions = new Map<string, Session>();

  for (const ponente of ponentes) {
    const speaker: SessionSpeaker = {
      id: ponente.ponente_id,
      name: ponente.nombre.trim(),
      honorific: optionalString(ponente.tratamiento),
      role: optionalString(ponente.cargo),
      company: optionalString(ponente.empresa),
      photoUrl: optionalString(ponente.foto_url),
    };

    for (const sesion of ponente.sesiones) {
      const existing = sessions.get(sesion.sesion_id);
      if (existing) {
        if (!existing.speakers.some((s) => s.id === speaker.id)) {
          existing.speakers.push(speaker);
        }
        continue;
      }

      const { horario } = sesion;
      const type = TYPE_MAP[sesion.tipo];
      if (
        !type ||
        !(DAYS as readonly string[]).includes(horario.fecha) ||
        !STAGE_IDS.has(horario.sala) ||
        !HHMM.test(horario.inicio) ||
        !HHMM.test(horario.fin)
      ) {
        continue;
      }

      sessions.set(sesion.sesion_id, {
        id: sesion.sesion_id,
        day: horario.fecha,
        startTime: horario.inicio,
        endTime: horario.fin,
        stageId: horario.sala,
        type,
        title: sesion.titulo.trim(),
        description: optionalString(sesion.resumen),
        language: sesion.idioma === "en" ? "en" : "es",
        sponsor: optionalString(sesion.patrocinador),
        speakers: [speaker],
        locationNote: null,
        speakerName: null,
        speakerRole: null,
      });
    }
  }

  // speakerName/speakerRole quedan como resumen plano; la UI usa `speakers`.
  return [...sessions.values()].map((s) => ({
    ...s,
    speakerName: s.speakers.map((p) => p.name).join(", "),
    speakerRole:
      s.speakers.length === 1
        ? [s.speakers[0].role, s.speakers[0].company].filter(Boolean).join(" · ") || null
        : null,
  }));
}

export type AgendaFetch = { sessions: Session[]; generatedAt: string | null };

export async function fetchAgendaSessions(): Promise<AgendaFetch> {
  const baseUrl = process.env.AGENDA_API_URL;
  const token = process.env.AGENDA_API_TOKEN;
  if (!baseUrl || !token) {
    throw new Error("Faltan AGENDA_API_URL o AGENDA_API_TOKEN en el entorno.");
  }

  const url = new URL(baseUrl);
  url.searchParams.set("token", token);

  let response: Response;
  try {
    response = await fetch(url, {
      next: { tags: [AGENDA_TAG], revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    throw new Error("No se pudo contactar la API de la agenda.");
  }
  if (!response.ok) {
    throw new Error(`La API de la agenda respondió ${response.status}.`);
  }

  const payload: unknown = await response.json();
  const generatedAt =
    isRecord(payload) && isString(payload.generado_en) ? payload.generado_en : null;
  return { sessions: normalizePonentes(payload), generatedAt };
}

