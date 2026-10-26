"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Captions, Headphones, Smartphone, Volume2 } from "lucide-react";
import type { Stage } from "@/lib/types";
import {
  LANGUAGE_NAMES,
  LANGUAGE_SHORT,
  type AudioChoice,
  type CaptionKind,
  type CaptionLine,
  type TranslationRoom,
} from "@/lib/translation";
import { PcmPlayer, STREAM_BYTE } from "@/lib/pcm-player";
import { useRoomListener, type Connection } from "@/hooks/use-room-listener";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { cn } from "@/lib/utils";

/**
 * Escuchar una sala. Arranca en "sólo subtítulos" para que nadie suene de
 * golpe en plena sala; el audio se elige con un tap, que además es el gesto
 * que el navegador exige para arrancar el AudioContext.
 */
export function RoomListener({ room, stage }: { room: TranslationRoom; stage: Stage }) {
  const [audio, setAudio] = useState<AudioChoice>("none");
  const [visible, setVisible] = useState<Record<CaptionKind, boolean>>({
    translation: true,
    original: true,
  });
  const [audioError, setAudioError] = useState(false);
  const playerRef = useRef<PcmPlayer | null>(null);

  const onAudio = useCallback(
    (packet: ArrayBuffer) => {
      if (audio === "none") return;
      playerRef.current?.push(packet, STREAM_BYTE[audio]);
    },
    [audio],
  );
  // Al reconectar, lo que quedaba en cola ya es viejo.
  const onReconnect = useCallback(() => playerRef.current?.flush(), []);

  const { connection, status, captions } = useRoomListener(
    room.listenerUrl,
    audio,
    onAudio,
    onReconnect,
  );

  useEffect(() => {
    if (status?.sampleRate) playerRef.current?.setSampleRate(status.sampleRate);
  }, [status?.sampleRate]);

  useEffect(() => () => void playerRef.current?.close(), []);

  // Pantalla siempre encendida mientras la sala está abierta: aun leyendo
  // sólo subtítulos, que se apague y haya que desbloquear es lo peor.
  useWakeLock(true);

  async function choose(next: AudioChoice) {
    setAudioError(false);
    if (next === "none") {
      playerRef.current?.flush();
      await playerRef.current?.stop();
    } else {
      try {
        playerRef.current ??= new PcmPlayer(status?.sampleRate ?? 16000);
        await playerRef.current.start();
        playerRef.current.flush();
      } catch {
        setAudioError(true);
        return;
      }
    }
    setAudio(next);
  }

  const source = status?.session?.language ?? "es";
  const target = status?.translationLanguage ?? (source === "es" ? "en" : "es");

  return (
    <div className="flex flex-col">
      <section className="border-b-[3px] border-js-indigo-900 bg-js-lavender px-4 pt-4 pb-5">
        <Link
          href="/traduccion"
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-js-indigo-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Salas
        </Link>
        <div className="mt-2 flex items-end justify-between gap-3">
          <h1 className="font-display typography-shadow text-[34px] leading-[1.1] text-js-indigo-900">
            {stage.name}
          </h1>
          <ConnectionBadge connection={connection} />
        </div>
      </section>

      <div className="flex flex-col gap-4 px-4 pt-5 pb-10">
        <div
          role="note"
          className="radius-card flex items-start gap-3 border-[3px] border-js-indigo-900 bg-js-yellow-100 px-4 py-3 text-js-indigo-900"
        >
          <Smartphone className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-sm leading-snug">
            <strong className="font-bold">Usuarios de iPhone:</strong> no bloqueen la
            pantalla mientras escuchan — iOS corta el audio. Si no oyes nada, revisa el
            botón de silencio del teléfono.
          </p>
        </div>

        <StatusCard status={status} />

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[11px] font-bold tracking-[0.12em] text-js-slate uppercase">
            ¿Cómo quieres seguirla?
          </legend>
          <div className="grid grid-cols-3 gap-2">
            <AudioOption
              active={audio === "none"}
              onClick={() => choose("none")}
              icon={<Captions className="size-5" aria-hidden />}
              label="Subtítulos"
              hint="sin audio"
            />
            <AudioOption
              active={audio === "translation"}
              onClick={() => choose("translation")}
              icon={<Headphones className="size-5" aria-hidden />}
              label="Traducido"
              hint={`al ${LANGUAGE_NAMES[target] ?? target}`}
            />
            <AudioOption
              active={audio === "original"}
              onClick={() => choose("original")}
              icon={<Volume2 className="size-5" aria-hidden />}
              label="Original"
              hint={`en ${LANGUAGE_NAMES[source] ?? source}`}
            />
          </div>
          {audio !== "none" && (
            <p className="text-xs font-medium text-js-slate">
              Usa audífonos para no molestar a quien está junto a ti.
            </p>
          )}
          {audioError && (
            <p role="alert" className="text-sm font-semibold text-js-red-700">
              Este navegador no dejó reproducir audio. Intenta de nuevo o sigue los
              subtítulos.
            </p>
          )}
        </fieldset>

        <CaptionTrack
          title={`Traducción · ${LANGUAGE_SHORT[target] ?? target.toUpperCase()}`}
          lines={captions.translation}
          shown={visible.translation}
          onToggle={() => setVisible((v) => ({ ...v, translation: !v.translation }))}
          emphasis
        />
        <CaptionTrack
          title={`Original · ${LANGUAGE_SHORT[source] ?? source.toUpperCase()}`}
          lines={captions.original}
          shown={visible.original}
          onToggle={() => setVisible((v) => ({ ...v, original: !v.original }))}
        />
      </div>
    </div>
  );
}

function ConnectionBadge({ connection }: { connection: Connection }) {
  const open = connection === "open";
  return (
    <span
      className="mb-1 flex shrink-0 items-center gap-1.5 rounded-full border-2 border-js-indigo-900 bg-white px-3 py-1 text-xs font-semibold"
      aria-live="polite"
    >
      <span
        className={cn("size-2 rounded-full", open ? "bg-emerald-500" : "animate-pulse bg-js-yellow-500")}
        aria-hidden
      />
      {open ? "Conectado" : connection === "connecting" ? "Conectando…" : "Reconectando…"}
    </span>
  );
}

function StatusCard({ status }: { status: ReturnType<typeof useRoomListener>["status"] }) {
  const mode = status?.mode ?? "idle";
  const badge =
    mode === "live"
      ? { text: "En vivo", className: "bg-js-red-600 text-white" }
      : mode === "test"
        ? { text: "Prueba de audio", className: "bg-js-yellow-500 text-js-indigo-900" }
        : { text: "Sin transmisión", className: "bg-js-haze text-js-slate" };

  return (
    <div className="radius-card border-[3px] border-js-indigo-900 bg-white px-4 py-3 shadow-[4px_4px_0_0_#2630c3]">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
          badge.className,
        )}
      >
        {mode === "live" && <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />}
        {badge.text}
      </span>
      {status?.session ? (
        <>
          <p className="mt-2 text-[15px] leading-snug font-bold">{status.session.title}</p>
          <p className="text-[13px] font-semibold">{status.session.speaker}</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-js-slate">
          {status
            ? "Ahora no hay traducción en esta sala. En cuanto empiece la charla, los subtítulos aparecen aquí solos."
            : "Conectando con la sala…"}
        </p>
      )}
    </div>
  );
}

function AudioOption({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "radius-card flex min-h-20 flex-col items-center justify-center gap-1 border-[3px] border-js-indigo-900 px-1 py-2 text-center",
        "transition-transform active:translate-y-px",
        "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-js-yellow-500",
        active
          ? "bg-js-indigo-500 text-white shadow-[3px_3px_0_0_#f3ba20]"
          : "bg-white text-js-indigo-900",
      )}
    >
      {icon}
      <span className="text-[13px] leading-none font-bold">{label}</span>
      <span className={cn("text-[11px] leading-none", active ? "text-white/80" : "text-js-slate")}>
        {hint}
      </span>
    </button>
  );
}

function CaptionTrack({
  title,
  lines,
  shown,
  onToggle,
  emphasis = false,
}: {
  title: string;
  lines: CaptionLine[];
  shown: boolean;
  onToggle: () => void;
  emphasis?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Siempre pegado a la última línea conforme entra texto.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <section className="radius-card border-[3px] border-js-indigo-900 bg-white">
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
        <h2 className="text-[11px] font-bold tracking-[0.12em] text-js-slate uppercase">{title}</h2>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={shown}
          className="rounded-full border-2 border-js-indigo-900 px-2.5 py-0.5 text-[11px] font-bold"
        >
          {shown ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {shown && (
        <div
          ref={scrollRef}
          aria-live="polite"
          className={cn(
            "flex max-h-56 flex-col gap-1.5 overflow-y-auto px-4 pb-4",
            emphasis ? "text-[19px] leading-snug" : "text-[15px] leading-snug",
          )}
        >
          {lines.length === 0 ? (
            <p className="text-sm text-js-slate">Los subtítulos aparecen aquí en cuanto alguien habla.</p>
          ) : (
            lines.map((line) => (
              <p
                key={line.id}
                className={cn(
                  "transition-colors",
                  line.finished ? "font-medium text-js-indigo-900" : "text-js-slate italic",
                )}
              >
                {line.text}
              </p>
            ))
          )}
        </div>
      )}
    </section>
  );
}
