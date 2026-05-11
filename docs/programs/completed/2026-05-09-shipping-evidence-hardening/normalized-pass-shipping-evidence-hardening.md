---
title: Shipping Evidence Hardening Normalized Pass
summary: Normalized tracks and priorities for hardening the repo's shipping evidence surfaces.
docType: synthesis
status: active
read_when:
  - Comparing candidate implementation tracks for shipping evidence hardening.
  - Deciding which slice should happen before billing, staging, or generated-output work.
---

# Shipping Evidence Hardening Normalized Pass

The initiative normalizes into five tracks.

Track 1 is source gate coverage. The current source gate should prove the whole repo, not only the web app. This track owns package workspace tests, package typechecks, package smoke scripts, root script tests, and critical app coverage.

Track 2 is Convex and billing runtime evidence. This track owns Convex runtime test strategy, webhook idempotency, delayed checkout fulfillment, retry-token validation, entitlement identity, and the stale billing e2e destination expectation.

Track 3 is staging and production preflight. This track owns dev payment staging authority boundaries, production env validation, Stripe live object checks, webhook endpoint checks, Vercel alias proof, Convex deploy-mode proof, and observability readiness.

Track 4 is release evidence truthfulness. This track owns evidence schema behavior, tag-release proof collection, fail-closed handling for skipped required proof, and artifact consumption instead of check-run conclusion-only decisions.

Track 5 is generated customer repo proof. This track owns clean-room materialization of generated snapshots, advertised command execution, generated CI examples, and customer-safe validation docs.

The recommended order is Track 1 first, then Track 2 and Track 3 in parallel if staffing allows, then Track 4 once the proof artifacts are explicit enough to consume, then Track 5 after the internal source gate is stable.
