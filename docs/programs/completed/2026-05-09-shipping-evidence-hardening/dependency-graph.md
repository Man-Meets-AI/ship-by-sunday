---
title: Shipping Evidence Hardening Dependency Graph
summary: Dependency graph for the source gate, runtime proof, preflight, release evidence, and generated-output tracks.
docType: dependency-graph
status: active
read_when:
  - Ordering child ExecPlans for Shipping Evidence Hardening.
  - Checking which tracks depend on proof artifacts from earlier tracks.
---

# Shipping Evidence Hardening Dependency Graph

Source gate coverage is the root dependency. It can start immediately because it mostly wires existing package scripts and tests into root commands and CI.

Convex and billing runtime evidence depends on current billing/auth code paths and Convex guidelines. It can start after or alongside the source gate, but any new Convex runtime dependency or package change must update lockfiles and CI validation in the same slice.

Staging and production preflight depends on release workflow contracts, Vercel metadata access, Convex deploy summaries, Stripe live/test key separation, Clerk env parity, and existing release proof commands. It can proceed once the exact production proof gaps are represented as scripts or workflow steps.

Release evidence truthfulness depends on preflight and deploy workflows emitting trustworthy summaries. It should consume artifacts that say what actually happened instead of inferring truth from check-run conclusions.

Generated customer repo proof depends on compiler snapshot generation and root package script contracts. It does not need to wait for production preflight, but it should align with the final source-gate vocabulary so generated repos do not inherit obsolete command names.
