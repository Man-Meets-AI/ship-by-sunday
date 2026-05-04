---
summary: Consolidate the review handoff, execute-ship follow-up actions, docs, and QA bootstrap story into one codebase-first implementation slice.
read_when: Open this when you need to implement the April 4 review-handoff cleanup across `/review`, `/execute`, public docs, and Playwright bootstrap diagnostics.
plan_status: done
---

# Consolidate the Review Handoff and Docs

This is a living execution plan. Keep it current as work lands so a fresh agent can finish from this file alone.

This ExecPlan must be maintained in accordance with `.plans/PLANS.md`.

## Purpose / Big Picture

The user-visible result of this work is a cleaner, more truthful review experience. An entitled customer who reaches `/review` should see one clear `Review` surface, a small explicit status line when the page is trying to auto-start the download, and a fallback that still makes sense if the browser does not begin downloading immediately. The optional Execute / Ship surfaces should stop acting like separate download entry points and instead send the user back through the canonical review handoff.

The broader outcome is consistency. Public docs, local QA guidance, release/operator docs, and the review UI should all tell the same story: `/codebase` is the canonical protected workspace, `/review` is the single handoff surface, and the post-review library is optional and subordinate to that handoff. The local-auth Playwright bootstrap should also fail with enough context that an operator can tell whether they have a real app bug or just a target/env mismatch.

## Progress

- [x] 2026-04-04 11:45 EDT: Normalized the review handoff copy and status model in the codebase flow, including the first unlocked review render and the small explicit auto-download status line.
- [x] 2026-04-04 11:45 EDT: Reworked the post-review track actions so `/execute` and related surfaces use the shared re-download contract instead of a raw download button label.
- [x] 2026-04-04 11:45 EDT: Extracted shared codebase/review fixtures and kept direct unit coverage for the review handoff helper and hook aligned to the shipped contract.
- [x] 2026-04-04 11:45 EDT: Added the dedicated `review:handoff:doctor` command plus the root alias `qa:review-handoff`, and hardened Playwright auth-bootstrap diagnostics with page, Clerk, console, page-error, and artifact details.
- [x] 2026-04-04 11:45 EDT: Synced the public docs and local QA docs to the shipped `/codebase -> /review` story and split canonical QA from legacy redirect QA.

## Surprises & Discoveries

The current review handoff already has a one-time auto-download query param (`download=1`) and a cleanup effect that removes the param after the browser tries to click the download link. That means the follow-up work is mostly about centralizing copy, tightening the first render, and making the attempt visible, not inventing a new download mechanism.

The local-auth bootstrap path already enforces `PLAYWRIGHT_BASE_URL` and the Clerk/Convex target check, but the failure text does not yet clearly distinguish base-url mistakes, Clerk-env mismatches, and sign-in/session failures. The diagnostics need more context, not a new bootstrap workflow.

## Decision Log

Decision: standardize the customer-facing name for the review surface on `Review`. Rationale: the live page already uses that route title, the current tests and nav language already lean that way, and using one surface name keeps the docs, QA, and UI aligned.

Decision: add a focused `qa:review-handoff` command instead of folding the review-specific checks into `qa:validate`. Rationale: the review handoff is product behavior, not control-plane integrity, and a dedicated command keeps it easy to run without making the QA validator heavier than it needs to be.

Decision: keep canonical QA and legacy redirect QA separate in the local QA docs. Rationale: the repo already treats `/codebase` and `/review` as the canonical contract and the old stage URLs as compatibility only, so mixing them into one checklist hides what is release-critical versus what is legacy support.

## Outcomes & Retrospective

Completed. The review handoff now has one visible surface name, one shared helper contract, one explicit status line, and one dedicated validation command. The execute-track re-download actions, public docs, and local QA docs all describe the same `/codebase -> /review` story instead of mixing the new flow with old stage-root language.

The remaining caveat is environmental rather than feature-level: local-auth browser proof is still a convenience lane and not the canonical shared browser proof path. That limitation is now documented more directly in the local QA docs and the bootstrap diagnostics are more actionable when the lane fails.

## Context and Orientation

The review surface lives in `apps/web/features/codebase-flow/`. The page entrypoint is `apps/web/app/(workspace)/review/page.tsx`, which fetches the workspace state, resolves the post-review targets, and passes the initial auto-download flag into `CodebaseReviewPage`. The current handoff behavior is split across `apps/web/features/codebase-flow/lib/review-download-handoff.ts`, `apps/web/features/codebase-flow/hooks/use-review-download-handoff.ts`, `apps/web/features/codebase-flow/components/review/codebase-review-download-bridge.tsx`, and `apps/web/features/codebase-flow/components/review/codebase-review-handoff-card.tsx`.

The optional post-review surfaces live under `apps/web/features/execute-ship/`. The track data is defined in `apps/web/features/execute-ship/lib/execute-ship-tracks.ts`, the track renderer is `apps/web/features/execute-ship/components/execute-ship-track-detail.tsx`, and the bonus library / lesson map surfaces reuse the shared post-review nav model from `apps/web/features/workspace-navigation/lib/post-review-destination.ts`, `build-primary-nav-model.ts`, and `build-secondary-nav-model.ts`.

The relevant tests are split between feature integration tests and small route-level unit tests. `apps/web/tests/integration-ui/codebase-review-page.test.tsx` proves the current review hierarchy and auto-download behavior, `apps/web/tests/unit/app-workspace-execute-page.test.tsx` and `apps/web/tests/unit/post-review-destination.test.ts` prove the optional branch routing, and the legacy redirect tests live in `apps/web/tests/integration-ui/legacy-codebase-route-redirects.test.tsx` and `apps/web/tests/unit/legacy-codebase-route-redirects.test.ts`.

The QA and operator controls live under `qa/` and `docs/`. `qa/README.md`, `qa/AGENTS.md`, `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv` describe the canonical journey model, while `qa/scripts/personas.mjs`, `qa/scripts/lib/clerk-target.mjs`, and `apps/web/tests/e2e/global-setup.ts` handle persona preparation and auth bootstrap. Public docs in `apps/web/content/docs/` tell builders and operators how the starter works; those pages still need to reflect the current `/codebase -> /review` story instead of reading like a stage-root walkthrough.

## Plan of Work

Start by centralizing all review-handoff copy, labels, and small state strings in one feature-local module under `apps/web/features/codebase-flow/lib/`. Use that module from the review page, the download bridge, and the handoff card so the visible `Review` naming, fallback link text, and auto-download status wording stay aligned. While making that pass, update `CodebaseReviewPage` so the first unlocked render does not briefly fall back to a locked-looking shell when the build targets or bonus mission state have not resolved yet.

Next, rework the post-review tracks in `apps/web/features/execute-ship/lib/execute-ship-tracks.ts` and the corresponding render boundary so they no longer advertise a direct codebase download route. Those actions should point back to the canonical review handoff or another clearly named review-return action, and their labels should stop implying that `/execute` is the place to fetch the Codebase. Keep the optional post-review library truthful: it is continuation support, not a second download surface.

After that, extract the duplicated codebase/review fixture builders into one shared test-fixture module inside `apps/web/tests/` and update the review, execute, and mission tests to import from that source. Add direct unit coverage for the review handoff helper and hook so the query-param builder, the enabled-state check, the one-time auto-click behavior, and the fallback-label behavior are all covered without relying only on the page integration test.

Then add a dedicated review-handoff validation command in the root scripts and wire it to the narrow proof slice that matters for this story. The command should be cheap enough to run during implementation, and it should be documented as the operator-friendly way to verify the review handoff after copy or route changes. In the same pass, harden the Playwright and persona-prep diagnostics so failures explain the target base URL, the loaded QA env file, the auth mode being prepared, and the exact reason the bootstrap stopped.

Finish by updating the public docs and QA/operator docs together. The shipped docs under `apps/web/content/docs/` should all describe the same `/codebase` and `/review` story, the local QA docs should separate canonical codebase/review QA from legacy redirect QA, and the release workflow / QA guide should point people at the dedicated review-handoff validation command instead of teaching a grab-bag of old stage-root checks.

## Milestones

Milestone 1 makes the review surface internally consistent. At the end of it, `Review` is the single visible name used by the review handoff copy, the fallback link text, and the new auto-download status line, and the first unlocked review render stays unlocked even while the live post-review targets are still resolving. The touched files should be the review handoff helper, hook, bridge, handoff card, and `apps/web/features/codebase-flow/components/codebase-review-page.tsx`. Validate this slice with the focused review-page integration test and a direct unit test for the helper and hook.

Milestone 2 rehomes the post-review download actions. At the end of it, the execute-ship track data no longer points at the raw download route, the link labels read like review-return or handoff actions instead of secondary download buttons, and the optional bonus surfaces still route through the same canonical review contract. The touched files should include `apps/web/features/execute-ship/lib/execute-ship-tracks.ts` and the consumer boundary that renders those track links. Validate with the execute-route unit tests and the post-review destination tests so the new labels and destinations are covered.

Milestone 3 removes the duplicate fixture noise and adds direct unit proof for the handoff logic. At the end of it, the review, mission, and execute tests all share one fixture module, and the review handoff helper has direct unit coverage instead of depending only on the full page integration test. The touched files should be the new fixture module under `apps/web/tests/fixtures/`, the review and bonus route tests that currently build local copies of the same workspace/mission state, and the new unit test file for the handoff helper or hook. Validate by rerunning the small set of affected unit and integration-ui tests.

Milestone 4 gives operators one focused command and better failure text. At the end of it, `bun run qa:review-handoff` exists from the repository root, runs the narrow review-handoff proof slice, and is the command the docs point to when someone changes review copy or post-review routing. In the same milestone, `qa/scripts/lib/clerk-target.mjs`, `qa/scripts/personas.mjs`, `apps/web/tests/e2e/global-setup.ts`, and the local auth doctor should emit clearer diagnostics when the Playwright target, the QA env file, or the Clerk session setup are wrong. Validate this slice with `bun run qa:validate`, the new dedicated command, and one intentional failure case to confirm the diagnostics tell the operator what to fix.

Milestone 5 updates the public and operator docs to match the shipped story. At the end of it, the docs in `apps/web/content/docs/` and the QA/operator docs in `qa/` and `docs/release-workflow.md` all explain the same canonical path: `/codebase` first, `/review` as the single handoff, and the legacy routes only as compatibility redirects. The local QA doc should split canonical QA from legacy redirect QA into separate sections, and the release docs should point at the dedicated review-handoff validation command. Validate the docs slice with `bun run qa:validate` and a careful content review of the changed MDX and QA markdown files.

## Concrete Steps

From the repository root, update the review handoff first and run the narrow review-page tests before widening scope:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-review-page.test.tsx

The expected observation is that the review page test still passes once the new status line, fallback copy, and first-unlocked-render logic are in place.

Next, make the execute-ship track changes and confirm the optional branch still routes through the canonical review handoff:

    $ bun run --cwd apps/web test:unit -- tests/unit/app-workspace-execute-page.test.tsx tests/unit/post-review-destination.test.ts

The expected observation is that the optional branch still reaches the right lesson targets, but no UI path keeps advertising a raw `/api/download/repo` destination.

Then extract the shared fixtures and add direct review-handoff unit coverage:

    $ bun run --cwd apps/web test:unit -- tests/unit/review-download-handoff.test.tsx tests/unit/app-workspace-mission-page.test.tsx tests/unit/bonus-mission-page.test.tsx

The expected observation is that the new fixture module compiles cleanly, the hook/helper tests prove the handoff logic directly, and the mission/bonus tests still read the shared data correctly.

After that, wire and run the dedicated review-handoff validation command:

    $ bun run qa:review-handoff

The expected observation is a focused pass over the review-handoff proof slice, not a full repo gate. The command should print the narrow proof it ran and exit 0.

Use the auth-bootstrap diagnostics slice to confirm failures are actionable:

    $ PLAYWRIGHT_BASE_URL=http://localhost:3000 E2E_RUN_LOCAL_AUTH=1 bun run --cwd apps/web test:e2e:local-auth:default-ship

If the environment is wrong, the expected observation is a failure that names the target URL, the loaded QA env file, and whether the bootstrap stopped in target validation or during Clerk sign-in/session establishment.

Finally, update the docs and validate the control plane:

    $ bun run qa:validate

The expected observation is the standard success line:

    QA control plane is internally consistent.

## Validation and Acceptance

This work is complete when a reviewer can verify all of the following without reading implementation details. `/review` should render as `Review`, should show a short explicit status line when the page is trying to auto-start the download, and should still surface the fallback link if the browser does not begin downloading immediately. When the Build targets or bonus mission state have not resolved yet, the first unlocked review render should still look unlocked instead of briefly regressing to a disabled shell.

The optional post-review surfaces should no longer present a direct codebase-download route as a primary action. The execute-ship tracks should send people back through the review handoff, and the review-return labels should read like continuation support rather than a second download moment.

The new unit coverage should prove the review handoff logic directly, the shared fixtures should eliminate the duplicated test builders, and the dedicated `qa:review-handoff` command should run the narrow proof slice without needing a full browser pack. The auth-bootstrap diagnostics should explain what went wrong well enough that an operator can fix the target URL, QA env, or Clerk setup without guessing.

The docs are acceptable when they all tell the same story: `/codebase` is canonical, `/review` is the handoff surface, `Review` is the customer-facing name for that surface, and the old stage-root routes are compatibility redirects only. The local QA docs should clearly separate canonical codebase/review checks from legacy redirect checks, and the operator docs should point people at the dedicated review-handoff validation command when they are changing that slice.

## Idempotence and Recovery

These edits are safe to rerun because they are mostly copy, route wiring, and test-only extractions. If the new handoff constants need to change again, update the single feature-local constants module first and let the page, hook, and card consume it. If the shared fixtures become awkward, keep the fixture module small and feature-specific rather than re-duplicating data inside each test file.

The dedicated validation command should be read-only with respect to product state. It can be rerun after any review-handoff edit without leaving behind new app state, and it should be safe to use as the first check after a failed manual browser run. If the auth-bootstrap diagnostics fail because the target or env is wrong, fix the environment variables and rerun the same command instead of changing the app code first.

If a docs update drifts, restore the canonical `/codebase -> /review` story in the public docs before touching release or QA runbooks again. If the execute-ship track links still look wrong after the first pass, change only the track data and its immediate consumer; do not widen scope into unrelated bonus-library copy.

## Artifacts and Notes

None yet. After implementation, add the smallest useful proof snippets here: the focused review-handoff command output, one successful `/review` browser observation with the status line, and one diagnostic failure message that clearly names the wrong target or env.

## Interfaces and Dependencies

`apps/web/features/codebase-flow/lib/review-download-handoff.ts` remains the query-param boundary for the review auto-download attempt, but its copy-facing responsibilities should move into a feature-local review-handoff constants module so the hook, bridge, and card all read from one source of truth.

`apps/web/features/codebase-flow/components/codebase-review-page.tsx` owns the first unlocked render and the unlocked review shell. It should keep using `AppShell`, `CodebaseVideoCard`, `CodebaseReviewDownloadBridge`, and the live Convex queries, but it must not fall back to a locked-looking nav when the post-review targets are still resolving.

`apps/web/features/execute-ship/lib/execute-ship-tracks.ts` and `apps/web/features/execute-ship/components/execute-ship-track-detail.tsx` are the post-review link boundary. Any track that currently points at `/api/download/repo` should instead point at the canonical review handoff or a review-return destination built from the same helper used by the review page.

`apps/web/tests/fixtures/codebase-review.ts` or another similarly named feature-specific fixture module should hold the shared codebase workspace state, bonus mission state, and post-review target builders so the review, execute, and mission tests stop maintaining their own copies of the same data.

`qa/scripts/lib/clerk-target.mjs`, `qa/scripts/personas.mjs`, `apps/web/tests/e2e/global-setup.ts`, and `apps/web/scripts/local-clerk-convex-auth-doctor.mjs` are the auth-bootstrap diagnostic boundaries. If one of them needs shared formatting or error-text helpers, keep that logic in `qa/scripts/lib/` so the failure story stays consistent across persona prep, Playwright bootstrap, and the dev auth doctor.

The new dedicated validation command should be wired from the root `package.json` and implemented as a thin script in `qa/scripts/`. It should depend on the focused review-handoff tests, not on the full ship pack, so it stays useful during iterative edits.
