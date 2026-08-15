# Waandapp

Production-aware monorepo foundation for the Waandapp web and API applications. This repository intentionally contains no product features.

## Architecture

- `apps/web`: Next.js App Router application with TypeScript, Tailwind CSS, and shadcn/ui configuration.
- `apps/user-dashboard`: pnpm-workspace React and Vite authentication frontend.
- `apps/api`: JavaScript ESM Express 5 API with hardened middleware, structured logging, MongoDB, Redis-backed rate limiting, and a dependency-aware health endpoint.
- `packages/shared`: framework-independent shared values.
- `packages/typescript-config`: strict TypeScript configurations for Next.js and Node.js services.
- `packages/eslint-config`: shared flat ESLint configurations.
- `infrastructure/docker`: multi-stage production container definitions.

Turborepo coordinates scripts across pnpm workspaces. MongoDB and Redis are provided by Docker Compose and persist data in named volumes.

## Prerequisites

- Node.js 22.12 or newer
- pnpm 11.21.0
- Docker Desktop with Docker Compose for containerized development

See the [pnpm installation guide](https://pnpm.io/installation) if pnpm is not installed.

## Installation and environment

```bash
pnpm install
```

Then copy the environment template:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux, use `cp .env.example .env` instead.

The root `.env` is loaded by both applications. The example uses `localhost` so the apps can run on the host while MongoDB and Redis run in Docker. Compose supplies private service hostnames automatically when the full stack runs in containers.

Docker publishes Redis on host port `6380` by default to avoid collisions with a locally installed Redis service; containers continue to use Redis's standard internal port `6379`.

Required variables:

| Variable               | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `NODE_ENV`             | API runtime mode: `development`, `test`, or `production` |
| `PORT`                 | API listen port                                          |
| `MONGODB_URI`          | MongoDB connection URI                                   |
| `REDIS_URL`            | Redis connection URL and optional credentials            |
| `REDIS_PORT`           | Host port used by the local Redis container              |
| `CORS_ORIGIN`          | Allowed browser origin for the API                       |
| `LOG_LEVEL`            | Structured API log level                                 |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window in milliseconds                        |
| `RATE_LIMIT_MAX`       | Requests allowed per client during the window            |
| `TRUST_PROXY_HOPS`     | Number of trusted reverse proxies; `0` for local use     |
| `NEXT_PUBLIC_API_URL`  | Browser-visible API base URL, including `/api/v1`        |
| `USER_DASHBOARD_PORT`  | Host port for the containerized user dashboard           |

The applications fail during startup or build when required values are missing or invalid.

## Local development

Start MongoDB and Redis in Docker, then run both applications with watch mode:

```bash
docker compose up -d mongodb redis
pnpm dev
```

The web application is available at `http://localhost:3000`. The API health endpoint is `http://localhost:4000/api/v1/health`.

Run only the web application:

```bash
pnpm --filter @waandapp/web dev
```

Run only the user dashboard:

```bash
pnpm --filter @waandapp/user-dashboard dev
```

Run only the API (start its MongoDB and Redis dependencies first if they are not already running):

```bash
docker compose up -d mongodb redis
pnpm --filter @waandapp/api dev
```

## Docker development

Build and run the complete stack:

```bash
docker compose up --build
```

The user dashboard is available at `http://localhost:3001` by default.

Stop the stack without deleting MongoDB or Redis data:

```bash
docker compose down
```

## Quality commands

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
pnpm format:check
pnpm clean
```

## Security boundary

Compose binds published ports to loopback and is intended for local development. In production, terminate TLS at a trusted reverse proxy, set `TRUST_PROXY_HOPS` to the exact proxy count, require authenticated/TLS MongoDB and Redis URLs from a secret manager, and do not expose database ports publicly.
