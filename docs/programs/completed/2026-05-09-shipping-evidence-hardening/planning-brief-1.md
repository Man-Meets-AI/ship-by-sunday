---
title: Shipping Evidence CI Baseline Planning Brief 1
program_id: shipping-evidence-hardening
brief_version: 1
status: current
summary: First planning brief for the CI and workspace baseline slice.
read_when:
  - Writing the first child ExecPlan for Shipping Evidence Hardening.
  - Resuming work on the source-gate baseline slice.
---

# Shipping Evidence CI Baseline Planning Brief 1

Create the first child ExecPlan for the source-gate baseline. The slice should make CI represent the whole repo by wiring existing package tests, package typechecks, package smoke scripts where appropriate, root script tests, and `apps/web` critical coverage into an intentional fast gate.

Start from current scripts instead of inventing a new test runner. Preserve the durable `static` and `integration` context contract unless the ExecPlan explicitly updates branch-protection docs and workflow docs. Before proposing new required check names, the slice should inspect whatever live GitHub enforcement surfaces are available and record any limitation when branch-protection or ruleset APIs are plan-gated.

Keep hosted Stripe, Vercel, Clerk, Convex, browser release proof, and production preflight out of this first slice. This is a broke-startup-friendly source gate: cheap, deterministic checks on every PR; expensive provider-backed checks only when later slices make them conditional, post-merge, nightly, release, or manual.

The result should answer: what runs on every PR, what remains conditional or post-merge, what remains manual or nightly, and which existing commands became part of the required gate. It should also preserve the root `AGENTS.md` feature-risk testing rubric as the standard future ExecPlans use when deciding whether a feature needs auth, billing, db, e2e, staging, or production checks. Validate with focused command runs and `bun run programs:lint`.
