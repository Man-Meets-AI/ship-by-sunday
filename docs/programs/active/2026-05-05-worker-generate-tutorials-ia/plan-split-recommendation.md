---
title: "Worker Generate Tutorials Plan Split Recommendation"
summary: "Recommended ExecPlan slices for the Worker, Tutorials, and Generate Codebase IA migration."
docType: "plan_split_recommendation"
status: "active"
read_when:
  - "Creating child ExecPlans for the migration."
  - "Checking the intended slice order."
---

# Worker Generate Tutorials Plan Split Recommendation

## Slice 1: Hard Switch Product IA To Generate Codebase Tutorials And Worker

Replace the customer-facing product IA in one coherent cutover. Add capability-style access so a customer can be entitled to Generate Codebase, Tutorials, and Worker independently. Replace old product routes with `/generate-codebase`, `/tutorials`, and `/workers`. Update route guards, resume destinations, checkout success routing, Command-K, header navigation, user menu links, route tests, and the visible app copy needed for those surfaces. This is the first child ExecPlan.

## Slice 2: Hard Switch Worker Runtime Contracts

Rename Ship by Sunday-owned runtime worker contracts that still expose workspace language: API paths, local-runner command language, Convex worker event names where feasible, docs, tests, proof language, and operator scripts. Do not rename unrelated package-manager workspace language or external tool terminology.

## Slice 3: Hard Switch Docs Generated Instructions And Release Proof

Update docs, generated customer-facing instructions, release proof expectations, smoke checklists, and onboarding material so they teach Generate Codebase, Tutorials, and Worker. Keep the generated artifact named Codebase unless separately changed.

## Slice 4: Final Workspace Name Scan And Cleanup

Run a focused scan for `workspace`, `/workspace`, `/codebase`, `/review`, `/lesson`, `generated_codebase`, and `existing_codebase_doctor`. Classify any survivors as unrelated external/tooling language, immutable history, or bugs. Fix the bugs. The Program completes only when the scan and tests prove the hard switch.
