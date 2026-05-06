---
title: Worker-Grade Docs Operating System Decision Packet
summary: Accepted direction for expanding local-runner docs-spine adoption into portable tooling and runtime installation.
docType: program_decision
status: active
read_when:
  - Checking the accepted direction for Worker-grade docs operating-system adoption.
  - Deciding whether a child slice belongs in docs-only apply or the new tooling install authority.
---

# Worker-Grade Docs Operating System Decision Packet

The Program will extend docs-spine adoption beyond Markdown docs by adding a separate tooling-install authority. The existing `docs-spine-apply-and-proof` workflow remains a docs mutation packet. It should keep blocking or documenting missing scripts, dependencies, and runtime commands until a tooling workflow installs them.

The first child slice should design and implement a structured install plan. That plan is the bridge between discovery and mutation. It should name package scripts, dependencies, validator files, runtime wrapper files, optional modules, proof commands, same-name conflicts, blocked operations, and rollback notes.

The portable core is Program and ExecPlan contracts, prompt contracts, path-family markdown linting, docs-spine validation, planning lint scripts, docs validation scripts, child-plan generation, and proof artifacts. Optional modules include notes, goals, projects, worker docs, topology, worker-state commands, and runtime gateway commands.

The install path must preserve target repo conventions. It must detect package managers, workspace structure, existing scripts, native gate commands, canonical instruction files, docs ownership, and existing runtime surfaces before proposing changes.

Same-name conflict handling is mandatory. Recognized previous runner output can be replaced. Owner Markdown should receive managed sections. Structured files should be patched through parsers. Package script collisions should become explicit keep, rename, replace-with-approval, or blocked operations. Unknown runtime files should block rather than be overwritten.

The Program should use Worker as the parity target, not as a blind template source. A sparse repo should receive the portable core and clear blocked proof for missing optional surfaces. Arena CRM should keep its Bun/Turbo and `.codex/AGENTS.md` conventions. Ship by Sunday should prove that the install model can recognize a repo that already has most of the system.

Acceptance is not "docs mention commands." Acceptance is that installed or proposed commands can actually run, fail, or block with durable evidence.
