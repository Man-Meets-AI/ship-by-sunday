---
title: Server-Own Bonus Lesson View Tracking
status: complete
created_at: 2026-04-24
completed_at: 2026-04-24
summary: Move bonus lesson viewed tracking behind a server-authenticated boundary so client Convex auth hydration no longer owns the write.
post_build_recap: Bonus lesson viewed tracking now posts to a server-authenticated route that calls Convex with a Clerk-derived token, and focused route plus UI tests prove the boundary.
read_when:
  - Resuming the bonus lesson tracking runtime boundary slice.
  - Changing bonus lesson viewed tracking or related tests.
program_id: sbs-runtime-boundary-hardening
planning_brief: docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md
---

# Server-Own Bonus Lesson View Tracking

This is a living execution plan. Keep it current as implementation, proof, and discoveries change bonus lesson viewed tracking.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Bonus lesson viewed tracking should not depend on client Convex auth hydration timing. After this slice, the browser component triggers a best-effort viewed event, but the authenticated server boundary owns validation, identity, and the write.

## Progress

- [x] 2026-04-24 EDT: Created this child ExecPlan from `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md`.
- [x] 2026-04-24 EDT: Read `qa/AGENTS.md`, `apps/web/convex/_generated/ai/guidelines.md`, and the current tracker, mutation, and test surfaces before editing.
- [x] 2026-04-24 EDT: Added a server-authenticated route at `apps/web/app/api/course/bonus-lesson-viewed/route.ts` backed by `apps/web/features/execute-ship/server/bonus-lesson-view-tracking.ts`.
- [x] 2026-04-24 EDT: Moved client ownership to a fetch trigger; `BonusLessonViewTracker` no longer imports `useConvexAuth`, `useMutation`, or `api.course.markBonusLessonViewed`.
- [x] 2026-04-24 EDT: Added `apps/web/tests/integration/bonus-lesson-viewed-route.test.ts` and updated `apps/web/tests/integration-ui/bonus-lesson-view-tracker.test.tsx`.
- [x] 2026-04-24 EDT: Focused validation passed: `bun run --cwd apps/web test:integration:node -- tests/integration/bonus-lesson-viewed-route.test.ts` and `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/bonus-lesson-view-tracker.test.tsx`.
- [x] 2026-04-24 EDT: Closeout checks: `bun run format:check`, `bun run lint`, `bun run qa:validate`, `bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-server-own-bonus-lesson-view-tracking.md`, `bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-server-own-bonus-lesson-view-tracking.md docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/program.md`, `bun run programs:lint`, and `git diff --check` passed. `bun run typecheck` failed on unrelated untracked route-contract work at `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts:54`.

## Surprises & Discoveries

The source brief corrected the live tracker path to `apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx`. The actual Convex write path is `api.course.markBonusLessonViewed`, implemented by `markBonusLessonViewedHandler` in `apps/web/convex/course/bonusMission.ts`. The new server route calls that existing idempotent mutation through `fetchMutation` with the Clerk-derived Convex token.

The repo did not have local Next docs at `apps/web/node_modules/next/dist/docs/`, so the route-handler convention was checked against the official Next.js route-handler reference. Route handlers are `route.ts` files under `app/` and export functions for HTTP methods such as `POST`.

## Decision Log

Decision: Move write ownership to the server boundary.
Rationale: The failure mode is an auth hydration race. Server authentication removes the race instead of hiding it behind client retries.
Date: 2026-04-24

## Outcomes & Retrospective

Bonus lesson viewed tracking now has a server-authenticated boundary at `/api/course/bonus-lesson-viewed`. The route validates `lessonKey`, requires Clerk auth, fetches a Convex token with the repo's configured `convex` template, and calls `api.course.markBonusLessonViewed` server-side. The client tracker now posts to that route and treats auth, locked access, missing lesson, and malformed input as terminal responses while keeping network failures non-blocking. No lesson UI, entitlement policy, or unrelated course tracking write changed.

## Context and Orientation

The live client component is `apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx`. The existing UI test is `apps/web/tests/integration-ui/bonus-lesson-view-tracker.test.tsx`. Convex code must follow `apps/web/convex/_generated/ai/guidelines.md` and must use hosted Convex dev, not local Convex mode.

The server boundary can be a route handler or server action, but it must authenticate the viewer before writing. The client component should trigger the viewed event and handle failure as non-blocking UI telemetry, not as ownership of auth state.

### In Scope

In scope is one server-authenticated bonus lesson viewed write boundary, the client tracker update, focused tests for unauthorized and valid behavior, and preservation of idempotent viewed tracking.

### Out Of Scope

Out of scope is redesigning the lesson UI, changing entitlement policy, changing unrelated course progress models, or converting other course tracking writes.

## Plan of Work

First read the Convex guidelines. Then inspect the current component, its existing Convex mutation, and the integration UI test. Add a narrow server boundary that validates the lesson key, authenticates the viewer, and calls the existing idempotent mutation or a new server-side helper. Update the client component so it no longer calls `useConvexAuth` or owns the Convex mutation. Finally add focused tests for unauthorized, malformed, valid, and already-viewed behavior where the existing test seams allow it.

## Milestones

Milestone 1 identifies the current write path. At the end, the plan records the actual mutation or helper that marks a bonus lesson viewed.

Milestone 2 introduces the server boundary. At the end, the server validates input and identity before writing.

Milestone 3 updates the client trigger. At the end, the client component no longer owns Convex auth hydration for the viewed write.

Milestone 4 validates the slice. At the end, focused route or UI tests and plan checks pass.

## Concrete Steps

1. Confirm the worktree and read required Convex guidance:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short
       sed -n '1,220p' apps/web/convex/_generated/ai/guidelines.md

2. Inspect the current tracker and tests:

       sed -n '1,240p' apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx
       sed -n '1,240p' apps/web/tests/integration-ui/bonus-lesson-view-tracker.test.tsx

3. Add the narrow server-authenticated boundary and focused route tests.

4. Update the client tracker to call the server boundary and keep failures non-blocking.

5. Run focused validation and record the exact results in this plan.

## Validation and Acceptance

This slice is complete when bonus lesson viewed writes are authenticated on the server, the client no longer depends on Convex auth hydration to own the write, valid writes remain idempotent, and unauthorized or malformed requests fail explicitly.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       bun run --cwd apps/web test:integration:ui -- tests/integration-ui/bonus-lesson-view-tracker.test.tsx
       bun run --cwd apps/web test:integration:node -- tests/integration/bonus-lesson-viewed-route.test.ts
       bun run --cwd apps/web typecheck
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-server-own-bonus-lesson-view-tracking.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-server-own-bonus-lesson-view-tracking.md
       git diff --check

The focused route and UI tests passed. `bun run typecheck` remains part of closeout validation, but this worktree already had an unrelated route-contract type error before this slice.

## Idempotence and Recovery

The viewed write must be safe to retry. If implementation starts with a route handler and later finds an existing server action pattern for this feature, update the plan before switching. If hosted Convex dev is unavailable, stop and record the limitation instead of switching to Convex local mode.

## Artifacts and Notes

Program source:

       docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/planning-brief-1.md

High-signal files:

       apps/web/features/execute-ship/components/bonus-lesson-view-tracker.tsx
       apps/web/features/execute-ship/lib/bonus-lesson-view-contract.ts
       apps/web/features/execute-ship/server/bonus-lesson-view-tracking.ts
       apps/web/app/api/course/bonus-lesson-viewed/route.ts
       apps/web/tests/integration-ui/bonus-lesson-view-tracker.test.tsx
       apps/web/tests/integration/bonus-lesson-viewed-route.test.ts
       apps/web/convex/_generated/ai/guidelines.md

Focused validation:

       bun run --cwd apps/web test:integration:node -- tests/integration/bonus-lesson-viewed-route.test.ts

Result: passed with 1 test file and 4 tests.

       bun run --cwd apps/web test:integration:ui -- tests/integration-ui/bonus-lesson-view-tracker.test.tsx

Result: passed with 1 test file and 3 tests.

Closeout validation:

       bun run format:check
       bun run lint
       bun run qa:validate
       bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-24-server-own-bonus-lesson-view-tracking.md
       bun run markdown:lint -- --paths docs/exec-plans/completed/2026-04-24-server-own-bonus-lesson-view-tracking.md docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/program.md
       bun run programs:lint
       git diff --check

Result: passed.

       bun run typecheck

Result: failed outside this slice after the Next build compiled. The TypeScript error is in unrelated untracked route-contract work at `apps/web/features/blueprint-flow/lib/legacy-blueprint-route-redirects.ts:54`, where `LegacyBlueprintRoute` can index `sectionByLegacyStep` with a route that has no key.

## Interfaces and Dependencies

This plan depends on Clerk authentication, hosted Convex dev behavior, the existing bonus lesson viewed mutation or helper, and the web app integration UI test runner.
