---
title: Findings Active Work Items
status: active
created_at: 2026-05-05
completed_at: null
summary: Turn repeated Doctor Pass findings from a confusing rank ledger into a clear active-work inbox with latest-run and history views.
post_build_recap: null
read_when:
  - Resuming findings IA implementation.
  - Changing Doctor Pass upload reconciliation or findings queries.
  - Validating repeated Doctor Pass smoke tests.
---

# Findings Active Work Items

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Doctor Pass produces structured findings that are candidate bot workflows, not permanent truth and not raw source diagnostics. A customer or operator may run Doctor Pass multiple times during setup or debugging. Today `/workspace/findings` is titled `Top 9 ledger` and mixes project findings by rank, so repeated runs can leave duplicate-looking rows, repeated rank numbers, and no obvious distinction between current work, latest output, and old observations.

After this plan is implemented, Parker should open `/workspace/findings` after a new approved Doctor Pass upload and see the current active work items first. The page should also make it easy to inspect the exact latest Doctor Pass output, all historical findings, hidden findings, and done findings without exposing raw source, local logs, Codex transcripts, credentials, or local-only artifacts. Repeated runs should reconcile the same underlying issue into one understandable work item or cluster instead of creating a confusing pile of rows.

The visible proof is a repeated-run smoke test: upload two or more approved Doctor Pass runs that contain overlapping setup or Codex-auth issues, open `/workspace/findings`, and observe that the default view is `Active work items`, rows show run metadata and active or superseded state, the latest run can be inspected as an exact snapshot, and historical duplicate observations are grouped or clearly marked.

## Progress

- [x] 2026-05-05 EDT: Created this ExecPlan from the repeated Doctor Pass smoke-test failure and the findings IA recommendation.
- [x] 2026-05-05 EDT: Read root `AGENTS.md`, `docs/index.md`, `DESIGN.md`, `docs/ship-by-sunday/design-pack/AGENTS.md`, `apps/web/AGENTS.md`, `apps/web/convex/_generated/ai/guidelines.md`, `docs/release-workflow.md`, and `docs/exec-plans/PLANS.md`.
- [x] 2026-05-05 EDT: Inspected the current findings page, ledger, filters, read model, Convex schema fields, upload reconciliation, list query, focused tests, completed findings ledger plan, and `RUNNER_SMOKE_CHECKLIST.md` repeated-run failure notes.
- [ ] Implement the backend read and lifecycle model for active work, latest run, all history, hidden, and done findings.
- [ ] Implement the findings UI tabs, row metadata, duplicate-cluster presentation, and bulk run visibility actions.
- [ ] Update focused tests and smoke checklist expectations for repeated Doctor Pass uploads.
- [ ] Run focused validation, browser proof where auth allows, and the repo-level completion gates before marking the plan complete.

## Surprises & Discoveries

The current backend already patches an existing finding when a new upload uses the same `findingId`, because `syncFindingsForApprovedDoctorPassRun` looks up `codebaseFindings` by `projectId` and `findingId` before insert. That helps only when Doctor Pass emits the same stable id for the same issue. It does not handle near-duplicates that receive different finding ids.

The current `listWorkspaceFindingsHandler` returns the first nine non-deleted findings sorted by project rank, not the latest run and not active work. This means multiple uploaded runs can interleave rank `1`, rank `2`, and rank `3` rows across different Doctor Pass runs, then slice away newer or more relevant rows.

The current read model also sorts all loaded findings by `rank` and marks the first sorted row as `Recommended first`. Without run scope or lifecycle state, that marker can point at an older run's rank `1` instead of the current work Parker expects.

The approved findings digest contract currently hashes the exact approved run id, Doctor Pass run id, and finding payload. The reconciliation model must not mutate the approved payload before digest validation. Any clustering, lifecycle status, hiding, or resolution state must be derived and stored after the digest check succeeds.

## Decision Log

Decision: Treat findings as a task inbox backed by Doctor Pass snapshots, not as a raw cumulative ledger.
Rationale: Parker's operating question is "what should the bot work on now?" The latest Doctor Pass snapshot and all historical observations are still valuable, but they are secondary inspection modes.
Date: 2026-05-05

Decision: Make `Active work items` the default view after a new upload.
Rationale: The default should reduce ambiguity and route Parker toward the next bot todo. Exact latest-run output remains one tab away for debugging and trust.
Date: 2026-05-05

Decision: Keep the approved upload digest contract unchanged.
Rationale: The digest is the privacy and approval boundary for what left the customer's machine. Reconciliation should be a server-side interpretation of already-approved structured findings, not a change to what was approved.
Date: 2026-05-05

Decision: Store every uploaded finding observation and derive or link a durable work item or cluster.
Rationale: The product needs both an exact latest-run snapshot and deduped active work. Overwriting only by `findingId` loses history when ids match and still fails when ids differ.
Date: 2026-05-05

Decision: Start with deterministic duplicate grouping before any fuzzy matching.
Rationale: Fuzzy merge can hide distinct work if it is too aggressive. A deterministic key based on sync-safe fields can solve the obvious duplicate-looking rows first, and possible-duplicate UI can be added later.
Date: 2026-05-05

## Outcomes & Retrospective

This plan is active and has not been implemented yet. Fill this section when the UI, backend reconciliation, tests, and smoke proof are complete. The retrospective should compare the shipped behavior against the repeated-run smoke test and call out any remaining duplicate cases that still require manual merge or later fuzzy matching.

## Context and Orientation

This work belongs to the existing-codebase Doctor Pass workspace in `apps/web`. The protected list route is `apps/web/app/(workspace)/workspace/findings/page.tsx`, and the detail route is `apps/web/app/(workspace)/workspace/findings/[findingId]/page.tsx`. Both routes gate access through `loadWorkspacePageAccess`, redirect non-existing-codebase buyers, and preload Convex data through `fetchAuthenticatedQuery`.

The current findings UI lives under `apps/web/app/(workspace)/_components/existing-codebase-findings/`. The main page component is `workspace-findings-page.tsx`; it currently titles the surface `Top 9 ledger`, shows a summary with uploaded and visible counts, and renders `WorkspaceFindingsFilters` plus `WorkspaceFindingsLedger`. The ledger rows currently show rank, title, category, severity, confidence, buyer impact, proof, permission, workflow, and status. The current filters only support category and status.

The current read model is `apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts`. It defines the browser-facing `WorkspaceFindingDocument`, row models, filters, labels, detail model, and workflow approval placeholder. It currently hides deleted findings, sorts by `rank`, and marks the first sorted row as recommended first.

The Convex schema is defined from validators in `apps/web/convex/workspace/validators.ts` and registered in `apps/web/convex/schema.ts`. Doctor Pass runs live in `doctorPassRuns`; uploaded structured findings live in `codebaseFindings`. Each finding already stores `projectId`, `doctorPassRunId`, optional `repositoryBindingId`, `findingId`, `rank`, `status`, `title`, `category`, `severity`, `confidence`, `buyerImpact`, `blastRadius`, `proofPath`, `proofability`, `permissionRequired`, `recommendedWorkflowId`, `whyThisNow`, `evidenceRefs`, optional `blockedReason`, `syncSensitivity`, `localReportRef`, `createdAt`, `updatedAt`, and optional `deletedAt`.

The upload path is implemented in `apps/web/convex/workspace/model.ts` by `syncFindingsForApprovedDoctorPassRun`. It validates the approved digest with `createApprovedFindingsDigest` from `apps/web/convex/workspace/approved_findings_digest.ts`, then patches by `projectId` plus `findingId` or inserts a new `codebaseFindings` row. The list query is `listWorkspaceFindingsHandler`, exported through `apps/web/convex/workspace.ts` as `api.workspace.listWorkspaceFindings`.

The smoke-test driver note is in `RUNNER_SMOKE_CHECKLIST.md` under `/workspace/findings` and `Repeated Doctor Pass uploads reconcile findings predictably`. That section defines the failure this plan must close: multiple Doctor Pass uploads leave mixed old and new findings in the same `Top 9 ledger`, duplicate-looking intake or Codex-auth rows appear, and there is no clear way to tell which rows are current bot todos.

Use these plain-language definitions throughout implementation. A Doctor Pass run is one local analysis attempt and upload approval cycle. A finding observation is one structured finding emitted by one Doctor Pass run. A work item is the current bot todo created from one or more observations that represent the same underlying issue. A cluster is the group of observations linked to one work item. Active means this is available for bot work now. Latest means it came from the most recent uploaded Doctor Pass run. Historical means it came from any uploaded run. Hidden means the user intentionally removed it from normal views without deleting the approved record. Done means the issue was resolved or completed and should not appear in the default active inbox.

### In Scope

This plan includes the findings IA rename from `Top 9 ledger` to `Active work items` or `Recommended next work`, a tabbed view for `Active`, `Latest Doctor Pass`, `All findings`, `Hidden`, and `Done`, backend query support for those scopes, row metadata for run id and seen-state, deterministic duplicate grouping, lifecycle fields for active, superseded, hidden, and done states, actions to hide or restore a finding and hide all observations from a run, tests for repeated uploads, and smoke checklist updates.

The first implementation slice should be intentionally small. It should make the default page show active/latest-scoped work instead of a mixed project-rank ledger, add the main tabs, add run metadata to rows, and keep the digest contract unchanged. Durable cluster records, bulk actions, and done resolution can be added in the next milestone when the read shape is proven.

### Out Of Scope

This plan does not expose raw source, raw local logs, Codex transcripts, credentials, full local reports, local absolute paths, screenshots with sensitive data, or unapproved artifacts. It does not change the approved findings digest payload or approve additional fields for upload. It does not run Doctor Pass, regenerate findings, start bot workflows, create branches, open pull requests, alter checkout or entitlement behavior, or weaken route access checks.

This plan does not require machine-learning fuzzy duplicate detection. If deterministic grouping cannot confidently prove two observations represent the same issue, keep them separate or mark them as possible duplicates for a later manual merge flow. Do not silently hide possible duplicates from active work.

## Plan of Work

Start with the read model and backend contract. Add an explicit findings scope argument to the authenticated list query rather than overloading category or status filters. The intended scopes are `active`, `latest_doctor_pass`, `all`, `hidden`, and `done`. Keep the existing query behavior available only if another caller depends on it, but make `/workspace/findings` request the new default scope.

Add lifecycle and grouping support in Convex. The simplest safe schema can either extend `codebaseFindings` with lifecycle and grouping fields or add a separate work-item table. Prefer a separate table when implementation reaches durable dedupe, because every Doctor Pass upload is an observation and the active bot todo is a different concept. A practical naming direction is `codebaseFindingWorkItems` for clusters and `codebaseFindings` for observations. If the first slice does not add a new table, it must still add enough fields or derived read logic to stop mixed project-rank results from appearing by default.

Keep upload digest validation exactly where it is. After `uploadDigest !== args.previewDigest` has been ruled out, normalize each approved finding, compute a deterministic canonical issue key from sync-safe fields, link or create the work item, and update last-seen metadata. Candidate fields for the canonical key are normalized `title`, `category`, `recommendedWorkflowId`, `proofability`, `permissionRequired`, and stable evidence ref identifiers. Do not include raw evidence summaries in browser models or key material that could reveal source.

Define lifecycle transitions plainly. A newly seen unhidden unresolved issue is `active`. A work item that was active but is not seen in the latest uploaded run becomes `superseded` or `not_seen_in_latest` for display, unless it is already `done` or `hidden`. A user-hidden item is excluded from active and latest default display but appears in `Hidden`. A completed workflow or manual resolution marks a work item `done`, and it appears in `Done`. If a done item is seen again in a later run, reopen it only if the product explicitly chooses that behavior in the Decision Log during implementation; otherwise show it as a new active observation linked to the old done cluster.

Then update the UI components. Rename the page heading and support copy in `workspace-findings-page.tsx` so the default view reads as operational work, not a ledger. Replace the current category/status-only filter header with tab controls for the scopes, keeping category and status as secondary filters. Add row metadata in `workspace-findings-ledger.tsx` for `Generated by`, `Last seen`, `Seen in`, and lifecycle state. The latest run tab should show the exact approved output for the most recent uploaded run in rank order and may show duplicate grouping badges without hiding rows from that exact snapshot.

Add focused actions only when backend support exists. The first durable actions should be `Hide finding`, `Restore finding`, `Mark done`, and `Hide this run from Active`. These actions must be Convex mutations with authentication and workspace ownership checks, not local React state. Each action should update lifecycle fields without deleting approved findings. Existing privacy deletion from the Privacy surface can stay separate and destructive, because it has a different meaning.

Update the detail route and model so opening a finding shows both work-item state and observation history. The detail page should state whether the item is active, hidden, done, superseded, or only present in historical observations. It should show the latest observation's safe fields by default and provide a small run history list for the cluster. It must continue to exclude evidence summaries and raw local artifacts.

Finally, update tests and smoke checklist expectations. Unit tests should prove scope filtering, latest-run selection, deterministic grouping, lifecycle transitions, and row metadata. Integration-ui tests should render repeated-run fixtures with duplicate-looking findings and assert that the default tab does not show confusing duplicate rows while `Latest Doctor Pass` and `All findings` still allow inspection. Convex tests or model-level tests should prove digest validation happens before reconciliation and that hidden or done state does not change the approved finding payload.

## Milestones

The first milestone is the safe default view. At the end of this milestone, `/workspace/findings` no longer behaves like a raw project-rank ledger. It opens to active/latest-scoped work, has `Active`, `Latest Doctor Pass`, and `All findings` tabs, and rows show which Doctor Pass run generated or last saw the item. Run the findings read-model unit tests and integration-ui page test. Success means a repeated-run fixture no longer shows mixed old and new rank rows in the default view.

The second milestone is durable lifecycle state. At the end of this milestone, backend data can represent active, hidden, done, and superseded work without deleting approved findings. The UI includes `Hidden` and `Done` tabs, and mutations exist for hide, restore, and mark done. Run focused Convex/model tests plus the findings UI tests. Success means hidden and done items leave the active inbox but remain inspectable in their tabs.

The third milestone is deterministic duplicate clustering. At the end of this milestone, new Doctor Pass uploads compute a canonical issue key after digest validation, link observations to a work item, and update first-seen, last-seen, seen-count, and latest-run metadata. The UI shows grouped duplicate indicators and observation history. Run upload/reconciliation tests with same-id and different-id duplicate-looking fixtures. Success means multiple `Codebase intake probe artifact is missing` observations appear as one active work item with clear run history, not several indistinguishable rows.

The fourth milestone is end-to-end smoke proof and documentation. At the end of this milestone, `RUNNER_SMOKE_CHECKLIST.md` reflects the new expected behavior, focused tests pass, browser proof covers desktop and mobile when authentication allows, and broad repo gates pass. Success means the repeated Doctor Pass smoke-test item can be checked off with specific evidence.

## Concrete Steps

From the repository root, confirm the current files and failure before editing:

    rg -n "Top 9 ledger|buildWorkspaceFindingsLedgerModel|listWorkspaceFindings|syncFindingsForApprovedDoctorPassRun" apps/web RUNNER_SMOKE_CHECKLIST.md
    sed -n '55,120p' 'apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-findings-page.tsx'
    sed -n '260,325p' 'apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts'
    sed -n '3176,3282p' apps/web/convex/workspace/model.ts

Expected observation: the page title is `Top 9 ledger`, the read model sorts all rows by `rank`, the upload path patches only matching `findingId`, and the list query slices the first nine project findings by rank.

For the first implementation slice, edit these files:

    apps/web/convex/workspace/validators.ts
    apps/web/convex/schema.ts
    apps/web/convex/workspace/model.ts
    apps/web/convex/workspace.ts
    apps/web/app/(workspace)/workspace/findings/page.tsx
    apps/web/app/(workspace)/workspace/findings/[findingId]/page.tsx
    apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts
    apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-findings-page.tsx
    apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-findings-filters.tsx
    apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-findings-ledger.tsx

Add tests or update existing tests here:

    apps/web/tests/unit/workspace-findings-read-model.test.ts
    apps/web/tests/integration-ui/workspace-findings-page.test.tsx
    apps/web/tests/integration-ui/workspace-finding-detail-page.test.tsx
    apps/web/tests/unit/workspace-runner-events.test.ts

Use `workspace-runner-events.test.ts` only if upload reconciliation changes are implemented in `apps/web/convex/workspace/model.ts`; otherwise keep Convex-specific proof in the narrower test file that already owns the touched behavior.

For the first slice, make `/workspace/findings/page.tsx` fetch a new scoped query that returns active/default findings and enough metadata for tabs. If the new query needs run history, use existing `doctorPassRuns` indexes instead of making the browser infer latest run from local report refs. The default route should not fetch all history and slice in the client when Convex can answer the requested scope.

After the first slice, run:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-findings-page.test.tsx tests/integration-ui/workspace-finding-detail-page.test.tsx
    bun run --cwd apps/web typecheck

Expected observation: the unit tests prove repeated-run fixtures, and the integration UI test can find the new `Active` and `Latest Doctor Pass` controls while no longer requiring the `Top 9 ledger` heading.

For the durable lifecycle and clustering slice, add schema fields or a new table, then run Convex codegen if the repo requires it for generated types. Do not switch Convex into local mode. Use hosted Convex dev for runtime validation.

When implementation changes the user-facing smoke contract, update:

    RUNNER_SMOKE_CHECKLIST.md

The checklist should say that `/workspace/findings` defaults to active work items, latest-run output is available separately, old observations are historical or superseded, and duplicate-looking issues are grouped or clearly linked.

Before completion, run the focused checks first and then broad gates:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts tests/unit/workspace-runner-events.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-findings-page.test.tsx tests/integration-ui/workspace-finding-detail-page.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-05-findings-active-work-items.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-05-findings-active-work-items.md RUNNER_SMOKE_CHECKLIST.md
    git diff --check

If browser authentication allows, start the app and inspect desktop and mobile:

    bun run --cwd apps/web dev:web:only -- -p 3105

Then open `/workspace/findings` in an authenticated existing-codebase workspace with at least two uploaded Doctor Pass runs. Verify no text overlap, clear tab state, run metadata on each row, and no raw source, raw logs, Codex transcripts, or local absolute paths.

## Validation and Acceptance

The plan is accepted when repeated Doctor Pass uploads reconcile predictably. A workspace with two uploaded Doctor Pass runs must open `/workspace/findings` to an active-work view that does not mix old and new rank rows as if they are one Top 9 list. The user must be able to switch to the latest Doctor Pass snapshot and see that run's exact approved output in run-rank order. The user must be able to switch to all findings and inspect historical observations without confusing them for current bot todos.

Duplicate-looking findings are accepted when same-underlying issues are represented as one active work item or as an explicit cluster with observation history. The row should make clear which run generated or last saw it, how many times it has been seen, and whether it is active, superseded, hidden, or done.

Old findings are accepted when they remain inspectable but leave the default active inbox unless they are still current work. Hidden and done findings must be easy to reach from their tabs. Hiding a run or finding must not delete local Doctor Pass reports, approved run history, or raw local artifacts; it only changes workspace visibility and lifecycle state.

Privacy is accepted when the browser and Convex outputs remain sync-safe. The implementation must not render raw source excerpts, local logs, Codex transcripts, secrets, credentials, full local reports, local absolute paths, or unapproved artifacts. Evidence summaries must stay out of browser read models unless a separate privacy review changes that policy.

Digest safety is accepted when approved findings digest validation still compares the exact approved payload before any reconciliation logic changes lifecycle fields, clusters observations, or updates work items.

### Test Commands

Run these commands from the repository root before marking the plan complete:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-findings-read-model.test.ts tests/unit/workspace-runner-events.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-findings-page.test.tsx tests/integration-ui/workspace-finding-detail-page.test.tsx
    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-05-findings-active-work-items.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-05-findings-active-work-items.md RUNNER_SMOKE_CHECKLIST.md
    git diff --check

Manual browser verification is also required for the final UI if an authenticated existing-codebase session is available. Verify one desktop viewport and one mobile viewport. If Clerk authentication prevents browser proof in the local environment, record the exact limitation in `Progress` and `Outcomes & Retrospective`, and rely on integration-ui tests plus app typecheck for rendered proof.

## Idempotence and Recovery

All reconciliation should be safe to rerun. Uploading the same approved Doctor Pass run again should not create extra work items or duplicate observations beyond the existing idempotent upload behavior. If a work item already exists for the deterministic issue key, update its last-seen metadata and link the observation; do not create a second active work item.

If a migration adds a new table or fields, write the code so old documents without the fields can still render. Treat missing lifecycle fields as active only when the finding is from the latest uploaded run and is not deleted or done. Treat missing grouping fields as unclustered observations until a later upload or explicit backfill links them.

If deterministic grouping proves too broad during implementation, stop and narrow the key rather than hiding possible distinct findings. It is acceptable for a first slice to show two separate active rows with a possible-duplicate badge; it is not acceptable to silently suppress one.

If browser route changes fail under access guards, restore the existing `loadWorkspacePageAccess` and fulfillment-track redirect behavior before continuing. This plan must not weaken protected route access.

If a broad validation command fails because of unrelated dirty worktree changes, record the failing command and evidence, run the narrow checks for the touched findings surface, and do not claim full repo completion until the unrelated failure is separated or fixed.

## Artifacts and Notes

Current evidence for the bug:

    RUNNER_SMOKE_CHECKLIST.md says repeated Doctor Pass uploads should not leave mixed old and new findings in the same Top 9 ledger with repeated ranks and duplicate-looking titles.
    apps/web/app/(workspace)/_components/existing-codebase-findings/workspace-findings-page.tsx currently renders the H1 Top 9 ledger.
    apps/web/app/(workspace)/_lib/workspace-findings-read-model.ts currently sorts rows by rank without run scope.
    apps/web/convex/workspace/model.ts currently lists project findings by rank and slices to MAX_SYNCED_FINDINGS_PER_RUN.

Expected final smoke evidence should look like this in prose, not as a raw transcript:

    Uploaded Doctor Pass run A with 9 findings.
    Uploaded Doctor Pass run B with overlapping intake-probe and Codex-auth findings.
    Opened /workspace/findings.
    Active tab showed one current work item for each same-underlying issue, with last seen run B and seen count greater than 1.
    Latest Doctor Pass tab showed run B's approved output in rank order.
    All findings tab showed historical observations with run labels.
    Hidden and Done tabs did not affect the approved upload digest or expose local-only artifacts.

## Interfaces and Dependencies

Use existing Next App Router route patterns in `apps/web/app/(workspace)/workspace/findings/page.tsx` and `apps/web/app/(workspace)/workspace/findings/[findingId]/page.tsx`. Keep `loadWorkspacePageAccess`, `AccessRequiredPage`, existing-codebase fulfillment-track gating, and `fetchAuthenticatedQuery`.

Use Convex validators in `apps/web/convex/workspace/validators.ts` for every new query or mutation argument and return value. Export public queries and mutations through `apps/web/convex/workspace.ts`. Keep sensitive internal helpers private inside `apps/web/convex/workspace/model.ts` unless the browser needs a narrow authenticated API.

Use existing schema registration in `apps/web/convex/schema.ts`. If adding indexes, name every indexed field in index order, following the existing Convex guideline. Likely useful indexes include project plus lifecycle status, project plus work item id, Doctor Pass run id plus rank, and project plus canonical issue key.

Use the approved digest helpers in `apps/web/convex/workspace/approved_findings_digest.ts` without changing the digest payload unless a separate privacy and compatibility plan explicitly does so. Reconciliation must happen after digest validation.

Use the existing app UI system and design rules from `DESIGN.md` and `docs/ship-by-sunday/design-pack/`. The findings page is an operational app surface: use restrained tabs, dense rows, clear state labels, and utility copy. Do not turn it into a marketing hero or decorative dashboard.

Use tests in `apps/web/tests/unit/` and `apps/web/tests/integration-ui/` as the primary proof surface. Add repeated-run fixtures with distinct Doctor Pass run ids, duplicate-looking finding titles, different ranks, and both same and different `findingId` values.
