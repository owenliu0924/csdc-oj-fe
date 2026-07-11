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
| `JUDGE0_API_URL` | Judge0 API server URL (default `http://127.0.0.1:2358`) |
| `NEXT_PUBLIC_APP_NAME` | Display name fallback |

## Judge0 Setup (for Run Code feature)

We use Judge0 for the code execution environment. A local Docker setup script is provided in this project.
To start Judge0 locally:
```bash
cd judge0/judge0-v1.13.1
docker compose up -d db redis
sleep 10
docker compose up -d
```
Then Judge0 will be available at `http://127.0.0.1:2358`.

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
