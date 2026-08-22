<!-- code-project-guidance-map:guide:start -->
Guide ID: web.marketing
Guide kind: leaf
Guide path: .agents/guidance-map/guides/web/marketing.md
Content hash: sha256:874c6fc51404d9d9
<!-- code-project-guidance-map:guide:end -->

# Marketing Web App

- Module Path: `apps/web`
- Owns: The Persian public marketing site, landing-page content and motion, local presentation primitives and assets, and web metadata/SEO endpoints.
- Change here when: Editing landing sections, copy, calls to action, navigation/footer, marketing visuals or animation, global web styling, or site metadata and Next.js build behavior.
- Do not put here: Authenticated dashboard behavior, API/domain logic, user identity implementation, or repository-wide shared configuration and packages.
- Key entry points:

```text
src/app/{layout.tsx,page.tsx,robots.ts,sitemap.ts}
src/components/landing/{landing-page.tsx,landing-navbar.tsx,motion.tsx,testimonials.tsx}
src/components/ui/
src/styles/globals.css
src/lib/site.ts
public/assets/
next.config.ts
package.json
```

## Internal Structure

- The Next.js App Router root page emits Organization and SoftwareApplication structured data, then renders the single composed landing page; the root layout and `lib/site.ts` centralize Persian document settings and SEO metadata.
- `LandingPage` assembles the navbar, hero, process, dashboard-promo, guided-path, security, testimonials, final CTA, and footer sections; most mock product visuals are inline JSX/SVG, while raster artwork is served from `public/assets/` through `next/image`.
- Browser behavior stays in client components: `motion.tsx` provides reusable reveal, pointer-parallax, and scroll-scrub scene contexts; the navbar and testimonials own their local interaction state.
- `globals.css` supplies Tailwind v4 tokens, layout shells, typography, focus treatment, and reduced-motion fallbacks; `components/ui/` contains app-local button, logo, navbar, and text-effect primitives.
- `robots.ts` and `sitemap.ts` derive URLs from `NEXT_PUBLIC_SITE_URL` with the production fallback in `lib/site.ts`; `next.config.ts` loads repository-root environment values and requires a valid `NEXT_PUBLIC_API_URL`.

## Local Rules

- Keep metadata, canonical URL, robots, sitemap, visible copy, and structured data consistent when changing product positioning or the public site URL.
- Preserve the server/client boundary: keep browser hooks and Framer Motion logic in files marked `use client`, and retain stable reduced-motion render paths for every animation scene.
- Keep section IDs aligned with navbar/footer anchors, retain Persian `lang="fa"` and RTL semantics, and preserve skip-link, focus, labels, and meaningful/decorative image accessibility.
- Treat CTA destinations as a cross-app integration boundary: this app owns link placement and copy, while the dashboard owns login/signup behavior. Current links mix `/login` with `http://localhost:5173/login`, so verify the intended deployment target before editing them.
- Reference `public/` assets with root-relative paths and update both the asset and its `next/image` sizing/alt text when replacing artwork.
- Verify with `npm --prefix apps/web run typecheck` and `npm --prefix apps/web run lint`; `npm --prefix apps/web run build` additionally requires a valid `NEXT_PUBLIC_API_URL`.
