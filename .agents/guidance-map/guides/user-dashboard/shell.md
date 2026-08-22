<!-- code-project-guidance-map:guide:start -->
Guide ID: user-dashboard.shell
Guide kind: leaf
Guide path: .agents/guidance-map/guides/user-dashboard/shell.md
Content hash: sha256:19ae14fd417b4033
<!-- code-project-guidance-map:guide:end -->

# Dashboard Application Shell and UI

- Module Path: `apps/user-dashboard/src/{app,components/layout,components/ui,components/errors,errors,hooks,lib,data,pages/errors,styles,assets}/; apps/user-dashboard/src/main.tsx; apps/user-dashboard/{index.html,components.json,scripts,package.json,vite.config.ts,tsconfig.json,eslint.config.js}`
- Owns: User-dashboard bootstrapping, route composition, global providers, responsive dashboard chrome, shared UI primitives and styling, application-wide error handling, and small locale/data utilities.
- Change here when: Wiring routes or providers, changing dashboard navigation or viewport chrome, evolving reusable controls/tokens/error UX, updating Iranian reference data, or adjusting this Vite package's tooling.
- Do not put here: Authentication, onboarding, or dashboard-feature business logic and page internals; backend/API behavior; or feature-specific components that are not genuinely reusable.
- Key entry points:

```text
apps/user-dashboard/src/main.tsx
apps/user-dashboard/src/app/{app.tsx,providers.tsx,router.tsx}
apps/user-dashboard/src/components/layout/dashboard-shell.tsx
apps/user-dashboard/src/components/{ui,errors}/
apps/user-dashboard/src/errors/
apps/user-dashboard/src/styles/globals.css
apps/user-dashboard/src/data/iran/
apps/user-dashboard/components.json
apps/user-dashboard/package.json
```

## Internal Structure

- `main.tsx` loads global CSS and mounts `App`; `App` composes motion/tooltip/toast providers, the root error boundary, the separately owned auth provider, and `RouterProvider` in that order.
- `app/router.tsx` is the integration boundary for unauthenticated, onboarding, onboarded-dashboard, placeholder, not-found, and route-error branches; guards and route page implementations live in their feature modules.
- `components/layout/` provides a fixed-height RTL shell with an outlet, desktop sidebar, mobile Radix sheet, shared navigation, topbar search/user controls, and the shell-owned inner scroll container.
- `components/ui/` wraps native or Radix controls with Tailwind classes, `data-slot` hooks, accessible states, and `cn()` class merging; variants use CVA and button motion honors reduced-motion preferences.
- `errors/`, `components/errors/`, and `hooks/use-app-error.ts` define the `AppError` contract, code catalog, HTTP/Zod/network normalization, replaceable reporting, route/render fallbacks, form/inline states, and toast-aware handling.
- `styles/globals.css` imports Vazirmatn and Tailwind v4, publishes CSS variables through `@theme`, defines RTL/global viewport behavior, shared animations and scrollbars, reduced-motion overrides, and responsive `.auth-*` hooks consumed across the auth boundary.
- `data/iran/` exposes typed immutable datasets plus normalized ID/name lookup maps; `scripts/validate-iran-data.mjs` enforces stable prefixes, required categories, unique IDs, and normalized Persian names. `lib/format.ts` formats numbers for `fa-IR`.

## Local Rules

- Preserve the Persian RTL contract (`lang="fa"`, `dir="rtl"`, logical `start`/`end` and `ps`/`pe` utilities); keep explicit RTL on portaled controls and Persian accessible labels where needed.
- Keep route registration and `components/layout/dashboard-navigation.tsx` destinations synchronized; the router owns composition only, not guard or feature-page behavior.
- Extend shared UI wrappers through `cn()`, existing variants, and Radix/native semantics; retain `data-slot`, focus-visible, disabled, invalid, ARIA, and reduced-motion behavior.
- Treat `components.json` as the shadcn generator contract: it selects New York-style client TSX, Lucide icons, CSS variables in `globals.css`, and the `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, and `@/hooks` aliases; keep these aligned with Vite and TypeScript aliases.
- At desktop widths the document root is non-scrolling and `#dashboard-content` owns vertical scrolling; verify shell and auth screens when changing height, overflow, or the global `.auth-*` breakpoint rules.
- Normalize unknown failures through `normalizeError`; keep user-safe copy in the catalog, technical context in the reporter, and configure production reporting through `setErrorReporter` rather than UI components.
- Run `pnpm --filter @waandapp/user-dashboard lint`, `pnpm --filter @waandapp/user-dashboard typecheck`, and `pnpm --filter @waandapp/user-dashboard build`; also run `pnpm --filter @waandapp/user-dashboard validate:iran-data` after editing either Iranian JSON dataset.
