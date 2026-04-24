---
title: Remove Runtime Footguns
status: active
created_at: 2026-04-23
completed_at: null
summary: Remove recurring runtime failure classes around client observability, bonus lesson tracking, Codex API imports, sitemap dependencies, and docs route behavior.
post_build_recap: null
read_when:
  - Resuming runtime hardening work.
  - Investigating recurring client observability, Codex route, public metadata, or bonus lesson incidents.
  - Validating the second Ship by Sunday recovery slice.
program_id: sbs-codebase-recovery
planning_brief: docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md
---

# Remove Runtime Footguns

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the runtime hardening path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The runtime should fail in ordinary, diagnosable ways. The review found recurring classes where the app can instead produce self-amplifying telemetry noise, auth timing failures, bundling crashes, or public-route breakage caused by heavy dependency graphs. After this plan, client error reporting should not create new unhandled errors, bonus lesson viewed tracking should not depend on client Convex auth hydration, Codex API routes should not crash from fragile imports, and public metadata routes should have smaller, explicit runtime boundaries.

This plan is the second child slice of the Program packet at `docs/programs/active/2026-04-23-sbs-codebase-recovery/`, written from `planning-brief-1.md`.

## Progress

- [x] 2026-04-23 EDT: Identified runtime footguns from the read-only review and prior incident patterns.
- [ ] Harden client observability browser transport.
- [ ] Move bonus lesson viewed tracking to an authenticated server write path.
- [ ] Replace fragile Codex route dynamic imports.
- [ ] Reduce public sitemap dependencies and make docs route behavior explicit.
- [ ] Run focused runtime tests, route smoke where practical, and repo closeout checks.

## Surprises & Discoveries

The review found that several known incident patterns still exist together. None of them requires a product redesign. They are boundary problems: client reporting should be safe when offline, server writes should own auth-sensitive mutations, route handlers should import stable server modules, and public metadata routes should avoid private or heavy graphs.

## Decision Log

Decision: Keep runtime hardening separate from route-contract reconciliation.
Rationale: These fixes should make current behavior stable without first deciding the product route model.
Date: 2026-04-23

Decision: Prefer server-authenticated bonus lesson tracking over a client Convex mutation.
Rationale: The failure mode is an auth hydration race. Moving the write to a server boundary removes the race instead of hiding it with retries.
Date: 2026-04-23

Decision: Keep telemetry transport fire-and-forget.
Rationale: Observability must never create user-visible failures or recursive unhandled rejections.
Date: 2026-04-23

## Outcomes & Retrospective

This plan is active. Fill this section after implementation with the exact runtime failure classes removed, the commands that passed, and any live smoke that could not run.

## Context and Orientation

The runtime surfaces in scope are distributed across client observability, course lesson tracking, App Router route handlers, and public metadata routes. The main review seams are `apps/web/features/observability/lib/client-error-report.ts`, `apps/web/features/course/lesson/components/bonus-lesson-view-tracker.tsx`, `apps/web/app/api/codex/*/route.ts`, `apps/web/app/sitemap.ts`, and `apps/web/app/docs/[[...mdxPath]]/page.tsx`.

Client observability reports browser errors to the app. Bonus lesson view tracking marks bonus lessons viewed. Codex routes expose local app-server behavior through route handlers. Sitemap and docs routes are public surfaces and should keep their dependency graph small.

### In Scope

In scope is hardening browser error-report fetches, adding or using a server-authenticated path for bonus lesson viewed tracking, replacing fragile dynamic Codex route imports with stable imports or a shared server boundary, reducing sitemap dependency graph risk, and making docs catch-all static behavior explicit.

### Out Of Scope

Out of scope is redesigning the lesson experience, changing the product route contract, refactoring all App Router layouts, replacing the observability data model, or changing public marketing content beyond what is needed for runtime stability.

## Plan of Work

Start with observability transport because it is the smallest and safest runtime fix. Update the fallback fetch path so it is explicitly fire-and-forget and catches network failures. Add a focused test around the helper if an existing test seam exists; otherwise add one at the smallest module boundary.

Next move bonus lesson viewed tracking to a server-authenticated write. Add a route handler or server action that authenticates the viewer and calls the existing Convex mutation or a new server-side mutation helper. Update the client tracker to call the server boundary instead of `useMutation` on mount. Keep the component focused on lifecycle triggering, not auth ownership.

Then update Codex API route imports. Replace `import(/* turbopackIgnore */ "@/features/codex/server/app-server")` patterns with static imports or a single stable server module that Next can bundle predictably. Test that unauthorized requests produce normal auth responses rather than module errors.

Finally simplify public metadata routes. Keep `apps/web/app/sitemap.ts` dependent only on what it needs to generate URLs and last-modified data. Set explicit docs catch-all behavior in `apps/web/app/docs/[[...mdxPath]]/page.tsx` so the route does not rely on hidden defaults.

## Milestones

Milestone 1 makes observability transport safe. At the end, failed client error reporting cannot create another unhandled client error, and a focused test or manual proof demonstrates that failure is swallowed.

Milestone 2 moves bonus lesson tracking to a server boundary. At the end, the client no longer uses Convex auth timing to mark viewed state, and tests or a route probe prove unauthorized and authorized behavior.

Milestone 3 stabilizes Codex route imports. At the end, the route handlers no longer use fragile dynamic alias imports, and unauthenticated probes return normal responses.

Milestone 4 hardens public metadata routes. At the end, sitemap and docs route behavior is explicit and covered by focused tests or build-backed proof.

Milestone 5 validates the runtime slice. At the end, focused tests, build or route probes, plan lint, markdown lint, and repo quality checks have passed or blockers are recorded.

## Concrete Steps

1. Confirm the current touched files and avoid reverting unrelated dirty work:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short

2. Add a focused test for failed client error reporting if no equivalent exists. Then update `apps/web/features/observability/lib/client-error-report.ts` so every browser `fetch` path catches failures.

3. Inspect `apps/web/convex/_generated/ai/guidelines.md` before changing Convex code. Add the narrow server route or helper needed for bonus lesson viewed tracking, then update `BonusLessonViewTracker` to call it.

4. Replace the Codex API route dynamic imports with static imports or a shared route handler factory. Run focused request tests if they exist, or add route-level tests around unauthorized behavior.

5. Slim `apps/web/app/sitemap.ts` imports and set explicit docs catch-all behavior. Verify the metadata routes through build-backed tests or route probes.

6. Run focused validation:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run --cwd apps/web test:unit -- tests/unit/client-error-report.test.ts
       bun run --cwd apps/web typecheck

   If the named test does not exist after implementation, run the actual focused test files added for observability, bonus lesson tracking, Codex route handlers, sitemap, and docs routing.

7. Run plan and closeout validation:

       cd /Users/parkerrex/Developer/ship-by-sunday
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

## Validation and Acceptance

This slice is complete when failed client observability requests are swallowed, bonus lesson viewed tracking is server-authenticated, Codex routes no longer depend on fragile dynamic alias imports, sitemap and docs public routes have explicit low-risk runtime boundaries, and focused tests or route probes prove the behavior.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       bun run --cwd apps/web typecheck
       bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md
       git diff --check
       bun run format
       bun run lint
       bun run typecheck

Also run the focused test files added or touched by this slice. Record the exact commands in `Progress` before closing the plan.

## Idempotence and Recovery

The observability and route-handler changes should be additive and safe to rerun. Server-side bonus lesson tracking must not double-count or fail if the lesson is already marked viewed. If public metadata changes break the build, back out the dependency graph change and keep the explicit route behavior until a smaller import boundary is identified.

## Artifacts and Notes

Program source for this plan:

       docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md

High-signal files from the review:

       apps/web/features/observability/lib/client-error-report.ts
       apps/web/features/course/lesson/components/bonus-lesson-view-tracker.tsx
       apps/web/app/api/codex/
       apps/web/app/sitemap.ts
       apps/web/app/docs/[[...mdxPath]]/page.tsx

## Interfaces and Dependencies

This plan depends on Next App Router route-handler behavior, the hosted Convex dev model, Clerk authentication, and the existing course and observability APIs. Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md` as required by the repo.
