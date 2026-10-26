"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, Hand, History, TriangleAlert } from "lucide-react";
import type { Agenda } from "@/lib/queries";
import type { Session } from "@/lib/types";
import { DAYS, type Day } from "@/lib/program";
import {
  groupByTime,
  isDayOver,
  isGeneral,
  sessionStatus,
  stageMap,
} from "@/lib/agenda";
import { useFavorites } from "@/hooks/use-favorites";
import { useI18n } from "@/lib/i18n/client";
import { useEventNow } from "@/hooks/use-event-now";
import { PageHero } from "@/components/shell/page-hero";
import { DaySwitcher } from "./day-switcher";
import { FilterGroup } from "./filter-group";
import { GeneralRow } from "./general-row";
import { SessionCard } from "./session-card";
import { TimeSlotGroup } from "./time-slot-group";

const ALL = "todos";
type LanguageFilter = typeof ALL | "es" | "en";
type KindFilter = typeof ALL | "keynote" | "charla" | "taller";

/** El tipo para filtrar; una patrocinada se sigue filtrando como charla. */
function kindOf(s: Session): KindFilter {
  if (s.type === "keynote") return "keynote";
  if (s.type === "workshop") return "taller";
  return "charla";
}

export function AgendaView({
  agenda,
  initialDay,
  initialStage,
}: {
  agenda: Agenda;
  initialDay: Day;
  initialStage: string;
}) {
  const [day, setDay] = useState<Day>(initialDay);
  const [stageId, setStageId] = useState(initialStage);
  const [language, setLanguage] = useState<LanguageFilter>(ALL);
  const [kind, setKind] = useState<KindFilter>(ALL);
  const [showPast, setShowPast] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const { has, add, remove } = useFavorites();
  const now = useEventNow();
  const { t } = useI18n();

  const stages = useMemo(() => stageMap(agenda.stages), [agenda.stages]);

  /**
   * Los días que ya terminaron se van: el día 2 nadie necesita ver el día 1.
   * Si ya terminó todo el evento, se vuelven a mostrar ambos días.
   */
  const days = useMemo(() => {
    if (!now) return DAYS;
    const open = DAYS.filter((d) => !isDayOver(d, agenda.sessions, now));
    return open.length > 0 ? open : DAYS;
  }, [agenda.sessions, now]);
  const eventOver = now !== null && DAYS.every((d) => isDayOver(d, agenda.sessions, now));
  const activeDay = days.includes(day) ? day : days[0];

  // Deep link `/agenda#K-01`: ese día, esa sesión abierta y a la vista.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = agenda.sessions.find((s) => s.id === id);
    if (!target) return;
    // El hash sólo existe en el navegador: se aplica en el primer frame,
    // ya hidratado, y en el siguiente se lleva la tarjeta a la vista.
    const frame = requestAnimationFrame(() => {
      setDay(target.day as Day);
      setShowPast(true);
      setOpenId(id);
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "smooth" }),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [agenda.sessions]);

  const { slots, pastCount } = useMemo(() => {
    const matches = (s: Session) =>
      isGeneral(s) ||
      ((stageId === ALL || s.stageId === stageId) &&
        (language === ALL || s.language === language) &&
        (kind === ALL || kindOf(s) === kind));
    const isPast = (s: Session) => now !== null && sessionStatus(s, now) === "past";

    const ofDay = agenda.sessions.filter((s) => s.day === activeDay && matches(s));
    const pastCount = ofDay.filter((s) => !isGeneral(s) && isPast(s)).length;
    const visible = showPast || eventOver ? ofDay : ofDay.filter((s) => !isPast(s));
    // Si los filtros dejan sólo actividades generales, no hay agenda que ver.
    const hasTalks = visible.some((s) => !isGeneral(s));
    return { slots: hasTalks ? groupByTime(visible) : [], pastCount };
  }, [agenda.sessions, activeDay, stageId, language, kind, showPast, now, eventOver]);

  const filtersActive = stageId !== ALL || language !== ALL || kind !== ALL;

  return (
    <div className="flex flex-col">
      <PageHero
        title={t.agenda.title}
        aside={
          <p className="mb-1 flex shrink-0 items-center gap-1.5 rounded-full border-2 border-js-indigo-900 bg-white px-3 py-1 text-xs font-semibold">
            <Clock className="size-3.5" aria-hidden />
            {t.agenda.timezone}
          </p>
        }
      >
        {t.agenda.intro}
      </PageHero>

      <div className="flex flex-col gap-4 border-b-[3px] border-js-indigo-900 bg-white px-4 py-4">
        {days.length > 1 ? (
          <DaySwitcher days={days} value={activeDay} onChange={setDay} />
        ) : (
          <p className="font-display text-lg text-js-indigo-900 uppercase">
            {t.days[activeDay].n}
            <span className="ml-2 font-sans text-sm font-medium normal-case">
              {t.days[activeDay].long}
            </span>
          </p>
        )}

        <div className="-mx-4 flex flex-col gap-2.5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterGroup
            label={t.agenda.filterRoom}
            value={stageId}
            onChange={setStageId}
            options={[
              { value: ALL, label: t.agenda.allRooms },
              ...agenda.stages.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
          <div className="flex gap-5">
            <FilterGroup
              label={t.agenda.filterLanguage}
              value={language}
              onChange={setLanguage}
              options={[
                { value: ALL, label: t.agenda.allLanguages },
                { value: "es", label: "ES" },
                { value: "en", label: "EN" },
              ]}
            />
            <FilterGroup
              label={t.agenda.filterType}
              value={kind}
              onChange={setKind}
              options={[
                { value: ALL, label: t.agenda.allTypes },
                { value: "keynote", label: t.agenda.keynotes },
                { value: "charla", label: t.agenda.talks },
                { value: "taller", label: t.agenda.workshops },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pt-5 pb-10">
        <div
          role="note"
          className="radius-card flex items-start gap-3 border-[3px] border-js-indigo-900 bg-js-yellow-100 px-4 py-3 text-js-indigo-900"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" strokeWidth={2.25} aria-hidden />
          <p className="text-sm leading-snug">
            <strong className="font-bold">{t.agenda.noticeTitle}</strong>{" "}
            {agenda.unavailable
              ? t.agenda.noticeUnavailable
              : eventOver
                ? t.agenda.noticeOver
                : t.agenda.noticeDefault}
          </p>
        </div>

        <p className="flex items-center gap-2 text-xs font-medium text-js-slate">
          <Hand className="size-4 shrink-0" aria-hidden />
          {t.agenda.swipeHint}
        </p>

        {pastCount > 0 && !eventOver && (
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            aria-pressed={showPast}
            className="flex min-h-10 items-center justify-center gap-2 rounded-full border-2 border-dashed border-js-slate-light px-4 text-[13px] font-semibold text-js-slate transition-colors hover:bg-js-haze"
          >
            <History className="size-4" aria-hidden />
            {showPast ? t.agenda.hidePast : t.agenda.showPast(pastCount)}
          </button>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${activeDay}-${stageId}-${language}-${kind}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-5"
          >
            {slots.length === 0 ? (
              <p className="radius-panel border-[3px] border-dashed border-js-slate-light px-6 py-8 text-center font-medium text-js-slate">
                {filtersActive ? t.agenda.noMatches : t.agenda.dayEmpty}
              </p>
            ) : (
              slots.map(({ time, sessions }) => (
                <TimeSlotGroup key={time} time={time}>
                  {sessions.map((s) => {
                    const status = now ? sessionStatus(s, now) : "upcoming";
                    return isGeneral(s) ? (
                      <GeneralRow key={s.id} session={s} live={status === "live"} />
                    ) : (
                      <SessionCard
                        key={s.id}
                        session={s}
                        stage={s.stageId ? stages.get(s.stageId) : undefined}
                        status={status}
                        defaultExpanded={openId === s.id}
                        isFavorite={has(s.id)}
                        onAdd={() => add(s.id)}
                        onRemove={() => remove(s.id)}
                      />
                    );
                  })}
                </TimeSlotGroup>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
