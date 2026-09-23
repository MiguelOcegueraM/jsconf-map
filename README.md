# JSConf México 2026 — PWA para asistentes

Mapa del venue, agenda y agenda curada para los asistentes de
**JSConf México 2026** (29 y 30 de octubre, Jardín Americana, Guadalajara),
más un back office para que los organizadores administren el programa.

Mobile-first, instalable y utilizable sin señal.

---

## Correr el proyecto en local

### Requisitos

- **Node.js 20.9 o superior** (Next.js 16 no soporta Node 18). Compruébalo con `node -v`.
- **npm 10+**. No hace falta Docker, ni Postgres, ni ninguna cuenta: la base de
  datos de desarrollo es [PGlite](https://pglite.dev), un Postgres real
  compilado a WebAssembly que vive en la carpeta `.pglite/` del propio
  repositorio.

### Paso a paso

**1. Clona el repositorio e instala las dependencias**

```bash
git clone https://github.com/MiguelOcegueraM/jsconf-map.git
cd jsconf-map
npm install
```

**2. Crea tu archivo de variables de entorno**

```bash
cp .env.example .env.local
```

Para desarrollo local los valores por defecto funcionan tal cual: sin
`DATABASE_URL` la app usa PGlite, y sin `AUTH_SECRET` firma las sesiones del
admin con un secreto de desarrollo. Sólo son obligatorias en producción.

**3. Siembra la agenda**

```bash
npm run db:seed
```

Crea las tablas y carga los 4 escenarios y las 38 sesiones del programa
preliminar (los 23 speakers confirmados). Es idempotente: puedes repetirlo
cuando quieras para volver al estado inicial.

**4. Levanta el servidor de desarrollo**

```bash
npm run dev
```

Listo — <http://localhost:3000>

### Qué vas a ver

| Ruta | Qué es |
|---|---|
| `/` | Mapa interactivo del venue |
| `/agenda` | Programa de ambos días. **Desliza una charla a la derecha para guardarla, a la izquierda para quitarla** |
| `/favoritos` | Tu agenda curada, guardada en el navegador |
| `/admin` | Back office — contraseña **`jsconf2026`** |

Los favoritos viven en el `localStorage` de tu navegador, así que no necesitas
crear ninguna cuenta.

### Probar el modo offline y la instalación como app

El service worker sólo se registra en builds de producción, porque en
desarrollo se pelearía con el hot reload de Turbopack. Para verlo funcionando:

```bash
npm run build
npm start
```

Después, en <http://localhost:3000>:

- **Offline:** abre las DevTools → pestaña *Network* → selecciona *Offline* y
  recarga. El mapa, la agenda y los favoritos siguen ahí.
- **Instalar:** en Chrome aparece el icono de instalar en la barra de
  direcciones; en iOS, *Compartir → Añadir a pantalla de inicio*.

### Si algo falla

**`Error: Aborted()` o el puerto 3000 ocupado al sembrar.**
PGlite sólo admite un proceso a la vez. Detén el servidor antes de correr
`npm run db:seed`:

```bash
lsof -ti:3000 | xargs kill -9   # macOS / Linux
npm run db:seed
```

**La base local quedó en mal estado.** Bórrala y vuelve a sembrar:

```bash
rm -rf .pglite
npm run db:seed
```

**Cambiaste el service worker y no ves el cambio.** DevTools →
*Application* → *Service Workers* → *Unregister*, y recarga.

---

## Cómo está armado

| Capa | Elección | Por qué |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19.2 | mismo stack que jsconf.mx |
| Estilos | Tailwind v4 + shadcn/ui sobre Base UI | los tokens de marca entran como CSS vars |
| Gestos | `motion` (ex `framer-motion`) | swipe con `drag="x"` y el pill animado con `layoutId` |
| Mapa | SVG propio + `react-zoom-pan-pinch` | pinch/zoom nativo sin reinventarlo |
| Base de datos | Drizzle ORM · Neon en producción, PGlite en local | mismo esquema `pg-core` en ambos |
| Auth admin | contraseña maestra → JWT (`jose`) en cookie HttpOnly | no hay nada por usuario que guardar |
| Favoritos | `localStorage` vía `useSyncExternalStore` | sin login, sin servidor, sincronizado entre pestañas |
| Offline | service worker propio (`public/sw.js`) | ver nota abajo |

### Variables de entorno

Copia `.env.example` a `.env.local`:

| Variable | Obligatoria | Nota |
|---|---|---|
| `ADMIN_PASSWORD` | en producción | contraseña maestra del back office |
| `AUTH_SECRET` | en producción | firma la cookie de sesión — `openssl rand -base64 32` |
| `DATABASE_URL` | en producción | Postgres de Neon / Vercel. Sin ella se usa PGlite local |

---

## Decisiones que conviene conocer

**El mapa es un SVG dibujado a mano, no el PDF.** La geometría sale de medir
`docs/STAGES Y DISTRIBUCION.pdf` renderizado a 200dpi: las posiciones relativas
son fieles al plano, pero se quitaron cotas y niveles porque un plano 1:100 es
ilegible en un teléfono. El plano original sigue disponible dentro de la app,
detrás del botón de capas.

**Las horas se guardan como `day` + `HH:mm` locales, nunca en UTC.** Guadalajara
es UTC−6 todo el año desde que México eliminó el horario de verano en 2022, así
que convertir a UTC sólo aporta bugs. La exportación `.ics` sí convierte, porque
el formato lo exige.

**Los IDs de sesión son estables (`cuid2`) y no se regeneran al editar.** Los
favoritos viven en el teléfono de cada asistente y apuntan a esos IDs; si una
sesión se borra, el favorito huérfano simplemente deja de aparecer.

**`/agenda` y `/favoritos` se renderizan en cada petición.** Los organizadores
editan el programa durante el propio evento y una copia estática de un minuto es
justo lo que no quieres cuando alguien va corriendo a una sala. El service worker
cubre la parte offline.

**El service worker está escrito a mano en vez de usar `next-pwa` o Serwist.**
`next-pwa` está sin mantenimiento y Serwist —su sucesor— sólo tiene soporte
*experimental* para Turbopack, que es el bundler por defecto en Next.js 16, con
un build en dos pasos. Las necesidades offline aquí son tres rutas y unos
estáticos, así que un worker de ~150 líneas sale más barato y no se acopla al
bundler. Al ser rutas dinámicas, Next les pone `Cache-Control: no-store`, y el
worker reconstruye la respuesta sin esa cabecera antes de guardarla.

**El programa sembrado es preliminar.** Al 23 de septiembre de 2026 el sitio
oficial aún no publica horarios (*"The schedule isn't published yet"*). Lo que sí
está confirmado son los 23 speakers con su cargo y track: eso es lo que se
siembra, repartido en una parrilla plausible sobre los horarios que el sitio sí
confirma. Los títulos van vacíos a propósito —no se inventan charlas— y la UI
muestra «título por confirmar». El back office es donde entran los datos reales.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | desarrollo en <http://localhost:3000> |
| `npm run build` / `npm start` | build y servidor de producción |
| `npm run db:seed` | reescribe la agenda preliminar |
| `npm run db:push` | aplica el esquema a `DATABASE_URL` (Neon) |
| `npm run db:studio` | Drizzle Studio |

> **PGlite es de un solo proceso.** Detén `npm run dev` antes de correr
> `db:seed`, o el directorio se bloquea. Si queda en mal estado: `rm -rf .pglite`.

---

## Desplegar en Vercel

1. Crea una base Postgres en Neon (plan gratuito) y copia su connection string.
2. En el proyecto de Vercel define `DATABASE_URL`, `ADMIN_PASSWORD` y `AUTH_SECRET`.
3. `npm run db:push` con `DATABASE_URL` apuntando a Neon para crear las tablas.
4. `npm run db:seed` una sola vez si quieres partir de la agenda preliminar.

---

## Estructura

```
app/
  page.tsx                 Mapa (vista principal)
  agenda/                  Agenda general
  favoritos/               Agenda curada
  admin/                   Back office protegido
  manifest.ts              Manifiesto PWA
components/
  map/                     SVG del venue, controles, bottom sheet
  agenda/                  Celdas swipeables, selector de día, favoritos
  shell/                   Layout y menú pill
  admin/                   Formulario CRUD
lib/
  venue.ts                 Geometría del venue extraída del PDF
  db/                      Esquema Drizzle y conexión dual
  seed-data.ts             Speakers confirmados + parrilla preliminar
  actions.ts               Server Actions del back office
proxy.ts                   Guarda /admin (en Next 16 `middleware` es `proxy`)
public/sw.js               Service worker
```
