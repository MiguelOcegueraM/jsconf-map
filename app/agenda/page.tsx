import type { Metadata } from "next";
import { AgendaView } from "@/components/agenda/agenda-view";
import { getAgenda } from "@/lib/queries";
import { isDay } from "@/lib/agenda";
import { DAYS } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Programa completo de JSConf México 2026, 29 y 30 de octubre.",
};

/**
 * Renderizado dinámico a propósito. Los organizadores editan la agenda desde
 * el back office durante el propio evento, y una copia estática de hasta un
 * minuto es justo lo que no quieres cuando alguien corre hacia una sala. La
 * consulta es un índice sobre (day, start_time) y el service worker se encarga
 * de que la última versión vista siga disponible sin señal.
 */
export const dynamic = "force-dynamic";

export default async function AgendaPage({ searchParams }: PageProps<"/agenda">) {
  const [agenda, params] = await Promise.all([getAgenda(), searchParams]);

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
