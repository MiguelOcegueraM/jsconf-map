"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarPlus, MapPin } from "lucide-react";
import type { Session, Stage } from "@/lib/types";
import { DAY_LABELS } from "@/lib/program";
import {
  formatRange,
  initials,
  sessionSpeakers,
  speakerDisplayName,
} from "@/lib/agenda";
import { downloadIcs, googleCalendarUrl } from "@/lib/ics";
import { isDay } from "@/lib/agenda";

const LANGUAGE_NAMES = { es: "Español", en: "Inglés" } as const;

/** Qué/dónde/quién/resumen y los atajos al calendario — el SessionDetailBody de jsconf.mx. */
export function SessionDetail({ session, stage }: { session: Session; stage?: Stage }) {
  const speakers = sessionSpeakers(session);
  const stages = new Map(stage ? [[stage.id, stage]] : []);
  const dayLabel = isDay(session.day) ? DAY_LABELS[session.day].long : session.day;

  return (
    <div className="flex flex-col gap-4 text-js-indigo-900">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="font-bold">Cuándo</dt>
        <dd>
          {dayLabel} · {formatRange(session)}
        </dd>
        <dt className="font-bold">Dónde</dt>
        <dd>{stage?.name ?? session.locationNote ?? "Jardín Americana"}</dd>
        {session.language && (
          <>
            <dt className="font-bold">Idioma</dt>
            <dd>{LANGUAGE_NAMES[session.language]}</dd>
          </>
        )}
      </dl>

      {speakers.length > 0 && (
        <ul className="flex flex-col gap-2">
          {speakers.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-js-haze p-3">
              {p.photoUrl ? (
                <Image
                  src={p.photoUrl}
                  alt=""
                  width={48}
                  height={48}
                  sizes="48px"
                  className="size-12 shrink-0 rounded-full object-cover object-top"
                />
              ) : (
                <span
                  aria-hidden
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-js-indigo-500 font-bold text-white"
                >
                  {initials(p.name)}
                </span>
              )}
              <span className="flex min-w-0 flex-col">
                <span className="font-bold">{speakerDisplayName(p)}</span>
                {(p.role || p.company) && (
                  <span className="text-sm">{[p.role, p.company].filter(Boolean).join(" · ")}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {session.sponsor && (
        <p className="text-sm font-semibold">Presentada por {session.sponsor}</p>
      )}

      <p className="text-[15px] leading-relaxed whitespace-pre-line">
        {session.description ?? "El resumen de esta sesión todavía no se publica."}
      </p>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => downloadIcs([session], stages, `jsconf-${session.id}.ics`)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-js-indigo-900 bg-js-indigo-500 px-4 text-sm font-bold text-white transition-colors hover:bg-js-indigo-700"
        >
          <CalendarPlus className="size-4" aria-hidden />
          Añadir al calendario
        </button>
        <a
          href={googleCalendarUrl(session, stages)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-js-indigo-900 bg-white px-4 text-sm font-bold text-js-indigo-900"
        >
          Google Calendar
        </a>
        {stage && (
          <Link
            href={`/?zona=${stage.zoneId}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-js-indigo-900 bg-white px-4 text-sm font-bold text-js-indigo-900"
          >
            <MapPin className="size-4" aria-hidden />
            Cómo llegar
          </Link>
        )}
      </div>
    </div>
  );
}
