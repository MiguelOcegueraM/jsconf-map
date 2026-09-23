import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "jsconf_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

/**
 * Autenticación mínima para el back office: una contraseña maestra que los
 * organizadores comparten, canjeada por una cookie firmada HttpOnly. No hay
 * cuentas de usuario porque no hay nada por usuario que guardar.
 */
function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Falta AUTH_SECRET: el panel de admin no puede firmar sesiones.");
    }
    return new TextEncoder().encode("dev-only-secret-no-usar-en-produccion");
  }
  return new TextEncoder().encode(value);
}

/** Comparación en tiempo constante: una contraseña corta no debe filtrarse por timing. */
export function passwordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "jsconf2026";
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: MAX_AGE_SECONDS,
} as const;
