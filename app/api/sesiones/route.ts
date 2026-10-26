import { getAgenda } from "@/lib/queries";
import { getLocale } from "@/lib/i18n/server";
import { isFavoritable, sessionHeadline } from "@/lib/agenda";

export const dynamic = "force-dynamic";

export type ReminderSession = {
  id: string;
  day: string;
  startTime: string;
  title: string;
  where: string;
};

/**
 * Lo mínimo para programar recordatorios desde cualquier pantalla: id, hora,
 * título y sala de cada sesión que se puede guardar en favoritos. El idioma
 * sale de la misma cookie que el resto de la app.
 */
export async function GET() {
  const { stages, sessions } = await getAgenda(await getLocale());
  const names = new Map(stages.map((s) => [s.id, s.name]));

  const body: ReminderSession[] = sessions.filter(isFavoritable).map((s) => ({
    id: s.id,
    day: s.day,
    startTime: s.startTime,
    title: sessionHeadline(s),
    where: (s.stageId && names.get(s.stageId)) || s.locationNote || "Jardín Americana",
  }));

  return Response.json(body);
}
