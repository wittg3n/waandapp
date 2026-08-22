<!-- code-project-guidance-map:start -->
## Code Project Guidance Map

Generator: code-project-guidance-map
Generator version: 0.4.0
Guide format: action-map:v5
Content hash: sha256:fa5c52a9002c16af

### Agent Editing Rules

- [MUST] Use Node.js 22.12 or newer and the repository-pinned pnpm 11.21.0 from the workspace root; change dependencies through pnpm and never hand-edit `pnpm-lock.yaml`.
- [MUST] Keep authentication and session security on the correct side of the boundary: `apps/api` owns server verification, sessions, and credentials, while the current `apps/user-dashboard` identity flow is local/demo state and must not be extended as a production security boundary.
- [MUST] Treat linked module guides as lazy context: start from this `AGENTS.md` index, query for the task, and do not open every guide for broad orientation.
- [MUST] Account for the broad repository `data/` ignore rule when touching `apps/user-dashboard/src/data/**` or `apps/user-dashboard/src/features/dashboard/data/**`; verify intended source changes with Git instead of assuming they are tracked.
- [MUST] Keep environment names synchronized across `.env.example`, `turbo.json`, Compose, Dockerfiles, and the owning app validator/config; never commit real secrets or put them in `NEXT_PUBLIC_*` values or Docker build arguments.
- [SHOULD] Preserve the Persian RTL, accessibility, responsive-layout, and reduced-motion contracts when changing either frontend.
- [SHOULD] Change route registration, dashboard navigation, and marketing CTA destinations together when a user journey crosses app boundaries; avoid hard-coded development origins in deployable links.
- [AVOID] Moving app-specific UI or domain behavior into `packages/shared` or deployment files; shared packages stay framework-neutral and infrastructure packages applications without owning their behavior.

### Progressive Disclosure

- Start with this `AGENTS.md` index for broad orientation.
- Run `guidance_map.py query "<task>" --repo .` before opening module guides.
- Read only manifest-verified guide files returned by the query for the current task.
- Prefer the guides listed in `verify.affected_guides` when freshness verification identifies affected modules.
- Avoid opening the whole guide tree unless the task is explicitly project-wide or crosses several named modules.

### Task Routing

- To add API behavior, production authentication, sessions, request safeguards, or service integrations: edit/read `apps/api/**`; coordinate client-facing contracts with the dashboard identity module.
- To change login/signup UX, auth state and guards, profile schemas, or onboarding: edit/read `apps/user-dashboard/src/components/auth/**`, `src/features/auth/**`, `src/features/onboarding/**`, `src/pages/auth/**`, and `src/schemas/**`; do not treat browser storage as server authentication.
- To change dashboard bootstrapping, routes, responsive chrome, shared UI/styles, error handling, or Iranian reference data: edit/read the user-dashboard shell paths; keep feature behavior in its owning feature.
- To change personalized dashboard cards, phase rules, fixture data, or placeholder product pages: edit/read `apps/user-dashboard/src/features/dashboard/**`; keep route wiring and shared primitives outside the feature.
- To change the public landing page, marketing motion/assets, CTAs, metadata, robots, sitemap, or Next.js behavior: edit/read `apps/web/**`; the user dashboard owns the login/signup destination behavior.
- To change workspace tasks, shared TypeScript/ESLint/contracts, environment documentation, dependency locks, Docker, Compose, or Nginx: edit/read root workspace files, `packages/**`, and `infrastructure/**`; validate every consuming app.

### Module Dependency Rules

- Application packages may consume framework-neutral `packages/**`; do not create source imports from one application into another application.
- `packages/shared` exposes source types but runtime consumers require its built `dist` output, so preserve upstream Turbo build ordering.
- `apps/user-dashboard/src/app/router.tsx` and layout composition may import feature entry points, but reusable UI, error, data, and utility layers must remain free of feature-specific business behavior.
- The dashboard identity module owns auth/profile state and onboarding contracts; onboarding may consume shell-owned Iranian reference data, and dashboard product views may consume the authenticated user without taking ownership of identity.
- Marketing-to-dashboard integration is navigation/configuration, not a code import; keep deployed CTA origins configurable and let the dashboard own authentication routes.
- In the API, configuration validates the environment, infrastructure modules own MongoDB/Redis adapters, `server.js` owns lifecycle, and `app.js` owns HTTP composition; deployment files must not absorb those responsibilities.
- Docker and Compose may package and connect applications, but application health behavior and domain logic remain in the owning app; update Dockerfile manifest copies when adding workspace dependencies.

### Guidance Manifest

Guidance manifest: `.agents/guidance-map/manifest.json`
<!-- code-project-guidance-map:end -->
