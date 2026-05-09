---
title: Test Infrastructure Hardening Research Pass
summary: Initial research pass across unit tests, CI gates, staging, production preflight, billing, Convex, and generated customer repo evidence.
docType: research
status: active
read_when:
  - Re-entering the Shipping Evidence Hardening Program.
  - Checking what the initial exploration found before writing child ExecPlans.
---

# Test Infrastructure Hardening Research Pass

The initial research found that Ship by Sunday already has meaningful tests and release proof, but the required evidence does not yet match the riskiest failure modes.

`apps/web` has 200-plus test/spec files across unit, contracts, integration, integration-ui, and e2e. Package workspaces also have tests and smoke scripts. CI currently requires only the app-centered `static` and `integration` jobs, so package tests, package typechecks, package smoke scripts, root script tests, and `test:coverage:critical` are outside the merge gate.

Billing and entitlement coverage is useful but incomplete. Checkout creation, guest and signed-in metadata, Stripe webhook action branches, pending checkout claims, and grant idempotency have direct tests. The weak areas are real Convex runtime behavior, a first-class processed Stripe event ledger, duplicate/out-of-order webhook proof, inconsistent retry-secret validation between Next and Convex, and a stale billing e2e expectation that paid checkout lands on `/codebase` while the current unresolved fulfillment route is `/workspace/choose`.

Release infrastructure exists and is directionally correct. `dev.man-meets-ai.com` proves test-mode payment staging. Production release proof waits for a matching Vercel production deployment and runs hosted proof. Convex production deploy is separate. Tag release validates manifest and evidence. The weak areas are proof precision: Convex deploy skip can still make the workflow conclusion green, production proof does not assert the production alias points to the exact deployment, release evidence mostly consumes check-run conclusions, and critical production env values are optional until specific routes or scripts exercise them.

Generated customer repo output needs its own proof. The generated root package advertises `test:compiler`, but the generated snapshot does not ship the compiler tests/config required for that command to run. The generated CI example is intentionally thin and omits typecheck, tests, format check, and agentic checks.
