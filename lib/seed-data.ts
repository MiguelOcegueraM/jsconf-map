import type { SessionType, StageKind } from "./db/schema";

export const DAYS = ["2026-10-29", "2026-10-30"] as const;
export type Day = (typeof DAYS)[number];

export const DAY_LABELS: Record<Day, { short: string; long: string; n: string }> = {
  "2026-10-29": { short: "29 oct", long: "Jueves 29 de octubre", n: "Día 1" },
  "2026-10-30": { short: "30 oct", long: "Viernes 30 de octubre", n: "Día 2" },
};

export const SEED_STAGES: {
  id: string;
  name: string;
  shortName: string;
  kind: StageKind;
  zoneId: string;
  order: number;
}[] = [
  { id: "main-stage", name: "Main Stage", shortName: "Main", kind: "main", zoneId: "main-stage", order: 1 },
  { id: "async-stage", name: "ASYNC Stage", shortName: "ASYNC", kind: "async", zoneId: "async-stage", order: 2 },
  { id: "sandbox", name: "The Sandbox", shortName: "Sandbox", kind: "workshop", zoneId: "workshop-sandbox", order: 3 },
  { id: "playground", name: "The Playground", shortName: "Playground", kind: "workshop", zoneId: "workshop-playground", order: 4 },
];

type SeedSession = {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
  stageId: string | null;
  type: SessionType;
  title: string | null;
  speakerName?: string;
  speakerRole?: string;
  track?: string;
  description?: string;
  locationNote?: string;
};

/**
 * PROGRAMA PRELIMINAR.
 *
 * Al 23 de septiembre de 2026, jsconf.mx/agenda dice textualmente
 * "The schedule isn't published yet". Lo que sí está confirmado y publicado
 * son los 23 speakers, con su cargo y su track — eso es lo que se siembra aquí,
 * repartido en una parrilla plausible sobre los horarios que el sitio sí
 * confirma (registro 9:00, programa 10:00–18:00, ambos días).
 *
 * Los títulos van en `null` a propósito: no se inventan charlas. La UI muestra
 * al speaker y su track, con una marca de "título por confirmar". Los
 * organizadores los llenan desde /admin cuando cierren el programa.
 */
export const SEED_SESSIONS: SeedSession[] = [
  // ─────────────────────────── DÍA 1 ───────────────────────────
  {
    id: "d1-registro", day: "2026-10-29", startTime: "09:00", endTime: "10:00",
    stageId: null, type: "registration", title: "Registro y bienvenida",
    locationNote: "Registro & Lobby",
    description: "Recoge tu gafete en el stand de café de la esquina sureste.",
  },
  {
    id: "d1-apertura", day: "2026-10-29", startTime: "10:00", endTime: "10:20",
    stageId: "main-stage", type: "keynote", title: "Apertura JSConf México 2026",
    description: "Bienvenida del equipo organizador.",
  },

  { id: "d1-s1-main", day: "2026-10-29", startTime: "10:30", endTime: "11:10", stageId: "main-stage", type: "talk", title: null, speakerName: "Daniel Roe", speakerRole: "Nuxt Lead at Vercel", track: "Open Source" },
  { id: "d1-s1-async", day: "2026-10-29", startTime: "10:30", endTime: "11:10", stageId: "async-stage", type: "talk", title: null, speakerName: "Mark Thompson", speakerRole: "Staff DevRel Engineer at Google", track: "AI" },
  { id: "d1-ws1", day: "2026-10-29", startTime: "10:30", endTime: "12:30", stageId: "sandbox", type: "workshop", title: null, speakerName: "Aurora Scharff", speakerRole: "DX Engineer, Vercel", track: "Next.js", description: "Workshop de 2 horas. Cupo limitado, trae tu laptop." },

  { id: "d1-s2-main", day: "2026-10-29", startTime: "11:20", endTime: "12:00", stageId: "main-stage", type: "talk", title: null, speakerName: "Thor Schaeff", speakerRole: "Developer Experience Engineer at Google DeepMind", track: "AI" },
  { id: "d1-s2-async", day: "2026-10-29", startTime: "11:20", endTime: "12:00", stageId: "async-stage", type: "talk", title: null, speakerName: "Andrés Muñoz", speakerRole: "Site Lead for Chrome in Mexico City at Google", track: "AI" },

  { id: "d1-coffee-1", day: "2026-10-29", startTime: "12:00", endTime: "12:30", stageId: null, type: "coffee", title: "Coffee break", locationNote: "NPM Zone" },

  { id: "d1-s3-main", day: "2026-10-29", startTime: "12:30", endTime: "13:10", stageId: "main-stage", type: "talk", title: null, speakerName: "Eva Ferreira", speakerRole: "Lead Software Engineer, Mabl", track: "i18n" },
  { id: "d1-s3-async", day: "2026-10-29", startTime: "12:30", endTime: "13:10", stageId: "async-stage", type: "talk", title: null, speakerName: "Jan Peer", speakerRole: "Senior Software Engineer, Sentry", track: "Security" },

  { id: "d1-lunch", day: "2026-10-29", startTime: "13:10", endTime: "14:30", stageId: null, type: "lunch", title: "Comida", locationNote: "Restaurante · jardín sur" },

  { id: "d1-ws2", day: "2026-10-29", startTime: "14:30", endTime: "16:30", stageId: "playground", type: "workshop", title: null, speakerName: "Néstor López", speakerRole: "Platform Architect at Zephyr Cloud", track: "Module Federation", description: "Workshop de 2 horas. Cupo limitado, trae tu laptop." },
  { id: "d1-s4-main", day: "2026-10-29", startTime: "14:30", endTime: "15:10", stageId: "main-stage", type: "talk", title: null, speakerName: "Nicole Tibaldi", speakerRole: "Engineering Director, The New York Times", track: "Career" },
  { id: "d1-s4-async", day: "2026-10-29", startTime: "14:30", endTime: "15:10", stageId: "async-stage", type: "talk", title: null, speakerName: "Karen Li", speakerRole: "Software Engineer, GitHub", track: "Security" },

  { id: "d1-s5-main", day: "2026-10-29", startTime: "15:20", endTime: "16:00", stageId: "main-stage", type: "talk", title: null, speakerName: "Álvaro Montoro", speakerRole: "Senior Software Engineer, General Motors", track: "Web APIs" },
  { id: "d1-s5-async", day: "2026-10-29", startTime: "15:20", endTime: "16:00", stageId: "async-stage", type: "talk", title: null, speakerName: "Devlin Duldulao", speakerRole: "Software Engineer, SoftwareOne Norway", track: "Module Federation" },

  { id: "d1-coffee-2", day: "2026-10-29", startTime: "16:00", endTime: "16:30", stageId: null, type: "coffee", title: "Coffee break", locationNote: "NPM Zone" },

  { id: "d1-lightning", day: "2026-10-29", startTime: "16:30", endTime: "17:15", stageId: "main-stage", type: "lightning", title: "Lightning talks de la comunidad", description: "Cinco minutos por persona. Inscríbete en el registro durante el día." },
  { id: "d1-cierre", day: "2026-10-29", startTime: "17:30", endTime: "18:00", stageId: "main-stage", type: "closing", title: "Cierre del día 1" },
  { id: "d1-happy", day: "2026-10-29", startTime: "18:00", endTime: "20:00", stageId: null, type: "party", title: "Happy Hour", locationNote: "NPM Zone · jardín norte", description: "Cerveza, tacos y networking bajo las lonas." },

  // ─────────────────────────── DÍA 2 ───────────────────────────
  {
    id: "d2-registro", day: "2026-10-30", startTime: "09:00", endTime: "10:00",
    stageId: null, type: "registration", title: "Registro",
    locationNote: "Registro & Lobby",
  },

  { id: "d2-ws1", day: "2026-10-30", startTime: "10:00", endTime: "12:00", stageId: "sandbox", type: "workshop", title: null, speakerName: "Joel Gómez", speakerRole: "Software Architect at Lazo", track: "Architecture", description: "Workshop de 2 horas. Cupo limitado, trae tu laptop." },
  { id: "d2-s1-main", day: "2026-10-30", startTime: "10:00", endTime: "10:40", stageId: "main-stage", type: "talk", title: null, speakerName: "Carmen Huidobro", speakerRole: "CEO, Mapache Softworks", track: "Career" },
  { id: "d2-s1-async", day: "2026-10-30", startTime: "10:00", endTime: "10:40", stageId: "async-stage", type: "talk", title: null, speakerName: "Hazel Saenz", speakerRole: "LATAM Developer Advocate, AWS", track: "AI" },

  { id: "d2-s2-main", day: "2026-10-30", startTime: "10:50", endTime: "11:30", stageId: "main-stage", type: "talk", title: null, speakerName: "Kyungtak Woo", speakerRole: "Senior Software Engineer, Google", track: "WebAssembly" },
  { id: "d2-s2-async", day: "2026-10-30", startTime: "10:50", endTime: "11:30", stageId: "async-stage", type: "talk", title: null, speakerName: "Leslie Herrera", speakerRole: "Software Engineer, Latam Airlines", track: "Performance" },

  { id: "d2-coffee-1", day: "2026-10-30", startTime: "11:30", endTime: "12:00", stageId: null, type: "coffee", title: "Coffee break", locationNote: "NPM Zone" },

  { id: "d2-s3-main", day: "2026-10-30", startTime: "12:00", endTime: "12:40", stageId: "main-stage", type: "talk", title: null, speakerName: "Erasmo Hernández", speakerRole: "Tech Lead", track: "Architecture" },
  { id: "d2-s3-async", day: "2026-10-30", startTime: "12:00", endTime: "12:40", stageId: "async-stage", type: "talk", title: null, speakerName: "Hugo Leyton", speakerRole: "IT Specialist, HAS Friends", track: "IoT" },

  { id: "d2-lunch", day: "2026-10-30", startTime: "12:40", endTime: "14:00", stageId: null, type: "lunch", title: "Comida", locationNote: "Restaurante · jardín sur" },

  { id: "d2-s4-main", day: "2026-10-30", startTime: "14:00", endTime: "14:40", stageId: "main-stage", type: "talk", title: null, speakerName: "Alexander Amin", speakerRole: "Principal AI Engineer, ML6", track: "AI" },
  { id: "d2-s4-async", day: "2026-10-30", startTime: "14:00", endTime: "14:40", stageId: "async-stage", type: "talk", title: null, speakerName: "Shirley Ramos", speakerRole: "Frontend Developer, GDG Organizer", track: "Accessibility" },

  { id: "d2-s5-main", day: "2026-10-30", startTime: "14:50", endTime: "15:30", stageId: "main-stage", type: "talk", title: null, speakerName: "Joaquín Bravo", speakerRole: "Staff Software Engineer, Earnest", track: "AI" },
  { id: "d2-s5-async", day: "2026-10-30", startTime: "14:50", endTime: "15:30", stageId: "async-stage", type: "talk", title: null, speakerName: "Rina Plata", speakerRole: "Software Engineer, enerBit", track: "Accessibility" },

  { id: "d2-coffee-2", day: "2026-10-30", startTime: "15:30", endTime: "16:00", stageId: null, type: "coffee", title: "Coffee break", locationNote: "NPM Zone" },

  { id: "d2-lightning", day: "2026-10-30", startTime: "16:00", endTime: "16:45", stageId: "main-stage", type: "lightning", title: "Lightning talks de la comunidad" },
  { id: "d2-clausura", day: "2026-10-30", startTime: "17:00", endTime: "17:45", stageId: "main-stage", type: "closing", title: "Clausura y rifa" },
  { id: "d2-party", day: "2026-10-30", startTime: "18:00", endTime: "21:00", stageId: null, type: "party", title: "Closing Party", locationNote: "NPM Zone · jardín norte" },
];
