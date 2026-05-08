---
title: Shipbysunday Worker Foundations Installer Plan Split Recommendation
summary: Recommended child ExecPlan split for turning the Arena proof into a productized Worker Foundations installer.
docType: plan_split_recommendation
status: active
read_when:
  - Creating the next child ExecPlan for the Worker Foundations installer.
  - Keeping Worker Foundations separate from native distribution hardening and Worker-full state.
---

# Shipbysunday Worker Foundations Installer Plan Split Recommendation

## First Child Plan

Start with `Install Worker Foundations`. This child plan should implement the `shipbysunday install` command shape, internal bundle model, install-plan artifact, Codex prerequisite and permission-profile setup, private Worker-managed Bun toolchain setup, structured apply path, dogfood proof, and proof-gated local commit for the default Worker Foundations install.

The first child plan may install a first cleaned source subset, but it should stay focused on the end-to-end product path: inspect, license, Codex safety setup, checklist, branch, apply, dogfood, prove, report, commit, and foreground kickoff. It should not spend the whole slice only moving templates into place if no command can run.

## Later Child Plans

The second slice should harden the Worker template extraction. It should make the installed `apps/worker` and `scripts/run-worker.sh` portable across package.json repos without carrying Worker-specific provider, dashboard, or app-stack assumptions.

The third slice should create an Arena golden smoke fixture or controlled Arena proof path. It should verify that a harness-shaped repo becomes a Worker-style Program/ExecPlan repo and that validation catches the drift the manual fix exposed.

The fourth slice should handle update and idempotence behavior. It should prove rerunning the installer on an already-installed repo preserves owner edits, updates managed files, and reports drift.

The fifth slice should harden native distribution and licensing. The product name is `shipbysunday`; package-manager distribution can remain a bootstrap or development fallback rather than the main customer path.

## Explicit Deferrals

Do not include Worker-full state, provider setup, target app process orchestration, CI wiring, app download distribution hardening, or signing in the first child plan. Those are separate authority classes after the Worker Foundations install path is proven.
