<!-- code-project-guidance-map:guide:start -->
Guide ID: user-dashboard.shell
Guide kind: leaf
Guide path: .agents/guidance-map/guides/user-dashboard/shell.md
Content hash: sha256:0ae926b4f11c70a5
<!-- code-project-guidance-map:guide:end -->

# Dashboard Application Shell and UI

- Module Path: `apps/user-dashboard/src/{app,components/layout,components/ui,components/errors,errors,hooks,lib,data,pages/errors,styles,assets}/`, `src/main.tsx`, and app-level Vite/TypeScript/ESLint/shadcn tooling
- Owns: Dashboard bootstrapping, route registration, global providers, responsive application chrome, shared UI primitives and styles, application-wide error UX, and small locale/reference-data utilities.
- Change here when: Wiring routes or providers, changing navigation or viewport chrome, evolving reusable controls/tokens/error handling, updating Iranian reference data, or adjusting this Vite package's tooling.
- Do not put here: Auth, onboarding, dashboard-feature, or account-security behavior; `pages/settings-page.tsx` and its mutations belong to identity/account security, while this module owns only its route registration and navigation entry.
- Key entry points:

```text
src/main.tsx
src/app/{app.tsx,providers.tsx,router.tsx}
src/components/layout/{dashboard-shell.tsx,dashboard-navigation.tsx}
src/components/{ui,errors}/
src/errors/
src/styles/globals.css
src/data/iran/
package.json
vite.config.ts
```

## Internal Structure

- `main.tsx` loads global CSS and mounts `App`; `App` nests motion/tooltip/toast providers, the root error boundary, the separately owned auth provider, and `RouterProvider`.
- `app/router.tsx` registers guarded public-auth, verification, recovery, reset, onboarding, account, dashboard, placeholder, not-found, and route-error branches. Guards and page behavior stay in their owning features.
- The account branch registers `/settings` under `DashboardShell`; its distinct `area="account"` guard and page implementation remain identity/account-security concerns.
- `components/layout/` provides the fixed-height RTL outlet shell, desktop sidebar, mobile Radix sheet, shared route navigation, topbar controls, and the `#dashboard-content` scroll container.
- `components/ui/` wraps native or Radix controls with Tailwind, `data-slot` hooks, `cn()`, CVA variants, accessible states, RTL portals, and reduced-motion-aware interaction.
- `errors/`, `components/errors/`, and `hooks/use-app-error.ts` own the `AppError` model, API-aligned auth/error codes and Persian catalog, HTTP/Zod/network normalization, replaceable reporting, and route/render/form/inline/toast presentation.
- `styles/globals.css` defines Vazirmatn, Tailwind v4 theme variables, viewport/scroll ownership, auth-responsive hooks, animations, scrollbars, and global reduced-motion overrides.
- `data/iran/` exposes typed immutable datasets and normalized ID/name lookups; `scripts/validate-iran-data.mjs` enforces stable prefixes, required categories, unique IDs, and normalized Persian names.
- `vite.config.ts` reads environment files from the workspace root, binds dev/preview to port 3001, and defines `@`; strict TypeScript, ESLint, and `components.json` must preserve the same source and generator aliases.

## Local Rules

- Preserve the Persian RTL contract (`lang="fa"`, `dir="rtl"`, logical `start`/`end` and `ps`/`pe` utilities); keep explicit RTL on portaled controls and Persian accessible labels where needed.
- Keep route registration and `components/layout/dashboard-navigation.tsx` destinations synchronized; route wiring does not transfer ownership of guards or page behavior. In particular, shell changes may register/link `/settings` but must not absorb its identity or account-security logic.
- Extend shared UI wrappers through `cn()`, existing variants, and Radix/native semantics; retain `data-slot`, focus-visible, disabled, invalid, ARIA, and reduced-motion behavior.
- At desktop widths the document root is non-scrolling and `#dashboard-content` owns vertical scrolling; verify shell and auth screens when changing height, overflow, or the global `.auth-*` breakpoint rules.
- Add backend error codes to both `error-codes.ts` and `error-catalog.ts`; normalize unknown failures through `normalizeError`, keep user-safe Persian copy in the catalog, and configure production reporting through `setErrorReporter`.
- The repository's broad `data/` ignore rule can hide `src/data/**` edits; verify intended Iranian dataset and index changes with Git, then run `validate:iran-data`.
- Keep `components.json`, Vite, and TypeScript aliases aligned; add dependencies with root-pinned pnpm rather than editing the lockfile manually.
- Run `pnpm --filter @waandapp/user-dashboard test`, `pnpm --filter @waandapp/user-dashboard lint`, `pnpm --filter @waandapp/user-dashboard typecheck`, and `pnpm --filter @waandapp/user-dashboard build`; also run `pnpm --filter @waandapp/user-dashboard validate:iran-data` after changing either Iranian JSON dataset.
