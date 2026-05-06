---
title: Docs Spine Quality Reset Planning Brief 1
program_id: docs-spine-adoption-quality-reset
brief_version: 1
status: superseded
summary: Build the docs-spine eval and lint harness that fails the current weak Arena CRM output before any renderer rewrite.
read_when:
  - Authoring the first child ExecPlan for docs-spine quality reset.
---

# Docs Spine Quality Reset Planning Brief 1

The first implementation slice must create the quality gate that should have existed before v1 apply. Do not begin by adding more Markdown templates. Begin by making the current bad Arena output fail deterministically.

Add a docs-spine eval harness under the existing TypeScript/Bun tooling. Prefer a workflow-local validator module plus focused tests. The validator should be callable by the local-runner proof path and by direct tests against fixtures.

Create fixtures or fixture builders for three classes of output: Worker/SBS-grade exemplar docs, the current Arena-v1 weak output, and an intended minimal passing customer repo output. Fixtures should be small enough for tests but must include the contract-bearing files: docs index, quality score, Program contract, active Program packet, ExecPlan contract, active ExecPlan, prompts README, validation doc, proof doc, and instruction routing evidence.

The eval harness must reject:

- apply-ready drafts with blocked status or blocked reasons
- docs without required frontmatter where the contract requires it
- docs index files missing `Owns`, `Does Not Own`, Codex guidance, first-hop routing, or `Next`
- Program packets that fail Program packet lint or required section checks
- ExecPlans that fail ExecPlan lint or required section checks
- quality-score docs with only placeholders and no scorecard contract
- generated docs that dump hidden audit or skill folders as primary guidance
- outputs that do not recognize canonical instruction shims
- outputs that omit native gate discovery
- outputs that pass only heading checks

Add a machine-readable quality report. It should include status, score or threshold result, failed rule ids, paths, severity, and remediation text. Use rule ids that can remain stable in proof artifacts.

Wire the docs-spine adoption and apply proof surfaces to include the eval report, but keep this first slice focused on validation. If applying the report to live Arena output requires expensive setup, use captured fixture output first and leave the full pilot for the later acceptance slice.

Exact validation boundaries:

```bash
bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts
bun run --cwd packages/local-runner typecheck
bun run --cwd packages/local-runner lint
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset
git diff --check
```

After this slice lands, update `program.md` with the rule ids, fixture paths, focused validation evidence, and the next recommended scanner repair slice.
