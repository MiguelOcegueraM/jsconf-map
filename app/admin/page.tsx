import Link from "next/link";
import { LogOut, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAgenda } from "@/lib/queries";
import { logout } from "@/lib/actions";
import { DAYS, DAY_LABELS } from "@/lib/seed-data";
import { SESSION_TYPE_LABELS, isGeneral, stageAccent, sessionHeadline } from "@/lib/agenda";
import { cn } from "@/lib/utils";

export const metadata = { title: "Back office" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { stages, sessions } = await getAgenda();
  const byId = new Map(stages.map((s) => [s.id, s]));

  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-js-plum">Back office</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {sessions.length} sesiones · {stages.length} escenarios
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm" className="text-neutral-500">
            <LogOut className="size-4" />
            Salir
          </Button>
        </form>
      </header>

      <Button
        className="mt-4 h-11 w-full"
        nativeButton={false}
        render={<Link href="/admin/sesion/nueva" />}
      >
        <Plus className="size-4" />
        Nueva sesión
      </Button>

      {DAYS.map((day) => {
        const ofDay = sessions.filter((s) => s.day === day);
        return (
          <section key={day} className="mt-8">
            <h2 className="font-heading text-sm tracking-wide text-neutral-500 uppercase">
              {DAY_LABELS[day].long} · {ofDay.length}
            </h2>

            <ul className="mt-3 flex flex-col gap-1.5">
              {ofDay.map((s) => {
                const stage = s.stageId ? byId.get(s.stageId) : undefined;
                return (
                  <li key={s.id}>
                    <Link
                      href={`/admin/sesion/${s.id}`}
                      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                    >
                      <span
                        className={cn(
                          "w-1 shrink-0 self-stretch rounded-full",
                          isGeneral(s) ? "bg-neutral-300" : stageAccent(s.stageId).bar,
                        )}
                        aria-hidden
                      />
                      <span className="w-24 shrink-0 font-mono text-xs text-neutral-600 tabular-nums">
                        {s.startTime}–{s.endTime}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-js-plum">
                          {sessionHeadline(s)}
                        </span>
                        <span className="block truncate text-xs text-neutral-500">
                          {SESSION_TYPE_LABELS[s.type]}
                          {stage ? ` · ${stage.name}` : s.locationNote ? ` · ${s.locationNote}` : ""}
                        </span>
                      </span>
                      <Pencil className="size-4 shrink-0 text-neutral-400" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
