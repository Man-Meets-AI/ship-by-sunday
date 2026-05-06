---
title: Worker-Grade Docs Operating System Decision Packet
summary: Accepted direction for expanding local-runner docs-spine adoption into portable docs tooling installation.
docType: program_decision
status: active
read_when:
  - Checking the accepted direction for Worker-grade docs operating-system adoption.
  - Deciding whether a child slice belongs in docs-only apply or the new tooling install authority.
---

# Worker-Grade Docs Operating System Decision Packet

The Program will extend docs-spine adoption beyond Markdown docs by adding a separate tooling-install authority. The existing `docs-spine-apply-and-proof` workflow remains a docs mutation packet. It should keep blocking or documenting missing scripts and dependencies until a tooling workflow installs them.

The first child slice should design and implement a structured install plan. That plan is the bridge between discovery and mutation. It should name portable docs package scripts, dependencies, validator files, proof commands, same-name conflicts, blocked operations, and rollback notes.

The portable core is Program and ExecPlan contracts, prompt contracts, path-family markdown linting, docs-spine validation, planning lint scripts, docs validation scripts, child-plan generation, and proof artifacts.

`worker-grade` is an install preset, not a monolithic implementation path. It should resolve into explicit modules so the runner can report already-present, installable, skipped, blocked, and conflicting surfaces independently.

The accepted preset has one tier: portable docs core modules. `worker-grade` must not select Worker-specific state modules.

Runtime installation and Worker-specific operating state are deferred. Shared docs tooling can come from a pinned package, but target-stack runtime commands and Worker-owned state surfaces are not portable enough for this Program. Worker-specific `apps/runtime`, notes, goals, projects, role docs, topology, and worker-state behavior are research input only, not templates to copy into customer repos.

The install path must preserve target repo conventions. It must detect package managers, workspace structure, existing scripts, native gate commands, canonical instruction files, docs ownership, and existing validation surfaces before proposing changes.

Same-name conflict handling is mandatory. Recognized previous runner output can be replaced. Owner Markdown should receive managed sections. Structured files should be patched through parsers. Package script collisions should become explicit keep, rename, replace-with-approval, or blocked operations. Runtime files, Worker-specific state files, CI/provider files, app-stack command wiring, and broad root `AGENTS.md` rewrites are out of scope and should be reported as deferred rather than overwritten.

The top-level workflow should use separate phase confirmations. A plan-only run should not require docs or tooling apply authority. A docs-only run should not require package-script authority.

The first child slice is dry-run manifest only. It should not mutate package manifests, lockfiles, validator files, docs files, or root instruction files. It should prove the install-plan schema, same-name conflict states, out-of-scope reporting, and real-repo dry-run behavior before a later slice applies package or dependency changes.

The validator source of truth should be a pinned `ship-by-sunday` tooling package with tiny checked-in wrappers in the target repo. Do not copy large Worker validator source into customer repos.

The canonical portable docs scripts are `programs:lint`, `plans:lint`, `markdown:lint`, `docs:validate`, `docs:refresh-quality`, and `program:write-child-plan`. Unknown collisions with those names are blocked or explicitly renamed, never overwritten.

Docs routing is part of the portable core only as scoped navigation. Broad root `AGENTS.md` rewrites remain out of scope.

The Program should use Worker as the quality target, not as a blind template source. A sparse repo should receive only the portable docs core. Arena CRM should keep its Bun/Turbo and `.codex/AGENTS.md` conventions. Ship by Sunday should prove that the install model can recognize a repo that already has most of the portable docs system.

Acceptance is not "docs mention commands." Acceptance is that installed or proposed commands can actually run, fail, or block with durable evidence.
