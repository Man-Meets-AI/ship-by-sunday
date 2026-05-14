---
title: Add Direct Template Download Path
status: complete
created_at: 2026-05-13
completed_at: 2026-05-14
summary: Add a no-questions Starter template download route that uses the existing generated repo pipeline with default facts.
post_build_recap: Starter Home now exposes a signed direct template download action, and `GET /api/download/starter-template` generates `ai-chat-starter.zip` from compiler-owned default facts through the same dynamic repo-generation zip builder as the authenticated Review download.
program_id: starter-template-source-and-billing-proof
planning_brief: docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/planning-brief-6.md
read_when:
  - Resuming the direct Starter template download slice.
  - Changing generated repo download routes or default Starter template facts.
  - Validating that direct template downloads still use the dynamic generator.
---

# Add Direct Template Download Path

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Starter buyers can currently get the strongest generated repo only after completing the guided product questions and reaching the Review handoff. This slice adds a direct no-questions Starter template download path for the template-first track. A user should be able to request the Starter template immediately, and the response should still be generated from the same compiler, pinned template source, generated operating pack, setup ExecPlans, provenance, and no-provider-safe app contract as the Review download.

This is not a static zip. The route must build the archive on demand from default Starter template facts, and tests must prove the output still includes the template-source provenance and generated operating pack.

## Progress

- [x] 2026-05-13 EDT: Created this child ExecPlan from `planning-brief-6.md`.
- [x] 2026-05-13 EDT: Read the Program packet, Program contract, ExecPlan contract, app/compiler AGENTS files, release workflow, relevant Next.js route-handler docs, and the current review download route before editing.
- [x] 2026-05-13 EDT: Implemented the compiler-owned default Starter template project definition in `packages/codebase-compiler`.
- [x] 2026-05-13 EDT: Added signed `GET /api/download/starter-template` links and a visible `Download template` action on Starter Home.
- [x] 2026-05-13 EDT: Added focused tests for default facts, snapshot contents, zip output, route behavior, and Starter Home markup.
- [x] 2026-05-14 EDT: Updated route-map and Starter docs to describe the direct generated template path.
- [x] 2026-05-14 EDT: Updated the owning Program ledger.
- [x] 2026-05-14 EDT: Ran focused compiler, route, and Starter Home validation; broader repo gates are recorded in the Program closeout slice.

## Surprises & Discoveries

The direct route can stay provider-free because it never reads authenticated workspace state. It uses compiler-owned default facts and the same zip builder as the authenticated Review route, so direct template users receive the generated operating pack and template provenance without completing questionnaire state first.

## Decision Log

Decision: Use a new direct route instead of weakening the existing Review download route.
Rationale: `/api/download/repo` is tied to authenticated workspace state, codebase readiness, and support-mode auditing. The direct template path needs conservative default facts and should not require completing the questionnaire, so a separate route keeps the contracts clear while still using the same compiler zip builder.
Date: 2026-05-13.

Decision: Keep default template facts in `packages/codebase-compiler`.
Rationale: The generated repo contract belongs to the compiler. Keeping the default facts beside the generator lets route handlers, tests, and future CLI surfaces use the same deterministic source of truth without duplicating product defaults in the web app.
Date: 2026-05-13.

Decision: Keep the direct route provider-free and protected by a signed Starter Home link plus route-level rate limiting.
Rationale: Planning brief 6 explicitly requires no live Clerk, Convex, Stripe, or OpenAI requirements for direct downloads. Starter Home already proves product access before rendering, so a short-lived server-signed token avoids a public expensive zip endpoint while the route still uses no live provider calls and keeps a separate rate-limit bucket.
Date: 2026-05-13.

## Outcomes & Retrospective

The direct template route now ships as `GET /api/download/starter-template`. Starter Home mints a short-lived signed download URL after access succeeds, and the route builds `ai-chat-starter.zip` from compiler-owned default facts, the pinned template-source snapshot, generated overlays, generated docs, the first customer Program, setup ExecPlans, skills, validation scripts, and template provenance. Starter Home exposes the route as `Download template` while keeping the lessons path available.

Focused validation passed for the compiler default facts and zip output, the app route returning a real zip, and the Starter Home rendered link. The route remains separate from `/api/download/repo`, so the authenticated Review download keeps its workspace and readiness contract.

## Context and Orientation

The current review download route is `apps/web/src/app/api/download/repo/route.ts`. It loads authenticated Convex workspace state through `apps/web/src/app/api/download/repo/_server/downloads.ts`, checks that Review is ready, then calls `buildReviewDownloadZip` from `@shipbysunday/codebase-compiler/server`. That path must continue to behave the same for questionnaire-backed customer downloads.

The compiler zip path starts in `packages/codebase-compiler/src/bundle/build-review-download-zip.ts`. It builds a repo manifest from a canonical project definition, calls `materializeRepoSnapshot`, and writes every generated file into a repo-named zip. `materializeRepoSnapshot` already composes the pinned template source under `templates/starter-app/source`, generated overlays, generated design files, generalized Starter files, Program material, ExecPlans, skills, source facts, and template-source provenance.

The direct route should create one default canonical project definition in the compiler, call the same zip builder, and return the same archive headers as the review route. The default facts should describe the ChatGPT-style BYO OpenAI starter, omit placeholder-friendly domain and support emails, and set `placeholdersInUse` for omitted placeholder fields.

### In Scope

This plan includes a compiler-owned default Starter template project definition, a direct Next.js route under `apps/web/src/app/api/download/`, a visible Starter Home entry point for template-first users, focused compiler/app tests, route-map and Starter docs updates, this ExecPlan, and the owning Program ledger.

### Out Of Scope

Do not introduce a static zip, fetch mutable template source during a request, change the questionnaire-backed Review download route, add live Clerk, Convex, Stripe, or OpenAI requirements to the direct route, fork the generated repo contract, or change the pinned template source in this slice.

## Plan of Work

First, add a compiler function that creates the default Starter template project definition. It should use the existing canonical project definition machinery and conservative facts for an AI chat starter. Export that function from the compiler package and add a focused test that verifies the repo slug, placeholder fields, `/chat` product framing, and template-source provenance when materialized.

Next, add a new route such as `apps/web/src/app/api/download/starter-template/route.ts`. It should run on Node.js, rate-limit requests, validate a short-lived Starter Home download token, dynamically import the compiler server module, build the zip from the default definition, and return `application/zip` with the filename derived from the same repo manifest.

Then, add a visible template-first download action to `apps/web/src/app/(app)/starter/home/page.tsx`. The existing Starter Home already explains the two paths; the Lessons/template card should add a direct download link while keeping lessons available.

Finally, update focused tests and docs. The app integration route test should call the direct route and prove it returns a real zip. The Starter Home route or rendered markup test should prove the direct link is present. Docs should mention the direct template route in route-map or Starter docs without implying it is a static artifact.

## Milestones

The first milestone is the default definition. It is complete when the compiler exports one deterministic default Starter template project definition and focused tests prove the generated repo name, facts, placeholder fields, and dynamic snapshot output.

The second milestone is the route. It is complete when a signed request to the direct route returns a zip built by the same compiler server path and rate-limited independently from Review downloads.

The third milestone is the visible entry point. It is complete when Starter Home lets template-first users download the template directly and still links to lessons.

The fourth milestone is documentation and Program writeback. It is complete when docs and this Program record the new route and validation evidence.

## Concrete Steps

Work from `/Users/bazelrex/Developer/ship-by-sunday`.

Inspect these files before editing:

    apps/web/src/app/api/download/repo/route.ts
    packages/codebase-compiler/src/bundle/build-review-download-zip.ts
    packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts
    apps/web/src/app/(app)/starter/home/page.tsx

Implement the default definition and direct route, then run focused tests:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-direct-download.test.ts tests/review-download-zip.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/codebase-download-routes.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx

Run plan, Program, docs, and formatting checks after docs updates:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-add-direct-template-download-path.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-add-direct-template-download-path.md docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/program.md docs/release-workflow.md apps/web/src/content/docs/route-map.mdx apps/web/src/content/docs/how-the-starter-works.mdx

Run broader checks before completion:

    bun run format
    bun lint
    bun typecheck

## Validation and Acceptance

The implementation is accepted when a direct request returns a real Starter repo zip whose root folder comes from the default Starter template facts, whose contents include `docs/facts/template-source.json`, the generated operating pack, setup ExecPlans, and the `/chat` app contract, and whose generation path goes through `buildReviewDownloadZip` and `materializeRepoSnapshot` instead of a static artifact.

The existing Review download route must still require authenticated codebase access and Review readiness. The direct path must not read mutable template source from outside the repo, require live provider configuration, or fork generated output shape.

### Test Commands

Run these commands before completion:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-direct-download.test.ts tests/review-download-zip.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/codebase-download-routes.test.ts
    bun run --cwd apps/web test:unit -- tests/unit/app-workspace-codebase-review-routes.test.tsx
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-add-direct-template-download-path.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-add-direct-template-download-path.md docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/program.md docs/release-workflow.md apps/web/src/content/docs/route-map.mdx apps/web/src/content/docs/how-the-starter-works.mdx
    bun run format
    bun lint
    bun typecheck

## Idempotence and Recovery

The direct route should be safe to call repeatedly. It should have its own rate-limit bucket and no external provider side effects. If the route fails, inspect the default canonical definition first, then the compiler materialization path. Do not weaken generated snapshot safety checks to make the route pass.

If tests show the Review route changed behavior, restore the Review-specific auth/readiness path and keep the direct route separate. If docs imply the direct route is a static zip, correct the language to say it is generated on demand from pinned template source and default facts.

## Artifacts and Notes

Owning Program: `docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/program.md`.

Planning brief: `docs/programs/completed/2026-05-13-starter-template-source-and-billing-proof/planning-brief-6.md`.

Current review route: `apps/web/src/app/api/download/repo/route.ts`.

Current compiler zip builder: `packages/codebase-compiler/src/bundle/build-review-download-zip.ts`.

## Interfaces and Dependencies

This plan depends on Next.js App Router route handlers, the existing request rate limiter, `@shipbysunday/codebase-compiler/server`, canonical project definitions, the pinned template-source manifest, Program and ExecPlan linting, markdown metadata linting, and the generated repo clean-room contract.
