# Codex PR And Branch Policy Normalized

## Facts

- Codex uses `main` as the default branch.
- The source research reported live GitHub settings with squash merge enabled, merge commits disabled, rebase merge disabled, and delete-branch-on-merge enabled.
- Codex external contributions are invitation-only, documented in `/Users/parkerrex/Developer/codex/docs/contributing.md:3-17`.
- Codex invited-contributor workflow is topic branches from `main`, focused changes, local checks, up-to-date branches, and squash-and-merge.
- Codex CODEOWNERS is minimal: `.github/CODEOWNERS:1-5` owns only `/codex-rs/core/` and the CODEOWNERS file.
- Codex uses concise PR and issue templates plus `.github/codex/labels/*` prompts for Codex Action issue/PR automation.
- Codex has release tag validation in `.github/workflows/rust-release.yml:30-45`.
- Codex has no broad checked-in branch naming enforcement beyond topic-branch guidance.

## Recommendation

Use Codex's policy shape for SBS: a simpler branch model, squash-only merges, small CODEOWNERS, clear required checks, protected release tags, focused templates, and GitHub label-triggered automation. Avoid inventing a large checked-in branch naming doctrine.

## Risks

- Moving SBS away from `dev -> main` affects Vercel production, Convex deployment, release triage, and existing docs.
- Adding CODEOWNERS without matching real ownership can create review bottlenecks.
- Codex's external contributor policy may not fit SBS if SBS remains an internal product repo.
- Label-triggered Codex automation needs SBS-specific prompts and labels; Codex's Rust-specific labels do not transfer directly.

## Code Seams

- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/*`
- `.github/workflows/issue-labels.yml`
- potential `.github/CODEOWNERS`
- potential `.github/codex/labels/*`
- `docs/release-workflow.md`
- `AGENTS.md`
- GitHub branch protection and tag protection rules
- `/Users/parkerrex/Developer/codex/docs/contributing.md`
- `/Users/parkerrex/Developer/codex/.github/CODEOWNERS`
- `/Users/parkerrex/Developer/codex/.github/codex/labels/*`

## Proposed Slices

1. Decide whether SBS keeps `dev -> main`, moves to topic branches into `main`, or uses a hosted-product hybrid.
2. Align branch protection, merge policy, and required checks with that branch model.
3. Add minimal CODEOWNERS only for truly owned high-risk surfaces.
4. Replace coarse issue/PR intake with surface-aware templates and optional Codex Action prompts.

