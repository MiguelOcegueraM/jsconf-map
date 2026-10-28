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

const VERSION = "v6";
const SHELL = `jsconf-shell-${VERSION}`;
const ASSETS = `jsconf-assets-${VERSION}`;

/**
 * Cuánto se espera a la red antes de servir la copia guardada. Con el LTE
 * del venue saturado un fetch casi nunca falla: se queda colgado decenas de
 * segundos, y sin este límite la app se ve congelada al cambiar de pantalla.
 */
const NETWORK_TIMEOUT_MS = 3500;

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
    event.respondWith(networkFirst(event, ASSETS));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }

  // Los bundles de Next llevan hash en el nombre: son inmutables.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event, ASSETS));
    return;
  }

  if (/\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(event, ASSETS));
    return;
  }

  event.respondWith(staleWhileRevalidate(event, ASSETS));
});

/**
 * Navegaciones: red primero para que la agenda se vea al día, con la copia
 * cacheada como red de seguridad y el mapa como último recurso. Si la red
 * tarda más de NETWORK_TIMEOUT_MS y hay copia, se sirve la copia; sin copia
 * se sigue esperando a la red.
 */
function handleNavigation(event) {
  const key = stripQuery(event.request.url);
  const network = Promise.resolve(event.preloadResponse).then(
    (preloaded) => preloaded || fetch(event.request),
  );
  saveWhenReady(event, SHELL, key, network);

  return (async () => {
    const fast = await withTimeout(network).catch(() => undefined);
    if (fast) return fast;
    const shell = await caches.open(SHELL);
    const cached = await shell.match(key);
    if (cached) return cached;
    if (fast === null) {
      try {
        return await network;
      } catch {}
    }
    return (
      (await shell.match("/")) ??
      new Response("Sin conexión", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  })();
}

/** La respuesta, o `null` si no llegó a tiempo. Rechaza si la red falla. */
function withTimeout(promise) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS)),
  ]);
}

/**
 * Guarda en caché lo que traiga `responsePromise` sin retrasar la respuesta a
 * la página: antes se esperaba a descargar el cuerpo entero y guardarlo, y
 * con red lenta eso era tiempo con la pantalla en blanco. Se registra con
 * `waitUntil` de inmediato para que el worker no muera a medio guardar.
 */
function saveWhenReady(event, cacheName, key, responsePromise) {
  event.waitUntil(
    responsePromise
      .then(async (response) => {
        if (!response || !response.ok) return;
        // clone() aquí, antes de que la página empiece a leer el cuerpo.
        const copy = response.clone();
        const cache = await caches.open(cacheName);
        await cache.put(key, await toCacheable(copy));
      })
      .catch(() => {}),
  );
}

/** Las rutas se cachean por pathname: `?dia=` y `?escenario=` son estado de UI. */
function stripQuery(url) {
  const { origin, pathname } = new URL(url);
  return origin + pathname;
}

async function cacheFirst(event, cacheName) {
  const cached = await caches.match(event.request);
  if (cached) return cached;
  const network = fetch(event.request);
  saveWhenReady(event, cacheName, event.request, network);
  return network;
}

async function networkFirst(event, cacheName) {
  const network = fetch(event.request);
  saveWhenReady(event, cacheName, event.request, network);
  const fast = await withTimeout(network).catch(() => undefined);
  if (fast) return fast;
  const cached = await caches.match(event.request, { cacheName });
  if (cached) return cached;
  if (fast === null) return network.catch(() => Response.error());
  return Response.error();
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

async function staleWhileRevalidate(event, cacheName) {
  const network = fetch(event.request);
  saveWhenReady(event, cacheName, event.request, network);
  const cached = await caches.match(event.request, { cacheName });
  return cached ?? network;
}
