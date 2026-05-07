---
title: 'Planning Brief 4: Docs Operating System Native Command Proof'
program_id: worker-grade-docs-operating-system-adoption
brief_version: 4
status: current
summary: Expose repo-native validation proof through the shared docs operating-system command surface without installing app-stack conventions.
read_when:
  - Authoring the native command integration child ExecPlan for Worker-grade docs operating-system adoption.
  - Changing how generated docs operating-system tooling proves existing repo-native commands.
---

# Planning Brief 4: Docs Operating System Native Command Proof

The final implementation slice should close the native command integration gap without widening into runtime bootstrap or app-stack command installation. The docs-spine apply workflow already knows how to run a discovered native gate as proof, but the portable shared command surface installed by this Program does not expose a package-owned native proof command. Customer repos should be able to ask the installed `ship-by-sunday` binary to prove the repo's existing native validation script without copying Worker runtime state or adding new root app-stack scripts.

Keep this slice narrow. It may change `packages/local-runner/src/commands/docs-operating-system.ts`, CLI help text, focused local-runner tests, package smoke if needed, `docs/internal/workflow-packets.md`, this Program packet, and the child ExecPlan. It should not add a new canonical package script, mutate package manifests, mutate lockfiles, publish the package, configure CI/providers, start services, add runtime state, edit root instructions, or invent a run-the-app convention.

The accepted command is package-owned and explicit. Add a `native-command-proof [--repo <path>]` subcommand under `ship-by-sunday docs-operating-system`. It should read the target repo's package manager and script names, select one existing broad native validation script in this order: `gate`, `check`, `ci`, `proof`, `test`, `lint`, `typecheck`, `build`; run the package-manager-specific command with a bounded timeout; and return zero only when that command passes. Missing package metadata or no recognized script is blocked proof. Setup-shaped failures such as missing dependencies, missing modules, or command-not-found are blocked proof. Ordinary assertion, lint, test, typecheck, or build failures are failed proof.

The command output must stay sync-safe: command name, pass/fail/blocked status, and a concise sanitized summary only. It must not print package script bodies, raw logs, raw source, local absolute paths, dependency versions, secrets, or Codex transcripts. This command is a proof runner for existing scripts, not permission to install dependencies or wire native commands into package.json.

Acceptance for this slice requires:

```bash
bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts cli-help.test.ts
bun run --cwd packages/local-runner test -- docs-operating-system-package-script-patching.test.ts docs-operating-system-lockfile-refresh.test.ts
bun run --cwd packages/local-runner build
bun run --cwd packages/local-runner package:smoke
bun run --cwd packages/local-runner lint
bun run --cwd packages/local-runner typecheck
bun run --cwd packages/local-runner format:check
bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-docs-operating-system-native-command-proof.md
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/completed/2026-05-06-docs-operating-system-native-command-proof.md docs/internal/workflow-packets.md
git diff --check
```

After the slice lands, update this Program to record native command proof as shipped. If all previous child ExecPlans are complete and validation has passed or has accepted external blockers, move the Program packet from active to completed and update the active/completed Program indexes.
