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
  `ADMIN_SESSION_SECRET`, `ADMIN_SESSION_COOKIE_NAME`, and a separate Mongo
  collection or Redis namespace. Admin APIs read an explicit admin-session
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
```

The existing consumer signup, login, recovery, verification, and step-up
flows continue to use the consumer endpoints and consumer session. They do not
authorize admin APIs or alter the dedicated admin cookie/store boundary.
