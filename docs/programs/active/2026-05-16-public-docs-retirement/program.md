---
program_id: "public-docs-retirement"
title: "Public Docs Retirement"
status: "active"
created_at: "2026-05-16"
completed_at: null
summary: "Remove the public /docs MDX surface from apps/web while keeping blog MDX live and preserving only customer-critical setup truth in durable non-public repo docs."
post_build_recap: null
read_when:
  - "Planning or executing removal of the public /docs route and MDX corpus."
  - "Checking whether blog MDX should stay while docs MDX is removed."
  - "Resolving where setup truth must live after public docs are deleted."
---

# Public Docs Retirement

This Program is the living initiative document for retiring the public Ship by Sunday docs surface without losing customer-critical setup truth.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The public `/docs` surface has outlived its role. It is already unpromoted and noindexed, but it still carries 34 MDX pages, a route tree, navigation chrome, loaders, route metadata, tests, and markdown-lint family logic. That surface creates maintenance drag without being a primary customer path.

Completion means the public web app no longer has a direct-link `/docs` experience, docs MDX under `apps/web/src/content/docs` is gone, docs-specific loaders/navigation/routes/tests are removed, and stale app references do not keep a fake docs module alive. Blog MDX under `apps/web/src/content/blog` remains intact and still renders.

The only docs truth that survives is setup truth a future worker or operator actually needs: environment variables, local setup and QA, Clerk and Convex auth, Stripe checkout/webhooks, Vercel deploy, Cal.com Worker Seal Team 6 setup, Telegram support bot setup, and route/provider contracts that would otherwise be lost. That truth should move into durable non-public docs such as `docs/internal/`, `README.md`, `docs/release-workflow.md`, or active Program/ExecPlan packets. It must not remain public MDX.

This Program supersedes earlier public-product-split decisions that kept `/docs` publicly reachable by direct link. The new direction is deletion of the public docs surface, not another demotion pass.

## Program Inputs

- `docs/programs/active/2026-05-16-public-docs-retirement/research-pass-public-docs-surface.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/normalized-pass-public-docs-retirement.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/converged-decision-packet.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/dependency-graph.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/plan-split-recommendation.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/cross-repo-review.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/planning-brief-1.md`
- `docs/programs/active/2026-05-16-public-docs-retirement/current-planning-brief.txt`

Related prior context:

- `docs/programs/active/2026-05-12-public-product-split-starter-workers/`
- `docs/exec-plans/completed/2026-05-13-clean-up-docs-promotion-and-blog-content.md`
- `docs/programs/active/2026-05-13-template-first-web-convex-architecture/`
- `docs/programs/active/2026-05-06-telegram-support-bot/`

## Current State

The implementation slice now removes `apps/web/src/content/docs/` and `apps/web/src/app/(marketing)/docs/`. The public `/docs` surface is intentionally absent rather than disabled or redirected. The initial inventory found 34 MDX pages plus `_meta.ts` files, route layout, catch-all page, docs chrome, theme helpers, metadata helpers, page-path helpers, a docs content loader, and docs-specific CSS.

`/docs` was already demoted from public discovery before this Program: the main public header did not promote it, sitemap output did not include docs routes, and docs metadata was noindex. That was not enough. The direct-link route, loader, content inventory, config, and tests still kept public docs alive until this implementation slice.

`apps/web/src/content/blog/` contains the blog MDX corpus and must stay. Blog rendering is separate under `apps/web/src/app/(marketing)/blog/` and remains part of the public product surface.

The docs surface included some setup truth that should not be deleted outright. That truth now lives in `docs/internal/web-app-setup.md` and `docs/internal/telegram-support-bot.md`. The preserved subjects are environment variables, local setup, local QA, Clerk and Convex auth, Stripe checkout and webhook setup, deploy to Vercel, route map, Worker Seal Team 6 Cal.com setup, and Telegram support bot setup.

Known app references handled by the implementation include `apps/web/src/app/_content/public-content-inventory.ts`, `apps/web/src/app/_metadata/content-route-index.ts`, `apps/web/src/config/product.ts`, `apps/web/src/config/starter-selectors.ts`, course lesson content, docs-specific tests under `apps/web/tests/`, and the markdown metadata family for `apps/web/src/content/docs/`.

## Progress

- [x] 2026-05-16: Created this Program packet from the public docs removal direction.
- [x] 2026-05-16: Captured current docs content, route, loader, metadata, config, test, and active-doc reference inventory.
- [x] 2026-05-16: Wrote child ExecPlan `docs/exec-plans/active/2026-05-16-retire-public-docs-runtime-and-preserve-setup-truth.md` from `planning-brief-1.md`.
- [x] 2026-05-16: Removed the public docs route/content/runtime and preserved setup truth in durable non-public docs.
- [x] 2026-05-16: Synced active Program, ExecPlan, reliability, setup, and markdown-lint references after implementation.
- [x] 2026-05-16: Ran focused public content, blog, metadata, route absence, homepage, starter selector, course registry, and home-page CTA tests.
- [x] 2026-05-16: Validated app formatting, repo lint, typecheck, docs/program/plan lint, and diff whitespace on `codex/public-docs-retirement`.

## Decision Log

Decision: Retire public `/docs`; do not keep it as a direct-link route.
Rationale: The public docs surface is not a product path, is already unpromoted, and still imposes route/content/test/tooling maintenance cost.
Date: 2026-05-16.

Decision: Keep blog MDX and the public blog route.
Rationale: Blog is part of the public publishing surface and is separate from docs MDX.
Date: 2026-05-16.

Decision: Delete docs MDX under `apps/web/src/content/docs` after setup truth is moved.
Rationale: Leaving the MDX corpus in place keeps the same maintenance trap under a different label.
Date: 2026-05-16.

Decision: Preserve only customer-critical setup truth in non-public durable docs.
Rationale: Provider setup, environment variables, webhook setup, and verification steps are part of the shipped contract, but they do not need to be public MDX.
Date: 2026-05-16.

Decision: Prefer removal over a disabled-state `/docs` page.
Rationale: A disabled public route still requires route handling, tests, metadata, and an intentional user experience for a surface the product no longer wants.
Date: 2026-05-16.

Decision: Treat prior Program language that kept `/docs` direct-link reachable as superseded.
Rationale: That was a first-pass demotion decision. The current product decision is stronger: public docs are gone.
Date: 2026-05-16.

## Slice Ledger

Active child ExecPlans:

- `docs/exec-plans/active/2026-05-16-retire-public-docs-runtime-and-preserve-setup-truth.md`

Completed child ExecPlans:

- None yet.

Related completed work:

- `docs/exec-plans/completed/2026-05-13-clean-up-docs-promotion-and-blog-content.md` demoted docs but intentionally kept `/docs` reachable. This Program supersedes that boundary.

## Next Slice

The current child ExecPlan is the implementation slice. It should finish broad validation, update final outcomes, and either complete this Program or record any remaining blocker. No second slice is planned unless validation finds a docs-retirement regression.

## Risks and Watchpoints

Do not delete provider setup truth without a replacement. The public docs are disposable; env, Clerk, Stripe, Vercel, Cal.com, and Telegram setup contracts are not.

Do not touch blog MDX unless a compile or test failure proves a shared metadata/import path must change.

Do not leave a disabled public `/docs` shell unless the child ExecPlan explicitly records why a hard removal is impossible. The default target is no public docs route.

Do not mix this Program with Telegram widget UI work, Starter preview work, checkout, generated repo, or visual redesign. References to Telegram or Cal.com in this Program are setup-truth preservation only.

Do not let active Program or ExecPlan docs keep pointing future workers at deleted public MDX paths.

Do not leave stale sitemap, robots, public route map, header/nav, course resource, or test expectations that imply `/docs` still exists.

## Outcomes & Retrospective

This Program is active while the PR is in flight. The implementation outcome is a smaller public web surface: `/blog` remains, `/docs` is intentionally gone, public docs MDX is removed, and setup truth lives where future operators and agents will find it without exposing or maintaining public docs pages.

## Validation and Acceptance

Program-level acceptance requires no broken MDX imports, no docs nav entries, no docs route loader, no docs route metadata, no docs route tests, and no stale public `/docs` sitemap or robots behavior. A request to `/docs` should be intentionally handled by the absence of the route or by an explicit redirect/404 contract chosen by the child ExecPlan.

Blog acceptance requires the existing blog MDX posts to keep loading and rendering, blog metadata and structured-data tests to keep passing, and public blog routes to remain in the sitemap.

Setup-truth acceptance requires durable non-public records for the setup content that cannot be safely deleted: environment variables, local setup and QA, Clerk/Convex auth, Stripe checkout/webhook, Vercel deploy, Cal.com Worker Seal Team 6 setup, Telegram support bot setup, and active provider route contracts.

Validation should include `bun run programs:lint`, markdown lint for touched docs, focused public content/blog/metadata tests, `bun run --cwd apps/web format:check`, `bun lint`, `bun typecheck`, and `git diff --check`.

## Artifacts and Notes

Current docs content inventory:

- 34 public docs MDX pages under `apps/web/src/content/docs/`
- docs metadata files at `apps/web/src/content/docs/_meta.ts` and `apps/web/src/content/docs/troubleshooting/_meta.ts`
- two blog MDX posts under `apps/web/src/content/blog/`, which are out of scope for deletion

Current docs runtime inventory:

- `apps/web/src/app/(marketing)/docs/layout.tsx`
- `apps/web/src/app/(marketing)/docs/[[...mdxPath]]/page.tsx`
- `apps/web/src/app/(marketing)/docs/_components/`
- `apps/web/src/app/(marketing)/docs/_lib/`
- `apps/web/src/app/(marketing)/docs/_server/docs-content.ts`
- `apps/web/src/app/(marketing)/docs/_styles/docs-theme.css`

Known docs-specific test files include `docs-content-loader.test.ts`, `docs-page-paths.test.ts`, `docs-metadata.test.ts`, `docs-navigation-components.test.tsx`, `docs-disabled-state.test.tsx`, and `public-theme-toggle.test.tsx`.

## Interfaces and Dependencies

The Program depends on the Next.js App Router route tree under `apps/web/src/app/(marketing)/`, MDX support in `apps/web/next.config.ts`, public content inventory code in `apps/web/src/app/_content/public-content-inventory.ts`, sitemap/robots metadata routes, product route config, markdown metadata tooling, and active Program/ExecPlan docs that currently reference the public docs corpus.

The child ExecPlan must read `apps/web/AGENTS.md`, `apps/web/ARCHITECTURE.md`, `apps/web/CONVENTIONS.md`, the relevant installed Next.js route docs under `node_modules/next/dist/docs/`, `docs/release-workflow.md`, and the completed T3 Code source design-system Program before changing route structure or public UI code.
