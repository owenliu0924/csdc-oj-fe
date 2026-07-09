# csdc-oj-fe

Modern OnlineJudge frontend for [QingdaoU/OnlineJudge](https://github.com/QingdaoU/OnlineJudge), rewritten with:

- **Next.js** (App Router)
- **Tailwind CSS** + **shadcn-style** UI
- **lucide-react** icons
- **next-intl** (繁體中文 / English)
- Dark **glassmorphism** design

Full feature parity with the classic Vue OnlineJudgeFE (OJ site + Admin).

## Setup

```bash
pnpm install
cp .env.local.example .env.local   # or edit .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (defaults to `/zh-TW`).

### Environment

| Variable | Description |
|----------|-------------|
| `OJ_BACKEND_URL` | OnlineJudge backend base URL (default `http://127.0.0.1:8080`) |
| `NEXT_PUBLIC_APP_NAME` | Display name fallback |

API requests to `/api/*` and `/public/*` are proxied to the backend via `next.config.ts`.

## Scripts

```bash
pnpm dev      # development
pnpm build    # production build
pnpm start    # start production server
pnpm lint     # eslint
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

## Features

### OJ
Home, problems, submissions, contests (ACM/OI rank, helper), user ranks, settings (profile / account / security / TFA), password reset, about, FAQ.

### Admin
Dashboard, users (import/generate), announcements, system config (SMTP + website), judge servers, prune test cases, problem CRUD (SPJ, test case upload), import/export, contests + contest problems/announcements.

## License

MIT (same spirit as OnlineJudgeFE)
