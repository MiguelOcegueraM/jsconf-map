/**
 * Geometría del venue derivada de `docs/STAGES Y DISTRIBUCION.pdf`
 * (planta arquitectónica, escala 1:100, Jardín Americana, Guadalajara).
 *
 * El plano original se renderizó a 200dpi y cada bloque morado se midió para
 * llevarlo a este viewBox normalizado. Las posiciones relativas —qué está al
 * norte de qué, qué queda dentro de la casa y qué en el jardín— son fieles al
 * PDF; lo que se simplificó es el ruido técnico (cotas, niveles N+1.20, muros)
 * que en una pantalla de 390px no se lee.
 *
 * El norte del plano apunta hacia ARRIBA en este viewBox.
 */

import type { Localized } from "./i18n/config";

/** El alto incluye la franja de Av. Ignacio L. Vallarta al sur del predio. */
export const VENUE_VIEWBOX = { width: 1000, height: 1805 } as const;

export type ZoneKind =
  | "stage"
  | "workshop"
  | "service"
  | "sponsor"
  | "food"
  | "entrance"
  | "restroom";

export type Level = "planta-baja" | "planta-alta";

export interface VenueZone {
  id: string;
  name: Localized;
  /** Etiqueta corta que cabe dentro del polígono en móvil. */
  label: Localized<string[]>;
  kind: ZoneKind;
  level: Level;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Radio de esquina; los escenarios son más redondos que las salas. */
  r?: number;
  description: Localized;
  /** Instrucción práctica de cómo llegar. */
  howTo?: Localized;
  /** Marca los 6 puntos que el asistente necesita sí o sí. */
  key?: boolean;
}

/** Superficies de fondo: dan contexto pero no son interactivas. */
export const VENUE_SURFACES = [
  {
    id: "jardin-norte",
    label: { es: "Jardín norte", en: "North garden" },
    x: 110,
    y: 20,
    w: 650,
    h: 810,
    fill: "var(--color-js-olive-50)",
    stroke: "var(--color-js-olive-200)",
  },
  {
    id: "pasillo",
    // Sin rótulo: el Stage A ya lo identifica.
    label: null,
    x: 760,
    y: 20,
    w: 215,
    h: 1170,
    fill: "#f4f4f2",
    stroke: "#dcdcd6",
  },
  {
    id: "casa",
    label: { es: "La casa", en: "The house" },
    x: 175,
    y: 830,
    w: 480,
    h: 740,
    fill: "#faf7f3",
    stroke: "#e2dbd1",
  },
  {
    id: "patio",
    label: { es: "Patio casa", en: "House patio" },
    x: 320,
    y: 905,
    w: 200,
    h: 230,
    fill: "var(--color-js-olive-50)",
    stroke: "var(--color-js-olive-200)",
  },
  {
    id: "jardin-sur",
    label: { es: "Jardín sur", en: "South garden" },
    x: 655,
    y: 1200,
    w: 320,
    h: 530,
    fill: "var(--color-js-olive-50)",
    stroke: "var(--color-js-olive-200)",
  },
] as const;

export const VENUE_ZONES: VenueZone[] = [
  {
    id: "stage-a",
    name: { es: "Stage A", en: "Stage A" },
    label: { es: ["STAGE A"], en: ["STAGE A"] },
    kind: "stage",
    level: "planta-baja",
    x: 811,
    y: 230,
    w: 112,
    h: 360,
    r: 18,
    key: true,
    description: {
      es: "El escenario principal (antes «Main Stage»): keynotes y la mayoría de las charlas. Al aire libre sobre el pasillo oriente, a un costado del jardín norte.",
      en: "The main stage (formerly “Main Stage”): keynotes and most talks. Open-air, along the east corridor beside the north garden.",
    },
    howTo: {
      es: "Desde el acceso (jardín sur, sobre Av. Ignacio L. Vallarta) sube por el pasillo oriente hacia el norte: el Stage A está a lo largo del pasillo.",
      en: "From the entrance (south garden, on Av. Ignacio L. Vallarta) head north along the east corridor: Stage A runs alongside it.",
    },
  },
  {
    id: "stage-b",
    name: { es: "Stage B", en: "Stage B" },
    label: { es: ["STAGE B"], en: ["STAGE B"] },
    kind: "stage",
    level: "planta-alta",
    x: 168,
    y: 706,
    w: 168,
    h: 112,
    r: 18,
    key: true,
    description: {
      es: "El segundo escenario (antes «ASYNC Stage»), en terraza, en la PLANTA ALTA del extremo noroeste del jardín. No se ve desde el piso: hay que subir.",
      en: "The second stage (formerly “ASYNC Stage”), on a terrace UPSTAIRS at the north-west end of the garden. You can't see it from the ground: go up.",
    },
    howTo: {
      es: "Cruza el jardín hasta la esquina noroeste, bajo los árboles. Las escaleras están justo al norte de la terraza — marcadas con la flecha roja en el plano oficial.",
      en: "Cross the garden to the north-west corner, under the trees. The stairs are just north of the terrace — marked with the red arrow on the official plan.",
    },
  },
  {
    id: "taller-a",
    name: { es: "Taller A", en: "Taller A" },
    label: { es: ["TALLER A"], en: ["TALLER A"] },
    kind: "workshop",
    level: "planta-baja",
    x: 352,
    y: 1142,
    w: 136,
    h: 132,
    r: 10,
    key: true,
    description: {
      es: "Sala de talleres (antes «The Sandbox»), techada, dentro de la casa, al sur del Patio casa. Trae tu laptop.",
      en: "Workshop room (formerly “The Sandbox”), indoors in the house, south of the house patio. Bring your laptop.",
    },
    howTo: {
      es: "Entra por el ingreso de la casa, a la derecha del Patio casa, y cruza el patio hacia el sur: es la primera sala.",
      en: "Go in through the house entrance, to the right of the house patio, and cross the patio southwards: it's the first room.",
    },
  },
  {
    id: "taller-b",
    name: { es: "Taller B", en: "Taller B" },
    label: { es: ["TALLER B"], en: ["TALLER B"] },
    kind: "workshop",
    level: "planta-baja",
    x: 352,
    y: 1282,
    w: 136,
    h: 170,
    r: 10,
    key: true,
    description: {
      es: "La segunda sala de talleres (antes «The Playground»), también techada, inmediatamente al sur del Taller A.",
      en: "The second workshop room (formerly “The Playground”), also indoors, right south of Taller A.",
    },
    howTo: {
      es: "Misma entrada que el Taller A; sigue hacia el sur, es la sala siguiente.",
      en: "Same entrance as Taller A; keep heading south, it's the next room.",
    },
  },
  {
    id: "registro",
    name: { es: "Registro & Lobby", en: "Registration & Lobby" },
    label: { es: ["REGISTRO", "& LOBBY"], en: ["REGISTRATION", "& LOBBY"] },
    kind: "service",
    level: "planta-baja",
    x: 855,
    y: 1420,
    w: 105,
    h: 128,
    r: 10,
    key: true,
    description: {
      es: "Aquí recoges tu gafete. Está en la esquina sureste del jardín sur, a unos pasos del acceso.",
      en: "Pick up your badge here. It's in the south-east corner of the south garden, a few steps from the entrance.",
    },
    howTo: {
      es: "Primera parada al llegar: entrando por el acceso, a tu derecha.",
      en: "Your first stop: on your right as you come in through the entrance.",
    },
  },
  {
    id: "cowork",
    name: { es: "Cowork · NaN Zone", en: "Cowork · NaN Zone" },
    label: { es: ["COWORK", "NaN Zone"], en: ["COWORK", "NaN Zone"] },
    kind: "service",
    level: "planta-baja",
    x: 655,
    y: 1272,
    w: 130,
    h: 122,
    r: 10,
    key: true,
    description: {
      es: "Zona de trabajo con mesas y contactos, sobre el flanco oriente de la casa.",
      en: "Work area with tables and power outlets, on the east side of the house.",
    },
    howTo: {
      es: "Subiendo desde el registro hacia el norte, por el lado del jardín oriente.",
      en: "Head north from registration, along the east side of the garden.",
    },
  },
  {
    id: "npm-zone",
    name: { es: "Sponsors · NPM Zone", en: "Sponsors · NPM Zone" },
    label: { es: ["SPONSORS", "NPM Zone"], en: ["SPONSORS", "NPM Zone"] },
    kind: "sponsor",
    level: "planta-baja",
    x: 240,
    y: 148,
    w: 224,
    h: 196,
    r: 12,
    description: {
      es: "Stands de patrocinadores y actividades, en la mitad poniente del jardín norte. También es la sede del Happy Hour.",
      en: "Sponsor booths and activities, in the west half of the north garden. It's also where the Happy Hour happens.",
    },
  },
  {
    id: "acceso",
    name: { es: "Acceso principal", en: "Main entrance" },
    label: { es: ["ACCESO"], en: ["ENTRANCE"] },
    kind: "entrance",
    level: "planta-baja",
    x: 715,
    y: 1652,
    w: 200,
    h: 66,
    r: 10,
    description: {
      es: "Entrada por el jardín sur, sobre Av. Ignacio L. Vallarta 1305, Col. Americana. Es el único acceso peatonal al venue.",
      en: "Entrance through the south garden, on Av. Ignacio L. Vallarta 1305, Col. Americana. It's the only pedestrian entrance to the venue.",
    },
  },
  {
    id: "ingreso-casa",
    name: { es: "Ingreso a la casa", en: "House entrance" },
    label: { es: ["INGRESO", "CASA"], en: ["HOUSE", "ENTRANCE"] },
    kind: "entrance",
    level: "planta-baja",
    x: 526,
    y: 905,
    w: 118,
    h: 88,
    r: 10,
    description: {
      es: "Puerta principal de la casa, pegada al Patio casa por su lado derecho. Por aquí se llega al Taller A y al Taller B.",
      en: "The house's main door, on the right side of the house patio. This is the way to Taller A and Taller B.",
    },
  },
  {
    id: "banos-norte",
    name: { es: "Baños y regaderas", en: "Restrooms & showers" },
    label: { es: ["WC"], en: ["WC"] },
    kind: "restroom",
    level: "planta-baja",
    x: 700,
    y: 1040,
    w: 76,
    h: 118,
    r: 8,
    description: {
      es: "Baños H/M, regaderas y lockers, sobre el costado oriente.",
      en: "Restrooms, showers and lockers, on the east side.",
    },
  },
  {
    id: "banos-casa",
    name: { es: "Baños (casa)", en: "Restrooms (house)" },
    label: { es: ["WC"], en: ["WC"] },
    kind: "restroom",
    level: "planta-baja",
    x: 252,
    y: 1300,
    w: 66,
    h: 78,
    r: 8,
    description: {
      es: "Baños dentro de la casa, frente al Taller A y al Taller B.",
      en: "Restrooms inside the house, across from Taller A and Taller B.",
    },
  },
];

/**
 * Escaleras al Stage B. En el PDF es una flecha roja apuntando hacia la
 * terraza: es el dato que más se pregunta el día del evento, así que va como
 * elemento propio y no como una etiqueta más.
 */
export const STAGE_B_STAIRS = {
  x: 132,
  y: 578,
  w: 40,
  h: 120,
} as const;

export const ZONE_STYLES: Record<
  ZoneKind,
  { fill: string; stroke: string; text: string; chip: string }
> = {
  stage: {
    fill: "var(--color-js-red-500)",
    stroke: "var(--color-js-indigo-900)",
    text: "#ffffff",
    chip: "bg-js-red-500 text-white",
  },
  workshop: {
    fill: "var(--color-js-blue-700)",
    stroke: "var(--color-js-indigo-900)",
    text: "#ffffff",
    chip: "bg-js-blue-700 text-white",
  },
  service: {
    fill: "var(--color-js-indigo-500)",
    stroke: "var(--color-js-indigo-900)",
    text: "#ffffff",
    chip: "bg-js-indigo-500 text-white",
  },
  sponsor: {
    fill: "var(--color-js-plum)",
    stroke: "var(--color-js-plum)",
    text: "#ffffff",
    chip: "bg-js-plum text-white",
  },
  food: {
    fill: "var(--color-js-olive-500)",
    stroke: "var(--color-js-olive-800)",
    text: "#ffffff",
    chip: "bg-js-olive-500 text-white",
  },
  entrance: {
    fill: "var(--color-js-orange-500)",
    stroke: "var(--color-js-orange-700)",
    text: "#ffffff",
    chip: "bg-js-orange-500 text-white",
  },
  restroom: {
    fill: "#ffffff",
    stroke: "#9a9a92",
    text: "#44443e",
    chip: "bg-white text-neutral-700 border border-neutral-300",
  },
};

/** El Stage B es el único bloque morado del PDF que NO está a nivel de piso. */
export const STAGE_B_ZONE_ID = "stage-b";

export function getZone(id: string) {
  return VENUE_ZONES.find((z) => z.id === id);
}

/** Zonas del mapa que corresponden a un escenario de la agenda. */
export const ZONE_TO_STAGE: Record<string, string> = {
  "stage-a": "stage_a",
  "stage-b": "stage_b",
  "taller-a": "taller_a",
  "taller-b": "taller_b",
};
