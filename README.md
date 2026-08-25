# Waandapp

Production-aware monorepo for the Waand marketing site, applicant dashboard, and password-plus-second-factor authentication API.

## Architecture

- `apps/web`: Next.js App Router application with TypeScript, Tailwind CSS, and shadcn/ui configuration.
- `apps/user-dashboard`: pnpm-workspace React and Vite authentication frontend.
- `apps/api`: JavaScript ESM Express 5 API with Argon2id password verification, mandatory email/SMS second factors, Mongo-backed cookie sessions, authorization middleware, structured logging, and Redis-backed rate limiting.
- `packages/shared`: framework-independent shared values.
- `packages/typescript-config`: strict TypeScript configurations for Next.js and Node.js services.
- `packages/eslint-config`: shared flat ESLint configurations.
- `infrastructure/docker`: multi-stage production container definitions.

Turborepo coordinates scripts across pnpm workspaces. MongoDB and Redis are provided by Docker Compose and persist data in named volumes.

## Documentation

- [Authentication](AUTHENTICATION.md): architecture, cookie and CSRF lifecycle, signup/login/recovery/step-up flows, API contract, delivery, operations, and troubleshooting.

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

The root `.env` is loaded by all three applications. The example uses `localhost` so the apps can run on the host while MongoDB and Redis run in Docker. Compose supplies private service hostnames automatically when the full stack runs in containers.

Docker publishes Redis on host port `6380` by default to avoid collisions with a locally installed Redis service; containers continue to use Redis's standard internal port `6379`.

Important variables:

| Variable(s)                                                                 | Purpose                                                                                       |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `NODE_ENV`, `PORT`, `LOG_LEVEL`, `TRUST_PROXY_HOPS`                         | API runtime, listener, logging, and exact trusted-proxy count                                 |
| `MONGODB_URI`, `REDIS_URL`                                                  | Auth/session persistence and distributed rate-limit stores; TLS is mandatory in production    |
| `CORS_ORIGINS`, `AUTH_MUTATION_ORIGINS`                                     | Exact browser origins for reads and the narrower credential/session mutation allowlist        |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`                                    | Global API limiter                                                                            |
| `SESSION_SECRET`, `AUTH_CODE_PEPPER`                                        | Separate, diverse server-only secrets of at least 32 characters                               |
| `SESSION_COOKIE_NAME`, `SESSION_IDLE_TTL_MS`, `SESSION_ABSOLUTE_TTL_MS`     | Cookie name and rolling-idle/server-enforced absolute session lifetimes                       |
| `AUTH_TRANSACTION_TTL_MS`, `AUTH_STEP_UP_TTL_MS`, `AUTH_TERMS_VERSION`      | Pre-auth lifetime, purpose-bound step-up lifetime, and immutable accepted legal version       |
| `AUTH_ARGON2_{MEMORY_KIB,TIME_COST,PARALLELISM}`                            | Explicit Argon2id work factors; benchmark changes on production-class hardware                |
| `AUTH_CODE_TTL_MS`, `AUTH_MAX_VERIFY_ATTEMPTS`, `AUTH_RESEND_COOLDOWN_MS`   | Verification-code expiry, transaction attempt cap, and resend cooldown                        |
| `AUTH_MAX_SENDS_PER_TRANSACTION`                                            | Total transaction send ceiling that resends cannot reset                                      |
| `AUTH_LOGIN_{IP,IDENTIFIER}_{WINDOW_MS,LIMIT}`                              | Primary-credential abuse limits by trusted IP and normalized identifier                       |
| `AUTH_REQUEST_{IP,DESTINATION}_{WINDOW_MS,LIMIT}`                           | Code-request abuse limits by IP and normalized destination                                    |
| `AUTH_VERIFY_{IP,DESTINATION}_{WINDOW_MS,LIMIT}`                            | Code-verification abuse limits by IP and normalized destination                               |
| `AUTH_DELIVERY_MODE`                                                        | `development` prints code `000000`; `disabled` blocks delivery; production requires `webhook` |
| `AUTH_{EMAIL,SMS}_WEBHOOK_{URL,TOKEN}`                                      | Server-only delivery gateway endpoints and bearer tokens                                      |
| `NEXT_PUBLIC_API_URL`, `VITE_API_URL`                                       | Browser-visible `/api/v1` base for the marketing app and dashboard                            |
| `NEXT_PUBLIC_SITE_URL`                                                      | Canonical public marketing origin used by metadata, robots, and sitemap                       |
| `NEXT_PUBLIC_USER_DASHBOARD_URL`                                            | Browser-visible dashboard origin used by marketing calls to action                            |
| `MONGODB_PORT`, `REDIS_PORT`, `API_PORT`, `WEB_PORT`, `USER_DASHBOARD_PORT` | Optional loopback host ports for the local Compose stack                                      |

The API rejects missing or unsafe configuration. A development webhook channel must configure its URL and token together; an unconfigured channel fails closed. Production additionally requires both HTTPS provider pairs, `rediss://`, certificate-valid MongoDB SRV or explicit TLS, a `__Host-` cookie name, strong non-placeholder/high-diversity secrets, and all required auth indexes. Public browser variables must never contain secrets. See [Authentication contract](AUTHENTICATION.md) for the HTTP and provider contracts.

## Local development

Start MongoDB and Redis in Docker, then run all three applications with watch mode:

```bash
docker compose up -d mongodb redis
pnpm dev
```

The web application is available at `http://localhost:3000`, the dashboard at `http://localhost:3001`, and the API health endpoint at `http://localhost:4000/api/v1/health`.

For local email webhook testing, generate a server-only token and set these values in `.env`:

```env
AUTH_DELIVERY_MODE=webhook
AUTH_EMAIL_WEBHOOK_URL=http://127.0.0.1:4100/email
AUTH_EMAIL_WEBHOOK_TOKEN=<generated-secret>
```

Generate the token and start the receiver from the repository root:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
node --env-file=.env apps/api/src/tools/dev-auth-webhook.mjs
```

Then start the API normally in another terminal. The API loads the repository-root `.env` from its central configuration module regardless of the process working directory:

```powershell
corepack pnpm --filter @waandapp/api dev
```

Changing `.env` requires a full API restart. Process-level environment values take precedence over the file, and the safe startup log reports the resolved environment, delivery mode, and email webhook URL. To exercise the SMS stage too, configure the SMS URL/token pair; leaving it empty in development makes SMS requests fail closed without blocking email testing. Production always requires both HTTPS providers.

The example environment uses `AUTH_DELIVERY_MODE=development`, which is available only with `NODE_ENV=development`. It uses the fixed code `000000` and prints each destination, code, and expiry to the API terminal so delivery can never appear successful while silently discarding the code. `disabled` always fails delivery closed. Correct passwords never create an authenticated session until a verified second factor succeeds.

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

Build and run the complete loopback-only stack:

```bash
docker compose up --build
```

The user dashboard is available at `http://localhost:3001` by default. Although the containers use optimized images, the API intentionally runs with `NODE_ENV=development` on local HTTP so browsers can send its non-`Secure` development cookie. Do not use this topology as an Internet-facing production deployment.

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

Compose binds published ports to loopback and is intended for local development. In production, terminate TLS at a trusted reverse proxy, set `TRUST_PROXY_HOPS` to the exact proxy count, require authenticated/TLS MongoDB and Redis URLs from a secret manager, run `pnpm --filter @waandapp/api db:indexes` before auth traffic, and do not expose database ports publicly.
