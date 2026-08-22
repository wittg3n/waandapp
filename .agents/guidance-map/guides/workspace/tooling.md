<!-- code-project-guidance-map:guide:start -->
Guide ID: workspace.tooling
Guide kind: leaf
Guide path: .agents/guidance-map/guides/workspace/tooling.md
Content hash: sha256:8b4f89a1691234ab
<!-- code-project-guidance-map:guide:end -->

# Workspace Platform and Shared Packages

- Module Path: `package.json; pnpm-workspace.yaml; pnpm-lock.yaml; turbo.json; root formatting/environment/ignore/docs files; docker-compose.yml; infrastructure/**; packages/**`
- Owns: pnpm/Turborepo orchestration, repository-wide formatting and environment contracts, reusable TypeScript/ESLint configuration, framework-neutral shared exports, and local container build/runtime infrastructure.
- Change here when: Adjusting workspace membership or task graphs, shared compiler/lint rules or exports, root tooling and documented environment inputs, or Docker images, services, health checks, ports, and persistence.
- Do not put here: Application feature or service-domain implementation, app-local configuration that is not shared, real environment values or credentials, or production platform policy outside this repository's container contracts.
- Key entry points:

```text
package.json
pnpm-workspace.yaml
turbo.json
.env.example
packages/{typescript-config,eslint-config,shared}/
docker-compose.yml
infrastructure/docker/
README.md
```

## Internal Structure

- The root pins Node.js and pnpm, exposes Turbo-driven `dev`, `build`, `lint`, `typecheck`, `test`, and `clean` tasks, and keeps repository formatting in root Prettier configuration.
- `pnpm-workspace.yaml` discovers `apps/*` and `packages/*`, injects workspace packages, enforces engine and peer requirements, and explicitly allows the native dependency build scripts needed by installs; `pnpm-lock.yaml` is generated state.
- `turbo.json` makes package tasks depend on upstream equivalents, declares build artifacts, disables caching for persistent development and cleanup, and includes runtime/build environment names in the task hash contract.
- `packages/typescript-config` provides strict base, Node16, and Next.js presets; `packages/eslint-config` exports flat base, Node, and Next configurations with TypeScript rules and Prettier conflict suppression.
- `packages/shared` is a framework-independent TypeScript package built to `dist` with declarations; its public surface is `src/index.ts`, while its runtime entry points at built output.
- Compose defines a loopback-bound local stack with persistent MongoDB/Redis volumes, health-gated API and web startup, and an independently served user dashboard. Multi-stage Dockerfiles use frozen pnpm installs and unprivileged runtime images.
- The dashboard Nginx configuration supplies `/healthz`, security headers, long-lived static-asset caching, and SPA history fallback. Root ignore files exclude dependencies, outputs, logs, local data, and real environment files while retaining `.env.example`.

## Local Rules

- Use the pinned pnpm version with Node.js 22.12 or newer; change dependencies through pnpm so the lockfile stays authoritative, and never hand-format or manually curate `pnpm-lock.yaml`.
- Keep shared packages framework-neutral. When changing a preset or shared export, verify every consuming workspace; preserve `@waandapp/shared`'s source-types/built-runtime split and upstream build ordering.
- When adding a workspace dependency used by a container build, update the relevant Dockerfile's dependency-stage manifest copies as well as workspace manifests; Docker uses `pnpm install --frozen-lockfile`.
- Treat environment names as a synchronized contract across `.env.example`, README, `turbo.json`, Compose, and owning applications. Never commit `.env`; never place secrets in browser-public variables or Docker build arguments.
- Preserve local-only port binding, health-check/`depends_on` sequencing, named-volume persistence, and unprivileged runners unless intentionally redesigning the deployment boundary. Keep Nginx health and SPA routes intact.
- Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` after shared tooling changes. Run `docker compose config` and build the affected service after Compose or Dockerfile changes.
