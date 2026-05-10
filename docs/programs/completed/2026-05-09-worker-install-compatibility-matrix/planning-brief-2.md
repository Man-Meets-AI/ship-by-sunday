---
title: Worker Install Recipient Ergonomics Planning Brief 2
program_id: worker-install-compatibility-matrix
brief_version: 2
status: current
summary: Make blank and unclaimed repositories install through Bun defaults and generate recipient-grade README, AGENTS, and Worker help.
read_when:
  - Writing the Worker install recipient ergonomics ExecPlan.
  - Flipping the blank-slate compatibility scenario to install success.
---

# Worker Install Recipient Ergonomics Planning Brief 2

The next child ExecPlan should be titled `Ship Worker Install Recipient Ergonomics`.

The goal is to make `shipbysunday install` produce a ready-to-run Worker surface in blank and unclaimed repositories while preserving explicit package-manager choices in existing repositories. Blank repositories and root `package.json` files without an explicit package manager or lockfile should default to Bun. Existing Bun, npm, pnpm, and yarn identities should remain preserved.

The installer should create a root `package.json` for blank repositories, add Worker root scripts, and use Bun as the proof package manager. It should also generate or append a managed root README section that tells a recipient how to run the Worker, where to start, which commands matter, how to use `./scripts/run-worker.sh`, and what stays local. Existing README content must be preserved through a managed section.

The root AGENTS managed section should be stronger for future agents. It should say to read the install report, README, active Program, and active ExecPlan; prefer the repo-native root package-manager scripts; use `./scripts/run-worker.sh <command>` as the direct fallback; keep `.worker/` local; and avoid storing secrets, raw logs, transcripts, or local absolute paths in checked-in proof.

The direct executable should have a useful help path. `./scripts/run-worker.sh --help` and `./scripts/run-worker.sh -h` should print Worker-specific help, not Bun's generic `bun run` help.

Validation should flip the `blank-slate` compatibility smoke scenario from expected blocker to install success, add coverage for an unclaimed `package.json`, assert README and AGENTS content, assert direct help output, run the local-runner focused tests and compatibility smoke, then run package smoke and Program/ExecPlan lint.
