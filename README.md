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
- **Auth** — sign up, log in, magic-link recovery. **Dark theme** throughout (system default,
  toggle in Settings). Responsive: mobile tab bar below 1024px, desktop sidebar above.

## Notes

Social sign-in and outbound sending are stubbed (this build never actually emails anyone
or moves money — matching Novi's own promise that it "never acts without permission").
Novi's planning and chat use a real Anthropic model when a key is configured, and a
deterministic engine otherwise (see "Turning on real AI" above).
