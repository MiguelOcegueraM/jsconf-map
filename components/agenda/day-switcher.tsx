"use client";

import type { Day } from "@/lib/program";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** Los DayTabs de jsconf.mx. Sólo recibe los días que aún no terminan. */
export function DaySwitcher({
  days,
  value,
  onChange,
}: {
  days: readonly Day[];
  value: Day;
  onChange: (day: Day) => void;
}) {
  const { t } = useI18n();
  return (
    <div role="tablist" aria-label={t.days.group} className="flex gap-3">
      {days.map((day) => {
        const active = day === value;
        const label = t.days[day];
        return (
          <button
            key={day}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(day)}
            className={cn(
              "radius-card flex min-h-12 flex-1 flex-col items-start border-[3px] border-js-indigo-900 px-4 py-1.5 text-left",
              "transition-transform hover:-translate-y-0.5",
              "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-js-yellow-500",
              active
                ? "bg-js-indigo-500 text-white shadow-[3px_3px_0_0_#f3ba20]"
                : "bg-white text-js-indigo-900",
            )}
          >
            <span className="font-display text-base whitespace-nowrap uppercase">{label.n}</span>
            <span className="text-xs font-medium">{label.long}</span>
          </button>
        );
      })}
    </div>
  );
}
