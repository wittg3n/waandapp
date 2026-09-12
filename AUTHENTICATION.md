# Authentication contract

This document is the canonical contract for Waand identity, sessions, and the
isolated admin boundary. The API is authoritative. Browser state, route guards,
and navigation visibility never grant access.

## Ownership and session states

The Core `User` model remains the single source of truth for identifiers,
password hashes, active status, verified contact methods, roles, permissions,
and `sessionVersion`. Admin authentication reuses that model and the existing
credential verification, OTP delivery, validation, and rate-limit services; it
does not copy credentials into a second account store.

There are three deliberately separate states:

| State                             | What it means                                                                                                                                                                                           | What it can authorize                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Consumer session                  | Normal user-dashboard authentication in the consumer session store.                                                                                                                                     | Consumer routes only; never an admin route, even for `SUPER_ADMIN`.                         |
| Admin preauthentication           | Passwords have verified for an active administrator and a fresh MFA challenge is pending in a mode that enforces OTP. It is held in the dedicated admin namespace but is not a logged-in admin session. | The bounded admin second-step request/verify flow only.                                     |
| Fully authenticated admin session | MFA succeeded, or the explicit development-only `dev-no2step` policy completed the password check, and the identifier was regenerated.                                                                  | Admin routes only, after active-user, current-`sessionVersion`, and RBAC permission checks. |

Opening the admin dashboard while a consumer session is present still starts at
the admin sign-in screen. A consumer session cannot be promoted implicitly.

## Dedicated admin boundary

Consumer and admin sessions use different secrets, cookie names, and store
namespaces. They may coexist in one browser, but neither cookie is accepted as
the other:

- Consumer sessions use `SESSION_SECRET`, `SESSION_COOKIE_NAME`, and the
  consumer session store.
- Admin preauthentication and fully authenticated admin state use
  `ADMIN_SESSION_SECRET`, `ADMIN_SESSION_COOKIE_NAME`, and a separate Redis
  namespace. Admin APIs read an explicit admin-session
  context, never `request.session`.
- The admin cookie is HttpOnly, host-only (no `Domain` attribute),
  `SameSite=Strict`, and scoped to `Path=/api/v1/admin`. It is Secure in
  production. The consumer cookie keeps its existing contract.
- Admin session idle and absolute limits are configured independently. The
  identifier and admin CSRF token rotate when the privilege transition to a
  fully authenticated admin session occurs.

Every admin operation checks a fully authenticated admin session, an active
Core User, the current shared `sessionVersion`, and the required centralized
RBAC permission. Removing roles, suspending or banning an account, resetting a
password, changing security-sensitive account data, or explicitly revoking
sessions invalidates the affected admin session through the shared user/session
version mechanism.

## Admin HTTP contract

The dedicated API surface is:

| Method and path                               | Contract                                                                                                                                                                                                                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/v1/admin/auth/login`               | Verify credentials with the Core User model. Normally require fresh MFA; explicit development-only `dev-no2step` returns the authenticated user after the same admin eligibility checks and session/CSRF rotation. Do not disclose administrator status before credentials succeed. |
| `POST /api/v1/admin/auth/second-step/request` | Request an email or SMS code for the current admin preauthentication state, using the existing delivery and abuse limits.                                                                                                                                                           |
| `POST /api/v1/admin/auth/second-step/verify`  | Verify the purpose-bound code. On success, regenerate the identifier, create the fully authenticated admin session, rotate admin CSRF, and return only safe user, roles, permissions, and CSRF data.                                                                                |
| `GET /api/v1/admin/auth/me`                   | Return the safe current admin identity only for a valid fully authenticated admin session. A consumer session or pending MFA state is insufficient.                                                                                                                                 |
| `POST /api/v1/admin/auth/logout`              | Require the admin origin and admin CSRF token, then destroy only the admin session. It must not log out the consumer session.                                                                                                                                                       |

### Password to fresh MFA flow

This is the required flow for every delivery mode except the explicit
development-only `dev-no2step` mode documented below.

1. The admin dashboard calls `GET /api/v1/admin/auth/me` on startup. A missing
   or invalid admin session displays sign-in; it does not call consumer
   `/api/v1/auth/me` as a fallback.
2. `POST /api/v1/admin/auth/login` verifies the supplied identifier and password with
   the existing credential service, confirms the account is active, and
   confirms administrative permissions. Incorrect or non-admin credentials
   create neither a preauthentication state nor an admin session.
3. A successful password check creates only the bounded admin preauthentication
   state and requires a new second factor every time, regardless of any
   consumer session.
4. The dashboard requests delivery through
   `POST /api/v1/admin/auth/second-step/request` and verifies the code through
   `POST /api/v1/admin/auth/second-step/verify`.
5. Only successful MFA creates the fully authenticated admin session. The API
   regenerates its identifier and returns safe serialized identity data plus
   the admin CSRF token.

### Development-only no-second-step mode

`AUTH_DELIVERY_MODE=dev-no2step` is a server-only, explicit opt-in for local
development. The API accepts it only when `NODE_ENV=development`; it is not a
browser variable and neither the user dashboard nor admin dashboard can enable
the bypass. In this mode the server bypasses OTP gates for consumer signup and
login, password recovery, step-up, email/phone contact changes, and admin
login. Admin login returns `AUTHENTICATED` directly, with the safe user and
rotated admin CSRF token, so the client makes no second-step request.

The mode bypasses only code verification. Password checks, account and status
validation, session identifier regeneration, CSRF rotation, consumer/admin
session isolation, session expiry and revocation, and live admin RBAC checks
remain enforced. Production rejects `dev-no2step` configuration and continues
to require webhook delivery and MFA.

Sessions and recovery/step-up grants created through the bypass carry
server-side provenance. After the API restarts in any other delivery mode, the
next request revokes those sessions and rejects those grants; the user or
administrator must authenticate again through the normal flow.

## CSRF and origin isolation

Admin CSRF is bound to the admin session. Consumer CSRF tokens are rejected on
admin endpoints, admin tokens are rejected on consumer endpoints, and missing,
mismatched, or stale tokens are rejected. Token rotation follows admin-session
regeneration.

`ADMIN_DASHBOARD_ORIGIN` is an exact HTTP(S) origin with no path. Browser
requests to `/api/v1/admin/**` are accepted only from that origin; the
user-dashboard and marketing origins are rejected. Credentials are enabled
only for the exact allowed origin, never for wildcard CORS. The origin may
appear in global `CORS_ORIGINS` so shared middleware can answer a preflight, but
the admin route’s own exact-origin rejection remains authoritative. Any
non-browser/operator tooling must be explicitly allowed by the API contract,
not by weakening browser origin checks.

Consumer mutations remain restricted by `AUTH_MUTATION_ORIGINS` to the user
dashboard origin. Adding the admin origin to global CORS does not add it to
consumer mutation origins.

## Bootstrap and local development

The operator-controlled bootstrap promotes an existing eligible identity and
never seeds a password, credential, or authenticated session. Run the exact
command from the repository root:

```bash
pnpm --filter @waandapp/api admin:bootstrap -- --email admin@example.com
```

Prerequisites:

- API environment is configured, including distinct server-only consumer and
  admin session settings.
- MongoDB is reachable and the Core database is available.
- `admin@example.com` already identifies an active Core User with a verified
  email address and verified phone number.
- The user is promoted explicitly; no credential or session is seeded by this
  command. The user must still complete a fresh password login and, unless the
  API explicitly runs local `dev-no2step`, fresh MFA.

For a disposable development Super Admin, use the separate seed command:

```bash
pnpm --filter @waandapp/api db:seed:admin
```

This command is rejected unless `NODE_ENV=development`. It creates or resets
the fixed identity `admin@waand.test` with username `waand-local-admin`, marks
its email and phone as verified, assigns `SUPER_ADMIN`, and prints a randomly
generated password once. Rerunning the command rotates that password and
revokes existing sessions for the seeded account. The operator-controlled
`admin:bootstrap` flow above remains unchanged and never creates credentials.

When `AUTH_DELIVERY_MODE=dev-no2step`, the seeded administrator signs in
directly with the printed password. In the regular `development` delivery mode,
admin sign-in still requires the fixed development OTP `000000` after the
password step.

For local development, copy `.env.example` to `.env`, start dependencies, and
run the API and admin dashboard in separate terminals:

```bash
docker compose up -d mongodb redis
pnpm --filter @waandapp/api dev
pnpm --filter @waandapp/admin-dashboard dev
```

The API is available at `http://localhost:4000` and the admin dashboard at
`http://localhost:3039` by default. The user dashboard remains at
`http://localhost:3001`. Compose builds the API and public/dashboard services;
run the admin Vite app separately unless a deployment adds an equivalent
admin-serving service.

## Production requirements

Provide all secrets through the runtime secret manager. Never put session
secrets in `NEXT_PUBLIC_*`, `VITE_*`, browser bundles, or Docker build args.
Use HTTPS origins and Secure cookies in production. The admin cookie name should
use a `__Secure-` prefix (for example, `__Secure-waand_admin_sid`) because its
required `Path=/api/v1/admin` is narrower than `/`; that path prevents use of
the `__Host-` cookie prefix, which requires `Path=/`.
Deploy the admin UI and API on HTTPS origins that share the same registrable
site; a `SameSite=Strict` admin cookie is intentionally not sent from a
cross-site admin deployment.

Production rejects `AUTH_DELIVERY_MODE=dev-no2step`, requires webhook delivery,
and always mandates the normal second-factor flow for consumer and admin
authentication.

Run the API index check/migration command before production traffic:

```bash
pnpm --filter @waandapp/api db:indexes
pnpm --filter @waandapp/api db:migrate:auth
```

The existing consumer signup, login, recovery, verification, and step-up
flows continue to use the consumer endpoints and consumer session. They do not
authorize admin APIs or alter the dedicated admin cookie/store boundary.

## Redis sessions and security versions

`apps/api/src/auth/session-store.js` extends `connect-redis` with atomic session
and per-user index writes, reusing the existing Redis client. MongoDB stores
identity and policy; Redis stores session state, short-lived permission caches,
and the existing IP/account/destination rate limits. Sessions contain identifiers,
timestamps, security version and bounded ceremony/grant state, never user documents
or password hashes. No browser token is persisted in localStorage/sessionStorage.

`AUTH_REDIS_PREFIX` defaults to `waandapp:identity:`. Keys below it are
`sessions:user:<sid>`, `sessions:admin:<sid>`, `user-sessions:<userId>` (a sorted
set with expiration scores), and versioned `permissions:<...>` entries. Session
administration returns SHA-256 references to keys, never the bearer SID. Redis
TTL is bounded by both idle and remaining absolute lifetime; anonymous state is
also bounded by `AUTH_TRANSACTION_TTL_MS`. Expired index entries are pruned and
the index expires after its last member. Single-session deletion leaves a bounded
tombstone to reject stale in-flight saves. Bulk deletion uses the per-user index,
never a global key scan, and increments MongoDB `sessionVersion` first so a stale
in-flight save cannot authenticate again.

`sessionVersion` is the existing equivalent of `authVersion`. Password/contact
changes, recovery, logout-all, lockout, role assignment and administrative
revocation invalidate prior versions. Login, MFA completion, security step-up,
and password/contact changes rotate SID and CSRF. Step-up rotation preserves
the original absolute lifetime. Recovery deliberately requires a fresh login.

Example consumer policy is seven days idle and thirty days absolute; configure
`SESSION_IDLE_TTL_MS` and `SESSION_ABSOLUTE_TTL_MS`. Admin defaults remain fifteen
minutes idle and eight hours absolute, configured by the corresponding
`ADMIN_SESSION_*` variables. Existing deployment values remain authoritative.
The store targets the repository's single Redis deployment; its multi-key Lua
operations are not a Redis Cluster sharding implementation. Redis outages fail
closed. Use an isolated, authenticated Redis service with persistence/failover
appropriate to the deployment; loss of session keys requires fresh login.

Consumer endpoints include `GET /api/v1/auth/csrf`, `GET /api/v1/auth/sessions`,
`DELETE /api/v1/auth/sessions/:reference`, and existing logout/logout-all routes.
Admin session inventory and individual revocation live under
`/api/v1/admin/users/:userId/sessions`; both require `users.sessions.revoke`,
and mutations enforce target protection, origin, CSRF and an audit reason.
`POST /api/v1/admin/auth/logout-all` revokes both scopes for the current identity.

## Passwords, recovery and request protection

The existing `auth/password.js` remains the single Argon2id service. Existing
Argon2id hashes remain valid; the library manages salts, verifies hashes, and
supports the configured memory/time/parallelism settings. Legacy passwordless
records fail closed. Identity normalization and unique normalized username,
email and phone indexes remain centralized in the User model.

Outside explicit development delivery, signup email verification and password
recovery email proofs use 32 random bytes encoded as 64 hex characters. Only a
purpose/user/transaction/destination-bound HMAC digest is persisted. The delivery
webhook receives the raw value in the existing `code` field; providers must
support its length. The existing short-lived, single-use challenge ceremonies
remain in place, including mandatory phone proof for recovery. Ordinary MFA and
phone challenges remain six-digit codes with bounded attempts and resend limits.
Raw production proofs, passwords, cookies and secrets are redacted from logs.

`AUTH_LOCKOUT_THRESHOLD` defaults to 10 failures and `AUTH_LOCKOUT_MS` to five
minutes. Failures update counters atomically; a threshold crossing locks briefly,
bumps the security version, revokes sessions, and records an event. Attempts during
a lock do not perpetually extend it. Redis limits cover both IP and normalized
account/destination keys; registration also limits all three submitted identities.
CSRF uses session-bound tokens plus exact mutation origins and Fetch Metadata.
Credentialed CORS accepts explicit origins only. Production validates HTTPS,
Secure host-only cookies, separate secrets, encrypted database/cache transport,
and delivery configuration. Configure `TRUST_PROXY_HOPS` for the actual proxy chain.

## Roles, abilities and ownership

`packages/shared/src/admin-permissions.ts` owns the allowed permission vocabulary
and initial role bundles. `apps/api/src/authorization/roles.js` persists validated
bundles with unique `authorization_role_key`, system protection, version and soft
deletion. Existing roles are retained: USER, SUPPORT, CONTENT_MANAGER, BLOG_EDITOR,
OPERATIONS_ADMIN, ADMIN and SUPER_ADMIN. Custom role keys can be assigned only
through validated API operations. No arbitrary permission names or client-supplied
CASL conditions can be stored.

`authorization/ability.js` is the single CASL builder and permission-to-action/
resource mapping. `auth/principal.js` loads current server identity/security state
for both session scopes, checks status/version/verification/lockout, and attaches
`req.user` and `req.ability`. Ordinary route policy evaluates permissions/CASL,
not role labels. Own User read and ApplicantProfile read/update are conditional.
A conditional own-user rule cannot authorize listing all users. Profile writes
use a server-derived owner ID, strict payload validation and a concrete CASL
subject; the request cannot select or replace another owner's profile.
`authorizedFilter` exposes CASL's Mongoose query filtering for future collections.
Business-state validation stays in the owning service.

Permission caches expire in 60 seconds and include `permissionsVersion` and a
hash of current role revisions. Role bundles are read each request so changes
take effect on the next request, even if a subsequent user-version update fails.
This favors immediate revocation over eliminating the small policy database read.
Role edits increment role and assigned-user permission versions. Assignments
increment both user security and permission versions. Concurrent administrative
security writes use a version predicate and fail with 409 on conflict.

The admin API exposes permissions, role CRUD, existing-account grants, users,
sessions and audit records. New grants require an already active identity with
verified email and phone; an invitation form does not create unverified privileged
credentials. An actor cannot assign a bundle exceeding their authority. Role
definition mutations additionally require SUPER_ADMIN as an exceptional platform
policy. USER and SUPER_ADMIN policy bundles are immutable through the API; system
roles cannot be deleted. Self role/status mutation is forbidden. Removing or
suspending an active SUPER_ADMIN requires an operator-reviewed database migration;
the API rejects it to avoid last-root races on standalone MongoDB.

To add a permission, extend the shared vocabulary and its central subject mapping,
add enforcement to the owning API route/service, cover denial and ownership with
tests, then update role bundles through the controlled API/migration and use the
same permission for frontend visibility. To add a role, use role CRUD with only
existing vocabulary. Never scatter independent role checks across controllers.

## Frontend integration

The admin dashboard now bootstraps the API session, performs password/MFA login,
restores sessions on reload, logs out through the API, and filters routes/sidebar
using server permissions. The shared CommonJS permission package is explicitly
prebundled for Vite development. Its API wrapper uses credentials and in-memory
CSRF, handles expiry and refresh, and never retries mutations automatically.
User, session, administrator, role, permission and audit repositories use the API.
The existing consumer client keeps its single API-backed auth state; verification
inputs accept full email tokens without truncation. Web/blog remain public clients
and continue linking to the dashboard's identity flows.

Frontend visibility is UX only. The backend independently checks every protected
request. Existing non-identity content/data/system dashboard repositories still
contain product fixtures; this change does not implement absent domain services.
Their local demo data must not be mistaken for production persistence.

## Rollout and validation

Use Node.js 22.12+ and repository-pinned pnpm 11.21.0. Back up the Core database,
then run from the repository root with the destination environment configured:

```bash
pnpm install --frozen-lockfile
pnpm --filter @waandapp/shared build
pnpm --filter @waandapp/api db:indexes
pnpm --filter @waandapp/api db:migrate:auth
pnpm --filter @waandapp/api admin:bootstrap -- --email admin@example.com
```

The idempotent migration creates missing indexes/baseline bundles, materializes
legacy administrative roles and initializes permission versions while preserving
user IDs, hashes and profiles. It increments legacy users' session versions;
rollout requires fresh login because old Mongo session collections are no longer
read. It does not drop old collections or overwrite customized role bundles.
Production startup verifies required indexes and system-role presence instead of
silently seeding. Do not mix old Mongo-session and new Redis-session API versions
behind one deployment during rollout. Runtime environment settings are documented
in `.env.example` and synchronized in Compose and Turbo; none become build secrets.

```bash
pnpm --filter @waandapp/api test
pnpm --filter @waandapp/user-dashboard test
pnpm lint
pnpm typecheck
pnpm build
```

API integration tests use a unique disposable MongoDB database and Redis db 15
(override with `API_TEST_REDIS_URL`). Coverage includes cookie/scope isolation,
CSRF/origins, registration, MFA, expiry/single-use/recovery races, credential and
destination limits, security version revocation, step-up rotation, ownership,
role cache freshness/escalation/deletion, hidden session IDs and Redis TTL bounds.
Do not point test infrastructure at production.

Verified during this implementation: 42 API unit tests, 23 API integration tests
and 34 consumer UI tests; API/admin/user/shared lint; API/admin/user/shared builds;
consumer/shared/blog type checks; and the standalone blog build. Browser smoke
checks covered admin and consumer password/MFA login, reload restoration, admin
logout, HttpOnly cookies and permission-denied navigation. Tests for migration
idempotence, lockout concurrency and preserved step-up absolute expiry are included.

The workspace-wide commands also expose pre-existing `apps/web` failures: its
`src/app/blog/**` routes import missing post/status/search components and helpers,
and missing blog exports from `src/lib/site.ts`; `src/lib/blog-api.ts` has an empty
interface lint error. These untouched public-page failures block an all-workspace
build/typecheck/lint pass. Both dashboards also retain large-bundle warnings.
Resolve the web build failures before a full-platform deployment; code splitting
and replacing unrelated product fixture repositories remain separate work.

Security corrections include removing the admin UI's fabricated full-permission
identity, preventing revoked legacy roles from being implicitly restored, rotating
the session on step-up, invalidating existing sessions on lockout, and guarding
concurrent security updates. Central CASL checks distinguish ownership conditions
from permission to list all users. MongoDB query operators used by internal admin
filters are explicitly trusted while untrusted request input stays validated.
