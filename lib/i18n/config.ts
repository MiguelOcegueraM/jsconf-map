/**
 * Dos idiomas, sin prefijo en la URL: `/agenda` es la misma en español y en
 * inglés. Así no se rompen los QR de las salas, los enlaces directos ni la
 * caché offline del service worker, que guarda por ruta. El idioma vive en
 * una cookie (la lee el servidor para renderizar ya traducido) y, la primera
 * vez, sale del idioma del teléfono.
 */
export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "jsconf_lang";

export function isLocale(value: unknown): value is Locale {
  return value === "es" || value === "en";
}

/** "en-US,en;q=0.9,es;q=0.8" → el primero que tengamos. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  for (const part of (header ?? "").split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

/** Texto que existe en los dos idiomas, junto a los datos que describe. */
export type Localized<T = string> = Record<Locale, T>;

export const INTL_LOCALE: Record<Locale, string> = { es: "es-MX", en: "en-US" };
