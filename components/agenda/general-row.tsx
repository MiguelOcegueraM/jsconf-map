import { Coffee, PartyPopper, Ticket, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Session, SessionType } from "@/lib/types";
import { SESSION_TYPE_LABELS, formatRange } from "@/lib/agenda";
import { cn } from "@/lib/utils";

const ICONS: Partial<Record<SessionType, LucideIcon>> = {
  registration: Ticket,
  coffee: Coffee,
  lunch: UtensilsCrossed,
  party: PartyPopper,
};

/**
 * Actividades generales con el rayado de las bandas de jsconf.mx. No
 * pertenecen a un escenario ni se guardan en favoritos; la fiesta va en
 * índigo noche para que se lea como el cierre del día.
 */
export function GeneralRow({ session, live = false }: { session: Session; live?: boolean }) {
  const Icon = ICONS[session.type];
  const party = session.type === "party";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[10px] border-2 border-js-indigo-900 px-4 py-2.5",
        party ? "bg-js-night text-white" : "stripes-break text-js-indigo-900",
      )}
    >
      {Icon && (
        <Icon
          className={cn("size-5 shrink-0", party ? "text-js-yellow-400" : "text-js-indigo-900")}
          aria-hidden
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[14px] leading-tight font-bold">
          {session.title ?? SESSION_TYPE_LABELS[session.type]}
        </p>
        {session.locationNote && (
          <p className="mt-0.5 truncate text-xs font-medium opacity-80">{session.locationNote}</p>
        )}
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full border px-2 text-[11px] font-semibold tabular-nums",
          party
            ? "border-white/40 bg-white/10 text-white"
            : "border-js-slate-light bg-white text-js-indigo-900",
        )}
      >
        {live ? "Ahora" : formatRange(session)}
      </span>
    </div>
  );
}
