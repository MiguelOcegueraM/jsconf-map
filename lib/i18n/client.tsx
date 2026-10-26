"use client";

import { createContext, useCallback, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

type I18n = {
  locale: Locale;
  t: Dictionary;
  setLocale: (next: Locale) => void;
  pending: boolean;
};

const I18nContext = createContext<I18n | null>(null);

/**
 * Recibe sólo el código de idioma: los diccionarios tienen funciones (para
 * plurales e interpolación) y no cruzan del servidor al cliente, así que el
 * cliente los importa directo. Son unos pocos KB.
 */
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      // Un año; la lee el servidor en cada request.
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next === "es" ? "es-MX" : "en";
      // Re-renderiza los Server Components (títulos, metadata) en el idioma nuevo.
      startTransition(() => router.refresh());
    },
    [router],
  );

  return (
    <I18nContext.Provider value={{ locale, t: dictionaries[locale], setLocale, pending }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n fuera de <I18nProvider>");
  return value;
}
