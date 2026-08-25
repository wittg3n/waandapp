<!-- code-project-guidance-map:guide:start -->
Guide ID: web.marketing
Guide kind: leaf
Guide path: .agents/guidance-map/guides/web/marketing.md
Content hash: sha256:c1b4873cbab71a2e
<!-- code-project-guidance-map:guide:end -->

# Marketing Web App

- Module Path: `apps/web`
- Owns: The Persian public marketing site, landing composition and motion, app-local presentation primitives/assets, SEO metadata endpoints, and Next.js packaging.
- Change here when: Editing public copy, sections, navigation/footer, dashboard CTAs, testimonial motion, marketing visuals/styles, metadata, robots/sitemap, or web build configuration.
- Do not put here: Authenticated dashboard behavior, production authentication/session logic, API/domain behavior, or framework-neutral workspace configuration.
- Key entry points:

```text
src/app/{layout.tsx,page.tsx,robots.ts,sitemap.ts}
src/components/landing/{landing-page.tsx,landing-navbar.tsx,motion.tsx,testimonials.tsx}
src/components/ui/{button.tsx,line-shadow-text.tsx,resizable-navbar.tsx,waand-logo.tsx}
src/styles/globals.css
src/lib/site.ts
public/assets/
next.config.ts
package.json
```

## Internal Structure

- The App Router home page emits Organization and SoftwareApplication structured data before rendering `LandingPage`; the root layout and `lib/site.ts` centralize Persian RTL document settings, canonical metadata, and the public site URL.
- `LandingPage` composes the navbar, hero, process, app promo, guided-path, security, testimonials, final CTA, and footer. Dashboard signup/login URLs are built from `NEXT_PUBLIC_USER_DASHBOARD_URL`; product mockups and the final CTA journey are mostly inline JSX/SVG with raster artwork under `public/assets/`.
- `landing-page.tsx` owns final-journey content and geometry: the shared four-step data, desktop/mobile point sets and Bezier paths, SVG definitions/decorations, portal geometry, and the reusable Waand-logo signup start card. Desktop uses one wide `1440x480` coordinate system so the layered path, milestone anchors, architectural portal, glow, and light plane stay aligned; mobile is a separate `390x760` vertical composition rather than a scaled desktop scene.
- Browser-only behavior stays in client components: `motion.tsx` owns reveal, pointer-parallax, scroll-scene, testimonial-marquee, card-motion, and final-journey primitives; the navbar owns mobile-menu state and `testimonials.tsx` owns testimonial data/layout. One `JourneyScene` viewport trigger sequences the start/copy, path draw, progress-indexed milestones, and portal stages; reduced motion returns the entire journey as a completed static scene, while parallax is gated to fine pointers at desktop widths and resets on exit.
- Testimonials render two opposite-direction lanes through `TestimonialMarquee`. Each lane measures a content copy including its trailing gap, grows the number of copies until one cycle group covers the viewport, renders an identical duplicate cycle group, and wraps `x` by exactly one measured group width; duplicate semantic content is `aria-hidden` and `ResizeObserver` maintains viewport/group sizing.
- `globals.css` provides Tailwind v4 tokens, Vazirmatn typography, shared landing shells, focus/skip-link treatment, and global reduced-motion rules. `next.config.ts` loads repository-root environment values, validates all three public URLs, and produces standalone output.

## Local Rules

- Keep metadata, canonical URL, robots, sitemap, visible copy, and structured data consistent when changing product positioning or the public site URL.
- Preserve the testimonial loop invariants: one cycle group must be at least the viewport width, both cycle groups must be identical, trailing gaps must remain inside the measured width, and wrapping must stay within `[-width, 0)` by exactly one group width.
- Keep `ResizeObserver` coverage and `aria-hidden` duplicate handling intact; under reduced motion, testimonials must become a manually scrollable horizontal overflow row instead of auto-animating.
- Preserve the server/client boundary: keep browser hooks and Motion logic in files marked `use client`, with stable reduced-motion render paths for every animation scene.
- Keep the desktop and mobile final-journey variants semantically equivalent: share the signup URL, actual Waand start card, and milestone data; preserve the ordered-list labels and scene `aria-label`; and update each variant's path, point set, portal geometry, definitions, and absolute start-card placement together when changing its route.
- Keep SVG geometry in `landing-page.tsx` and final-journey choreography in `motion.tsx`. The three path layers must share one path per breakpoint, milestone arrival fractions must track that draw, and the portal outline/glow/beam/endpoint stages must remain coordinated with the path completion.
- Preserve motion fallbacks and pointer safety: every journey primitive needs an immediate non-Motion reduced-motion render, the decorative pulse may disappear but no content may, and pointer parallax must remain limited to fine pointers at desktop widths, reset on leave, and never obstruct the signup control.
- Keep section IDs aligned with navbar/footer anchors, retain Persian `lang="fa"` and RTL semantics, and preserve skip-link, focus, labels, and meaningful/decorative image accessibility.
- Treat CTA destinations as a cross-app integration boundary: this app owns link placement/copy and constructs routes from `NEXT_PUBLIC_USER_DASHBOARD_URL`; the dashboard owns login/signup behavior.
- Reference `public/` assets with root-relative paths and update both the asset and its `next/image` sizing/alt text when replacing artwork.
- Treat `next-env.d.ts` as Next.js-generated route/type plumbing; do not hand-edit it.
- Treat the testimonial array as demo data until claims are verified for production use.
- From the workspace root, verify with `pnpm --filter @waandapp/web typecheck` and `pnpm --filter @waandapp/web lint`; builds also require valid `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_USER_DASHBOARD_URL` values.
