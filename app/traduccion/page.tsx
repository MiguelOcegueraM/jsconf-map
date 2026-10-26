import type { Metadata } from "next";
import { TranslationView } from "@/components/translation/translation-view";
import { getAgenda } from "@/lib/queries";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { TRANSLATION_ROOMS } from "@/lib/translation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.meta.translationTitle, description: t.meta.translationDescription };
}

/**
 * `?sala=stage_a` abre directo la sala (para los QR de cada escenario). La
 * agenda sólo sirve para decir qué pasa ahora en cada sala; el audio y los
 * subtítulos van del navegador al runner, sin pasar por aquí.
 */
export default async function TranslationPage({ searchParams }: PageProps<"/traduccion">) {
  const [{ stages, sessions }, params] = await Promise.all([
    getLocale().then(getAgenda),
    searchParams,
  ]);
  const sala = typeof params.sala === "string" ? params.sala : null;
  const roomIds = new Set(TRANSLATION_ROOMS.map((r) => r.stageId));

  return (
    <TranslationView
      stages={stages.filter((s) => roomIds.has(s.id))}
      sessions={sessions.filter((s) => s.stageId && roomIds.has(s.stageId))}
      selected={sala}
    />
  );
}
