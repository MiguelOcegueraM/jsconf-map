import "server-only";
import { asc } from "drizzle-orm";
import { getDb, schema } from "./db";
import type { Session, Stage } from "./db/schema";

export type Agenda = { stages: Stage[]; sessions: Session[] };

export async function getAgenda(): Promise<Agenda> {
  const db = await getDb();
  const [stages, sessions] = await Promise.all([
    db.select().from(schema.stages).orderBy(asc(schema.stages.order)),
    db
      .select()
      .from(schema.sessions)
      .orderBy(asc(schema.sessions.day), asc(schema.sessions.startTime)),
  ]);
  return { stages, sessions };
}
