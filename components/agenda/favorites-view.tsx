"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, BellRing, CalendarPlus, History, Star, Trash2 } from "lucide-react";
import type { Agenda } from "@/lib/queries";
import { DAYS } from "@/lib/program";
import { groupByTime, isDayOver, sessionStatus, stageMap } from "@/lib/agenda";
import { downloadIcs } from "@/lib/ics";
import { useFavorites } from "@/hooks/use-favorites";
import { useEventNow } from "@/hooks/use-event-now";
import { REMINDER_LEAD_MIN, useReminders } from "@/hooks/use-reminders";
import { PageHero } from "@/components/shell/page-hero";
import { useI18n } from "@/lib/i18n/client";
import { SessionCard } from "./session-card";
import { TimeSlotGroup } from "./time-slot-group";

export function FavoritesView({ agenda }: { agenda: Agenda }) {
  const { ids, has, add, remove, clear } = useFavorites();
  const stages = useMemo(() => stageMap(agenda.stages), [agenda.stages]);
  const now = useEventNow();
  const [showPast, setShowPast] = useState(false);
  const { t } = useI18n();

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

  const isPast = useCallback(
    (s: (typeof chosen)[number]) => now !== null && sessionStatus(s, now) === "past",
    [now],
  );
  const pastCount = chosen.filter(isPast).length;
  const upcoming = chosen.filter((s) => !isPast(s));

  const byDay = useMemo(
    () =>
      DAYS.filter((day) => showPast || !now || !isDayOver(day, agenda.sessions, now))
        .map((day) => ({
          day,
          slots: groupByTime(
            chosen.filter((s) => s.day === day && (showPast || !isPast(s))),
          ),
        }))
        .filter((d) => d.slots.length > 0),
    [agenda.sessions, chosen, isPast, now, showPast],
  );

  return (
    <div className="flex flex-col">
      <PageHero title={t.favorites.title}>
        {chosen.length === 0 ? t.favorites.emptyIntro : t.favorites.count(chosen.length)}
      </PageHero>

      <div className="flex flex-col gap-4 px-4 pt-5 pb-10">
        {chosen.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => downloadIcs(upcoming.length ? upcoming : chosen, stages, t.favorites.icsFile)}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border-[3px] border-js-indigo-900 bg-js-indigo-500 px-4 text-[15px] font-bold text-white shadow-[4px_4px_0_0_#f3ba20] transition-colors hover:bg-js-indigo-700"
              >
                <CalendarPlus className="size-4" aria-hidden />
                {t.favorites.addAll}
              </button>
              <button
                type="button"
                onClick={() => {
                  setExiting([]);
                  clear();
                }}
                aria-label={t.favorites.clear}
                className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-js-indigo-900 bg-white text-js-indigo-900 hover:bg-js-haze"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>

            <ReminderToggle />

            {pastCount > 0 && (
              <button
                type="button"
                onClick={() => setShowPast((v) => !v)}
                aria-pressed={showPast}
                className="flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-dashed border-js-slate-light px-4 text-[13px] font-semibold text-js-slate transition-colors hover:bg-js-haze"
              >
                <History className="size-4" aria-hidden />
                {showPast ? t.favorites.hidePast : t.favorites.showPast(pastCount)}
              </button>
            )}

            {byDay.length === 0 && (
              <p className="radius-panel border-[3px] border-dashed border-js-slate-light px-6 py-8 text-center font-medium text-js-slate">
                {t.favorites.allPast}
              </p>
            )}

            {byDay.map(({ day, slots }) => (
              <section key={day} className="flex flex-col gap-4">
                <h2 className="font-display sticky top-[135px] z-10 -mx-4 border-y-2 border-js-indigo-900 bg-js-lavender px-4 py-1.5 text-sm text-js-indigo-900 uppercase">
                  {t.days[day].n}
                  <span className="ml-2 font-sans text-xs font-medium normal-case">
                    {t.days[day].long}
                  </span>
                </h2>
                {slots.map(({ time, sessions }) => (
                  <TimeSlotGroup key={`${day}-${time}`} time={time}>
                    {sessions.map((s) => (
                      <SessionCard
                        key={s.id}
                        session={s}
                        stage={s.stageId ? stages.get(s.stageId) : undefined}
                        status={now ? sessionStatus(s, now) : "upcoming"}
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
    </div>
  );
}

function ReminderToggle() {
  const { state, enable, disable } = useReminders();
  const { t } = useI18n();
  if (state === "unsupported") {
    return (
      <p className="radius-card flex items-start gap-3 border-2 border-js-slate-light bg-white px-4 py-3 text-sm text-js-slate">
        <BellOff className="mt-0.5 size-5 shrink-0" aria-hidden />
        {t.reminders.unsupported}
      </p>
    );
  }

  const on = state === "on";
  return (
    <div className="radius-card flex items-center gap-3 border-[3px] border-js-indigo-900 bg-white px-4 py-3 text-js-indigo-900">
      {on ? (
        <BellRing className="size-5 shrink-0 text-js-indigo-500" aria-hidden />
      ) : (
        <Bell className="size-5 shrink-0" aria-hidden />
      )}
      <p className="min-w-0 flex-1 text-sm leading-snug">
        <strong className="font-bold">{t.reminders.title}</strong>
        <span className="block text-xs text-js-slate">
          {state === "denied"
            ? t.reminders.denied
            : t.reminders.description(REMINDER_LEAD_MIN)}
        </span>
      </p>
      {state !== "denied" && (
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => (on ? disable() : enable())}
          className={
            on
              ? "min-h-9 shrink-0 rounded-full border-2 border-js-indigo-900 bg-js-indigo-900 px-3.5 text-[13px] font-bold text-white"
              : "min-h-9 shrink-0 rounded-full border-2 border-js-indigo-900 bg-js-yellow-500 px-3.5 text-[13px] font-bold text-js-indigo-900"
          }
        >
          {on ? t.reminders.enabled : t.reminders.enable}
        </button>
      )}
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="radius-panel flex flex-col items-center gap-3 border-[3px] border-dashed border-js-slate-light px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full border-[3px] border-js-indigo-900 bg-js-yellow-500">
        <Star className="size-7 text-js-indigo-900" />
      </span>
      <p className="font-display text-lg text-js-indigo-900">{t.favorites.emptyTitle}</p>
      <p className="max-w-xs text-sm text-js-slate">
        {t.favorites.emptyBody}
      </p>
      <Link
        href="/agenda"
        className="mt-2 inline-flex min-h-12 items-center rounded-full border-[3px] border-js-indigo-900 bg-js-indigo-500 px-6 text-[15px] font-bold text-white shadow-[4px_4px_0_0_#f3ba20] transition-colors hover:bg-js-indigo-700"
      >
        {t.favorites.goToAgenda}
      </Link>
    </div>
  );
}
