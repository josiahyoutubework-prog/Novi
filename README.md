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
  A deterministic "Novi engine" (`novi.js`) stands in for an LLM: it turns an intention
  into a structured plan and answers mission-scoped chat, so the product is fully
  functional offline.

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
The AI is a deterministic engine, not a live model; swapping in Anthropic's API is a
single module (`server/novi.js`).
