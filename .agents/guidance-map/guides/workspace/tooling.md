<!-- code-project-guidance-map:guide:start -->
Guide ID: workspace.tooling
Guide kind: leaf
Guide path: .agents/guidance-map/guides/workspace/tooling.md
Content hash: sha256:0ce7bd15a5b93f29
<!-- code-project-guidance-map:guide:end -->

# Workspace Platform and Shared Packages

- Module Path: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`, root environment/format/ignore/docs files, `docker-compose.yml`, `infrastructure/**`, `packages/**`
- Owns: pnpm/Turborepo orchestration, repository-wide tool and environment contracts, reusable TypeScript/ESLint configuration, framework-neutral shared exports, and local container packaging/runtime infrastructure.
- Change here when: Adjusting workspaces, dependencies or task graphs, shared compiler/lint rules or exports, documented environment inputs, ignore/format policy, or Docker images, services, health checks, ports, and persistence.
- Do not put here: Application feature or domain behavior, app-local configuration with no cross-workspace effect, real secrets, or production platform policy beyond this repository's packaging contracts.
- Key entry points:

```text
package.json / pnpm-workspace.yaml / pnpm-lock.yaml / turbo.json
.env.example / .gitignore / .prettierignore / README.md
packages/{typescript-config,eslint-config,shared}/
docker-compose.yml
infrastructure/docker/{api.Dockerfile,web.Dockerfile,user-dashboard.Dockerfile}
infrastructure/docker/user-dashboard.nginx.conf
apps/{api,web,user-dashboard}/package.json
```

## Internal Structure

- The root requires Node.js 22.12+, pins pnpm 11.21.0, and routes repository `dev`, `build`, `lint`, `typecheck`, `test`, and `clean` through Turbo; formatting remains a root Prettier task.
- `pnpm-workspace.yaml` discovers `apps/*` and `packages/*`, injects workspace packages, enforces engines and peer dependencies, and allowlists required native build scripts; `pnpm-lock.yaml` is generated dependency state.
- `turbo.json` orders tasks through upstream `^build`/lint/typecheck/test dependencies, declares build outputs, keeps development and cleanup uncached, and hashes the documented runtime/build environment names.
- `packages/typescript-config` supplies strict base, Node16, and Next.js presets; `packages/eslint-config` exports flat base, Node, and Next configurations with TypeScript rules and Prettier conflict suppression.
- `packages/shared` exposes source types from `src/index.ts` but runtime code from built `dist`; Turbo's upstream build ordering must produce that output before runtime consumers build.
- Compose defines a loopback-only development stack with named MongoDB/Redis volumes and health-gated API/web startup. Dockerfiles use frozen filtered installs, Turbo builds/deploys, and unprivileged API, Next.js, and Nginx runtime images.
- Dashboard Nginx owns `/healthz`, security headers, immutable asset caching, and SPA fallback. Root ignore policy excludes outputs, secrets, and local data; `.prettierignore` also protects generated guidance and lockfile content from formatting.

## Local Rules

- Use Node.js 22.12 or newer and repository-pinned pnpm 11.21.0 from the workspace root. Change dependencies with pnpm and never hand-edit or format `pnpm-lock.yaml`.
- Keep workspace membership, package manifests, workspace protocol links, and Turbo dependency edges aligned; do not bypass upstream builds for packages whose runtime entry points require generated output.
- Keep shared packages framework-neutral. Verify every consumer after changing a TypeScript/ESLint preset or shared export, and preserve `@waandapp/shared`'s source-types/built-runtime split.
- When a containerized app gains or drops a workspace dependency, update its manifest and the relevant Dockerfile dependency-stage manifest copies together; retain `pnpm install --frozen-lockfile`.
- Synchronize environment names and defaults across `.env.example`, README, `turbo.json`, Compose, Dockerfiles, and the owning app validator/config. Commit no real `.env` values; keep server secrets out of `NEXT_PUBLIC_*`, `VITE_*`, and Docker build arguments.
- Treat Compose defaults as local development only: preserve loopback port bindings, health-based startup, named-volume persistence, and unprivileged runners unless deliberately redesigning the topology. Keep Nginx health and SPA routes intact.
- The broad `data/` Git ignore also matches nested source directories; when touching `apps/user-dashboard/src/**/data/**`, verify intended files with Git and add them explicitly when appropriate.
- After shared tooling changes, run the relevant root pnpm checks. After Compose or Dockerfile changes, validate with `docker compose config` and build the affected service.
