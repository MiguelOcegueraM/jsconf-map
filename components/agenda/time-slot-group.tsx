import { formatTime } from "@/lib/agenda";

/** Una fila de la línea de tiempo, como la lista móvil de jsconf.mx: hora a la izquierda. */
export function TimeSlotGroup({
  time,
  children,
}: {
  time: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={`Sesiones de las ${formatTime(time)}`} className="flex gap-3">
      <h2 className="w-11 shrink-0 pt-1 text-[15px] font-bold text-js-indigo-900 tabular-nums">
        {formatTime(time)}
      </h2>
      <div className="flex min-w-0 flex-1 flex-col gap-3">{children}</div>
    </section>
  );
}
