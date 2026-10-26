import type { Metadata } from "next";
import { AgendaView } from "@/components/agenda/agenda-view";
import { getAgenda } from "@/lib/queries";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { isDay } from "@/lib/agenda";
import { DAYS } from "@/lib/program";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.meta.agendaTitle, description: t.meta.agendaDescription };
}

/**
 * Renderizado dinámico a propósito: la agenda sale de la caché de datos de
 * jsconf-agenda (que el botón de /admin/sync refresca al instante) y el idioma
 * de la cookie de cada quien. El service worker conserva la última versión
 * vista para usarla sin señal.
 */
export const dynamic = "force-dynamic";

export default async function AgendaPage({ searchParams }: PageProps<"/agenda">) {
  const [agenda, params] = await Promise.all([getLocale().then(getAgenda), searchParams]);

  const dayParam = typeof params.dia === "string" ? params.dia : undefined;
  const stageParam = typeof params.escenario === "string" ? params.escenario : undefined;

  return (
    <AgendaView
      agenda={agenda}
      initialDay={dayParam && isDay(dayParam) ? dayParam : DAYS[0]}
      initialStage={
        stageParam && agenda.stages.some((s) => s.id === stageParam)
          ? stageParam
          : "todos"
      }
    />
  );
}
