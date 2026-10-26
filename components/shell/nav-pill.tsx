"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Headphones, Map, Star } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Mapa", Icon: Map },
  { href: "/agenda", label: "Agenda", Icon: CalendarDays },
  { href: "/favoritos", label: "Favoritos", Icon: Star },
  { href: "/traduccion", label: "Traducción", Icon: Headphones },
] as const;

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Las pestañas siguen a los DayTabs de jsconf.mx: borde grueso índigo, la
 * activa rellena con su sombra amarilla desplazada. Ícono arriba y texto
 * abajo, como una tab bar: cuatro pastillas a lo ancho no caben en 360 px.
 */
export function NavPill() {
  const pathname = usePathname();
  const { ids } = useFavorites();

  return (
    <nav aria-label="Secciones" className="grid grid-cols-4 gap-2">
      {TABS.map(({ href, label, Icon }) => {
        const active = isActive(href, pathname);
        const count = href === "/favoritos" ? ids.length : 0;

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-13 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-js-indigo-900 px-1",
              "text-[12px] leading-tight font-bold transition-[transform,background-color] active:translate-y-px",
              "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-js-yellow-500",
              active
                ? "bg-js-indigo-500 text-white shadow-[3px_3px_0_0_#f3ba20]"
                : "bg-white text-js-indigo-900 hover:bg-js-haze",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            {label}
            {count > 0 && (
              <span
                className={cn(
                  "absolute -top-2 -right-1.5 rounded-full border-2 border-js-indigo-900 px-1.5 text-[11px] leading-tight font-bold tabular-nums",
                  active ? "bg-js-yellow-500 text-js-indigo-900" : "bg-js-indigo-900 text-white",
                )}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
