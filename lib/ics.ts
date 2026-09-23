import type { Session, Stage } from "./db/schema";
import { sessionHeadline } from "./agenda";

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
    const stage = s.stageId ? stages.get(s.stageId) : undefined;
    const where = stage?.name ?? s.locationNote ?? "Jardín Americana";
    const details = [s.speakerName, s.speakerRole, s.description]
      .filter(Boolean)
      .join(" — ");

    lines.push(
      "BEGIN:VEVENT",
      `UID:${s.id}@jsconf.mx`,
      `DTSTAMP:${toUtcStamp(s.day, s.startTime)}`,
      `DTSTART:${toUtcStamp(s.day, s.startTime)}`,
      `DTEND:${toUtcStamp(s.day, s.endTime)}`,
      fold(`SUMMARY:${escape(sessionHeadline(s))}`),
      fold(`LOCATION:${escape(`${where} · Jardín Americana, Guadalajara`)}`),
      ...(details ? [fold(`DESCRIPTION:${escape(details)}`)] : []),
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
