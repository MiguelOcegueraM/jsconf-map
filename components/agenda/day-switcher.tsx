"use client";

import { motion } from "motion/react";
import { DAYS, DAY_LABELS, type Day } from "@/lib/seed-data";
import { cn } from "@/lib/utils";

export function DaySwitcher({
  value,
  onChange,
}: {
  value: Day;
  onChange: (day: Day) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Día del evento"
      className="grid grid-cols-2 gap-2"
    >
      {DAYS.map((day) => {
        const active = day === value;
        const label = DAY_LABELS[day];
        return (
          <button
            key={day}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(day)}
            className={cn(
              "relative min-h-16 rounded-2xl border px-4 py-2.5 text-left transition-colors",
              "focus-visible:ring-2 focus-visible:ring-js-indigo-500 focus-visible:outline-none",
              active
                ? "border-js-plum bg-js-plum text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300",
            )}
          >
            <span
              className={cn(
                "block text-[11px] font-semibold tracking-widest uppercase",
                active ? "text-js-yellow-400" : "text-neutral-400",
              )}
            >
              {label.n}
            </span>
            <span className="font-display mt-0.5 block text-lg leading-none">
              {label.short}
            </span>
            {active && (
              <motion.span
                layoutId="day-underline"
                className="absolute inset-x-4 bottom-2 h-0.5 rounded-full bg-js-yellow-400"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
