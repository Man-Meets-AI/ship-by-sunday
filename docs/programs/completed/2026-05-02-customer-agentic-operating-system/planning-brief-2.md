---
title: Customer Agentic Operating System Planning Brief 2
program_id: customer-agentic-operating-system
brief_version: 2
status: current
summary: Split the existing-codebase product into child ExecPlans for checkout intent, workspace state, local runner setup, doctor pass, findings, first workflow approval, and later workers.
read_when:
  - Writing child ExecPlans for existing-codebase support.
  - Checking the Crawl, Walk, Work, and Run implementation split.
  - Verifying that generated-codebase and existing-codebase routes remain separate.
---

# Customer Agentic Operating System Planning Brief 2

## Planning Context

The Program has shifted from broad agentic operating-system strategy into a concrete existing-codebase product lane. Generated-repo buyers continue to `/codebase`. Existing-codebase buyers should route to `/workspace/setup`, pair a local runner, run a private doctor pass, approve sync-safe Top 9 findings, approve one workflow packet, and receive proof or blocked proof. The default privacy posture is local execution: Ship by Sunday coordinates the work and stores only approved structured state, not raw source, raw terminal logs, local absolute paths, secrets, or Codex transcripts.

This brief superseded `planning-brief-1.md` for existing-codebase child ExecPlans. The older brief remains the source for the completed generated-repo source-contract plan at `docs/exec-plans/completed/2026-05-02-reconcile-customer-agentic-source-contract.md`.

## Route And Product Contract

Generated-repo fulfillment stays on `/codebase`. Existing-codebase fulfillment starts at `/workspace/setup` and uses protected workspace routes: `/workspace/setup`, `/workspace/doctor-pass`, `/workspace/findings`, `/workspace/findings/[findingId]`, `/workspace/loops`, `/workspace/runs`, and `/workspace/privacy`.

The homepage should capture buyer intent and sell the existing-codebase outcome as a private codebase doctor pass. Setup belongs after checkout or sign-in. Loop setup belongs after diagnosis, when a finding recommends a concrete workflow. The first AHA is the Top 9 findings ledger, not a settings screen.

## Child ExecPlan Split

Keep one Program, then create child ExecPlans in dependency order as implementation begins. Use the local date on the day each plan file is created, with these slugs:

1. `existing-codebase-checkout-intent-routing`: persist `buyerStartingPoint`, `checkoutCtaId`, and `fulfillmentTrack` through Stripe metadata, pending checkout claims, product access grants, checkout success routing, and the intent fallback choice screen.
2. `existing-codebase-workspace-data-model-and-events`: add separate existing-codebase workspace tables for projects, runner bindings, repository bindings, doctor-pass runs, findings, and later workflow runs; add the append-only sync-safe runner event protocol.
3. `existing-codebase-setup-ui`: build `/workspace/setup`, Machine Setup, Project Setup, local runner pairing states, blockers, warnings, privacy defaults, and `Run doctor pass` readiness.
4. `local-runner-prototype`: build the Bun-first runner, pairing command, daemon and one-shot mode, local `.sbs/` state, `gh` readiness, SBS Codex profiles, config diff/backup/approval, and `codex exec` integration boundaries.
5. `doctor-pass-and-sync-preview`: productize deterministic probes, evolve `.sbs/codebase-intake.py` into sync-safe JSON plus local Markdown, run the branchless doctor pass, produce local reports, and gate findings upload behind sync preview approval.
6. `findings-ledger-and-decision-screens`: build `/workspace/doctor-pass`, `/workspace/findings`, and `/workspace/findings/[findingId]` around stage progress, dense Top 9 rows, finding detail, evidence refs without raw source, permission requirements, and recommended workflow routing.
7. `source-truth-agent-readiness-workflow`: build the first Walk workflow packet, approval sheet, SBS profile selection, write lease, branch naming, docs and `.sbs/` write boundary, proof output, local diff delivery, and optional explicit `Open PR`.
8. `workspace-support-surfaces`: build `/workspace/runs`, `/workspace/loops`, and `/workspace/privacy` for Crawl and Walk status, workflow catalog, local execution boundaries, runner revocation, and synced report deletion.
9. `existing-codebase-work-phase-workers`: add the always-on local worker layer after Walk works: approved queue, run history, heartbeat, pause and stop controls, proof sync, blocked-state reporting, recurring approved loops, and one active write lease per project.
10. `broken-app-rescue-loop`: add the conditional first workflow for customers with a concrete failure, starting with read-only reproduction and only patching after approval.
11. `managed-github-run-phase`: add premium or concierge managed GitHub execution only after local Crawl, Walk, and Work prove demand, with explicit repo access, storage, PR authority, audit, revocation, and raw-source rules.
12. `generated-repo-operating-pack`: after the active generated-repo source-contract plan lands, ship the customer-safe Program/ExecPlan operating file set and explicit generated-repo bootstrap without hidden `postinstall` mutation.

## First New Plan Recommendation

After the active generated-repo source-contract plan is completed or deliberately paused, the first new existing-codebase child should be `existing-codebase-checkout-intent-routing`. It is the smallest product-visible dependency because all later setup routes depend on knowing whether the buyer chose `I have an idea`, `I have a codebase`, or an unspecified legacy path.

If implementation momentum requires starting existing-codebase work before the generated-repo plan lands, create the checkout-intent plan first but keep its scope narrow. Do not build runner UI, local daemon behavior, findings, workflows, or worker queues inside the checkout-intent plan.

## Required Boundaries

Do not overload generated-codebase tables such as `projectDefinitions` or `codebaseWorkflowStates` for existing-codebase state. Use separate workspace tables.

Do not use `opportunity` naming for the existing-codebase ledger. The canonical object is `finding`.

Do not sync raw source, raw terminal logs, local absolute paths, secrets, or Codex transcripts by default. Sync-safe evidence refs can include repo-relative paths, line numbers, command names, artifact ids, statuses, and blocked reasons after approval.

Do not make `/workspace/loops` a runnable always-on loop center in Crawl. It is a workflow catalog filtered by findings until approved workflow packets exist.

Do not let Work or Run features pull forward into Crawl. Crawl is setup, local pairing, read-only diagnosis, sync preview, and findings. Walk is one approved workflow with proof. Work is persistent approved workers. Run is managed or hosted automation.

## Validation Expectations

Each child ExecPlan must name its narrow validation commands. Program-level validation remains `bun run programs:lint`, `bun run plans:lint -- --plan <path>` for any touched child ExecPlan, markdown lint for touched planning docs, `git diff --check`, and the narrow app, Convex, compiler, runner, or browser checks owned by the slice.

Before implementation claims are made public, browser proof should cover the relevant desktop and mobile workspace routes, and copy should not promise self-serve existing-repo automation beyond the slice that actually works.
