"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { CalendarDays, Map, Star } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Mapa", Icon: Map },
  { href: "/agenda", label: "Agenda", Icon: CalendarDays },
  { href: "/favoritos", label: "Favoritos", Icon: Star },
] as const;

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavPill() {
  const pathname = usePathname();
  const { ids } = useFavorites();
  const reduced = useReducedMotion();

  const activeIndex = TABS.findIndex((t) => isActive(t.href, pathname));

  return (
    <nav
      aria-label="Secciones"
      className="relative flex items-center rounded-full bg-neutral-200/70 p-1"
    >
      {/*
        El indicador se posiciona desde el índice activo, no con `layoutId`.
        Una animación de layout compartido mide la posición real de los dos
        elementos entre renders, y este menú vive en un header `sticky` dentro
        de una página que Next reinicia al tope al navegar: la medición previa
        se tomaba con la agenda scrolleada y la nueva ya arriba, así que el
        indicador salía disparado desde abajo de la pantalla. Calcularlo del
        índice lo vuelve inmune al scroll y al sticky.
      */}
      {activeIndex >= 0 && (
        <motion.span
          aria-hidden
          className="absolute top-1 bottom-1 left-1 rounded-full bg-js-red-500 shadow-sm"
          style={{ width: "calc((100% - 0.5rem) / 3)" }}
          initial={false}
          animate={{ x: `${activeIndex * 100}%` }}
          transition={
            reduced ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 38 }
          }
        />
      )}

      {TABS.map(({ href, label, Icon }) => {
        const active = isActive(href, pathname);
        const count = href === "/favoritos" ? ids.length : 0;

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative z-10 flex min-h-11 flex-1 items-center justify-center gap-1.5",
              "rounded-full px-3 text-sm font-semibold transition-colors",
              "focus-visible:ring-2 focus-visible:ring-js-indigo-500 focus-visible:outline-none",
              active ? "text-white" : "text-neutral-600 hover:text-neutral-900",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
            {count > 0 && (
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 py-px text-[11px] leading-tight font-bold tabular-nums",
                  active ? "bg-white text-js-red-600" : "bg-js-yellow-500 text-js-yellow-900",
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
