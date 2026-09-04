# Waandapp

Production-aware monorepo for the Waand marketing site, Persian blog, applicant dashboard, admin dashboard, and password-plus-second-factor API.

## Architecture

- `apps/web`: Next.js App Router application with TypeScript, Tailwind CSS, and shadcn/ui configuration.
- `apps/blog`: Persian RTL Next.js App Router blog with Waand styling, SEO routes, and server-rendered API data.
- `apps/user-dashboard`: pnpm-workspace React and Vite authentication frontend.
- `apps/admin-dashboard`: pnpm-workspace React and Vite dashboard for the isolated admin session boundary.
- `apps/api`: JavaScript ESM Express 5 API owning authentication plus the Mongo-backed public blog module under `/api/v1/blog`.
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

The root `.env` is loaded by all applications. The example uses `localhost` so the apps can run on the host while MongoDB and Redis run in Docker. Compose supplies private service hostnames automatically when the full stack runs in containers.

Docker publishes Redis on host port `6380` by default to avoid collisions with a locally installed Redis service; containers continue to use Redis's standard internal port `6379`.

Important variables:

| Variable(s)                                                                                                      | Purpose                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `NODE_ENV`, `PORT`, `LOG_LEVEL`, `TRUST_PROXY_HOPS`                                                              | API runtime, listener, logging, and exact trusted-proxy count                               |
| `MONGODB_URI`, `REDIS_URL`                                                                                       | Auth/session persistence and distributed rate-limit stores; TLS is mandatory in production  |
| `MONGODB_CORE_DATABASE`, `MONGODB_CMS_DATABASE`                                                                  | Separate Core User/auth and CMS database names                                              |
| `CMS_MEDIA_ROOT`, `CMS_MEDIA_MAX_BYTES`, `CMS_SCHEDULER_INTERVAL_MS`                                             | Server-only CMS media path, upload cap, and scheduler interval                              |
| `CORS_ORIGINS`, `AUTH_MUTATION_ORIGINS`                                                                          | Exact browser origins for shared reads; mutations remain restricted to the user dashboard   |
| `ADMIN_DASHBOARD_ORIGIN`                                                                                         | Exact admin browser origin; admin routes enforce this separately from global CORS           |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`                                                                         | Global API limiter                                                                          |
| `SESSION_SECRET`, `AUTH_CODE_PEPPER`                                                                             | Separate, diverse consumer server-only secrets of at least 32 characters                    |
| `ADMIN_SESSION_SECRET`                                                                                           | Separate, diverse admin server-only session secret; never expose to a browser               |
| `SESSION_COOKIE_NAME`, `SESSION_IDLE_TTL_MS`, `SESSION_ABSOLUTE_TTL_MS`                                          | Consumer cookie name and rolling-idle/server-enforced absolute session lifetimes            |
| `ADMIN_SESSION_COOKIE_NAME`, `ADMIN_SESSION_IDLE_TTL_MS`, `ADMIN_SESSION_ABSOLUTE_TTL_MS`                        | Dedicated admin cookie name and 15-minute/8-hour idle/absolute session lifetimes            |
| `AUTH_TRANSACTION_TTL_MS`, `AUTH_STEP_UP_TTL_MS`, `AUTH_TERMS_VERSION`                                           | Pre-auth lifetime, purpose-bound step-up lifetime, and immutable accepted legal version     |
| `AUTH_ARGON2_{MEMORY_KIB,TIME_COST,PARALLELISM}`                                                                 | Explicit Argon2id work factors; benchmark changes on production-class hardware              |
| `AUTH_CODE_TTL_MS`, `AUTH_MAX_VERIFY_ATTEMPTS`, `AUTH_RESEND_COOLDOWN_MS`                                        | Verification-code expiry, transaction attempt cap, and resend cooldown                      |
| `AUTH_MAX_SENDS_PER_TRANSACTION`                                                                                 | Total transaction send ceiling that resends cannot reset                                    |
| `AUTH_LOGIN_{IP,IDENTIFIER}_{WINDOW_MS,LIMIT}`                                                                   | Primary-credential abuse limits by trusted IP and normalized identifier                     |
| `AUTH_REQUEST_{IP,DESTINATION}_{WINDOW_MS,LIMIT}`                                                                | Code-request abuse limits by IP and normalized destination                                  |
| `AUTH_VERIFY_{IP,DESTINATION}_{WINDOW_MS,LIMIT}`                                                                 | Code-verification abuse limits by IP and normalized destination                             |
| `AUTH_DELIVERY_MODE`                                                                                             | Server-only delivery policy; `dev-no2step` is an explicit development-only OTP bypass       |
| `AUTH_{EMAIL,SMS}_WEBHOOK_{URL,TOKEN}`                                                                           | Server-only delivery gateway endpoints and bearer tokens                                    |
| `NEXT_PUBLIC_API_URL`, `VITE_API_URL`                                                                            | Browser-visible `/api/v1` base for the public apps and dashboard                            |
| `BLOG_API_URL`                                                                                                   | Optional server-only API base used by the blog container; defaults to `NEXT_PUBLIC_API_URL` |
| `NEXT_PUBLIC_BLOG_URL`                                                                                           | Browser-visible blog origin used by Waand public navigation and blog canonicals             |
| `NEXT_PUBLIC_SITE_URL`                                                                                           | Canonical public marketing origin used by metadata, robots, and sitemap                     |
| `NEXT_PUBLIC_USER_DASHBOARD_URL`                                                                                 | Browser-visible dashboard origin used by marketing calls to action                          |
| `MONGODB_PORT`, `REDIS_PORT`, `API_PORT`, `WEB_PORT`, `BLOG_PORT`, `USER_DASHBOARD_PORT`, `ADMIN_DASHBOARD_PORT` | Optional loopback/host ports for local services                                             |

The API rejects missing or unsafe configuration. A development webhook channel must configure its URL and token together; an unconfigured channel fails closed. Production additionally requires both HTTPS provider pairs, `rediss://`, certificate-valid MongoDB SRV or explicit TLS, a `__Host-` consumer cookie name and a `__Secure-` admin cookie name (the admin `Path=/api/v1/admin` prevents the `__Host-` requirement), strong non-placeholder/high-diversity secrets, and all required authentication, session, and CMS indexes. Public browser variables must never contain secrets. See [Authentication contract](AUTHENTICATION.md) for the HTTP and provider contracts.

## Local development

Start MongoDB and Redis in Docker, seed the development blog once, then run all applications with watch mode:

```bash
docker compose up -d mongodb redis
pnpm --filter @waandapp/api db:seed:blog
pnpm dev
```

The marketing site is available at `http://localhost:3000`, the user dashboard at `http://localhost:3001`, the admin dashboard at `http://localhost:3039`, the blog at `http://localhost:3002`, and the API health endpoint at `http://localhost:4000/api/v1/health`. The seed command is development-only and inserts missing slugs without replacing existing posts.

`pnpm dev` includes the isolated admin dashboard. To run only that application
instead, use:

```bash
pnpm --filter @waandapp/admin-dashboard dev
```

Open `http://localhost:3039`. The dashboard first calls `GET /api/v1/admin/auth/me`; a consumer dashboard login never satisfies that check. To promote an existing identity, use the operator-controlled command documented in [Authentication contract](AUTHENTICATION.md):

```bash
pnpm --filter @waandapp/api admin:bootstrap -- --email admin@example.com
```

For a disposable local Super Admin instead, run the development-only seed:

```bash
pnpm --filter @waandapp/api db:seed:admin
```

The seed is rejected unless `NODE_ENV=development`. It creates or resets the
fixed identity `admin@waand.test` (`waand-local-admin`) and prints a randomly
generated password once. Rerunning it rotates that password and revokes the
seeded account's existing sessions. With `AUTH_DELIVERY_MODE=dev-no2step`, the
printed password signs in directly; the regular `development` delivery mode
still requires the fixed development OTP `000000`.

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

The example environment keeps `AUTH_DELIVERY_MODE=development`, which is available only with `NODE_ENV=development`. It uses the fixed code `000000` and prints each destination, code, and expiry to the API terminal so delivery can never appear successful while silently discarding the code. `disabled` always fails delivery closed. Outside the explicit mode described below, correct passwords never create an authenticated session until a verified second factor succeeds.

For deliberately OTP-free local work, opt in on the API server with
`AUTH_DELIVERY_MODE=dev-no2step` while `NODE_ENV=development`. This server-only
mode bypasses verification codes for consumer signup and login, password
recovery, step-up, email/phone contact changes, and admin login; neither
dashboard contains its own bypass. Password verification, account/status
checks, session and CSRF rotation, the separate admin boundary, and live RBAC
checks still apply. The API rejects `dev-no2step` outside development.
Production still requires webhook delivery and MFA. Bypass-derived sessions
and recovery/step-up grants are tagged server-side and become invalid as soon
as the API runs in another delivery mode.

Run only the web application:

```bash
pnpm --filter @waandapp/web dev
```

Run only the blog:

```bash
pnpm --filter @waandapp/blog dev
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

The user dashboard is available at `http://localhost:3001` by default. Run the admin dashboard separately with `pnpm --filter @waandapp/admin-dashboard dev`; it listens on `http://localhost:3039` by default. Although the containers use optimized images, the API intentionally runs with `NODE_ENV=development` on local HTTP so browsers can send its non-`Secure` development cookie. Do not use this topology as an Internet-facing production deployment.

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

Compose binds published ports to loopback and is intended for local development. In production, terminate TLS at a trusted reverse proxy, set `TRUST_PROXY_HOPS` to the exact proxy count, require authenticated/TLS MongoDB and Redis URLs plus distinct consumer/admin session secrets from a secret manager, run `pnpm --filter @waandapp/api db:indexes` before API traffic, and do not expose database ports publicly. Admin routes enforce an exact `ADMIN_DASHBOARD_ORIGIN` and their own CSRF/session boundary even when that origin appears in the global CORS list for preflight.
