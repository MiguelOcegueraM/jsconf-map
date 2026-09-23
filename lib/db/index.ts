import * as schema from "./schema";

/**
 * Un solo esquema (`pg-core`) sobre dos drivers:
 *
 *  - Producción / Vercel → Neon serverless Postgres (`DATABASE_URL`).
 *  - Desarrollo local     → PGlite, Postgres real compilado a WASM, guardado
 *                           en `.pglite/`. Cero servicios externos y las mismas
 *                           queries, así que lo que funciona local funciona en
 *                           Neon sin tocar una línea.
 */
type Db = Awaited<ReturnType<typeof create>>;

let cached: Promise<Db> | undefined;

async function create() {
  const url = process.env.DATABASE_URL;

  if (url && /^postgres(ql)?:\/\//.test(url)) {
    const [{ drizzle }, { neon }] = await Promise.all([
      import("drizzle-orm/neon-http"),
      import("@neondatabase/serverless"),
    ]);
    return drizzle(neon(url), { schema });
  }

  const [{ drizzle }, { PGlite }] = await Promise.all([
    import("drizzle-orm/pglite"),
    import("@electric-sql/pglite"),
  ]);
  // PGlite es de un solo proceso: el dir queda bloqueado por quien lo abra
  // primero. Por eso `npm run db:seed` no corre con el servidor levantado.
  const client = new PGlite(process.env.PGLITE_DIR ?? ".pglite");
  const db = drizzle(client, { schema });
  await ensureLocalSchema(client);
  return db;
}

/** PGlite arranca vacío: creamos las tablas al vuelo en vez de correr migraciones. */
async function ensureLocalSchema(client: {
  exec: (sql: string) => Promise<unknown>;
}) {
  await client.exec(`
    CREATE TABLE IF NOT EXISTS stages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      kind TEXT NOT NULL,
      zone_id TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      stage_id TEXT,
      type TEXT NOT NULL,
      title TEXT,
      speaker_name TEXT,
      speaker_role TEXT,
      track TEXT,
      description TEXT,
      location_note TEXT
    );
    CREATE INDEX IF NOT EXISTS sessions_day_start_idx ON sessions (day, start_time);
  `);
}

export function getDb() {
  cached ??= create();
  return cached;
}

export { schema };
