"use client";

import { useActionState } from "react";
import { CircleCheck, RefreshCw, TriangleAlert } from "lucide-react";
import { syncAgenda, type SyncState } from "@/lib/actions";
import { cn } from "@/lib/utils";

function formatStamp(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));
}

export function SyncButton() {
  const [state, action, pending] = useActionState<SyncState>(syncAgenda, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full border-[3px] border-js-indigo-900 px-6",
          "bg-js-indigo-500 text-[17px] font-bold text-white shadow-[4px_4px_0_0_#f3ba20] transition-colors hover:bg-js-indigo-700",
          "disabled:opacity-70",
        )}
      >
        <RefreshCw className={cn("size-5", pending && "animate-spin")} aria-hidden />
        {pending ? "Sincronizando…" : "Traer la agenda ahora"}
      </button>

      <div aria-live="polite">
        {state?.ok === true && (
          <div className="radius-card flex items-start gap-3 border-[3px] border-js-indigo-900 bg-[#edf5f8] px-4 py-3 text-sm">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-js-blue-700" aria-hidden />
            <p>
              <strong className="font-bold">Agenda al día: {state.total} sesiones.</strong>{" "}
              {Object.entries(state.byDay)
                .sort()
                .map(([, n], i) => `Día ${i + 1}: ${n}`)
                .join(" · ")}
              <span className="mt-1 block text-xs text-js-slate">
                Sincronizado {formatStamp(state.at)}
              </span>
            </p>
          </div>
        )}
        {state?.ok === false && (
          <div
            role="alert"
            className="radius-card flex items-start gap-3 border-[3px] border-js-red-700 bg-js-red-50 px-4 py-3 text-sm font-medium text-js-red-800"
          >
            <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            {state.error}
          </div>
        )}
      </div>
    </form>
  );
}
