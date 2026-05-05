---
title: "Worker Generate Tutorials Dependency Graph"
summary: "Dependency order for the Worker, Tutorials, and Generate Codebase IA migration."
docType: "dependency_graph"
status: "active"
read_when:
  - "Choosing the next implementation slice."
  - "Checking why route renames cannot safely happen before access widening."
---

# Worker Generate Tutorials Dependency Graph

The migration has one hard dependency inside the first implementation slice: capability-based access and canonical route cutover must land together before customer-facing cross-navigation ships. Current route and Convex guards use one scalar `fulfillmentTrack`, so route links across surfaces will fail until authorization supports more than one surface.

## Ordered Dependencies

1. Product IA hard switch. Split paid access from surface capability and replace customer-facing product routes with `/generate-codebase`, `/tutorials`, and `/workers`. Read old checkout track literals only as migration inputs.

2. Resume destination and checkout success routing. Make post-checkout and home-redirect behavior choose among the new canonical route families without teaching the old paths.

3. Shared navigation model. Add a top-level surface model consumed by Command-K, user menu, and header-level switching.

4. Worker runtime contract hard switch. Move owned API paths, local-runner command language, event names, tests, and docs from workspace wording to worker wording.

5. Product-facing docs and generated instructions. Move visible customer language to Worker, Tutorials, and Generate Codebase.

6. Final scan cleanup. Fix any remaining current product or owned runtime use of old names.

## Parallelizable Work

Docs inventory and copy audit can run alongside the first hard-switch slice, but it should not ship first as the product contract because it would advertise traversal that the app cannot perform.

Test inventory can run alongside route work. The tests should first prove dual-capability access, then prove canonical routes and absence of old product route support.

Runtime contract migration should not run in parallel with the first product IA slice because both touch authorization and route guard assumptions.
