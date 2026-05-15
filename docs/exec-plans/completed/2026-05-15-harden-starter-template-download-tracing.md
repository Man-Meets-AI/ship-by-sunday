---
title: Harden Starter Template Download Tracing
status: complete
created_at: 2026-05-15
completed_at: 2026-05-15
summary: Keep generated repo download tracing and starter source validation from walking or bundling ignored template artifacts.
post_build_recap: Download tracing now uses safe template root files and top-level source globs plus route-specific directory excludes, the source walker prunes excluded directories before recursion, and stale starter source tests now match the Northstar surface.
read_when:
  - Resuming post-review hardening for starter template downloads.
  - Validating generated repo trace inputs.
  - Checking starter template source test failures.
---

# Harden Starter Template Download Tracing

This document is a living execution plan for hardening the starter template download path after PR review.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Generated repo and direct starter downloads are built from the pinned starter template source. The current review found that the Next.js file tracing input can include ignored local template artifacts such as `.next`, `node_modules`, or local env files, and that the source walker still descends into excluded directories before filtering them out. After this fix, a local template install or build should not slow download verification or risk packaging ignored artifacts with the download routes.

## Progress

- [x] 2026-05-15: Read the compiler owner instructions, Next.js output tracing docs, and the failing review findings.
- [x] 2026-05-15: Change trace includes and source walking so ignored template artifacts are skipped before tracing or recursing.
- [x] 2026-05-15: Update stale starter template source tests and refresh the pinned digest.
- [x] 2026-05-15: Run focused template, compiler, plan, and repo validation.

## Surprises & Discoveries

Next.js `outputFileTracingIncludes` values are glob patterns resolved from the app project root, and broad globs under `../../templates/starter-app/source/**/*` include ignored local build and dependency directories when they exist in this checkout.

The starter template source manifest excludes `.git`, `.next`, `.vercel`, `coverage`, `node_modules`, and `test-results`, but the current recursive walker only filters after walking those directories.

The first exact-file tracing implementation kept ignored artifacts out, but Next's trace glob handling missed route-group and dynamic-segment files such as `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`. The final implementation traces exact root files and safe top-level source directories, then applies route-specific excludes for ignored directories.

## Decision Log

Decision: Trace exact template root files and safe top-level source directories instead of using one broad source-root glob. Rationale: this includes route-group and dynamic-segment files reliably while avoiding root-level ignored directories such as `.next` and `node_modules`; route-specific excludes backstop ignored directories if they appear under traced source folders. Date: 2026-05-15.

Decision: Update the starter template tests to match the current product-first Northstar surface rather than restoring old open-source/GitHub copy. Rationale: the rendered source already intentionally uses the T3/Northstar marketing structure, so the tests were stale. Date: 2026-05-15.

## Outcomes & Retrospective

This plan completed the PR review hardening. `packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts` now prunes excluded path segments before recursion and exposes sync listing for server-only trace setup. `packages/codebase-compiler/src/repo-generation/repo-download-trace-includes.ts` keeps Node-backed trace construction out of browser-shared compiler imports while giving Next the template manifest, root files, top-level source globs, and ignored-directory excludes. The starter template tests now assert the current Northstar sections and footer copy, and the template digest is current at `sha256-6681c4e9492ea7cb07634a9beb7d8c656b2dec556e939b8fe01c7f35fff79c0c`.

## Context and Orientation

The traced download routes are configured in `apps/web/next.config.ts` through `repoDownloadTraceIncludes`, which comes from `packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts`. The source verifier and file lister live in `packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts`. The starter app source tests live under `templates/starter-app/source/src`.

### In Scope

This plan covers compiler tracing inputs, starter template source directory pruning, focused compiler tests, stale starter template tests, and the starter source manifest digest needed by those test edits.

### Out Of Scope

This plan does not change generated repo shape, billing behavior, auth behavior, checkout proof, provider setup, or vendored `repos/effect` files.

## Plan of Work

First, update `starter-template-source-contract.ts` so async and sync source listing skip excluded path segments before recursing. Then update download tracing so it includes the manifest, exact template root files, and safe top-level source directories rather than a catch-all source-root glob. Next, update the stale marketing and public chrome tests in the starter source to assert the current rendered sections and footer copy. Finally, recompute the template source digest and update the manifest and tests.

## Milestones

Milestone 1 hardens tracing and source listing. It is complete when focused compiler tests prove ignored template artifacts are not traced or walked.

Milestone 2 repairs the starter template source tests. It is complete when `bun run test` passes inside `templates/starter-app/source` and the pinned digest is current.

Milestone 3 validates and closes the PR review loop. It is complete when focused checks, repo gates, and the codex review loop pass or only report explicitly ignored vendored `repos/effect` noise.

## Concrete Steps

Run focused compiler and starter-template tests from the repository root:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts tests/starter-template-source-materialization.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts
    cd templates/starter-app/source && bun run test

Then run the plan and repo gates:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-harden-starter-template-download-tracing.md
    bun run format:check
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 POSTHOG_API_KEY= POSTHOG_PROJECT_ID= bun typecheck

## Validation and Acceptance

Acceptance is observable when trace include tests show no broad `templates/starter-app/source/**/*` glob and no ignored template artifacts, source-list tests prove excluded directories are pruned before recursion, the starter app test suite is green, and the review loop no longer reports the three findings that triggered this plan.

### Test Commands

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts tests/starter-template-source-materialization.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts
    cd templates/starter-app/source && bun run test
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-15-harden-starter-template-download-tracing.md
    bun run format:check
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 POSTHOG_API_KEY= POSTHOG_PROJECT_ID= bun typecheck
    git diff --check HEAD -- ':!repos/effect'

## Idempotence and Recovery

All changes are source edits and can be rerun safely. If template digest validation fails, recompute the digest from the current `templates/starter-app/source` tree and update `templates/starter-app/template-source.json`, `packages/codebase-compiler/tests/starter-template-source-contract.test.ts`, and any closeout docs that quote the digest. If Next trace verification still shows ignored artifacts, inspect `.next/server/app/api/download/*/route.js.nft.json` after a build and tighten the trace inputs.

## Artifacts and Notes

The PR review output is recorded in `/tmp/pr224-codex-review-after-second-fix.txt` in this checkout.

Focused validation passed:

- `bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts tests/starter-template-source-materialization.test.ts tests/repo-generation.test.ts tests/review-download-zip.test.ts tests/starter-template-direct-download.test.ts tests/customer-safe-snapshot-contract.test.ts`
- `bun run --cwd apps/web test:unit -- vercel-output-tracing.test.ts`
- `cd templates/starter-app/source && bun run test`
- `bun run format:check`
- `bun lint`
- `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 POSTHOG_API_KEY= POSTHOG_PROJECT_ID= bun typecheck`

After `bun typecheck`, both `apps/web/.next/server/app/api/download/starter-template/route.js.nft.json` and `apps/web/.next/server/app/api/download/repo/route.js.nft.json` traced all 132 manifest source files with zero traced `templates/starter-app/source/node_modules`, `.next`, or `.env.local` artifacts.

## Interfaces and Dependencies

This fix depends on Next.js `outputFileTracingIncludes` semantics, the starter template manifest at `templates/starter-app/template-source.json`, the compiler server export used by `apps/web/next.config.ts`, and the starter source tests under `templates/starter-app/source`.
