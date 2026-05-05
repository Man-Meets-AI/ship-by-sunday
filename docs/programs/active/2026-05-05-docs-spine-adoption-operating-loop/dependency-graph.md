---
title: Dependency Graph
summary: Ordering dependencies for the Docs Spine Adoption Operating Loop Program.
docType: program_dependency_graph
status: active
read_when:
  - Deciding which docs-spine adoption slice should run next.
---

# Dependency Graph

## Root Decision

The workflow is a deterministic local-runner bundle with scanner facts, bounded Codex synthesis, approved docs writes, and proof artifacts.

## Dependency Edges

The workflow bundle scaffold comes first. The repo needs one manifest, phase runner, schema boundary, artifact layout, and proof result before deeper scanners or prompt packets have a stable host.

Scanner facts come before Codex synthesis. Codex should write from normalized evidence, not from unbounded repo exploration.

Prompt packets come before apply logic. Draft outputs need a stable schema for target path, body, claims, evidence refs, and blocked facts before the workflow can safely apply them.

Apply logic comes before the Arena CRM pilot. The pilot should prove the real workflow, not a one-off manual docs patch.

Performance decisions come after a real pilot. Bun and TypeScript remain the v1 implementation unless measured scanner time on Arena CRM exceeds the performance budget defined by the scaffold or scanner ExecPlan.

Quality-score population comes after scanner evidence. The docs-spine adoption loop may install a quality-score landing contract, but scored tables require a later quality-score audit.

## Blocking Risks

If subagents apply files independently, the workflow becomes nondeterministic and hard to prove.

If Semgrep or AST scans are introduced before schemas are stable, the workflow will produce interesting findings without a reliable way to turn them into docs.

If the runner assumes Ship by Sunday conventions, mature repos such as Arena CRM will receive wrong docs and false proof.

If package scripts are changed in v1, the workflow can accidentally widen from docs adoption into build-system mutation.

