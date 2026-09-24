# HomeLab Care

Multi-tenant diagnostic laboratory SaaS. Authoritative specification:

`docs/Diagnostic_Lab_SaaS_Combined_Master_Reference.pdf`

The public website may use `docs/PUBLIC_WEBSITE_REFERENCE.md` for UX inspiration only.

## Architecture (Sprint 0)

- `apps/web-public` — public diagnostic website + patient portal (Next.js, port 3000)
- `apps/web-ops` — internal operations platform (Next.js, port 3001)
- `apps/api` — Express API (`/health`, `/api/v1/health`)
- `apps/workers` — Redis/BullMQ worker process (no job processors yet)
- `packages/*` — shared types, env validation, config, UI shell

Product features are not implemented yet.

## Prerequisites

- Node.js 22+
- pnpm 11+
- MongoDB and Redis for non-degraded health checks (optional in development)

## Setup

```bash
cp .env.example .env
pnpm install
```

Local MongoDB and Redis:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

## Scripts

```bash
pnpm dev:api
pnpm dev:workers
pnpm dev:web-public
pnpm dev:web-ops
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

API health: `GET http://localhost:5000/health` and `GET http://localhost:5000/api/v1/health`
