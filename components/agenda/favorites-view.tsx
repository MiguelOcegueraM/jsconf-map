"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Agenda } from "@/lib/queries";
import { DAYS, DAY_LABELS } from "@/lib/seed-data";
import { groupByTime, stageMap } from "@/lib/agenda";
import { buildIcs } from "@/lib/ics";
import { useFavorites } from "@/hooks/use-favorites";
import { SessionCard } from "./session-card";
import { TimeSlotGroup } from "./time-slot-group";

export function FavoritesView({ agenda }: { agenda: Agenda }) {
  const { ids, has, add, remove, clear } = useFavorites();
  const stages = useMemo(() => stageMap(agenda.stages), [agenda.stages]);

  /**
   * Quitar un favorito aquí lo saca de la lista, y si era el único de su hora
   * se lleva por delante al grupo entero. Para que la animación de salida se
   * vea completa, la celda sigue en la lista hasta que termina de irse: sólo
   * entonces tocamos localStorage.
   */
  const [exiting, setExiting] = useState<string[]>([]);

  const requestRemove = useCallback((id: string) => {
    setExiting((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const finishRemove = useCallback(
    (id: string) => {
      remove(id);
      setExiting((prev) => prev.filter((v) => v !== id));
    },
    [remove],
  );

  const chosen = useMemo(
    // Filtramos contra la agenda viva: si producción borra una charla, el
    // favorito huérfano simplemente deja de aparecer.
    () => agenda.sessions.filter((s) => ids.includes(s.id)),
    [agenda.sessions, ids],
  );

  const byDay = useMemo(
    () =>
      DAYS.map((day) => ({
        day,
        slots: groupByTime(chosen.filter((s) => s.day === day)),
      })).filter((d) => d.slots.length > 0),
    [chosen],
  );

  function downloadIcs() {
    const blob = new Blob([buildIcs(chosen, stages)], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jsconf-mx-2026.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div>
        <h1 className="font-display text-2xl leading-tight text-js-plum">Mis favoritos</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {chosen.length === 0
            ? "Tu agenda curada, guardada en este dispositivo."
            : `${chosen.length} ${chosen.length === 1 ? "sesión guardada" : "sesiones guardadas"} en este dispositivo.`}
        </p>
      </div>

      {chosen.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex gap-2">
            <Button variant="outline" className="min-h-10 flex-1" onClick={downloadIcs}>
              <CalendarPlus className="size-4" />
              Añadir a mi calendario
            </Button>
            <Button
              variant="ghost"
              className="min-h-10 text-neutral-500"
              onClick={() => {
                setExiting([]);
                clear();
              }}
              aria-label="Vaciar favoritos"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {byDay.map(({ day, slots }) => (
            <section key={day} className="flex flex-col gap-4">
              <h2 className="font-heading sticky top-[104px] z-10 -mx-4 bg-white/95 px-4 py-1.5 text-sm text-js-plum backdrop-blur">
                {DAY_LABELS[day].long}
              </h2>
              {slots.map(({ time, sessions }) => (
                <TimeSlotGroup key={`${day}-${time}`} time={time}>
                  {sessions.map((s) => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      stage={s.stageId ? stages.get(s.stageId) : undefined}
                      isFavorite={has(s.id)}
                      onAdd={() => add(s.id)}
                      onRemove={() => requestRemove(s.id)}
                      removeUnmounts
                      isExiting={exiting.includes(s.id)}
                      onExited={() => finishRemove(s.id)}
                    />
                  ))}
                </TimeSlotGroup>
              ))}
            </section>
          ))}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-js-yellow-100">
        <Star className="size-7 text-js-yellow-600" />
      </span>
      <p className="font-heading text-lg text-js-plum">Todavía no guardas nada</p>
      <p className="max-w-xs text-sm text-neutral-500">
        Desliza una charla a la derecha en la agenda —o toca su estrella— y aparecerá
        aquí, ordenada por día y hora.
      </p>
      <Button className="mt-2 min-h-11" nativeButton={false} render={<Link href="/agenda" />}>
        Ir a la agenda
      </Button>
    </div>
  );
}
