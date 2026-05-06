---
title: Docs Spine Runner Research Notes
summary: Research notes from the 2026-05-06 review of the local runner docs-spine adoption and apply workflows against Arena CRM evidence.
docType: research_note
status: active
read_when:
  - Reviewing how the docs-spine runner works.
  - Revalidating the Arena CRM docs-spine pilot result.
---

# Docs Spine Runner Research Notes

## Question

How does the Ship by Sunday local runner handle docs-spine adoption and apply work, and what did the Arena CRM pilot prove about the current implementation?

## Short Answer

The runner now has a deliberately narrow two-step authority model. `docs-spine-adoption` scans the target repo and writes only local `.sbs` artifacts. `docs-spine-apply-and-proof` is the only workflow that can write Markdown, and even then it is limited to the docs-spine allowlist under `docs/`.

The current implementation is materially better than the first Arena CRM pilot. It quality-gates drafts and final merged Markdown, rejects weak Arena-style output, blocks unsafe or dirty worktrees, records native gate setup blockers separately from docs-spine quality, and keeps hosted sync limited to structured metadata and artifact refs.

## Runner Entry Points

The CLI exposes both workflow commands:

- `ship-by-sunday workflow docs-spine-adoption run --workflow-run-id <id> --confirm-docs-spine-adoption [--repo <path>] [--json]`
- `ship-by-sunday workflow docs-spine-apply-and-proof run --workflow-run-id <id> --confirm-docs-spine-apply [--repo <path>] [--json]`

Relevant entrypoints:

- `packages/local-runner/src/cli.ts`
- `packages/local-runner/src/commands/workflow.ts`
- `packages/local-runner/src/commands/daemon.ts`
- `packages/local-runner/src/core/workflow-run-api.ts`

Both direct CLI runs and daemon-claimed approved runs route into the same core workflow functions. Hosted approval packets are validated before execution. The packet must match workflow id, version, branch pattern, profile, write lease duration, dirty-state policy, expected outputs, allowed touch targets, disallowed touch targets, proof commands, sync policy, stop conditions, rollback notes, and local proof refs.

## Adoption Workflow

Adoption is artifact-only. It requires:

- `--confirm-docs-spine-adoption`
- approved workflow id `docs-spine-adoption`
- profile `sbs-workspace-write`
- branch name pattern `sbs/docs-spine-adoption-YYYYMMDD-HHMM`
- unexpired 30-minute write lease
- clean worktree before artifact writes

Allowed writes:

- `.sbs/runs/<workflow-run-id>/**`
- `.sbs/docs-spine-adoption/**`

Disallowed writes include runtime app code, dependency manifests, locks, migrations, provider config, generated folders, package scripts, root agent instructions, CI, Markdown application, branch pushes, PRs, raw logs, raw source, and Codex transcripts.

The adoption workflow writes:

- workflow packet
- adoption manifest
- repo facts
- scanner artifacts
- parity checklist
- synthesis draft packets
- quality report
- proof
- sync preview

It does not switch branches and does not apply docs.

## Scanner Behavior

The scanner is deterministic and intentionally privacy-aware. It starts from `git ls-files`, skips local/generated/noisy refs such as `.sbs/`, `.env*`, `node_modules/`, `.next/`, `dist/`, `build/`, and `coverage/`, then records structured facts instead of raw source or raw script bodies.

It detects:

- package manager from lockfiles
- package script names without script bodies
- workspace globs and workspace package refs
- dependency names without versions
- canonical instruction refs
- root instruction shims
- secondary assistant instruction refs
- ignored hidden instruction noise
- local skill refs
- docs, Program, ExecPlan, prompt, generated, validation, CI, and release surfaces
- app roots and framework signals

Arena-specific behavior is correct here: `.codex/AGENTS.md` is canonical and root `AGENTS.md` is treated as a shim when it points to `.codex/AGENTS.md`.

## Synthesis And Quality

The synthesis step emits structured draft artifacts with `proposedFiles`, authority boundaries, privacy boundaries, source artifact refs, and apply instructions. It renders the docs index, Program packet, ExecPlan packet, prompt index, validation notes, proof notes, quality-score structure, and parity checklist draft.

The quality evaluator is the key hardening layer. It checks draft consistency, common Markdown structure, docs index sections, instruction shim routing, quality-score shape, Program contract structure, active Program packet paths, ExecPlan contract structure, active ExecPlan sections, prompt inventory, validation/proof native-gate routing, and hidden-noise leakage.

Current known rejected patterns include:

- blocked drafts that still contain apply-ready `proposedFiles`
- hidden `.agents/daily-audit`, `.ai`, `.claude`, or `.codex/skills` refs routed as primary guidance
- `docs/index.md` without frontmatter, `Owns`, `Does Not Own`, Codex guidance, `First Hop`, or `Next`
- placeholder-only `docs/QUALITY_SCORE.md`
- invented numeric quality scores before evidence-bound review
- invalid Program packet paths
- active ExecPlans without required sections, test commands, or planning-brief linkage
- missing routing to discovered native gate scripts

The report uses a passing score of `90` and fails when any error rule fails.

## Apply Workflow

Apply is the only docs-writing workflow. It requires:

- `--confirm-docs-spine-apply`
- approved workflow id `docs-spine-apply-and-proof`
- profile `sbs-workspace-write`
- branch name pattern `sbs/docs-spine-apply-YYYYMMDD-HHMM`
- unexpired 30-minute write lease
- approved drafts under `.sbs/docs-spine-adoption/drafts`

Allowed Markdown targets:

- `docs/index.md`
- `docs/programs/**`
- `docs/exec-plans/**`
- `docs/prompts/**`
- `docs/QUALITY_SCORE.md`
- `docs/proof.md`
- `docs/validation.md`

Apply validates draft shape, blocked state, duplicate targets, target paths, Markdown size, symlink safety, worktree dirtiness, and quality before it writes. It also builds the final merged Markdown and runs quality again before touching files.

Existing owner-written docs are preserved by appending or replacing a managed section:

- `<!-- sbs-docs-spine:start <target-marker> -->`
- `<!-- sbs-docs-spine:end <target-marker> -->`

Recognized weak prior docs-spine output can be replaced directly on approved targets. This is how the repaired Arena docs replaced the earlier weak pilot output without pretending the old docs were owner-authored.

## Proof Behavior

Adoption proof runs:

- `git status --short`
- `git diff --name-only`
- `git diff --check`

Apply proof runs:

- docs spine structural check
- selected repo-native gate candidate, when one is discovered
- `git status --short`
- `git diff --name-only`
- `git diff --check`

Native gate selection prefers:

1. `gate`
2. `check`
3. `ci`
4. `proof`
5. `test`
6. `lint`
7. `typecheck`
8. `build`

If the native gate fails because of repo-local setup or missing dependencies, apply records it as blocked proof instead of failing docs-spine quality. Missing modules, unresolved packages, `ENOENT`, missing Biome, and `happy-dom` are currently treated as setup-shaped blockers.

## Arena CRM Readout

The live Arena CRM checkout currently has unrelated dirty deletions under `.codex/skill-archive/.../SKILL.md`, so a fresh adoption run against that checkout would block before writing.

Existing live proof from `/Users/bazelrex/Developer/arena-crm/.sbs/runs/arena_docs_spine_live_acceptance_apply/proof.json` shows:

- workflow: `docs-spine-apply-and-proof`
- applied docs: `docs/index.md`, `docs/exec-plans/PLANS.md`, `docs/exec-plans/active/2026-05-05-docs-spine-adoption-first-slice.md`, `docs/programs/PROGRAMS.md`, `docs/programs/active/2026-05-05-docs-spine-adoption/program.md`, `docs/programs/active/2026-05-05-docs-spine-adoption/planning-brief-1.md`, `docs/prompts/README.md`, `docs/QUALITY_SCORE.md`, `docs/validation.md`, and `docs/proof.md`
- apply quality report: passed
- quality score: `100`
- failed quality rules: none
- structural docs check: passed
- Git proof commands: passed
- native gate: `bun run gate` blocked by setup, specifically Biome `ENOENT` and missing `happy-dom`

That is the desired split: docs-spine quality passed, while repo-native setup blockers were recorded honestly for follow-up.

## Rough Edge

The scanner's `docsRefs` can become noisy in large repos because refs containing terms like `security` or `reliability` outside `docs/` still qualify as docs refs. Arena CRM shows this clearly with many source and test files appearing in `docsSurface.docsRefs`.

This does not currently appear to break generated output or quality because the renderer and evaluator rely on narrower canonical targets, but `repo-facts.json` is noisier than it should be. A future scanner cleanup should split true documentation refs from source files that merely contain docs-like domain words.

## Validation Run

Focused docs-spine tests passed:

```bash
bun run --cwd packages/local-runner test -- docs-spine-adoption-workflow.test.ts docs-spine-apply-and-proof-workflow.test.ts
```

Result:

- 2 test files passed
- 32 tests passed

## Bottom Line

The docs-spine runner is now an approval-bound, deterministic workflow with clear authority boundaries. Adoption produces local evidence and drafts. Apply validates and writes only approved docs-spine Markdown. Quality gates now encode the Arena v1 failure modes instead of relying on "files exist" proof. The main follow-up is scanner precision, not a rewrite of the runner model.
