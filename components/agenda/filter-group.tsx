"use client";

import { cn } from "@/lib/utils";

/** Los chips de filtro de la agenda de jsconf.mx: etiqueta en versalitas y píldoras con borde. */
export function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2" role="group" aria-label={label}>
      <span className="w-11 shrink-0 text-[11px] font-bold tracking-[0.12em] text-js-slate uppercase">
        {label}
      </span>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-9 shrink-0 rounded-full border-2 border-js-indigo-900 px-3 text-[13px] font-semibold whitespace-nowrap transition-colors",
              "focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-js-yellow-500",
              active ? "bg-js-indigo-900 text-white" : "bg-white text-js-indigo-900 hover:bg-js-haze",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
