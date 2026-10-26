"use client";

import { LOCALES } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** ES | EN como en el navbar de jsconf.mx: el activo en amarillo sobre índigo noche. */
export function LanguageSwitch() {
  const { locale, setLocale, pending, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.shell.language}
      className={cn(
        "flex shrink-0 rounded-full border-2 border-white/70 p-0.5 transition-opacity",
        pending && "opacity-60",
      )}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            disabled={pending}
            onClick={() => !active && setLocale(code)}
            className={cn(
              "font-heading min-h-8 min-w-9 rounded-full px-2 text-[13px] tracking-wide uppercase transition-colors",
              "focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-js-yellow-500",
              active ? "bg-js-yellow-500 text-js-indigo-900" : "text-white hover:bg-white/10",
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
