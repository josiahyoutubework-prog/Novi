# Putting Novi online

Novi is packaged to deploy as **one service**: the Express server serves both the
API and the built React frontend on a single port. That means one web service, one
URL, no separate frontend/backend hosting to wire together.

Everything technical is ready — a `Dockerfile`, a `.dockerignore`, and a `render.yaml`.
The only steps left are the ones that need **your** account (creating a free host
account and clicking deploy), which no one but you can do.

---

## The one-time setup (about 10 minutes)

### Step 1 — Get the code on GitHub

The app is its own repository, pushed to **`Novi`**
(`https://github.com/josiahyoutubework-prog/Novi`). The app sits at the repo root, so
there's nothing to configure. (If you ever need to push again from
`C:\OJ Studios\Projects\Novi\app`: `git add -A && git commit -m "…" && git push`.)

### Step 2 — Deploy on Render (free)

[Render](https://render.com) has a genuinely free tier and deploys straight from a
Dockerfile. It's the simplest path.

1. Go to **render.com** and sign up (you can use "Sign in with GitHub").
2. Click **New +** → **Web Service**.
3. Connect your GitHub and pick the **`Novi`** repository.
4. Set these fields:
   - **Root Directory:** leave blank (the app is at the repo root)
   - **Runtime / Environment:** Docker (Render detects the `Dockerfile` automatically)
   - **Instance Type:** Free
5. Click **Create Web Service**.

Render builds the image and, after a couple of minutes, gives you a public URL like
`https://novi-xxxx.onrender.com`. That's your live site — share it with anyone.

> Alternative: Render can also read the included `render.yaml` — choose **New +** →
> **Blueprint** instead and point it at the repo.

---

## Other hosts (if you'd rather)

- **Railway** (railway.app) — New Project → Deploy from GitHub repo → pick `Novi`.
  Uses the same Dockerfile. Free trial credit.
- **Fly.io** (fly.io) — `fly launch` from the `Novi` checkout (needs the Fly CLI and a
  card on file even for the free allowance).

Any host that can build a Dockerfile will run Novi as-is.

---

## Turning on real AI

By default Novi runs on its built-in engine (no key needed). To have it think for real,
add an **environment variable** on your host named `ANTHROPIC_API_KEY` with your Anthropic
key. On Render: the service's **Environment** tab → **Add Environment Variable**. The app
picks it up on the next deploy; `GET /api/health` then reports `{"ai": true}`.

## Good to know

- **Demo data resets on the free tier.** Free hosts don't keep a permanent disk, so
  when the service restarts (e.g. after a redeploy, or waking from sleep), the database
  is recreated and re-seeded with the demo account. New sign-ups and missions created
  online will not survive a restart. To make data permanent, add a persistent disk
  (Render: "Disks", mount at `/app/server`) — I can adjust the config for that.
- **Free services sleep when idle** and take ~30 seconds to wake on the first visit.
- **The demo login works online too:** `alex@mercer.co` / `password123`.
- Social sign-in and outbound sending stay stubbed online, exactly as locally.

## Running the production build locally

To see exactly what the host runs:

```bash
npm run build        # builds the frontend into web/dist
npm start            # runs the server, which serves the app + API on one port
```

Then open the URL it prints (defaults to http://localhost:4000).
