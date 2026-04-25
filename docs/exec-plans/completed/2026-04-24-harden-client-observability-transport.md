---
title: Harden Client Observability Transport
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Make browser client error reporting best-effort so rejected fallback fetches cannot create another unhandled client error.
post_build_recap: The browser fallback fetch path now catches rejected sends, and the focused observability unit test proves rejected client error reporting stays best-effort.
read_when:
  - Resuming the first runtime boundary hardening child slice.
  - Validating client observability transport behavior.
program_id: sbs-runtime-boundary-hardening
planning_brief: docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md
---

# Harden Client Observability Transport

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the client observability transport path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Browser error reporting should explain failures without creating another failure. After this slice, a rejected browser `fetch` from the client error-report path is swallowed as a best-effort observability failure, and a focused unit test proves that rejected fallback sends do not surface as unhandled rejections.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md`.
- [x] 2026-04-24 EDT: Inspected `apps/web/features/observability/lib/client-error-report.ts` and `apps/web/tests/unit/observability-client-report.test.ts`.
- [x] 2026-04-24 EDT: Added a rejected-fetch regression test for the fallback transport.
- [x] 2026-04-24 EDT: Updated the browser fallback fetch path to catch rejected sends with `.catch(() => undefined)`.
- [x] 2026-04-24 EDT: Focused observability test passed: `bun run --cwd apps/web test:unit -- tests/unit/observability-client-report.test.ts`.
- [x] 2026-04-24 EDT: Closeout checks: `bun run format:check`, `bun run lint`, `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-harden-client-observability-transport.md`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-harden-client-observability-transport.md docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/program.md`, `bun run programs:lint`, and `git diff --check` passed. `bun run typecheck` failed on unrelated untracked route-contract work at `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts:51`.

## Surprises & Discoveries

The source brief records the Codex guidance that telemetry should be a bounded, warning-only side channel. The local test seam was already present in `apps/web/tests/unit/observability-client-report.test.ts`; the implementation only needed one rejected-promise regression and explicit test cleanup with `vi.unstubAllGlobals()`.

## Decision Log

Decision: Keep this slice limited to browser transport failure handling.
Rationale: Observability storage, export, and release intake contracts belong to other plans. This slice only proves that client reporting is best-effort.
Date: 2026-04-24

## Outcomes & Retrospective

The fallback browser transport in `apps/web/features/observability/lib/client-error-report.ts` now catches rejected `fetch` sends and ignores them as observability-only failures. `apps/web/tests/unit/observability-client-report.test.ts` now covers the rejected fallback path, and the focused unit test passes with three assertions covering beacon, fetch fallback, and rejected fallback behavior. No observability storage, export, or intake behavior changed.

## Context and Orientation

The likely implementation seam is `apps/web/features/observability/lib/client-error-report.ts`. The focused regression should live in or near `apps/web/tests/unit/observability-client-report.test.ts`.

The intended behavior is simple: when browser error reporting falls back to `fetch`, a network rejection must be caught and ignored. Reporting may fail, but it must not throw into the user flow or create an `unhandledrejection`.

### In Scope

In scope is the browser client error-report transport, rejected fallback fetch handling, and the smallest focused test that proves rejected sends are swallowed.

### Out Of Scope

Out of scope is redesigning observability storage, changing Convex observability models, changing release or runtime intake exports, or broadening telemetry semantics beyond best-effort browser sending.

## Plan of Work

Start by reading `apps/web/features/observability/lib/client-error-report.ts` and the current unit test file. Identify every browser `fetch` path that can reject. Add a focused test that stubs `fetch` to reject and verifies the report call resolves without producing an unhandled rejection. Then update the transport so every fallback send catches failures with an explicit best-effort handler such as `.catch(() => undefined)`.

## Milestones

Milestone 1 captures the regression. At the end, the test fails or would fail against a rejected fallback fetch that is not caught.

Milestone 2 implements best-effort transport handling. At the end, rejected client reporting fetches are caught and the focused test passes.

Milestone 3 validates the slice. At the end, the observability test, this plan lint, markdown lint, and whitespace diff check pass.

## Concrete Steps

1. Confirm the worktree and inspect the current files:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short
       sed -n '1,220p' apps/web/features/observability/lib/client-error-report.ts
       sed -n '1,220p' apps/web/tests/unit/observability-client-report.test.ts

2. Add the rejected-fetch regression to `apps/web/tests/unit/observability-client-report.test.ts`.

3. Update `apps/web/features/observability/lib/client-error-report.ts` so browser fallback fetch failures are caught and ignored as observability-only failures.

4. Run focused validation and record the exact results in this plan.

## Validation and Acceptance

This slice is complete when rejected browser error-report fetches are caught, the focused regression proves no unhandled rejection escapes, and no broader observability behavior is changed.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       bun run --cwd apps/web test:unit -- tests/unit/observability-client-report.test.ts
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-harden-client-observability-transport.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-harden-client-observability-transport.md
       git diff --check

## Idempotence and Recovery

The change should be safe to rerun because it only tightens error handling around an existing send path. If the focused test reveals a different test filename, update this plan with the real path before continuing. If the fetch catch hides a useful local development warning, prefer a warning-only branch that still never rejects.

## Artifacts and Notes

Program source:

       docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md

Source brief:

       docs/exec-plans/completed/2026-04-23-remove-runtime-footguns.md

Focused validation:

       bun run --cwd apps/web test:unit -- tests/unit/observability-client-report.test.ts

Result: passed with 1 test file and 3 tests.

Closeout validation:

       bun run format:check
       bun run lint
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-harden-client-observability-transport.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-harden-client-observability-transport.md docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/program.md
       bun run programs:lint
       git diff --check

Result: passed.

       bun run typecheck

Result: failed outside this slice after the Next build compiled. The TypeScript error is in unrelated untracked route-contract work at `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts:51`, where `LegacyBlueprintRoute` can index `sectionByLegacyStep` with a route that has no key.

## Interfaces and Dependencies

This plan depends on the browser `fetch` API, the existing client observability helper, and the web app unit test runner. It must preserve the invariant that observability is a side channel and cannot block or fail user behavior.
