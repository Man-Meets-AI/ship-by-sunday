---
title: 'Planning Brief 3: Docs Operating System Evidence-Bound Quality Refresh'
program_id: worker-grade-docs-operating-system-adoption
brief_version: 3
status: current
summary: Turn the installed docs-refresh-quality script from a blocked stub into a bounded QUALITY_SCORE evidence refresh.
read_when:
  - Authoring the quality refresh child ExecPlan for Worker-grade docs operating-system adoption.
  - Changing how generated docs operating-system wrappers update repo quality evidence.
---

# Planning Brief 3: Docs Operating System Evidence-Bound Quality Refresh

The next implementation slice should make `ship-by-sunday docs-operating-system docs-refresh-quality` a real, evidence-bound mutation instead of a blocked placeholder. The package-script installer already adds `docs:refresh-quality` to customer repos, but the shared command currently exits with "later workflow required." That leaves a shipped script that cannot update the durable quality surface it names.

Keep this slice narrow. It may change `packages/local-runner/src/commands/docs-operating-system.ts`, focused local-runner tests, `docs/internal/workflow-packets.md`, this Program packet, and the child ExecPlan. It should not assign an invented numeric score, publish the package, create external setup, mutate package manifests or lockfiles, edit root instructions, wire native app-stack commands, configure CI/providers, or touch runtime state.

The accepted behavior is a bounded refresh of `docs/QUALITY_SCORE.md`. The command should create the file when missing, preserve owner-authored content when the file already exists, and update only a runner-managed evidence block on repeated runs. The evidence block should name the exact docs operating-system validation command, its pass or fail status, the repo-relative refs that were checked, and concise blocked reasons or summaries. It must not store raw logs, raw source, local absolute paths, secrets, package script bodies, or Codex transcripts.

Do not turn this into a scoring engine. `## Current Score` should remain `not scored` unless a future quality audit records reviewer, date, score rationale, evidence refs, and scoring rules. This slice proves quality evidence can be refreshed honestly; it does not create a live repo-health score or solve every quality debt item.

Acceptance for this slice requires:

```bash
bun run --cwd packages/local-runner test -- docs-operating-system-command.test.ts docs-operating-system-package-script-patching.test.ts docs-operating-system-lockfile-refresh.test.ts
bun run --cwd packages/local-runner package:smoke
bun run --cwd packages/local-runner lint
bun run --cwd packages/local-runner typecheck
bun run --cwd packages/local-runner format:check
bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-docs-operating-system-quality-refresh.md
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/completed/2026-05-06-worker-grade-docs-operating-system-adoption docs/exec-plans/completed/2026-05-06-docs-operating-system-quality-refresh.md docs/internal/workflow-packets.md
git diff --check
```

After the slice lands, update this Program to record evidence-bound quality refresh as shipped and keep native command integration as the remaining non-runtime outcome.
