# Runner Smoke Checklist

Use this checklist while testing the existing-codebase local runner lane.
Do not paste pairing tokens, runner tokens, passwords, or customer source into
chat, screenshots, docs, commits, or issue comments.

## Addressed Smoke Finding

- [ ] After pairing, verify the setup screen no longer shows stale pre-pairing
      controls or stale blocker state.

  Expected: the summary card shows the paired repository display name from the
  runner CLI state, such as `ship-by-sunday` for
  `/Users/bazelrex/Developer/ship-by-sunday`; the pairing command blocks,
  token-copy UI, and regenerate-token prompt are hidden or moved behind an
  explicit repair/re-pair action; latest setup check events win over older
  blocker rows; warnings do not count as blockers; `github-auth: ready` clears
  any old `gh auth blocked` display.
  Failure: after pairing, the UI still says `Pending Project Setup`, asks the
  user to regenerate a token as the primary action, shows old `gh auth`
  blockers, or disables Doctor Pass using stale blocker counts.

- [ ] Verify Codex config setup is browser-first for customers.

  Expected: after pairing, the setup screen gives the customer a clear browser
  action to review/apply the SBS Codex config setup instead of making them know
  terminal commands. The local runner may still perform the file inspection,
  backup, and write locally, but the product journey should start from an
  explicit button or guided handoff in the browser. During this smoke pass,
  manual CLI commands are acceptable only as a temporary test substitute.
  Failure: the page expects the customer to discover
  `setup check --codex-config-preview` or `--apply-codex-config` on their own,
  or the browser copy implies config changes happened when no local runner
  action ran.

- [ ] Verify Codex config preview is scoped and readable.

  Expected: the preview shows only the SBS-managed block being added, replaced,
  or removed, plus the backup path behavior. It should not render the entire
  existing `~/.codex/config.toml` as deleted and re-added when the only semantic
  change is appending the managed block.
  Failure: preview output is a giant whole-file diff that makes a safe append
  look destructive.

- [x] Verify Doctor Pass completion, approval, and upload states are obvious.

  Expected: after Doctor Pass finishes, the browser shows a clear notification,
  persistent banner, or run-history entry that says the local run completed and
  found the displayed number of findings. The review page uses plain-language
  copy such as `Doctor Pass completed locally` or `Review findings before
upload`, includes a visible stepper from local run through upload, and shows
  the current state as one of: waiting for approval, approved and waiting for
  runner upload, uploaded, or failed. The approval button says
  `Approve findings upload`, the page states that raw source and excluded
  artifacts stay local, daemon mode says the runner will upload automatically,
  manual upload copy is labeled as temporary/manual smoke-test behavior, and
  successful upload links to Findings and Runs.
  Failure: the user lands on a digest/status screen without knowing whether the
  run completed, whether anything synced, what approval does, what command or
  button comes next, or where to confirm uploaded findings.

- [x] Verify approved Doctor Pass findings upload without digest drift.

  Expected: after the browser approves a sync preview, the local runner upload
  command succeeds for the same run id and writes `upload-result.json`. The
  backend accepts the exact approved findings payload using the canonical
  approved-findings digest contract and moves the run to an
  uploaded/findings-visible state. Object key order must not affect the digest,
  and omitted optional object fields normalize the same as `undefined` optional
  fields.
  Failure: upload fails with
  `Uploaded findings do not match approved preview` after approval. That means
  the runner and backend are not hashing the approved findings with the same
  canonical payload contract, even if the findings appear unchanged.
  Addressed: fresh run `20260505T204201Z-56640b39` /
  `m97djh73b8dda4jrd9yvgqy3xh8640qx` used preview digest
  `sha256:51147b7880774d858d6d843c0182a2309a70e3e1fd1197c6ba9fc3126cc7ecef`;
  after browser approval, manual upload succeeded with `insertedCount: 9`,
  `patchedCount: 0`, wrote `upload-result.json`, and Convex showed
  `status: findings_uploaded`, `syncPreviewStatus: uploaded`, and 9 uploaded
  findings.

- [x] Verify Doctor Pass Top 9 schema is accepted by Codex.

  Expected: after the SBS Codex profiles are present, local-only Doctor Pass can
  run `repo-doctor-top-nine` through `codex exec --output-schema` and receive
  structured findings.
  Failure: Codex returns `invalid_json_schema`, especially
  `schema must have a 'type' key` for `schemaVersion`, and Doctor Pass falls
  back to `Codex interpretation did not return structured findings`.
  Addressed: `createTopNineOutputSchema()` now emits explicit `type` fields,
  strict object schemas, typed evidence refs, and nullable optional fields for
  Codex structured output compatibility.

## Current Test Target

- App host:
- Signed-in account:
- Customer repo path:
- Pairing mode: daemon / one-shot
- Pairing token regenerated at:
- Runner command used:

## 1. Confirm The Package Works

- [x] Build the runner package.

  ```bash
  bun run --cwd packages/local-runner build
  ```

  Expected: `packages/local-runner/dist/cli.js` exists and is executable.
  Failure: build errors, missing `dist/cli.js`, or CLI cannot start.

- [x] Run the package distribution smoke.

  ```bash
  bun run --cwd packages/local-runner package:smoke
  ```

  Expected: `package smoke passed`.
  Failure: `bunx` or `npx` cannot run the package tarball, pairing does not
  write local config, or runner events do not deliver.

- [x] Run the package checks.

  ```bash
  bun run --cwd packages/local-runner test
  bun run --cwd packages/local-runner typecheck
  bun run --cwd packages/local-runner lint
  ```

  Expected: tests, typecheck, and lint pass.
  Failure: any failed runner command, event, workflow, package, or type check.

## 2. Pair A Real Local Customer Repo

The app UI currently prints published-package commands such as:

```bash
bunx ship-by-sunday setup pair <pairing-token>
npx ship-by-sunday setup pair <pairing-token>
```

Because the package is not published yet, use the local source CLI for this
smoke pass:

```bash
bun packages/local-runner/src/cli.ts setup pair <pairing-token> --repo <customer-repo-path> --api-url <app-host> --json
```

Use `--api-url http://localhost:<port>` when testing a local app. Use
`--api-url https://www.man-meets-ai.com` only when the browser is on production.

- [x] Pair command succeeds.

  Expected: output includes `projectId`, `runnerId`, `eventDelivery`, and setup
  checks. The customer repo gets `.sbs/config.json`, and the runner secret is
  stored outside the repo at `~/.sbs/runner/credentials.json`.
  Failure: HTTP 401/404, token rejected, wrong `--api-url`, no `.sbs/config.json`,
  or events remain queued unexpectedly.

- [x] The setup page notices the runner.

  Expected: `/workspace/setup` advances from `waiting` to runner detected,
  verifying machine/project, and paired.
  Failure: CLI says paired but the browser stays on `waiting`.

- [ ] Repair path is available if first pairing used the wrong repo or host.

  ```bash
  bun packages/local-runner/src/cli.ts setup pair <new-pairing-token> --repo <customer-repo-path> --api-url <app-host> --repair --json
  ```

  Expected: stale or wrong local credentials are replaced.
  Failure: user is stuck after a bad first pairing.

## 3. Resolve Setup Blockers

- [ ] Run setup check against the customer repo.

  ```bash
  bun packages/local-runner/src/cli.ts setup check --repo <customer-repo-path> --json
  ```

  Expected: machine and project checks report `ready`, `warning`, or `blocked`
  with a concrete remediation.
  Failure: stack trace, vague blocker, or a false `ready`.

- [ ] Fix ChatGPT/Codex auth locally when blocked.

  ```bash
  codex login
  ```

  Expected: setup check no longer reports `ChatGPT/Codex auth` as blocked.
  Failure: auth remains blocked after login.

- [ ] Fix GitHub CLI auth locally when blocked.

  ```bash
  gh auth status
  gh auth login
  ```

  Expected: setup check no longer reports `gh auth` as blocked.
  Failure: `gh auth status` fails or the runner cannot confirm auth.

- [ ] Re-run setup check after each local fix.

  Expected: the setup page and CLI agree on blocker count.
  Failure: app still shows stale blockers after successful CLI check.

## 4. Codex Config Safety

- [ ] Preview the managed config patch before applying it.

  ```bash
  bun packages/local-runner/src/cli.ts setup check --codex-config-preview
  ```

  Expected: output is either the exact SBS-owned block diff or says the block is
  already present.
  Failure: unrelated global Codex config changes appear.

- [ ] Apply only after preview looks correct.

  ```bash
  bun packages/local-runner/src/cli.ts setup check --apply-codex-config
  ```

  Expected: creates backup and applies only the SBS-owned block.
  Failure: unrelated Codex config is overwritten.

## 5. Run Doctor Pass

- [x] Run doctor pass locally first.

  ```bash
  bun packages/local-runner/src/cli.ts doctor-pass run --repo <customer-repo-path> --local-only --json
  ```

  Expected: `.sbs/reports/doctor-pass/<run-id>/` is created with a readable
  report.
  Failure: no report, empty report, raw stack trace, or generic non-actionable
  output.

- [x] Run synced doctor pass after local report works.

  ```bash
  bun packages/local-runner/src/cli.ts doctor-pass run --repo <customer-repo-path> --json
  ```

  Expected: output includes `doctorPassRunId`, `localReportRefPrefix`,
  `previewDigest`, and finding count. This creates the server-side run and
  sync preview; finding upload is a separate explicit approval/upload step.
  Failure: no digest when findings exist, 401/403 upload error, or silent sync
  failure.

- [ ] Upload a specific run if needed.

  ```bash
  bun packages/local-runner/src/cli.ts doctor-pass upload --run-id <run-id> --repo <customer-repo-path> --json
  ```

  Expected: before browser approval, upload is blocked with `Sync preview must
be approved before findings sync`; after browser approval, inserted and
  patched counts make sense.
  Failure: upload succeeds without approval, duplicate spam, no app update after
  approval, or auth failure.

## 6. Verify Workspace UI

- [ ] `/workspace/setup`

  Expected: pairing state, setup blockers, doctor-pass button, and default open
  destination are coherent.
  Failure: stale blocker count, disabled button with no reason, or wrong repo.

- [ ] `/workspace/doctor-pass`

  Expected: doctor-pass status, local report refs, and sync preview are visible.
  Failure: run exists locally but page has no trace of it.

- [ ] `/workspace/findings`

  Expected: synced findings appear with clear severity/status.
  Failure: empty list after upload, duplicates, raw local paths, raw source, or
  raw logs.

- [ ] `/workspace/findings/<findingId>`

  Expected: detail page explains the finding and any approval boundary.
  Failure: detail page crashes or exposes unsafe raw data.

- [ ] `/workspace/runs`

  Expected: doctor-pass and approved workflow history show clear statuses.
  Failure: run history missing, wrong status, or only opaque IDs.

- [ ] `/workspace/loops`

  Expected: workflow catalog is visible, but local work still requires explicit
  approved workflow runs.
  Failure: browser can start arbitrary local work directly.

- [ ] `/workspace/privacy`

  Expected: runner identity, repo binding, local execution boundary, raw-sharing
  defaults, and revoke controls are clear.
  Failure: unclear machine/repo binding or any implication that raw source/logs
  are uploaded by default.

## 7. Daemon Heartbeat

- [ ] Start one heartbeat.

  ```bash
  bun packages/local-runner/src/cli.ts daemon start --repo <customer-repo-path> --once
  bun packages/local-runner/src/cli.ts daemon status --repo <customer-repo-path> --json
  ```

  Expected: status is `online` or clearly degraded with a reason.
  Failure: stuck `starting`, unexplained `errored`, or queued events never flush.

- [ ] Stop daemon state.

  ```bash
  bun packages/local-runner/src/cli.ts daemon stop --repo <customer-repo-path>
  bun packages/local-runner/src/cli.ts daemon status --repo <customer-repo-path>
  ```

  Expected: stop request is visible and status becomes stopping/offline.
  Failure: stale online state forever.

## 8. Approved Workflow Commands

Only run these with a real approved workflow run id from the app.

```bash
bun packages/local-runner/src/cli.ts workflow source-truth-readiness run --workflow-run-id <id> --confirm-local-writes --repo <customer-repo-path> --json
bun packages/local-runner/src/cli.ts workflow observability-debuggability run --workflow-run-id <id> --confirm-observability-audit --repo <customer-repo-path> --json
bun packages/local-runner/src/cli.ts workflow broken-app-triage run --workflow-run-id <id> --confirm-read-only-reproduction --repo <customer-repo-path> --json
bun packages/local-runner/src/cli.ts workflow mature-repo-adoption run --workflow-run-id <id> --confirm-adoption-audit --repo <customer-repo-path> --json
```

- [ ] Missing confirmation flags block execution.

  Expected: command refuses to run without the required explicit confirmation.
  Failure: local writes or audits run without confirmation.

- [ ] Wrong branch or profile blocks execution.

  Expected: command refuses if local repo does not match the approved packet.
  Failure: workflow runs against the wrong branch, repo, or Codex profile.

- [ ] Approved run writes proof.

  Expected: `.sbs/runs/<workflowRunId>/workflow-packet.json` and `proof.json`
  exist.
  Failure: no proof, unclear blocked reason, or hidden edits.

## Stop Conditions

- Pairing token or runner token appears in chat, screenshots, docs, commits, or
  logs intended for sharing.
- CLI says paired but the app stays unpaired after refresh.
- Doctor pass uploads raw source, raw terminal logs, screenshots, Codex
  transcripts, or local absolute paths.
- Browser UI can trigger local writes without explicit approved workflow
  confirmation.
- Daemon worker mode runs without confirmation flags.
- UI shows success when CLI reported blocked or failed.

## Pass Bar

- [ ] Package build, package smoke, tests, typecheck, and lint pass.
- [ ] A real local customer repo pairs from `/workspace/setup`.
- [ ] Setup blockers can be resolved and rechecked.
- [ ] Doctor pass creates a local report.
- [ ] Synced findings appear in the app.
- [ ] Runs and privacy pages reflect the paired runner accurately.
- [ ] Daemon heartbeat reports online or degraded truthfully.
