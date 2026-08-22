<!-- code-project-guidance-map:guide:start -->
Guide ID: user-dashboard.identity
Guide kind: leaf
Guide path: .agents/guidance-map/guides/user-dashboard/identity.md
Content hash: sha256:70a9bc3c5c9d26d1
<!-- code-project-guidance-map:guide:end -->

# Dashboard Authentication and Onboarding

- Module Path: `apps/user-dashboard/src/components/auth/`, `apps/user-dashboard/src/features/auth/`, `apps/user-dashboard/src/features/onboarding/`, `apps/user-dashboard/src/pages/auth/`, `apps/user-dashboard/src/schemas/`
- Owns: Client-side login/signup UX, local auth identity and route status, onboarding draft/completion flow, and initial-profile validation and normalization.
- Change here when: Editing auth forms/layout, auth persistence or guards, onboarding steps and choices, or the initial profile contract and completion calculation.
- Do not put here: Server/API authentication, shared UI and error primitives, dashboard feature behavior, or the Iranian field/university datasets consumed by onboarding.
- Key entry points:

```text
components/auth/auth-layout.tsx
pages/auth/{login-page.tsx,signup-page.tsx}
schemas/auth.schema.ts
features/auth/{auth-context.tsx,auth-guard.tsx,auth-storage.ts,types.ts}
features/onboarding/pages/onboarding-page.tsx
features/onboarding/schemas/onboarding-schema.ts
```

## Internal Structure

- `AuthLayout` supplies the responsive RTL form shell, route-specific illustration/title, and outlet transition; login/signup pages pair React Hook Form with the Zod schemas in `src/schemas/`.
- `AuthProvider` exposes the identity API and derives `unauthenticated`, `needs-onboarding`, or `onboarded`; `AuthGuard` maps those states to `/login`, `/onboarding`, and `/dashboard`.
- `auth-storage.ts` persists users and per-email onboarding drafts under `waand:user-dashboard:auth:v1`, falls back to in-memory state when browser storage is unavailable, and normalizes legacy/current profile data on read.
- The onboarding page owns welcome, four validated data steps, and completion views; it restores and autosaves drafts, prevents skipping incomplete steps, converts valid form values to `InitialProfileData`, and then marks the local user onboarded.
- Onboarding schemas and option components share auth-domain value types, validate Iranian dataset IDs and localized numbers, and convert between form, draft, and stored-profile representations.

## Local Rules

- Treat the current auth implementation as local/demo behavior: login and signup create or reuse browser-stored users; passwords and the remember flag are validated by the form but are not verified or persisted.
- Keep status transitions and redirects aligned: no active user is unauthenticated, an incomplete profile needs onboarding, and only a normalized complete initial profile is onboarded.
- When changing an onboarding field, update the auth types, step/full schemas, defaults and draft parser, storage normalization, form-to-profile conversions, step field gating, and corresponding control/options together.
- Preserve the wizard's per-user draft recovery, sequential validation, RTL/accessibility labels and focus handoff, and reduced-motion behavior.
- Verify with `npm --prefix apps/user-dashboard run typecheck` and `npm --prefix apps/user-dashboard run lint`.
