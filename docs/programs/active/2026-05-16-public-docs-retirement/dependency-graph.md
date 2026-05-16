---
title: "Public Docs Retirement Dependency Graph"
summary: "Ordering dependencies for deleting public docs without breaking blog or losing setup truth."
docType: "dependency_graph"
status: "active"
read_when:
  - "Sequencing child ExecPlans for public docs removal."
  - "Checking what must happen before deleting docs MDX."
---

# Public Docs Retirement Dependency Graph

## Ordered Dependencies

1. Confirm route and content inventory.
2. Extract setup truth into durable non-public docs.
3. Update active docs that point at public docs MDX as setup truth.
4. Remove docs route runtime and MDX content.
5. Remove docs references from shared content inventory, metadata, config, tests, and markdown tooling.
6. Validate blog rendering and public route metadata.
7. Run repo-level static gates and whitespace checks.

## Parallelizable Work

Setup-truth extraction can happen in parallel with detailed docs runtime inventory, but the public MDX files should not be deleted until replacement setup truth exists.

Docs-specific test deletion can happen alongside route deletion because those tests only assert the removed behavior.

Blog validation can happen after shared content inventory changes; it should not be mixed with docs deletion edits.

## Blocking Edges

Docs MDX deletion depends on setup truth extraction.

Content inventory cleanup depends on knowing whether any shared blog helpers currently depend on docs types.

Markdown metadata family cleanup depends on the docs MDX path being removed or intentionally out of validated paths.

Active Program and ExecPlan reference cleanup depends on the final durable setup truth location.

## External Dependencies

No provider dashboard change is required for the Program creation. The implementation slice should not create, rotate, or reveal secrets.

If setup docs need to name provider env or webhook contracts, they should name env variable keys, callback paths, event types, permission names, and verification commands without exposing secret values.
