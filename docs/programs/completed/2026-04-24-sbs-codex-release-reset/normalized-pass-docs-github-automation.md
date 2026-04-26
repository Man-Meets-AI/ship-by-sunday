# Docs And GitHub Automation Normalized

## Facts

- Codex has no `docs/codex/` or `docs/github/` directory; Codex-specific GitHub automation lives under `/Users/parkerrex/Developer/codex/.github/codex/`.
- Codex `.github/codex/labels/*` contains label-trigger prompts for attempt, review, Rust review, and triage.
- Codex uses `openai/codex-action` in issue labeler and deduplicator workflows.
- Codex issue templates are split by product surface, while SBS currently has two broad issue templates.
- Codex has minimal CODEOWNERS; SBS has no project CODEOWNERS file.
- SBS `docs/codex/` is explicitly historical, with `docs/codex/PLANS.md:1` pointing to `docs/exec-plans/PLANS.md`.
- SBS active planning surfaces are `docs/exec-plans/*`, `docs/programs/*`, and `docs/prompts/*`; Codex does not provide an equivalent replacement.
- SBS `.codex/agents/*` and `.agents/skills/*` are active local execution tooling, especially for QA, release, and ExecPlans.
- SBS active release docs treat `.github/workflows/ci.yml`, `dev-staging-proof.yml`, `production-release-proof.yml`, `convex-production-deploy.yml`, and `sandbox-e2e-nightly.yml` as release proof surfaces.

## Recommendation

Adopt Codex's GitHub automation surfaces where they help: `.github/codex` label prompts, richer issue triage automation, minimal CODEOWNERS, and clearer templates. Do not delete SBS `docs/exec-plans`, `docs/programs`, or `docs/prompts`, because those are the active planning contract and not replaced by Codex.

## Risks

- Deleting `docs/programs` or `docs/exec-plans` in the name of copying Codex would remove SBS's live planning contract.
- Replacing `.agents/skills` with Codex `.codex/skills` would discard SBS-specific QA, release, and Program/ExecPlan workflows unless ported.
- Codex's labels and prompts are product-specific and require SBS-specific rewrite.
- Leaving `docs/codex` archive references unclassified can confuse future agents about which planning system is current.

## Code Seams

- `docs/codex/**`
- `docs/exec-plans/**`
- `docs/programs/**`
- `docs/prompts/**`
- `.github/codex/**`
- `.github/workflows/issue-labels.yml`
- potential `.github/workflows/issue-labeler.yml`
- potential `.github/workflows/issue-deduplicator.yml`
- `.github/ISSUE_TEMPLATE/*`
- `.github/pull_request_template.md`
- potential `.github/CODEOWNERS`
- `.codex/agents/**`
- `.agents/skills/**`
- `AGENTS.md`
- `apps/web/AGENTS.md`
- `qa/AGENTS.md`
- `qa/README.md`

## Proposed Slices

1. Keep `docs/programs`, `docs/exec-plans`, and `docs/prompts` as the active SBS planning system.
2. Classify or archive `docs/codex` so it cannot be mistaken for the live planning lane.
3. Add SBS-specific `.github/codex` label prompts and optional Codex Action workflows.
4. Replace coarse issue templates with surface-aware SBS templates if issue intake matters.
5. Add minimal CODEOWNERS for high-risk surfaces only after branch policy is clear.

