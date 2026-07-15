# csdc-oj-fe

Modern OnlineJudge frontend for [QingdaoU/OnlineJudge](https://github.com/QingdaoU/OnlineJudge), rewritten with:

- **Next.js** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **lucide-react** icons
- **next-intl**
- **Glassmorphism** design

Full feature parity with the classic Vue OnlineJudgeFE (OJ site + Admin).

## Installation

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

### Environment

| Variable | Description |
|----------|-------------|
| `OJ_BACKEND_URL` | OnlineJudge backend base URL (default `http://127.0.0.1:8080`) |
| `NEXT_PUBLIC_APP_NAME` | Display name fallback |

API requests to `/api/*` and `/public/*` are proxied to the backend via Next.js route handlers.

## Deploy to Cloudflare Workers (OpenNext)

This app uses [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Do **not** run bare `npx wrangler deploy` against a plain `next build` — Wrangler will try to auto-migrate and can produce a multi‑10 MiB Worker that exceeds the free plan **3 MiB gzip** limit.

### Local

```bash
pnpm install
pnpm deploy          # opennextjs-cloudflare build + deploy
# or
pnpm preview         # build + local Workers runtime
```

### Cloudflare dashboard (Workers Builds / CI)

| Setting | Value |
|---------|--------|
| **Install** | `pnpm install --frozen-lockfile` (default is fine) |
| **Build command** | `pnpm run cf:build` |
| **Deploy command** | `pnpm exec wrangler deploy --keep-vars` |

**Wrong (causes huge Worker / 3 MiB errors):** build = `pnpm run build` (plain Next only) + deploy = `npx wrangler deploy` (auto-migrate packs a ~20 MiB handler).

**Right:** build must produce `.open-next/` via OpenNext; then Wrangler deploys `wrangler.jsonc` → `.open-next/worker.js` + assets.

`wrangler.jsonc` and `open-next.config.ts` are committed. Set secrets/vars in the dashboard (`OJ_BACKEND_URL`, etc.).

**Size note:** free plan = 3 MiB gzip Worker; paid = 10 MiB. A correct OpenNext build for this app is typically ~1–2 MiB gzip. Static assets (e.g. `public/backgrounds/*`) go to the Assets binding and do **not** count toward the Worker size limit.

## Scripts

```bash
pnpm dev      # development
pnpm build    # next production build
pnpm start    # start Node production server
pnpm lint     # eslint
pnpm preview  # OpenNext build + local Workers preview
pnpm deploy   # OpenNext build + deploy to Cloudflare
```

## Structure

```
src/
  app/[locale]/(oj)/     # Public OJ pages
  app/[locale]/admin/    # Admin panel
  components/            # UI, glass, editors, layout
  lib/api/               # OJ + Admin API clients
  stores/                # Zustand (user, website, contest, auth modal)
  i18n/                  # next-intl routing
messages/                # zh-TW.json, en.json
```

## License

This project is licensed under the MIT license.
