import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

/**
 * En Next.js 16 `middleware` se llama `proxy` y corre siempre en Node.js,
 * así que aquí se puede verificar el JWT con `jose` sin límites del edge.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const authed = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (authed) return NextResponse.next();

  const login = new URL("/admin/login", request.url);
  // Para devolver al organizador justo a donde iba después de entrar.
  if (pathname !== "/admin") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
