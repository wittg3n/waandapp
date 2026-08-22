<!-- code-project-guidance-map:guide:start -->
Guide ID: api.service
Guide kind: leaf
Guide path: .agents/guidance-map/guides/api/service.md
Content hash: sha256:810e57724a022fcd
<!-- code-project-guidance-map:guide:end -->

# API Service

- Module Path: `apps/api`
- Owns: The Express HTTP service, runtime configuration, request safeguards, logging, and MongoDB/Redis connection lifecycle.
- Change here when: Adding API routes or middleware, changing service startup/shutdown, validating runtime settings, or adapting database/cache connections.
- Do not put here: Browser UI, shared workspace tooling, or deployment-time MongoDB/Redis provisioning.
- Key entry points:

```text
package.json
src/server.js
src/app.js
src/config/
src/infrastructure/
src/middleware/
```

## Internal Structure

- `src/server.js` connects MongoDB and Redis before listening, configures HTTP timeouts, and coordinates graceful shutdown on signals and fatal process errors.
- `src/app.js` composes request IDs/logging, Helmet, CORS, Redis-backed rate limiting, JSON parsing, versioned routes, and terminal 404/error handlers in order.
- `src/config/` loads and validates runtime settings; `src/config/session.js` defines Mongo-backed session middleware, but neither `createApp` nor `server.js` currently composes it into the service.
- `src/app.js` references `createHealthRouter(redis)`, but no definition or import exists within `apps/api/**`; treat the health route as an incomplete boundary until its owner is restored or implemented.
- `src/infrastructure/` owns connection adapters, while `src/logger.js` centralizes redacted structured logging.

## Local Rules

- Read runtime settings through the frozen `config` export; add validation and matching cases in `src/config/environment.test.js` whenever the environment contract changes.
- Preserve middleware ordering so request IDs and safeguards wrap routes and the not-found/error handlers remain last.
- Keep service startup atomic and shutdown idempotent: do not listen before both dependencies connect, and close HTTP, Redis, and MongoDB resources on failure or termination.
- Run `pnpm --filter @waandapp/api test`, `pnpm --filter @waandapp/api lint`, and `pnpm --filter @waandapp/api build` after relevant changes.
