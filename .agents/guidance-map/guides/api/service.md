<!-- code-project-guidance-map:guide:start -->
Guide ID: api.service
Guide kind: leaf
Guide path: .agents/guidance-map/guides/api/service.md
Content hash: sha256:46077a7ae01bdbc8
<!-- code-project-guidance-map:guide:end -->

# API Service

- Module Path: `apps/api`
- Owns: The Express API, production authentication and authorization, Mongo-backed sessions, runtime configuration, request security, health checks, logging, and MongoDB/Redis connection lifecycle.
- Change here when: Adding server routes, changing auth/session behavior or credential enforcement, validating environment settings, adapting datastore connections, or changing startup and shutdown behavior.
- Do not put here: Browser identity state, UI flows, shared workspace tooling, or deployment-time MongoDB/Redis provisioning.
- Key entry points:

```text
package.json
src/app.js
src/server.js
src/auth/router.js
src/auth/service.js
src/config/
src/infrastructure/
```

## Internal Structure

- `src/app.js` owns HTTP composition order: request logging, security headers/CORS, health, global rate limiting, JSON parsing, session middleware, absolute session lifetime, auth routes, then terminal handlers.
- `src/server.js` owns process lifecycle: connect MongoDB, create or verify auth/session indexes, connect Redis, listen with bounded HTTP timeouts, and shut resources down once on signals or fatal errors.
- `src/config/` loads and validates the environment contract and constructs the Mongo-backed session middleware; it does not connect infrastructure or start HTTP.
- `src/infrastructure/` contains only MongoDB and Redis connection, disconnection, and readiness adapters; `src/health/` reports their status without owning lifecycle.
- `src/auth/` owns registration/login, verification challenges, password and profile mutations, authorization, delivery providers, rate limits, audit records, persistence models, and required indexes.
- `src/middleware/` owns shared validation/error handling plus session lifetime and trusted-mutation checks; `src/logger.js` centralizes structured logging and recursive sensitive-value redaction.
- `scripts/build.mjs` syntax-checks source and imports the server under a complete test environment; `scripts/sync-auth-indexes.mjs` explicitly creates and verifies auth/session indexes.

## Local Rules

- Keep credential verification, sessions, authorization, CSRF/origin enforcement, rate limiting, and auth audit behavior server-owned; never rely on dashboard or browser state as a security boundary.
- Read runtime settings through the frozen `config` export; synchronize environment names with root contracts and add validation cases in `src/config/environment.test.js` when the contract changes.
- Preserve middleware order so health stays session-free, request safeguards wrap protected routes, sessions precede auth, and not-found/error handlers remain last.
- Keep startup atomic and shutdown idempotent: never listen before MongoDB, required indexes, and Redis are ready; close HTTP, Redis, and MongoDB resources on failure or termination.
- Treat production index creation as an explicit migration step: production startup verifies required auth/session indexes, while `db:indexes` creates and verifies them.
- Preserve generic auth responses, normalized identifiers, hashed secrets/codes, trusted mutation checks, secure cookie settings, and logging redaction when changing identity flows.
- Run `pnpm --filter @waandapp/api test`, `pnpm --filter @waandapp/api lint`, and `pnpm --filter @waandapp/api build` after relevant changes.
