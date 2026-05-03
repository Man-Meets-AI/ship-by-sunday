---
title: Build Pack Readiness Manifest Planning Brief 1
program_id: generated-repo-first-slice-autonomy
brief_version: 1
status: superseded
summary: Define the first child slice that generates a Build Pack readiness manifest from existing Blueprint facts.
read_when:
  - Writing or resuming the Build Pack readiness manifest child ExecPlan.
  - Checking first-slice boundaries for generated-repo autonomy.
---

# Build Pack Readiness Manifest Planning Brief 1

## Planning Brief

This is the first planning brief for the generated-repo autonomy Program.

The current Build Pack generates a prompt, milestone plan, implementation runbook, documentation log, and agent handoff, but it does not generate a deterministic readiness verdict. Validation commands are currently derived from `validation_plan` strings with keyword matching, and unknown validation steps can become shell comments. Tests mostly prove sections exist rather than proving a clean generated repo handoff is executable without chat history.

## Next Plan Recommendation

Exact next plan title: `Build Pack Readiness Manifest`.

Exact scope: add a compiler-owned readiness model for generated Build Packs, generate `docs/build/docs/readiness.md`, link readiness from `docs/build/docs/agent-handoff.md` before the copy-ready prompt, classify validation entries as `runnable`, `manual`, or `blocked`, surface placeholders and weak facts as readiness warnings or blockers, and strengthen complete plus reduced compiler tests.

Exact implementation boundaries: use existing facts first, do not add schema fields unless derivation is impossible, do not touch auth, billing, checkout, Convex runtime, app routes, provider setup, generated mirrors, or unrelated docs.

Exact validation boundaries: run the focused package tests for blueprint renderers, repo generation, and canonical project definitions; run package typecheck, package format check, package lint, and repo-level format, lint, and typecheck.

Why it is next: the readiness manifest creates the shared state vocabulary for later first-slice planning, command resolution, QA/review proof, weak-fact detection, clean-room replay, and structural regression snapshots.

## Risks To Carry Forward

Do not make placeholder-friendly fields hard failures for repo generation.

Do not claim autonomous build readiness until a later clean-room replay proof exists.

Do not let a validation string silently become a shell comment.

Do not widen the first slice into a schema migration or runtime app change.
