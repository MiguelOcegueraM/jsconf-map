import type { Metadata } from "next";
import { FavoritesView } from "@/components/agenda/favorites-view";
import { getAgenda } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Mis favoritos",
  description: "Tu agenda curada de JSConf México 2026.",
};

/**
 * Renderizado dinámico a propósito. Los organizadores editan la agenda desde
 * el back office durante el propio evento, y una copia estática de hasta un
 * minuto es justo lo que no quieres cuando alguien corre hacia una sala. La
 * consulta es un índice sobre (day, start_time) y el service worker se encarga
 * de que la última versión vista siga disponible sin señal.
 */
export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  return <FavoritesView agenda={await getAgenda()} />;
}
