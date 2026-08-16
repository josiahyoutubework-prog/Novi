# Deploying Novi on a Hostinger VPS

Novi is a Node.js app, so it needs a **VPS (Hostinger KVM plan)** — not the regular
web/shared hosting (that only runs PHP). On a VPS it runs as one Docker container that
serves the whole app on port 80, with the database kept in a persistent volume so your
data survives restarts.

Everything below is copy-paste. Total time: ~15 minutes.

---

## 1. Set up the VPS

1. In **hPanel** → **VPS**, pick a **KVM** plan (the smallest, KVM 1, is plenty).
2. When it asks for an **OS / template**, choose one with **Docker preinstalled**
   (Hostinger lists it as **"Ubuntu 24.04 with Docker"** or an **"Docker"** application
   template). That skips installing Docker yourself.
3. Set a **root password** when prompted and finish setup.
4. On the VPS **Overview** page, note the **IP address** (looks like `84.32.x.x`).

## 2. Connect to it

On your Windows PC, open **PowerShell** and run (use your real IP):

```bash
ssh root@YOUR_VPS_IP
```

Type `yes` if it asks about authenticity, then enter the root password. You're now
"inside" the server.

> If you did **not** pick the Docker template, install Docker first:
> ```bash
> curl -fsSL https://get.docker.com | sh
> ```

## 3. Get the code and start it

```bash
git clone https://github.com/josiahyoutubework-prog/Novi.git
cd Novi
docker compose up -d --build
```

The first build takes 2–4 minutes. When it finishes, Novi is running.

> If `git clone` asks for a username/password, the repo is **private**. Easiest fix:
> on GitHub, open the repo → **Settings** → **General** → **Danger Zone** →
> **Change visibility** → **Public** (there are no passwords or secrets in the code).
> Then run the `git clone` again.

## 4. Open the firewall

In **hPanel** → **VPS** → **Firewall**, add a rule allowing inbound **TCP port 80**
(HTTP). If the server also uses `ufw`, run:

```bash
ufw allow 80
```

## 5. Visit your site

Open **`http://YOUR_VPS_IP`** in a browser. Novi is live. Log in with
`alex@mercer.co` / `password123`.

---

## Updating later

When I make changes and push them to GitHub, update the live site with:

```bash
cd Novi
git pull
docker compose up -d --build
```

Your data (accounts, missions) is kept in a Docker volume, so it survives updates.

## Useful commands

```bash
docker compose logs -f        # watch the live logs (Ctrl+C to stop watching)
docker compose restart        # restart the app
docker compose down           # stop the app (data is kept)
```

## Turn on real AI (optional)

To have Novi actually think (real plans and chat via Anthropic), set your key before
starting — either export it in the shell, or create a `.env` file next to
`docker-compose.yml`:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-your-key" > .env
docker compose up -d --build
```

Compose passes it into the container automatically. Without it, Novi runs on its built-in
engine. Never commit the `.env` file.

## Add a domain + HTTPS (optional)

Right now the site is `http://YOUR_VPS_IP` (no padlock). To use a real domain with a
free HTTPS certificate:

1. In your domain's DNS, add an **A record** pointing to the VPS IP.
2. Tell me the domain and I'll add **Caddy** to the compose file — it fetches and renews
   a free HTTPS certificate automatically, so you get `https://yourdomain.com`.
