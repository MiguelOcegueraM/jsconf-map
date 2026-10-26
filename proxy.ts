import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * En Next.js 16 `middleware` se llama `proxy` y corre siempre en Node.js,
 * así que aquí se puede verificar el JWT con `jose` sin límites del edge.
 *
 * Además atiende el subdominio secreto: con SYNC_SUBDOMAIN=sync,
 * `sync.<dominio>/` muestra directo el botón de sincronizar la agenda.
 * Sigue pidiendo la contraseña del back office.
 */
function isSyncHost(request: NextRequest) {
  const sub = process.env.SYNC_SUBDOMAIN;
  const host = request.headers.get("host") ?? "";
  return Boolean(sub) && host.toLowerCase().startsWith(`${sub!.toLowerCase()}.`);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const syncRoot = pathname === "/" && isSyncHost(request);

  // El mapa público pasa de largo: sólo `/` del subdominio se desvía.
  if (pathname === "/" && !syncRoot) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const authed = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
  const target = syncRoot ? "/admin/sync" : pathname;

  if (authed) {
    return syncRoot
      ? NextResponse.rewrite(new URL("/admin/sync", request.url))
      : NextResponse.next();
  }

  const login = new URL("/admin/login", request.url);
  // Para devolver al organizador justo a donde iba después de entrar.
  if (target !== "/admin") login.searchParams.set("next", target);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
