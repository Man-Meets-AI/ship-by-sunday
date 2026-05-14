# Ship by Sunday Local Runner

This package owns the `shipbysunday` local CLI, including the Worker Foundations installer. Most development checks should run from the Ship by Sunday repository root. The installer itself targets another Git repository that you pass with `--repo`.

## Runtime Contract

The shipped `ship-by-sunday` and `shipbysunday` bins are Node-first. The package builds a Node 20 `dist/cli.js` bundle, and package smoke proves the installed CLI without requiring Bun at runtime. Source-mode development in this monorepo still uses the repo's Bun scripts, such as `bun run --cwd packages/local-runner test`.

Worker Foundations install also defaults unclaimed target repositories to Node/npm. Blank Git repositories receive `packageManager: npm@11.12.1`, generated Worker scripts run through `node`, and installed Worker proof uses the target repository package manager commands such as `npm run docs:validate` and `npm run worker:test`.

The main external I/O boundaries are Effect-backed services with promise adapters preserved for command callers. Process execution, Codex execution, runner event outbox delivery, workflow-run API calls, repository-safe file writes, local `.sbs` state, runner-home credentials, doctor artifacts, Codex config files, Worker install result sync, Worker proof commands, and Program run-slice orchestration can be tested through injected services.

## Program Runner Commands

The autonomous Program runner has two command layers. `program run-slice` executes one approved Program child ExecPlan through implementation, proof, fresh review, bounded fixes, reproof, docs sync, and checkpoint artifacts. `program run` sequences active child ExecPlans for a Program by reusing `program run-slice` until the Program is complete, blocked, or stopped by `--max-slices`.

Run the full Program loop from the repository root:

```bash
bun run program:run -- --program-id <program-id>
```

Run one explicit child slice from the repository root:

```bash
bun run program:run-slice -- --program-id <program-id> --plan <docs/exec-plans/active/YYYY-MM-DD-slice.md>
```

The packaged CLI equivalents are:

```bash
ship-by-sunday program run --program-id <program-id>
ship-by-sunday program run-slice --program-id <program-id> --plan <docs/exec-plans/active/YYYY-MM-DD-slice.md>
```

Both commands write local artifacts under ignored `.sbs/program-runs/`. `program run` requires a clean worktree at startup, then owns expected in-progress changes from child slice execution.

## Worker Install Command Map

Use the smoke commands for normal validation. Use the direct `install --repo ...` commands only when you intentionally want to inspect or mutate a target repository.

| Command                                                                                                                            | Where to run it                                           | What happens                                                                                                                                                                     | What changes                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `bun run --cwd packages/local-runner test -- worker-foundations-install`                                                           | Ship by Sunday repo root                                  | Runs the focused installer regression suite with disposable fixture repositories.                                                                                                | No intended changes in this repo. Temporary files only.                               |
| `bun run --cwd packages/local-runner worker:compatibility-smoke -- --list`                                                         | Ship by Sunday repo root                                  | Lists available Worker install compatibility scenarios.                                                                                                                          | No changes.                                                                           |
| `bun run --cwd packages/local-runner worker:compatibility-smoke`                                                                   | Ship by Sunday repo root                                  | Runs the full compatibility matrix against disposable Git repositories, including blank, npm, pnpm, Yarn, polyglot, Arena-shaped, fresh-clone, and fake-Codex kickoff scenarios. | No intended changes in this repo. Temporary target repos are created and verified.    |
| `bun run --cwd packages/local-runner worker:compatibility-smoke -- blank-slate`                                                    | Ship by Sunday repo root                                  | Runs only the blank repository install scenario. This is the fastest practical end-to-end check.                                                                                 | No intended changes in this repo. Temporary target repo only.                         |
| `bun run --cwd packages/local-runner worker:compatibility-smoke -- next-npm-single-app`                                            | Ship by Sunday repo root                                  | Runs one npm-shaped recipient repo scenario.                                                                                                                                     | No intended changes in this repo. Temporary target repo only.                         |
| `bun run --cwd packages/local-runner worker:compatibility-smoke -- next-pnpm-monorepo`                                             | Ship by Sunday repo root                                  | Runs one pnpm monorepo recipient scenario.                                                                                                                                       | No intended changes in this repo. Temporary target repo only.                         |
| `bun run --cwd packages/local-runner worker:compatibility-smoke -- next-yarn-monorepo`                                             | Ship by Sunday repo root                                  | Runs one Yarn monorepo recipient scenario.                                                                                                                                       | No intended changes in this repo. Temporary target repo only.                         |
| `bun run test:package-smoke`                                                                                                       | Ship by Sunday repo root                                  | Builds the local-runner CLI and proves packed/installed/Node command paths. Use this when you need shipped-artifact confidence.                                                  | Builds `packages/local-runner/dist/cli.js` if needed and uses temporary target repos. |
| `npm run --workspace packages/local-runner ship-by-sunday -- install --repo /path/to/target --dry-run --json --no-kickoff`         | Ship by Sunday repo root, pointing at a target repo       | Previews what Worker install would do to the target repo.                                                                                                                        | No intended target repo changes. Prints a JSON plan.                                  |
| `npm run --workspace packages/local-runner ship-by-sunday -- install --repo /path/to/target --yes --json --no-kickoff`             | Ship by Sunday repo root, pointing at a clean target repo | Installs Worker into the target repo, runs proof, writes an install report, and commits on `shipbysunday/install`.                                                               | Mutates the target repo and creates an install commit.                                |
| `npm run --workspace packages/local-runner ship-by-sunday -- install --repo /path/to/target --yes --json --no-kickoff --no-commit` | Ship by Sunday repo root, pointing at a clean target repo | Installs Worker but leaves the generated files uncommitted for inspection.                                                                                                       | Mutates the target repo working tree without creating a commit.                       |
| `npm run --workspace packages/local-runner ship-by-sunday -- install --repo /path/to/target`                                       | Ship by Sunday repo root, pointing at a clean target repo | Runs the interactive installer. It shows a checklist, may activate a license, runs proof, commits, and may start Codex kickoff.                                                  | Mutates the target repo and may touch local Worker/Codex machine state.               |
| `./scripts/run-worker.sh --help`                                                                                                   | Inside an already-installed target repo                   | Shows installed Worker command help.                                                                                                                                             | No changes.                                                                           |
| `<target package manager> run docs:validate`                                                                                       | Inside an already-installed target repo                   | Runs Worker docs validation through the target repo package manager, for example `npm run docs:validate`, `pnpm run docs:validate`, or `yarn run docs:validate`.                 | No expected changes.                                                                  |
| `<target package manager> run worker:test`                                                                                         | Inside an already-installed target repo                   | Runs the installed Worker smoke tests through the target repo package manager.                                                                                                   | No expected changes.                                                                  |

## What Install Generates

When a real install succeeds, the target repository receives:

- `apps/worker/package.json`
- `apps/worker/worker-manifest.json`
- `apps/worker/src/worker-cli.mjs`
- `apps/worker/tests/smoke.test.mjs`
- `scripts/run-worker.sh`
- `docs/worker/install-report.md`
- managed sections in `README.md` and `AGENTS.md`
- Worker root scripts in `package.json`, including `docs:validate` and `worker:test`
- a `.git/info/exclude` entry for local `.worker/` state
- a commit on `shipbysunday/install`, unless `--no-commit` is used

Blank Git repositories also receive a private root `package.json` with `packageManager: npm@11.12.1`.

## Worker License Contract

Interactive installs activate through the maintainer-owned Worker license service at `/api/worker/license/device/start` and `/api/worker/license/device/poll`. The poll response must return a `license` object with `schemaVersion: "shipbysunday-worker-license.v1"`, `status: "active"`, `machineCredential`, optional `accountId`, optional `machineId`, optional ISO `issued_at`, optional ISO `expires_at`, and a `licenseSignature`.

`licenseSignature` is an Ed25519 base64url signature over the JSON string of those fields in this exact order, excluding `licenseSignature`: `schemaVersion`, `status`, `machineCredential`, `accountId`, `machineId`, `issued_at`, `expires_at`. The signing key is maintainer-owned service configuration; the CLI stores only the public verification key. A missing or untrusted signature blocks install before any target repository mutation. Verify setup by running an interactive install against the license service and confirming the saved Worker home `license.json` lets a second `--yes --json --no-kickoff` install reach the normal plan/proof path.

## Efficient Local Loop

For most installer changes, run:

```bash
bun run --cwd packages/local-runner test -- worker-foundations-install
bun run --cwd packages/local-runner worker:compatibility-smoke -- blank-slate
```

Before sharing Worker installer changes, run:

```bash
bun run --cwd packages/local-runner worker:compatibility-smoke
bun run test:package-smoke
```

Use direct `install --repo /path/to/target` commands only when you need to inspect the generated files in a specific repository.
