---
title: Docs Spine Quality Reset Planning Brief 3
program_id: docs-spine-adoption-quality-reset
brief_version: 3
status: superseded
summary: Replace thin docs-spine renderers with Worker/SBS-grade contract output fed by repaired source-truth facts.
read_when:
  - Authoring the third child ExecPlan for docs-spine quality reset.
---

# Docs Spine Quality Reset Planning Brief 3

The next implementation slice should repair renderer and synthesis output. The eval harness now rejects weak docs, and the scanner now classifies canonical repo evidence. Use those facts to produce complete, repo-specific Markdown instead of placeholder scaffolds.

Focus on `packages/local-runner/src/workflows/docs-spine-adoption/synthesis.ts`. Replace the thin `renderDocsIndexMarkdown`, Program contract, active Program, ExecPlan contract, active ExecPlan, prompt index, validation/proof, and quality-score renderers with contract-grade output. Reuse or mirror the strongest local sources: `packages/codebase-compiler/src/repo-generation/render-starter-operating-pack.ts`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, Ship by Sunday's `docs/index.md`, and Worker's quality scorecard shape.

The renderer must use scanner facts. For Arena-style repos, docs index output should route root `AGENTS.md` as a shim to `.codex/AGENTS.md`, name Bun/Turbo script facts, identify native gate candidates, and avoid `.agents/daily-audit`, `.ai`, `.claude`, and `.codex/skills/**` as first-hop docs. Local skills can appear only in a skill inventory context, not as primary agent instructions.

Do not mark blocked drafts with `proposedFiles`. If a draft is blocked, it should carry blocked reasons and remediation without apply-ready Markdown. If the renderer has enough facts to produce a contract-compliant file, mark it ready and make it pass the quality report.

Acceptance requires focused tests proving the generated draft Markdown passes the docs-spine quality evaluator for the intended minimal passing customer repo shape. It should still avoid fake numeric quality scores; a blocked score evidence state is acceptable only when the scorecard contract itself is complete.

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

After this slice lands, update `program.md` with renderer rule changes, quality report status, validation evidence, and the next final apply/proof hardening slice.
