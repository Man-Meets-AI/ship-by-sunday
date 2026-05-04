---
title: Generated Repo Autonomy Completion Planning Brief 3
program_id: generated-repo-first-slice-autonomy
brief_version: 3
status: current
summary: Complete the generated-repo autonomy guarantee by finishing first-slice planning, validation resolution, QA/review docs, weak-fact detection, replay proof, and structural snapshots.
read_when:
  - Writing or resuming the generated-repo autonomy completion ExecPlan.
  - Checking how the remaining roadmap slices are folded into one completion pass.
---

# Generated Repo Autonomy Completion Planning Brief 3

## Planning Refresh

This is the third planning brief for the generated-repo autonomy Program.

The first child slice completed the Build Pack Readiness Manifest. Generated repos now include `docs/build/docs/readiness.md`, `agent-handoff.md` reads readiness before the copy-ready prompt, validation entries are typed as `runnable`, `manual`, or `blocked`, placeholder-friendly facts are visible as customer-input work, and complete plus reduced compiler tests cover the manifest and materialized repo snapshot.

The user has now asked to continue until the autonomy guarantee is done. Treat the remaining roadmap as one completion pass if it can stay compiler-owned and focused.

## Next Plan Recommendation

Exact next plan title: `Complete Generated Repo First Slice Autonomy`.

Exact scope: complete the remaining Program roadmap inside `packages/codebase-compiler` and generated Build Pack docs. The completion pass should derive a structured first-slice plan from `core_flow`, `must_have_capabilities`, `scope_in`, `scope_out`, `acceptance_criteria`, `selected_next_slice`, and generated starter files; harden validation command resolution against generated `package.json`; generate a review and verification pack mapped to `docs/testing/run-report.md`; broaden weak-fact detection; add clean-room replay proof; and replace substring-only checks with structural tests that parse the generated docs and command manifest.

Exact implementation boundaries: keep the work compiler-owned, derive from existing facts first, preserve the readiness manifest as the central confidence and blocker source, and do not touch auth, billing, checkout, Convex runtime, app routes, provider setup, generated mirrors, or required intake fields.

Exact validation boundaries: run focused compiler tests for codebase rendering, repo generation, canonical project definitions, and clean-room replay coverage, then package typecheck, package format check, package lint, plan lint, Program lint, markdown lint for touched planning docs, and repo-level gates as needed.

Why it is next: readiness now exists, but fresh-agent execution still needs a derived first-slice plan, package-script-aware validation manifest, QA/review script, broader weak-fact visibility, and replay proof before the Program can truthfully claim generated-repo autonomy.

## Risks To Carry Forward

Do not add schema fields unless derivation from existing canonical facts is impossible.

Do not duplicate readiness data across generated docs. Render review, verification, implementation, and planning docs from the same readiness model so confidence, blockers, validation, and weak facts stay consistent.

Do not claim production readiness. The guarantee is that the downloaded repo is self-contained enough for a fresh coding agent to execute or ask the customer before guessing; it is not a claim that the customer's product is already production-ready.
