import { Coffee, PartyPopper, Ticket, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Session, SessionType } from "@/lib/db/schema";
import { GENERAL_STYLES, SESSION_TYPE_LABELS } from "@/lib/agenda";
import { cn } from "@/lib/utils";

const ICONS: Partial<Record<SessionType, LucideIcon>> = {
  registration: Ticket,
  coffee: Coffee,
  lunch: UtensilsCrossed,
  party: PartyPopper,
};

/**
 * Actividades generales: no pertenecen a un escenario, no se guardan en
 * favoritos y rompen a propósito el ritmo visual de la línea de tiempo.
 */
export function GeneralRow({ session }: { session: Session }) {
  const style = GENERAL_STYLES[session.type] ?? {
    wrapper: "bg-neutral-100 border-neutral-300 text-neutral-700",
    icon: "text-neutral-500",
  };
  const Icon = ICONS[session.type];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-dashed px-4 py-3",
        style.wrapper,
      )}
    >
      {Icon && <Icon className={cn("size-5 shrink-0", style.icon)} aria-hidden />}
      <div className="min-w-0 flex-1">
        <p className="font-heading text-[15px] leading-tight">
          {session.title ?? SESSION_TYPE_LABELS[session.type]}
        </p>
        {session.locationNote && (
          <p className="mt-0.5 truncate text-xs opacity-80">{session.locationNote}</p>
        )}
      </div>
      <span className="shrink-0 font-mono text-xs font-semibold tabular-nums opacity-90">
        {session.startTime}–{session.endTime}
      </span>
    </div>
  );
}
