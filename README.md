# Novi — AI Chief of Staff

A fully functional build of Novi, the consumer product for **AI outcome management**.
A person states an intention in plain language; Novi turns it into a living *Mission*
(an outcome with a date, phases, dependencies and risks), works in the background,
and returns only when human judgement is required.

Built from the design handoff in `../design_handoff_novi/`. All 27 product screens plus
the marketing site are recreated faithfully and wired to a real backend.

## Stack

Monorepo, matching the OJ Studios pattern (EdgeAI, AI Revenue Agent):

- **web/** — React 18 + Vite + TypeScript SPA. Zustand store, React Router, hand-written
  CSS design system (light/dark tokens straight from the handoff).
- **server/** — Express + `node:sqlite` (Node 22+). Auth (token sessions), missions,
  actions, intelligence, agents, memory, activity, chat, autonomy — all persisted.
  - **Real AI** (`ai.js`) — when an `ANTHROPIC_API_KEY` is set, Novi uses Anthropic's
    `claude-opus-5` (structured outputs + adaptive thinking) to generate mission plans
    and answer mission-scoped chat.
  - **Deterministic fallback** (`novi.js`) — with no key configured (or if a model call
    fails), Novi falls back to a built-in engine, so the product is always fully
    functional offline. `GET /api/health` reports `{ "ai": true|false }`.

## Turning on real AI (optional)

Copy `server/.env.example` to `server/.env` and add your key:

```
ANTHROPIC_API_KEY=sk-ant-...
# NOVI_MODEL=claude-opus-5   # optional; this is the default
```

Get a key from https://console.anthropic.com/ (API Keys). Restart the server. That's it —
plan generation and chat now think for real. Without a key, everything still works on the
deterministic engine.

## Run

```bash
npm run install:all   # installs server + web deps
npm run dev:all        # API on :4000, web on :5173 (Vite proxies /api → :4000)
```

Open http://localhost:5173.

Under the Claude Code harness this is the **`novi`** launch config (`npm run dev:all`).

## Tests

```bash
npm test          # runs the API test suite (node --test)
```

18 API tests cover auth (hashed passwords, validation, dupes), missions, the plan →
create → complete flow, action resolution, memory CRUD, chat, autonomy, and 404 handling —
against an isolated temp database.

## Reliability & security

- **Passwords are hashed** with scrypt (per-user salt, constant-time compare) — never stored
  in plain text.
- **Every API route except auth/health requires a token**, and every query is scoped to the
  authenticated user, so one account can't read another's data.
- **All SQL is parameterized** (`node:sqlite` prepared statements) — no string interpolation.
- **Request hardening:** 256 KB body limit, `X-Content-Type-Options` / `X-Frame-Options` /
  `Referrer-Policy` headers, a JSON 404 for unknown API routes, and a global error handler
  that returns JSON (never an HTML stack trace).
- **The frontend has an error boundary** — a render error shows a calm recovery screen, not a
  blank page — and surfaces unexpected failures as a toast instead of failing silently.
- Known limitations (fine for a demo, worth adding for production): session tokens don't
  expire, there's no login rate-limiting, and the demo password is intentionally public.

## Demo login

```
alex@mercer.co / password123
```

Seeded with the "Move to Vancouver" mission and everything around it (actions, four
intelligence items, agents, 9 memory items, a full timeline, and the "what am I
forgetting?" list), plus three more missions. Sign-up creates a fresh empty account
and drops you straight into the mission-creation flow.

## What's wired

- **Signature onboarding** — capture → up to three tailored questions → "Novi is working"
  progress → staggered plan reveal → a real, persisted Mission. The plan is generated
  from your intention (move / save / job / business / study templates).
- **Daily surface (Home)** — focus mission, three things today, "Novi noticed", working-on,
  with a desktop right rail.
- **Action Center** — approve / decide / review / confirm. Consequential actions route
  through the **confirmation bottom sheet**, gated by your **autonomy** categories
  (an Autopilot-allowed category lets Novi act directly; everything else asks first).
- **Missions** — list, detail (phases, what matters now, Novi is handling), timeline,
  "what am I forgetting?" (grouped, reasoned, add individually or in bulk), mission-scoped
  chat with a "what moved" table.
- **Trust layer** — Intelligence feed, Agents + agent detail (activate onto a mission),
  Autonomy (change level, toggle categories), Memory (edit / delete / clear), Settings
  with the calendar error + reconnect, Permission screen.
- **Fitness — pushup alarm** — a morning alarm that **won't turn off until you do your
  pushups** (goal is configurable). While Novi is open it rings at the set time; the
  full-screen challenge is dismissed only by completing the reps — counted by tapping the
  screen (phone on the floor, tap with your nose/chin at the bottom of each rep) or by phone
  motion. Tracks a daily streak and a completion log. "Do the challenge now" tries it any
  time. (A web app can't wake a *closed* tab — add Novi to your home screen, or a future
  native app, for a true background alarm.)
- **Auth** — sign up, log in, magic-link recovery. **Dark theme** throughout (system default,
  toggle in Settings). Responsive: mobile tab bar below 1024px, desktop sidebar above.

## Notes

Social sign-in and outbound sending are stubbed (this build never actually emails anyone
or moves money — matching Novi's own promise that it "never acts without permission").
Novi's planning and chat use a real Anthropic model when a key is configured, and a
deterministic engine otherwise (see "Turning on real AI" above).
