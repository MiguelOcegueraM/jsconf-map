"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReminderScheduler } from "@/hooks/use-reminders";
import { useI18n } from "@/lib/i18n/client";
import { LanguageSwitch } from "./language-switch";
import { NavPill } from "./nav-pill";

/**
 * El shell copia el navbar de jsconf.mx (cacao): barra índigo noche con el
 * borde magenta, el logo oficial y la fecha en tipografía Righteous.
 * El back office no lleva el shell de asistente.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-js-mist text-js-indigo-900 shadow-[0_0_0_1px_rgba(16,20,82,0.08)]">
      <header className="safe-top sticky top-0 z-40">
        <div className="flex items-center justify-between gap-3 border-b-4 border-js-magenta bg-js-night px-4 py-2.5">
          <Link href="/" aria-label={t.shell.home} className="shrink-0">
            <Image
              src="/brand/jsconf-light.svg"
              alt="JSConf México"
              width={670}
              height={166}
              priority
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            <p className="font-heading hidden text-right text-[13px] leading-tight text-white min-[380px]:block">
              {t.shell.dates}
              <span className="block text-[11px] tracking-[0.14em] text-js-yellow-400 uppercase">
                {t.shell.city}
              </span>
            </p>
            <LanguageSwitch />
          </div>
        </div>
        <div className="border-b-[3px] border-js-indigo-900 bg-white px-3 py-2.5">
          <NavPill />
        </div>
      </header>

      <main className="safe-bottom flex-1">{children}</main>
      <ReminderScheduler />
    </div>
  );
}
