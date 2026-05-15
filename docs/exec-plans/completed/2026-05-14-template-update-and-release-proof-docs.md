---
title: Template Update And Release Proof Docs
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Close the Starter template source and billing proof Program by documenting template-source updates, direct template downloads, and product-specific billing proof operations.
post_build_recap: Durable docs now describe the signed direct generated Starter template route, the billing proof docs require product-specific proof and the Convex sync boundary preflight, and the Program packet plus closeout plans are in the completed lane.
program_id: starter-template-source-and-billing-proof
planning_brief: docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/planning-brief-7.md
read_when:
  - Resuming Program closeout for Starter template source and billing proof.
  - Updating direct Starter template download docs.
  - Changing release proof, billing proof, or template-source update guidance.
---

# Template Update And Release Proof Docs

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The Program has shipped its code paths: billing proof can target Starter or Workers, generated repos are built from pinned template source, the generated Starter app is a ChatGPT-style BYO OpenAI starter, and the direct no-questions template route uses the same compiler pipeline with default facts. This closeout slice makes the durable docs match those shipped contracts so future agents do not accidentally reintroduce static zip drift, mutable template fetches, or Starter-only billing proof.

## Progress

- [x] 2026-05-14 EDT: Created this closeout ExecPlan from planning brief 7.
- [x] 2026-05-14 EDT: Documented the direct generated template route in builder docs.
- [x] 2026-05-14 EDT: Verified the billing proof docs and workflow updates now require the Convex billing sync boundary preflight and no longer treat `charge.refunded` as a product-state sync event.
- [x] 2026-05-14 EDT: Completed the direct-download child ExecPlan and moved it to the completed lane.
- [x] 2026-05-14 EDT: Completed the Program packet, moved it to the completed lane, and updated Program indexes.
- [x] 2026-05-14 EDT: Ran focused docs, plan, Program, direct-download, billing, and repo validation.

## Surprises & Discoveries

The in-app Browser plugin could not be used because the required Node control tool was not available in this session. A fallback Playwright check against `next start` opened `/starter/home` at desktop and mobile viewport sizes, but both unauthenticated requests correctly redirected to `/sign-in`; the exact protected Starter Home card remains covered by the rendered markup unit test rather than a live authenticated screenshot.

## Decision Log

Decision: Document the direct template path as generated output, not as a package artifact.
Rationale: The generator remains the source of truth for customer repo downloads. Future template updates must flow through template source, manifest provenance, generated overlays, and tests instead of replacing the dynamic path with a static zip.
Date: 2026-05-14.

Decision: Treat refund webhooks as deferred billing reconciliation work.
Rationale: The current trusted billing sync boundary grants and updates access from checkout, subscription, invoice, and entitlement state. Listening to `charge.refunded` without a product-state reconciliation path would create false proof confidence, so refund events should be added only when refund handling updates real entitlements or access state.
Date: 2026-05-14.

## Outcomes & Retrospective

Completed on 2026-05-14. The signed direct generated template route is documented in route-map and Starter docs, the direct-download ExecPlan is complete, and the Program packet records the final shipped contracts before moving to the completed lane. Billing proof docs and release workflow material now describe both offer-specific proof and the Convex billing sync boundary preflight.

Validation passed: direct-download compiler zip tests, direct route integration test, Starter Home markup test, Stripe billing webhook tests, billing sync boundary tests, release proof workflow tests, both closeout ExecPlan lints, Program lint, targeted markdown metadata lint, `git diff --check`, `bun run format`, `bun lint`, and `bun typecheck`. Fallback browser proof confirmed unauthenticated desktop and mobile requests to `/starter/home` redirect to sign-in; authenticated visual proof was blocked by lack of a browser session.

## Context and Orientation

Template-source ownership lives under `templates/starter-app/`. `templates/starter-app/source` is the pinned app source snapshot, and `templates/starter-app/template-source.json` records the version, digest, file count, and allowed generated overlays. The compiler validates and materializes that source through `packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts` and `packages/codebase-compiler/src/repo-generation/materialize-starter-template-source.ts`.

The direct template route is `apps/web/src/app/api/download/starter-template/route.ts`. Starter Home signs a short-lived download URL after access succeeds, and the route calls compiler-owned default facts and `buildReviewDownloadZip` so it produces the same generated repo shape as the authenticated Review download without requiring questionnaire state or live provider calls.

Billing proof is app-owned. The relevant release proof and preflight surfaces are `.github/workflows/dev-staging-payment-proof.yml`, `.github/workflows/production-release-proof.yml`, `apps/web/scripts/lib/release-billing-doctor.mjs`, `apps/web/scripts/verify-managed-stripe-env.ts`, `apps/web/src/platform/billing/managed-stripe-config.ts`, `docs/release-workflow.md`, and `apps/web/src/content/docs/stripe-checkout-webhook.mdx`.

### In Scope

Close the direct-download ExecPlan, add the final docs closeout ExecPlan, update the Program packet and indexes, document the direct generated template path, preserve billing proof docs for both offers, and record validation evidence.

### Out Of Scope

Do not change pinned template source, mutate `templates/starter-app/template-source.json`, add live provider requirements to direct downloads, change checkout UX, or weaken authenticated Review download readiness checks in this closeout slice.

## Plan of Work

First, update builder docs so `/starter/home` and `GET /api/download/starter-template` are part of the durable route contract. Then complete the direct-download ExecPlan with its implementation and validation evidence. Next, add this closeout plan to the Program ledger and move the Program from active to completed with current planning brief 7 preserved beside the packet. Finally, run focused direct-download, billing, Program, docs, format, lint, and typecheck gates.

## Milestones

The first milestone is docs alignment. It is complete when route-map and Starter docs describe the direct route as generated-on-demand output from default facts and pinned source.

The second milestone is plan and Program closeout. It is complete when the direct-download ExecPlan, this closeout plan, and the Program packet are complete and their paths match the completed lane.

The third milestone is validation. It is complete when focused direct-download tests, billing preflight tests, plan lint, Program lint, docs lint, format, lint, and typecheck have run or a concrete blocker is recorded.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Run focused validation before completion:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-direct-download.test.ts tests/review-download-zip.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/codebase-download-routes.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/stripe-billing-webhooks.test.ts tests/unit/stripe-line-item.test.ts tests/unit/release-billing-doctor.test.ts tests/unit/convex-billing-sync-preflight.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/stripe-billing-sync.test.ts tests/unit/convex-billing-sync-boundary.test.ts tests/unit/convex-billing-sync-preflight.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/production-release-proof-workflow.test.ts

Run docs and packet validation after moving the Program:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-add-direct-template-download-path.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-template-update-and-release-proof-docs.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-add-direct-template-download-path.md docs/exec-plans/completed/2026-05-14-template-update-and-release-proof-docs.md docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/program.md apps/web/src/content/docs/route-map.mdx apps/web/src/content/docs/how-the-starter-works.mdx docs/release-workflow.md apps/web/src/content/docs/stripe-checkout-webhook.mdx

Run broad repo gates before completion:

    bun run format
    bun lint
    bun typecheck

## Validation and Acceptance

The closeout is accepted when future maintainers can discover the direct route, template-source update rules, and billing proof expectations from durable docs, and when validation proves the direct route, generated zip parity, billing proof preflight behavior, and Program metadata are coherent.

### Test Commands

Run these commands before completion:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-direct-download.test.ts tests/review-download-zip.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/codebase-download-routes.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/stripe-billing-webhooks.test.ts tests/unit/stripe-line-item.test.ts tests/unit/release-billing-doctor.test.ts tests/unit/convex-billing-sync-preflight.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/stripe-billing-sync.test.ts tests/unit/convex-billing-sync-boundary.test.ts tests/unit/convex-billing-sync-preflight.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/production-release-proof-workflow.test.ts
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-add-direct-template-download-path.md
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-template-update-and-release-proof-docs.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-add-direct-template-download-path.md docs/exec-plans/completed/2026-05-14-template-update-and-release-proof-docs.md docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/program.md apps/web/src/content/docs/route-map.mdx apps/web/src/content/docs/how-the-starter-works.mdx docs/release-workflow.md apps/web/src/content/docs/stripe-checkout-webhook.mdx
    bun run format
    bun lint
    bun typecheck

## Idempotence and Recovery

Docs and Program moves are idempotent when paths and indexes agree. If Program lint fails after the move, first check that child ExecPlans point at the completed Program packet and that `current-planning-brief.txt` points at `planning-brief-7.md`. If docs lint fails, fix frontmatter or stale paths without changing runtime code.

If billing proof tests fail, inspect the Convex billing sync boundary preflight before changing webhook event requirements. If direct route tests fail, inspect the compiler default facts and zip builder path before changing the route.

## Artifacts and Notes

Owning Program: `docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/program.md`.

Planning brief: `docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/planning-brief-7.md`.

Direct route: `apps/web/src/app/api/download/starter-template/route.ts`.

Billing release docs: `docs/release-workflow.md` and `apps/web/src/content/docs/stripe-checkout-webhook.mdx`.

## Interfaces and Dependencies

This plan depends on Program lint, ExecPlan lint, markdown lint, the app route tests, the codebase-compiler generated repo tests, release billing doctor tests, Stripe webhook tests, Convex billing sync boundary preflight tests, and the repo-level format, lint, and typecheck gates.
