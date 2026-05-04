---
summary: "ExecPlan for adding a public `/blog` surface with programmatic index pages, MDX article routes, premium editorial components, and crawlable metadata. It uses the existing Nextra-backed content pipeline while keeping the blog feature-owned and distinct from the docs shell."
read_when: "Open this when you need to add or modify the public blog routes, post model, or editorial rendering system."
plan_status: "done"
---

# Add A Public Editorial Blog Surface

This is a living execution plan for adding a public blog to the web app. It is written so a fresh coding agent can add the route, content model, editorial components, crawl surfaces, and first post without relying on prior chat context.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday currently has a public homepage on `/` and a public docs surface on `/docs`, but it has no public blog. After this work, a visitor should be able to open `/blog`, scan a small index of posts, open an article at `/blog/<slug>`, and read a premium editorial page that borrows the public structural feel of OpenAI’s editorial pages without copying OpenAI branding. The blog must fit this repo’s ecosystem: App Router, Nextra-backed MDX content, feature-owned UI code, current design tokens, current marketing navigation, and current crawl and metadata conventions. A human should be able to prove the work by loading `/blog`, opening the first post, seeing the split text-and-media layout render cleanly on desktop and mobile, and finding both URLs in the sitemap.

## Progress

- [x] 2026-03-26 16:46 EDT: Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, and `docs/prompts/execplan-writer.md` before writing this plan.
- [x] 2026-03-26 16:46 EDT: Inspected the current public content system in `apps/web/app/docs/layout.tsx`, `apps/web/app/docs/[[...mdxPath]]/page.tsx`, `apps/web/features/docs/server/page-paths.ts`, `apps/web/mdx-components.tsx`, `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`, `apps/web/config/product.ts`, and the homepage entry surfaces under `apps/web/features/marketing/`.
- [x] 2026-03-26 16:46 EDT: Confirmed from the installed Nextra codebase types that `getPageMap('/blog')` is a supported route pattern, so the blog can reuse the existing Nextra content pipeline instead of adding a second MDX compiler stack.
- [x] 2026-03-26 16:46 EDT: Chose the v1 architecture: Nextra-powered MDX discovery and static params, but a custom feature-owned editorial shell for `/blog` instead of the docs theme wrapper.
- [x] 2026-03-26 17:22 EDT: Grilled the plan against the repo and resolved the high-impact design branches: posts use `draft: true` gating, `/blog` is a programmatic React index instead of `content/blog/index.mdx`, the blog is built-in rather than toggleable, discoverability on the landing page is footer-only next to the Ship by Sunday wordmark, the only v1 docs mention lives in `apps/web/content/docs/customize-the-starter.mdx`, and each post gets one shared sponsor-style promo block near the top that defaults to the homepage hero headline and links to `/#pricing`.
- [x] 2026-03-26 18:01 EDT: Implemented the new `apps/web/features/blog/` feature folder, route files under `apps/web/app/blog/`, strict `zod` frontmatter loading in `apps/web/features/blog/server/blog-posts.ts`, and local media assets under `apps/web/public/blog/`.
- [x] 2026-03-26 18:01 EDT: Added the programmatic `/blog` index, the first post `the-operating-system-beats-the-prompt`, split hero and split section components, the shared sponsor-style promo block, and local SVG plus MP4 media. `cd apps/web && bun run build` succeeded and emitted static `/blog` plus `/blog/the-operating-system-beats-the-prompt`.
- [x] 2026-03-26 18:06 EDT: Integrated the product control-plane seam in `apps/web/config/product.ts`, exposed the footer-only Blog link next to the Ship by Sunday wordmark, extended `apps/web/app/sitemap.ts` and `apps/web/app/robots.ts`, and added the short blog mentions in `apps/web/content/docs/route-map.mdx` and `apps/web/content/docs/customize-the-starter.mdx`.
- [x] 2026-03-26 18:09 EDT: Added narrow unit coverage in `apps/web/tests/unit/blog-page-paths.test.ts` and `apps/web/tests/unit/blog-metadata.test.ts`, expanded `apps/web/tests/browser-smoke/app-smoke.spec.ts` for blog and crawl assertions, and passed `bun run lint`, `bun run format:check`, the targeted unit tests, browser smoke, and `bun run build`.
- [x] 2026-03-26 18:09 EDT: Updated this ExecPlan with actual implementation decisions, discoveries, validation evidence, and the final shipped-state summary so a fresh agent can resume from this file alone.
- [x] 2026-03-26 18:55 EDT: Added article and index JSON-LD, a sticky table-of-contents rail powered by Nextra `toc`, reading-time support in the post record, and a tighter OpenAI-style editorial title block plus mobile visual QA for `/blog/the-operating-system-beats-the-prompt`.
- [x] 2026-03-26 18:55 EDT: Re-ran `bun run lint`, `bun run format:check`, targeted unit tests including `tests/unit/blog-structured-data.test.ts`, and browser smoke against the already-running dev server with `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 bunx playwright test --project=browser-smoke tests/browser-smoke/app-smoke.spec.ts`.
- [x] 2026-03-26 18:55 EDT: Fixed the published-date timezone regression in `apps/web/features/blog/lib/blog-formatters.ts` after visual QA showed `2026-03-26` rendering as March 25 in US timezones, and added `apps/web/tests/unit/blog-formatters.test.ts`.
- [ ] Re-run a clean whole-repo `cd apps/web && bun run build` after the unrelated codebase-flow worktree changes are repaired. As of 2026-03-26 18:55 EDT, the repo build is blocked by non-blog type errors in `apps/web/features/codebase-flow/components/codebase-stage-page.tsx` and its in-flight companion files.

## Surprises & Discoveries

The repo already has the most valuable part of a blog system: a working public MDX content pipeline. `apps/web/app/docs/[[...mdxPath]]/page.tsx` loads MDX pages with `importPage(...)`, `apps/web/features/docs/server/page-paths.ts` translates route segments to source files, and `apps/web/app/sitemap.ts` already turns those generated params into crawlable URLs. The right move is to copy that shape for `blog`, not to add a parallel `@next/mdx` setup.

The current MDX component seam is docs-specific. `apps/web/mdx-components.tsx` simply returns the `nextra-theme-docs` component map, and `apps/web/app/docs/layout.tsx` wraps pages in `Layout` from `nextra-theme-docs`. That is excellent for setup docs, but it is the wrong shell for a premium editorial article. The article surface should use Nextra for content discovery only, then render with feature-owned blog components.

The crawl surface is narrower than it first appears. `apps/web/app/robots.ts` currently allows only `/` and `/docs`, and `apps/web/app/sitemap.ts` only emits `/` plus docs entries. The blog is not done when the route renders locally. It is only done when it is part of the public crawl contract.

The homepage top bar is the cleanest existing public navigation seam. `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx` already decides whether to show Docs and Sign in. That is the smallest credible place to add a Blog entry so the new surface is not orphaned.

The existing design context is compatible with the requested direction. `.impeccable.md` says the brand should feel curious, bold, serious, premium, and operational. That aligns with an OpenAI-inspired editorial layout, but it does not support a literal OpenAI clone. The implementation should keep Ship by Sunday’s typography, token system, and high-contrast discipline while borrowing the structural pattern of restrained split text-media storytelling.

The first draft of this plan over-reached in two places that the grill corrected. It assumed `content/blog/index.mdx` even though the better v1 contract is a programmatic index generated from post metadata, and it assumed the blog might become a module flag even though the product decision is now “built-in surface, not toggleable.” Those choices are now explicit below so implementation does not drift back toward them.

The custom MDX seam ended up being simpler than expected. The first post compiles cleanly by importing feature-local React components directly inside the MDX file, so the blog does not currently need its own global `mdx-components.tsx` variant. The route shell can stay custom while Nextra still handles source discovery and compilation.

Nextra emits a non-blocking warning for a brand-new, uncommitted post when it tries to look up Git-backed last-modified data. During the first build, it warned that it failed to get the timestamp for `apps/web/content/blog/the-operating-system-beats-the-prompt.mdx`, but the production build still completed and generated the blog routes correctly.

The footer integration did not require a shared public-footer extraction. `apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx` was already the right seam, so the blog link could be added there without widening scope into a new footer abstraction.

The blog now has enough metadata and structure to support richer search ingestion. Adding JSON-LD was straightforward, but the more interesting discovery was that the most valuable SEO change was not another metadata field. It was letting the article surface expose a real table of contents and a cleaner editorial heading hierarchy so the public HTML communicates page structure more clearly.

Validation on this pass had to route around unrelated dirty-worktree failures. The blog-specific browser smoke suite passed when pointed at the already-running dev server with `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000`, but a fresh local server bootstrap through the Playwright `webServer` hook failed because codebase-flow files outside the blog work were mid-refactor. The blog implementation itself was not the blocking factor.

Evidence snippets from repo inspection:

    apps/web/node_modules/nextra/dist/server/page-map/get.d.ts includes an example for `getPageMap('/blog')`.
    apps/web/app/robots.ts currently allows only `/` and `/docs`.
    apps/web/app/docs/layout.tsx wraps public MDX pages in `Layout` from `nextra-theme-docs`.
    apps/web/mdx-components.tsx currently returns the docs theme component map and nothing blog-specific.

## Decision Log

Decision: Reuse Nextra for blog content discovery, static params, and page-map generation instead of adding a second MDX stack.
Rationale: The repo already depends on Nextra, already serves public MDX from `apps/web/content/docs/`, and already uses `importPage`, `generateStaticParamsFor`, and `getPageMap`. Reusing that path keeps the diff smaller and reduces conceptual drift.
Date: 2026-03-26

Decision: Do not render the blog inside `nextra-theme-docs`.
Rationale: The docs theme solves a different problem: navigable technical documentation with sidebar chrome and docs-specific wrappers. The requested blog needs an editorial shell with premium composition, image and video art direction, and alternating split sections. The blog should use feature-owned components under `apps/web/features/blog/`.
Date: 2026-03-26

Decision: Ship a public `/blog` index and `/blog/<slug>` article route in v1.
Rationale: “Add a blog” is not satisfied by only a single article page or only a hidden route. A credible v1 needs an index that lets humans and crawlers discover posts, plus at least one finished article template proving the editorial system.
Date: 2026-03-26

Decision: Keep the blog built-in and always available in this product instead of adding a module flag.
Rationale: The grill closed this branch explicitly. The blog is part of the public surface for Ship by Sunday itself. We do not need the extra settings, disabled-state, and workspace-home complexity of another starter module flag.
Date: 2026-03-26

Decision: Use `apps/web/content/blog/` for MDX source files and `apps/web/features/blog/` for UI, metadata, and page-map helpers.
Rationale: This matches the repo’s current split between source content and feature-owned runtime code. It also follows the repo rule to organize code by feature instead of by broad top-level buckets.
Date: 2026-03-26

Decision: v1 will support images and native HTML video with posters, but not a CMS, search, tags, comments, or third-party embeds.
Rationale: The user asked for a plan to add a blog that feels like OpenAI’s public editorial pages. The fastest credible path is typed frontmatter plus MDX components. CMS, taxonomy, search, and embeds would meaningfully widen scope before the core editorial system exists.
Date: 2026-03-26

Decision: The first article should be real enough to ship, but the implementation may start from one provisional founder post if final copy is not ready.
Rationale: The system needs one complete post to prove authoring, layout, metadata, media handling, and crawl integration. Waiting for a complete editorial calendar would stall the technical rollout.
Date: 2026-03-26

Decision: Posts must support `draft: true` frontmatter, and drafts must be excluded from the blog index, static params, sitemap, and direct route access.
Rationale: The repo does not already have a public publish-state contract for MDX content. `draft: true` is the smallest safe rule that prevents accidental publication during iteration.
Date: 2026-03-26

Decision: `/blog` is a programmatic React index built from published post metadata, not an `index.mdx` page.
Rationale: The grill showed that `content/blog/index.mdx` would create ambiguity between a manually authored landing page and a real post index. A programmatic index is the cleanest v1 contract and keeps the source of truth in post frontmatter.
Date: 2026-03-26

Decision: The landing page should expose the blog only in the homepage footer next to the Ship by Sunday wordmark, not in the homepage top bar and not in the docs navbar.
Rationale: The stated product goal is to avoid stealing attention from conversion on the landing page. Footer discoverability plus search and direct links is enough for v1.
Date: 2026-03-26

Decision: The only purchaser-facing docs mention in v1 lives in `apps/web/content/docs/customize-the-starter.mdx`.
Rationale: The user does want the docs to signal that the starter includes a blog surface, but not enough to justify a new docs page or broader docs-nav rollout.
Date: 2026-03-26

Decision: Every article gets one shared sponsor-style promo block near the beginning of the article. The `/blog` index gets no promo block.
Rationale: The promo treatment should feel like a tasteful native sponsorship unit inside each article, not a second landing page pasted onto the blog index.
Date: 2026-03-26

Decision: The sponsor-style promo block uses one shared copy payload for all posts. CTA behavior lives in `config/product.ts`; promo copy lives in a blog feature content file.
Rationale: This follows the repo’s existing control-plane pattern. Behavior belongs in config, while persuasive copy belongs to the feature that renders it.
Date: 2026-03-26

Decision: The default blog promo CTA points to `/#pricing`, and the promo headline should borrow the homepage hero H1 language.
Rationale: Blog readers are colder than homepage buyers, so the default should send them to the homepage close instead of forcing checkout immediately. Borrowing the homepage H1 keeps the message consistent without inventing a second public promise.
Date: 2026-03-26

Decision: Load published-post summaries with a cached `importPage(...)` pass in `apps/web/features/blog/server/blog-posts.ts` instead of introducing a separate page-map normalization helper.
Rationale: The programmatic index needs strict frontmatter validation and `draft: true` filtering anyway. Reusing `importPage(...)` for summaries keeps the blog on the same Nextra-backed path as the route itself, avoids an unused normalization layer, and compiled successfully on the first production build.
Date: 2026-03-26

Decision: Author the first post with direct imports of `BlogSplitHero` and `BlogSplitSection` inside the MDX file instead of wiring a blog-specific global MDX component map.
Rationale: The repo’s root `mdx-components.tsx` is docs-theme-oriented. Direct component imports kept the blog shell independent from docs chrome while still letting MDX prove the editorial component seams immediately.
Date: 2026-03-26

Decision: Put the promo CTA target and footer label into `apps/web/config/product.ts` and expose them through `apps/web/features/starter/lib/starter-selectors.ts`.
Rationale: That keeps behavior in the control plane while leaving promo copy and editorial copy in the blog feature. It also let the homepage footer and article promo block share the same configuration without creating a cross-feature import tangle.
Date: 2026-03-26

Decision: Use Nextra’s built-in `toc` output for the article contents rail instead of inventing a second heading parser.
Rationale: The MDX pipeline already emits normalized heading ids and values. Reusing that output keeps the table of contents consistent with the rendered article anchors and avoids a fragile post-processing step.
Date: 2026-03-26

Decision: Add JSON-LD for both the `/blog` index and each article route.
Rationale: Canonical tags and Open Graph were already in place, but structured data closes the main SEO gap the user called out. The index now declares a `Blog` graph, and each article declares `BlogPosting` plus breadcrumbs.
Date: 2026-03-26

## Outcomes & Retrospective

At plan creation time, no implementation has happened yet. The expected outcome is a new public blog surface that fits the current marketing and docs ecosystem instead of sitting beside it as a one-off microsite. The biggest likely follow-up after v1 is authoring and editorial workflow: if the team wants non-engineers to publish frequently, a CMS or editorial tooling layer may become the next project. The plan deliberately leaves that out so the first milestone can prove the route, layout, and content model with minimal new infrastructure.

Current outcome after the first implementation loop: Milestone 1 is complete and most of Milestone 2 is in place. The app now statically builds `/blog` and `/blog/the-operating-system-beats-the-prompt` from Nextra-managed content under `apps/web/content/blog/`, and the article renders through feature-owned components under `apps/web/features/blog/` instead of the docs theme wrapper.

Final outcome: all four milestones are complete. The public surface now includes a real `/blog` index, a premium first article at `/blog/the-operating-system-beats-the-prompt`, footer-only discoverability on the homepage, blog entries in `robots.txt` and `sitemap.xml`, short docs mentions, narrow unit coverage, browser smoke coverage, and a passing production build. The main remaining follow-up is still editorial tooling: if publishing frequency increases, the next project should be a CMS or author workflow layer rather than more route work.

Follow-up after the SEO pass: the blog now also emits JSON-LD, exposes a real table of contents rail, and uses a stronger editorial header that is materially closer to the OpenAI-style reference the user asked for. The only remaining execution gap is repository hygiene outside the blog feature: a clean whole-repo `bun run build` is currently blocked by unrelated codebase-flow refactor changes already present in the worktree.

When the work is complete, update this section with the actual shipped surface, the validation evidence, the final route list, and any residual gaps such as missing taxonomy or planned CMS migration.

## Context and Orientation

The relevant public surfaces today are `apps/web/app/page.tsx` for the homepage and `apps/web/app/docs/layout.tsx` plus `apps/web/app/docs/[[...mdxPath]]/page.tsx` for public docs. The docs route is already using Nextra’s content system. `apps/web/features/docs/server/page-paths.ts` shows the exact helper pattern to mirror for the blog: define a root segment, translate route params into source-file paths, and generate static params for the route. `apps/web/features/docs/lib/docs-metadata.ts` shows the current metadata pattern: set canonical URLs, merge page-level metadata, and emit article-flavored Open Graph and Twitter metadata.

The public control plane lives in `apps/web/config/product.ts`. This file defines `routeConfig`, `starterConfig`, pricing targets, and public labels. Public marketing selectors live in `apps/web/features/starter/lib/starter-selectors.ts`. The homepage footer currently lives in `apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx`, and that is the only landing-page navigation seam this plan should touch for blog discoverability. Do not add the blog to `home-hero-top-bar.tsx` unless the plan is revised first.

The public crawl surfaces live in `apps/web/app/sitemap.ts` and `apps/web/app/robots.ts`. Today they only know about `/` and `/docs`. The blog must extend both files so that `/blog` and every published post become indexable. Browser smoke coverage for public routes currently lives in `apps/web/tests/browser-smoke/app-smoke.spec.ts`. Docs metadata tests live in `apps/web/tests/unit/docs-metadata.test.ts`. The blog should get parallel coverage instead of relying on manual checks only.

The design context matters because “OpenAI-like” in this repo is a structural reference, not a brand-copy request. `.impeccable.md` says the interface should feel premium, serious, bold, and operational. `apps/web/app/layout.tsx` and `apps/web/app/globals.css` already define the global font and token system. The blog should stay inside that design language. That means using the existing display typography and global tokens, then introducing editorial rhythm, split layouts, media framing, and restrained motion inside feature-owned blog components rather than bolting on an alien theme.

A “page map” in this plan means Nextra’s generated tree of content files for a route prefix such as `/docs` or `/blog`. “Frontmatter” means the metadata at the top of an MDX file, such as title, description, publish date, author name, and summary. In this plan, frontmatter also includes `draft: true` for unpublished posts. An “editorial shell” means the page frame around a blog article: the header, metadata row, sponsor-style promo block, prose width, media blocks, next-post links, and mobile stacking behavior.

Current relevant tree:

    apps/web/app/
      page.tsx
      docs/layout.tsx
      docs/[[...mdxPath]]/page.tsx
      sitemap.ts
      robots.ts
    apps/web/content/
      docs/
    apps/web/features/
      docs/
      marketing/

Target tree after implementation:

    apps/web/app/
      blog/layout.tsx
      blog/[[...slug]]/page.tsx
    apps/web/content/
      blog/
        _meta.ts
        <first-post>.mdx
    apps/web/features/
      blog/
        content/
        components/
        lib/
        server/

## Plan of Work

Start by building the blog as a sibling public route to the docs surface, not as an extension of the docs theme. The first implementation slice should copy the docs page-path helper pattern into a blog-specific helper so `app/blog/[[...slug]]/page.tsx` can statically generate pages from `apps/web/content/blog/`. This should include a blog-specific metadata builder instead of reusing the docs helper verbatim, because the blog needs different defaults for the programmatic index page, article pages, and article structured data.

Once route plumbing is in place, create the feature-owned blog UI. The feature folder should own a programmatic index shell, post shell, editorial prose wrapper, media frame, split hero, split section, sponsor-style promo block, and any small author/date or caption components needed to keep files short and responsibilities clear. Do not put these in a top-level `components/editorial/` bucket. Keep them under `apps/web/features/blog/` so the blog remains a self-contained feature. The blog layout should feel OpenAI-inspired in structure: a premium hero, alternating text-media sections, strong whitespace, restrained motion, and native video support with posters. It should still feel like Ship by Sunday through typography, color tokens, and seriousness.

Then wire authoring. Add at least one post in `apps/web/content/blog/`. The post should prove the component set by using a split hero and at least two split sections, including one image and one video or poster-backed video placeholder. Validate frontmatter with `zod` or equivalent assertion helpers close to the loading boundary so invalid content fails early, and exclude `draft: true` posts from the index, static params, sitemap, and direct route access. Put the index intro copy and the shared sponsor-style promo copy in `apps/web/features/blog/content/` rather than in MDX route files.

After the content works, integrate the blog into the public ecosystem. Add `routeConfig.blog` in `apps/web/config/product.ts`. Add a small blog control-plane entry for the footer link label and the blog promo CTA target. Update the homepage footer in `apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx` so the route is discoverable next to the Ship by Sunday wordmark, and do not add the blog to the homepage top bar. Extend `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`, `apps/web/content/docs/route-map.mdx`, and `apps/web/content/docs/customize-the-starter.mdx`. If implementation reveals that the footer needs a shared public-footer extraction, update this plan before widening scope.

Finish with validation and hardening. Add unit tests for blog page-path helpers and metadata helpers, plus request-based browser smoke tests for `/blog` and the first post. Run the narrow checks first, then `bun run build`. If the custom MDX component mapping turns out to be awkward with the current Nextra setup, stop after the plumbing milestone, record the issue in `Surprises & Discoveries`, and update this plan before introducing a second MDX pipeline.

## Milestones

### Milestone 1: Prove the repo-native `/blog` route and content plumbing

At the end of this milestone, the app has a working `app/blog/[[...slug]]/page.tsx` route, a `features/blog/server/page-paths.ts` helper, and content files under `apps/web/content/blog/`. The route can render a programmatic index and a minimal post from Nextra-managed MDX without the docs theme wrapper. The most likely files are `apps/web/app/blog/layout.tsx`, `apps/web/app/blog/[[...slug]]/page.tsx`, `apps/web/features/blog/server/page-paths.ts`, and `apps/web/content/blog/`.

Success looks like `GET /blog` returning 200, `GET /blog/<slug>` returning 200 for the first post, and `bun run build` succeeding without introducing a second MDX compiler dependency. Run the build from `apps/web/` and verify that route generation includes the blog paths. If this milestone fails because the current Nextra setup cannot cleanly support the custom route, stop here and update this plan with the exact blocker.

### Milestone 2: Build the feature-owned editorial shell and first post

At the end of this milestone, the blog has a real visual system instead of a placeholder shell. `apps/web/features/blog/components/` should contain the small, feature-owned pieces that make up the index and post experiences. The first post should use at least one split hero and two split sections so the article proves the requested OpenAI-inspired composition while staying inside the Ship by Sunday visual system. The post shell should also include the shared sponsor-style promo block near the top of the article, before the main prose gets underway.

The most likely files are `apps/web/features/blog/content/blog.ts`, `apps/web/features/blog/components/blog-index-page.tsx`, `apps/web/features/blog/components/blog-post-page.tsx`, `apps/web/features/blog/components/blog-post-shell.tsx`, `apps/web/features/blog/components/blog-post-promo.tsx`, `apps/web/features/blog/components/blog-media-frame.tsx`, `apps/web/features/blog/components/blog-split-hero.tsx`, `apps/web/features/blog/components/blog-split-section.tsx`, `apps/web/features/blog/lib/blog-metadata.ts`, and the first post MDX file under `apps/web/content/blog/`.

Success looks like `/blog` listing the first post and `/blog/<slug>` rendering a premium editorial article with image and video-safe framing, mobile stacking below the desktop split, and clean spacing in both light and dark mode. Run `bun run build` and manual browser QA on desktop and a narrow mobile viewport before continuing.

### Milestone 3: Integrate blog into navigation, metadata, and crawl surfaces

At the end of this milestone, the blog is a first-class public route in the product control plane. `apps/web/config/product.ts` should know about `routeConfig.blog` and the default blog promo CTA target. The homepage footer should link to the blog. `apps/web/app/sitemap.ts` and `apps/web/app/robots.ts` should include the blog surface. The route docs should mention `/blog`, and the starter-customization docs should mention that the starter includes a blog surface.

The most likely files are `apps/web/config/product.ts`, `apps/web/features/marketing/components/home-page/pricing-footer-sections.tsx`, `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`, `apps/web/content/docs/route-map.mdx`, and `apps/web/content/docs/customize-the-starter.mdx`.

Success looks like the homepage footer exposing a visible Blog link next to the Ship by Sunday wordmark, the sitemap containing `/blog` and the first post, `Customize the Starter` mentioning the built-in blog surface, and browser-smoke request tests confirming canonical tags and `og:type` output for the post page. This milestone is not complete until the route is discoverable by both humans and crawlers.

### Milestone 4: Add automated coverage and final hardening

At the end of this milestone, the blog system has the same basic verification discipline as the rest of the repo. There should be targeted unit tests for blog metadata and page-path helpers, and request-based browser smoke tests for the index and first post. The final build should pass without widening scope into CMS or taxonomy work.

The most likely files are `apps/web/tests/unit/blog-metadata.test.ts`, `apps/web/tests/unit/blog-page-paths.test.ts`, and `apps/web/tests/browser-smoke/app-smoke.spec.ts`. If the editorial UI ends up with a few critical pure helpers, add unit tests for those helpers rather than trying to exhaustively snapshot the visual surface.

Success looks like the narrow tests passing, browser smoke proving the public HTML contains the expected title, canonical path, and article Open Graph type, and `bun run build` succeeding. Record any visual tradeoffs, unresolved editorial questions, or deferred CMS work in this plan before closing the milestone.

## Concrete Steps

Start by mirroring the current docs route pattern so the blog gets the same content-discovery and static-generation behavior:

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,220p' apps/web/app/docs/[[...mdxPath]]/page.tsx
    sed -n '1,220p' apps/web/features/docs/server/page-paths.ts
    sed -n '1,220p' apps/web/features/docs/lib/docs-metadata.ts
    sed -n '1,220p' apps/web/app/sitemap.ts
    sed -n '1,220p' apps/web/app/robots.ts

Create the new blog route and feature helpers in parallel. The first working pass only needs enough styling to prove the route and content flow.

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    mkdir -p app/blog/[[...slug]]
    mkdir -p content/blog
    mkdir -p features/blog/content
    mkdir -p features/blog/components
    mkdir -p features/blog/lib
    mkdir -p features/blog/server

Add the new control-plane seam before wiring public navigation:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    sed -n '1,220p' config/product.ts
    sed -n '1,240p' features/marketing/components/home-page/pricing-footer-sections.tsx
    sed -n '1,220p' content/docs/customize-the-starter.mdx

The first implementation pass should produce these repository-relative files:

    app/blog/layout.tsx
    app/blog/[[...slug]]/page.tsx
    content/blog/_meta.ts
    content/blog/<first-post>.mdx
    features/blog/content/blog.ts
    features/blog/server/page-paths.ts
    features/blog/server/blog-posts.ts
    features/blog/lib/blog-metadata.ts
    features/blog/lib/blog-formatters.ts
    features/blog/components/blog-index-page.tsx
    features/blog/components/blog-post-page.tsx
    features/blog/components/blog-post-shell.tsx
    features/blog/components/blog-post-promo.tsx
    features/blog/components/blog-media-frame.tsx
    features/blog/components/blog-split-hero.tsx
    features/blog/components/blog-split-section.tsx

Use this frontmatter shape for posts and keep it strict:

    title: string
    description: string
    summary: string
    publishedAt: ISO date string
    authorName: string
    authorRole: string
    featured?: boolean
    draft?: boolean
    heroMediaKind: "image" | "video"
    heroMediaSrc: string
    heroPosterSrc?: string

Use this authoring pattern in the first post so the editorial component seams are proven:

    <BlogSplitHero ... />
    <BlogSplitSection orientation="text-left" ... />
    <BlogSplitSection orientation="text-right" ... />

Add a shared blog content file for the index intro and promo block. Keep the promo copy global for v1. The recommended default is:

    promo headline: homepage H1 language ("Ship a real product by Sunday")
    promo body: condensed version of the homepage hero body
    promo CTA label: existing primary CTA label or a close equivalent
    promo CTA target: { kind: "link", href: "/#pricing" }

After route plumbing works, run the narrow validation first:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project unit tests/unit/blog-page-paths.test.ts tests/unit/blog-metadata.test.ts

Expected observation:

    ✓ blog page paths generate /blog and /blog/<slug> correctly
    ✓ blog metadata emits canonical and article social tags

Observed on 2026-03-26 18:06 EDT:

    Test Files  2 passed (2)
         Tests  5 passed (5)

Then run browser smoke once the route and crawl surface are wired:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    PLAYWRIGHT_USE_LOCAL_SERVER=1 playwright test --project=browser-smoke --grep "blog"

Expected observation:

    2 passed
    /blog returns 200 and lists the first post
    /blog/<slug> returns 200 and contains rel="canonical" plus content="article"

Observed on 2026-03-26 18:08 EDT:

    7 passed (42.1s)
    /blog returns 200 and lists the first post
    /blog/the-operating-system-beats-the-prompt returns 200 and emits article metadata
    /sitemap.xml contains /blog and /blog/the-operating-system-beats-the-prompt

Observed on 2026-03-26 18:54 EDT against the already-running local dev server:

    PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 bunx playwright test --project=browser-smoke tests/browser-smoke/app-smoke.spec.ts
    7 passed (3.5s)
    /blog emits Blog JSON-LD
    /blog/the-operating-system-beats-the-prompt emits BlogPosting JSON-LD and visible contents headings

Finish with the broader production check:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bun run build

Expected observation:

    Route generation includes /blog
    Route generation includes /blog/<first-post>
    Build completes without MDX or metadata errors

Observed on 2026-03-26 18:09 EDT:

    ● /blog/[[...slug]]
      ├ /blog
      └ /blog/the-operating-system-beats-the-prompt

Also observed on 2026-03-26 18:09 EDT:

    bun run lint
    Found 0 warnings and 0 errors.

    bun run format:check
    All matched files use the correct format.

Current limitation observed on 2026-03-26 18:55 EDT:

    bun run build
    Fails in unrelated codebase-flow code:
    ./features/codebase-flow/components/codebase-stage-page.tsx:132
    Property 'stage' does not exist on CodebaseStageProgressPanel props

## Validation and Acceptance

The blog is accepted only when a human can verify all of the following without reading code.

Opening `/blog` in a browser shows a real public index page, not a placeholder. The page lists at least one published post and links into its detail route. The page has a canonical URL of `/blog`.

Opening `/blog/<slug>` shows a real editorial article with a premium hero, one sponsor-style promo block near the beginning of the article, at least two editorial split sections, stable image or video framing, readable mobile stacking, and visible metadata such as title and publish date. The page emits canonical metadata for `/blog/<slug>`. The response HTML includes an article-style Open Graph type.

The homepage footer exposes a Blog link next to the Ship by Sunday wordmark. The homepage top bar does not add a Blog link in v1.

`/robots.txt` allows `/blog`, and `/sitemap.xml` includes `/blog` plus the published post route.

`apps/web/content/docs/customize-the-starter.mdx` contains a short mention that the starter includes a blog surface and where to customize it.

The first post renders from MDX content without requiring article-specific JSX edits in route files. Adding a second post should mean adding one MDX file plus assets, not editing the route or component structure. A post marked `draft: true` must not appear on `/blog`, in static params, in the sitemap, or at its direct route.

The implementation must pass, at minimum, the narrow unit tests for blog helpers, the targeted browser-smoke checks for `/blog` and the first post, and `bun run build` from `apps/web/`.

## Idempotence and Recovery

This plan is additive. The blog is a new public route namespace and new content directory. Re-running the steps should be safe because new files live under `app/blog/`, `content/blog/`, and `features/blog/`. If a partial implementation leaves the route compiling but not rendering, keep the files and fix forward rather than deleting and recreating them.

If the custom blog route cannot render Nextra-managed MDX cleanly, stop after Milestone 1, capture the failing behavior in `Surprises & Discoveries`, and update the plan before introducing a second MDX stack. Do not silently add `@next/mdx` or another compiler path mid-stream. The whole point of Milestone 1 is to prove that the repo-native path works.

If crawl integration breaks, temporarily roll back only the `robots.ts` and `sitemap.ts` edits while keeping the local blog route intact. That lets implementation continue without blocking on crawl semantics. Restore crawl integration before calling the feature complete.

If the first article’s media is not ready, use a temporary local image and poster-backed video placeholder inside `apps/web/public/` so route, layout, and metadata work can still proceed. Replace the provisional assets before final sign-off and record that replacement in `Progress`.

If a post should not be public yet, mark it `draft: true` and verify that the route returns not found and the post stays out of the sitemap. Do not rely on “we just will not link to it” as a publication control.

## Artifacts and Notes

The blog should follow this architecture shape, which keeps content, runtime logic, and crawl helpers separated by responsibility:

    app/blog/layout.tsx
      Owns blog-level metadata defaults and the shared public shell for the route.

    app/blog/[[...slug]]/page.tsx
      Owns static generation, draft filtering, page lookup, and index-versus-post branching.

    features/blog/server/page-paths.ts
      Owns route segments, source-path translation, and static param generation.

    features/blog/server/blog-posts.ts
      Owns strict frontmatter validation, `draft: true` filtering, published index summaries, and published post lookup.

    features/blog/lib/blog-metadata.ts
      Owns canonical URL, social metadata, and any BlogPosting structured data helpers.

    features/blog/lib/blog-formatters.ts
      Owns shared date formatting so index cards and article shells stay consistent.

    features/blog/content/blog.ts
      Owns the programmatic index intro copy and the shared sponsor-style promo copy for article pages.

    features/blog/components/*
      Owns all UI for the index and post experience.

    content/blog/*
      Owns author-written MDX and `_meta.ts`.

    public/blog/*
      Owns the provisional but shippable local SVG and MP4 assets used by the first article.

The first post should prove the exact pattern the user asked for: one side carries the editorial text, the other side carries the image or video. It is acceptable for the desktop layout to alternate between text-left and text-right blocks while mobile always stacks text first. The sponsor-style promo block should appear before the main article body, look like a tasteful native sponsorship unit, and use the homepage promise rather than a new offer line.

Do not copy OpenAI’s branding. Borrow only the structural lessons that matter here: split-layout storytelling, strong whitespace, premium media framing, minimal chrome, and restrained motion.

## Interfaces and Dependencies

The plan assumes the existing dependencies in `apps/web/package.json` remain the source of truth. No new MDX compiler dependency should be added for v1. Use the existing `nextra` codebase for `importPage`, `generateStaticParamsFor`, and `getPageMap`. Use existing `next`, `react`, `zod`, and built-in Next image support. Use native `<video>` with posters instead of adding a third-party player.

These interfaces should exist by the end of the work:

    type BlogPostMetadata = {
      title: string
      description: string
      summary: string
      publishedAt: string
      authorName: string
      authorRole: string
      featured?: boolean
      draft?: boolean
      heroMediaKind: "image" | "video"
      heroMediaSrc: string
      heroPosterSrc?: string
    }

    type BlogPromoContent = {
      title: string
      body: string
      ctaLabel: string
    }

    function getBlogPageSegments(slug?: string[]): string[]
    function getBlogPagePath(slug?: string[]): string
    function getBlogSourcePath(slug: string[]): string
    function generateBlogStaticParams(): Promise<{ slug: string[] }[]>
    function buildBlogIndexMetadata(): Metadata
    function buildBlogPostMetadata(post: BlogPostSummary): Metadata
    function getPublishedBlogPostSummaries(): Promise<BlogPostSummary[]>
    function getPublishedBlogPostBySlug(slug: string[]): Promise<BlogPostRecord | null>

The editorial component interfaces should remain narrow and explicit. Avoid config bags. A split section component should take only the props it needs: orientation, eyebrow if used, title, body content, media data, and optional caption or CTA. A media frame component should take a discriminated union for image versus video so invalid states fail early. The sponsor-style promo block should consume shared content plus a control-plane CTA target rather than per-post freeform promo fields.

Keep Server Components as the default. Only introduce a Client Component if the implementation genuinely needs browser-only behavior such as motion triggers or visibility analytics. The default v1 blog should render meaningful HTML with JavaScript disabled.
