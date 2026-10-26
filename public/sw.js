/**
 * Service worker de JSConf México 2026.
 *
 * Escrito a mano y no generado: Serwist —el sucesor de next-pwa— sólo tiene
 * soporte experimental para Turbopack, que es el bundler por defecto en
 * Next.js 16, y obligaba a un build en dos pasos. Las necesidades offline de
 * esta app son tres rutas y un puñado de estáticos, así que un worker propio
 * sale más barato y no se acopla al bundler.
 *
 * Objetivo: que quien ya abrió la app pueda consultar mapa, agenda y favoritos
 * sin señal — cosa nada rara en un venue con 500 personas colgadas del mismo LTE.
 */

const VERSION = "v5";
const SHELL = `jsconf-shell-${VERSION}`;
const ASSETS = `jsconf-assets-${VERSION}`;

/** Rutas que vale la pena tener listas desde la primera visita. */
const CORE_ROUTES = ["/", "/agenda", "/favoritos", "/traduccion"];
const CORE_ASSETS = [
  "/plano-original.png",
  "/brand/jsconf-light.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL);
      const assets = await caches.open(ASSETS);
      // `allSettled`: que falle un estático no debe abortar la instalación.
      await Promise.allSettled([
        ...CORE_ROUTES.map((r) => precache(shell, r)),
        ...CORE_ASSETS.map((a) => precache(assets, a)),
      ]);
      await self.skipWaiting();
    })(),
  );
});

async function precache(cache, path) {
  const response = await fetch(new Request(path, { cache: "reload" }));
  if (!response.ok) throw new Error(`No se pudo precachear ${path}`);
  await cache.put(path, await toCacheable(response));
}

/**
 * `/agenda` y `/favoritos` se renderizan en cada petición, así que Next les
 * pone `Cache-Control: no-store` — y la Cache API rechaza guardar respuestas
 * así. La directiva es una instrucción para la caché HTTP del navegador, no
 * para nuestro almacén offline, de modo que reconstruimos la respuesta sin
 * ella. Tiramos también `Vary`, porque aquí la clave es la URL y nada más:
 * Next varía por cabeceras de RSC que no queremos como parte de la llave.
 */
async function toCacheable(response) {
  const headers = new Headers(response.headers);
  headers.delete("cache-control");
  headers.delete("pragma");
  headers.delete("expires");
  headers.delete("vary");
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, ASSETS]);
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n)));
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // El back office nunca se cachea: lleva sesión y datos que deben venir frescos.
  if (url.pathname.startsWith("/admin")) return;

  // Los prefetch de React Server Components devuelven un payload distinto para
  // la misma URL. Guardarlo pisaría el HTML del que depende el modo offline.
  if (url.searchParams.has("_rsc") || request.headers.get("RSC")) return;

  // Horarios para los recordatorios: red primero, la última copia sin señal.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, ASSETS));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }

  // Los bundles de Next llevan hash en el nombre: son inmutables.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  if (/\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, ASSETS));
});

/**
 * Navegaciones: red primero para que la agenda se vea al día, con la copia
 * cacheada como red de seguridad y el mapa como último recurso.
 */
async function handleNavigation(event) {
  const cache = await caches.open(SHELL);
  try {
    const preloaded = await event.preloadResponse;
    const response = preloaded || (await fetch(event.request));
    if (response && response.ok) {
      const copy = await toCacheable(response.clone());
      await cache.put(stripQuery(event.request.url), copy);
    }
    return response;
  } catch {
    return (
      (await cache.match(stripQuery(event.request.url))) ??
      (await cache.match("/")) ??
      new Response("Sin conexión", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

/** Las rutas se cachean por pathname: `?dia=` y `?escenario=` son estado de UI. */
function stripQuery(url) {
  const { origin, pathname } = new URL(url);
  return origin + pathname;
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, await toCacheable(response.clone()));
  }
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, await toCacheable(response.clone()));
    return response;
  } catch {
    return (await cache.match(request)) ?? Response.error();
  }
}

/**
 * Tocar un recordatorio abre (o enfoca) la app en la sesión. El aviso lo
 * dispara la página con `showNotification`; aquí sólo se atiende el clic.
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? "/favoritos";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = all.find((c) => new URL(c.url).origin === self.location.origin);
      if (open) {
        await open.focus();
        return open.navigate(target);
      }
      return self.clients.openWindow(target);
    })(),
  );
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) await cache.put(request, await toCacheable(response.clone()));
      return response;
    })
    .catch(() => cached);
  return cached ?? network;
}
