---
title: Findings Ledger And Decision Screens
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Build the existing-codebase findings ledger and finding decision screens from approved doctor-pass output without exposing raw source or starting workflows.
post_build_recap: '`/workspace/findings` and `/workspace/findings/[findingId]` now render from approved uploaded findings, with dense filters, recommended-first ranking, safe evidence refs, and a bounded workflow decision placeholder.'
program_id: customer-agentic-operating-system
planning_brief: docs/programs/completed/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Implementing `/workspace/findings` or `/workspace/findings/[findingId]`.
  - Reviewing the Top 9 findings ledger, finding detail decision UI, or workflow approval placeholder.
  - Verifying that findings screens consume approved uploaded findings and do not rerun probes, sync raw source, create branches, or start workers.
---

# Findings Ledger And Decision Screens

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After a local doctor pass uploads approved structured findings, the customer needs a decision surface, not another setup screen. This slice adds `/workspace/findings` for dense ranked Top 9 rows and `/workspace/findings/[findingId]` for a single finding decision screen. A customer should be able to filter findings, see the recommended first item, open a finding, review buyer impact and safe evidence refs, and understand the recommended workflow boundary without Ship by Sunday showing raw source, terminal logs, Codex transcripts, branch controls, PR controls, or worker queues.

The observable result is a protected existing-codebase workspace path where uploaded findings from the doctor-pass backend contract become the next AHA moment. Empty findings point back to `/workspace/doctor-pass`. The detail screen can render `Approve workflow`, but actual workflow approval persistence, write leases, branch creation, local diff generation, proof runs, and PR handoff belong to the next slice.

## Progress

- [x] 2026-05-04 EDT: Created this child ExecPlan from `planning-brief-2.md`, the Program packet, the completed doctor-pass plan, existing workspace data/events, setup UI, local runner plan, and `support-codebases.md`.
- [x] 2026-05-04 EDT: Confirmed no active findings ExecPlan existed before creating this file.
- [x] 2026-05-04 EDT: Inspected the current `/workspace/setup` and `/workspace/doctor-pass` pages, existing local nav model, workspace Convex API, findings validators, privacy tests, integration-ui patterns, design guidance, Convex guidance, and local Next App Router docs before implementation.
- [x] 2026-05-04 EDT: Implemented `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts` to sort and filter uploaded findings, hide deleted rows, mark one recommended-first row, format safe evidence refs, and build decision-screen workflow boundaries.
- [x] 2026-05-04 EDT: Implemented `/workspace/findings` and `/workspace/findings/[findingId]` with feature-local components under `apps/web/app/(workspace)/_components/existing-codebase-findings/`.
- [x] 2026-05-04 EDT: Added focused unit and integration-ui tests for the findings read model, ledger filters, empty state, decision content, bounded `Approve workflow`, evidence copying, and forbidden branch, PR, queue, raw-source, raw-log, and transcript surfaces.
- [x] 2026-05-04 EDT: Focused validation passed: `bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts` passed, 1 file and 4 tests; `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-findings-page.test.tsx tests/integration-ui/workspace-finding-detail-page.test.tsx` passed, 2 files and 4 tests, with the pre-existing `--localstorage-file` warning.
- [x] 2026-05-04 EDT: App validation passed: `bun run --cwd apps/web format:check`, `bun run --cwd apps/web lint`, and `bun run --cwd apps/web typecheck`. Typecheck completed a Next production build and listed `/workspace/findings` plus `/workspace/findings/[findingId]` in the route manifest.
- [x] 2026-05-04 EDT: Planning validation passed before final move: `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-04-findings-ledger-and-decision-screens.md`, `bun run programs:lint`, `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-04-findings-ledger-and-decision-screens.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md`, and `git diff --check`.
- [x] 2026-05-04 EDT: Browser proof was attempted by starting `bun run --cwd apps/web dev:web:only -- -p 3104` and requesting `/workspace/findings`; the route rendered the protected Access Required state because the local browser was signed out with `x-clerk-auth-reason: dev-browser-missing`, so authenticated desktop/mobile findings screenshots could not be captured in this environment.
- [x] 2026-05-04 EDT: Filled the retrospective and marked this ExecPlan complete.
- [x] 2026-05-04 EDT: Review patch removed evidence summaries from the browser decision view model and detail screen so source-like text cannot be smuggled through `evidenceRefs[*].summary`; regression tests now include `export const runtime = "edge";` as a blocked source-like summary.
- [x] 2026-05-04 EDT: Review patch added the required recommended workflow column to the dense findings ledger and extended the integration-ui ledger test to assert workflow labels are visible.
- [x] 2026-05-04 EDT: Review-fix validation passed: `bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts`, `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-findings-page.test.tsx tests/integration-ui/workspace-finding-detail-page.test.tsx`, `bun run --cwd apps/web format:check`, `bun run --cwd apps/web lint`, and `bun run --cwd apps/web typecheck`.

## Surprises & Discoveries

The completed doctor-pass slice already exposes uploaded findings through `api.workspace.listWorkspaceFindings`, and the backend validator shape includes rank, status, category, severity, confidence, buyer impact, proof path, proofability, permission requirement, recommended workflow id, why-now text, sync sensitivity, local report ref, and safe evidence refs. This slice can stay mostly in the app/UI layer unless detail lookup exposes a narrow backend gap.

Full local browser proof for the actual findings UI is blocked by the same protected-route auth constraint seen in the setup slice. The dev server starts and the route exists, but unauthenticated requests render Access Required instead of seeded existing-codebase findings. Component-level integration UI tests cover the ledger and detail screens directly.

The review pass found that even approved structured `evidenceRefs[*].summary` text can carry raw source-looking content. The browser read model now treats evidence as ref-only: file paths, line ranges, command names, artifact ids, package names, and local report refs may render, but summaries stay out of the decision UI.

## Decision Log

Decision: Use the existing workspace findings query as the source of truth.
Rationale: The doctor-pass and data/events slices already store approved findings in `codebaseFindings` and expose them through an authenticated existing-codebase workspace query. A second findings store would duplicate sync state and weaken the privacy contract.
Date: 2026-05-04

Decision: Treat `Approve workflow` as a bounded placeholder in this slice.
Rationale: The next Program slice, `source-truth-agent-readiness-workflow`, owns workflow packets, approval persistence, write leases, branches, proof, and local diff or PR handoff. This slice should help the customer decide what to approve without starting runner work.
Date: 2026-05-04

Decision: Keep detail lookup in the app layer over the bounded Top 9 query.
Rationale: `listWorkspaceFindings` already returns at most the approved Top 9 findings for the authenticated existing-codebase workspace and hides deleted rows by default. Reusing it avoids a new Convex read helper and keeps the slice focused on presentation.
Date: 2026-05-04

Decision: Do not render evidence summaries in findings decision screens.
Rationale: Summary fields are user-approved structured metadata, but their text can still contain raw source snippets. Rendering only evidence refs preserves the privacy contract while leaving enough information for the customer to inspect local artifacts on their own machine.
Date: 2026-05-04

## Outcomes & Retrospective

Implemented the Findings Ledger And Decision Screens slice. The app now has protected server routes for `/workspace/findings` and `/workspace/findings/[findingId]`, a reusable findings read model, dense ledger filters, a recommended-first marker, an empty state that points back to `/workspace/doctor-pass`, and a decision screen with buyer impact, why-now text, safe evidence refs, proof path, permission requirement, expected outputs, allowed and disallowed touch targets, sync policy, blocked conditions, and the required actions.

No Convex schema or mutation changes were needed. The screens consume the existing approved findings query and do not run doctor-pass probes, regenerate findings, approve sync previews, create branches, open PRs, start worker queues, or read local files from the browser. The `Approve workflow` action is intentionally non-persistent and reports that workflow approval belongs to the next slice.

Validation passed for the read model, UI components, app format, app lint, app typecheck, plan lint, Program lint, markdown lint, and diff whitespace. Full authenticated browser screenshots remain a gap because local browser access reached the protected signed-out state rather than an existing-codebase session with uploaded findings.

## Context and Orientation

The existing-codebase workspace runs under the protected `/workspace/*` spine. The setup screen is `apps/web/app/(workspace)/workspace/setup/page.tsx`, with components under `apps/web/app/(workspace)/_components/existing-codebase-setup/`. The doctor-pass screen is `apps/web/app/(workspace)/workspace/doctor-pass/page.tsx`, with `WorkspaceDoctorPassPage` under `apps/web/app/(workspace)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page.tsx`.

The current local navigation is built by `buildExistingCodebaseWorkspaceLocalNavModel` in `apps/web/app/(workspace)/_lib/workspace-setup-readiness-model.ts`. It already names the required labels: `Setup`, `Doctor Pass`, `Findings`, `Loops`, `Runs`, and `Privacy`. The new findings pages should reuse that model and mark `Findings` active.

Existing-codebase Convex functions are exported from `apps/web/convex/workspace.ts` and implemented in `apps/web/convex/workspace/model.ts`. Approved findings live in the `codebaseFindings` table and are read through `listWorkspaceFindings`. A finding is the sync-safe doctor-pass object. Its evidence refs can name repo-relative file paths, line numbers, command names, package names, artifact ids, and local report refs. It must not contain raw source excerpts, full local reports, local absolute paths, secrets, raw logs, screenshots with sensitive data, or Codex transcripts.

The page routes should follow current Next App Router conventions. Pages under `apps/web/app/(workspace)/workspace/...` are server components by default. Use `loadWorkspacePageAccess` and redirect generated-codebase or legacy buyers away from the existing-codebase route, as `/workspace/doctor-pass` does now. Use `fetchAuthenticatedQuery` for server preloading, then pass the result into a focused client component only when filters or button interactions need client state.

Before implementation under `apps/web`, read `apps/web/AGENTS.md`, `docs/release-workflow.md`, root `DESIGN.md`, `docs/ship-by-sunday/design-pack/AGENTS.md`, and the relevant local Next docs. Before touching Convex, read `apps/web/convex/_generated/ai/guidelines.md` and use hosted Convex dev only.

### In Scope

This plan includes `/workspace/findings`, `/workspace/findings/[findingId]`, feature-local existing-codebase findings components, a findings read model, category and status filters, a `Run doctor pass again` link or action back to `/workspace/doctor-pass`, empty state routing to `/workspace/doctor-pass`, a recommended-first marker, a detail decision screen, focused tests, browser proof where feasible, and Program/ExecPlan updates.

The ledger must render dense ranked rows showing rank, title, category, severity, confidence, buyer impact, proofability or proof path, required permission, recommended workflow, and status. The top recommended item should be visibly marked `Recommended first`.

The detail screen must show finding title, category, severity, confidence, buyer impact, why now, evidence refs without raw source, proof path, required permission, recommended workflow, expected outputs, allowed touch targets, disallowed touch targets, sync policy, and blocked conditions. It must include primary action `Approve workflow` plus secondary actions `Back to findings`, `Copy local evidence ref`, and `Not now`.

### Out Of Scope

This plan does not reimplement doctor-pass probes, run the doctor pass, regenerate findings, implement sync preview approval, create branches, create write leases, execute workflows, open PRs, implement managed GitHub, build worker queues, show raw source, show raw terminal logs, show full Markdown reports, show screenshots with sensitive data, or show Codex transcripts.

This plan does not implement durable workflow approval persistence unless a narrow placeholder is already available and explicitly scoped. If the current backend can create an approval-request shell, this UI may choose not to call it because the next slice owns the full approval contract. Do not start runner work from the findings screens.

## Plan of Work

Start with the data shape and read model. Add `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts` to convert backend finding documents into ledger rows, detail view models, filter options, evidence labels, workflow labels, permission labels, status labels, expected outputs, touch target lists, sync policy copy, and blocked-condition rows. The model should sort by uploaded rank, hide deleted findings, identify one recommended-first row from rank order, and support category and status filters without mutating backend state.

Next, create feature-local components under `apps/web/app/(workspace)/_components/existing-codebase-findings/`. Keep the ledger operational and dense: use a compact row stack or table-like grid with responsive labels, not marketing cards. Good component names are `workspace-findings-page.tsx`, `workspace-findings-ledger.tsx`, `workspace-findings-filters.tsx`, `workspace-findings-empty-state.tsx`, and `workspace-finding-detail-page.tsx`. Keep browser-only filter state inside the ledger page component. Keep rendering, formatting, and decision text in the read model.

Then add route files. `apps/web/app/(workspace)/workspace/findings/page.tsx` should gate product access, redirect non-existing-codebase buyers, fetch `api.workspace.listWorkspaceFindings`, and render the ledger component. `apps/web/app/(workspace)/workspace/findings/[findingId]/page.tsx` should use `params: Promise<{ findingId: string }>` per the local Next docs, fetch the same bounded Top 9 list, find by document id or stable finding id, and render not-found or an empty decision fallback when the finding is unavailable.

After UI exists, add tests. Unit tests should prove filtering, recommended-first selection, deleted finding exclusion, safe evidence formatting, detail model mapping, and no raw source/log/transcript fields in the view model. Integration-ui tests should mock Convex and the app shell, render the ledger and detail components, exercise filters, assert `Recommended first`, assert the empty state points to `/workspace/doctor-pass`, assert the detail decision content and actions, and assert forbidden branch, PR, queue, raw-source, raw-log, and transcript labels are absent.

Finally, run focused validation and update this plan. If browser proof is blocked by local Clerk authentication, record the exact reason and rely on integration-ui proof plus app typecheck/lint. If it succeeds, capture desktop and mobile observations for both routes and verify dense rows, filters, detail decision content, and no text overlap.

## Milestones

The first milestone is read-model proof. It is complete when the model turns backend findings into sorted ledger rows and detail models, hides deleted rows, marks exactly one recommended first row, and formats evidence refs without raw source.

The second milestone is route and ledger UI. It is complete when `/workspace/findings` renders inside the app shell with the existing-codebase local nav, dense ranked rows, filters, `Run doctor pass again`, and an empty state that points to `/workspace/doctor-pass`.

The third milestone is decision screen UI. It is complete when `/workspace/findings/[findingId]` renders a decision screen with the required content and bounded actions without workflow execution, branch creation, PR controls, or worker queue controls.

The fourth milestone is focused validation. It is complete when unit tests, integration-ui tests, app typecheck, app lint, planning checks, markdown checks, `git diff --check`, and browser proof or a recorded browser-proof limitation are captured in this plan.

## Concrete Steps

From the repo root, inspect the current surfaces before editing:

    sed -n '1,260p' 'apps/web/app/(workspace)/workspace/doctor-pass/page.tsx'
    sed -n '1,320p' 'apps/web/app/(workspace)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-page.tsx'
    sed -n '760,900p' 'apps/web/app/(workspace)/_lib/workspace-setup-readiness-model.ts'
    sed -n '1,260p' apps/web/convex/workspace.ts
    rg -n "listWorkspaceFindings|codebaseFinding|requestWorkspaceWorkflowRun" apps/web/convex/workspace apps/web/tests

Confirm the archived plan file exists:

    test -f docs/exec-plans/completed/2026-05-04-findings-ledger-and-decision-screens.md

Implement expected ownership:

    apps/web/app/(workspace)/workspace/findings/page.tsx
    apps/web/app/(workspace)/workspace/findings/[findingId]/page.tsx
    apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-findings-page.tsx
    apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-findings-ledger.tsx
    apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-findings-filters.tsx
    apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-findings-empty-state.tsx
    apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-finding-detail-page.tsx
    apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts
    apps/web/tests/unit/workspace-findings-read-model.test.ts
    apps/web/tests/integration-ui/workspace-findings-page.test.tsx
    apps/web/tests/integration-ui/workspace-finding-detail-page.test.tsx

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-findings-page.test.tsx tests/integration-ui/workspace-finding-detail-page.test.tsx
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web lint

Run planning validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-findings-ledger-and-decision-screens.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-findings-ledger-and-decision-screens.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md
    git diff --check

If browser auth allows it, start the app and inspect desktop and mobile for `/workspace/findings` and `/workspace/findings/<findingId>`. Verify dense rows, working filters, `Recommended first`, decision content, and no raw source/log/transcript, branch, PR, or queue controls.

## Validation and Acceptance

The ledger is accepted when an existing-codebase buyer with uploaded findings can open `/workspace/findings`, see the Top 9 in rank order, filter by category and status, see the recommended first finding, and navigate to a detail screen. An existing-codebase buyer with no uploaded findings should see an empty state that sends them back to `/workspace/doctor-pass`.

The detail route is accepted when it behaves as a decision screen. It must show the finding's buyer impact, why-now text, safe evidence refs, proof path, permission requirement, recommended workflow, expected outputs, allowed and disallowed touch targets, sync policy, and blocked conditions. `Approve workflow` is visible but must not execute local runner work in this slice.

Privacy is accepted when the UI only renders sync-safe fields from uploaded findings. It must not fetch local files from the browser, render raw source excerpts, render raw terminal logs, render full Markdown reports, render screenshots with sensitive content, render Codex transcripts, or expose local absolute paths.

### Test Commands

Run these commands from the repo root after implementation:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-findings-page.test.tsx tests/integration-ui/workspace-finding-detail-page.test.tsx
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-findings-ledger-and-decision-screens.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-findings-ledger-and-decision-screens.md docs/programs/completed/2026-05-02-customer-agentic-operating-system support-codebases.md
    git diff --check

If Convex read helpers are added, add focused unit tests for finding reads, deleted or hidden findings, authorization, and unsafe field exclusion, then run those tests explicitly before completing the plan.

## Idempotence and Recovery

The UI is additive and safe to rerun. It reads the bounded Top 9 uploaded findings and does not mutate findings while filtering or viewing details. If route rendering fails because no findings exist, the page should render the empty state instead of throwing.

If a dynamic detail route references a missing, deleted, or unauthorized finding, render a clear unavailable state or use Next `notFound()` without leaking whether another workspace owns the finding. Do not show deleted findings in the normal ledger.

If implementation discovers that the existing `listWorkspaceFindings` query cannot support detail lookup safely, add the narrowest authenticated read helper that returns one safe finding by id for the current viewer's workspace. Do not expose runner credentials, raw local data, or unbounded result sets.

## Artifacts and Notes

The owning Program is `docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md`.

The prior completed doctor-pass plan is `docs/exec-plans/completed/2026-05-04-doctor-pass-and-sync-preview.md`.

The existing backend query source is `api.workspace.listWorkspaceFindings`, implemented by `listWorkspaceFindingsHandler` in `apps/web/convex/workspace/model.ts`.

## Interfaces and Dependencies

This plan depends on `apps/web/AGENTS.md`, `docs/release-workflow.md`, `DESIGN.md`, `docs/ship-by-sunday/design-pack/AGENTS.md`, `apps/web/convex/_generated/ai/guidelines.md`, `apps/web/app/(workspace)/_server/load-workspace-page-access.ts`, `apps/web/app/(workspace)/_lib/workspace-setup-readiness-model.ts`, `apps/web/convex/workspace.ts`, `apps/web/convex/workspace/model.ts`, `apps/web/convex/workspace/validators.ts`, `apps/web/tests/unit/workspace-privacy-contract.test.ts`, and the next `source-truth-agent-readiness-workflow` ExecPlan.
