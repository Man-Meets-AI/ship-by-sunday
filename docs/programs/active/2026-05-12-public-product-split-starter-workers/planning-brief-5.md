---
title: Existing Customer Migration Notes Planning Brief 5
program_id: public-product-split-starter-workers
brief_version: 5
status: current
summary: Create a durable operator note for manually migrating the three existing paid customers after the Starter and Workers split.
read_when:
  - Writing or resuming existing-customer migration documentation for the public product split.
  - Deciding how legacy paid customers should map to Starter, Workers, both, or a bespoke grant.
  - Checking why the repo must not auto-migrate real customers by assumption.
---

# Existing Customer Migration Notes Planning Brief 5

## Planning Context

The product split is implemented repo-side: public IA, checkout/access, generated repo boundaries, docs unpromotion, and blog content all have completed child ExecPlans. The remaining repo-side dependency is to preserve the decision that the three existing paid customers should be migrated individually based on their preference and operator discretion.

Do not put private customer names, emails, Stripe IDs, Clerk IDs, or Convex document IDs in git. The durable artifact should be a procedure and decision worksheet, not a customer data record.

## Next Plan Recommendation

Exact next plan title: `Document Existing Customer Product Split Migration`.

Exact target path: `docs/exec-plans/active/2026-05-13-document-existing-customer-product-split-migration.md`.

Exact scope: add a maintainer/operator note under `docs/internal/` that explains how to review each legacy paid customer, decide Starter/Workers/both/manual path, apply grants through the existing operator mechanisms, verify access, and record the real migration result outside git.

Exact boundaries: do not change live access grants automatically, query production customer data, write private identifiers into the repo, or build a migration UI.

## Success Criteria

The slice succeeds when a checked-in internal note gives a future operator enough context to manually migrate the three customers without relying on chat memory, while keeping all private customer data out of source control.
