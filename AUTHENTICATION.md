# Authentication contract

Waand uses password authentication followed by a mandatory possession factor. A correct password starts a short-lived pre-authentication transaction; it never creates an authenticated session by itself. The second factor is a six-digit code delivered to an already verified email address or phone number.

The API base is `/api/v1`. All browser requests use `credentials: include`; no bearer token, password, code, transaction identifier, or session identifier belongs in browser storage or a URL.

## Account and transaction states

- A new user starts as `pending_verification`. Signup verifies email first and phone second. Only the second successful proof activates the user and creates a full session.
- An active login starts a `login` transaction in `second_step`. Either already verified channel may complete it.
- Recovery starts a non-enumerating `password_reset` transaction. Both verified channels are required, in email-then-SMS order. Resetting the password invalidates every session and does not log the user in.
- A sensitive account change starts a purpose-bound `step_up` transaction only after checking the current password. An existing verified factor authorizes a ten-minute, one-use grant. A new email or phone must then prove the new destination too.

`GET /auth/me` returns only a sanitized pre-authentication view: type, stage, allowed/completed channels, masked destinations, purpose when applicable, and expiry. Database and session transaction identifiers, destinations, code hashes, counters, and decoy state are never returned.

## Browser lifecycle and CSRF

1. Bootstrap with `GET /auth/me`. It creates or resumes the server-side session and returns its in-memory CSRF token, current user, current pre-authentication state, and legal-terms version.
2. Send the cookie, exact allowlisted `Origin`, and `X-CSRF-Token` on every mutation. Cross-site Fetch Metadata is rejected when the browser supplies it.
3. Registration, successful primary login, recovery start, and final authentication rotate the anonymous/session identifier as appropriate. Authentication and security-change responses rotate the CSRF token when the session rotates.
4. Treat `AUTH_SESSION_EXPIRED` as definitive session loss and bootstrap again. Do not treat an ordinary `AUTH_INVALID_CREDENTIALS` response as session expiry.

Authentication responses use `Cache-Control: no-store`. Credentialed CORS uses the exact `CORS_ORIGINS` allowlist, while state-changing auth requests use the narrower `AUTH_MUTATION_ORIGINS` subset. `GET /auth/me` may be called without an `Origin`; mutations may not.

Example bootstrap response:

```json
{
  "data": {
    "user": null,
    "preauth": null,
    "termsVersion": "v1",
    "csrfToken": "session-bound-random-value"
  }
}
```

## Routes

| Method and path                              | Required state                       | Body                              |
| -------------------------------------------- | ------------------------------------ | --------------------------------- |
| `GET /auth/me`                               | Optional session                     | None                              |
| `POST /auth/register`                        | Anonymous + CSRF                     | `Registration`                    |
| `POST /auth/register/email/request`          | Bound signup transaction             | `{}`                              |
| `POST /auth/register/email/verify`           | Bound signup transaction             | `{code}`                          |
| `POST /auth/register/phone/request`          | Signup with email completed          | `{}`                              |
| `POST /auth/register/phone/verify`           | Signup with email completed          | `{code}`                          |
| `POST /auth/login`                           | Anonymous + CSRF                     | `{identifier,password}`           |
| `POST /auth/second-step/request`             | Bound login or authenticated step-up | `{channel}`                       |
| `POST /auth/second-step/verify`              | Bound login or authenticated step-up | `{channel,code}`                  |
| `POST /auth/password/forgot`                 | Anonymous + CSRF                     | `{identifier}`                    |
| `POST /auth/password/recovery/email/request` | Bound recovery transaction           | `{}`                              |
| `POST /auth/password/recovery/email/verify`  | Bound recovery transaction           | `{code}`                          |
| `POST /auth/password/recovery/phone/request` | Recovery with email completed        | `{}`                              |
| `POST /auth/password/recovery/phone/verify`  | Recovery with email completed        | `{code}`                          |
| `POST /auth/password/reset`                  | Recovery with both factors complete  | `{password,passwordConfirmation}` |
| `POST /auth/reauth`                          | Active user + CSRF                   | `{purpose,currentPassword}`       |
| `POST /auth/password/change`                 | `change_password` grant              | `{password,passwordConfirmation}` |
| `POST /auth/email/change/request`            | `change_email` grant                 | `{email}`                         |
| `POST /auth/email/change/verify`             | New-email verification               | `{code}`                          |
| `POST /auth/phone/change/request`            | `change_phone` grant                 | `{phone}`                         |
| `POST /auth/phone/change/verify`             | New-phone verification               | `{code}`                          |
| `PUT /auth/me/profile`                       | Active applicant                     | `InitialProfile`                  |
| `POST /auth/logout`                          | Active user                          | `{}`                              |
| `POST /auth/logout-all`                      | Active user                          | `{}`                              |

Every body schema is strict. Unknown properties, MongoDB operators, malformed JSON, and bodies over 32 KiB are rejected. `identifier` is a username or email. Phone numbers must be explicit, valid canonical E.164 values such as `+989121234567`; the server never guesses a country. Persian and Arabic digits are normalized in verification codes.

`Registration` contains exactly:

```json
{
  "firstName": "Sara",
  "lastName": "Ahmadi",
  "username": "sara.ahmadi",
  "email": "sara@example.com",
  "phone": "+989121234567",
  "password": "a long passphrase",
  "passwordConfirmation": "a long passphrase",
  "termsAccepted": true,
  "termsVersion": "v1"
}
```

The legal version must exactly match the server-published version. Acceptance is stored separately with its user, immutable document/version pair, timestamp, and keyed source-IP digest.

Transitions return a stable status plus the current sanitized state and CSRF token:

```json
{
  "data": {
    "status": "SECOND_STEP_REQUIRED",
    "user": null,
    "preauth": {
      "type": "login",
      "stage": "second_step",
      "allowedChannels": ["email", "sms"],
      "completedChannels": [],
      "destinations": {
        "email": "s***@example.com",
        "sms": "+98 ****** 67"
      },
      "expiresAt": "2026-08-22T12:15:00.000Z"
    },
    "csrfToken": "rotated-session-bound-value"
  }
}
```

Code requests return `CODE_SENT`, the selected channel, only a masked destination, and server-authoritative cooldown/expiry seconds. Recovery uses the same generic masks and response shape for real and decoy transactions.

An authenticated `AuthUser` contains the public identity/profile projection only: `id`, names, username, email, phone, verification booleans, role, status, onboarding status, and optional `initialProfile`. Password hashes, normalized identities, timestamps, session versions, security counters, and Mongo metadata are excluded.

## Credentials and verification codes

- Passwords are 12–128 Unicode code points, preserve spaces, may not be all whitespace, and are checked against a bundled common-password denylist. Confirmation must match exactly.
- Passwords are hashed with Argon2id. The checked-in development policy is 65,536 KiB, three iterations, and parallelism one; tune only after benchmarking representative production hardware and never below the validator floors.
- Login performs a dummy Argon2 verification when the identity is absent. Invalid credentials, suspended/deleted accounts, legacy passwordless records, and locked accounts use the same public credential error.
- Codes use cryptographic randomness and are stored only as HMAC-SHA-256 digests. The digest binds transaction ID, challenge ID, purpose, user ID, channel, destination snapshot, and code with a server-only pepper.
- Failed verification attempts belong to the transaction, not an individual resend. Resending never resets the attempt cap. Per-channel send counters feed a total transaction send cap that resends cannot reset.
- Challenge consumption and transaction transitions use conditional atomic updates. Explicit expiry/status/counter checks are authoritative; TTL indexes provide cleanup only. Competing success/failure requests fail closed.

## Sessions and authorization

- `express-session` stores opaque sessions in MongoDB. The cookie is `HttpOnly`, `SameSite=Lax`, scoped to `/`, rolling for the idle limit, and `Secure` in production.
- The server independently enforces the absolute session lifetime. Full authentication and completed sensitive changes regenerate the session identifier.
- A full session records only server-owned identity/session data, including `userId`, `sessionVersion`, `authTime`, and `secondStepAt`. It is issued only after the required possession proof.
- Protected requests reload the user and require an active modern identity, matching session version, password hash, username, both verified contacts, and second-step timestamps.
- Logout destroys the current session. Logout-all and password/contact changes increment `sessionVersion`; password reset also invalidates every session and leaves the browser anonymous.
- `requireAuthenticatedUser`, `requireRole(...roles)`, and `ownedByCurrentUserFilter(request, filter)` are the reusable authorization boundaries. Applicant profile writes fix `userId` from the loaded session and never accept a client-selected owner or role.

Academic/onboarding data lives in the one-to-one `ApplicantProfile` model, not in `User`. `User` owns credentials and identity only. There are no applicant document/application resource routes yet; future resource routers must combine authentication, explicit role policy, and owner-scoped database queries.

## Abuse controls and security events

Redis-backed fixed windows and route limiters enforce trusted-IP, normalized identifier/destination, user, transaction, resend-cooldown, send-count, and verification limits. Store errors fail closed; there is no process-local fallback that would weaken multi-instance enforcement. Rate-limit responses include `Retry-After`.

Security events record event type, user when known, channel, masked destination, keyed IP digest, request ID, and a bounded reason. They cover primary authentication, challenge request/success/failure/lock, session promotion/revocation, recovery, step-up, password/contact changes, logout, and limiter activation. Raw codes, passwords, contacts, IP addresses, cookies, CSRF values, provider tokens, and transaction/session identifiers are redacted or omitted from application logs.

Password reset/change and contact change trigger best-effort notifications through verified channels. Contact replacement also notifies the previous destination. Notification delivery failure does not roll back an already committed credential change.

## Errors

Errors have a stable code and correlation ID:

```json
{
  "error": {
    "code": "AUTH_RATE_LIMITED",
    "message": "Too many authentication attempts.",
    "requestId": "request-uuid",
    "details": { "retryAfterSeconds": 42 }
  }
}
```

Important codes include `VALIDATION_ERROR`, `INVALID_JSON`, `PAYLOAD_TOO_LARGE`, `AUTH_INVALID_CREDENTIALS`, `AUTH_INVALID_CODE`, `AUTH_CODE_EXPIRED`, `AUTH_PREAUTH_INVALID`, `AUTH_REAUTH_REQUIRED`, `AUTH_IDENTITY_CONFLICT`, `AUTH_CHANNEL_NOT_ALLOWED`, `AUTH_CHANNEL_ALREADY_VERIFIED`, `AUTH_EMAIL_VERIFICATION_REQUIRED`, `AUTH_TOO_MANY_ATTEMPTS`, `AUTH_TOO_MANY_SENDS`, `AUTH_RATE_LIMITED`, `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `AUTH_CSRF_INVALID`, `AUTH_FORBIDDEN`, `AUTH_ACCOUNT_SUSPENDED`, `AUTH_DELIVERY_UNAVAILABLE`, `RATE_LIMITED`, `NOT_FOUND`, and `INTERNAL_ERROR`. Clients use codes and status, never parse the English server message.

## Delivery gateway

`AUTH_DELIVERY_MODE=disabled` never logs or sends a code. It is safe for startup but cannot complete a real browser authentication flow. Tests inject in-memory senders. Production requires `webhook` mode and both HTTPS providers.

The API POSTs one of these payloads to the channel-specific webhook with its bearer token, JSON content type, a five-second timeout, and redirects disabled:

```json
{
  "type": "authentication_code",
  "destination": "+989121234567",
  "code": "123456",
  "expiresInSeconds": 300
}
```

```json
{
  "type": "security_notification",
  "destination": "person@example.com",
  "event": "password_changed"
}
```

Only a 2xx response is accepted. Public recovery code-request responses deliberately remain generic even when delivery fails, so provider state cannot reveal whether an account exists. The gateway must protect tokens and codes, avoid sensitive logs, localize templates, and own downstream queueing/retries and deliverability.

## Environment and deployment

The validated auth settings are documented in `.env.example` and mirrored in `turbo.json` and Compose. They include the two origin lists, session lifetimes/secret/cookie name, code pepper and lifetimes, transaction and step-up lifetimes, legal version, Argon2 parameters, per-transaction attempts/sends, login/request/verify windows and limits, and delivery URLs/tokens.

Production additionally requires HTTPS origins and provider URLs, `rediss://`, certificate-valid MongoDB SRV or explicit TLS, a `__Host-` cookie name, strong distinct runtime secrets, and both providers. Secrets must come from a secret manager and must never use `NEXT_PUBLIC_*`, `VITE_*`, Docker build arguments, source control, or logs.

Mongoose automatic index creation is disabled. Development startup explicitly creates and awaits required indexes; production only verifies them. Run `pnpm --filter @waandapp/api db:indexes` as a reviewed deployment step before production startup. Verification covers identity, transaction, challenge, profile, legal, event, and session TTL indexes and refuses traffic on drift. A same-name index with changed semantics requires an explicit drop/rebuild migration.

The root Compose stack is loopback-only and intentionally runs the API as `development` on HTTP so its development cookie works. It is not a production topology. Production needs TLS termination, the exact `TRUST_PROXY_HOPS`, authenticated datastores, provider monitoring, alerting around security events, and a defined retention policy.

Legacy passwordless users and sessions are intentionally not upgraded implicitly: records without username, password hash, both verified contacts, and modern session timestamps cannot authenticate. Migrate affected accounts through a reviewed support-led identity proof/password setup process; never add a passwordless fallback.
