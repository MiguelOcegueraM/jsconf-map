"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AudioChoice,
  CaptionKind,
  CaptionLine,
  RunnerStatus,
} from "@/lib/translation";

/** Últimas líneas por pista: el historial completo tumbaría un teléfono. */
const MAX_LINES = 6;
const BACKOFF_MS = [1000, 2000, 4000, 8000, 15000];
/**
 * Un socket puede quedar "abierto" sin que llegue nada: Android congela la
 * pestaña con la pantalla apagada, o la red del venue se cae sin cerrarlo.
 * En vivo con audio llegan paquetes sin parar; con sólo subtítulos, una
 * pausa larga del ponente es normal, así que se espera más.
 */
const SILENCE_AUDIO_MS = 10_000;
const SILENCE_CAPTIONS_MS = 45_000;
/** Al volver a la app (desbloqueo, regreso de otra app, vuelve la red). */
const SILENCE_ON_RESUME_MS = 15_000;
const WATCHDOG_TICK_MS = 5_000;

export type Connection = "connecting" | "open" | "reconnecting";

type Captions = Record<CaptionKind, CaptionLine[]>;

const EMPTY: Captions = { original: [], translation: [] };

/**
 * `text` trae la línea completa hasta ese momento: si coinciden id y kind se
 * reemplaza, un id nuevo abre otra línea.
 */
function applyCaption(lines: CaptionLine[], next: CaptionLine) {
  const index = lines.findIndex((l) => l.id === next.id);
  if (index >= 0) {
    const copy = lines.slice();
    copy[index] = next;
    return copy;
  }
  return [...lines, next].slice(-MAX_LINES);
}

/**
 * Oyente de una sala. Se reconecta solo (Cloud Run corta los sockets cerca
 * de la hora, y los deploys también) y en cada conexión vuelve a suscribirse.
 * El audio no pasa por el estado de React: se entrega por `onAudio`. Los
 * subtítulos llegan en fragmentos varias veces por segundo: se acumulan y se
 * entregan a React como mucho una vez por frame.
 */
export function useRoomListener(
  url: string | null,
  audio: AudioChoice,
  onAudio: (packet: ArrayBuffer) => void,
  onReconnect?: () => void,
) {
  const [connection, setConnection] = useState<Connection>("connecting");
  const [status, setStatus] = useState<RunnerStatus | null>(null);
  const [captions, setCaptions] = useState<Captions>(EMPTY);

  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef(audio);
  const liveRef = useRef(false);
  const onAudioRef = useRef(onAudio);
  const onReconnectRef = useRef(onReconnect);

  useEffect(() => {
    onAudioRef.current = onAudio;
    onReconnectRef.current = onReconnect;
  });

  // Cambiar de stream = reenviar la suscripción por el mismo socket.
  useEffect(() => {
    audioRef.current = audio;
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "listener", audio }));
    }
  }, [audio]);

  useEffect(() => {
    liveRef.current = status?.mode === "live";
  }, [status?.mode]);

  useEffect(() => {
    if (!url) return;
    let attempt = 0;
    let timer: number | undefined;
    let disposed = false;
    let lastMessage = Date.now();
    let pending: Captions = EMPTY;
    let frame = 0;

    const flushCaptions = () => {
      frame = 0;
      setCaptions(pending);
    };

    const connect = () => {
      const socket = new WebSocket(url);
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;
      lastMessage = Date.now();

      socket.onopen = () => {
        attempt = 0;
        lastMessage = Date.now();
        setConnection("open");
        socket.send(JSON.stringify({ type: "listener", audio: audioRef.current }));
      };

      socket.onmessage = (event) => {
        lastMessage = Date.now();
        if (event.data instanceof ArrayBuffer) {
          // Puede colarse un paquete antes de que la suscripción "none" aplique.
          if (audioRef.current !== "none") onAudioRef.current(event.data);
          return;
        }
        let message: { type?: string } & Record<string, unknown>;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.type === "status") {
          setStatus(message as unknown as RunnerStatus);
        } else if (message.type === "caption") {
          const kind = message.kind === "original" ? "original" : "translation";
          const line: CaptionLine = {
            id: Number(message.id),
            lang: String(message.lang ?? ""),
            text: String(message.text ?? ""),
            finished: message.finished === true,
          };
          pending = { ...pending, [kind]: applyCaption(pending[kind], line) };
          // Con la pestaña oculta no hay frames: `pending` sigue acotado a
          // MAX_LINES y se pinta de un jalón al volver.
          frame ||= requestAnimationFrame(flushCaptions);
        }
      };

      socket.onclose = () => {
        if (!disposed) reconnect();
      };
      // `error` siempre viene seguido de `close`: ahí se reintenta.
      socket.onerror = () => socket.close();
    };

    const reconnect = () => {
      setConnection("reconnecting");
      onReconnectRef.current?.();
      const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
      attempt++;
      timer = window.setTimeout(connect, delay);
    };

    /**
     * Tira el socket actual si lleva más de `limit` sin dar señales, ya sea
     * abierto o atorado conectando (con la red muerta eso tarda minutos).
     */
    const checkSilence = (limit: number) => {
      const socket = socketRef.current;
      if (!socket || socket.readyState > WebSocket.OPEN) return;
      if (Date.now() - lastMessage < limit) return;
      // Con la red muerta `close` puede tardar en llegar: no se espera, se
      // sueltan sus handlers y se reconecta ya.
      socket.onclose = socket.onmessage = socket.onerror = null;
      socket.close();
      reconnect();
    };

    const watchdog = window.setInterval(() => {
      if (!liveRef.current) return;
      checkSilence(audioRef.current === "none" ? SILENCE_CAPTIONS_MS : SILENCE_AUDIO_MS);
    }, WATCHDOG_TICK_MS);

    const onResume = () => {
      if (document.visibilityState === "visible") checkSilence(SILENCE_ON_RESUME_MS);
    };
    document.addEventListener("visibilitychange", onResume);
    document.addEventListener("resume", onResume);
    window.addEventListener("online", onResume);

    connect();

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.clearInterval(watchdog);
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onResume);
      document.removeEventListener("resume", onResume);
      window.removeEventListener("online", onResume);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [url]);

  return { connection, status, captions };
}
