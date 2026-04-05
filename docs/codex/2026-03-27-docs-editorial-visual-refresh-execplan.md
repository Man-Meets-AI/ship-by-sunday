---
summary: "ExecPlan for restyling the public docs surface so it matches the editorial brand system used on the blog and homepage while staying on Nextra. It focuses on neutral surfaces, stronger typography, quieter chrome, and preserving the existing docs content architecture."
read_when: "Open this when you need the scope, decisions, and validation history for the docs visual refresh work."
plan_status: "done"
---

# Refresh The Public Docs Surface To Match The Editorial Brand

This is a living execution plan for refreshing the public docs surface so it feels like the same premium product system as the blog and homepage without replacing Nextra or inventing a second docs stack. It is written so a fresh coding agent can execute the work without prior chat context.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

The public docs at `/docs` currently work, but they do not look like Ship by Sunday. The route is boxed into a warm parchment-like shell that reads as generic docs-theme styling instead of the bold, serious, editorial system already established on `/blog` and the refreshed homepage. After this work, a visitor should be able to open `/docs` and `/docs/local-setup` and immediately feel the same product: strong display typography, restrained premium surfaces, cleaner spacing, and quieter navigation chrome. The route must remain Nextra-backed, keep the docs module toggle, keep canonical metadata behavior, and preserve the existing content tree and MDX authoring path.

## Progress

- [x] 2026-03-27 11:32 EDT: Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, and `docs/prompts/execplan-writer.md` before writing this plan.
- [x] 2026-03-27 11:32 EDT: Read the required `apps/web` planning source docs in `docs/ship-by-sunday/blueprint-contract-and-question-map-2026-03-23.md`, `docs/ship-by-sunday/input-architecture-keep-kill-combine-2026-03-23.md`, `docs/ship-by-sunday/curriculum-reset-funnel-2026-03-23.md`, `docs/ship-by-sunday/repo-input-audit-2026-03-23.md`, and `docs/ship-by-sunday/openai-domain-contract-reconciliation-2026-03-23.md`.
- [x] 2026-03-27 11:32 EDT: Inspected the current docs route and shell in `apps/web/app/docs/layout.tsx`, `apps/web/app/docs/[[...mdxPath]]/page.tsx`, `apps/web/features/docs/styles/docs-theme.css`, `apps/web/features/docs/components/docs-navbar.tsx`, `apps/web/features/docs/components/docs-footer.tsx`, `apps/web/features/docs/components/docs-theme-toggle.tsx`, `apps/web/features/docs/lib/docs-metadata.ts`, and `apps/web/content/docs/index.mdx`.
- [x] 2026-03-27 11:32 EDT: Inspected the editorial reference surfaces in `apps/web/app/blog/[[...slug]]/page.tsx`, `apps/web/features/blog/components/blog-index-page.tsx`, `apps/web/features/blog/components/blog-post-shell.tsx`, `apps/web/features/blog/components/blog-rich-text.tsx`, and the global typography tokens in `apps/web/app/globals.css` plus `.impeccable.md`.
- [x] 2026-03-27 11:32 EDT: Confirmed the approved scope from chat: keep Nextra, avoid a full custom docs app, and focus on local docs theming and chrome so the route stops feeling beige and detached from the rest of the brand.
- [x] 2026-03-27 12:04 EDT: Grilled the plan against the repo and resolved the highest-impact design branches. `/docs` stays on the standard Nextra page structure, the chrome keeps its existing destinations but drops the visible badge treatment, the docs route aligns to `defaultTheme: "system"`, `h1` and `h2` get the strongest editorial typography while `h3` and below remain conventional, the docs identity becomes `Ship by Sunday Docs`, and the supporting docs description stays functional and direct while dropping the starter-template framing.
- [x] 2026-03-27 12:04 EDT: Confirmed from repo inspection that the current docs corpus includes Markdown tables and blockquotes, so the styling and acceptance scope must explicitly cover them in addition to prose, code blocks, sidebar, and TOC.
- [x] 2026-03-27 12:04 EDT: Re-ran `cd apps/web && bun run build` during the grill pass. The build succeeded. The only warnings were the existing Nextra shallow-clone last-modified warning and the existing Turbopack NFT trace warnings for blueprint download routes.
- [x] 2026-03-27 11:58 EDT: Reset the docs shell styling in `apps/web/features/docs/styles/docs-theme.css` and `apps/web/app/docs/layout.tsx` so the page background, panels, borders, and shadows now use a neutral product shell instead of the old warm-paper defaults.
- [x] 2026-03-27 11:58 EDT: Validated the shell reset with `bunx oxlint --deny-warnings` and `bunx oxfmt --check` on the changed docs files, then verified in Playwright that a clean browser session respects `prefers-color-scheme: light` and writes `docs-theme=light` when the docs route loads with the system default.
- [x] 2026-03-27 12:04 EDT: Aligned docs typography, spacing rhythm, code blocks, callouts, TOC, tables, blockquotes, and sidebar behavior to the same premium system without breaking technical readability or mobile usability.
- [x] 2026-03-27 12:04 EDT: Simplified the docs navbar, footer, and docs-index opener so the surface now reads as Ship by Sunday Docs instead of generic starter documentation.
- [x] 2026-03-27 12:04 EDT: Ran the docs-focused validation stack. `bunx vitest --config vitest.config.ts run --project unit tests/unit/docs-metadata.test.ts` passed, `PLAYWRIGHT_USE_LOCAL_SERVER=1 bunx playwright test --project=browser-smoke tests/browser-smoke/app-smoke.spec.ts --grep "docs pages emit canonical tags and auth pages emit noindex"` passed, and `bun run build` failed in unrelated Convex code.

## Surprises & Discoveries

The biggest mismatch is not the route structure. It is the local docs translation layer in `apps/web/features/docs/styles/docs-theme.css`. The shared app already has neutral, high-contrast global tokens in `apps/web/app/globals.css`, and the docs feature already consumes shared `--product-*` variables. The beige feeling comes from docs-only choices such as `--nextra-bg: 245,241,234`, warm panel gradients, heavier border shells, and a more obviously “themed docs” article container. That is good news because it means the fix can stay local to the docs feature.

The docs route is already cleanly isolated. `apps/web/app/docs/layout.tsx` owns the Nextra `Layout` wrapper, imports the docs CSS override file, and provides the custom navbar, footer, theme toggle, sidebar, and table-of-contents settings. `apps/web/app/docs/[[...mdxPath]]/page.tsx` handles content loading through `importPage(...)` and the MDX wrapper. This separation means the visual refresh does not need a route rewrite, a second MDX compiler, or a new content architecture.

The browser profile for QA already had a persisted `docs-theme=dark` cookie, so verifying the system default required clearing cookies in the Playwright session before reloading. Once the cookie was removed, the route respected `prefers-color-scheme: light` and wrote `docs-theme=light`, which confirmed that the `defaultTheme: "system"` change is behaving correctly rather than being masked by prior state.

The fresh browser session for `/docs/local-setup` at both desktop width and a 390px mobile width rendered the real article content successfully. The earlier error boundary seen in a stale tab was a session artifact rather than a page-specific regression.

The full `bun run build` failure is unrelated to the docs refresh. It stops in `./convex/course.ts:116:2` with a type mismatch for `getBonusMissionStateHandler`, where `status` is inferred as `string` instead of the expected `"completed" | "available" | "opened"`.

The blog’s visual strength comes from a few repeatable cues rather than from a special rendering stack. `apps/web/features/blog/components/blog-index-page.tsx`, `apps/web/features/blog/components/blog-post-shell.tsx`, and `apps/web/features/blog/components/blog-rich-text.tsx` show the actual ingredients: an editorial background wash, oversized condensed display typography, mono overlines with divider rules, gentler surfaces, wider breathing room, and lighter top-bar chrome. The docs refresh should borrow those cues, not attempt to make docs literally look like articles.

The current automated docs coverage is functional, not aesthetic. `apps/web/tests/unit/docs-metadata.test.ts` verifies canonical and social metadata behavior, and `apps/web/tests/browser-smoke/app-smoke.spec.ts` verifies that a representative docs page emits canonical and `og:type="article"` metadata. There is no dedicated visual docs test surface today, so manual QA on desktop, mobile, light mode, and dark mode is part of the acceptance contract for this plan.

The docs route already authors its own title and intro copy inside MDX. Representative pages like `apps/web/content/docs/local-setup.mdx` and `apps/web/content/docs/clerk-convex-auth.mdx` include a page-level `#` title and opening paragraph directly in the source file. That means the refresh does not need a custom route-level intro wrapper to strengthen individual pages. It can keep the standard Nextra page structure and rely on CSS plus light content polish.

The current docs corpus is not prose-only. `apps/web/content/docs/customize-the-starter.mdx` includes a Markdown table, and `apps/web/content/docs/prompting-patterns.mdx` includes multiple blockquote-heavy examples. The original plan under-described these surfaces. The implementation must explicitly style tables and blockquotes so the visual reset does not leave them looking like unowned defaults.

The docs route currently diverges from the rest of the product on first impression because `apps/web/app/docs/layout.tsx` sets `nextThemes.defaultTheme` to `"dark"` while the app-wide `ThemeProvider` in `apps/web/app/layout.tsx` defaults to `"system"`. The grill resolved that this divergence is not intentional product strategy and should be removed as part of the refresh.

The docs identity language was also still anchored to the old starter framing. `apps/web/config/product.ts` currently sets `starterConfig.docs.badgeLabel` to `"Starter Docs"` and `starterConfig.docs.description` to starter-specific language that flows into footer copy and metadata. The grill resolved that the route should instead present as `Ship by Sunday Docs`, with direct functional description text rather than starter-template language.

Evidence snippets from repo inspection:

    apps/web/app/docs/layout.tsx imports "nextra-theme-docs/style.css" and "@/features/docs/styles/docs-theme.css", then mounts `Layout` from `nextra-theme-docs`.

    apps/web/features/docs/styles/docs-theme.css sets `--nextra-bg: 245,241,234` in `:root`, which is the strongest direct source of the current warm paper tone.

    apps/web/features/blog/components/blog-post-shell.tsx uses a soft radial-plus-linear background wash and a much quieter top bar than the docs surface.

    apps/web/app/globals.css already exposes the shared condensed display utility `.font-marketing-display` and the neutral token baseline used by the rest of the product.

## Decision Log

Decision: Keep the docs route on Nextra and do not build a custom docs application shell outside the existing route.
Rationale: The request is aesthetic and brand-related, not architectural. `apps/web/app/docs/layout.tsx` and `apps/web/app/docs/[[...mdxPath]]/page.tsx` already provide a stable docs pipeline with module gating, metadata, and MDX loading. Replacing that stack would be disproportionate and would violate the “do not go full custom” requirement from the approved outline.
Date: 2026-03-27

Decision: Keep `/docs` on the standard Nextra page structure instead of adding a custom landing-page layout.
Rationale: Representative docs pages already author their own page title and opening copy inside MDX, so a stronger docs opener can be handled with shell styling and light `content/docs/index.mdx` polish. This keeps the change local and consistent with the approved “do not go full custom” boundary.
Date: 2026-03-27

Decision: Scope the visual reset to docs-local styling, docs-local chrome components, and light docs-index copy polish.
Rationale: The most valuable leverage points are `apps/web/features/docs/styles/docs-theme.css`, `apps/web/features/docs/components/docs-navbar.tsx`, `apps/web/features/docs/components/docs-footer.tsx`, and `apps/web/content/docs/index.mdx`. These are enough to materially shift perception without changing route semantics, metadata helpers, page discovery, or the docs content tree.
Date: 2026-03-27

Decision: Borrow cues from `/blog`, not structure from `/blog`.
Rationale: The blog is the strongest in-repo aesthetic reference for a premium editorial surface, but `/docs` still needs sidebar navigation, technical prose readability, and Nextra affordances. The right move is to reuse the blog’s type hierarchy, spacing discipline, background wash, and restrained chrome while keeping docs-specific information architecture intact.
Date: 2026-03-27

Decision: Apply the strongest editorial typography to `h1` and `h2`, but keep `h3` and lower headings more conventional.
Rationale: The docs refresh needs a visible brand shift, but technical pages still need to scan cleanly. Strong `h1` and `h2` styling captures the blog’s premium hierarchy without making deeper setup sections feel shouty or theatrical.
Date: 2026-03-27

Decision: Do not change the shared global product token source unless repo inspection during implementation proves the docs problem cannot be solved locally.
Rationale: The shared tokens in `apps/web/app/globals.css` already support the homepage and blog. The inspected mismatch is caused by docs-only overrides, so the default implementation path should delete or replace those overrides rather than widen scope into a site-wide token rewrite.
Date: 2026-03-27

Decision: Treat the docs refresh as a visual-language reset, not a content strategy rewrite.
Rationale: The user’s complaint is that the docs look ugly, beige, and off-brand. It is not a request to rewrite the IA, lesson order, or docs corpus. Small content edits are allowed only where they help the new shell land, especially on `apps/web/content/docs/index.mdx`.
Date: 2026-03-27

Decision: Keep the existing docs destinations, but remove the visible badge treatment and simplify the docs identity language to `Ship by Sunday Docs`.
Rationale: The grill resolved that the docs bar and footer should stay functional while dropping one of the most templated-looking UI signals. The route should feel branded and premium, but not like a separate starter-template sub-brand.
Date: 2026-03-27

Decision: Align the docs route to the app-wide system theme default.
Rationale: `apps/web/app/layout.tsx` already defaults the rest of the product to system theme. Keeping docs dark-first would preserve an unnecessary split personality and would fight the goal of making the docs feel like the same product.
Date: 2026-03-27

Decision: Replace the warm-paper docs viewport color and shell background with a neutral product canvas.
Rationale: The old `rgb(245,241,234)` docs chrome was the most obvious source of the beige feeling, and it also made the browser tab color feel disconnected from the rest of the product. Moving to `rgb(253,253,253)` and the shared product background keeps the route aligned with the editorial reference without widening scope.
Date: 2026-03-27

Decision: Update the docs description copy, but keep it direct and operational rather than editorial or salesy.
Rationale: The existing description still says “for the starter,” which conflicts with the refreshed identity. The replacement should remove that framing while still describing the route as setup and troubleshooting documentation rather than marketing copy.
Date: 2026-03-27

Decision: Present the docs chrome with plain text identity and quieter controls instead of badge-style pills.
Rationale: The old badge treatment made the navbar feel templated. A plain inline identity label and softer link buttons keep the route functional while making the brand signal feel more editorial and less like a starter scaffold.
Date: 2026-03-27

## Outcomes & Retrospective

This section must be updated as implementation progresses. At plan creation time, the intended outcome is clear: `/docs` should still behave like Nextra-backed technical documentation, but it should visually read as the same premium Ship by Sunday system as `/blog` and the refreshed homepage. The likely success condition is that most of the work lands in docs-local CSS, small chrome component changes, and small config or copy cleanups for the docs identity language, with minimal route-level churn. The major open questions at plan creation time have now been resolved through the grill: `/docs` stays on the standard Nextra structure, the route aligns to system theme, the strongest editorial typography stops at `h2`, and the docs identity simplifies to `Ship by Sunday Docs` with direct operational description text.

At implementation close, the visible docs surface has been refreshed in the intended way. The shell is neutral instead of beige, the body typography and content surfaces are more editorial, the chrome is quieter, and the landing page opener now describes the docs as the operational path to running and shipping the repo.

## Context and Orientation

The public docs surface lives entirely under `apps/web/app/docs/` and `apps/web/features/docs/`. `apps/web/app/docs/layout.tsx` is the top-level shell. It mounts `Layout` from `nextra-theme-docs`, imports the base Nextra stylesheet and the local override file `apps/web/features/docs/styles/docs-theme.css`, disables edit and feedback links, configures the sidebar and table of contents, and injects `DocsNavbar` and `DocsFooter`. It also uses `DOCS_THEME_STORAGE_KEY` from `apps/web/features/docs/lib/theme-preferences.ts` and respects the docs module flag through `isStarterModuleEnabled("docs")`.

`apps/web/app/docs/[[...mdxPath]]/page.tsx` is the content loader. It converts the route segments into an MDX source path, uses `importPage(...)` from Nextra, and wraps the result with the MDX wrapper returned by `apps/web/mdx-components.tsx`. In this repo, the docs content itself lives under `apps/web/content/docs/`, with navigation order controlled by `apps/web/content/docs/_meta.ts` and nested `_meta.ts` files. `apps/web/content/docs/index.mdx` is the public landing page for the docs surface and is the most likely content file to receive small editorial polish if the visual shell alone is not enough.

The docs chrome is deliberately thin. `apps/web/features/docs/components/docs-navbar.tsx` renders a `Navbar` from `nextra-theme-docs` with the Ship by Sunday wordmark, docs identity label treatment, links to home, pricing, and sign-in, and the docs theme toggle. `apps/web/features/docs/components/docs-footer.tsx` renders a `Footer` from `nextra-theme-docs` with the docs site name, description, and route links. `apps/web/features/docs/components/docs-theme-toggle.tsx` bridges Nextra’s theme state back into the app’s `data-product-theme` attribute and local storage so the docs shell stays in sync with the rest of the product’s light and dark styling.

The strongest local styling lever is `apps/web/features/docs/styles/docs-theme.css`. This file currently controls the docs shell border system, navbar blur, sidebar background, active and hover states, article card, heading treatment, prose widths, code-block appearance, and table-of-contents panel styling. If an implementer only read one file before changing code, it should be this one. The current theme already has the right architecture for a CSS-first reset; it just translates the brand in the wrong direction.

The reference aesthetic already exists in the repo. `apps/web/features/blog/components/blog-index-page.tsx` and `apps/web/features/blog/components/blog-post-shell.tsx` establish the softer editorial background wash, the wider breathing room, the condensed uppercase display headings, the small mono overlines, the minimal top bar, and the quieter use of borders. `apps/web/features/blog/components/blog-rich-text.tsx` establishes the desired body rhythm for long-form content. Those files are not implementation targets for this plan, but they are the in-repo design benchmark that the docs surface should join.

The shared brand language is defined in `.impeccable.md` and `apps/web/app/globals.css`. `.impeccable.md` says the interface should feel serious, expensive, clean, bold, and operational, with strong hierarchy and minimal but non-sterile personality. `apps/web/app/globals.css` defines the neutral token baseline and exposes `.font-marketing-display` plus `.tracking-marketing-section`, which are already used across the blog and homepage. In this plan, “editorial” means applying those same cues to documentation pages without destroying technical readability or the docs information architecture.

The control plane for docs labels and descriptions lives in `apps/web/config/product.ts` and `apps/web/features/starter/lib/starter-selectors.ts`. These files already define `routeConfig.docs`, `starterConfig.docs`, and `docsDisplayConfig`. Do not duplicate those values inside the docs feature. The visual reset should continue to consume them through the existing selectors, but the grill resolved that the actual docs identity and description strings should be updated there to match the refreshed route.

Validation for the docs route is currently split between metadata-focused automated checks and manual browser review. `apps/web/tests/unit/docs-metadata.test.ts` verifies canonical and social metadata helpers. `apps/web/tests/browser-smoke/app-smoke.spec.ts` verifies that `/docs/local-setup` emits canonical and article-style Open Graph tags. There is no visual regression harness for docs today, so any implementing agent must manually verify `/docs` and at least one content page in both themes and at mobile width before declaring the work done.

## Plan of Work

Start by resetting the docs shell rather than redesigning the content tree. The first implementation slice should stay inside `apps/web/features/docs/styles/docs-theme.css` and remove the warm parchment translation layer. Replace the fixed warm `--nextra-bg`, the current panel gradients, and the heavier card-chrome feel with a softer editorial wash and lighter surface treatment that feel closer to the blog. In the same slice, change the docs route in `apps/web/app/docs/layout.tsx` from `defaultTheme: "dark"` to `defaultTheme: "system"` so the first impression matches the rest of the product. Update the `themeColor` values there as well if the visual reset changes the actual top-level light-mode and dark-mode page colors enough that the browser UI color should follow.

Once the outer shell is closer to the brand, adjust the content rhythm. The docs route should still read as technical documentation, but the current article container, heading styles, prose spacing, and code-block surfaces are too obviously “custom docs theme” instead of “Ship by Sunday editorial documentation.” This pass should stay mostly in `docs-theme.css` and align `h1`, `h2`, prose width, section dividers, inline code, preformatted blocks, lists, tables, blockquotes, table-of-contents styling, and sidebar active states with the more deliberate blog rhythm. The strongest editorial typography should stop at `h2`. `h3` and below should stay more conventional.

Only after the CSS shell and prose rhythm feel right should the implementer touch the chrome components and docs identity language. `apps/web/features/docs/components/docs-navbar.tsx` and `apps/web/features/docs/components/docs-footer.tsx` should be simplified so they feel like restrained editorial navigation instead of a stack of utility buttons. Keep the existing destinations, but remove the visible badge treatment. Update the docs identity strings in `apps/web/config/product.ts` and `apps/web/features/starter/lib/starter-selectors.ts` so the route presents as `Ship by Sunday Docs`, with direct operational description copy that removes the starter-template framing.

Finish by deciding whether the docs landing page itself needs small content polish. `apps/web/content/docs/index.mdx` already has the correct informational structure, but it may still need a stronger opening paragraph or section phrasing once the shell changes land. Keep this slice narrow. Do not rewrite the docs corpus. Only strengthen the opening where it helps the refreshed visual system feel intentional.

Throughout implementation, keep the work local to the docs feature unless inspection proves that a broader dependency is truly required. Validate after each milestone with the narrowest useful checks first. If a change breaks metadata behavior, module gating, or the docs route shell, fix that before moving on. If a wider change seems necessary, update this plan before silently widening scope.

## Milestones

### Milestone 1: Reset the docs shell and align docs to system theme without replacing Nextra

At the end of this milestone, `/docs` still renders through the existing Nextra route and component tree, but the page no longer reads as warm paper documentation and no longer boots into a docs-specific dark-first theme. The main background, article container, sidebar, table-of-contents rail, and navbar blur should feel visibly closer to the blog’s editorial shell. The key files are `apps/web/features/docs/styles/docs-theme.css` and `apps/web/app/docs/layout.tsx`.

Success looks like opening `/docs` in a browser and seeing a calmer, more neutral, more premium shell with softer surface contrast, less obvious panel stacking, and no strong beige cast. The route should still render, the docs module gate should still work, and no content or metadata helpers should need to change just to land this shell pass. Validate by running formatting and lint on the changed docs files and then loading `/docs` in the browser in both themes.

### Milestone 2: Align docs typography and body rhythm with the editorial system

At the end of this milestone, the docs body should feel like editorial technical writing, not just content inside a themed card. `h1` and `h2` should carry the strongest brand shift, while `h3` and lower headings stay operational. Prose widths, section spacing, inline code, code blocks, lists, tables, blockquotes, tables of contents, and sidebar states should all feel more deliberate and more consistent with the blog. The work should still mostly live in `apps/web/features/docs/styles/docs-theme.css`, with route-level changes avoided unless absolutely necessary.

Success looks like `/docs/local-setup` reading cleanly from top to bottom on desktop and mobile with stronger hierarchy, more intentional spacing, and code surfaces that still feel technical but no longer visually drift from the rest of the product. This milestone is complete when the docs remain easy to scan and technical readability is preserved while the overall visual tone moves materially closer to the brand.

### Milestone 3: Simplify the docs chrome, update docs identity copy, and strengthen the landing-page opener

At the end of this milestone, the docs navbar, footer, and landing-page intro should feel curated and premium instead of assembled from generic utility controls. `apps/web/features/docs/components/docs-navbar.tsx` and `apps/web/features/docs/components/docs-footer.tsx` should preserve the same destinations and theme-toggle behavior, but the visual treatment should be quieter and more editorial, with the visible badge treatment removed. `apps/web/config/product.ts` and `apps/web/features/starter/lib/starter-selectors.ts` should rename the route identity to `Ship by Sunday Docs` and replace starter-specific description text with a direct operational description. `apps/web/content/docs/index.mdx` may receive light copy polish if the refreshed shell still leaves the opening too generic.

Success looks like `/docs` presenting itself as a serious operational runbook: clear brand, clear starting point, and cleaner navigation furniture. The milestone is complete when the top and bottom chrome no longer pull attention away from the content and the docs landing page reads like a deliberate product surface instead of default starter docs.

### Milestone 4: Validate the refreshed docs surface across themes, widths, and existing crawl behavior

At the end of this milestone, the implementing agent has proven that the visual reset did not break the docs route, the metadata contract, or basic crawl behavior. The route should still emit canonical metadata, the docs module gate should still work, and the surface should feel coherent in light mode, dark mode, desktop, and a narrow mobile viewport.

Success looks like passing the narrow automated checks that already exist for docs, passing a broader build if the repo state allows it, and recording manual QA observations for `/docs` and `/docs/local-setup` in this plan. If unrelated repo issues block the full build or local server startup, document the exact blocker in `Surprises & Discoveries` and do not misattribute it to the docs refresh.

## Concrete Steps

Start by refreshing the exact docs-shell files that define the current behavior:

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,220p' apps/web/app/docs/layout.tsx
    sed -n '1,260p' apps/web/app/docs/[[...mdxPath]]/page.tsx
    sed -n '1,320p' apps/web/features/docs/styles/docs-theme.css
    sed -n '1,220p' apps/web/features/docs/components/docs-navbar.tsx
    sed -n '1,220p' apps/web/features/docs/components/docs-footer.tsx
    sed -n '1,220p' apps/web/features/docs/components/docs-theme-toggle.tsx
    sed -n '1,220p' apps/web/config/product.ts
    sed -n '1,220p' apps/web/features/starter/lib/starter-selectors.ts
    sed -n '1,220p' apps/web/content/docs/index.mdx

Refresh the in-repo design benchmark before making styling decisions:

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,220p' .impeccable.md
    sed -n '1,220p' apps/web/app/globals.css
    sed -n '1,240p' apps/web/features/blog/components/blog-index-page.tsx
    sed -n '1,240p' apps/web/features/blog/components/blog-post-shell.tsx
    sed -n '1,220p' apps/web/features/blog/components/blog-rich-text.tsx

The first implementation pass should stay in the docs CSS override file. Remove the warm-page assumptions before touching prose details. Keep notes in the plan about what changes, for example whether `--nextra-bg`, article borders, or sidebar surface rules were removed or replaced.

After the shell reset and theme-default change land, run narrow formatting and lint checks on the touched docs files:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx oxlint --deny-warnings app/docs/layout.tsx config/product.ts features/starter/lib/starter-selectors.ts features/docs/components/docs-navbar.tsx features/docs/components/docs-footer.tsx features/docs/components/docs-theme-toggle.tsx features/docs/styles/docs-theme.css
    bunx oxfmt --check app/docs/layout.tsx config/product.ts features/starter/lib/starter-selectors.ts features/docs/components/docs-navbar.tsx features/docs/components/docs-footer.tsx features/docs/components/docs-theme-toggle.tsx

If `apps/web/content/docs/index.mdx` changes, include that file in the format check and verify the docs route still compiles:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx oxfmt --check content/docs/index.mdx

Run the narrow automated docs checks that already exist in the repo:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bunx vitest --config vitest.config.ts run --project unit tests/unit/docs-metadata.test.ts
    PLAYWRIGHT_USE_LOCAL_SERVER=1 bunx playwright test --project=browser-smoke tests/browser-smoke/app-smoke.spec.ts --grep "docs pages emit canonical tags and auth pages emit noindex"

Then do manual QA against the actual rendered docs surface. Use desktop and mobile widths, and check both light and dark themes:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bun run dev:web

Open `http://localhost:3000/docs` and `http://localhost:3000/docs/local-setup`. Check these concrete points while updating this plan:

    the background no longer reads as beige paper
    the docs route now respects system theme by default instead of forcing dark-first behavior
    the docs title and section headings feel like the same display system as the blog
    h1 and h2 carry the strongest editorial tone while h3 and lower headings still scan cleanly
    the sidebar remains easy to scan and the active item is obvious without looking loud
    the TOC remains legible and sticky without feeling like a heavy card
    code blocks, inline code, and lists still read as technical documentation
    tables and blockquotes no longer look like unowned defaults
    the navbar and footer feel quieter and more premium
    the visible docs identity reads as Ship by Sunday Docs and no longer uses starter-template framing
    mobile layout keeps readable spacing and touch targets

If the repo is stable enough for the broader proof step, run the build from `apps/web`:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bun run build

If `bun run build` fails for an unrelated reason, capture the actual failing file and message in `## Surprises & Discoveries`, mark the relevant progress item as blocked, and do not widen this docs plan into an unrelated repair without updating the plan first.

## Validation and Acceptance

The refreshed docs surface is accepted only when a human can verify all of the following. Opening `/docs` in the browser should show a premium editorial docs shell that is visibly closer to the blog than to the old warm starter-docs theme. The route should align to system theme by default instead of forcing dark-first behavior. Opening `/docs/local-setup` should show the same shell around real technical content, with strong `h1` and `h2` hierarchy, conventional but clean deeper headings, readable prose widths, calm but obvious navigation, and code surfaces that still feel trustworthy for setup instructions.

The docs route must still respect the existing metadata contract. The existing unit test in `apps/web/tests/unit/docs-metadata.test.ts` must pass, and the existing browser-smoke test in `apps/web/tests/browser-smoke/app-smoke.spec.ts` must still prove that a docs page emits canonical and article-style Open Graph metadata. The theme toggle must still switch between light and dark modes and keep `data-product-theme` in sync through `apps/web/features/docs/components/docs-theme-toggle.tsx`.

The refresh must also cover the real MDX surfaces present in the current docs corpus. Acceptance includes a visible check that the Markdown table in `apps/web/content/docs/customize-the-starter.mdx` and the blockquote examples in `apps/web/content/docs/prompting-patterns.mdx` feel visually owned by the new docs system rather than leftover defaults.

The route must remain Nextra-backed and feature-local. Acceptance is not “the page looks different.” Acceptance is “the page looks different while still rendering through the same docs route, the same content tree, the same module gating, and the same metadata helpers.” If the implementation requires a second docs stack, a new route family, or a global token rewrite, the milestone is not complete and this plan must be revised before continuing.

The visible and metadata-facing docs identity must also be updated consistently. Footer copy, docs metadata, and visible docs chrome should present as `Ship by Sunday Docs`, and the supporting description text should be direct and operational rather than starter-template framing.

The ideal final automated stack for the completed refresh is:

    cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    bun run lint
    bun run format:check
    bunx vitest --config vitest.config.ts run --project unit tests/unit/docs-metadata.test.ts
    PLAYWRIGHT_USE_LOCAL_SERVER=1 bunx playwright test --project=browser-smoke tests/browser-smoke/app-smoke.spec.ts --grep "docs pages emit canonical tags and auth pages emit noindex"
    bun run build

If the repo cannot pass the final build because of unrelated dirty-worktree failures, explicitly record that limitation in this plan and in the implementation summary. Do not claim unqualified success without that note.

## Idempotence and Recovery

This plan is intentionally additive and local. Most work should be repeatable because it changes the docs override CSS and small docs chrome components rather than mutating data or external services. Re-running the styling pass should be safe as long as the implementer keeps changes scoped to `apps/web/features/docs/`, `apps/web/app/docs/layout.tsx`, and at most `apps/web/content/docs/index.mdx`.

If a CSS change partially succeeds and leaves the docs shell in an inconsistent state, recover by restoring the last known-good sections of `apps/web/features/docs/styles/docs-theme.css` and reapplying the shell reset in smaller slices: first background and outer shell, then typography and prose rhythm, then sidebar and TOC, then navbar and footer. Validate each slice immediately before continuing.

If a route-level regression appears, such as module gating breaking or metadata disappearing, stop and inspect `apps/web/app/docs/layout.tsx`, `apps/web/app/docs/[[...mdxPath]]/page.tsx`, and `apps/web/features/docs/lib/docs-metadata.ts` before changing any broader files. The most likely recovery move is to revert the route-level change and keep the work local to CSS and presentational components.

If browser smoke or build fails for a reason that is clearly unrelated to the docs refresh, do not silently fix unrelated product code under this plan. Record the blocker in `## Surprises & Discoveries`, mark the relevant `## Progress` item accurately, and either stop or open a separate plan for the unrelated failure.

## Artifacts and Notes

Useful starting observations from repo inspection:

    apps/web/app/docs/layout.tsx sets the light-mode `themeColor` to `rgb(245,241,234)`, which reinforces the current warm-paper presentation.

    apps/web/app/docs/layout.tsx currently sets `nextThemes.defaultTheme` to `"dark"` even though the app-wide `ThemeProvider` in `apps/web/app/layout.tsx` defaults to `"system"`.

    apps/web/features/docs/styles/docs-theme.css currently styles `article.nextra-body-typesetting-article` as a bordered rounded card with a warm gradient background and a stronger box-shadow than the blog uses.

    apps/web/features/blog/components/blog-post-shell.tsx already proves the desired background treatment and heading hierarchy in this repo, so the docs refresh has a native benchmark.

    apps/web/tests/browser-smoke/app-smoke.spec.ts already contains a docs-specific request test, so no new smoke harness is required just to prove the route still emits canonical metadata.

    apps/web/content/docs/customize-the-starter.mdx includes a Markdown table, and apps/web/content/docs/prompting-patterns.mdx includes multiple blockquote examples. These surfaces must be explicitly checked during implementation.

Suggested before-and-after screenshots to capture during implementation:

    /docs in light mode at desktop width
    /docs/local-setup in light mode at desktop width
    /docs in dark mode at desktop width
    /docs/local-setup at a narrow mobile width around 390px

## Interfaces and Dependencies

`apps/web/app/docs/layout.tsx` must continue to mount `Layout` from `nextra-theme-docs` and must continue to import `nextra-theme-docs/style.css` plus the local override file. This plan depends on Nextra staying the docs runtime and on `getPageMap("/docs")` continuing to drive the sidebar structure.

`apps/web/app/docs/[[...mdxPath]]/page.tsx` must continue to use `importPage(...)` and the wrapper returned by `apps/web/mdx-components.tsx`. The plan does not call for a second MDX compiler, a custom content loader, or a new route family.

`apps/web/features/docs/styles/docs-theme.css` is the primary styling interface. It is expected to continue owning docs-specific selectors for the Nextra navbar, sidebar, article body, TOC, code blocks, inline code, and link treatment. Any implementing agent should treat this file as the main contract for the visual refresh.

`apps/web/features/docs/components/docs-navbar.tsx`, `apps/web/features/docs/components/docs-footer.tsx`, and `apps/web/features/docs/components/docs-theme-toggle.tsx` must continue to own the docs chrome. The theme toggle in particular must keep using `useTheme` from `nextra-theme-docs` and must continue syncing `data-product-theme`, local storage, and the docs theme cookie through `apps/web/features/docs/lib/theme-preferences.ts`.

`apps/web/features/docs/lib/docs-metadata.ts` and the existing browser-smoke test must remain valid after the refresh. The plan is visual, but it still depends on canonical URL generation and article-style social metadata continuing to work.

`apps/web/config/product.ts` and `apps/web/features/starter/lib/starter-selectors.ts` remain the source of truth for labels, route paths, and docs descriptions. The visual refresh must continue to consume these interfaces rather than hard-coding route labels inside the docs feature.
