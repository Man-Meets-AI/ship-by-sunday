---
title: Shipping Evidence Hardening Plan Split Recommendation
summary: Recommended child ExecPlan split for the Shipping Evidence Hardening Program.
docType: plan-split
status: active
read_when:
  - Creating the next child ExecPlan.
  - Checking which implementation slices should stay separate.
---

# Shipping Evidence Hardening Plan Split Recommendation

Split the Program into bounded ExecPlans.

1. CI and workspace baseline. Wire package tests, package typechecks, package smoke scripts, root script tests, and critical app coverage into a fast source gate. Keep hosted proof out of this slice.

2. Convex runtime and billing webhook harness. Add runtime-appropriate Convex coverage, close retry-secret and identity-source gaps, add webhook duplicate/out-of-order proof, and align billing e2e expectations with the current product journey.

3. Staging and production preflight. Make production env, Stripe live object, webhook endpoint, Vercel alias, Convex deploy mode, and observability checks explicit. Preserve dev payment staging as a test-mode rehearsal lane.

4. Release evidence schema and tag proof. Make release evidence consume the proof summaries and fail closed on missing or skipped required proof.

5. Generated customer repo command contract. Materialize a generated repo in a fixture and run the commands the snapshot advertises. Update generated CI examples and docs only to match runnable proof.

Do not combine slices 1 and 3. The first is a deterministic source gate. The third depends on hosted provider metadata and should be validated with release-proof style commands.
