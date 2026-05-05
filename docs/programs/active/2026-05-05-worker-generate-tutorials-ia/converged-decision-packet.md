---
title: "Worker Generate Tutorials Converged Decision Packet"
summary: "Final planning decisions for the Worker, Tutorials, and Generate Codebase IA migration."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking the canonical route and naming decisions."
  - "Resolving whether to preserve Workspace as a product noun."
---

# Worker Generate Tutorials Converged Decision Packet

## Decisions

Decision: Use `/generate-codebase`, `/tutorials`, and `/workers` as the canonical route families.

Rationale: The three route families match the jobs customers understand: generate a codebase, watch tutorials, and run workers against an existing repo.

Decision: Use `Worker` as the product and runtime noun everywhere this product means the existing-repo operation surface.

Rationale: The product owner rejected `Workspace`, `Worker Space`, and a gentle compatibility rollout. The migration should make the product and Ship by Sunday-owned runtime language direct and consistent.

Decision: Keep the generated artifact named Codebase unless a later explicit product decision changes the artifact.

Rationale: `/generate-codebase` names the tool, not necessarily the artifact. Renaming the generated artifact would widen into compiler and generated customer docs and should not be coupled to the IA migration unless requested.

Decision: Widen access before route and nav changes.

Rationale: The current single `fulfillmentTrack` blocks cross-surface traversal. Adding route links first would create redirect loops and false affordances.

Decision: Do a hard switch, not a compatibility route rollout.

Rationale: Keeping `/codebase`, `/review`, `/lesson/*`, `/workspace/*`, or `/api/workspace/runner/*` as supported aliases would preserve the old IA and undermine the rename. Transitional scaffolding is allowed only inside a single implementation milestone when needed to keep tests passing while the same milestone removes or rewires the old surface.

Decision: Runtime identifier migration is in scope for the Program and must be planned as a hard switch.

Rationale: "Worker everywhere" is the end state. The first product slice can focus on app routes and access, but the Program is not complete until Ship by Sunday-owned API paths, Convex event names, local-runner commands, docs, and tests no longer expose workspace naming.

## Non-Decisions

This packet does not decide to rename generic monorepo workspace references. It does not decide to rename immutable historical evidence. It does not decide to rename the Codebase artifact.
