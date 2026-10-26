# JSConf México 2026 — attendee PWA

Venue map, schedule and personal agenda for attendees of **JSConf México 2026**
(October 29–30, Jardín Americana, Guadalajara). It looks like jsconf.mx: the
visual system — palette, Chango/Righteous/Poppins, chunky indigo borders, offset
shadows — is taken from the site's own repo (`cacao`, `apps/site-2026`).

Mobile-first, installable, usable with no signal, and **no database**: the
programme comes straight from the official jsconf-agenda API.

---

## Running the project locally

### Prerequisites

- **Node.js 20.9 or newer** (Next.js 16 dropped Node 18). Check with `node -v`.
- **npm 10+**. Nothing else — no Docker, no database, no accounts.

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

Fill in `AGENDA_API_TOKEN` (ask the organisers). Without it the app still runs,
but the schedule only shows registration, meals and parties.

**3. Start the dev server**

```bash
npm run dev
```

That's it — <http://localhost:3000>

### What you'll find

| Route | What it is |
|---|---|
| `/` | Interactive venue map. `/?zona=stage-b` opens a zone directly |
| `/agenda` | The programme. **Swipe a talk right to save it, left to remove it** |
| `/favoritos` | Your curated agenda, calendar export and reminders |
| `/traduccion` | Live translation: pick a room, follow captions or listen. `?sala=stage_a` opens a room directly (for QR codes) |
| `/admin/sync` | The "secret button" that refreshes the schedule — password **`jsconf2026`** |

Favourites live in your browser's `localStorage`, so attendees never create an
account.

### Simulating the event

The agenda hides what's already over: once day 1 ends its tab disappears, and
each talk leaves the list when it finishes (in-progress ones show *En vivo*).
Before the event that's invisible, so you can pin the clock with `?ahora=`:

```
http://localhost:3000/agenda?ahora=2026-10-30T11:45
```

### Trying offline mode, reminders and installing the app

The service worker only registers in production builds, because in development
it would fight Turbopack's hot reload. To see it working:

```bash
npm run build
npm start
```

Then, on <http://localhost:3000>:

- **Offline:** DevTools → *Network* → *Offline* and reload. The map, the
  schedule and your favourites are all still there.
- **Install:** Chrome shows an install icon in the address bar; on iOS use
  *Share → Add to Home Screen*.
- **Reminders:** in *Favoritos*, tap *Activar*. Combine with `?ahora=` to get
  a notification ten minutes before a saved talk.

---

## How the schedule stays up to date

```
jsconf-agenda API ──fetch (server, token)──▶ Next data cache, tag "agenda"
                                                 │  revalidates every 10 min
organiser taps "Traer la agenda ahora" ──updateTag("agenda")──┘  …or instantly
```

- `lib/agenda-api.ts` fetches `ponentes.json` on the server — the token never
  reaches the browser — and flattens it to one session per `sesion_id`
  (co-presented sessions get every speaker).
- `lib/program.ts` holds what the API doesn't carry: the four rooms and the
  general activities (registration, coffee, lunch, parties). Edit it there.
- `/admin/sync` expires the cached copy, refetches, and reports what's now
  published. With `SYNC_SUBDOMAIN=sync` the same page opens at the root of
  `sync.<your-domain>` (still behind the password).
- If the API is down, the app keeps working with general activities and a
  notice; each phone's service worker also keeps the last schedule it saw.

### Rooms

jsconf-agenda's `sala` values are used as-is, with the names jsconf.mx uses:

| API `sala` | Shown as | Formerly | Map zone |
|---|---|---|---|
| `stage_a` | **Stage A** | Main Stage | `stage-a` |
| `stage_b` | **Stage B** | ASYNC Stage (upstairs terrace) | `stage-b` |
| `taller_a` | **Taller A** | The Sandbox | `taller-a` |
| `taller_b` | **Taller B** | The Playground | `taller-b` |

---

## Live translation

Each room has a "runner" on Google Cloud Run that takes the stage audio, runs
it through Gemini Live and broadcasts it. The browser connects **directly** to
the runner's WebSocket (`wss://run-<room>-….a.run.app/listen`) — never through
Vercel, whose functions can't hold long-lived sockets. Listening is public and
read-only, so there are no secrets; the URLs live in `lib/translation.ts`.

- The contract is the runners' *listener guide*: a `status` message (mode
  `idle` / `test` / `live`, current session, target language), `caption`
  messages (`kind` original/translation, replaced by `id` until `finished`),
  and binary audio — 16-bit LE mono PCM, first byte = stream (0 original,
  1 translation).
- A room opens in **captions only**, so nobody's phone blasts audio in the
  middle of a talk. Picking *Traducido* or *Original* is the tap the browser
  needs to start the `AudioContext` (`lib/pcm-player.ts`).
- The socket reconnects on its own with backoff (Cloud Run closes sockets
  after about an hour), resubscribes and drops stale audio.
- Only the last six lines of each caption track are kept.
- iPhone: `navigator.audioSession.type = "playback"` lets audio play with the
  silent switch on, and a wake lock keeps the screen on — but if the user
  locks the screen, iOS suspends web audio. The room page says so.
- Taller A and Taller B show as *Próximamente* until their runners go live:
  flip `available` in `lib/translation.ts`.

---

## How it's built

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19.2 | same stack as jsconf.mx |
| Styling | Tailwind v4, jsconf.mx tokens | same look as the site |
| Data | jsconf-agenda API + Next data cache | no database to run or pay for |
| Gestures | `motion` | swipe via `drag="x"` |
| Map | hand-built SVG + `react-zoom-pan-pinch` | native pinch/zoom |
| Admin auth | master password → JWT (`jose`) in an HttpOnly cookie | one button to protect |
| Favourites | `localStorage` via `useSyncExternalStore` | no login, synced across tabs |
| Reminders | Notification API + service worker, scheduled on the device | no push server |
| Offline | hand-written service worker (`public/sw.js`) | see below |

### Environment variables

| Variable | Required | Note |
|---|---|---|
| `AGENDA_API_URL` | yes | `https://jsconf-agenda.vercel.app/api/v1/ponentes.json` |
| `AGENDA_API_TOKEN` | yes | jsconf-agenda access token. Server-only |
| `ADMIN_PASSWORD` | in production | password for `/admin/sync` |
| `AUTH_SECRET` | in production | signs the session cookie — `openssl rand -base64 32` |
| `SYNC_SUBDOMAIN` | no | e.g. `sync` → `sync.<domain>` opens the sync button |

---

## Decisions worth knowing about

**Past content disappears on its own.** Organisers asked for a clean agenda
during the event: finished days and talks are hidden, computed on the device in
Guadalajara time (UTC−6 year-round). A discreet *Ver N que ya terminaron*
button brings them back. The server always renders the full programme; the
client trims it after hydration, so there's no mismatch.

**Reminders are local, not push.** Web Push would need VAPID keys, a store of
subscriptions and a scheduler — that is, a database. Instead the device
schedules notifications for its own favourites, ten minutes before each talk.
They fire while the app (or the installed PWA) is alive, even in the
background; on iOS they require the app to be installed to the home screen.
For a guaranteed alert, *Añadir al calendario* exports `.ics` files that carry
their own 10-minute alarm, and there is a Google Calendar link per session.

**The map is a hand-drawn SVG, not the PDF.** Its geometry comes from measuring
`docs/STAGES Y DISTRIBUCION.pdf` rendered at 200dpi: relative positions are
faithful to the floor plan, but dimensions and level markers were dropped
because a 1:100 architectural drawing is unreadable on a phone. The original
plan is still available inside the app, behind the layers button.

**Session IDs are jsconf-agenda's `sesion_id`** (`K-01`, `T-17`…), stable
across edits. Favourites point at them; if a session is removed upstream, the
orphaned favourite simply stops showing up.

**The service worker is hand-written rather than `next-pwa` or Serwist.**
Serwist only has *experimental* Turbopack support, and the offline needs here
are three routes and a few assets. Because those routes are dynamic, Next sends
`Cache-Control: no-store`, so the worker rebuilds the response without that
header before storing it.

> **Note on language:** the app's interface is in Spanish, since it's aimed at
> attendees in Mexico. Code, comments, commits and this README are in English.

---

## Deploying to Vercel

1. In the Vercel project, set `AGENDA_API_URL`, `AGENDA_API_TOKEN`,
   `ADMIN_PASSWORD` and `AUTH_SECRET`.
2. Optional secret subdomain: set `SYNC_SUBDOMAIN=sync` and add
   `sync.<your-domain>` to the project's domains.
3. Deploy. There is nothing to migrate or seed.

---

## Structure

```
app/
  page.tsx                 Map (main view)
  agenda/                  Programme
  favoritos/               Curated agenda, calendar, reminders
  admin/sync/              Secret sync button
  traduccion/              Live translation: room picker and listener
  api/sesiones/            Session times for device-side reminders
  manifest.ts              PWA manifest
components/
  map/                     Venue SVG, controls, bottom sheet
  agenda/                  Swipeable cards, filters, day tabs, favourites
  shell/                   jsconf.mx-style header, navigation, page hero
  admin/                   Sync button
  translation/             Room picker, listener, caption tracks
hooks/
  use-event-now.ts         Event clock (Guadalajara), `?ahora=` override
  use-reminders.ts         Notification permission + scheduler
  use-room-listener.ts     Runner WebSocket: status, captions, reconnection
  use-wake-lock.ts         Keeps the screen on while listening
lib/
  agenda-api.ts            jsconf-agenda client (cached, tag "agenda")
  program.ts               Rooms + general activities
  translation.ts           Runner URLs and message types
  pcm-player.ts            Web Audio player for the runners' PCM
  venue.ts                 Venue geometry extracted from the PDF
  actions.ts               Login and sync Server Actions
proxy.ts                   Guards /admin, routes the sync subdomain
public/sw.js               Service worker
```
