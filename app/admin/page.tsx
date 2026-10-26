import { redirect } from "next/navigation";

/**
 * Sin base de datos ya no hay sesiones que editar a mano: el programa se
 * corrige en jsconf-agenda. El back office es el botón de sincronizar.
 */
export default function AdminPage() {
  redirect("/admin/sync");
}
