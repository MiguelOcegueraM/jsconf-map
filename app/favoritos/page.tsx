import type { Metadata } from "next";
import { FavoritesView } from "@/components/agenda/favorites-view";
import { getAgenda } from "@/lib/queries";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.meta.favoritesTitle, description: t.meta.favoritesDescription };
}

/**
 * Renderizado dinámico a propósito: la agenda sale de la caché de datos de
 * jsconf-agenda (que el botón de /admin/sync refresca al instante) y el idioma
 * de la cookie de cada quien. El service worker conserva la última versión
 * vista para usarla sin señal.
 */
export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  return <FavoritesView agenda={await getAgenda(await getLocale())} />;
}
