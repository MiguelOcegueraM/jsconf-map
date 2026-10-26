import type { Session, Stage } from "./types";
import { sessionHeadline, sessionSpeakers, speakerDisplayName } from "./agenda";

/**
 * Guadalajara es UTC-6 todo el año: México eliminó el horario de verano en
 * 2022, así que el desfase es constante y no hace falta arrastrar una tz db.
 */
const OFFSET_HOURS = 6;

function toUtcStamp(day: string, time: string) {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, hh + OFFSET_HOURS, mm));
  return utc.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 pide líneas de máximo 75 octetos, plegadas con un espacio. */
function fold(line: string) {
  if (line.length <= 74) return line;
  const chunks = [line.slice(0, 74)];
  let rest = line.slice(74);
  while (rest.length > 73) {
    chunks.push(" " + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  if (rest) chunks.push(" " + rest);
  return chunks.join("\r\n");
}

function escape(value: string) {
  return value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

function sessionDetails(s: Session) {
  const who = sessionSpeakers(s)
    .map((p) => [speakerDisplayName(p), p.role, p.company].filter(Boolean).join(", "))
    .join(" / ");
  return [who, s.description].filter(Boolean).join("\n\n");
}

function sessionWhere(s: Session, stages: Map<string, Stage>) {
  const stage = s.stageId ? stages.get(s.stageId) : undefined;
  return `${stage?.name ?? s.locationNote ?? "Jardín Americana"} · Jardín Americana, Guadalajara`;
}

/** Enlace "Añadir a Google Calendar" — en Android abre la app directo. */
export function googleCalendarUrl(s: Session, stages: Map<string, Stage>) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${sessionHeadline(s)} · JSConf MX`,
    dates: `${toUtcStamp(s.day, s.startTime)}/${toUtcStamp(s.day, s.endTime)}`,
    details: sessionDetails(s),
    location: sessionWhere(s, stages),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Descarga un .ics: iOS lo abre en Calendario, el escritorio en su app. */
export function downloadIcs(sessions: Session[], stages: Map<string, Stage>, filename: string) {
  const blob = new Blob([buildIcs(sessions, stages)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildIcs(sessions: Session[], stages: Map<string, Stage>) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JSConf Mexico 2026//Agenda//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:JSConf México 2026",
  ];

  for (const s of sessions) {
    const details = sessionDetails(s);

    lines.push(
      "BEGIN:VEVENT",
      `UID:${s.id}@jsconf.mx`,
      `DTSTAMP:${toUtcStamp(s.day, s.startTime)}`,
      `DTSTART:${toUtcStamp(s.day, s.startTime)}`,
      `DTEND:${toUtcStamp(s.day, s.endTime)}`,
      fold(`SUMMARY:${escape(sessionHeadline(s))}`),
      fold(`LOCATION:${escape(sessionWhere(s, stages))}`),
      ...(details ? [fold(`DESCRIPTION:${escape(details)}`)] : []),
      // El propio calendario del teléfono avisa 10 minutos antes.
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-PT10M",
      fold(`DESCRIPTION:${escape(sessionHeadline(s))}`),
      "END:VALARM",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
