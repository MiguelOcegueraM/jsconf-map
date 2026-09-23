"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Hand, Info } from "lucide-react";
import type { Agenda } from "@/lib/queries";
import type { Day } from "@/lib/seed-data";
import { DAY_LABELS } from "@/lib/seed-data";
import { groupByTime, isGeneral, stageMap } from "@/lib/agenda";
import { useFavorites } from "@/hooks/use-favorites";
import { DaySwitcher } from "./day-switcher";
import { GeneralRow } from "./general-row";
import { SessionCard } from "./session-card";
import { TimeSlotGroup } from "./time-slot-group";
import { cn } from "@/lib/utils";

const ALL = "todos";

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
  const { has, add, remove } = useFavorites();

  const stages = useMemo(() => stageMap(agenda.stages), [agenda.stages]);

  const slots = useMemo(() => {
    const ofDay = agenda.sessions.filter((s) => s.day === day);
    // El filtro por escenario nunca esconde las actividades generales: sin
    // ellas la línea de tiempo pierde las anclas de comida y descansos.
    const visible =
      stageId === ALL
        ? ofDay
        : ofDay.filter((s) => s.stageId === stageId || isGeneral(s));
    return groupByTime(visible);
  }, [agenda.sessions, day, stageId]);

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div>
        <h1 className="font-display text-2xl leading-tight text-js-plum">Agenda</h1>
        <p className="mt-1 text-sm text-neutral-600">{DAY_LABELS[day].long}</p>
      </div>

      <DaySwitcher value={day} onChange={setDay} />

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterChip active={stageId === ALL} onClick={() => setStageId(ALL)}>
          Todos
        </FilterChip>
        {agenda.stages.map((s) => (
          <FilterChip
            key={s.id}
            active={stageId === s.id}
            onClick={() => setStageId(s.id)}
          >
            {s.name}
          </FilterChip>
        ))}
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-js-blue-50 p-3 text-xs text-js-blue-900">
        <Info className="mt-px size-4 shrink-0 text-js-blue-600" aria-hidden />
        <span>
          <strong className="font-semibold">Programa preliminar.</strong> Los speakers
          están confirmados; los horarios y títulos pueden moverse hasta el día del
          evento.
        </span>
      </p>

      <p className="flex items-center gap-2 text-xs text-neutral-500">
        <Hand className="size-4 shrink-0" aria-hidden />
        Desliza una charla a la derecha para guardarla, a la izquierda para quitarla.
      </p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${day}-${stageId}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col gap-5"
        >
          {slots.map(({ time, sessions }) => (
            <TimeSlotGroup key={time} time={time}>
              {sessions.map((s) =>
                isGeneral(s) ? (
                  <GeneralRow key={s.id} session={s} />
                ) : (
                  <SessionCard
                    key={s.id}
                    session={s}
                    stage={s.stageId ? stages.get(s.stageId) : undefined}
                    isFavorite={has(s.id)}
                    onAdd={() => add(s.id)}
                    onRemove={() => remove(s.id)}
                  />
                ),
              )}
            </TimeSlotGroup>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold whitespace-nowrap",
        "transition-colors focus-visible:ring-2 focus-visible:ring-js-indigo-500 focus-visible:outline-none",
        active
          ? "border-js-plum bg-js-plum text-white"
          : "border-neutral-200 bg-white text-neutral-600",
      )}
    >
      {children}
    </button>
  );
}
