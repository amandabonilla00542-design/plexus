# Plexus Admin Control

Separate **premium admin UI** for the same Plexus backend. Shows all users, on-chain USDT per wallet (refresh), adjust **yield accrued** (+/−), **reveal private keys** (guardian flow), **issue VIP deposit bypass codes**, and a **terminal-style preview** (BTC/EUR panes with candlesticks, volume, EMA 21, RSI, MACD via `lightweight-charts`, simulated data).

## Run

1. **Backend** (`Documents/plexus/backend`): add to `.env`:

```env
# Same value you type in the admin unlock screen. At least 16 chars (trimmed); prefer 24+ in production.
ADMIN_PANEL_SECRET=your-long-random-secret-here-min-16-chars

# Optional — if admin UI is not on http://localhost:5174
ADMIN_PANEL_ORIGIN=http://localhost:5174

# Optional — extra allowed origins, comma-separated (production admin URL)
# ADMIN_PANEL_ORIGIN_EXTRA=https://admin.yourdomain.com
```

2. Start API: `npm run dev` or your usual start (port **5000** by default).

3. **This app**:

```bash
cd admin-dashboard
npm install
npm run dev
```

Open **http://localhost:5174** — unlock with `ADMIN_PANEL_SECRET`. After unlock, use **VIP bypass code** to `POST /api/admin/bypass-codes` with `{ "piece": "MEETING-42" }` (or use the in-app form).

**Elon portrait:** the admin UI loads `elon-portrait.png` / `.jpg` from the **main frontend** (default in dev: `http://localhost:5173`). Run the main Vite app on **5173** and put the image under **`frontend/public/assets/quote/`** on that project. Override the base URL with **`VITE_MAIN_ORIGIN`** (see `.env.example`) when the marketing app is hosted elsewhere. You can also copy the same files into **`admin-dashboard/public/assets/quote/`** as a fallback for standalone admin builds.

**Theme:** matches the main app — uses `plexus-theme` and `excession-theme` in `localStorage` (with read fallback for older `layerdodge-theme`), so light/dark stays in sync when you use both on the same browser profile.

`vite` proxies `/api` → `http://localhost:5000` for both **`npm run dev`** and **`vite preview`**. Override with env `VITE_PROXY_TARGET` if the API is not on port 5000.

If **Generate code** (or any admin action) returns **404**, the browser is usually talking to the admin host only (no API behind `/api`). Typical causes: **`vite preview` without the API running** on the proxy target, hosting **`dist/` on a CDN/nginx** without a reverse proxy to the backend, or an **outdated backend** missing `POST /api/admin/bypass-codes`. Fix: run the Plexus API, align `VITE_PROXY_TARGET`, and/or set **`VITE_API_BASE_URL`** to the API origin (see `.env.example`) so fetches go straight to Express.

## Build / host separately

```bash
npm run build
npm run preview
```

Set production CORS: `ADMIN_PANEL_ORIGIN` (and `ADMIN_PANEL_ORIGIN_EXTRA` if needed) must match the URL where you host this static build. For static hosting without `/api` on the same origin, set **`VITE_API_BASE_URL`** at build time to your public API URL.

## PWA

`public/manifest.webmanifest` is included; add to home screen from the browser for a standalone shell.

## Security

- Never commit `ADMIN_PANEL_SECRET`.
- Reveal-key and yield endpoints are **powerful**; restrict network access to the admin panel in production (VPN, IP allowlist, separate auth layer if you outgrow a shared secret).
