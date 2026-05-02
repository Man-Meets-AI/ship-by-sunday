---
program_id: customer-agentic-operating-system
title: Customer Agentic Operating System
status: active
created_at: 2026-05-02
completed_at: null
summary: Make Ship by Sunday install durable Program, ExecPlan, validation, and agent-loop practices into generated customer repos and mature existing codebases.
post_build_recap: null
read_when:
  - Planning generated customer repo Program and ExecPlan support.
  - Designing mature repo adoption for existing customer codebases.
  - Writing or refreshing child ExecPlans for the customer agentic operating system.
---

# Customer Agentic Operating System

This is a living initiative document. It keeps the durable initiative-level truth for turning Ship by Sunday into the agentic engineering operating system for both generated customer repos and mature existing codebases.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday should not merely hand customers a starter repo. It should leave every customer with a repo that knows how to work with agents: durable source truth, scoped ExecPlans, Program-level initiative memory, validation commands, review evidence, and explicit loops that survive beyond chat history.

The initiative is moving in the right direction when a newly generated repo contains a customer-safe Program and ExecPlan operating pack, and when a customer with an existing mature repo can receive an adoption Program that respects their current stack instead of forcing the starter workflow onto them.

## Program Inputs

The Program packet lives under `docs/programs/active/2026-05-02-customer-agentic-operating-system/`.

The durable research inputs are `research-pass-generated-repo-operating-system.md`, `research-pass-mature-repo-adoption.md`, `research-pass-packaging-validation.md`, and `research-pass-product-ux.md`.

The normalized input is `normalized-pass-agentic-operating-system.md`.

The convergence artifact is `converged-decision-packet.md`.

The dependency artifact is `dependency-graph.md`.

The plan split artifact is `plan-split-recommendation.md`.

The review artifact is `cross-repo-review.md`.

The current planning brief is `planning-brief-1.md`, with `current-planning-brief.txt` pointing at the current versioned brief.

## Current State

Ship by Sunday already has a strong internal Program and ExecPlan system under `docs/programs/`, `docs/exec-plans/`, `docs/prompts/`, and `scripts/`. Generated customer repos already receive Build Pack readiness, first-slice planning, root agent instructions, onboarding docs, local starter skills, and testing guidance.

Generated customer repos do not yet receive the canonical Program and ExecPlan folder model. The customer-safe snapshot contract currently excludes internal `docs/programs/**`, `docs/exec-plans/**`, and Program prompt assets. That protects customers from internal history but also means the best agentic operating practices are not yet installed in the generated repo.

Mature existing codebases have no first-class product lane yet. The current product flow is blueprint-first and generated-repo-first. The mature-repo opportunity needs a separate audit and adoption workflow that preserves each customer's conventions.

## Progress

- [x] 2026-05-02 EDT: Researched `Man-Meets-AI/plans-and-programs` and confirmed its strongest portable practices are Programs, ExecPlans, immutable planning briefs, thin skills, prompt loops, and structural validation.
- [x] 2026-05-02 EDT: Mapped current Ship by Sunday generated repo surfaces, customer-safe snapshot exclusions, prompt pack wiring, starter onboarding, local skills, package scripts, and compiler tests.
- [x] 2026-05-02 EDT: Created this active Program packet and the first planning brief.
- [x] 2026-05-02 EDT: Created the first child ExecPlan for reconciling the generated-repo agentic source contract.
- [x] 2026-05-02 EDT: Incorporated subagent critiques about prompt naming drift, skill trigger drift, package-script promises, product-lane overreach, and mature-repo adoption boundaries.
- [ ] Implement the first generated-repo source-contract slice.
- [ ] Refresh the Program with generated-repo proof and choose the customer-safe operating file-set slice.
- [ ] Design and implement the mature-repo adoption lane.

## Decision Log

Decision: Use one Program for both generated repos and mature existing repos.
Rationale: The product promise is one operating system with two customer lanes. A single Program keeps shared packaging, validation, prompt, skill, and narrative decisions coherent while child ExecPlans keep implementation slices bounded.
Date: 2026-05-02

Decision: Make generated repo source-contract reconciliation the first implementation lane.
Rationale: Generated repos are controlled by `packages/blueprint-compiler`, already use Bun, already include Build Pack readiness, and can be proven through existing materialization tests. Subagent review found prompt naming drift and skill trigger drift, so reconciliation should precede full operating-pack shipment.
Date: 2026-05-02

Decision: Keep mature-repo adoption separate from generated-repo bootstrap.
Rationale: Mature repos need read-only audit, package-manager preservation, source-truth mapping, and safe patch delivery. They should not inherit generated-starter assumptions.
Date: 2026-05-02

Decision: Avoid hidden `postinstall` or silent bootstrap mutation.
Rationale: Customers should explicitly ask the repo to create or refresh agentic Program artifacts. Hidden mutation makes setup surprising and harder to review.
Date: 2026-05-02

## Slice Ledger

Active child ExecPlans:

- `docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md`

Completed child ExecPlans:

- None.

Recommended future child ExecPlans:

- Ship customer-safe operating system file set.
- Add explicit generated repo agentic bootstrap.
- Teach the two-lane product model.
- Design mature repo audit contract.
- Generate mature repo adoption Program.
- Wire mature repo adoption into the product.
- Harden cross-lane review and validation.

## Next Slice

An active child ExecPlan exists at `docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md`. It should reconcile generated-repo source truth and customer-safety boundaries before the Program ships the full customer-safe operating pack.

## Risks and Watchpoints

Do not ship internal Program archives, completed ExecPlans, release evidence, or local operator assumptions into customer repos.

Do not duplicate Build Pack readiness truth. Generated Program and ExecPlan guidance should point to readiness and use it as input rather than conflicting with it.

Do not hide Program creation inside `postinstall`. Use explicit commands and reviewable generated artifacts.

Do not overfit mature-repo adoption to Bun, Next.js, Convex, Stripe, Linear, or the generated starter route map.

Do not let product messaging imply mature repos become production-ready automatically. The truthful promise is agent-readiness: clearer source truth, safer plans, validation, and review loops.

## Outcomes & Retrospective

This Program is active. It should complete only after generated repos ship the customer-safe operating pack and after the mature-repo adoption lane has a durable, validated product path or a deliberately scoped first release with remaining work recorded.

## Validation and Acceptance

At the Program level, acceptance requires proof across both lanes.

Generated-repo acceptance requires materialized customer repos to include the operating pack, root validation scripts, prompt assets, skills, and customer-safe docs without internal archive leakage. Compiler tests must prove the output structurally, not only through substring checks.

Mature-repo acceptance requires an adoption workflow that audits an existing repo, preserves its conventions, emits a Program packet and first child ExecPlan, and reports blocked proof or missing facts honestly.

Program completion also requires `bun run programs:lint`, relevant `plans:lint` checks, markdown lint for touched planning docs, focused compiler or product tests, and broader repo gates as dictated by child ExecPlans.

## Artifacts and Notes

The current planning brief is `docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-1.md`.

The first child ExecPlan is `docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md`.

The most relevant prior Program is `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/`.

## Interfaces and Dependencies

This Program depends on root `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, `docs/prompts/README.md`, `packages/blueprint-compiler/AGENTS.md`, `packages/blueprint-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`, `packages/blueprint-compiler/src/repo-generation/render-generalized-starter-files.ts`, `packages/blueprint-compiler/src/repo-generation/render-starter-project-onboarding.ts`, `packages/blueprint-compiler/src/repo-generation/render-starter-skills.ts`, `packages/blueprint-compiler/src/repo-generation/starter-root-package-json.ts`, and generated repo materialization tests.
