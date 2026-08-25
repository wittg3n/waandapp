<!-- code-project-guidance-map:guide:start -->
Guide ID: user-dashboard.identity
Guide kind: leaf
Guide path: .agents/guidance-map/guides/user-dashboard/identity.md
Content hash: sha256:71b6666771814fe1
<!-- code-project-guidance-map:guide:end -->

# Dashboard Authentication and Onboarding

- Module Path: `apps/user-dashboard/src/components/auth/`, `apps/user-dashboard/src/features/auth/`, `apps/user-dashboard/src/features/onboarding/`, `apps/user-dashboard/src/pages/auth/`, `apps/user-dashboard/src/schemas/`, `apps/user-dashboard/src/pages/settings-page.tsx`
- Owns: Dashboard-side authentication UX and API adapter, session/preauthentication state and route guards, account-security flows, onboarding drafts, and initial-profile validation/completion.
- Change here when: Editing login, signup, verification, recovery, session routing, sensitive account changes, onboarding steps, or the dashboard-side auth/profile contract.
- Do not put here: Credential verification, session or preauthentication enforcement, code issuance, authorization, or other production security behavior owned by `apps/api`; also keep shared UI/errors and Iranian reference datasets in their owning modules.
- Key entry points:

```text
components/auth/{auth-layout.tsx,verification-panel.tsx}
features/auth/{auth-api.ts,auth-context.tsx,auth-routing.ts,auth-guard.tsx,types.ts}
pages/auth/{login-page.tsx,signup-page.tsx,verify-page.tsx,password-recovery-page.tsx,reset-password-page.tsx}
pages/settings-page.tsx
schemas/auth.schema.ts
features/onboarding/pages/onboarding-page.tsx
features/onboarding/schemas/onboarding-schema.ts
features/onboarding/onboarding-draft-storage.ts
```

## Internal Structure

- `auth-api.ts` is the credentialed `/api/v1/auth` client: it keeps the CSRF token in memory, validates response envelopes, maps server errors to safe client errors, and exposes registration, verification, recovery, step-up, profile, and logout transitions.
- `AuthProvider` bootstraps and refreshes `/auth/me`, converts snapshots into anonymous, preauth, or authenticated UI state, handles session invalidation, and submits onboarding profiles; routing helpers and guards resolve allowed auth, onboarding, account, and dashboard areas.
- Auth pages and `VerificationPanel` orchestrate registration, login second-step verification, recovery/reset, resend cooldowns, cancellation, and safe field/form feedback around the API transitions.
- `settings-page.tsx` owns account-security UI: current-password reauthentication, second-factor verification, and verified password, email, or phone changes. It belongs with identity rather than generic dashboard settings.
- Onboarding restores and autosaves a per-user non-sensitive draft, gates four validated data steps, normalizes localized form values and dataset IDs into `InitialProfileData`, submits it through the auth context, then clears the draft.
- Auth/onboarding schemas and types define client form payloads, preauth snapshots, initial-profile data, and the derived profile-completion model shared by identity consumers.

## Local Rules

- Treat React state, route guards, client schemas, the in-memory CSRF token, and browser draft storage as UX orchestration only; `apps/api` must verify credentials, own sessions/preauth, authorize requests, and enforce every security transition.
- Keep API envelope schemas, auth/preauth types, expected transition statuses, route destinations, and server endpoint contracts synchronized; never surface provider or server-detail messages directly to users.
- Preserve bootstrap-before-mutation, credentialed requests, CSRF handling, stale-request cancellation, session-expiry invalidation, terms-version submission, and focus/visibility refresh behavior.
- Keep password, email, and phone changes behind the step-up sequence; do not move sensitive contact edits into ordinary profile forms or infer authorization from `readyPurpose` or route state.
- Store only resumable onboarding draft values in browser storage, key them by server user ID, clear them after completion, and do not reintroduce the removed legacy local-auth store.
- When changing an onboarding field, update auth types, step/full schemas, defaults and draft parsing, profile conversions, step gating, controls/options, API validation, and relevant tests together.
- Preserve Persian RTL copy, accessible labels and focus handoff, responsive layouts, reduced motion, and operation-abort behavior across auth and onboarding flows.
