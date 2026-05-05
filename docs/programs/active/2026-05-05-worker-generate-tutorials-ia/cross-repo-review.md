---
title: "Worker Generate Tutorials Cross Repo Review"
summary: "Risk review for the Worker, Tutorials, and Generate Codebase IA migration."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Reviewing migration risks before implementation."
  - "Checking which old names are migration targets."
---

# Worker Generate Tutorials Cross Repo Review

## Highest Risks

The access model is the highest-risk area. The current scalar `fulfillmentTrack` is persisted through checkout, Stripe recovery, Convex access grants, route guards, and API guards. A naive rename would either strand users in one lane or overwrite an existing lane when a customer tries to add another.

The local runner is the second highest-risk area. Deployed runners and operator commands currently use workspace-named API paths and events. For this hard switch, `/api/workspace/runner/*` and `workspace.runner-event.v1` are migration targets, not supported long-term aliases. The runtime slice must replace them with Worker-owned names and prove the local runner uses those names.

Convex data is the third highest-risk area. Table names and event names include workspace language. The Program should rename Ship by Sunday-owned Convex worker concepts where feasible, but a child ExecPlan must handle persisted data safely instead of doing a blind table rename.

## Review Guidance

Reviewers should reject any implementation that only changes labels while links still redirect back to the old lane. Reviewers should also reject blind search-replace across `workspace` because that will hit package-manager workspaces, App Router route group names, tests, docs, and runtime contracts with different risk profiles. The right standard is classified hard switch: owned Worker concepts move; unrelated external/tooling language stays.

The first implementation review should focus on whether a single user with both capabilities can open `/generate-codebase`, `/tutorials`, and `/workers` without route loops. It should also check that old single-lane grants migrate to capabilities and land in a sensible new default destination.

Later runtime reviews should reject old workspace-named Worker APIs, events, local-runner commands, and proof language unless a survivor is explicitly classified as unrelated external/tooling language or immutable historical evidence.

## Test Watchpoints

Route tests must cover the new canonical paths and prove old product paths are not still supported routes. Access tests must cover generated-only, worker-only, tutorial-capable, dual-capable, and unresolved users. Checkout tests must prove a second surface entitlement does not overwrite the first. Local-runner tests must prove Worker-named API and command contracts are the current contract.
