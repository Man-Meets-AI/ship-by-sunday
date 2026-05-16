---
title: "Public Docs Retirement Normalized Pass"
summary: "Normalized work tracks and boundary rules for retiring public docs while preserving blog and setup truth."
docType: "normalized_pass"
status: "active"
read_when:
  - "Turning the public docs research into implementation slices."
  - "Checking the boundary between public docs deletion and setup-truth preservation."
---

# Public Docs Retirement Normalized Pass

## Track 1: Setup Truth Extraction

Move only durable setup truth out of public MDX before deletion. The required topics are environment variables, local setup, local QA, Clerk/Convex auth, Stripe checkout/webhooks, Vercel deploy, Cal.com Worker Seal Team 6 setup, Telegram support bot setup, and route/provider contracts.

The target is non-public repo truth, not a replacement public docs site. Prefer `docs/internal/` and existing release/provider docs.

## Track 2: Public Docs Runtime Removal

Remove the `/docs` route tree, docs components, docs CSS, docs helpers, docs MDX loader, docs content corpus, docs `_meta.ts` files, and docs disabled-state behavior. Do not keep a token disabled public route unless implementation proves a hard removal breaks an external contract.

## Track 3: Shared Content And Metadata Cleanup

Make public content inventory blog-only where appropriate. Remove docs sitemap exports, docs metadata builders, docs navigation entries, and docs route config. Keep blog route generation, blog metadata, blog sitemap entries, and blog MDX validation.

## Track 4: Test And Tooling Cleanup

Delete docs-specific tests. Rewrite shared tests around the surviving blog/public route contract. Remove or retire the markdown metadata docs family once `apps/web/src/content/docs/` is gone.

## Track 5: Active Docs Sync

Update active Program, ExecPlan, release, reliability, and design-doc script references that still point at public docs MDX. Historical completed plans can remain as history unless they are active guidance for the current slice.

## Boundary Rules

Blog MDX stays.

No public docs replacement site.

No Telegram widget implementation.

No Starter preview implementation.

No checkout or entitlement rewrites except removing stale docs links or tests.

No generated repo redesign.

No broad docs cleanup outside references that would become false after public docs deletion.

## Normalized Acceptance

The Program is complete when the app has no public docs route or docs MDX corpus, blog still renders, setup truth survives in non-public durable docs, route metadata is intentional, and validation passes for the changed surfaces.
