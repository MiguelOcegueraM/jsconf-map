# JSConf México 2026 — attendee PWA

Venue map, schedule and personal agenda for attendees of **JSConf México 2026**
(October 29–30, Jardín Americana, Guadalajara), plus a back office where the
organisers manage the programme.

Mobile-first, installable, and usable with no signal.

---

## Running the project locally

### Prerequisites

- **Node.js 20.9 or newer** (Next.js 16 dropped Node 18). Check with `node -v`.
- **npm 10+**. Nothing else — no Docker, no Postgres, no accounts. The
  development database is [PGlite](https://pglite.dev), a real Postgres compiled
  to WebAssembly that lives in the repo's own `.pglite/` folder.

### Step by step

**1. Clone the repository and install dependencies**

```bash
git clone https://github.com/MiguelOcegueraM/jsconf-map.git
cd jsconf-map
npm install
```

**2. Create your environment file**

```bash
cp .env.example .env.local
```

The defaults work as-is for local development: with no `DATABASE_URL` the app
uses PGlite, and with no `AUTH_SECRET` it signs admin sessions with a
development-only secret. Both are only required in production.

**3. Seed the schedule**

```bash
npm run db:seed
```

This creates the tables and loads the 4 stages and 38 sessions of the
provisional programme (the 23 confirmed speakers). It is idempotent — run it
again any time to get back to the initial state.

**4. Start the dev server**

```bash
npm run dev
```

That's it — <http://localhost:3000>

### What you'll find

| Route | What it is |
|---|---|
| `/` | Interactive venue map |
| `/agenda` | Both days' programme. **Swipe a talk right to save it, left to remove it** |
| `/favoritos` | Your curated agenda, stored in the browser |
| `/admin` | Back office — password **`jsconf2026`** |

Favourites live in your browser's `localStorage`, so attendees never create an
account.

### Trying offline mode and installing the app

The service worker only registers in production builds, because in development
it would fight Turbopack's hot reload. To see it working:

```bash
npm run build
npm start
```

Then, on <http://localhost:3000>:

- **Offline:** open DevTools → *Network* tab → pick *Offline* and reload. The
  map, the schedule and your favourites are all still there.
- **Install:** Chrome shows an install icon in the address bar; on iOS use
  *Share → Add to Home Screen*.

### Troubleshooting

**`Error: Aborted()`, or port 3000 busy while seeding.**
PGlite allows a single process at a time. Stop the server before running
`npm run db:seed`:

```bash
lsof -ti:3000 | xargs kill -9   # macOS / Linux
npm run db:seed
```

**The local database is in a bad state.** Delete it and reseed:

```bash
rm -rf .pglite
npm run db:seed
```

**You changed the service worker and don't see the change.** DevTools →
*Application* → *Service Workers* → *Unregister*, then reload.

---

## How it's built

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19.2 | same stack as jsconf.mx |
| Styling | Tailwind v4 + shadcn/ui on Base UI | brand tokens drop straight in as CSS vars |
| Gestures | `motion` (formerly `framer-motion`) | swipe via `drag="x"`, animated segmented control |
| Map | hand-built SVG + `react-zoom-pan-pinch` | native pinch/zoom without reinventing it |
| Database | Drizzle ORM · Neon in production, PGlite locally | one `pg-core` schema for both |
| Admin auth | master password → JWT (`jose`) in an HttpOnly cookie | there's no per-user data to store |
| Favourites | `localStorage` via `useSyncExternalStore` | no login, no server, synced across tabs |
| Offline | hand-written service worker (`public/sw.js`) | see the note below |

### Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Required | Note |
|---|---|---|
| `ADMIN_PASSWORD` | in production | back office master password |
| `AUTH_SECRET` | in production | signs the session cookie — `openssl rand -base64 32` |
| `DATABASE_URL` | in production | Neon / Vercel Postgres. Without it, local PGlite is used |

---

## Decisions worth knowing about

**The map is a hand-drawn SVG, not the PDF.** Its geometry comes from measuring
`docs/STAGES Y DISTRIBUCION.pdf` rendered at 200dpi: relative positions are
faithful to the floor plan, but dimensions and level markers were dropped
because a 1:100 architectural drawing is unreadable on a phone. The original
plan is still available inside the app, behind the layers button.

**Times are stored as `day` + local `HH:mm`, never UTC.** Guadalajara has been
UTC−6 year-round since Mexico abolished daylight saving in 2022, so converting
to UTC only introduces bugs. The `.ics` export does convert, because the format
demands it.

**Session IDs are stable (`cuid2`) and never regenerated on edit.** Favourites
live on each attendee's phone and point at those IDs; if a session is deleted,
the orphaned favourite simply stops showing up.

**`/agenda` and `/favoritos` render on every request.** Organisers edit the
programme during the event itself, and a one-minute-stale static copy is exactly
what you don't want when someone is running to a room. The service worker covers
the offline side.

**The service worker is hand-written rather than `next-pwa` or Serwist.**
`next-pwa` is unmaintained, and Serwist — its successor — only has
*experimental* Turbopack support, which is the default bundler in Next.js 16,
and requires a two-step build. The offline needs here are three routes and a few
static assets, so a ~150-line worker is cheaper and doesn't couple to the
bundler. Because those routes are dynamic, Next sends `Cache-Control: no-store`,
so the worker rebuilds the response without that header before storing it.

**The seeded programme is provisional.** As of 23 September 2026 the official
site still hasn't published times (*"The schedule isn't published yet"*). What
*is* confirmed are the 23 speakers with their roles and tracks — that's what gets
seeded, laid out over the hours the site does confirm. Talk titles are
deliberately left empty — no invented talks — and the UI shows "título por
confirmar". The back office is where the real data goes in.

> **Note on language:** the app's interface is in Spanish, since it's aimed at
> attendees in Mexico. Code, comments, commits and this README are in English.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | development server at <http://localhost:3000> |
| `npm run build` / `npm start` | production build and server |
| `npm run db:seed` | rewrites the provisional schedule |
| `npm run db:push` | applies the schema to `DATABASE_URL` (Neon) |
| `npm run db:studio` | Drizzle Studio |

> **PGlite is single-process.** Stop `npm run dev` before running `db:seed`, or
> the directory locks up. If it ends up in a bad state: `rm -rf .pglite`.

---

## Deploying to Vercel

1. Create a Postgres database on Neon (free tier) and copy its connection string.
2. In the Vercel project, set `DATABASE_URL`, `ADMIN_PASSWORD` and `AUTH_SECRET`.
3. Run `npm run db:push` with `DATABASE_URL` pointing at Neon to create the tables.
4. Run `npm run db:seed` once if you want to start from the provisional schedule.

---

## Structure

```
app/
  page.tsx                 Map (main view)
  agenda/                  Full schedule
  favoritos/               Curated agenda
  admin/                   Protected back office
  manifest.ts              PWA manifest
components/
  map/                     Venue SVG, controls, bottom sheet
  agenda/                  Swipeable cards, day switcher, favourites
  shell/                   Layout and segmented navigation
  admin/                   CRUD form
lib/
  venue.ts                 Venue geometry extracted from the PDF
  db/                      Drizzle schema and dual-driver connection
  seed-data.ts             Confirmed speakers + provisional grid
  actions.ts               Back office Server Actions
proxy.ts                   Guards /admin (Next 16 renamed `middleware`)
public/sw.js               Service worker
```
