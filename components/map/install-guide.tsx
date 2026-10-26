"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, EllipsisVertical, Share, SquarePlus } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

/** El evento que Chrome dispara cuando la app es instalable (no está en lib.dom). */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function subscribeStandalone(onChange: () => void) {
  const query = window.matchMedia("(display-mode: standalone)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari en iOS no implementa display-mode para las apps de inicio.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Debajo del mapa: cómo dejar la app en la pantalla de inicio. Instalada
 * abre sin barra del navegador, funciona sin señal y es la única forma de
 * tener recordatorios en iPhone. Si ya está instalada, no se muestra.
 */
export function InstallGuide() {
  const installed = useSyncExternalStore(subscribeStandalone, isStandalone, () => false);
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const onPrompt = (e: Event) => {
      // Sin preventDefault Chrome muestra su propio banner; lo cambiamos por
      // nuestro botón, que vive junto a las instrucciones.
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  return (
    <section
      aria-labelledby="instalar-titulo"
      className="radius-panel mx-4 mt-2 mb-8 flex flex-col gap-4 border-[3px] border-js-indigo-900 bg-white p-5 text-js-indigo-900 shadow-[5px_5px_0_0_#f3ba20]"
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícono decorativo, ya en caché del SW */}
        <img
          src="/icons/apple-touch-icon.png"
          alt=""
          width={52}
          height={52}
          className="size-13 shrink-0 rounded-xl border-2 border-js-indigo-900"
        />
        <div>
          <h2 id="instalar-titulo" className="font-display text-xl leading-tight">
            {t.install.title}
          </h2>
          <p className="text-sm leading-snug">{t.install.body}</p>
        </div>
      </div>

      {prompt && (
        <button
          type="button"
          onClick={install}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-[3px] border-js-indigo-900 bg-js-indigo-500 px-5 text-[15px] font-bold text-white shadow-[4px_4px_0_0_#f3ba20] transition-colors hover:bg-js-indigo-700"
        >
          <Download className="size-4" aria-hidden />
          {t.install.button}
        </button>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Steps
          title={t.install.iosTitle}
          steps={[
            <>
              {t.install.iosStep1Before}{" "}
              <Share className="inline size-4 align-[-3px]" aria-hidden />{" "}
              <strong>{t.install.iosShare}</strong> {t.install.iosStep1}
            </>,
            <>
              {t.install.iosStep2Before}{" "}
              <SquarePlus className="inline size-4 align-[-3px]" aria-hidden />{" "}
              <strong>{t.install.iosStep2}</strong>.
            </>,
            <>
              {t.install.iosStep3Before} <strong>{t.install.iosStep3}</strong>
              {t.install.iosStep3After}
            </>,
          ]}
        />
        <Steps
          title={t.install.androidTitle}
          steps={[
            <>
              {t.install.androidStep1Before}{" "}
              <EllipsisVertical
                className="inline size-4 align-[-3px]"
                aria-label={t.install.androidMenu}
              />{" "}
              {t.install.androidStep1After}
            </>,
            <>
              {t.install.androidStep2Before} <strong>{t.install.androidStep2A}</strong>{" "}
              {t.install.androidStep2Or} <strong>{t.install.androidStep2B}</strong>.
            </>,
            <>
              {t.install.androidStep3Before} <strong>{t.install.androidStep3}</strong>.
            </>,
          ]}
        />
      </div>
    </section>
  );
}

function Steps({ title, steps }: { title: string; steps: React.ReactNode[] }) {
  return (
    <div className="rounded-2xl bg-js-haze p-4">
      <h3 className="text-[11px] font-bold tracking-[0.12em] text-js-slate uppercase">{title}</h3>
      <ol className="mt-2 flex flex-col gap-2 text-sm leading-snug">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-js-indigo-900 text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
