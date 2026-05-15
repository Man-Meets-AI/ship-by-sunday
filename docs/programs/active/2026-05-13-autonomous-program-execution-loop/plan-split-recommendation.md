---
title: "Autonomous Program Execution Loop Plan Split Recommendation"
summary: "Recommended child ExecPlan split for delivering autonomous Program execution without hiding too much orchestration in the first slice."
docType: "plan_split_recommendation"
status: "active"
read_when:
  - "Writing child ExecPlans for this Program."
  - "Checking what belongs in the first autonomous runner slice."
---

# Autonomous Program Execution Loop Plan Split Recommendation

## Recommended Split

Slice 1 should build `program:run-slice` v1. This slice owns one complete child ExecPlan lifecycle: execute, proof, review, fix, reproof, docs sync, and checkpoint. It should be command-driven, use headless Codex execution, and keep run artifacts under ignored local state.

Slice 2 should build `program:run`. This slice owns looping across child ExecPlans until the Program is complete, blocked, or stopped by a configured safety limit. It should reuse the slice runner rather than duplicate phase logic.

Slice 3 should harden review and repair quality. This slice should improve structured review prompts, structured output schemas, severity thresholds, review-swarm integration where available, retry caps, and waiver policy for findings that are real but intentionally deferred.

Slice 4 should make the runner portable through local runner or Worker Foundations install. This slice should replace placeholder installed `execplan:*` commands with real behavior and add compatibility smoke tests.

Slice 5 should decide whether the docs operating system and Program runner deserve an extracted package or repo. This should only happen after the command contract works in multiple real consumers.

## First Slice Boundary

The first ExecPlan should not build every desired SDLC phase. It should focus on the painful manual loop that happens after an ExecPlan is implemented and before the next ExecPlan begins.

The minimum useful first slice is:

- choose one active child ExecPlan
- hydrate context from durable docs
- run implementation with `codex exec`
- run proof commands
- generate a fresh review prompt from live state
- run a fresh review pass
- classify findings
- fix must-fix findings
- rerun proof
- write review and proof summaries back to docs
- store local run artifacts

## Explicitly Later

The following work should remain later slices:

- automatic ideation and problem-space discovery
- moodboard or visual direction automation
- browser screen-by-screen polish automation
- taxonomy audit automation
- feature-usage analytics automation
- automatic PR creation or merging
- automatic deployment or provider dashboard changes
- standalone repo extraction
