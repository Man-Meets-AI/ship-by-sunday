---
title: Doctor Pass And Sync Preview
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Productize the branchless existing-codebase doctor pass so passive local probes and `codex exec` produce local reports, a sync-safe preview, and approved findings upload.
post_build_recap: The doctor-pass slice now has scanner Markdown/JSON output under `.sbs/intake-probe/`, local-runner `doctor-pass run/upload`, branchless local artifacts, Codex JSONL interpretation, approval-gated runner upload, and a minimal `/workspace/doctor-pass` approval page.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Implementing the existing-codebase doctor pass after setup and local runner pairing exist.
  - Productizing `.sbs/intake-probe/codebase-intake.py`, passive probes, sync-safe findings JSON, or sync preview approval.
  - Verifying that Crawl stays branchless and does not include findings UI, workflow approval, branch creation, managed GitHub, or worker queues.
---

# Doctor Pass And Sync Preview

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Existing-codebase setup becomes valuable when the customer can press `Run doctor pass` and receive a useful diagnosis without handing Ship by Sunday their raw repository. After this change, a paired local runner should run passive read-only probes inside the customer's repo, use local Codex through `codex exec --json` to interpret the evidence, write local reports under `.sbs/`, prepare a sync-safe preview, and upload findings only after the customer approves that preview.

The visible proof is a branchless doctor-pass run. A customer or tester can run the doctor pass in a temporary repository, see stage events progress through the hosted workspace state, inspect local reports such as `.sbs/reports/doctor-pass/<run-id>/codebase-intake.md` and `.sbs/reports/doctor-pass/<run-id>/sync-preview.json`, approve the sync preview, and then see only structured findings uploaded to backend state. This plan deliberately excludes dense findings UI, finding detail screens, workflow approval, branch creation, write leases, PR delivery, managed GitHub, recurring workers, and any mutating repair loop.

## Progress

- [x] 2026-05-04 EDT: Created this child ExecPlan from `planning-brief-2.md`.
- [x] 2026-05-04 EDT: Inspected `.sbs/intake-probe/codebase-intake.py`, `.sbs/intake-probe/codebase-intake.README.md`, the workspace data/events plan, setup UI plan, local runner plan, Program slice ledger, and support-codebases scratch note before authoring.
- [x] 2026-05-04 EDT: Re-inspected current local runner implementation, workspace data/events implementation, setup UI implementation, scanner state, OpenAI Codex docs through the OpenAI developer docs MCP, local Codex behavior constraints from the prior runner plan, Convex guidance, release workflow guidance, Next.js App Router docs, and UI design guidance before implementation.
- [x] 2026-05-04 EDT: Added `--markdown-output` and `--json-output` to `.sbs/intake-probe/codebase-intake.py` while preserving default `codebase-shape.md` Markdown behavior.
- [x] 2026-05-04 EDT: Added scanner fixture tests under `.sbs/intake-probe/tests/` proving JSON output, stable evidence ids, and exclusion of env files, lockfiles, dependency/generated folders, `.codex`, `.cursor`, `.claude`, and scanner files.
- [x] 2026-05-04 EDT: Implemented passive doctor-pass orchestration in `packages/local-runner/src/commands/doctor-pass.ts` and `packages/local-runner/src/core/doctor-pass/`.
- [x] 2026-05-04 EDT: Implemented `repo-doctor-top-nine` through the existing `codex exec --json` wrapper with schema-constrained output, local JSONL events, local prompt/output artifacts, and sync-safe finding validation.
- [x] 2026-05-04 EDT: Implemented sync preview generation, approval-gated findings upload, runner doctor-pass start/upload HTTP routes, Convex credential-backed mutations, and runner doctor events through the existing workspace state model.
- [x] 2026-05-04 EDT: Added a minimal `/workspace/doctor-pass` page that shows preview status, digest, local report ref, and user-owned sync preview approval without dense findings UI or workflow approval.
- [x] 2026-05-04 EDT: Added focused scanner, runner, backend, API, and UI validation.
- [x] 2026-05-04 EDT: Refreshed this ExecPlan with validation evidence and updated the Program slice ledger to mark doctor pass complete. No durable Program contract changed because the existing Program already captured the local-runner, privacy, approval, and execution-surface boundaries.
- [x] 2026-05-04 EDT: Fixed review findings around sync approval safety and retry behavior: preview approval now binds to the exact findings upload digest, runner start uses the local run id as an idempotency key, upload retries are accepted after the first successful upload, approval audit fields are stored on the run, and malformed scanner/Codex output produces blocked artifacts instead of aborting the doctor-pass run.
- [x] 2026-05-04 EDT: Fixed the second review pass: the public `syncApprovedCodebaseFindings` mutation now requires and verifies the approved digest through the same shared helper as the runner-token path, and malformed `codebase-intake.json` is converted to a blocked probe before event emission, evidence packet generation, and doctor-pass report generation.

## Surprises & Discoveries

The scanner source re-entered the worktree under `.sbs/intake-probe/` rather than the original root-level `.sbs/codebase-intake.py` path. Implementation followed the new location, updated README usage there, and added tests under `.sbs/intake-probe/tests/`.

The local runner plan records local Codex source findings that matter here. `codex exec --json` emits newline-delimited events on stdout, diagnostics on stderr, and schema-constrained final assistant text inside the final agent message. Doctor-pass code must parse events by `type`, persist `thread.started.thread_id` when a run needs resume, parse the final assistant message text as JSON, and keep full Codex output local unless the user explicitly shares it.

The workspace data/events plan already names doctor-pass runs, codebase findings, and sync-safe runner events as durable backend concepts. This plan should use those contracts and extend them only where necessary for sync preview approval or findings upload. It must not invent a second existing-codebase state model.

The local `python3` environment did not have `pytest` installed, so the exact `python3 -m pytest ...` scanner test command failed with `No module named pytest`. The same scanner tests passed with `uvx --from pytest python -m pytest .sbs/intake-probe/tests/test_codebase_intake.py`, which kept pytest out of repository dependencies.

Review found that the first preview digest covered only a small finding projection while upload sent full findings. The fix changed the digest to cover the exact normalized findings upload payload and validates that digest both locally before upload and server-side before storage.

Review also found that network retries could create duplicate backend start rows or fail after a successful upload response was lost. The runner now sends the local doctor-pass run id to the start route, Convex reuses an existing run for that runner/local-run-id pair, and approved uploads remain retryable after the run reaches `syncPreviewStatus: "uploaded"`.

The second review found that the public findings sync mutation still bypassed digest recomputation and that malformed scanner JSON was converted to blocked state too late in the local audit trail. The shared sync helper now enforces the approved digest for both public and runner-token uploads, and scanner JSON is validated before queuing the `codebase-intake` probe event or writing the evidence packet.

## Decision Log

Decision: Keep the doctor pass branchless and passive in Crawl.
Rationale: The first AHA should diagnose without surprising customers or touching app behavior. The runner may read files, Git metadata, package manifests, command maps, and local Codex setup state, but it must not create a branch, write app files, install packages, run migrations, start services, push, open PRs, or execute deep project commands during this plan.
Date: 2026-05-04

Decision: Productize `codebase-intake` as local Markdown plus sync-safe JSON.
Rationale: The current Markdown report is useful for the customer and local agents, but it can include repo trees, file paths, line references, and short samples that should stay local by default. The web app needs a narrower JSON companion with stable finding candidates, evidence refs, scores, and report metadata.
Date: 2026-05-04

Decision: Treat Codex as an interpreter over deterministic evidence, not the only scanner.
Rationale: Passive probes are fast, repeatable, and easy to privacy-bound. Codex should read a prepared evidence packet and produce ranked recommendations, but deterministic probes should own repo shape, command map, setup audit, and raw evidence collection.
Date: 2026-05-04

Decision: Require sync preview approval before uploading findings.
Rationale: Local mode can truthfully promise that raw source, logs, and transcripts stay local only if the customer sees what will sync before upload. The runner should upload a preview summary event first, then upload the structured findings only after explicit web or terminal approval.
Date: 2026-05-04

Decision: Use `codex exec --json` and `sbs-doctor-readonly` for Codex interpretation.
Rationale: The local runner plan established `codex exec --json` as the first automation boundary and `sbs-doctor-readonly` as the read-only Crawl profile. Doctor-pass interpretation should reuse that boundary instead of direct app-server integration.
Date: 2026-05-04

Decision: Keep dense findings UI and workflow approval out of this plan.
Rationale: This slice proves the diagnosis pipeline and approved sync boundary. The next child plan should render the dense Top 9 ledger and finding decision screens from uploaded findings. Workflow approval, branch creation, write leases, PR delivery, and worker queues start after findings exist.
Date: 2026-05-04

Decision: Treat deep probes as a later approval boundary.
Rationale: `.sbs/intake-probe/codebase-intake.py --deep`, tests, builds, scanners, provider CLIs, dependency audits, browser automation, and project commands can be valuable, but they increase runtime, side effects, network, and local environment risk. This plan may record deep candidates, but it must not run them without a separate approval model.
Date: 2026-05-04

Decision: Add runner-owned start and findings-upload routes instead of letting the browser expose runner credential material.
Rationale: The runner already owns the bearer token and the browser owns preview approval. `POST /api/workspace/runner/doctor-pass/start` and `POST /api/workspace/runner/findings` hash the bearer token server-side and delegate to Convex mutations that validate runner ownership, digest match, and approved preview state. This preserves the approval boundary without adding worker queues.
Date: 2026-05-04

Decision: Use the doctor-pass run row and upload result state instead of introducing a `doctor.findings.uploaded` runner event in this slice.
Rationale: The existing workspace model already records `findings_uploaded` and `syncPreviewStatus: "uploaded"` when approved findings sync succeeds. Adding another event type would widen the event contract without improving the current UI proof.
Date: 2026-05-04

Decision: Bind sync preview approval to the exact normalized findings upload payload.
Rationale: A digest over only a preview summary lets local findings change after approval. The approved digest now covers the same structured finding fields that upload can store, and both the runner and backend recompute it before accepting an upload.
Date: 2026-05-04

Decision: Use local doctor-pass run ids as runner start idempotency keys.
Rationale: The runner already creates the local run id before contacting the backend. Sending that id lets the backend safely return the same doctor-pass run when a start response is lost and the runner retries.
Date: 2026-05-04

## Outcomes & Retrospective

Implemented the branchless doctor-pass prototype end to end. `.sbs/intake-probe/codebase-intake.py` now preserves default Markdown output and can also write explicit Markdown and sync-safe JSON artifacts. `packages/local-runner` now exposes `ship-by-sunday doctor-pass run` and `ship-by-sunday doctor-pass upload --run-id <id>`, writes the planned local `.sbs/reports/doctor-pass/<run-id>/` artifacts, runs deterministic probes, calls Codex through `codex exec --json`, stores full prompt/events/output locally, generates findings and a preview digest, and sends only sync-safe runner events.

The web/backend side now has credential-backed runner routes for starting a doctor-pass run and uploading approved findings, plus Convex mutations that validate bearer-token hashes server-side, require a matching approved preview digest before upload, recompute the exact findings payload digest before storage, store approval audit fields, and reuse the existing idempotent codebase findings sync path. `/workspace/doctor-pass` now shows preview status, digest, local report ref, and a user-owned approval action. Dense findings UI, reject/expire controls, workflow approval, branch creation, write leases, PR delivery, managed GitHub, deep probes, and worker queues remain deferred to later plans.

## Context and Orientation

The existing-codebase workspace Program lives at `docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md`. The relevant scratch note is `support-codebases.md`. The active setup route plan is `docs/exec-plans/active/2026-05-04-existing-codebase-setup-ui.md`. The backend state plan is `docs/exec-plans/active/2026-05-04-existing-codebase-workspace-data-model-and-events.md`. The local runner plan is `docs/exec-plans/active/2026-05-04-local-runner-prototype.md`.

The scanner prototype lives in `.sbs/intake-probe/codebase-intake.py` with notes in `.sbs/intake-probe/codebase-intake.README.md`. It currently performs a passive filesystem and Git scan, skips dependency folders, generated folders, lockfiles, local env files, and AI/editor tooling, detects stack and command surfaces, flags passive risk signals, and writes an interpretive Markdown report. This plan turns that script into one passive probe inside a larger doctor-pass run.

A doctor pass is the branchless diagnosis run after setup. A passive probe is a local read-only step that gathers evidence without mutating repo or machine state. A finding is a sync-safe structured issue or opportunity that the product can rank and later route into a workflow. A sync preview is the local JSON artifact and web approval state that shows exactly which structured fields will be uploaded before upload happens.

The local runner package is expected to live under `packages/local-runner/` after the local-runner plan lands. This doctor-pass plan depends on that package for pairing state, local `.sbs/` paths, event outbox behavior, setup health, Codex profile selection, redaction, and `codex exec` spawning. If this plan is implemented before the runner package exists, create only the scanner JSON work and update this plan with the blocked runner dependency rather than building a second runner.

The web app lives under `apps/web`. Existing-codebase backend state should live in the workspace Convex module from the data/events plan, not in generated-codebase tables. Minimal doctor-pass progress UI may live under `apps/web/app/(workspace)/workspace/doctor-pass/page.tsx`, but dense findings UI belongs to the later findings ledger plan.

Before implementation changes `apps/web`, read `apps/web/AGENTS.md`, `docs/release-workflow.md`, root `DESIGN.md`, and `docs/ship-by-sunday/design-pack/AGENTS.md`. Before Convex changes, read `apps/web/convex/_generated/ai/guidelines.md` and use hosted Convex dev only. Before Codex behavior changes, refresh official Codex docs through the OpenAI developer docs MCP and recheck the local runner plan's Codex source findings.

### In Scope

This plan includes passive doctor-pass probe orchestration, `.sbs/intake-probe/codebase-intake.py` JSON output, local Markdown reports, local evidence manifests, command-proof mapping without executing project commands, Codex setup audit, `repo-doctor-top-nine` Codex interpretation through `codex exec --json`, `source-truth-agent-readiness` as a read-only readiness probe, sync-safe Top 9 findings JSON, sync preview generation, sync preview approval, approved findings upload, runner stage events, blocked-proof state for doctor-pass failures, focused validation, and Program/ExecPlan refresh.

The default passive probe set is `codebase-intake`, `command-proof-map`, `codex-setup-audit`, `repo-doctor-top-nine`, and `source-truth-agent-readiness`. Conditional passive probes may produce additional evidence only when the trigger is available without running app code: `broken-app-triage` when the customer supplied an error or reproduction note, `revenue-path-audit` when auth, billing, checkout, entitlement, webhook, or provider surfaces are detected, and `ux-conversion-snapshot` when screenshots or already-available static artifacts exist.

The sync-safe finding shape should include `id`, `title`, `category`, `severity`, `confidence`, `buyerImpact`, `blastRadius`, `proofPath`, `permissionRequired`, `recommendedWorkflowId`, `whyThisNow`, `evidenceRefs`, `blockedReason`, `syncSensitivity`, and `localReportRef`. Evidence refs default to repo-relative file paths, line numbers, command names, and local artifact ids only.

The local report folder should live under `.sbs/reports/doctor-pass/<run-id>/`. Expected local artifacts include `codebase-intake.md`, `codebase-intake.json`, `command-proof-map.json`, `codex-setup-audit.json`, `evidence-packet.json`, `repo-doctor-top-nine.prompt.md`, `repo-doctor-top-nine.events.jsonl`, `repo-doctor-top-nine.output.json`, `source-truth-agent-readiness.json`, `doctor-pass.md`, `findings.json`, `sync-preview.json`, and `redaction-report.json`.

### Out Of Scope

This plan does not implement checkout intent routing, `/workspace/setup`, local runner pairing, local runner daemon basics, Codex config patching, `gh` setup, setup check execution, dense `/workspace/findings` UI, `/workspace/findings/[findingId]`, workflow approval sheets, workflow packets for write work, write leases, branch creation, local diffs, PR delivery, managed GitHub, always-on workers, package/update-channel mechanics, generated-repo operating pack work, or full privacy deletion/export mechanics.

This plan must not run deep probes by default. It must not run tests, builds, linters, migrations, dependency installs, provider CLIs, browser automation, external scanners, networked audits, or long-running services unless a later approval contract owns that behavior.

This plan must not upload raw source, raw terminal logs, local absolute paths, secrets, screenshots with sensitive data, full Markdown reports, full Codex transcripts, or full Codex JSONL event streams by default. It must not mutate root `AGENTS.md`, package scripts, lockfiles, app source, env files, provider config, migrations, generated folders, or Git branches.

## Plan of Work

Start with scanner productization. Update `.sbs/intake-probe/codebase-intake.py` so default behavior still writes the current Markdown report, but new flags can direct outputs into a doctor-pass run folder. Add a Markdown output flag such as `--markdown-output <path>` and a JSON output flag such as `--json-output <path>`. The JSON output should be structured and sync-aware: repo shape, detected stack, command candidates, hotspot summaries, passive risk rows, stack audit rows, recommended inspection targets, scanner metadata, and sensitivity labels. Preserve passive default behavior and do not make `--deep` part of the doctor-pass default.

Then add scanner tests or fixture proof. Use small fixture repositories under the package or script test layout rather than scanning this whole repository in every unit test. The tests should prove that the script writes both Markdown and JSON, excludes `.env`, `.codex`, `.cursor`, `.claude`, dependency folders, generated folders, lockfiles, and its own scanner files, and emits stable finding or evidence ids that do not depend on local absolute paths.

Next, add doctor-pass orchestration to the local runner. Expected ownership is under `packages/local-runner/src/core/doctor-pass/` and `packages/local-runner/src/commands/doctor-pass.ts` after the local runner package exists. The runner should create a `doctorPassRunId`, prepare `.sbs/reports/doctor-pass/<run-id>/`, emit `doctor.stage.started`, run each passive probe with timeouts, write local artifacts atomically, emit `doctor.probe.completed` or `doctor.probe.blocked`, and stop with blocked proof if a required passive step cannot complete.

After deterministic probes, build the local evidence packet. This packet should summarize evidence for Codex without including full source files or long logs. It can include repo-relative paths, line numbers, command names, file category counts, risk labels, detected frameworks, package scripts, and local artifact references. Store the full packet locally as `evidence-packet.json` and create a stricter `codex-evidence-packet.json` if Codex needs a prompt-optimized shape.

Then implement `repo-doctor-top-nine` interpretation through the existing `codex exec` wrapper from the local runner plan. Use `codex exec --cd <repoRoot> --profile sbs-doctor-readonly --sandbox read-only --json --output-schema <schemaPath> -`, feed the doctor prompt over stdin, parse JSONL events by `type`, keep full event streams local, parse the final assistant message text as JSON, and validate it against the Top 9 schema. Do not use `--skip-git-repo-check` for real repos, do not use `--dangerously-bypass-approvals-and-sandbox`, and use `--ephemeral` only if the product intentionally does not need resume for that interpretation run.

Then add `source-truth-agent-readiness` as a read-only probe, not the write workflow. It should assess whether the repo has clear agent instructions, command maps, proof commands, test/build/lint scripts, owner docs, and safe future workflow boundaries. It may recommend the later `source-truth-agent-readiness` write workflow, but it must not edit docs or create a branch during Crawl.

After all probes finish, generate local reports. `doctor-pass.md` should be readable locally and may include richer context than the synced payload. `findings.json` should contain the full local structured findings. `sync-preview.json` should contain only the fields that will be uploaded, plus a redaction report and a list of excluded local artifacts. The runner should emit `doctor.sync_preview.ready` with only a sync-safe summary, not the full preview contents if the backend contract has not approved that storage.

Then implement sync preview approval. In web/backend state, the customer should be able to approve a specific `doctorPassRunId` sync preview. Approval should record approver identity, timestamp, preview digest, schema version, and the runner or source that produced it. After approval, the runner uploads the approved findings and the backend records the run/upload state as uploaded. Reject and expiry controls remain a later UI/backend slice; without approval, the runner keeps local reports and does not upload findings.

Finally, add the minimal doctor-pass progress and preview surface if it is not already available. This surface can live at `/workspace/doctor-pass` and should show stage progress, probe rows, local-only versus sync-safe labels, sync preview summary, and `Approve sync preview`. It must not be the dense Top 9 findings ledger, must not show finding detail decision screens, and must not include `Approve workflow`, branch, PR, or queue controls.

## Milestones

The first milestone is scanner JSON output. It is complete when `.sbs/intake-probe/codebase-intake.py` can still produce the current passive Markdown report and can also write machine-readable JSON to an explicit output path, with fixture proof that local absolute paths, secrets, env files, lockfiles, dependency folders, generated folders, and AI/editor tooling are excluded or labeled local-only.

The second milestone is passive probe orchestration. It is complete when the local runner can create a doctor-pass run folder, run `codebase-intake`, `command-proof-map`, and `codex-setup-audit` without mutating the repo, emit sync-safe stage events, and leave local artifacts under `.sbs/reports/doctor-pass/<run-id>/`.

The third milestone is Codex interpretation. It is complete when the runner can run mocked and optional real `codex exec --json` doctor interpretation with `sbs-doctor-readonly`, parse JSONL events, validate the final Top 9 JSON, handle blocked or failed turns, and keep the full event stream local.

The fourth milestone is sync preview. It is complete when a doctor pass produces `sync-preview.json`, a redaction report, a preview digest, a hosted preview-ready state, and no findings upload until approval.

The fifth milestone is approved findings upload. It is complete when approval of a preview causes only the approved structured findings to be uploaded into the existing-codebase workspace model, with duplicate upload idempotence and rejection of unsafe payload fields.

The sixth milestone is minimal doctor-pass progress UX. It is complete when `/workspace/doctor-pass` or the equivalent setup-linked surface shows stage progress, probe rows, local report refs, sync-safe labels, and preview approval without rendering dense findings rows or workflow approval.

The seventh milestone is validation and Program refresh. It is complete when focused scanner, runner, backend, UI, plan, Program, markdown, and diff checks pass, and this ExecPlan records the evidence.

## Concrete Steps

From the repo root, inspect the current scanner and dependency plans before implementation:

    sed -n '1,260p' .sbs/intake-probe/codebase-intake.README.md
    sed -n '1,220p' .sbs/intake-probe/codebase-intake.py
    rg -n "def parse_args|def main|REPORT_NAME|write_report|--deep|include-tooling" .sbs/intake-probe/codebase-intake.py
    sed -n '1,260p' docs/exec-plans/active/2026-05-04-existing-codebase-workspace-data-model-and-events.md
    sed -n '1,260p' docs/exec-plans/active/2026-05-04-existing-codebase-setup-ui.md
    sed -n '1,260p' docs/exec-plans/active/2026-05-04-local-runner-prototype.md

Read required docs before code changes:

    sed -n '1,220p' AGENTS.md
    sed -n '1,220p' apps/web/AGENTS.md
    sed -n '1,260p' apps/web/convex/_generated/ai/guidelines.md
    sed -n '1,220p' docs/release-workflow.md
    sed -n '1,220p' DESIGN.md
    sed -n '1,220p' docs/ship-by-sunday/design-pack/AGENTS.md

Refresh official Codex docs through the OpenAI developer docs MCP before changing Codex-specific behavior. Confirm `codex exec`, config, sandbox, approval, and JSON or output-schema behavior against the current docs, then preserve any changed facts in this plan before implementation.

Expected scanner ownership is:

    .sbs/intake-probe/codebase-intake.py
    .sbs/intake-probe/codebase-intake.README.md
    .sbs/intake-probe/tests/

Expected local runner ownership, after the local runner package exists, is:

    packages/local-runner/src/commands/doctor-pass.ts
    packages/local-runner/src/core/doctor-pass/doctor-pass-runner.ts
    packages/local-runner/src/core/doctor-pass/passive-probes.ts
    packages/local-runner/src/core/doctor-pass/codebase-intake-probe.ts
    packages/local-runner/src/core/doctor-pass/command-proof-map.ts
    packages/local-runner/src/core/doctor-pass/codex-setup-audit.ts
    packages/local-runner/src/core/doctor-pass/repo-doctor-top-nine.ts
    packages/local-runner/src/core/doctor-pass/source-truth-agent-readiness.ts
    packages/local-runner/src/core/doctor-pass/sync-preview.ts
    packages/local-runner/src/core/doctor-pass/top-nine-schema.ts
    packages/local-runner/src/core/doctor-pass/doctor-pass-events.ts
    packages/local-runner/tests/doctor-pass/

Expected web and Convex ownership, if the data/events plan did not already add these exact surfaces, is:

    apps/web/convex/workspace/doctorPass.ts
    apps/web/convex/workspace/findings.ts
    apps/web/convex/workspace/validators.ts
    apps/web/app/api/workspace/doctor-pass/sync-preview/approve/route.ts
    apps/web/app/api/workspace/doctor-pass/findings/upload/route.ts
    apps/web/app/(workspace)/workspace/doctor-pass/page.tsx
    apps/web/app/(workspace)/_components/doctor-pass/doctor-pass-progress-page.tsx
    apps/web/app/(workspace)/_components/doctor-pass/doctor-pass-stage-list.tsx
    apps/web/app/(workspace)/_components/doctor-pass/sync-preview-approval-panel.tsx

The exact route handler paths can change if the implementation uses Convex actions or mutations directly instead of HTTP routes. Keep the public contract the same: preview approval and findings upload are authenticated, idempotent, scoped to one workspace project and one doctor-pass run, and reject unsafe payloads.

Run scanner validation:

    python3 .sbs/intake-probe/codebase-intake.py --quiet --markdown-output /tmp/sbs-codebase-intake.md --json-output /tmp/sbs-codebase-intake.json
    python3 -m json.tool /tmp/sbs-codebase-intake.json >/tmp/sbs-codebase-intake.pretty.json

Run focused scanner tests after they exist:

    python3 -m pytest .sbs/intake-probe/tests/test_codebase_intake.py

Run focused local runner validation after the local runner package and doctor-pass modules exist:

    bun run --cwd packages/local-runner test -- tests/doctor-pass
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner package:smoke

Run focused web and backend validation if this plan touches app or Convex surfaces:

    bun run --cwd apps/web test:unit -- tests/unit/workspace-doctor-pass.test.ts tests/unit/workspace-sync-preview.test.ts tests/unit/workspace-findings-upload.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/workspace-doctor-pass-api.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-doctor-pass-page.test.tsx
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web lint

Run planning validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-doctor-pass-and-sync-preview.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-doctor-pass-and-sync-preview.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md .sbs/intake-probe/codebase-intake.README.md
    git diff --check

If visible UI changes are implemented, start the app and capture one desktop and one mobile browser proof for `/workspace/doctor-pass`. The proof should show stage progress, local-only labels, sync-safe labels, and the sync preview approval panel without text overlap.

## Validation and Acceptance

The doctor-pass pipeline is accepted when a paired local runner can create a run id, run passive probes, write local reports, run Codex interpretation through the approved read-only execution boundary, create a sync preview, and pause before findings upload. The local `.sbs/reports/doctor-pass/<run-id>/` folder should contain the expected Markdown, JSON, Codex event, schema output, sync preview, and redaction artifacts.

The sync contract is accepted when the preview clearly identifies what will upload and what stays local. Approved upload may include finding title, category, severity, confidence, buyer impact, blast radius, proof path, permission requirement, recommended workflow id, why-now text, repo-relative evidence refs, blocked reason, sync sensitivity, and local report refs. It must not include raw source files, raw terminal logs, local absolute paths, secrets, screenshots with sensitive content, full Markdown reports, full Codex transcripts, or full Codex event streams by default.

The backend contract is accepted when duplicate events and duplicate findings uploads are idempotent by event id, preview digest, run id, or finding id; unauthorized approval or upload attempts fail; unsafe payloads are rejected by validators; and the `/workspace/*` state can distinguish preview ready, approved, uploaded, blocked, and failed doctor-pass states. Reject and expiry state controls are deferred.

The UI contract is accepted when a customer can see doctor-pass status, local report refs, sync preview status, and approve sync preview without seeing dense findings rows, finding detail workflow decisions, branch controls, PR controls, or worker queue controls.

### Test Commands

Run these commands from the repo root after implementation:

    python3 .sbs/intake-probe/codebase-intake.py --quiet --markdown-output /tmp/sbs-codebase-intake.md --json-output /tmp/sbs-codebase-intake.json
    python3 -m json.tool /tmp/sbs-codebase-intake.json >/tmp/sbs-codebase-intake.pretty.json
    python3 -m pytest .sbs/intake-probe/tests/test_codebase_intake.py
    uvx --from pytest python -m pytest .sbs/intake-probe/tests/test_codebase_intake.py
    bun run --cwd packages/local-runner test
    bun run --cwd packages/local-runner lint
    bun run --cwd packages/local-runner typecheck
    bun run --cwd packages/local-runner format:check
    bun run --cwd packages/local-runner build
    bun run --cwd packages/local-runner ship-by-sunday -- --help
    bun run --cwd packages/local-runner package:smoke
    bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts tests/unit/workspace-data-model.test.ts
    bun run --cwd apps/web test:integration -- tests/integration/workspace-runner-api.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-doctor-pass-page.test.tsx
    bun run --cwd apps/web typecheck
    bun run --cwd apps/web lint
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-doctor-pass-and-sync-preview.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-doctor-pass-and-sync-preview.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md .sbs/intake-probe/codebase-intake.README.md
    git diff --check

If the local runner package, web API, or UI slices are not implemented yet when scanner work lands, run the scanner commands and planning validation, then record the missing downstream surfaces in `Progress` instead of claiming the whole doctor-pass plan is complete.

## Idempotence and Recovery

Doctor-pass runs must be safe to retry. Each run writes to a run-id-specific folder under `.sbs/reports/doctor-pass/`. A rerun should create a new run id unless the user explicitly resumes the same run. If a run is interrupted, the runner should keep completed probe artifacts, mark the run blocked or interrupted, and be able to start a new run without deleting prior evidence.

Local file writes should be atomic. Write JSON and Markdown artifacts through temp files in the same directory, then rename them into place. If a temp file remains, the next run should ignore it or report a clear cleanup path.

Sync preview approval must bind to a preview digest. If the local preview changes after approval, the runner must require approval again before upload. If upload fails after approval, the event outbox should retry idempotently without duplicating findings.

Codex interpretation must fail closed. If `codex exec` exits non-zero, emits malformed JSONL, returns a final message that is not valid JSON, or violates the output schema, the runner should keep local diagnostics, emit blocked proof, and not upload findings. It may still upload a sync-safe blocked state if the customer approved or the event contract allows blocked run summaries.

Deep scans remain separate. If a user later approves deep commands, that should create a different run mode or later workflow packet; it should not silently mutate the passive doctor-pass contract.

## Artifacts and Notes

Owning Program: `docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md`.

Planning brief: `docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`.

Prior child plans:

    docs/exec-plans/active/2026-05-04-existing-codebase-checkout-intent-routing.md
    docs/exec-plans/active/2026-05-04-existing-codebase-workspace-data-model-and-events.md
    docs/exec-plans/active/2026-05-04-existing-codebase-setup-ui.md
    docs/exec-plans/active/2026-05-04-local-runner-prototype.md

Scratch note: `support-codebases.md`.

Scanner source:

    .sbs/intake-probe/codebase-intake.py
    .sbs/intake-probe/codebase-intake.README.md

Relevant local Codex source references already folded into the local runner plan:

    /Users/bazelrex/Developer/codex/codex-rs/exec/src/lib.rs
    /Users/bazelrex/Developer/codex/codex-rs/exec/src/exec_events.rs
    /Users/bazelrex/Developer/codex/codex-rs/app-server-protocol/src/protocol/v2.rs

Validation evidence recorded during implementation:

    python3 .sbs/intake-probe/codebase-intake.py --quiet --markdown-output /tmp/sbs-codebase-intake.md --json-output /tmp/sbs-codebase-intake.json
    Wrote: /tmp/sbs-codebase-intake.md

    python3 -m json.tool /tmp/sbs-codebase-intake.json >/tmp/sbs-codebase-intake.pretty.json
    passed

    python3 -m pytest .sbs/intake-probe/tests/test_codebase_intake.py
    failed locally because Python 3.14 did not have pytest installed: No module named pytest

    uvx --from pytest python -m pytest .sbs/intake-probe/tests/test_codebase_intake.py
    2 passed

    bun run --cwd packages/local-runner test -- tests/doctor-pass.test.ts tests/codex-exec-runner.test.ts
    2 files passed, 3 tests passed

    bun run --cwd packages/local-runner test -- tests/doctor-pass.test.ts
    1 file passed, 3 tests passed

    bun run --cwd packages/local-runner test
    8 files passed, 12 tests passed

    bun run --cwd packages/local-runner lint
    Found 0 warnings and 0 errors

    bun run --cwd packages/local-runner typecheck
    passed

    bun run --cwd packages/local-runner format:check
    All matched files use the correct format

    bun run --cwd packages/local-runner build
    Bundled cli.js

    bun run --cwd packages/local-runner ship-by-sunday -- --help
    printed doctor-pass run/upload usage

    bun run --cwd packages/local-runner package:smoke
    package smoke passed

    bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts
    2 files passed, 13 tests passed

    bun run --cwd apps/web test:unit -- tests/unit/workspace-runner-events.test.ts tests/unit/workspace-privacy-contract.test.ts tests/unit/workspace-data-model.test.ts
    3 files passed, 18 tests passed

    bun run --cwd apps/web test:integration -- tests/integration/workspace-runner-api.test.ts
    1 file passed, 5 tests passed

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-doctor-pass-page.test.tsx
    1 file passed, 2 tests passed

    bun run --cwd apps/web typecheck
    Next build and TypeScript passed; route list included /workspace/doctor-pass, /api/workspace/runner/doctor-pass/start, and /api/workspace/runner/findings

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors

    bun run --cwd apps/web format:check
    All matched files use the correct format

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-doctor-pass-and-sync-preview.md
    docs/exec-plans/completed/2026-05-04-doctor-pass-and-sync-preview.md: ok

    bun run programs:lint
    Program docs, Program packets, and Program prompts all passed

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-doctor-pass-and-sync-preview.md docs/programs/active/2026-05-02-customer-agentic-operating-system support-codebases.md .sbs/intake-probe/codebase-intake.README.md
    docs/exec-plans/completed/2026-05-04-doctor-pass-and-sync-preview.md: ok
    docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md: ok

    git diff --check
    passed

Browser viewport proof for `/workspace/doctor-pass` was not run in this pass because the route is protected and this work did not provision a local authenticated workspace session. The focused integration UI test rendered the doctor-pass page states, and `apps/web` typecheck verified the route compiled.

The default doctor-pass event sequence should look like this in backend state:

    doctor.stage.started
    doctor.probe.completed
    doctor.probe.completed
    doctor.probe.completed
    doctor.sync_preview.ready

After web approval, the runner uploads approved findings through `/api/workspace/runner/findings`; the backend records `status: "findings_uploaded"` and `syncPreviewStatus: "uploaded"` on the doctor-pass run instead of adding an upload event in this slice.

Blocked runs should end with a sync-safe blocked state instead of partial findings upload.

## Interfaces and Dependencies

This plan depends on `.sbs/intake-probe/codebase-intake.py`, `.sbs/intake-probe/codebase-intake.README.md`, `packages/local-runner/`, `apps/web/convex/workspace/`, `apps/web/app/(workspace)/workspace/doctor-pass/page.tsx`, `docs/exec-plans/active/2026-05-04-existing-codebase-workspace-data-model-and-events.md`, `docs/exec-plans/active/2026-05-04-existing-codebase-setup-ui.md`, `docs/exec-plans/active/2026-05-04-local-runner-prototype.md`, `docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md`, and `support-codebases.md`.

The scanner JSON schema must be stable enough for the local runner to consume. The Top 9 output schema must be stable enough for local validation, sync preview generation, and backend findings upload. The backend findings validators must be narrower than the local findings file. The web UI should read doctor-pass run state and sync preview state from backend rows and events, not from direct browser-daemon access.

The runner must use existing local runner modules for repository root detection, runner home, event outbox, redaction, setup health, Codex readiness, Codex config state, and `codex exec` spawning. Do not duplicate those boundaries inside doctor-pass code.
