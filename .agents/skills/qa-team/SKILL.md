---
name: qa-team
description: Use the repository QA team as one lead-first interface for journey mapping, proof analysis, gap review, optional browser execution, and release-confidence summaries. Trigger on requests like "go talk to our QA team", "QA this feature", "what journeys does this affect", "is this merge-safe", or "run browser QA for this feature".
---

# qa-team

Use this skill when the user wants the repository QA system to behave like a staffed team instead of a loose checklist.

This is a workspace-local skill. It treats `qa/` as the canonical QA control plane and uses the repo-scoped Codex role layer under `.codex/` as the execution surface.

## Default Stance

- Lead-first. Use the repo-scoped `qa_lead` role when available, or follow the same workflow directly.
- Read the QA control plane before app code.
- Stay advisory-first unless the user explicitly asks for execution.
- Auto-run only the minimal safe local set by default:
  - `bun run qa:validate`
  - `bun run qa:run-pack -- --pack=<pack> --dry-run`
  - directly relevant focused `vitest` runs
- Treat canonical `qa/` files as controlled source of truth. Prepare suggested edits if needed, but do not apply them without explicit confirmation.
- For explicit browser execution, use the existing QA pack workflow and the `browser_runner` role when available.
- For material reviews, you may scaffold a local review artifact with `bun run qa:team -- --slug=<feature-slug> --base=<ref>`.

## Read Order

1. `qa/AGENTS.md`
2. `qa/README.md`
3. `qa/glossary.md`
4. `qa/journeys.csv`
5. `qa/coverage.csv`
6. `qa/test-inventory.csv`
7. `qa/personas.json`
8. The smallest relevant app code, tests, and `qa/runs/` evidence for the request

## Use This Skill For

- "go talk to our QA team about this feature"
- "QA this diff"
- "what journeys does this affect"
- "what proof do we already have"
- "what QA is still missing"
- "is this merge-safe"
- "is this ship-safe"
- "run browser QA for this feature"

## Do Not Use This Skill For

- replacing `qa/` with a second scenario catalog
- broad exploratory product research with no feature, flow, or diff in scope
- destructive billing or production actions that the user has not explicitly declared safe
- silently rewriting canonical QA CSV files during an ordinary review request

## Workflow

1. Start with the lead.
   - Read the QA control plane and map the request to journeys.
2. Decide whether the review is material.
   - If it is a feature diff review, touches multiple journeys, or is substantial enough to justify a local review artifact, treat it as material.
3. Fan out for material reviews.
   - Run `journey_mapper`, `coverage_analyst`, and `gap_reviewer` in parallel before the lead writes the final verdict.
   - Skip this fan-out only for lightweight single-question requests that the lead can answer directly from `qa/`.
4. Inspect proof.
   - Use `qa/coverage.csv`, `qa/test-inventory.csv`, relevant tests, and the latest relevant `qa/runs/` report.
5. Stay minimal by default.
   - Run only the smallest safe local command set unless the user asked for execution.
6. If the review is material, scaffold a local review artifact.
   - advisory-only: `bun run qa:team -- --slug=<feature-slug> --base=<ref>`
   - command-backed: `bun run qa:team -- --slug=<feature-slug> --base=<ref> --review-mode=command-backed --environment=<env>`
7. If the user explicitly asks for browser execution and the environment is safe, add `browser_runner`.
8. If commands ran or the review is report-worthy, add `release_summarizer` before the final answer.
9. Return one consolidated verdict.

Material-review specialist pattern:

- `journey_mapper`: affected journeys and scenario packs
- `coverage_analyst`: current proof and proof strength
- `gap_reviewer`: missing proof, stale evidence, and blockers
- `browser_runner`: only for explicit safe execution requests
- `release_summarizer`: final command-backed verdict and report wording

## Output Contract

Always return:

1. `Affected journeys`
2. `Current proof`
3. `Missing proof`
4. `Recommended runs`
5. `Findings`
6. `Release confidence`

Keep the answer concise. Surface specialist labels only when they materially helped the conclusion.
