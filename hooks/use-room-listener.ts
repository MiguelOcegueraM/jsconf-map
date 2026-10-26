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
 * El audio no pasa por el estado de React: se entrega por `onAudio`.
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
    if (!url) return;
    let attempt = 0;
    let timer: number | undefined;
    let disposed = false;

    const connect = () => {
      const socket = new WebSocket(url);
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onopen = () => {
        attempt = 0;
        setConnection("open");
        socket.send(JSON.stringify({ type: "listener", audio: audioRef.current }));
      };

      socket.onmessage = (event) => {
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
          setCaptions((prev) => ({ ...prev, [kind]: applyCaption(prev[kind], line) }));
        }
      };

      socket.onclose = () => {
        if (disposed) return;
        setConnection("reconnecting");
        onReconnectRef.current?.();
        const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
        attempt++;
        timer = window.setTimeout(connect, delay);
      };
      // `error` siempre viene seguido de `close`: ahí se reintenta.
      socket.onerror = () => socket.close();
    };

    connect();

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [url]);

  return { connection, status, captions };
}
