---
title: Docs Spine Quality Reset Planning Brief 4
program_id: docs-spine-adoption-quality-reset
brief_version: 4
status: current
summary: Harden final apply/proof and run Arena CRM acceptance with the repaired scanner, renderer, and quality gate.
read_when:
  - Authoring the fourth child ExecPlan for docs-spine quality reset.
---

# Docs Spine Quality Reset Planning Brief 4

The next implementation slice should harden final apply/proof and run the Arena CRM acceptance pilot. The eval harness, scanner, and renderer are now repaired enough for focused adoption proof to pass. The remaining question is whether the full apply path produces customer-visible docs in Arena CRM that are strong enough to show.

Focus on `packages/local-runner/src/core/docs-spine-apply-and-proof-workflow.ts`, apply proof artifacts, and the real pilot repo at `/Users/bazelrex/Developer/arena-crm`. Apply should run quality evaluation before writes, preserve managed sections, reject weak or blocked drafts, and record native gate blockers honestly. It should also make the proof artifact easy to inspect when quality or native validation fails.

Run the full docs-spine adoption and apply flow against Arena CRM on a local branch. The output must preserve root `AGENTS.md` as a shim, `.codex/AGENTS.md` as canonical instructions, Bun/Turbo command semantics, and `bun run gate` blocker evidence if the native gate is still missing tooling. The final docs diff must not contain hidden audit folders, `.ai`, `.claude`, or `.codex/skills/**` as first-hop docs routes.

Acceptance requires the Arena-applied docs to pass the deterministic docs-spine quality report and to include the key contract surfaces: docs index, Program contract, active Program, ExecPlan contract, active ExecPlan, prompt inventory, validation notes, proof notes, and quality-score contract. If the native gate is blocked by repo-local dependency setup, record the exact blocker without treating it as a docs-spine quality failure.

Exact validation boundaries:

```bash
bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts docs-spine-apply-and-proof-workflow.test.ts
bun run --cwd packages/local-runner typecheck
bun run --cwd packages/local-runner lint
bun run --cwd packages/local-runner format:check
bun run plans:lint -- --plan <new-child-execplan>
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset <new-child-execplan>
git diff --check
```

After this slice lands, update `program.md` with Arena pilot refs, quality report status, native gate status, validation evidence, and whether any required Program slice remains.
