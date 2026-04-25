# Docs And GitHub Automation Research

This research pass preserves the Codex and Ship by Sunday docs, GitHub automation, repo-local skill, issue template, PR template, and CODEOWNERS findings gathered on 2026-04-24.

## Source Track

The source track inspected Codex and Ship by Sunday documentation and automation surfaces requested by the user: Codex docs/codex, docs/github or `.github/codex`, PR templates, issue templates, labels, CODEOWNERS, AGENTS/skills, and policy docs.

## Codex Baseline

Codex has no `docs/codex/` and no `docs/github/` directory in `/Users/parkerrex/Developer/codex`. Codex-specific GitHub automation lives in `.github/codex/`.

`.github/codex/home/config.toml:1` pins the Codex Action home config, currently `model = "gpt-5.1"`.

`.github/codex/labels/` contains label-trigger prompts:

- `.github/codex/labels/codex-attempt.md:1`
- `.github/codex/labels/codex-review.md:1`
- `.github/codex/labels/codex-rust-review.md:1`
- `.github/codex/labels/codex-triage.md:1`

Codex issue automation is active in `.github/workflows/issue-labeler.yml:1` and `.github/workflows/issue-deduplicator.yml:1`, both using `openai/codex-action`.

Codex has six issue templates split by surface under `.github/ISSUE_TEMPLATE/`: app, IDE extension, CLI, other bug, feature request, and docs issue. Example evidence is `.github/ISSUE_TEMPLATE/1-codex-app.yml:1`.

Codex PR template is external-contribution oriented and points contributors to `docs/contributing.md:1` through `.github/pull_request_template.md:1`.

Codex CODEOWNERS is minimal. `.github/CODEOWNERS:1` owns `codex-rs/core/` and the CODEOWNERS file itself.

Codex repo-local skills live under `.codex/skills/`, including PR babysitting, code review facets, bug triage, PR body writing, remote tests, and TUI testing. Example evidence is `.codex/skills/code-review/SKILL.md:1`.

Codex policy/docs surface is mostly open-source contributor policy plus user-facing Codex docs shims:

- `docs/contributing.md:1`
- `docs/CLA.md:1`
- `docs/execpolicy.md:1`
- `docs/agents_md.md:1`
- `docs/skills.md:1`
- `docs/config.md:1`

## Ship By Sunday Active Contracts

SBS `docs/codex/` is explicitly historical. `docs/codex/PLANS.md:1` says the live ExecPlan contract moved to `docs/exec-plans/PLANS.md:1`, and new ExecPlans should not be authored in `docs/codex/`.

SBS has 40 markdown files in `docs/codex/`; the source track classified 39 as archive records and only `PLANS.md` as a shim. Active planning surfaces are `docs/exec-plans/active/`, `docs/exec-plans/completed/`, and `docs/programs/active/`.

Active working contracts include:

- `AGENTS.md:1`
- `apps/web/AGENTS.md:1`
- `qa/AGENTS.md:1`
- `packages/blueprint-compiler/AGENTS.md:1`

`qa/README.md:1` makes `qa/` the active QA control plane and names `.codex/config.toml` plus `.codex/agents/*.toml` as the repo-scoped QA role layer.

`docs/ARCHITECTURE.md:1` and `docs/SECURITY.md:1` classify `.codex/` as local tooling/config, not durable repo truth. Therefore `.codex/agents` is active execution tooling, but not canonical product or QA truth.

SBS repo-local human-facing skills are under `.agents/skills/`, including `qa-team`, ExecPlan writer/griller/execute/validate, `land`, `release-triage`, and `release-snapshot`. Example evidence is `.agents/skills/qa-team/SKILL.md:1`.

SBS has no project CODEOWNERS file. The source track found only CODEOWNERS files inside `node_modules`, not repo policy.

## Ship By Sunday GitHub Surface

SBS PR template `.github/pull_request_template.md:1` is active and internal-product oriented. It asks for What Changed, Why, UI Changes, and a small scope/checklist.

SBS issue templates are two broad forms:

- `.github/ISSUE_TEMPLATE/bug_report.yml:1`
- `.github/ISSUE_TEMPLATE/feature_request.yml:1`

They use `bug`, `enhancement`, and `needs-triage`.

SBS label automation is only `.github/workflows/issue-labels.yml:1`, which ensures those three managed labels exist. There is no Codex Action labeler or deduplicator equivalent.

SBS active CI/release workflows are product-release specific:

- `.github/workflows/ci.yml:1`
- `.github/workflows/dev-staging-proof.yml:1`
- `.github/workflows/production-release-proof.yml:1`
- `.github/workflows/convex-production-deploy.yml:1`
- `.github/workflows/sandbox-e2e-nightly.yml:1`

`docs/release-workflow.md:1` and `qa/README.md:1` explicitly treat those workflows as the current release proof path.

## Migration, Deletion, And Replacement Map

`docs/codex/*` is historical archive material. If SBS copies Codex's current approach, this folder is a deletion/archive candidate, except `docs/codex/PLANS.md` may remain as a compatibility shim. It should not replace `docs/exec-plans`.

`docs/exec-plans/*`, `docs/programs/*`, and `docs/prompts/*` are the active SBS replacement for old `docs/codex` planning. Codex does not provide an equivalent. Deleting these would remove SBS's live planning contract.

`.github/codex/*` is absent in SBS. Copying Codex's approach would add this as a new automation surface for label-triggered Codex Action prompts.

`.github/workflows/issue-labeler.yml` and `.github/workflows/issue-deduplicator.yml` are absent in SBS. They would be additions or replacements for the current simple `issue-labels.yml`, but Codex's label taxonomy is product-specific and would need SBS-specific labels and prompts.

SBS's two issue templates are active but coarse. Codex's six-template model would replace them only if SBS wants issue intake split by product surface.

`.github/CODEOWNERS` is absent in SBS and would be additive.

Codex `.codex/skills/*` does not mirror SBS's `.agents/skills/*` structure. Replacing SBS's skill surface with Codex's would discard SBS-specific QA, release, and ExecPlan workflows unless ported.

SBS `.codex/agents/*` is an active QA execution layer. Codex upstream does not have this exact surface, so copying Codex does not replace it cleanly.

Codex `docs/contributing.md` and `docs/CLA.md` are public open-source policy docs. SBS currently has internal repo policy docs instead. They would be new external-contribution policy docs, not replacements for `docs/SECURITY.md:1`, `docs/RELIABILITY.md:1`, or `docs/release-workflow.md:1`.

Codex build/release workflows are Rust/Bazel/npm release infrastructure and are not directly portable to SBS. SBS workflows are active product release contracts, not historical automation.

## Net Finding

SBS has already migrated the old `docs/codex` planning model into a stronger `docs/exec-plans` plus `docs/programs` contract. The main Codex approach SBS lacks is GitHub-label-triggered Codex Action automation under `.github/codex/`, richer issue triage automation, and CODEOWNERS.

