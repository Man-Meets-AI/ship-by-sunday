# Codex PR And Branch Policy Research

This research pass preserves the Codex PR, branch, review, contributor, CODEOWNERS, label, and version-policy findings gathered from `/Users/parkerrex/Developer/codex` on 2026-04-24.

## Source Track

The source track inspected Codex checked-in policy docs, PR templates, issue templates, CODEOWNERS, label-trigger automation, branch shape, live GitHub metadata, and release tag policy.

## Findings

Codex's default branch is `main`. The research agent reported that `gh repo view` showed squash merge enabled, merge commits disabled, rebase merge disabled, and delete-branch-on-merge enabled.

External contribution policy is intentionally narrow. `docs/contributing.md:3-17` says external contributions are invitation-only and uninvited PRs may close without review. `docs/contributing.md:29-35` describes invited work as topic branches from `main` with focused changes and clean lint/test results. `docs/contributing.md:53-59` lists PR requirements: template, issue link, local checks, up-to-date branch, and ready-for-review only when mergeable. `docs/contributing.md:61-66` says the review process uses one primary maintainer, approved scope, consensus, and squash-and-merge. `docs/contributing.md:80-93` covers CLA process.

Codex's PR template is short and external-contribution oriented. `.github/pull_request_template.md:1-8` asks external contributors to read contributing docs, provide a detailed description, and link a bug or enhancement request.

CODEOWNERS is minimal. `.github/CODEOWNERS:1-5` owns only `/codex-rs/core/` and `.github/CODEOWNERS` itself through `@openai/codex-core-agent-team`.

Issue templates are split by surface under `.github/ISSUE_TEMPLATE/`. The research track identified app, extension, CLI, other bug, feature request, and docs templates, with labels such as `app`, `extension`, `bug`, `needs triage`, `enhancement`, and `docs`. Example evidence includes `.github/ISSUE_TEMPLATE/3-cli.yml:1` and `.github/ISSUE_TEMPLATE/5-feature-request.yml:1`.

Codex label-trigger automation lives under `.github/codex/labels/`:

- `.github/codex/labels/codex-attempt.md:1` asks Codex to solve an issue and open a PR if needed.
- `.github/codex/labels/codex-review.md:1` asks for concise PR review.
- `.github/codex/labels/codex-rust-review.md:7` adds Rust-specific review heuristics.
- `.github/codex/labels/codex-triage.md:1` validates and comments on issues.

GitHub automation includes:

- `.github/workflows/cla.yml:1-49`, which runs CLA Assistant on PR target and specific comments.
- `.github/workflows/close-stale-contributor-prs.yml:3-107`, which closes stale contributor PRs.
- `.github/workflows/issue-labeler.yml:13-143`, which runs Codex Action on opened issues or `codex-label`, then applies labels and removes the trigger label.
- `.github/workflows/issue-deduplicator.yml:13-402`, which runs Codex Action duplicate detection on opened issues or `codex-deduplicate`, comments potential duplicates, and removes the trigger.

Codex has no broad checked-in branch naming policy beyond topic-branch guidance. The research agent reported `git ls-remote --heads origin | wc -l` returned 2457 remote heads, with many `codex/*`, `dev/*`, user prefixes, and automation prefixes. This is a live observation from the subagent result, not re-queried during file writing.

Release versioning is tag-driven. `.github/workflows/rust-release.yml:1` documents release tags such as `rust-v0.1.0`; `.github/workflows/rust-release.yml:30-45` validates the tag regex and version match. Stable and numeric alpha releases publish to npm in `.github/workflows/rust-release.yml:463-480` and `.github/workflows/rust-release.yml:558-665`. `latest-alpha-cli` is force-updated after release in `.github/workflows/rust-release.yml:690-707`.

The research agent queried live GitHub metadata on 2026-04-24. It reported 62 labels, including policy labels such as `bug`, `documentation`, `enhancement`, `needs-response`, `oai`, `codex`, `code-reviewed`, `github_actions`, `dependencies`, `rust`, and many area labels. It also reported a capped sample of 200 open PRs, with 161 targeting `main`, 100 drafts, 145 requiring review, 18 approved, and 2 changes requested. This is a capped sample, not a total count.

## Inaccessible Or Limited

The research agent reported that `gh api repos/openai/codex/branches/main/protection` returned 404. Repo rules for `main` were readable through `gh api repos/openai/codex/rules/branches/main`. Org-level rulesets were not accessible without `admin:org`.

## Copyable Principles For Ship By Sunday

Codex's social and policy model is simpler than Ship by Sunday's current release machinery. The transferable pieces are:

- default branch centered workflow
- squash-only merges
- explicit branch protection and tag protection
- minimal CODEOWNERS
- focused PR template
- surface-specific issue templates
- GitHub label-triggered Codex Action prompts
- release tags validated against a source-of-truth version

