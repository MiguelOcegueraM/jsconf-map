import { LogOut } from "lucide-react";
import { getAgenda } from "@/lib/queries";
import { logout } from "@/lib/actions";
import { SyncButton } from "@/components/admin/sync-button";

export const metadata = { title: "Sincronizar agenda", robots: { index: false } };
export const dynamic = "force-dynamic";

function formatStamp(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));
}

/**
 * El "botón secreto": expira la copia cacheada de jsconf-agenda para que la
 * PWA muestre el programa nuevo en cuanto los organizadores lo cambian. Vive
 * detrás del login y, con SYNC_SUBDOMAIN, también en `sync.<dominio>`.
 */
export default async function SyncPage() {
  const { sessions, generatedAt, unavailable } = await getAgenda();
  const talks = sessions.filter((s) => s.speakers.length > 0).length;

  return (
    <main className="min-h-dvh bg-js-night px-4 py-8 text-js-indigo-900">
      <div className="radius-panel mx-auto flex w-full max-w-md flex-col gap-5 border-4 border-js-indigo-900 bg-white p-6 shadow-[6px_6px_0_0_#ff2d95]">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display typography-shadow text-3xl leading-tight">
            Sincronizar agenda
          </h1>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Salir"
              className="grid size-10 place-items-center rounded-full border-2 border-js-indigo-900 hover:bg-js-haze"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </form>
        </div>
        <p className="text-[15px] leading-snug">
          Trae el programa oficial de <strong>jsconf-agenda</strong> —el mismo que publica
          jsconf.mx— y la PWA lo muestra en la siguiente carga. Úsalo cada vez que cambie
          algo; sin tocarlo, se refresca solo cada 10 minutos.
        </p>
        <p className="rounded-2xl bg-js-haze px-4 py-3 text-sm">
          {unavailable ? (
            <>
              <strong>La API no respondió</strong> en la última carga: la PWA sólo muestra
              registro, comidas y fiestas.
            </>
          ) : (
            <>
              Publicado ahora: <strong>{talks}</strong> sesiones
              {/* jsconf-agenda pone `generado_en` en cada respuesta: es la hora
                  de la última consulta, no de la última edición. */}
              {generatedAt && <> · consultadas el {formatStamp(generatedAt)}</>}
            </>
          )}
        </p>
        <SyncButton />
      </div>
    </main>
  );
}
