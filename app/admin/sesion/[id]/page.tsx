import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { SessionForm } from "@/components/admin/session-form";
import { getDb, schema } from "@/lib/db";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({
  params,
}: PageProps<"/admin/sesion/[id]">) {
  const { id } = await params;
  const db = await getDb();

  const stages = await db
    .select()
    .from(schema.stages)
    .orderBy(asc(schema.stages.order));

  const isNew = id === "nueva";
  let session = null;

  if (!isNew) {
    const rows = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, id))
      .limit(1);
    session = rows[0];
    if (!session) notFound();
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 py-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
      >
        <ChevronLeft className="size-4" />
        Volver
      </Link>

      <h1 className="font-display mt-3 text-2xl text-js-plum">
        {isNew ? "Nueva sesión" : "Editar sesión"}
      </h1>

      <SessionForm session={session ?? null} stages={stages} />
    </main>
  );
}
