/**
 * Traducción simultánea: un "runner" en Cloud Run por sala recibe el audio
 * del escenario, lo pasa por Gemini Live y lo reparte a quien escuche. El
 * navegador se conecta directo a su WebSocket `/listen` — no pasa por Vercel
 * (las funciones no sostienen sockets largos) y es público, sin token.
 *
 * Contrato: guía del listener de los runners (status / caption / audio PCM).
 */

export type TranslationRoom = {
  /** El id de la sala en la agenda. */
  stageId: string;
  listenerUrl: string;
  /** false = todavía no hay traducción en vivo: se muestra "Próximamente". */
  available: boolean;
};

const runner = (slug: string) => `wss://run-${slug}-tjrx7rkrbq-pv.a.run.app/listen`;

export const TRANSLATION_ROOMS: TranslationRoom[] = [
  { stageId: "stage_a", listenerUrl: runner("stage-a"), available: true },
  { stageId: "stage_b", listenerUrl: runner("stage-b"), available: true },
  { stageId: "taller_a", listenerUrl: runner("taller-a"), available: true },
  { stageId: "taller_b", listenerUrl: runner("taller-b"), available: true },
];

export function translationRoom(stageId: string | null | undefined) {
  return TRANSLATION_ROOMS.find((r) => r.stageId === stageId);
}

/** Qué stream de audio pide el oyente. "none" = sólo subtítulos. */
export type AudioChoice = "none" | "translation" | "original";

export type RunnerMode = "idle" | "test" | "live";

export type RunnerStatus = {
  room: string;
  mode: RunnerMode;
  session: { id: string; title: string; speaker: string; language: string } | null;
  translationLanguage: string | null;
  sampleRate: number;
};

export type CaptionKind = "original" | "translation";

export type CaptionLine = {
  id: number;
  lang: string;
  text: string;
  finished: boolean;
};

export const LANGUAGE_SHORT: Record<string, string> = { es: "ES", en: "EN" };
