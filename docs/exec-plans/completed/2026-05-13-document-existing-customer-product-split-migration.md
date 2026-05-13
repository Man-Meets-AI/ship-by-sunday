---
title: Document Existing Customer Product Split Migration
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Add a private-data-safe operator note for manually mapping legacy paid customers into Starter, Workers, both, or a bespoke path.
post_build_recap: Added an internal migration runbook that documents one-customer-at-a-time decision paths, grant targets, verification checks, and private-data boundaries for legacy paid customers.
program_id: public-product-split-starter-workers
planning_brief: docs/programs/active/2026-05-12-public-product-split-starter-workers/planning-brief-5.md
read_when:
  - Resuming the existing-customer migration documentation slice.
  - Preparing to manually migrate legacy paid customers after the product split.
  - Checking how to avoid storing private customer identifiers in git.
---

# Document Existing Customer Product Split Migration

This document is a living execution plan for adding durable operator notes for the three existing paid customers.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The product split should not silently strand or mass-migrate existing paid customers. There are only three paid customers, and the product decision is to handle each one individually based on fit, preference, and operator discretion. After this slice, the repo should contain a private-data-safe internal procedure that explains how to decide and verify each customer migration without relying on chat memory.

## Progress

- [x] 2026-05-13: Read the active Program and confirmed the remaining repo-side migration need is documentation, not automatic grant mutation.
- [x] 2026-05-13: Created planning brief 5 and this active child ExecPlan.
- [x] 2026-05-13: Added `docs/internal/existing-customer-product-split-migration.md` with decision paths, grant targets, verification checks, and a no-private-data rule.
- [x] 2026-05-13: Updated the Program state for the migration notes slice.

## Surprises & Discoveries

No production customer identifiers are available or appropriate for this repo artifact. The right checked-in output is a migration protocol and worksheet template, with real customer-specific decisions recorded in the operator-owned system outside git.

## Decision Log

Decision: Document the manual migration protocol rather than build code that auto-migrates legacy customers.
Rationale: The user said there are only three paid customers and they should be migrated individually based on desire and discretion. Auto-migration would encode assumptions the repo cannot know.
Date: 2026-05-13.

## Outcomes & Retrospective

Completed the existing-customer migration documentation slice. The repo now has an internal operator runbook for manually deciding Starter, Workers, both, or bespoke migration for each legacy paid customer without committing private customer data or auto-mutating grants.

## Context and Orientation

The public product split creates two current paid product destinations: Starter and Workers. Starter buyers land on `/starter/home` and may use `/starter/generate-codebase` plus `/starter/lessons`. Workers buyers land on `/workers/setup` and move through protected Worker operational routes. Legacy customers may have been sold under the older blended Generate Codebase / Tutorials / Worker framing, so a human needs to decide the fair mapping.

### In Scope

Create `docs/internal/existing-customer-product-split-migration.md` with migration principles, decision paths, grant targets, verification steps, and a no-private-data worksheet.

### Out Of Scope

Do not query customer data, create grants, edit Convex documents, edit Stripe records, build a migration UI, or store real names, emails, Stripe IDs, Clerk IDs, or Convex IDs in git.

## Plan of Work

Write an internal operator note that states the rule of engagement: one customer at a time, confirm their desired path, decide Starter, Workers, both, or bespoke, apply grants through existing operator tooling, verify product-specific redirects, and record the actual outcome outside git.

Update the Program progress and slice ledger so this documentation slice is recorded.

## Milestones

The first milestone is the operator note. It is complete when `docs/internal/existing-customer-product-split-migration.md` contains a complete procedure and no private identifiers.

The second milestone is validation. It is complete when docs lint and Program lint pass for the touched artifacts.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Run docs validation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-document-existing-customer-product-split-migration.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-13-document-existing-customer-product-split-migration.md docs/internal/existing-customer-product-split-migration.md docs/programs/active/2026-05-12-public-product-split-starter-workers

## Validation and Acceptance

Acceptance requires a private-data-safe internal note that a future operator can use to manually migrate each legacy customer. It must name decision criteria, grant targets, verification steps, where to record real outcomes, and what not to commit.

The test brief for this slice is: Feature: existing-customer migration documentation. Risk: P2 operator workflow because the doc steers customer access decisions, but it does not mutate live data. Source of truth: internal migration note and Program ledger. Must work: a future operator can decide and verify the migration for each legacy customer. Must fail safely: the note warns not to store private identifiers or auto-grant by assumption. Tests: docs lint and Program lint. CI gate: docs lint.

### Test Commands

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-13-document-existing-customer-product-split-migration.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-13-document-existing-customer-product-split-migration.md docs/internal/existing-customer-product-split-migration.md docs/programs/active/2026-05-12-public-product-split-starter-workers

## Idempotence and Recovery

The note is safe to update as the actual migration process changes. If private data is accidentally added, remove it immediately and record the actual customer-specific decision in the operator-owned system instead.

## Artifacts and Notes

The desired repo artifact is a procedure, not the customer migration log. Real customer-specific migration evidence belongs outside git.

## Interfaces and Dependencies

This slice depends on `docs/internal/`, the active Program packet, and existing operator access mechanisms in the app. It does not change runtime code.
