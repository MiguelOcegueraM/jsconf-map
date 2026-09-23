import { pgTable, text, integer, index } from "drizzle-orm/pg-core";

/**
 * Los escenarios son estables (salen del plano del venue), pero viven en la
 * base para que el back office pueda renombrarlos o reordenarlos sin deploy.
 * `zoneId` amarra cada escenario con su polígono en el mapa (lib/venue.ts).
 */
export const stages = pgTable("stages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  kind: text("kind").$type<StageKind>().notNull(),
  zoneId: text("zone_id").notNull(),
  order: integer("order").notNull().default(0),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    /** "2026-10-29" | "2026-10-30" — fecha local de Guadalajara, nunca UTC. */
    day: text("day").notNull(),
    /** "HH:mm" hora local. Guadalajara es UTC-6 fijo desde 2022. */
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    /** null = actividad general (lunch, coffee, party): ocupa todo el ancho. */
    stageId: text("stage_id"),
    type: text("type").$type<SessionType>().notNull(),
    /** null = título aún por anunciar; la UI cae al nombre del speaker. */
    title: text("title"),
    speakerName: text("speaker_name"),
    speakerRole: text("speaker_role"),
    track: text("track"),
    description: text("description"),
    /** Texto libre para actividades sin escenario ("NPM Zone", "Lobby"). */
    locationNote: text("location_note"),
  },
  (t) => [index("sessions_day_start_idx").on(t.day, t.startTime)],
);

export type StageKind = "main" | "async" | "workshop";

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

export type Stage = typeof stages.$inferSelect;
export type Session = typeof sessions.$inferSelect;
