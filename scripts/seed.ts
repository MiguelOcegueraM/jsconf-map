/**
 * Siembra la agenda preliminar. Idempotente: borra y reescribe.
 *   npm run db:seed
 * Sin DATABASE_URL escribe en PGlite (.pglite/); con ella, en Neon.
 */
import { getDb, schema } from "../lib/db";
import { SEED_SESSIONS, SEED_STAGES } from "../lib/seed-data";

async function main() {
  const db = await getDb();
  const target = process.env.DATABASE_URL ? "Neon Postgres" : "PGlite local (.pglite/)";

  await db.delete(schema.sessions);
  await db.delete(schema.stages);

  await db.insert(schema.stages).values(SEED_STAGES);
  await db.insert(schema.sessions).values(
    SEED_SESSIONS.map((s) => ({
      ...s,
      speakerName: s.speakerName ?? null,
      speakerRole: s.speakerRole ?? null,
      track: s.track ?? null,
      description: s.description ?? null,
      locationNote: s.locationNote ?? null,
    })),
  );

  console.log(
    `✓ ${SEED_STAGES.length} escenarios y ${SEED_SESSIONS.length} sesiones en ${target}`,
  );
  process.exit(0);
}

main().catch((err) => {
  const local = !process.env.DATABASE_URL;
  console.error("✗ falló el seed:", err);
  if (local) {
    console.error(
      "\nPGlite sólo admite un proceso a la vez. Detén `npm run dev` / `npm start`\n" +
        "antes de sembrar. Si el directorio quedó en mal estado: rm -rf .pglite\n",
    );
  }
  process.exit(1);
});
