---
summary: Tighten metadata, structured data, internal linking, and crawl signals across the public pages so Ship by Sunday can rank for AI app starter searches without widening scope into protected routes.
read_when: Open this when implementing or reviewing SEO changes on `/`, `/docs/**`, or `/blog/**`, or when a public copy change might affect crawlability or search positioning.
plan_status: not_done
---

# Optimize Public Pages for AI App Starter Search Intent

This document is a living execution plan. Keep it current as research, implementation, validation, and follow-up decisions evolve so a fresh agent can resume from this file alone.

This ExecPlan must be maintained in accordance with `.plans/PLANS.md`.

## Purpose / Big Picture

The user-visible result of this work is that the public, signed-out pages describe Ship by Sunday clearly enough for both people and search engines to understand what it is: a blueprint-first system that helps people build SaaS with AI and behaves like a credible AI app starter. The visible product framing on the homepage must remain blueprint-first. The target queries `AI app starter` and `build SaaS with AI` are supporting SEO language for metadata, docs copy, blog copy, and internal links, not permission to rewrite the product into generic starter-tool positioning. After implementation, a signed-out visitor who lands on `/`, `/docs`, or `/blog` should see truthful page titles, descriptions, canonical tags, social previews, and contextual links that match the visible page content, and search crawlers should see structured data that reflects what is actually on the page.

The broader outcome is that SEO becomes a maintained product contract instead of a one-time metadata pass. The indexable surface should stay intentionally small, the protected/auth flows should remain out of the index, and the tests should make it difficult to regress canonical tags, sitemap coverage, or noindex behavior while changing public copy later.

## Progress

- [x] 2026-04-06 15:18 EDT: Reviewed `.plans/PLANS.md`, the long-horizon planning skill, and `todo.md` before drafting this ExecPlan.
- [x] 2026-04-06 15:18 EDT: Audited the current public SEO boundaries in `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/app/robots.ts`, `apps/web/app/sitemap.ts`, `apps/web/features/marketing/lib/home-page-structured-data.ts`, `apps/web/features/docs/lib/docs-metadata.ts`, `apps/web/features/blog/lib/blog-metadata.ts`, and `apps/web/features/blog/lib/blog-structured-data.ts`.
- [x] 2026-04-06 15:18 EDT: Confirmed the current indexable surface is `/`, `/docs/**`, and `/blog/**`, while auth, checkout, and workspace routes already emit `noindex` or are excluded from crawl routes.
- [ ] Create route-owned homepage metadata for the commercial search intent around “AI app starter” and “build SaaS with AI”.
- [ ] Tighten docs metadata, add docs structured data, and improve the docs landing-page title and social contract.
- [ ] Audit and rewrite the visible public copy and internal links that support the target queries.
- [ ] Expand regression coverage for public metadata, schema, sitemap, and noindex boundaries.
- [ ] Run the required root gates and perform post-deploy crawl verification.

## Surprises & Discoveries

The public SEO baseline already exists and is stronger than a blank-slate site. `apps/web/app/layout.tsx` defines root metadata, `apps/web/app/robots.ts` and `apps/web/app/sitemap.ts` generate crawl endpoints, `apps/web/features/marketing/lib/home-page-structured-data.ts` emits homepage JSON-LD, and the blog route already has both metadata and structured data helpers. This means the implementation should be a hardening pass, not a new subsystem.

The homepage does not currently own its metadata at the page boundary. `apps/web/app/page.tsx` only renders the homepage and its JSON-LD, while the actual title, description, canonical, and social defaults come from `apps/web/app/layout.tsx`. That is a real coupling problem because improving the homepage for commercial search intent currently means changing metadata inherited by all public routes unless a route overrides it later.

The docs surface already has broad frontmatter coverage. Every public MDX page in `apps/web/content/docs/` includes a title and description, and `apps/web/tests/unit/docs-metadata.test.ts` already proves canonical and social defaults. The weak spots are more specific: the docs landing page falls back to “Start Here”, docs pages use a generic `article` Open Graph type for every page, and there is no docs-specific JSON-LD even though the docs route is one of the three indexable surfaces.

The browser-smoke suite already treats public SEO as contract, not decoration. `apps/web/tests/browser-smoke/app-smoke.spec.ts` asserts homepage schema, canonical tags, robots and sitemap behavior, blog article metadata, docs canonicals, and noindex coverage for sign-in and recovery routes. The implementation should extend that contract rather than creating a separate SEO-only test path.

The homepage has one special-case rendering detail that matters for validation. `apps/web/app/page.tsx` redirects entitled users away from `/` unless `marketing=1` is present, and the existing smoke tests already use `/?marketing=1` to force the signed-out marketing render. Any future SEO checks that hit the homepage should keep using the public marketing variant instead of the entitled-user redirect path.

## Decision Log

Decision: keep the implementation route-local instead of creating a broad shared SEO framework.
Rationale: the repo already has feature-local metadata helpers for blog and docs. The smallest viable change is to add one homepage metadata helper and one docs structured-data helper, then tighten tests around those boundaries. A generic SEO abstraction would add indirection without solving a demonstrated problem.
Date: 2026-04-06

Decision: treat `/` as the primary commercial acquisition page for the target intents “AI app starter” and “build SaaS with AI”.
Rationale: the user explicitly named those intents, and the homepage is the only public route with commercial purchase framing. Docs and blog should support those themes, but they should not replace the homepage as the main acquisition surface.
Date: 2026-04-06

Decision: keep auth, checkout, recovery, and workspace routes out of scope except for regression checks.
Rationale: those routes already have the right high-level SEO behavior. The goal is to improve public pages, not accidentally widen crawlability or start indexing user-only surfaces.
Date: 2026-04-06

Decision: improve docs metadata and add docs structured data before adding optional surfaces such as an RSS feed.
Rationale: `/docs/**` is already an indexable route family with real content and stronger ranking leverage than a brand-new feed endpoint. Feed generation is optional follow-up work after the existing public surfaces are tightened.
Date: 2026-04-06

Decision: optimize visible copy and internal links before adding low-signal metadata fields such as keyword arrays.
Rationale: titles, descriptions, canonical tags, schema, headings, and internal links materially affect both discoverability and click-through. Keyword stuffing in metadata would add noise without improving the user-visible contract.
Date: 2026-04-06

Decision: keep blueprint-first system positioning as the primary visible framing, and use `AI app starter` and `build SaaS with AI` only as supporting SEO language.
Rationale: `apps/web/AGENTS.md` and the live homepage content already encode a blueprint-first product contract. SEO work should support discoverability without contradicting the stronger product-positioning boundary already present in the repo.
Date: 2026-04-06

Decision: make `/docs` a `CollectionPage`, and make public docs articles `TechArticle` plus `BreadcrumbList`, limited to fields the repo can truthfully source today.
Rationale: the docs corpus is technical setup and implementation guidance, but the current MDX frontmatter does not provide author or date fields. The schema should match the real content without inventing unsupported metadata.
Date: 2026-04-06

Decision: rename the `/docs` landing page itself to `Ship by Sunday Docs` across frontmatter, visible H1, sidebar label, and metadata, while keeping `Start here` language in body copy.
Rationale: the docs shell already brands the route as `Ship by Sunday Docs`, and a metadata-only rename would leave the visible page and sidebar out of sync with the route’s search and sharing identity.
Date: 2026-04-06

Decision: add `WebPage` to the homepage JSON-LD graph, but do not add `WebSite` or `SearchAction` in this pass.
Rationale: `WebPage` makes the current landing-page contract more explicit without widening the schema strategy into unsupported site-search or broader site-level schema work.
Date: 2026-04-06

Decision: require a narrow but explicit contextual cross-surface link mesh across the public pages.
Rationale: the homepage, docs, and blog should behave like one acquisition and education system rather than three isolated surfaces. A small required link graph is easier to verify and less likely to sprawl than a vague “improve internal linking” instruction.
Date: 2026-04-06

## Outcomes & Retrospective

No implementation has landed yet. When this plan is complete, the desired outcome is a narrow, durable SEO contract for the public route surface: `/` owns commercial intent, `/docs/**` owns technical and setup intent, `/blog/**` owns editorial support, and the crawl/noindex boundaries remain explicit and test-backed.

The retrospective section must be updated during implementation. At completion it should record which metadata and content changes materially improved the public contract, which search-intent assumptions held up once the content was rewritten, and whether any follow-up work such as RSS, more editorial pages, or Search Console cleanup remains worthwhile.

## Context and Orientation

The public SEO work lives entirely inside `apps/web`. The root metadata boundary is `apps/web/app/layout.tsx`, which sets `metadataBase`, default title/template behavior, default description, canonical `/`, root Open Graph values, root Twitter values, verification tags, and icon/manifest config. The canonical host comes from `apps/web/platform/next/metadata-base.ts`, which resolves the base URL from `apps/web/platform/next/app-url.ts`. Any page-level metadata helper should keep using that existing base-URL logic rather than inventing its own origin handling.

The homepage route is `apps/web/app/page.tsx`. The visible copy and section structure live in `apps/web/features/marketing/content/home.ts`, while the current homepage schema logic lives in `apps/web/features/marketing/lib/home-page-structured-data.ts` and is rendered by `apps/web/features/marketing/components/home-page/home-page-structured-data.tsx`. The homepage currently has no dedicated metadata helper. That is the most important structural gap because the root layout is carrying homepage search positioning.

The docs route family is handled by `apps/web/app/docs/layout.tsx` and `apps/web/app/docs/[[...mdxPath]]/page.tsx`. The page metadata helper is `apps/web/features/docs/lib/docs-metadata.ts`, and the docs content lives in `apps/web/content/docs/`. Route paths and source-file resolution come from `apps/web/features/docs/server/page-paths.ts`. The docs shell uses Nextra, so the per-page `metadata` object comes from MDX frontmatter via `importPage(...)`. Any docs structured-data work must be compatible with that Nextra-driven flow and should not bypass the existing MDX metadata source of truth.

The blog route family is handled by `apps/web/app/blog/layout.tsx` and `apps/web/app/blog/[[...slug]]/page.tsx`. The metadata helper is `apps/web/features/blog/lib/blog-metadata.ts`, structured data lives in `apps/web/features/blog/lib/blog-structured-data.ts`, and published content is loaded from `apps/web/content/blog/` through `apps/web/features/blog/server/blog-posts.ts`. There is currently only one published blog post, which means the blog’s SEO ceiling is content-limited even though its technical metadata baseline is already solid.

The crawl endpoints are generated by `apps/web/app/robots.ts`, `apps/web/app/sitemap.ts`, `apps/web/app/opengraph-image.tsx`, and `apps/web/app/twitter-image.tsx`. `robots.ts` currently allows `/`, `/docs`, and `/blog` while disallowing auth, checkout, workspace, and API surfaces. `sitemap.ts` enumerates the homepage, blog index, published blog posts, and docs pages. These routes are part of the acceptance boundary and must continue to expose only the intended public pages after any content or metadata refactor.

The relevant regression coverage already exists. `apps/web/tests/browser-smoke/app-smoke.spec.ts` checks homepage JSON-LD, robots and sitemap coverage, blog canonical tags and article metadata, docs canonical tags, and noindex behavior for auth/recovery routes. `apps/web/tests/unit/home-page-structured-data.test.ts`, `apps/web/tests/unit/docs-metadata.test.ts`, `apps/web/tests/unit/blog-metadata.test.ts`, and `apps/web/tests/unit/blog-structured-data.test.ts` cover the helper boundaries directly. New SEO work should extend these tests instead of creating parallel assertions elsewhere.

The planned file additions should stay feature-local and minimal. The likely shape is:

    apps/web/features/marketing/lib/home-page-metadata.ts
    apps/web/features/docs/lib/docs-structured-data.ts
    apps/web/features/docs/components/docs-structured-data.tsx

If implementation proves a different file split is cleaner, keep it inside the relevant feature folders and avoid introducing a top-level mixed-purpose `seo/` bucket.

## Plan of Work

Start with the homepage, because it is the commercial route that should rank for “AI app starter” and “build SaaS with AI”. Add a dedicated metadata helper under `apps/web/features/marketing/lib/` and have `apps/web/app/page.tsx` use it so the homepage title, description, canonical, Open Graph, and Twitter values become route-owned instead of inherited from the root layout. Keep the homepage visible framing blueprint-first while using the target queries as supporting language in metadata and selected body copy. While making that change, tighten the homepage JSON-LD in `apps/web/features/marketing/lib/home-page-structured-data.ts` so it emits `WebPage` alongside the existing `Organization`, conditional `Product`, and conditional `FAQPage` graph. Do not add `WebSite` or `SearchAction` in this pass.

Next, harden the docs route family. Keep `apps/web/features/docs/lib/docs-metadata.ts` as the metadata boundary, but rename the `/docs` landing page itself to `Ship by Sunday Docs` across frontmatter, visible H1, sidebar label, and metadata. Preserve `Start here` as onboarding body copy rather than the page title. Add a docs structured-data helper plus a small render boundary so `/docs` emits `CollectionPage` and public docs articles emit `TechArticle` plus `BreadcrumbList`, using only fields the repo can source truthfully today from route context and MDX frontmatter. Do not invent author or date fields unless the plan is later widened to add that content contract.

Then do the content and internal-linking pass. The route-level metadata work only matters if the visible copy and links support the same search story. Audit `apps/web/features/marketing/content/home.ts`, `apps/web/content/docs/index.mdx`, `apps/web/content/docs/how-the-starter-works.mdx`, `apps/web/content/docs/build-your-product.mdx`, `apps/web/content/docs/set-up-the-marketing-site.mdx`, `apps/web/content/docs/set-up-db-auth-and-payments.mdx`, and the existing blog content to make sure the pages naturally describe Ship by Sunday as a blueprint-first system that helps people build SaaS with AI. Do not stuff exact phrases everywhere. Prefer clear, plain-English copy and a narrow contextual link mesh that includes at least one `home -> docs` link, one `home -> blog` link, one docs-to-home or docs-to-pricing link, and one blog-article-to-docs link. These links should live in body or section content, not only in nav chrome.

After the public copy and metadata are aligned, extend the regression coverage. Add or update helper tests for the new homepage metadata builder and any docs structured-data helpers. Expand browser-smoke assertions so a signed-out request to `/?marketing=1` proves the commercial metadata, the docs route proves the new schema and improved title contract, and the existing crawl/noindex coverage stays intact. Keep the test surface narrow while iterating, then rerun the required root commands before considering the slice complete.

Finish with post-deploy verification. After the code lands, validate the live site’s homepage, docs landing page, one representative docs article, blog index, blog article, `robots.txt`, and `sitemap.xml` from the deployed origin. If Google Search Console or another crawl-inspection tool is available, use it to confirm canonical selection and sitemap ingestion. Record any real-world crawl surprises back into this plan before calling the work done.

## Milestones

Milestone 1 gives the homepage its own commercial SEO contract. At the end of this milestone, `/` owns its title, description, canonical, Open Graph, Twitter, and JSON-LD through feature-local helpers rather than inheriting the root defaults. The visible copy and metadata should keep the homepage blueprint-first while still supporting the target search language, and the homepage schema should include `WebPage` plus the existing `Organization`, conditional `Product`, and conditional `FAQPage` nodes. Success is visible when a signed-out request to `/?marketing=1` renders the updated metadata and schema, and the homepage-specific tests pass without changing the protected-route behavior.

Milestone 2 hardens the docs route family. At the end of this milestone, `/docs` is named `Ship by Sunday Docs` across frontmatter, visible title, sidebar label, and metadata; docs articles keep canonical and social metadata derived from MDX frontmatter; `/docs` emits `CollectionPage`; and representative docs pages such as `/docs/local-setup` emit `TechArticle` plus `BreadcrumbList` using only truth-backed fields. Success is visible when `/docs` and `/docs/local-setup` show the new metadata/schema contract and the docs helper tests pass.

Milestone 3 aligns public copy and internal linking to the target queries. At the end of this milestone, the homepage copy, selected docs pages, and the existing blog article naturally support the target search themes without sounding spammy, and the required contextual cross-surface links are present: at least one `home -> docs` link, one `home -> blog` link, one docs-to-home or docs-to-pricing link, and one blog-article-to-docs link. Success is visible when a human can read the homepage, the docs landing page, and one representative docs page and understand the relationship between the blueprint-first product story, “build SaaS with AI”, the docs, and the blog.

Milestone 4 locks the work behind regression coverage and full validation. At the end of this milestone, the updated metadata and schema helpers have focused unit coverage, browser-smoke proves the public SEO contract, `robots.txt` and `sitemap.xml` still expose only the intended public routes, auth/workspace/checkout pages remain non-indexable, and the required root verification commands pass. Success is visible in both local test output and a live post-deploy crawl check.

## Concrete Steps

Start from the repository root and use the narrowest relevant tests first while changing helper code:

    $ cd /Users/parkerrex/Developer/ship-by-sunday
    $ bun run --cwd apps/web test:unit -- tests/unit/home-page-structured-data.test.ts tests/unit/docs-metadata.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts

The expected observation is that the existing metadata and structured-data helpers are green before any edits begin. Once the homepage metadata helper and docs structured-data helper exist, extend this command to include their new unit tests and keep rerunning it after each helper change.

When the homepage metadata helper is in place, start the web app locally and inspect the public marketing render instead of the entitled-user redirect path:

    $ bun run dev:web

In a second shell, inspect the homepage HTML:

    $ curl -s 'http://localhost:3000/?marketing=1' | rg 'rel="canonical"|property="og:|name="twitter:|application/ld\\+json'

The expected observation is that the homepage HTML contains the route-owned canonical tag, Open Graph and Twitter tags, and one JSON-LD block whose graph matches the visible homepage sections.

After the docs metadata and structured-data changes land, inspect the docs landing page and one representative docs article:

    $ curl -s 'http://localhost:3000/docs' | rg 'rel="canonical"|property="og:|name="twitter:|application/ld\\+json'
    $ curl -s 'http://localhost:3000/docs/local-setup' | rg 'rel="canonical"|property="og:|name="twitter:|application/ld\\+json'

The expected observation is that `/docs` reads like a docs home in its metadata, `/docs/local-setup` keeps its MDX-driven title and description, and both pages emit the new docs structured-data block.

Inspect the rendered schema types explicitly once the homepage and docs helpers land:

    $ curl -s 'http://localhost:3000/?marketing=1' | rg 'WebPage|Product|FAQPage|Organization'
    $ curl -s 'http://localhost:3000/docs' | rg 'CollectionPage'
    $ curl -s 'http://localhost:3000/docs/local-setup' | rg 'TechArticle|BreadcrumbList'

The expected observation is that the homepage includes `WebPage` plus its existing graph nodes, `/docs` includes `CollectionPage`, and a representative docs article includes `TechArticle` and `BreadcrumbList`.

Inspect the edited pages for the required contextual links rather than relying on nav chrome:

    $ curl -s 'http://localhost:3000/?marketing=1' | rg '/docs|/blog'
    $ curl -s 'http://localhost:3000/docs' | rg '/|/#pricing'
    $ curl -s 'http://localhost:3000/blog/the-operating-system-beats-the-prompt' | rg '/docs'

The expected observation is that the page bodies or section content now contain the required cross-surface contextual links, not only existing top-nav links.

Once the copy and link pass is complete, rerun the public browser smoke pack:

    $ bun run test:browser-smoke

The expected observation is that homepage schema, crawl endpoints, canonical tags, blog article metadata, docs metadata, and auth/recovery noindex behavior all remain green.

Before declaring the work complete, run the required root verification commands from the repository root:

    $ bun run format
    $ bun run lint
    $ bun run typecheck
    $ bun run qa:validate
    $ bun run test:browser-smoke

The expected observation is that all five commands exit successfully. `bun run typecheck` uses the app’s serialized build path in this repo, so a passing result is also proof that the metadata routes and page code still compile.

After deployment, inspect the live crawl endpoints directly from the deployed origin:

    $ curl -s 'https://<deployed-host>/robots.txt'
    $ curl -s 'https://<deployed-host>/sitemap.xml'

The expected observation is that `robots.txt` still advertises `Sitemap:` and only allows the intended public surfaces, while `sitemap.xml` still lists the homepage, docs pages, blog index, and published blog posts.

## Validation and Acceptance

This work is complete when a reviewer can verify all of the following without reading implementation details. A signed-out request to `/?marketing=1` must render homepage metadata and visible copy that truthfully position Ship by Sunday for the named search intents without violating the stronger blueprint-first product contract. The homepage title, description, canonical tag, Open Graph tags, Twitter tags, and JSON-LD must all agree with the visible page and must not rely solely on the root layout defaults. The homepage JSON-LD must include `WebPage` plus the existing `Organization`, conditional `Product`, and conditional `FAQPage` contract.

The docs route family must remain indexable and truthful. `/docs` should be named `Ship by Sunday Docs` across the visible page and metadata, while using `Start here` language only in body copy. Docs articles such as `/docs/local-setup` must keep their MDX-driven titles and descriptions while also emitting page-level schema that matches the docs content. `/docs` must emit `CollectionPage`, and representative docs articles must emit `TechArticle` plus `BreadcrumbList`, using only truth-backed fields from route context and current frontmatter. The docs changes must not break Nextra page loading or the current frontmatter-driven metadata path.

The blog route family must preserve its current strengths. `/blog` and the published article route must keep canonical tags, article-aware social metadata, and blog JSON-LD. The implementation can refine wording or internal linking, but it must not break the existing blog metadata and structured-data contract.

The cross-surface internal-link pass is only complete when the public pages contain the required contextual links: at least one `home -> docs` link, one `home -> blog` link, one docs-to-home or docs-to-pricing link, and one blog-article-to-docs link. These links must exist in body or section content and cannot be satisfied only by nav chrome.

The crawl surface must remain intentionally narrow. `robots.txt` and `sitemap.xml` must still expose only the homepage, docs pages, and blog pages. Auth, checkout, recovery, and workspace routes must remain non-indexable. Browser smoke must continue proving this behavior.

The required repo validation commands must pass from the repository root: `bun run format`, `bun run lint`, `bun run typecheck`, `bun run qa:validate`, and `bun run test:browser-smoke`. Focused unit tests for the affected metadata and schema helpers must also pass during implementation before widening to the full gates.

If a live deploy is available, acceptance also includes one post-deploy crawl verification pass against the deployed host. The homepage, docs landing page, one representative docs article, blog index, blog article, `robots.txt`, and `sitemap.xml` must all render the expected metadata and crawl contract from the production origin.

## Idempotence and Recovery

These changes are safe to rerun because they are route metadata, structured-data, copy, and test updates. There are no database migrations, provider mutations, or destructive operations in scope. If a metadata helper change fails, revert or adjust the helper in the relevant feature folder and rerun the focused unit tests before touching broader page code.

If the homepage SEO changes accidentally affect other routes, move the route-specific metadata back out of `apps/web/app/layout.tsx` and into the homepage boundary rather than trying to patch around the inheritance problem. The root layout should remain the place for shared defaults such as `metadataBase`, icons, and verification tags, not the place where the homepage’s commercial positioning is forced onto the rest of the app.

If docs structured data causes a rendering issue, remove only the docs structured-data render boundary and keep the existing docs metadata helper intact. The MDX frontmatter path is already working and should remain the safe fallback.

If browser-smoke fails on the homepage after metadata changes, confirm that the test is still requesting `/?marketing=1` and that the local server is rendering the signed-out marketing variant. Do not debug entitled-user redirect behavior as if it were an SEO regression unless the marketing route itself is broken.

If the post-deploy crawl check reveals a mismatch between local and deployed metadata, inspect `APP_BASE_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, and `VERCEL_URL` handling through `apps/web/platform/next/app-url.ts` and `apps/web/platform/next/metadata-base.ts` before changing route helpers. The base-URL resolver is the canonical origin boundary for this repo.

## Artifacts and Notes

Current public SEO boundary, before implementation:

    /                    homepage render + JSON-LD
    /docs/**             canonical + social metadata from MDX frontmatter
    /blog/**             canonical + social metadata + JSON-LD
    /sign-in and auth    noindex
    /checkout/**         noindex
    /(workspace)/**      noindex

Current helper and route boundaries:

    apps/web/app/layout.tsx
    apps/web/app/page.tsx
    apps/web/app/docs/[[...mdxPath]]/page.tsx
    apps/web/app/blog/[[...slug]]/page.tsx
    apps/web/app/robots.ts
    apps/web/app/sitemap.ts
    apps/web/features/marketing/lib/home-page-structured-data.ts
    apps/web/features/docs/lib/docs-metadata.ts
    apps/web/features/blog/lib/blog-metadata.ts
    apps/web/features/blog/lib/blog-structured-data.ts

Required target intents for this plan:

    AI app starter
    build SaaS with AI

When implementation lands, replace these baseline notes with the smallest useful proof snippets: one homepage metadata HTML excerpt, one docs page metadata/schema HTML excerpt, and the passing browser-smoke plus root-gate output lines that prove the contract is intact.

## Interfaces and Dependencies

`apps/web/platform/next/metadata-base.ts` and `apps/web/platform/next/app-url.ts` are the canonical origin-resolution boundaries. All metadata, structured-data, robots, and sitemap helpers should continue relying on them for absolute URLs instead of constructing their own host logic.

`apps/web/app/layout.tsx` should keep shared defaults such as `metadataBase`, title templating, verification tags, icons, and manifest references. It should not remain the only place where the homepage’s commercial title and description live once route-owned homepage metadata exists.

`apps/web/features/marketing/content/home.ts` is the visible homepage copy source of truth. `apps/web/features/marketing/lib/home-page-structured-data.ts` is the current homepage schema boundary, and a new `apps/web/features/marketing/lib/home-page-metadata.ts` helper should become the homepage metadata boundary. Keep those concerns feature-local and do not push them into a top-level generic SEO module.

`apps/web/features/docs/lib/docs-metadata.ts` must remain the docs metadata merge boundary because it already adapts MDX frontmatter into Next metadata. Any new docs structured-data helper should read from the same MDX-derived page metadata rather than inventing a second docs content source of truth. The render boundary should stay inside `apps/web/features/docs/` or `apps/web/app/docs/`, not in a shared mixed-purpose folder.

`apps/web/features/blog/lib/blog-metadata.ts` and `apps/web/features/blog/lib/blog-structured-data.ts` already own the blog route’s metadata and schema contract. Changes here should be incremental and should not widen the blog surface beyond published posts loaded from `apps/web/features/blog/server/blog-posts.ts`.

The implementation depends on Next’s metadata route and page metadata APIs through the `Metadata` type, route-level `generateMetadata`, and the existing metadata route files (`robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `twitter-image.tsx`). Keep the implementation compatible with those existing Next boundaries instead of replacing them with ad hoc HTML injection.

`apps/web/tests/browser-smoke/app-smoke.spec.ts` and the SEO-related unit tests in `apps/web/tests/unit/` are the prescriptive regression interfaces for this work. Add new assertions there when the public SEO contract changes so future homepage, docs, or blog edits have to preserve the intended crawl behavior.
