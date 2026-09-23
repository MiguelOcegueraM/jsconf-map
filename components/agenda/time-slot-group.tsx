export function TimeSlotGroup({
  time,
  children,
}: {
  time: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={`Sesiones de las ${time}`}>
      <div className="mb-2 flex items-center gap-3">
        <h2 className="font-mono text-sm font-bold text-js-plum tabular-nums">{time}</h2>
        <span className="h-px flex-1 bg-neutral-200" aria-hidden />
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
