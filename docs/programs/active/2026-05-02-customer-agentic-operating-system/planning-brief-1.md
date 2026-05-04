---
title: Customer Agentic Operating System Planning Brief 1
program_id: customer-agentic-operating-system
brief_version: 1
status: current
summary: Write the first child ExecPlan for reconciling generated-repo agent guidance before shipping the full customer-safe operating pack.
read_when:
  - Writing the first child ExecPlan for the customer agentic operating system Program.
  - Checking the initial generated-repo slice boundary.
---

# Customer Agentic Operating System Planning Brief 1

## Planning Context

Ship by Sunday should become the agentic engineering operating system for both new generated repos and mature existing codebases. The buyer-facing product is a worker layer, and Programs, ExecPlans, validation, review evidence, and loops are the substrate that make workers durable. The first implementation slice should focus on generated customer repos because that path is already controlled by `packages/codebase-compiler`, already has customer-safe materialization tests, and already emits Build Pack readiness and first-slice planning docs. The first slice should reconcile source truth and drift before it ships the full operating pack.

The Program packet lives at `docs/programs/active/2026-05-02-customer-agentic-operating-system/`.

## Next Plan Recommendation

Exact next plan title: `Reconcile Customer Agentic Source Contract`.

Exact target path: `docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md`.

Exact scope: reconcile the existing generated-repo agent source contract before adding new operating-pack artifacts. The slice should inspect and align root `AGENTS.md`/`CLAUDE.md`/`GEMINI.md`, `START-HERE.md`, Build Pack docs, prompt asset naming, skill trigger availability, customer-safe exclusions, generated package-script promises, and clean-room tests.

Exact implementation boundaries: stay inside `packages/codebase-compiler`, generated starter guidance, generated docs and prompt pack wiring, generated skill files, customer-safe snapshot contracts, output tracing where required, and compiler tests. Do not change auth, billing, checkout, Convex runtime, app routes, provider setup, codebase intake schema, mature-repo upload flows, public homepage copy, or public pricing.

Exact validation boundaries: run focused compiler tests for repo generation, review download zip behavior, customer-safe snapshot contracts, and any new materialized clean-room checks. Then run package typecheck, package format check, package lint, `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-reconcile-customer-agentic-source-contract.md`, `bun run programs:lint`, markdown lint for the Program and child ExecPlan, and broader repo gates as needed.

## Required First-Slice Decisions

The child ExecPlan must decide the current source-of-truth model for customer agent guidance. It should identify whether `execplan-*` or `exec-plan-*` prompt assets are the customer-facing family, and it should prevent generated guidance from pointing to nonexistent skills, scripts, or docs.

The child ExecPlan should not emit a seed Program packet yet unless implementation proves that doing so is necessary to reconcile existing source truth. Seed Program generation belongs naturally in a later explicit bootstrap slice.

The child ExecPlan must keep the mature-repo lane as a future Program slice. It can preserve extension points, but it must not build mature-repo product UI.

The child ExecPlan must also preserve the worker-first thesis without changing public positioning in this slice. Homepage, pricing, checkout, and docs hierarchy changes belong in the later worker-led two-lane customer journey slice, after generated-repo source truth is coherent enough to point at real files and commands.

## Success Criteria

The slice succeeds when a generated repo downloaded or materialized from the compiler has coherent agent guidance: every generated skill trigger resolves to a local or external skill, every advertised package script exists, prompt asset naming is intentional, Build Pack paths are accurate, internal planning archives remain excluded, and tests prove those facts.
