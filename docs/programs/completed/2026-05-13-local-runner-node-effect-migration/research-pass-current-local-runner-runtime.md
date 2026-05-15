---
title: "Local Runner Node And Effect Migration Research Pass"
summary: "Current-state audit of Bun-shaped local-runner runtime, Worker install defaults, and candidate Effect boundaries."
docType: "research_pass"
status: "active"
read_when:
  - "Starting a child ExecPlan for the local-runner Node or Effect migration."
  - "Checking which local-runner surfaces still depend on Bun."
---

# Local Runner Node And Effect Migration Research Pass

## Question

What exists today in `packages/local-runner`, what is Bun-shaped, and which pieces should move before Effect is introduced?

## Findings

`packages/local-runner/package.json` publishes a single bin file, `dist/cli.js`, and currently builds that file with `bun build ./src/cli.ts --target=bun --outfile=dist/cli.js`. Its direct package scripts also run source TypeScript through Bun, including `ship-by-sunday`, `program:run-slice`, `worker:compatibility-smoke`, and `package:smoke`.

`packages/local-runner/src/cli.ts` starts with `#!/usr/bin/env bun`. That makes the shipped JavaScript artifact and the source entrypoint communicate Bun as the runtime even though most implementation code uses Node APIs such as `node:child_process`, `node:fs/promises`, `node:http`, `node:path`, and global `fetch`.

`packages/local-runner/tests/package-smoke.ts` currently proves several package execution paths. It packs through Bun, tests a `bunx --bun` command path, tests an `npx` command path, installs the packed tarball with npm, and builds a native binary with Bun. This file is the main shipped-artifact confidence path and must be updated deliberately for a Node-first runtime.

Worker Foundations install is the larger Bun dependency. `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` models a `WorkerBunToolchainPlan`, pins a Worker-managed Bun version, knows Bun release archive checksums, creates `packageManager: bun@1.3.5` for blank repos, detects Bun lockfiles, generates `scripts/run-worker.sh` that requires Bun, and writes `apps/worker/package.json` scripts that call `bun src/worker-cli.ts` and `bun test tests`.

The Worker install tests assert the Bun contract in detail. They cover blank-slate Bun defaults, Bun lockfile-owned repositories, Worker-managed Bun toolchain download behavior, Bun proof command labels, and legacy `apps/worker/bun.lock` behavior. Those tests are useful inventory; they will need targeted updates rather than deletion.

The current local-runner has good candidate Effect boundaries because external I/O is already centralized in several places. `bounded-process.ts` wraps `execFile` and timeout classification. `codex-exec-runner.ts` owns `spawn`, JSONL event parsing, timeout kill behavior, and local thread-state persistence. `runner-events.ts` owns append-only outbox writes, lock files, stranded flush restore, fetch delivery with timeout, and requeue behavior. `workflow-run-api.ts` owns authenticated HTTP calls and packet validation.

## Evidence

- `packages/local-runner/package.json` lines 13-24 define Bun-based scripts and build.
- `packages/local-runner/src/cli.ts` line 1 uses `#!/usr/bin/env bun`.
- `packages/local-runner/src/workflows/worker-foundations-install/workflow.ts` defines `WorkerBunToolchainPlan`, `WORKER_MANAGED_BUN_VERSION`, generated Bun shell scripts, generated Bun package scripts, and Bun fallback package-manager detection.
- `packages/local-runner/README.md` documents Bun commands and says blank Git repositories receive `packageManager: bun@1.3.5`.
- `repos/effect/` now exists as a read-only reference subtree for local Effect migration work.

## Implication

The next slice should cut over the local-runner package runtime, distribution, and generated Worker runtime contract to Node/npm before adding Effect. Parker chose a hard cutover, so legacy Bun-shaped Worker compatibility is not part of the implementation target.
