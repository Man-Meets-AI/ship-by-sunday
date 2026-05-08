---
title: SBS Worker Foundations Installer Plan Split Recommendation
summary: Recommended child ExecPlan split for turning the Arena proof into a productized Worker Foundations installer.
docType: plan_split_recommendation
status: active
read_when:
  - Creating the next child ExecPlan for the Worker Foundations installer.
  - Keeping planning-runtime separate from package publication and Worker-full state.
---

# SBS Worker Foundations Installer Plan Split Recommendation

## First Child Plan

Start with `Install Worker Foundations Planning Runtime`. This child plan should implement the installer command shape, profile model, install-plan artifact, structured apply path, and proof skeleton for `planning-runtime`.

The first child plan may install a first cleaned source subset, but it should stay focused on the end-to-end product path: inspect, plan, apply, dogfood, and prove. It should not spend the whole slice only moving templates into place if no command can run.

## Later Child Plans

The second slice should harden the runtime template extraction. It should make the installed `apps/runtime` and `scripts/run-runtime.sh` portable across Bun repos without carrying Worker-specific provider, dashboard, or app-stack assumptions.

The third slice should create an Arena golden smoke fixture or controlled Arena proof path. It should verify that a harness-shaped repo becomes a Worker-style planning-runtime repo and that validation catches the drift the manual fix exposed.

The fourth slice should handle update and idempotence behavior. It should prove rerunning the installer on an already-installed repo preserves owner edits, updates managed files, and reports drift.

The fifth slice should decide distribution naming and package release mechanics. Candidate names include keeping `ship-by-sunday` as the binary with a `worker install` namespace or adding a focused `sbs-worker` package alias.

## Explicit Deferrals

Do not include Worker-full state, provider setup, target app process orchestration, CI wiring, public package publication, or registry signing in the first child plan. Those are separate authority classes after the planning-runtime path is proven.
