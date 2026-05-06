---
title: Docs Spine Quality Reset Planning Brief 2
program_id: docs-spine-adoption-quality-reset
brief_version: 2
status: superseded
summary: Repair source-truth scanning so docs-spine synthesis starts from canonical repo evidence instead of hidden historical noise.
read_when:
  - Authoring the second child ExecPlan for docs-spine quality reset.
---

# Docs Spine Quality Reset Planning Brief 2

The next implementation slice should repair scanner source-truth ranking. The eval harness now fails weak output, so scanner work has a concrete target: provide the facts needed for repo-specific, high-quality docs instead of dumping hidden folders and historical artifacts.

Focus on `packages/local-runner/src/workflows/docs-spine-adoption/scanner.ts`. Replace broad filename substring heuristics and arbitrary ref truncation with ranked evidence classes. Canonical instruction files, root shims, package manifests, workspace packages, CI, existing docs, and app topology must outrank hidden logs, historical audits, generated caches, local skills, `.ai`, `.claude`, and `.agents/daily-audit` files.

For Arena CRM specifically, the scanner must recognize root `AGENTS.md` as a shim and `.codex/AGENTS.md` as the canonical instruction source. It should record that relationship explicitly in source-truth and instruction-surface artifacts. It should not list `.agents/daily-audit` or `.codex/skills/**` as primary agent instructions.

Add scanner fixtures or test repositories that include an Arena-style root shim, `.codex/AGENTS.md`, hidden audit directories, local skills, Bun/Turbo package scripts, and normal docs. The scanner output should classify canonical sources, secondary references, ignored hidden noise, native gates, app topology, and docs lanes separately.

Acceptance requires focused tests proving the scanner:

- ranks canonical instructions above shims and hidden folders
- excludes `.agents/daily-audit`, `.ai`, `.claude`, and `.codex/skills/**` from primary docs routes
- records local skills as skill surfaces, not agent instruction files
- discovers native gate candidates such as `gate`, `check`, `test`, `lint`, `typecheck`, and `build`
- records workspace package refs and app roots without raw source or script bodies
- feeds enough facts for the existing quality report to stop failing source-truth and hidden-noise rules once renderers are repaired

Exact validation boundaries:

```bash
bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts
bun run --cwd packages/local-runner typecheck
bun run --cwd packages/local-runner lint
bun run --cwd packages/local-runner format:check
bun run plans:lint -- --plan <new-child-execplan>
bun run programs:lint
bun run markdown:lint -- --paths docs/programs/completed/2026-05-05-docs-spine-adoption-quality-reset <new-child-execplan>
git diff --check
```

After this slice lands, update `program.md` with the scanner rule changes, fixture paths, validation evidence, and the next renderer repair slice.
