"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock, Headphones } from "lucide-react";
import type { Session, Stage } from "@/lib/types";
import { TRANSLATION_ROOMS, translationRoom } from "@/lib/translation";
import { formatTime, sessionHeadline, sessionStatus } from "@/lib/agenda";
import { useEventNow } from "@/hooks/use-event-now";
import { PageHero } from "@/components/shell/page-hero";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { RoomListener } from "./room-listener";

export function TranslationView({
  stages,
  sessions,
  selected,
}: {
  stages: Stage[];
  sessions: Session[];
  selected: string | null;
}) {
  const stage = stages.find((s) => s.id === selected);
  const room = translationRoom(selected);

  if (stage && room?.available) {
    // key: al cambiar de sala se desmonta todo (socket, audio, subtítulos).
    return <RoomListener key={room.stageId} room={room} stage={stage} />;
  }
  if (stage && room) return <ComingSoon stage={stage} />;
  return <RoomPicker stages={stages} sessions={sessions} />;
}

function RoomPicker({ stages, sessions }: { stages: Stage[]; sessions: Session[] }) {
  const now = useEventNow();
  const { t } = useI18n();

  /** Lo que pasa ahora en la sala, o lo siguiente de hoy. */
  function happening(stageId: string) {
    if (!now) return null;
    const today = sessions
      .filter((s) => s.stageId === stageId && s.day === now.slice(0, 10))
      .filter((s) => sessionStatus(s, now) !== "past");
    const live = today.find((s) => sessionStatus(s, now) === "live");
    if (live) return { label: t.translation.nowOn, session: live };
    const next = today[0];
    return next ? { label: t.translation.at(formatTime(next.startTime)), session: next } : null;
  }

  return (
    <div className="flex flex-col">
      <PageHero title={t.translation.title}>{t.translation.intro}</PageHero>

      <div className="flex flex-col gap-4 px-4 pt-5 pb-10">
        {TRANSLATION_ROOMS.map((room) => {
          const stage = stages.find((s) => s.id === room.stageId);
          if (!stage) return null;
          const info = room.available ? happening(stage.id) : null;

          return (
            <Link
              key={room.stageId}
              href={`/traduccion?sala=${room.stageId}`}
              aria-disabled={!room.available}
              className={cn(
                "radius-card flex items-center gap-4 border-[3px] px-4 py-4 text-js-indigo-900",
                "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-js-yellow-500",
                room.available
                  ? "border-js-indigo-900 bg-white shadow-[4px_4px_0_0_#2630c3] transition-transform active:translate-y-px"
                  : "border-dashed border-js-slate-light bg-js-haze text-js-slate",
              )}
            >
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-full border-[3px]",
                  room.available
                    ? "border-js-indigo-900 bg-js-yellow-500"
                    : "border-js-slate-light bg-white",
                )}
              >
                {room.available ? (
                  <Headphones className="size-5" aria-hidden />
                ) : (
                  <Clock className="size-5" aria-hidden />
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-xl leading-none uppercase">{stage.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-px text-[11px] font-bold",
                      room.available
                        ? "bg-js-indigo-900 text-white"
                        : "border-2 border-js-slate-light text-js-slate",
                    )}
                  >
                    {room.available ? t.translation.available : t.translation.soon}
                  </span>
                </span>
                {info && (
                  <span className="truncate text-[13px]">
                    <strong className="font-bold">{info.label}:</strong>{" "}
                    {sessionHeadline(info.session, t.card.untitled)}
                  </span>
                )}
              </span>
              {room.available && <ChevronRight className="size-5 shrink-0" aria-hidden />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ComingSoon({ stage }: { stage: Stage }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col">
      <PageHero title={stage.name} />
      <div className="flex flex-col gap-4 px-4 pt-5 pb-10">
        <div className="radius-panel flex flex-col items-center gap-3 border-[3px] border-dashed border-js-slate-light px-6 py-10 text-center text-js-indigo-900">
          <span className="grid size-14 place-items-center rounded-full border-[3px] border-js-indigo-900 bg-js-yellow-500">
            <Clock className="size-7" aria-hidden />
          </span>
          <p className="font-display text-lg">{t.translation.soonTitle}</p>
          <p className="max-w-xs text-sm text-js-slate">{t.translation.soonBody(stage.name)}</p>
          <Link
            href="/traduccion"
            className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full border-[3px] border-js-indigo-900 bg-js-indigo-500 px-6 text-[15px] font-bold text-white shadow-[4px_4px_0_0_#f3ba20]"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t.translation.seeRooms}
          </Link>
        </div>
      </div>
    </div>
  );
}
