# Project Map

**Root:** `F:\waandapp`

- Files: **1,154**
- Size: **383.3 MB**
- Packages: **9**

## Workspace Packages

### `waandapp`

- Path: `.`
- Scripts:
  - `dev` → `turbo run dev`
  - `build` → `turbo run build`
  - `lint` → `turbo run lint`
  - `typecheck` → `turbo run typecheck`
  - `test` → `turbo run test`
  - `web` → `pnpm --filter @waandapp/web dev`
  - `admin-dashboard` → `pnpm --filter @waandapp/admin-dashboard dev`
  - `user-dashboard` → `pnpm --filter @waandapp/user-dashboard dev`
  - `api` → `pnpm --filter @waandapp/api dev`
  - `format` → `prettier --write .`
  - `format:check` → `prettier --check .`
  - `clean` → `turbo run clean && node -e "require('node:fs').rmSync('.turbo', { recursive: true, force: true })"`

### `@waandapp/admin-dashboard`

- Path: `apps/admin-dashboard`
- Scripts:
  - `dev` → `vite`
  - `preview` → `vite preview`
  - `build` → `tsc --noEmit && vite build`
  - `typecheck` → `tsc --noEmit --pretty false`
  - `test` → `node --experimental-strip-types src/auth/permissions.test.ts && node --experimental-strip-types src/auth/api.test.ts`
  - `lint` → `eslint "src/**/*.{js,jsx,ts,tsx}" --max-warnings=0`
  - `lint:fix` → `eslint --fix "src/**/*.{js,jsx,ts,tsx}"`
  - `format:check` → `prettier --check "src/**/*.{js,jsx,ts,tsx}"`
  - `format` → `prettier --write "src/**/*.{js,jsx,ts,tsx}"`
  - `clean` → `node -e "require('node:fs').rmSync('dist', { recursive: true, force: true })"`

### `@waandapp/api`

- Path: `apps/api`
- Scripts:
  - `dev` → `node --watch src/server.js`
  - `build` → `node scripts/build.mjs`
  - `admin:bootstrap` → `node scripts/bootstrap-super-admin.mjs`
  - `db:indexes` → `node scripts/sync-auth-indexes.mjs`
  - `db:seed:admin` → `node scripts/seed-admin.mjs`
  - `db:seed:blog` → `node scripts/seed-blog.mjs`
  - `start` → `node src/server.js`
  - `test` → `node --test && node --test src/auth/auth.integration.js`
  - `test:unit` → `node --test`
  - `test:integration` → `node --test src/auth/auth.integration.js`
  - `lint` → `eslint src --max-warnings=0`

### `@waandapp/blog`

- Path: `apps/blog`
- Scripts:
  - `dev` → `node scripts/next-command.mjs dev`
  - `build` → `next build`
  - `start` → `node scripts/next-command.mjs start`
  - `test` → `node --experimental-strip-types scripts/check-content.mjs`
  - `lint` → `eslint src --max-warnings=0`
  - `typecheck` → `tsc -p tsconfig.json --noEmit`
  - `clean` → `node -e "require('node:fs').rmSync('.next', { recursive: true, force: true })"`

### `@waandapp/user-dashboard`

- Path: `apps/user-dashboard`
- Scripts:
  - `dev` → `vite`
  - `build` → `tsc --noEmit && vite build`
  - `preview` → `vite preview`
  - `test` → `vitest run --environment node --configLoader runner`
  - `lint` → `eslint . --max-warnings=0`
  - `typecheck` → `tsc --noEmit --pretty false`
  - `validate:iran-data` → `node scripts/validate-iran-data.mjs`
  - `clean` → `node -e "require('node:fs').rmSync('dist', { recursive: true, force: true })"`

### `@waandapp/web`

- Path: `apps/web`
- Scripts:
  - `dev` → `next dev`
  - `build` → `next build`
  - `start` → `next start`
  - `lint` → `eslint src --max-warnings=0`
  - `typecheck` → `tsc -p tsconfig.json --noEmit`
  - `clean` → `node -e "require('node:fs').rmSync('.next', { recursive: true, force: true })"`

### `@waandapp/eslint-config`

- Path: `packages/eslint-config`

### `@waandapp/shared`

- Path: `packages/shared`
- Scripts:
  - `dev` → `tsc --watch --preserveWatchOutput`
  - `build` → `tsc -p tsconfig.json`
  - `lint` → `eslint src --max-warnings=0`
  - `typecheck` → `tsc -p tsconfig.json --noEmit`
  - `clean` → `node -e "require('node:fs').rmSync('dist', { recursive: true, force: true })"`

### `@waandapp/typescript-config`

- Path: `packages/typescript-config`

## Internal Workspace Dependencies

- `@waandapp/admin-dashboard` → `@waandapp/shared` (dependencies: `workspace:*`)
- `@waandapp/api` → `@waandapp/shared` (dependencies: `workspace:*`)
- `@waandapp/api` → `@waandapp/eslint-config` (devDependencies: `workspace:*`)
- `@waandapp/blog` → `@waandapp/eslint-config` (devDependencies: `workspace:*`)
- `@waandapp/blog` → `@waandapp/typescript-config` (devDependencies: `workspace:*`)
- `@waandapp/web` → `@waandapp/shared` (dependencies: `workspace:*`)
- `@waandapp/web` → `@waandapp/eslint-config` (devDependencies: `workspace:*`)
- `@waandapp/web` → `@waandapp/typescript-config` (devDependencies: `workspace:*`)
- `@waandapp/shared` → `@waandapp/eslint-config` (devDependencies: `workspace:*`)
- `@waandapp/shared` → `@waandapp/typescript-config` (devDependencies: `workspace:*`)

## Important Configuration Files

- `.env.example`
- `.gitignore`
- `README.md`
- `apps/admin-dashboard/.gitignore`
- `apps/admin-dashboard/README.md`
- `apps/admin-dashboard/eslint.config.mjs`
- `apps/admin-dashboard/package.json`
- `apps/admin-dashboard/tsconfig.json`
- `apps/admin-dashboard/vite.config.ts`
- `apps/api/eslint.config.js`
- `apps/api/package.json`
- `apps/blog/eslint.config.mjs`
- `apps/blog/next.config.ts`
- `apps/blog/package.json`
- `apps/blog/tsconfig.json`
- `apps/user-dashboard/eslint.config.js`
- `apps/user-dashboard/package.json`
- `apps/user-dashboard/tsconfig.json`
- `apps/user-dashboard/vite.config.ts`
- `apps/web/eslint.config.mjs`
- `apps/web/next.config.ts`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `docker-compose.yml`
- `package.json`
- `packages/eslint-config/package.json`
- `packages/shared/eslint.config.mjs`
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/typescript-config/package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tools/importers/sanjesh/README.md`
- `tools/importers/sanjesh/sanjesh/.gitignore`
- `tools/importers/sanjesh/sanjesh/Lib/site-packages/pymupdf-1.28.2.dist-info/README.md`
- `turbo.json`

## File Types

| Extension | Files |
|---|---:|
| `.py` | 496 |
| `.tsx` | 162 |
| `.h` | 90 |
| `.ts` | 85 |
| `.js` | 76 |
| `(none)` | 59 |
| `.json` | 30 |
| `.md` | 22 |
| `.typed` | 20 |
| `.txt` | 17 |
| `.mjs` | 16 |
| `.exe` | 14 |
| `.svg` | 13 |
| `.png` | 8 |
| `.pdf` | 6 |
| `.log` | 4 |
| `.css` | 4 |
| `.dockerfile` | 4 |
| `.pyd` | 4 |
| `.ico` | 3 |
| `.yaml` | 2 |
| `.html` | 2 |
| `.tsbuildinfo` | 2 |
| `.pem` | 2 |
| `.lib` | 2 |
| `.bat` | 2 |
| `.example` | 1 |
| `.yml` | 1 |
| `.conf` | 1 |
| `.cfg` | 1 |
| `.apache` | 1 |
| `.bsd` | 1 |
| `.dll` | 1 |
| `.fish` | 1 |
| `.ps1` | 1 |

## Top-Level Distribution

| Directory | Files |
|---|---:|
| `tools` | 717 |
| `apps` | 384 |
| `(root)` | 19 |
| `packages` | 13 |
| `.agents` | 9 |
| `infrastructure` | 5 |
| `security` | 4 |
| `researches` | 3 |

## Project Tree

```text
waandapp/
├── .agents/
│   └── guidance-map/
│       ├── guides/
│       │   ├── api/
│       │   │   └── service.md
│       │   ├── security/
│       │   │   └── pentest.md
│       │   ├── user-dashboard/
│       │   │   ├── identity.md
│       │   │   ├── product.md
│       │   │   └── shell.md
│       │   ├── web/
│       │   │   └── marketing.md
│       │   └── workspace/
│       │       └── tooling.md
│       ├── manifest.json
│       └── project-map.json
├── .tmp-onboarding-data/
├── apps/
│   ├── admin-dashboard/
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── api.test.ts
│   │   │   │   ├── api.ts
│   │   │   │   ├── auth-context.tsx
│   │   │   │   ├── permissions.test.ts
│   │   │   │   └── permissions.ts
│   │   │   ├── components/
│   │   │   │   ├── iconify/
│   │   │   │   │   ├── classes.ts
│   │   │   │   │   ├── icon-sets.ts
│   │   │   │   │   ├── iconify.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── register-icons.ts
│   │   │   │   └── admin-page.tsx
│   │   │   ├── layouts/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── layout.tsx
│   │   │   │   └── admin-shell.tsx
│   │   │   ├── pages/
│   │   │   │   ├── audit.tsx
│   │   │   │   ├── authors.tsx
│   │   │   │   ├── categories.tsx
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── library.tsx
│   │   │   │   ├── media.tsx
│   │   │   │   ├── page-not-found.tsx
│   │   │   │   ├── post-editor.tsx
│   │   │   │   ├── posts.tsx
│   │   │   │   ├── sign-in.tsx
│   │   │   │   ├── tags.tsx
│   │   │   │   └── users.tsx
│   │   │   ├── routes/
│   │   │   │   ├── components/
│   │   │   │   │   ├── error-boundary.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── router-link.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── use-pathname.ts
│   │   │   │   │   └── use-router.ts
│   │   │   │   ├── guards.tsx
│   │   │   │   └── sections.tsx
│   │   │   ├── sections/
│   │   │   │   └── auth/
│   │   │   │       ├── index.ts
│   │   │   │       └── sign-in-view.tsx
│   │   │   ├── theme/
│   │   │   │   ├── core/
│   │   │   │   │   ├── components.tsx
│   │   │   │   │   ├── custom-shadows.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── palette.ts
│   │   │   │   │   ├── shadows.ts
│   │   │   │   │   └── typography.ts
│   │   │   │   ├── create-classes.ts
│   │   │   │   ├── create-theme.ts
│   │   │   │   ├── extend-theme-types.d.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── theme-config.ts
│   │   │   │   ├── theme-provider.tsx
│   │   │   │   └── types.ts
│   │   │   ├── types/
│   │   │   │   └── stylis.d.ts
│   │   │   ├── app.tsx
│   │   │   ├── config-global.ts
│   │   │   ├── global.css
│   │   │   ├── main.tsx
│   │   │   └── vite-env.d.ts
│   │   ├── .gitignore
│   │   ├── .prettierignore
│   │   ├── CHANGELOG.md
│   │   ├── eslint.config.mjs
│   │   ├── index.html
│   │   ├── LICENSE.md
│   │   ├── package.json
│   │   ├── prettier.config.mjs
│   │   ├── README.md
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   ├── vercel.json
│   │   └── vite.config.ts
│   ├── api/
│   │   ├── scripts/
│   │   │   ├── bootstrap-super-admin.mjs
│   │   │   ├── build.mjs
│   │   │   ├── seed-admin.mjs
│   │   │   ├── seed-blog.mjs
│   │   │   └── sync-auth-indexes.mjs
│   │   ├── src/
│   │   │   ├── admin/
│   │   │   │   ├── models/
│   │   │   │   │   └── audit-log.js
│   │   │   │   ├── audit.js
│   │   │   │   ├── auth-authorization.js
│   │   │   │   ├── auth-router.js
│   │   │   │   ├── auth-service.js
│   │   │   │   ├── authorization.js
│   │   │   │   ├── indexes.js
│   │   │   │   ├── permissions.js
│   │   │   │   ├── permissions.test.js
│   │   │   │   ├── routes.js
│   │   │   │   ├── seed.js
│   │   │   │   ├── service.js
│   │   │   │   └── validation.js
│   │   │   ├── auth/
│   │   │   │   ├── models/
│   │   │   │   │   ├── applicant-profile.js
│   │   │   │   │   ├── auth-challenge.js
│   │   │   │   │   ├── auth-event.js
│   │   │   │   │   ├── auth-transaction.js
│   │   │   │   │   ├── legal-acceptance.js
│   │   │   │   │   └── user.js
│   │   │   │   ├── audit.js
│   │   │   │   ├── auth.integration.js
│   │   │   │   ├── auth.test.js
│   │   │   │   ├── authorization.js
│   │   │   │   ├── challenge-service.js
│   │   │   │   ├── code.js
│   │   │   │   ├── delivery.js
│   │   │   │   ├── index-names.js
│   │   │   │   ├── indexes.js
│   │   │   │   ├── normalization.js
│   │   │   │   ├── password.js
│   │   │   │   ├── rate-limit.js
│   │   │   │   ├── router.js
│   │   │   │   ├── schemas.js
│   │   │   │   ├── serialization.js
│   │   │   │   └── service.js
│   │   │   ├── blog/
│   │   │   │   ├── models/
│   │   │   │   │   └── post.js
│   │   │   │   ├── blog.test.js
│   │   │   │   ├── controllers.js
│   │   │   │   ├── errors.js
│   │   │   │   ├── index-names.js
│   │   │   │   ├── indexes.js
│   │   │   │   ├── repository.js
│   │   │   │   ├── routes.js
│   │   │   │   ├── seed.js
│   │   │   │   ├── service.js
│   │   │   │   └── validation.js
│   │   │   ├── cms/
│   │   │   │   ├── admin-routes.js
│   │   │   │   ├── content.js
│   │   │   │   ├── indexes.js
│   │   │   │   ├── library-service.js
│   │   │   │   ├── media.js
│   │   │   │   ├── models.js
│   │   │   │   ├── post-service.js
│   │   │   │   ├── public-service.js
│   │   │   │   ├── scheduler.js
│   │   │   │   ├── serializers.js
│   │   │   │   └── validation.js
│   │   │   ├── config/
│   │   │   │   ├── environment.js
│   │   │   │   ├── environment.test.js
│   │   │   │   ├── index.js
│   │   │   │   └── session.js
│   │   │   ├── health/
│   │   │   │   └── router.js
│   │   │   ├── infrastructure/
│   │   │   │   ├── mongodb.js
│   │   │   │   └── redis.js
│   │   │   ├── middleware/
│   │   │   │   ├── errors.js
│   │   │   │   ├── security.test.js
│   │   │   │   └── session.js
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   └── verification/
│   │   │   ├── tools/
│   │   │   │   └── dev-auth-webhook.mjs
│   │   │   ├── app.js
│   │   │   ├── logger.js
│   │   │   └── server.js
│   │   ├── eslint.config.js
│   │   └── package.json
│   ├── blog/
│   │   ├── public/
│   │   │   └── covers/
│   │   │       ├── application-roadmap.svg
│   │   │       ├── deadlines.svg
│   │   │       ├── language-exam.svg
│   │   │       ├── resume.svg
│   │   │       ├── scholarship.svg
│   │   │       ├── statement-of-purpose.svg
│   │   │       ├── student-story.svg
│   │   │       └── university-choice.svg
│   │   ├── scripts/
│   │   │   ├── check-content.mjs
│   │   │   └── next-command.mjs
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── category/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       ├── loading.tsx
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── posts/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       ├── loading.tsx
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── search/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── error.tsx
│   │   │   │   ├── icon.svg
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── not-found.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── robots.ts
│   │   │   │   └── sitemap.ts
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── site-footer.tsx
│   │   │   │   │   └── site-header.tsx
│   │   │   │   ├── posts/
│   │   │   │   │   ├── article-card.tsx
│   │   │   │   │   ├── article-grid.tsx
│   │   │   │   │   ├── featured-article.tsx
│   │   │   │   │   ├── pagination.tsx
│   │   │   │   │   └── post-meta.tsx
│   │   │   │   ├── search/
│   │   │   │   │   └── search-form.tsx
│   │   │   │   ├── status/
│   │   │   │   │   ├── empty-state.tsx
│   │   │   │   │   ├── route-error.tsx
│   │   │   │   │   └── route-loading.tsx
│   │   │   │   └── ui/
│   │   │   │       ├── button.tsx
│   │   │   │       ├── input.tsx
│   │   │   │       └── waand-logo.tsx
│   │   │   ├── lib/
│   │   │   │   ├── article-content.ts
│   │   │   │   ├── blog-api.ts
│   │   │   │   ├── format.ts
│   │   │   │   ├── route-params.ts
│   │   │   │   ├── site.ts
│   │   │   │   └── utils.ts
│   │   │   └── styles/
│   │   │       └── globals.css
│   │   ├── components.json
│   │   ├── eslint.config.mjs
│   │   ├── next-env.d.ts
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── tsconfig.json
│   │   └── tsconfig.tsbuildinfo
│   ├── user-dashboard/
│   │   ├── scripts/
│   │   │   └── validate-iran-data.mjs
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── app.tsx
│   │   │   │   ├── favicon.ico
│   │   │   │   ├── providers.tsx
│   │   │   │   └── router.tsx
│   │   │   ├── assets/
│   │   │   │   └── auth/
│   │   │   │       ├── logo/
│   │   │   │       │   ├── logo.png
│   │   │   │       │   ├── logo.svg
│   │   │   │       │   └── logo_transparent.svg
│   │   │   │       ├── login-illustration.png
│   │   │   │       └── signup-illustration.png
│   │   │   ├── components/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth-field.tsx
│   │   │   │   │   ├── auth-form-motion.tsx
│   │   │   │   │   ├── auth-header.tsx
│   │   │   │   │   ├── auth-illustration.tsx
│   │   │   │   │   ├── auth-layout.tsx
│   │   │   │   │   ├── auth-logo.tsx
│   │   │   │   │   ├── password-field.tsx
│   │   │   │   │   ├── verification-panel.test.tsx
│   │   │   │   │   └── verification-panel.tsx
│   │   │   │   ├── errors/
│   │   │   │   │   ├── app-error-boundary.tsx
│   │   │   │   │   ├── error-state.tsx
│   │   │   │   │   ├── form-error.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── inline-error.tsx
│   │   │   │   │   └── route-error-page.tsx
│   │   │   │   ├── layout/
│   │   │   │   │   ├── dashboard-mobile-nav.tsx
│   │   │   │   │   ├── dashboard-navigation.tsx
│   │   │   │   │   ├── dashboard-shell.tsx
│   │   │   │   │   ├── dashboard-sidebar.tsx
│   │   │   │   │   └── topbar.tsx
│   │   │   │   └── ui/
│   │   │   │       ├── alert.tsx
│   │   │   │       ├── avatar.tsx
│   │   │   │       ├── badge.tsx
│   │   │   │       ├── button.tsx
│   │   │   │       ├── card.tsx
│   │   │   │       ├── checkbox.tsx
│   │   │   │       ├── input.tsx
│   │   │   │       ├── label.tsx
│   │   │   │       ├── progress.tsx
│   │   │   │       ├── select.tsx
│   │   │   │       ├── separator.tsx
│   │   │   │       ├── sheet.tsx
│   │   │   │       ├── skeleton.tsx
│   │   │   │       ├── tooltip.tsx
│   │   │   │       └── waand-logo.tsx
│   │   │   ├── data/
│   │   │   │   └── iran/
│   │   │   │       ├── fields.json
│   │   │   │       ├── index.ts
│   │   │   │       └── universities.json
│   │   │   ├── errors/
│   │   │   │   ├── app-error.ts
│   │   │   │   ├── error-catalog.ts
│   │   │   │   ├── error-codes.ts
│   │   │   │   ├── error-reporter.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── normalize-error.ts
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth-api.test.ts
│   │   │   │   │   ├── auth-api.ts
│   │   │   │   │   ├── auth-context.tsx
│   │   │   │   │   ├── auth-flow.test.ts
│   │   │   │   │   ├── auth-flow.ts
│   │   │   │   │   ├── auth-guard.tsx
│   │   │   │   │   ├── auth-routing.test.ts
│   │   │   │   │   ├── auth-routing.ts
│   │   │   │   │   ├── auth-state.ts
│   │   │   │   │   ├── profile-completion.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── ai-insight-card.tsx
│   │   │   │   │   │   ├── application-journey.tsx
│   │   │   │   │   │   ├── dashboard-header.tsx
│   │   │   │   │   │   ├── deadline-preview.tsx
│   │   │   │   │   │   ├── document-health.tsx
│   │   │   │   │   │   ├── next-actions.tsx
│   │   │   │   │   │   ├── recent-activity.tsx
│   │   │   │   │   │   └── university-recommendations.tsx
│   │   │   │   │   ├── data/
│   │   │   │   │   │   └── application-dashboard.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── dashboard-page.tsx
│   │   │   │   │   │   └── feature-placeholder-page.tsx
│   │   │   │   │   └── types.ts
│   │   │   │   └── onboarding/
│   │   │   │       ├── components/
│   │   │   │       │   ├── steps/
│   │   │   │       │   │   ├── application-goal-step.tsx
│   │   │   │       │   │   ├── completion-step.tsx
│   │   │   │       │   │   ├── education-step.tsx
│   │   │   │       │   │   ├── language-step.tsx
│   │   │   │       │   │   ├── preferences-step.tsx
│   │   │   │       │   │   └── welcome-step.tsx
│   │   │   │       │   ├── onboarding-choice-group.tsx
│   │   │   │       │   ├── onboarding-field.tsx
│   │   │   │       │   ├── onboarding-options.ts
│   │   │   │       │   ├── onboarding-progress.tsx
│   │   │   │       │   ├── onboarding-step-heading.tsx
│   │   │   │       │   └── onboarding-steps.tsx
│   │   │   │       ├── pages/
│   │   │   │       │   └── onboarding-page.tsx
│   │   │   │       ├── schemas/
│   │   │   │       │   └── onboarding-schema.ts
│   │   │   │       ├── index.ts
│   │   │   │       ├── onboarding-draft-storage.test.ts
│   │   │   │       └── onboarding-draft-storage.ts
│   │   │   ├── hooks/
│   │   │   │   └── use-app-error.ts
│   │   │   ├── lib/
│   │   │   │   ├── format.ts
│   │   │   │   └── utils.ts
│   │   │   ├── pages/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login-page.tsx
│   │   │   │   │   ├── password-recovery-page.tsx
│   │   │   │   │   ├── reset-password-page.tsx
│   │   │   │   │   ├── signup-page.test.tsx
│   │   │   │   │   ├── signup-page.tsx
│   │   │   │   │   └── verify-page.tsx
│   │   │   │   ├── errors/
│   │   │   │   │   └── not-found-page.tsx
│   │   │   │   ├── settings-page.test.tsx
│   │   │   │   └── settings-page.tsx
│   │   │   ├── schemas/
│   │   │   │   ├── auth.schema.test.ts
│   │   │   │   └── auth.schema.ts
│   │   │   ├── styles/
│   │   │   │   └── globals.css
│   │   │   └── main.tsx
│   │   ├── components.json
│   │   ├── eslint.config.js
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── web/
│       ├── public/
│       │   ├── assets/
│       │   │   ├── lens_paper.png
│       │   │   ├── student.png
│       │   │   └── waand-guided-path.png
│       │   └── logo/
│       │       ├── logo.png
│       │       ├── logo.svg
│       │       └── logo_transparent.svg
│       ├── src/
│       │   ├── app/
│       │   │   ├── about/
│       │   │   │   └── page.tsx
│       │   │   ├── blog/
│       │   │   │   ├── [slug]/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── category/
│       │   │   │   │   └── [slug]/
│       │   │   │   │       └── page.tsx
│       │   │   │   ├── search/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── error.tsx
│       │   │   │   ├── loading.tsx
│       │   │   │   ├── not-found.tsx
│       │   │   │   └── page.tsx
│       │   │   ├── contact/
│       │   │   │   └── page.tsx
│       │   │   ├── faq/
│       │   │   │   └── page.tsx
│       │   │   ├── how-it-works/
│       │   │   │   └── page.tsx
│       │   │   ├── favicon.ico
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── robots.ts
│       │   │   └── sitemap.ts
│       │   ├── components/
│       │   │   ├── blog/
│       │   │   │   ├── posts/
│       │   │   │   │   ├── article-card.tsx
│       │   │   │   │   ├── article-grid.tsx
│       │   │   │   │   ├── featured-article.tsx
│       │   │   │   │   ├── pagination.tsx
│       │   │   │   │   ├── post-image.tsx
│       │   │   │   │   └── post-meta.tsx
│       │   │   │   ├── search/
│       │   │   │   │   └── search-form.tsx
│       │   │   │   ├── status/
│       │   │   │   │   ├── empty-state.tsx
│       │   │   │   │   ├── route-error.tsx
│       │   │   │   │   └── route-loading.tsx
│       │   │   │   └── archive-page.tsx
│       │   │   ├── landing/
│       │   │   │   ├── landing-navbar.tsx
│       │   │   │   ├── landing-page.tsx
│       │   │   │   ├── motion.tsx
│       │   │   │   └── testimonials.tsx
│       │   │   ├── marketing/
│       │   │   │   ├── contact-form.tsx
│       │   │   │   ├── final-cta.tsx
│       │   │   │   ├── how-it-works-journey.tsx
│       │   │   │   ├── how-it-works-section.tsx
│       │   │   │   ├── public-footer.tsx
│       │   │   │   ├── public-navbar.tsx
│       │   │   │   └── section-heading.tsx
│       │   │   └── ui/
│       │   │       ├── button.tsx
│       │   │       ├── line-shadow-text.tsx
│       │   │       ├── marquee.tsx
│       │   │       ├── resizable-navbar.tsx
│       │   │       └── waand-logo.tsx
│       │   ├── hooks/
│       │   │   └── use-hydrated-reduced-motion.ts
│       │   ├── lib/
│       │   │   ├── blog-api.ts
│       │   │   ├── blog-format.ts
│       │   │   ├── blog-route-params.ts
│       │   │   ├── blog-site.ts
│       │   │   ├── faq.ts
│       │   │   ├── pricing.ts
│       │   │   ├── public-routes.ts
│       │   │   ├── site.ts
│       │   │   └── utils.ts
│       │   ├── styles/
│       │   │   └── globals.css
│       │   └── types/
│       ├── components.json
│       ├── eslint.config.mjs
│       ├── next-env.d.ts
│       ├── next.config.ts
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       └── tsconfig.tsbuildinfo
├── infrastructure/
│   └── docker/
│       ├── api.Dockerfile
│       ├── blog.Dockerfile
│       ├── user-dashboard.Dockerfile
│       ├── user-dashboard.nginx.conf
│       └── web.Dockerfile
├── packages/
│   ├── eslint-config/
│   │   ├── base.js
│   │   ├── next.js
│   │   ├── node.js
│   │   └── package.json
│   ├── shared/
│   │   ├── src/
│   │   │   ├── admin-permissions.ts
│   │   │   └── index.ts
│   │   ├── eslint.config.mjs
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── typescript-config/
│       ├── base.json
│       ├── nextjs.json
│       ├── node.json
│       └── package.json
├── researches/
│   ├── deep-research-report.md
│   ├── localhost_3000_about.png
│   └── تحلیل بازاریابی بخش_های وب_سایت_ هر بخش دقیقاً به چه سؤال_هایی پاسخ می_دهد؟.pdf
├── security/
│   └── pentest/
│       ├── attack-surface.md
│       ├── remediation.md
│       ├── scope.md
│       └── test-matrix.md
├── tools/
│   ├── importers/
│   │   ├── abroad-universities/
│   │   └── sanjesh/
│   │       ├── pdf/
│   │       │   ├── entekhabreste-ensani-1404.pdf
│   │       │   ├── entekhabreste-honar-1404.pdf
│   │       │   ├── entekhabreste-ryazi-1404.pdf
│   │       │   ├── entekhabreste-tajrobi-1404.pdf
│   │       │   └── entekhabreste-zaban-1404.pdf
│   │       ├── sanjesh/
│   │       │   ├── Include/
│   │       │   ├── Lib/
│   │       │   │   └── site-packages/
│   │       │   │       ├── certifi/
│   │       │   │       │   ├── tests/
│   │       │   │       │   │   ├── __init__.py
│   │       │   │       │   │   └── test_certify.py
│   │       │   │       │   ├── __init__.py
│   │       │   │       │   ├── __main__.py
│   │       │   │       │   ├── cacert.pem
│   │       │   │       │   ├── core.py
│   │       │   │       │   └── py.typed
│   │       │   │       ├── certifi-2026.7.22.dist-info/
│   │       │   │       │   ├── licenses/
│   │       │   │       │   │   └── LICENSE
│   │       │   │       │   ├── INSTALLER
│   │       │   │       │   ├── METADATA
│   │       │   │       │   ├── RECORD
│   │       │   │       │   ├── top_level.txt
│   │       │   │       │   └── WHEEL
│   │       │   │       ├── charset_normalizer/
│   │       │   │       │   ├── cli/
│   │       │   │       │   │   ├── __init__.py
│   │       │   │       │   │   └── __main__.py
│   │       │   │       │   ├── __init__.py
│   │       │   │       │   ├── __main__.py
│   │       │   │       │   ├── api.py
│   │       │   │       │   ├── cd.cp313-win_amd64.pyd
│   │       │   │       │   ├── cd.py
│   │       │   │       │   ├── constant.py
│   │       │   │       │   ├── legacy.py
│   │       │   │       │   ├── md.cp313-win_amd64.pyd
│   │       │   │       │   ├── md.py
│   │       │   │       │   ├── models.py
│   │       │   │       │   ├── py.typed
│   │       │   │       │   ├── utils.py
│   │       │   │       │   └── version.py
│   │       │   │       ├── charset_normalizer-3.5.1.dist-info/
│   │       │   │       │   ├── licenses/
│   │       │   │       │   │   └── LICENSE
│   │       │   │       │   ├── entry_points.txt
│   │       │   │       │   ├── INSTALLER
│   │       │   │       │   ├── METADATA
│   │       │   │       │   ├── RECORD
│   │       │   │       │   ├── top_level.txt
│   │       │   │       │   └── WHEEL
│   │       │   │       ├── fitz/
│   │       │   │       │   ├── __init__.py
│   │       │   │       │   ├── table.py
│   │       │   │       │   └── utils.py
│   │       │   │       ├── idna/
│   │       │   │       │   ├── __init__.py
│   │       │   │       │   ├── __main__.py
│   │       │   │       │   ├── cli.py
│   │       │   │       │   ├── codec.py
│   │       │   │       │   ├── compat.py
│   │       │   │       │   ├── core.py
│   │       │   │       │   ├── idnadata.py
│   │       │   │       │   ├── intranges.py
│   │       │   │       │   ├── package_data.py
│   │       │   │       │   ├── py.typed
│   │       │   │       │   └── uts46data.py
│   │       │   │       ├── idna-3.19.dist-info/
│   │       │   │       │   ├── licenses/
│   │       │   │       │   │   └── LICENSE.md
│   │       │   │       │   ├── entry_points.txt
│   │       │   │       │   ├── INSTALLER
│   │       │   │       │   ├── METADATA
│   │       │   │       │   ├── RECORD
│   │       │   │       │   └── WHEEL
│   │       │   │       ├── pip/
│   │       │   │       │   ├── _internal/
│   │       │   │       │   │   ├── cli/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── autocompletion.py
│   │       │   │       │   │   │   ├── base_command.py
│   │       │   │       │   │   │   ├── cmdoptions.py
│   │       │   │       │   │   │   ├── command_context.py
│   │       │   │       │   │   │   ├── index_command.py
│   │       │   │       │   │   │   ├── main.py
│   │       │   │       │   │   │   ├── main_parser.py
│   │       │   │       │   │   │   ├── parser.py
│   │       │   │       │   │   │   ├── progress_bars.py
│   │       │   │       │   │   │   ├── req_command.py
│   │       │   │       │   │   │   ├── spinners.py
│   │       │   │       │   │   │   └── status_codes.py
│   │       │   │       │   │   ├── commands/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── cache.py
│   │       │   │       │   │   │   ├── check.py
│   │       │   │       │   │   │   ├── completion.py
│   │       │   │       │   │   │   ├── configuration.py
│   │       │   │       │   │   │   ├── debug.py
│   │       │   │       │   │   │   ├── download.py
│   │       │   │       │   │   │   ├── freeze.py
│   │       │   │       │   │   │   ├── hash.py
│   │       │   │       │   │   │   ├── help.py
│   │       │   │       │   │   │   ├── index.py
│   │       │   │       │   │   │   ├── inspect.py
│   │       │   │       │   │   │   ├── install.py
│   │       │   │       │   │   │   ├── list.py
│   │       │   │       │   │   │   ├── lock.py
│   │       │   │       │   │   │   ├── search.py
│   │       │   │       │   │   │   ├── show.py
│   │       │   │       │   │   │   ├── uninstall.py
│   │       │   │       │   │   │   └── wheel.py
│   │       │   │       │   │   ├── distributions/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── base.py
│   │       │   │       │   │   │   ├── installed.py
│   │       │   │       │   │   │   ├── sdist.py
│   │       │   │       │   │   │   └── wheel.py
│   │       │   │       │   │   ├── index/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── collector.py
│   │       │   │       │   │   │   ├── package_finder.py
│   │       │   │       │   │   │   └── sources.py
│   │       │   │       │   │   ├── locations/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── _distutils.py
│   │       │   │       │   │   │   ├── _sysconfig.py
│   │       │   │       │   │   │   └── base.py
│   │       │   │       │   │   ├── metadata/
│   │       │   │       │   │   │   ├── importlib/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   ├── _compat.py
│   │       │   │       │   │   │   │   ├── _dists.py
│   │       │   │       │   │   │   │   └── _envs.py
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── _json.py
│   │       │   │       │   │   │   ├── base.py
│   │       │   │       │   │   │   └── pkg_resources.py
│   │       │   │       │   │   ├── models/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── candidate.py
│   │       │   │       │   │   │   ├── direct_url.py
│   │       │   │       │   │   │   ├── format_control.py
│   │       │   │       │   │   │   ├── index.py
│   │       │   │       │   │   │   ├── installation_report.py
│   │       │   │       │   │   │   ├── link.py
│   │       │   │       │   │   │   ├── pylock.py
│   │       │   │       │   │   │   ├── scheme.py
│   │       │   │       │   │   │   ├── search_scope.py
│   │       │   │       │   │   │   ├── selection_prefs.py
│   │       │   │       │   │   │   ├── target_python.py
│   │       │   │       │   │   │   └── wheel.py
│   │       │   │       │   │   ├── network/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── auth.py
│   │       │   │       │   │   │   ├── cache.py
│   │       │   │       │   │   │   ├── download.py
│   │       │   │       │   │   │   ├── lazy_wheel.py
│   │       │   │       │   │   │   ├── session.py
│   │       │   │       │   │   │   ├── utils.py
│   │       │   │       │   │   │   └── xmlrpc.py
│   │       │   │       │   │   ├── operations/
│   │       │   │       │   │   │   ├── install/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   ├── editable_legacy.py
│   │       │   │       │   │   │   │   └── wheel.py
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── check.py
│   │       │   │       │   │   │   ├── freeze.py
│   │       │   │       │   │   │   └── prepare.py
│   │       │   │       │   │   ├── req/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── constructors.py
│   │       │   │       │   │   │   ├── req_dependency_group.py
│   │       │   │       │   │   │   ├── req_file.py
│   │       │   │       │   │   │   ├── req_install.py
│   │       │   │       │   │   │   ├── req_set.py
│   │       │   │       │   │   │   └── req_uninstall.py
│   │       │   │       │   │   ├── resolution/
│   │       │   │       │   │   │   ├── legacy/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   └── resolver.py
│   │       │   │       │   │   │   ├── resolvelib/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   ├── base.py
│   │       │   │       │   │   │   │   ├── candidates.py
│   │       │   │       │   │   │   │   ├── factory.py
│   │       │   │       │   │   │   │   ├── found_candidates.py
│   │       │   │       │   │   │   │   ├── provider.py
│   │       │   │       │   │   │   │   ├── reporter.py
│   │       │   │       │   │   │   │   ├── requirements.py
│   │       │   │       │   │   │   │   └── resolver.py
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   └── base.py
│   │       │   │       │   │   ├── utils/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── _jaraco_text.py
│   │       │   │       │   │   │   ├── _log.py
│   │       │   │       │   │   │   ├── appdirs.py
│   │       │   │       │   │   │   ├── compat.py
│   │       │   │       │   │   │   ├── compatibility_tags.py
│   │       │   │       │   │   │   ├── datetime.py
│   │       │   │       │   │   │   ├── deprecation.py
│   │       │   │       │   │   │   ├── direct_url_helpers.py
│   │       │   │       │   │   │   ├── egg_link.py
│   │       │   │       │   │   │   ├── entrypoints.py
│   │       │   │       │   │   │   ├── filesystem.py
│   │       │   │       │   │   │   ├── filetypes.py
│   │       │   │       │   │   │   ├── glibc.py
│   │       │   │       │   │   │   ├── hashes.py
│   │       │   │       │   │   │   ├── logging.py
│   │       │   │       │   │   │   ├── misc.py
│   │       │   │       │   │   │   ├── packaging.py
│   │       │   │       │   │   │   ├── retry.py
│   │       │   │       │   │   │   ├── setuptools_build.py
│   │       │   │       │   │   │   ├── subprocess.py
│   │       │   │       │   │   │   ├── temp_dir.py
│   │       │   │       │   │   │   ├── unpacking.py
│   │       │   │       │   │   │   ├── urls.py
│   │       │   │       │   │   │   ├── virtualenv.py
│   │       │   │       │   │   │   └── wheel.py
│   │       │   │       │   │   ├── vcs/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── bazaar.py
│   │       │   │       │   │   │   ├── git.py
│   │       │   │       │   │   │   ├── mercurial.py
│   │       │   │       │   │   │   ├── subversion.py
│   │       │   │       │   │   │   └── versioncontrol.py
│   │       │   │       │   │   ├── __init__.py
│   │       │   │       │   │   ├── build_env.py
│   │       │   │       │   │   ├── cache.py
│   │       │   │       │   │   ├── configuration.py
│   │       │   │       │   │   ├── exceptions.py
│   │       │   │       │   │   ├── main.py
│   │       │   │       │   │   ├── pyproject.py
│   │       │   │       │   │   ├── self_outdated_check.py
│   │       │   │       │   │   └── wheel_builder.py
│   │       │   │       │   ├── _vendor/
│   │       │   │       │   │   ├── cachecontrol/
│   │       │   │       │   │   │   ├── caches/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   ├── file_cache.py
│   │       │   │       │   │   │   │   └── redis_cache.py
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── _cmd.py
│   │       │   │       │   │   │   ├── adapter.py
│   │       │   │       │   │   │   ├── cache.py
│   │       │   │       │   │   │   ├── controller.py
│   │       │   │       │   │   │   ├── filewrapper.py
│   │       │   │       │   │   │   ├── heuristics.py
│   │       │   │       │   │   │   ├── py.typed
│   │       │   │       │   │   │   ├── serialize.py
│   │       │   │       │   │   │   └── wrapper.py
│   │       │   │       │   │   ├── certifi/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── __main__.py
│   │       │   │       │   │   │   ├── cacert.pem
│   │       │   │       │   │   │   ├── core.py
│   │       │   │       │   │   │   └── py.typed
│   │       │   │       │   │   ├── dependency_groups/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── __main__.py
│   │       │   │       │   │   │   ├── _implementation.py
│   │       │   │       │   │   │   ├── _lint_dependency_groups.py
│   │       │   │       │   │   │   ├── _pip_wrapper.py
│   │       │   │       │   │   │   ├── _toml_compat.py
│   │       │   │       │   │   │   └── py.typed
│   │       │   │       │   │   ├── distlib/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── compat.py
│   │       │   │       │   │   │   ├── resources.py
│   │       │   │       │   │   │   ├── scripts.py
│   │       │   │       │   │   │   ├── t32.exe
│   │       │   │       │   │   │   ├── t64-arm.exe
│   │       │   │       │   │   │   ├── t64.exe
│   │       │   │       │   │   │   ├── util.py
│   │       │   │       │   │   │   ├── w32.exe
│   │       │   │       │   │   │   ├── w64-arm.exe
│   │       │   │       │   │   │   └── w64.exe
│   │       │   │       │   │   ├── distro/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── __main__.py
│   │       │   │       │   │   │   ├── distro.py
│   │       │   │       │   │   │   └── py.typed
│   │       │   │       │   │   ├── idna/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── codec.py
│   │       │   │       │   │   │   ├── compat.py
│   │       │   │       │   │   │   ├── core.py
│   │       │   │       │   │   │   ├── idnadata.py
│   │       │   │       │   │   │   ├── intranges.py
│   │       │   │       │   │   │   ├── package_data.py
│   │       │   │       │   │   │   ├── py.typed
│   │       │   │       │   │   │   └── uts46data.py
│   │       │   │       │   │   ├── msgpack/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── exceptions.py
│   │       │   │       │   │   │   ├── ext.py
│   │       │   │       │   │   │   └── fallback.py
│   │       │   │       │   │   ├── packaging/
│   │       │   │       │   │   │   ├── licenses/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   └── _spdx.py
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── _elffile.py
│   │       │   │       │   │   │   ├── _manylinux.py
│   │       │   │       │   │   │   ├── _musllinux.py
│   │       │   │       │   │   │   ├── _parser.py
│   │       │   │       │   │   │   ├── _structures.py
│   │       │   │       │   │   │   ├── _tokenizer.py
│   │       │   │       │   │   │   ├── markers.py
│   │       │   │       │   │   │   ├── metadata.py
│   │       │   │       │   │   │   ├── py.typed
│   │       │   │       │   │   │   ├── requirements.py
│   │       │   │       │   │   │   ├── specifiers.py
│   │       │   │       │   │   │   ├── tags.py
│   │       │   │       │   │   │   ├── utils.py
│   │       │   │       │   │   │   └── version.py
│   │       │   │       │   │   ├── pkg_resources/
│   │       │   │       │   │   │   └── __init__.py
│   │       │   │       │   │   ├── platformdirs/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── __main__.py
│   │       │   │       │   │   │   ├── android.py
│   │       │   │       │   │   │   ├── api.py
│   │       │   │       │   │   │   ├── macos.py
│   │       │   │       │   │   │   ├── py.typed
│   │       │   │       │   │   │   ├── unix.py
│   │       │   │       │   │   │   ├── version.py
│   │       │   │       │   │   │   └── windows.py
│   │       │   │       │   │   ├── pygments/
│   │       │   │       │   │   │   ├── filters/
│   │       │   │       │   │   │   │   └── __init__.py
│   │       │   │       │   │   │   ├── formatters/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   └── _mapping.py
│   │       │   │       │   │   │   ├── lexers/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   ├── _mapping.py
│   │       │   │       │   │   │   │   └── python.py
│   │       │   │       │   │   │   ├── styles/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   └── _mapping.py
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── __main__.py
│   │       │   │       │   │   │   ├── console.py
│   │       │   │       │   │   │   ├── filter.py
│   │       │   │       │   │   │   ├── formatter.py
│   │       │   │       │   │   │   ├── lexer.py
│   │       │   │       │   │   │   ├── modeline.py
│   │       │   │       │   │   │   ├── plugin.py
│   │       │   │       │   │   │   ├── regexopt.py
│   │       │   │       │   │   │   ├── scanner.py
│   │       │   │       │   │   │   ├── sphinxext.py
│   │       │   │       │   │   │   ├── style.py
│   │       │   │       │   │   │   ├── token.py
│   │       │   │       │   │   │   ├── unistring.py
│   │       │   │       │   │   │   └── util.py
│   │       │   │       │   │   ├── pyproject_hooks/
│   │       │   │       │   │   │   ├── _in_process/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   └── _in_process.py
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── _impl.py
│   │       │   │       │   │   │   └── py.typed
│   │       │   │       │   │   ├── requests/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── __version__.py
│   │       │   │       │   │   │   ├── _internal_utils.py
│   │       │   │       │   │   │   ├── adapters.py
│   │       │   │       │   │   │   ├── api.py
│   │       │   │       │   │   │   ├── auth.py
│   │       │   │       │   │   │   ├── certs.py
│   │       │   │       │   │   │   ├── compat.py
│   │       │   │       │   │   │   ├── cookies.py
│   │       │   │       │   │   │   ├── exceptions.py
│   │       │   │       │   │   │   ├── help.py
│   │       │   │       │   │   │   ├── hooks.py
│   │       │   │       │   │   │   ├── models.py
│   │       │   │       │   │   │   ├── packages.py
│   │       │   │       │   │   │   ├── sessions.py
│   │       │   │       │   │   │   ├── status_codes.py
│   │       │   │       │   │   │   ├── structures.py
│   │       │   │       │   │   │   └── utils.py
│   │       │   │       │   │   ├── resolvelib/
│   │       │   │       │   │   │   ├── resolvers/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   ├── abstract.py
│   │       │   │       │   │   │   │   ├── criterion.py
│   │       │   │       │   │   │   │   ├── exceptions.py
│   │       │   │       │   │   │   │   └── resolution.py
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── providers.py
│   │       │   │       │   │   │   ├── py.typed
│   │       │   │       │   │   │   ├── reporters.py
│   │       │   │       │   │   │   └── structs.py
│   │       │   │       │   │   ├── rich/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── __main__.py
│   │       │   │       │   │   │   ├── _cell_widths.py
│   │       │   │       │   │   │   ├── _emoji_codes.py
│   │       │   │       │   │   │   ├── _emoji_replace.py
│   │       │   │       │   │   │   ├── _export_format.py
│   │       │   │       │   │   │   ├── _extension.py
│   │       │   │       │   │   │   ├── _fileno.py
│   │       │   │       │   │   │   ├── _inspect.py
│   │       │   │       │   │   │   ├── _log_render.py
│   │       │   │       │   │   │   ├── _loop.py
│   │       │   │       │   │   │   ├── _null_file.py
│   │       │   │       │   │   │   ├── _palettes.py
│   │       │   │       │   │   │   ├── _pick.py
│   │       │   │       │   │   │   ├── _ratio.py
│   │       │   │       │   │   │   ├── _spinners.py
│   │       │   │       │   │   │   ├── _stack.py
│   │       │   │       │   │   │   ├── _timer.py
│   │       │   │       │   │   │   ├── _win32_console.py
│   │       │   │       │   │   │   ├── _windows.py
│   │       │   │       │   │   │   ├── _windows_renderer.py
│   │       │   │       │   │   │   ├── _wrap.py
│   │       │   │       │   │   │   ├── abc.py
│   │       │   │       │   │   │   ├── align.py
│   │       │   │       │   │   │   ├── ansi.py
│   │       │   │       │   │   │   ├── bar.py
│   │       │   │       │   │   │   ├── box.py
│   │       │   │       │   │   │   ├── cells.py
│   │       │   │       │   │   │   ├── color.py
│   │       │   │       │   │   │   ├── color_triplet.py
│   │       │   │       │   │   │   ├── columns.py
│   │       │   │       │   │   │   ├── console.py
│   │       │   │       │   │   │   ├── constrain.py
│   │       │   │       │   │   │   ├── containers.py
│   │       │   │       │   │   │   ├── control.py
│   │       │   │       │   │   │   ├── default_styles.py
│   │       │   │       │   │   │   ├── diagnose.py
│   │       │   │       │   │   │   ├── emoji.py
│   │       │   │       │   │   │   ├── errors.py
│   │       │   │       │   │   │   ├── file_proxy.py
│   │       │   │       │   │   │   ├── filesize.py
│   │       │   │       │   │   │   ├── highlighter.py
│   │       │   │       │   │   │   ├── json.py
│   │       │   │       │   │   │   ├── jupyter.py
│   │       │   │       │   │   │   ├── layout.py
│   │       │   │       │   │   │   ├── live.py
│   │       │   │       │   │   │   ├── live_render.py
│   │       │   │       │   │   │   ├── logging.py
│   │       │   │       │   │   │   ├── markup.py
│   │       │   │       │   │   │   ├── measure.py
│   │       │   │       │   │   │   ├── padding.py
│   │       │   │       │   │   │   ├── pager.py
│   │       │   │       │   │   │   ├── palette.py
│   │       │   │       │   │   │   ├── panel.py
│   │       │   │       │   │   │   ├── pretty.py
│   │       │   │       │   │   │   ├── progress.py
│   │       │   │       │   │   │   ├── progress_bar.py
│   │       │   │       │   │   │   ├── prompt.py
│   │       │   │       │   │   │   ├── protocol.py
│   │       │   │       │   │   │   ├── py.typed
│   │       │   │       │   │   │   ├── region.py
│   │       │   │       │   │   │   ├── repr.py
│   │       │   │       │   │   │   ├── rule.py
│   │       │   │       │   │   │   ├── scope.py
│   │       │   │       │   │   │   ├── screen.py
│   │       │   │       │   │   │   ├── segment.py
│   │       │   │       │   │   │   ├── spinner.py
│   │       │   │       │   │   │   ├── status.py
│   │       │   │       │   │   │   ├── style.py
│   │       │   │       │   │   │   ├── styled.py
│   │       │   │       │   │   │   ├── syntax.py
│   │       │   │       │   │   │   ├── table.py
│   │       │   │       │   │   │   ├── terminal_theme.py
│   │       │   │       │   │   │   ├── text.py
│   │       │   │       │   │   │   ├── theme.py
│   │       │   │       │   │   │   ├── themes.py
│   │       │   │       │   │   │   ├── traceback.py
│   │       │   │       │   │   │   └── tree.py
│   │       │   │       │   │   ├── tomli/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── _parser.py
│   │       │   │       │   │   │   ├── _re.py
│   │       │   │       │   │   │   ├── _types.py
│   │       │   │       │   │   │   └── py.typed
│   │       │   │       │   │   ├── tomli_w/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── _writer.py
│   │       │   │       │   │   │   └── py.typed
│   │       │   │       │   │   ├── truststore/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── _api.py
│   │       │   │       │   │   │   ├── _macos.py
│   │       │   │       │   │   │   ├── _openssl.py
│   │       │   │       │   │   │   ├── _ssl_constants.py
│   │       │   │       │   │   │   ├── _windows.py
│   │       │   │       │   │   │   └── py.typed
│   │       │   │       │   │   ├── urllib3/
│   │       │   │       │   │   │   ├── contrib/
│   │       │   │       │   │   │   │   ├── _securetransport/
│   │       │   │       │   │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   │   ├── bindings.py
│   │       │   │       │   │   │   │   │   └── low_level.py
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   ├── _appengine_environ.py
│   │       │   │       │   │   │   │   ├── appengine.py
│   │       │   │       │   │   │   │   ├── ntlmpool.py
│   │       │   │       │   │   │   │   ├── pyopenssl.py
│   │       │   │       │   │   │   │   ├── securetransport.py
│   │       │   │       │   │   │   │   └── socks.py
│   │       │   │       │   │   │   ├── packages/
│   │       │   │       │   │   │   │   ├── backports/
│   │       │   │       │   │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   │   ├── makefile.py
│   │       │   │       │   │   │   │   │   └── weakref_finalize.py
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   └── six.py
│   │       │   │       │   │   │   ├── util/
│   │       │   │       │   │   │   │   ├── __init__.py
│   │       │   │       │   │   │   │   ├── connection.py
│   │       │   │       │   │   │   │   ├── proxy.py
│   │       │   │       │   │   │   │   ├── queue.py
│   │       │   │       │   │   │   │   ├── request.py
│   │       │   │       │   │   │   │   ├── response.py
│   │       │   │       │   │   │   │   ├── retry.py
│   │       │   │       │   │   │   │   ├── ssl_.py
│   │       │   │       │   │   │   │   ├── ssl_match_hostname.py
│   │       │   │       │   │   │   │   ├── ssltransport.py
│   │       │   │       │   │   │   │   ├── timeout.py
│   │       │   │       │   │   │   │   ├── url.py
│   │       │   │       │   │   │   │   └── wait.py
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── _collections.py
│   │       │   │       │   │   │   ├── _version.py
│   │       │   │       │   │   │   ├── connection.py
│   │       │   │       │   │   │   ├── connectionpool.py
│   │       │   │       │   │   │   ├── exceptions.py
│   │       │   │       │   │   │   ├── fields.py
│   │       │   │       │   │   │   ├── filepost.py
│   │       │   │       │   │   │   ├── poolmanager.py
│   │       │   │       │   │   │   ├── request.py
│   │       │   │       │   │   │   └── response.py
│   │       │   │       │   │   ├── __init__.py
│   │       │   │       │   │   └── vendor.txt
│   │       │   │       │   ├── __init__.py
│   │       │   │       │   ├── __main__.py
│   │       │   │       │   ├── __pip-runner__.py
│   │       │   │       │   └── py.typed
│   │       │   │       ├── pip-25.2.dist-info/
│   │       │   │       │   ├── licenses/
│   │       │   │       │   │   ├── src/
│   │       │   │       │   │   │   └── pip/
│   │       │   │       │   │   │       └── _vendor/
│   │       │   │       │   │   │           ├── cachecontrol/
│   │       │   │       │   │   │           │   └── LICENSE.txt
│   │       │   │       │   │   │           ├── certifi/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           ├── dependency_groups/
│   │       │   │       │   │   │           │   └── LICENSE.txt
│   │       │   │       │   │   │           ├── distlib/
│   │       │   │       │   │   │           │   └── LICENSE.txt
│   │       │   │       │   │   │           ├── distro/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           ├── idna/
│   │       │   │       │   │   │           │   └── LICENSE.md
│   │       │   │       │   │   │           ├── msgpack/
│   │       │   │       │   │   │           │   └── COPYING
│   │       │   │       │   │   │           ├── packaging/
│   │       │   │       │   │   │           │   ├── LICENSE
│   │       │   │       │   │   │           │   ├── LICENSE.APACHE
│   │       │   │       │   │   │           │   └── LICENSE.BSD
│   │       │   │       │   │   │           ├── pkg_resources/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           ├── platformdirs/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           ├── pygments/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           ├── pyproject_hooks/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           ├── requests/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           ├── resolvelib/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           ├── rich/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           ├── tomli/
│   │       │   │       │   │   │           │   ├── LICENSE
│   │       │   │       │   │   │           │   └── LICENSE-HEADER
│   │       │   │       │   │   │           ├── tomli_w/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           ├── truststore/
│   │       │   │       │   │   │           │   └── LICENSE
│   │       │   │       │   │   │           └── urllib3/
│   │       │   │       │   │   │               └── LICENSE.txt
│   │       │   │       │   │   ├── AUTHORS.txt
│   │       │   │       │   │   └── LICENSE.txt
│   │       │   │       │   ├── entry_points.txt
│   │       │   │       │   ├── INSTALLER
│   │       │   │       │   ├── METADATA
│   │       │   │       │   ├── RECORD
│   │       │   │       │   ├── REQUESTED
│   │       │   │       │   ├── top_level.txt
│   │       │   │       │   └── WHEEL
│   │       │   │       ├── pymupdf/
│   │       │   │       │   ├── mupdf-devel/
│   │       │   │       │   │   ├── include/
│   │       │   │       │   │   │   └── mupdf/
│   │       │   │       │   │   │       ├── fitz/
│   │       │   │       │   │   │       │   ├── archive.h
│   │       │   │       │   │   │       │   ├── band-writer.h
│   │       │   │       │   │   │       │   ├── barcode.h
│   │       │   │       │   │   │       │   ├── bidi.h
│   │       │   │       │   │   │       │   ├── bitmap.h
│   │       │   │       │   │   │       │   ├── buffer.h
│   │       │   │       │   │   │       │   ├── color.h
│   │       │   │       │   │   │       │   ├── compress.h
│   │       │   │       │   │   │       │   ├── compressed-buffer.h
│   │       │   │       │   │   │       │   ├── config.h
│   │       │   │       │   │   │       │   ├── context.h
│   │       │   │       │   │   │       │   ├── crypt.h
│   │       │   │       │   │   │       │   ├── deskew.h
│   │       │   │       │   │   │       │   ├── device.h
│   │       │   │       │   │   │       │   ├── display-list.h
│   │       │   │       │   │   │       │   ├── document.h
│   │       │   │       │   │   │       │   ├── export.h
│   │       │   │       │   │   │       │   ├── filter.h
│   │       │   │       │   │   │       │   ├── font.h
│   │       │   │       │   │   │       │   ├── geometry.h
│   │       │   │       │   │   │       │   ├── getopt.h
│   │       │   │       │   │   │       │   ├── glyph-cache.h
│   │       │   │       │   │   │       │   ├── glyph.h
│   │       │   │       │   │   │       │   ├── hash.h
│   │       │   │       │   │   │       │   ├── heap-imp.h
│   │       │   │       │   │   │       │   ├── heap.h
│   │       │   │       │   │   │       │   ├── hyphen.h
│   │       │   │       │   │   │       │   ├── image.h
│   │       │   │       │   │   │       │   ├── json.h
│   │       │   │       │   │   │       │   ├── link.h
│   │       │   │       │   │   │       │   ├── log.h
│   │       │   │       │   │   │       │   ├── options.h
│   │       │   │       │   │   │       │   ├── outline.h
│   │       │   │       │   │   │       │   ├── output-svg.h
│   │       │   │       │   │   │       │   ├── output.h
│   │       │   │       │   │   │       │   ├── path.h
│   │       │   │       │   │   │       │   ├── pixmap.h
│   │       │   │       │   │   │       │   ├── pool.h
│   │       │   │       │   │   │       │   ├── separation.h
│   │       │   │       │   │   │       │   ├── shade.h
│   │       │   │       │   │   │       │   ├── store.h
│   │       │   │       │   │   │       │   ├── story-writer.h
│   │       │   │       │   │   │       │   ├── story.h
│   │       │   │       │   │   │       │   ├── stream.h
│   │       │   │       │   │   │       │   ├── string-util.h
│   │       │   │       │   │   │       │   ├── structured-text.h
│   │       │   │       │   │   │       │   ├── system.h
│   │       │   │       │   │   │       │   ├── text.h
│   │       │   │       │   │   │       │   ├── track-usage.h
│   │       │   │       │   │   │       │   ├── transition.h
│   │       │   │       │   │   │       │   ├── tree.h
│   │       │   │       │   │   │       │   ├── types.h
│   │       │   │       │   │   │       │   ├── util.h
│   │       │   │       │   │   │       │   ├── version.h
│   │       │   │       │   │   │       │   ├── write-pixmap.h
│   │       │   │       │   │   │       │   ├── writer.h
│   │       │   │       │   │   │       │   └── xml.h
│   │       │   │       │   │   │       ├── helpers/
│   │       │   │       │   │   │       │   ├── mu-office-lib.h
│   │       │   │       │   │   │       │   ├── mu-threads.h
│   │       │   │       │   │   │       │   └── pkcs7-openssl.h
│   │       │   │       │   │   │       ├── pdf/
│   │       │   │       │   │   │       │   ├── annot.h
│   │       │   │       │   │   │       │   ├── clean.h
│   │       │   │       │   │   │       │   ├── cmap.h
│   │       │   │       │   │   │       │   ├── crypt.h
│   │       │   │       │   │   │       │   ├── document.h
│   │       │   │       │   │   │       │   ├── event.h
│   │       │   │       │   │   │       │   ├── font.h
│   │       │   │       │   │   │       │   ├── form.h
│   │       │   │       │   │   │       │   ├── image-rewriter.h
│   │       │   │       │   │   │       │   ├── interpret.h
│   │       │   │       │   │   │       │   ├── javascript.h
│   │       │   │       │   │   │       │   ├── name-table.h
│   │       │   │       │   │   │       │   ├── object.h
│   │       │   │       │   │   │       │   ├── page.h
│   │       │   │       │   │   │       │   ├── parse.h
│   │       │   │       │   │   │       │   ├── recolor.h
│   │       │   │       │   │   │       │   ├── resource.h
│   │       │   │       │   │   │       │   ├── xref.h
│   │       │   │       │   │   │       │   └── zugferd.h
│   │       │   │       │   │   │       ├── classes.h
│   │       │   │       │   │   │       ├── classes2.h
│   │       │   │       │   │   │       ├── exceptions.h
│   │       │   │       │   │   │       ├── extra.h
│   │       │   │       │   │   │       ├── fitz.h
│   │       │   │       │   │   │       ├── functions.h
│   │       │   │       │   │   │       ├── html.h
│   │       │   │       │   │   │       ├── internal.h
│   │       │   │       │   │   │       ├── memento.h
│   │       │   │       │   │   │       ├── pdf.h
│   │       │   │       │   │   │       └── ucdn.h
│   │       │   │       │   │   └── lib/
│   │       │   │       │   │       ├── libmuthreads.lib
│   │       │   │       │   │       └── mupdfcpp64.lib
│   │       │   │       │   ├── __init__.py
│   │       │   │       │   ├── __main__.py
│   │       │   │       │   ├── _apply_pages.py
│   │       │   │       │   ├── _build.py
│   │       │   │       │   ├── _extra.pyd
│   │       │   │       │   ├── _mupdf.pyd
│   │       │   │       │   ├── _table_headers.py
│   │       │   │       │   ├── _table_refine.py
│   │       │   │       │   ├── _table_spans.py
│   │       │   │       │   ├── _table_union.py
│   │       │   │       │   ├── _wxcolors.py
│   │       │   │       │   ├── extra.py
│   │       │   │       │   ├── mupdf.py
│   │       │   │       │   ├── mupdfcpp64.dll
│   │       │   │       │   ├── py.typed
│   │       │   │       │   ├── pymupdf.py
│   │       │   │       │   ├── table.py
│   │       │   │       │   └── utils.py
│   │       │   │       ├── pymupdf-1.28.2.dist-info/
│   │       │   │       │   ├── COPYING
│   │       │   │       │   ├── entry_points.txt
│   │       │   │       │   ├── INSTALLER
│   │       │   │       │   ├── METADATA
│   │       │   │       │   ├── README.md
│   │       │   │       │   ├── RECORD
│   │       │   │       │   ├── REQUESTED
│   │       │   │       │   └── WHEEL
│   │       │   │       ├── requests/
│   │       │   │       │   ├── __init__.py
│   │       │   │       │   ├── __version__.py
│   │       │   │       │   ├── _internal_utils.py
│   │       │   │       │   ├── _types.py
│   │       │   │       │   ├── adapters.py
│   │       │   │       │   ├── api.py
│   │       │   │       │   ├── auth.py
│   │       │   │       │   ├── certs.py
│   │       │   │       │   ├── compat.py
│   │       │   │       │   ├── cookies.py
│   │       │   │       │   ├── exceptions.py
│   │       │   │       │   ├── help.py
│   │       │   │       │   ├── hooks.py
│   │       │   │       │   ├── models.py
│   │       │   │       │   ├── packages.py
│   │       │   │       │   ├── py.typed
│   │       │   │       │   ├── sessions.py
│   │       │   │       │   ├── status_codes.py
│   │       │   │       │   ├── structures.py
│   │       │   │       │   └── utils.py
│   │       │   │       ├── requests-2.34.2.dist-info/
│   │       │   │       │   ├── licenses/
│   │       │   │       │   │   ├── LICENSE
│   │       │   │       │   │   └── NOTICE
│   │       │   │       │   ├── INSTALLER
│   │       │   │       │   ├── METADATA
│   │       │   │       │   ├── RECORD
│   │       │   │       │   ├── REQUESTED
│   │       │   │       │   ├── top_level.txt
│   │       │   │       │   └── WHEEL
│   │       │   │       ├── urllib3/
│   │       │   │       │   ├── contrib/
│   │       │   │       │   │   ├── emscripten/
│   │       │   │       │   │   │   ├── __init__.py
│   │       │   │       │   │   │   ├── connection.py
│   │       │   │       │   │   │   ├── emscripten_fetch_worker.js
│   │       │   │       │   │   │   ├── fetch.py
│   │       │   │       │   │   │   ├── request.py
│   │       │   │       │   │   │   └── response.py
│   │       │   │       │   │   ├── __init__.py
│   │       │   │       │   │   ├── pyopenssl.py
│   │       │   │       │   │   └── socks.py
│   │       │   │       │   ├── http2/
│   │       │   │       │   │   ├── __init__.py
│   │       │   │       │   │   ├── connection.py
│   │       │   │       │   │   └── probe.py
│   │       │   │       │   ├── util/
│   │       │   │       │   │   ├── __init__.py
│   │       │   │       │   │   ├── connection.py
│   │       │   │       │   │   ├── proxy.py
│   │       │   │       │   │   ├── request.py
│   │       │   │       │   │   ├── response.py
│   │       │   │       │   │   ├── retry.py
│   │       │   │       │   │   ├── ssl_.py
│   │       │   │       │   │   ├── ssl_match_hostname.py
│   │       │   │       │   │   ├── ssltransport.py
│   │       │   │       │   │   ├── timeout.py
│   │       │   │       │   │   ├── url.py
│   │       │   │       │   │   ├── util.py
│   │       │   │       │   │   └── wait.py
│   │       │   │       │   ├── __init__.py
│   │       │   │       │   ├── _base_connection.py
│   │       │   │       │   ├── _collections.py
│   │       │   │       │   ├── _request_methods.py
│   │       │   │       │   ├── _version.py
│   │       │   │       │   ├── connection.py
│   │       │   │       │   ├── connectionpool.py
│   │       │   │       │   ├── exceptions.py
│   │       │   │       │   ├── fields.py
│   │       │   │       │   ├── filepost.py
│   │       │   │       │   ├── poolmanager.py
│   │       │   │       │   ├── py.typed
│   │       │   │       │   └── response.py
│   │       │   │       └── urllib3-2.7.0.dist-info/
│   │       │   │           ├── licenses/
│   │       │   │           │   └── LICENSE.txt
│   │       │   │           ├── INSTALLER
│   │       │   │           ├── METADATA
│   │       │   │           ├── RECORD
│   │       │   │           └── WHEEL
│   │       │   ├── Scripts/
│   │       │   │   ├── activate
│   │       │   │   ├── activate.bat
│   │       │   │   ├── activate.fish
│   │       │   │   ├── Activate.ps1
│   │       │   │   ├── deactivate.bat
│   │       │   │   ├── idna.exe
│   │       │   │   ├── normalizer.exe
│   │       │   │   ├── pip.exe
│   │       │   │   ├── pip3.13.exe
│   │       │   │   ├── pip3.exe
│   │       │   │   ├── pymupdf.exe
│   │       │   │   ├── python.exe
│   │       │   │   └── pythonw.exe
│   │       │   ├── .gitignore
│   │       │   └── pyvenv.cfg
│   │       ├── extract.py
│   │       ├── README.md
│   │       ├── requirements.txt
│   │       ├── sanjesh_universities.json
│   │       └── sources.py
│   └── project-map/
│       └── main.py
├── .dashboard-dev.stderr.log
├── .dashboard-dev.stdout.log
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── .waand-dev.stderr.log
├── .waand-dev.stdout.log
├── AGENTS.md
├── AUTHENTICATION.md
├── docker-compose.yml
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
└── turbo.json
```
