---
title: Retire Public Docs Runtime And Preserve Setup Truth
status: active
created_at: 2026-05-16
completed_at: null
summary: Remove the public /docs route and docs MDX corpus while preserving setup truth in non-public internal docs and keeping blog MDX live.
post_build_recap: null
program_id: public-docs-retirement
planning_brief: docs/programs/active/2026-05-16-public-docs-retirement/planning-brief-1.md
read_when:
  - Resuming the public docs retirement implementation.
  - Checking why the public /docs route is intentionally gone.
  - Verifying where app setup truth moved after docs MDX deletion.
---

# Retire Public Docs Runtime And Preserve Setup Truth

This document is a living execution plan for deleting the public docs runtime while keeping essential setup guidance discoverable inside the repository.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The public `/docs` experience is not a customer path anymore. After this plan is complete, the web app will keep rendering blog MDX, but it will no longer compile or route public docs MDX under `/docs`. The setup details that operators still need for local development, Clerk, Stripe, Vercel, Cal.com, Telegram support, route ownership, and QA will live in `docs/internal/`, where future workers can find them without maintaining a public docs site.

Someone can see the result by confirming `apps/web/src/content/docs/` and `apps/web/src/app/(marketing)/docs/` are gone, blog tests still pass, no sitemap or metadata route lists `/docs`, and the internal setup docs name the provider setup, env names, verification commands, and failure shapes.

## Progress

- [x] 2026-05-16: Created the Program packet and planning brief for public docs retirement.
- [x] 2026-05-16: Read the root and web app agent instructions, release workflow, T3 design Program, relevant Next.js route docs, current public docs MDX, public docs runtime, and tests before editing.
- [x] 2026-05-16: Created this child ExecPlan from `docs/programs/active/2026-05-16-public-docs-retirement/planning-brief-1.md`.
- [x] 2026-05-16: Moved essential setup truth into `docs/internal/web-app-setup.md` and `docs/internal/telegram-support-bot.md`, and repointed active setup guidance away from deleted public MDX.
- [x] 2026-05-16: Deleted the public docs content and App Router subtree.
- [x] 2026-05-16: Removed docs loaders, config, metadata, tooling, stale app links, and docs tests while preserving blog behavior.
- [x] 2026-05-16: Ran focused docs/blog route tests and the requested broader validation on `codex/public-docs-retirement`.
- [x] 2026-05-16: Updated this plan and the owning Program with implementation and validation outcomes.

## Surprises & Discoveries

The research pass confirmed that `/docs` was already unpromoted and noindexed, but still existed as route code, MDX content, config, tests, and markdown metadata tooling.

`bun typecheck` runs the Next production build in this repo. The route manifest printed by the passing build on 2026-05-16 listed `/blog`, `/blog/the-operating-system-beats-the-prompt`, and `/blog/starter-and-workers-are-different-jobs`, and did not list `/docs`.

## Decision Log

Decision: Delete the public `/docs` route instead of leaving a disabled docs shell.
Rationale: The user clarified that public docs are not wanted. Keeping a disabled route would preserve route, config, and test drag without serving a real customer path.
Date: 2026-05-16

Decision: Preserve setup truth in `docs/internal/` as normal Markdown instead of MDX.
Rationale: The public docs MDX corpus is being removed. Internal Markdown remains lintable, easy to find from `docs/internal/README.md`, and outside the public app bundle.
Date: 2026-05-16

Decision: Treat a missing `/docs` route as the intentional public contract.
Rationale: Next.js App Router naturally returns the app not-found behavior when no route segment exists. A redirect would imply a replacement public docs destination, which this slice is explicitly removing.
Date: 2026-05-16

## Outcomes & Retrospective

Implementation is complete in the `codex/public-docs-retirement` branch. Public docs code and MDX are gone, blog MDX still renders, setup truth lives in internal docs, and validation proves no stale docs imports or public route metadata remain. The plan stays active while the PR is in flight.

## Context and Orientation

The web app is a Next.js App Router app under `apps/web/src/app/`. Public marketing routes live under `apps/web/src/app/(marketing)/`. The docs route to remove is `apps/web/src/app/(marketing)/docs/`, which includes a layout, catch-all page, route-local components, theme helpers, metadata helpers, page path helpers, MDX loaders, and docs CSS. The docs content to remove is `apps/web/src/content/docs/`, including top-level MDX pages and `troubleshooting/` MDX pages.

The public blog must stay. Blog content lives under `apps/web/src/content/blog/`, and shared public content indexing lives in `apps/web/src/app/_content/public-content-inventory.ts`. That file currently indexes both docs and blog entries, so this slice must delete only docs behavior and leave blog entry loading intact.

Route discovery and SEO-like route lists are split across `apps/web/src/app/_metadata/content-route-index.ts`, the web app sitemap and robots tests, and product route constants in `apps/web/src/config/product.ts`. Public docs removal must not leave `routeConfig.docs`, docs display selectors, or sitemap builders that imply `/docs` still exists.

Provider and setup truth currently lives in public MDX pages such as `environment-variables.mdx`, `local-setup.mdx`, `local-qa.mdx`, `clerk-convex-auth.mdx`, `stripe-checkout-webhook.mdx`, `deploy-to-vercel.mdx`, `worker-seal-team-6-cal-com.mdx`, `telegram-support-bot.mdx`, and `route-map.mdx`. This plan moves that truth into `docs/internal/web-app-setup.md` and `docs/internal/telegram-support-bot.md`.

### In Scope

This plan includes deleting the public docs App Router subtree, deleting public docs MDX, removing docs imports and config, deleting or rewriting docs-specific tests, preserving setup truth in internal Markdown, updating stale current references that point future workers at deleted files, and validating blog/public route behavior after the removal.

### Out Of Scope

This plan does not touch blog MDX except for import-path or metadata fallout required by tests. It does not add Telegram widget work, Starter preview work, checkout rewrites, generated repo redesign, provider dashboard changes, new auth or billing behavior, or public marketing redesign. Historical planning briefs may keep old `/docs` decisions as historical records unless they are active guidance that would misdirect future work.

## Plan of Work

First, add internal setup docs. Create `docs/internal/web-app-setup.md` with the local setup, env ownership, Clerk, Stripe, Vercel, Cal.com, local QA, release proof, and current route map details. Create `docs/internal/telegram-support-bot.md` with the support-specific Telegram, Convex, OpenAI, webhook, verification, operations, retention, and failure-shape details. Update `docs/internal/README.md`, root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/RELIABILITY.md`, and `docs/design-docs/scripts.md` so current guidance points at the new non-public docs instead of deleted MDX.

Next, delete the public docs runtime. Remove `apps/web/src/content/docs/` and `apps/web/src/app/(marketing)/docs/`. In `apps/web/src/app/_content/public-content-inventory.ts`, remove docs metadata imports, docs entry types, docs source discovery, docs navigation builders, and exported docs accessors while leaving blog entry loading and heading extraction intact. In `apps/web/src/app/_metadata/content-route-index.ts`, remove docs sitemap support and keep blog sitemap support.

Then, clean configuration and stale app links. Remove `routeConfig.docs`, docs display config, docs module flags, and homepage docs labels from `apps/web/src/config/product.ts`, `apps/web/src/config/starter-selectors.ts`, and `apps/web/src/app/_content/home-page.ts`. Remove lesson or repo-map references that point users to `/docs/local-setup` or `/docs/deploy-to-vercel`.

After that, update tooling and tests. Remove the `web_docs_page` markdown metadata family from `scripts/markdown-metadata/families.ts` and `scripts/markdown-metadata/lint.ts`, and stop public-readiness lint from walking `apps/web/src/content/docs/`. Delete docs-only tests and rewrite shared public content, metadata, homepage, and marketing surface tests so they assert blog behavior and the intentional absence of `/docs`.

Finally, search for stale docs runtime references, run focused route and content tests, run formatting, lint, typecheck, and whitespace validation, then update this ExecPlan and the owning Program with the results.

## Milestones

Milestone 1 preserves setup truth. At the end of this milestone, `docs/internal/web-app-setup.md` and `docs/internal/telegram-support-bot.md` exist, `docs/internal/README.md` links them, and current agent/reliability guidance no longer points at public docs MDX as the setup source of truth.

Milestone 2 removes the public docs runtime. At the end of this milestone, the docs MDX directory and docs route directory no longer exist, shared content loading is blog-only, and the app no longer exports docs route metadata or docs sitemap routes.

Milestone 3 makes route behavior and tests intentional. At the end of this milestone, route config, selectors, lesson resources, markdown metadata tooling, public-readiness lint, and app tests no longer expect `/docs`. Blog route tests still pass.

Milestone 4 validates and records the outcome. At the end of this milestone, focused docs/blog tests, app static checks, repo lint/typecheck, docs/program/plan lint, and whitespace checks have been run or any blocker is recorded precisely.

## Concrete Steps

Work from the repository root.

Search for stale public docs references before and after edits:

    rg -n "routeConfig\\.docs|docsDisplayConfig|marketingDisplayConfig\\.docsLabel|starterConfig\\.docs|modules\\.docs|web_docs_page|@/content/docs|apps/web/src/content/docs|/docs" apps/web/src apps/web/tests scripts docs AGENTS.md apps/web/AGENTS.md

Run focused tests after the runtime and tests are updated:

    bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/public-metadata-routes.test.ts tests/unit/blog-formatters.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-page-paths.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-posts.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts tests/unit/starter-selectors.test.ts tests/unit/public-marketing-surfaces.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx

Run docs and planning checks:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-16-retire-public-docs-runtime-and-preserve-setup-truth.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-16-public-docs-retirement docs/exec-plans/active/2026-05-16-retire-public-docs-runtime-and-preserve-setup-truth.md docs/internal docs/RELIABILITY.md docs/design-docs/scripts.md docs/programs/README.md docs/programs/active/index.md

Run the requested broader checks:

    bun run --cwd apps/web format:check
    bun lint
    bun typecheck
    git diff --check

## Validation and Acceptance

The plan is accepted when no public docs MDX import, docs route component, docs navigation entry, docs sitemap route, docs metadata helper, docs markdown metadata family, or public `/docs` product config remains. Blog MDX must still load and render through the existing blog tests. Customer-critical setup truth must be present in internal docs with the required env names, provider setup locations, exact webhook URLs or callback route shapes, verification commands, and failure shapes.

The observable public route contract is that `/docs` is not a routed product surface. The App Router should handle it through the normal not-found path because no `docs` segment exists under `apps/web/src/app/(marketing)/`.

### Test Commands

Run these commands from the repository root:

    bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/public-metadata-routes.test.ts tests/unit/blog-formatters.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-page-paths.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-posts.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts tests/unit/starter-selectors.test.ts tests/unit/public-marketing-surfaces.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-16-retire-public-docs-runtime-and-preserve-setup-truth.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-16-public-docs-retirement docs/exec-plans/active/2026-05-16-retire-public-docs-runtime-and-preserve-setup-truth.md docs/internal docs/RELIABILITY.md docs/design-docs/scripts.md docs/programs/README.md docs/programs/active/index.md
    bun run --cwd apps/web format:check
    bun lint
    bun typecheck
    git diff --check

If `markdown:lint` has no docs MDX family after this slice, that is expected. It should still validate repo docs, Programs, ExecPlans, and blog posts.

## Idempotence and Recovery

Deleting `apps/web/src/content/docs/` and `apps/web/src/app/(marketing)/docs/` is intentionally destructive but scoped to the public docs surface the user asked to remove. If a stale import remains, restore nothing by default; search the import and either delete the docs dependency or move only essential setup text into internal docs. If validation fails because of formatting, run the repo formatter or apply a narrow patch and rerun the failing command.

If a later worker needs public docs again, they should not resurrect this deleted MDX corpus by default. They should create a new Program or ExecPlan that explains the new product need and chooses a fresh public content model.

## Artifacts and Notes

The Program packet for this work lives at `docs/programs/active/2026-05-16-public-docs-retirement/`. The immutable planning brief for this slice is `docs/programs/active/2026-05-16-public-docs-retirement/planning-brief-1.md`.

Relevant source directories before deletion:

    apps/web/src/content/docs/
    apps/web/src/app/(marketing)/docs/

Expected source directories after deletion:

    apps/web/src/content/blog/
    docs/internal/web-app-setup.md
    docs/internal/telegram-support-bot.md

Validation passed on 2026-05-16:

    bun run --cwd apps/web test:unit -- tests/unit/public-content-inventory.test.ts tests/unit/public-metadata-routes.test.ts tests/unit/blog-formatters.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-page-paths.test.ts tests/unit/blog-metadata.test.ts tests/unit/blog-posts.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts tests/unit/starter-selectors.test.ts tests/unit/public-marketing-surfaces.test.tsx tests/unit/course-registry.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-16-retire-public-docs-runtime-and-preserve-setup-truth.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/active/2026-05-16-public-docs-retirement docs/exec-plans/active/2026-05-16-retire-public-docs-runtime-and-preserve-setup-truth.md docs/internal docs/RELIABILITY.md docs/design-docs/scripts.md docs/programs/README.md docs/programs/active/index.md AGENTS.md apps/web/AGENTS.md docs/programs/active/2026-05-06-telegram-support-bot/program.md docs/exec-plans/active/2026-05-06-live-provider-proof-and-program-closeout.md docs/programs/active/2026-05-12-public-product-split-starter-workers/program.md docs/programs/active/2026-05-13-template-first-web-convex-architecture/architecture-migration-inventory.md
    bun run --cwd apps/web format:check
    bun lint
    bun typecheck
    git diff --check

## Interfaces and Dependencies

The remaining public content interface is `getAllBlogContentEntries()` and `getPublishedBlogContentEntries()` from `apps/web/src/app/_content/public-content-inventory.ts`. The route metadata interface that should remain is blog sitemap support in `apps/web/src/app/_metadata/content-route-index.ts`. The product route interface in `apps/web/src/config/product.ts` should expose public product, blog, checkout, auth, and protected app routes, but not `docs`.

Internal setup docs depend on real external providers: Clerk for passwordless sign-in and Convex JWT auth, Stripe for Checkout and webhook fulfillment, Vercel for production web deploys, Convex hosted deployments for backend state and HTTP actions, Cal.com for Worker Seal Team 6 booking, Telegram for support operations, and OpenAI for private support draft generation. This plan changes only documentation and app routing around those providers; it does not configure provider dashboards or mutate provider state.
