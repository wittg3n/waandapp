<!-- code-project-guidance-map:guide:start -->
Guide ID: user-dashboard.product
Guide kind: leaf
Guide path: .agents/guidance-map/guides/user-dashboard/product.md
Content hash: sha256:ad9381a07531f2b5
<!-- code-project-guidance-map:guide:end -->

# Dashboard Product Experience

- Module Path: `apps/user-dashboard/src/features/dashboard`
- Owns: The personalized application dashboard, its typed view model and fixture data, summary cards, journey previews, and placeholders for unfinished product areas.
- Change here when: Adjusting dashboard phase behavior, application metrics or recommendations, attention and status cards, dashboard navigation, or placeholder copy and presentation.
- Do not put here: Authentication state, shared UI primitives and formatters, route registration, or full implementations of profile, documents, universities, applications, deadlines, messages, settings, and help.
- Key entry points:

```text
types.ts
data/application-dashboard.ts
pages/dashboard-page.tsx
pages/feature-placeholder-page.tsx
components/
```

## Internal Structure

- `DashboardPage` reads the authenticated user's name, consumes the feature-local `DashboardViewModel`, derives phase- and data-dependent section visibility, and composes the responsive animated page.
- `types.ts` defines the dashboard contract; `data/application-dashboard.ts` supplies the current static product fixture, while focused components render actions, pipeline stages, recommendations, insights, deadlines, document health, and activity from readonly props.
- `FeaturePlaceholderPage` maps neighboring route paths to Persian titles, descriptions, and icons until those product areas receive their own implementations.

## Local Rules

- Keep fixture data aligned with `DashboardViewModel`; when extending a discriminated union, update every exhaustive icon, label, description, or visual mapping that keys on it.
- Preserve phase and empty-collection guards in `DashboardPage`, plus component-level `null` returns, so unavailable dashboard sections do not render empty shells.
- Keep cross-feature navigation as route links and continue using shared UI primitives, formatting helpers, and `cn` rather than duplicating those concerns here.
- Preserve Persian product copy and accessibility contracts, including section labels, descriptive link labels, `dir="auto"` for mixed-language content, and per-page document titles.
