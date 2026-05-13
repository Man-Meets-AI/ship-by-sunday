---
title: Existing Customer Product Split Migration
summary: Operator procedure for manually mapping legacy paid customers into Starter, Workers, both, or a bespoke path after the public product split.
docType: internal_runbook
status: active
read_when:
  - Migrating legacy paid customers after the Starter and Workers split.
  - Deciding whether an existing customer should receive Starter, Workers, both, or a bespoke grant.
  - Verifying product-specific access after manual grants.
---

# Existing Customer Product Split Migration

This runbook is for manually migrating the small set of legacy paid customers after the product split into Starter and Workers.

Do not add real customer names, emails, Stripe IDs, Clerk IDs, Convex document IDs, or support-thread excerpts to this file. Record customer-specific decisions in the operator-owned customer tracker, support thread, or provider dashboard notes.

## Current Product Paths

Starter is for customers starting from an idea, a Lovable-style prototype, or a prompt pile. It includes the guided codebase generator and lessons. The app destination is `/starter/home`.

Workers is for customers with an existing repo. It includes local runner setup, private doctor pass, top findings, one approved worker loop, and proof or blocked-proof report. The app destination is `/workers/setup`.

Some legacy customers may reasonably receive both if their original purchase covered the starter/generator material and they are also a fit for the founding Worker install.

## Migration Principles

Handle one customer at a time. Do not mass-update all legacy paid users.

Start from what the customer thought they bought, what they are currently trying to do, and what would be fair based on the new split.

Prefer clarity over strict automation. If the fit is ambiguous, ask the customer which path they want before changing access.

Do not revoke working access as part of cleanup unless the customer explicitly asks for a different path and the replacement access has been verified.

## Decision Paths

Choose Starter when the customer primarily wants to start from an idea, generate a customized repo, use the template, or watch the guided lessons.

Choose Workers when the customer already has a repo and wants diagnosis, worker setup, a doctor pass, findings, an approved loop, and proof.

Choose both when the customer bought the older blended product, still needs the generator or lessons, and is also a clear existing-repo Worker fit.

Choose bespoke/manual follow-up when the purchase context is unclear, the customer expected something outside current Starter or Workers scope, or the operator wants to preserve goodwill before changing access.

## Grant Targets

Starter access should allow:

- `/starter/home`
- `/starter/generate-codebase`
- `/starter/generate-codebase/review`
- `/starter/lessons`
- `/starter/lessons/[lessonKey]`

Workers access should allow:

- `/workers/setup`
- `/workers/doctor-pass`
- `/workers/findings`
- `/workers/loops`
- `/workers/runs`
- `/workers/privacy`

Multi-product or unresolved access may still use `/home` as the recovery hub.

## Manual Procedure

1. Open the operator-owned customer record outside git.
2. Confirm the original purchase context and current customer goal.
3. Pick one migration outcome: Starter, Workers, both, or bespoke/manual follow-up.
4. Apply the access grant through the existing operator mechanism.
5. Sign in as or verify with the customer account using approved operator tooling.
6. Confirm `/home` routes the customer to the right destination or shows the correct multi-product recovery state.
7. Confirm the product-specific route loads: `/starter/home` for Starter, `/workers/setup` for Workers.
8. Record the outcome, date, operator, and verification evidence outside git.

## Verification Checklist

For Starter, verify the customer can open `/starter/home`, see both Starter paths, open `/starter/generate-codebase`, and open `/starter/lessons`.

For Workers, verify the customer can open `/workers/setup` and cannot accidentally receive Starter access unless the migration decision was both.

For both, verify `/home` shows the expected product chooser or recovery state and that both product route families load.

For bespoke/manual follow-up, leave the existing access unchanged until the customer-specific decision is recorded.

## Do Not Commit

- customer names
- customer email addresses
- Stripe customer IDs
- Stripe checkout session IDs
- Clerk user IDs
- Convex document IDs
- payment screenshots
- support thread excerpts
- private migration outcomes

Keep this file as the reusable procedure. Keep real migration evidence in the operator-owned system.
