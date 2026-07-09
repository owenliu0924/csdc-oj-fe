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

## License

This project is licensed under the MIT license.
