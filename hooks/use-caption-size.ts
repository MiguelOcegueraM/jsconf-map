"use client";

import { useSyncExternalStore } from "react";

/**
 * Tamaño de letra de los subtítulos, en pasos. Se guarda en el dispositivo:
 * quien necesita letra grande la necesita en todas las salas y los dos días.
 * Aplica a las dos pistas — la original también es para leerse.
 */

export const CAPTION_SIZES_PX = [18, 22, 27, 34] as const;
const DEFAULT_STEP = 1;
const KEY = "jsconf-mx-2026:caption-size";
const EVENT = "jsconf-caption-size-change";

function read() {
  try {
    const saved = window.localStorage.getItem(KEY);
    const step = saved === null ? NaN : Number(saved);
    if (Number.isInteger(step) && step >= 0 && step < CAPTION_SIZES_PX.length) return step;
  } catch {}
  return DEFAULT_STEP;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function setCaptionSize(step: number) {
  try {
    window.localStorage.setItem(KEY, String(step));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useCaptionSize() {
  const step = useSyncExternalStore(subscribe, read, () => DEFAULT_STEP);
  return [step, setCaptionSize] as const;
}
