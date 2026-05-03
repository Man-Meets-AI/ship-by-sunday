---
title: 'Linear Operating Surface'
summary: 'Repo-local reference for using Linear as the official Ship By Sunday backlog and workflow surface.'
docType: 'reference'
status: 'active'
read_when:
  - 'Creating, updating, or debugging official Ship By Sunday Linear work.'
  - 'Linking Linear issues to repo Programs, ExecPlans, release proof, or PRs.'
---

# Linear Operating Surface

Linear is the official backlog and workflow surface for Ship By Sunday work that
should become durable before implementation. GitHub remains the code and
pull-request surface. Repo docs remain the source of truth for Program,
ExecPlan, generated-output, and release-proof contracts.

## Live Linear Setup

- Workspace: `vai-group`
- Team: `man meets ai`
- Team key: `MMAI`
- Canonical project: `Ship By Sunday`
- Project URL: `https://linear.app/vai-group/project/ship-by-sunday-fe8fe5e8d874`
- Setup issue: `MMAI-267`
- Setup issue URL: `https://linear.app/vai-group/issue/MMAI-267/set-up-ship-by-sunday-linear-operating-surface`

## Workflow

Use the existing `man meets ai` team workflow:

- `Backlog`: captured but not yet scoped.
- `Ready`: approved and implementation-ready, or intentionally queued.
- `Todo`: accepted for upcoming work but not started.
- `In Progress`: active implementation or planning work.
- `In Review`: awaiting Parker, code review, proof review, or release review.
- `Done`: shipped or otherwise completed with evidence.
- `Canceled`: intentionally abandoned.
- `Duplicate`: replaced by another Linear issue.

When work is waiting on release, browser, Vercel, Convex, or billing proof, keep
the issue in `In Review` and name the exact proof blocker in the issue body or a
comment. Do not create a second workflow language outside Linear.

## Issue Contract

Create issues in the `Ship By Sunday` project under the `man meets ai` team.
Use the existing labels first: `Bug`, `Feature`, `Improvement`, and `Refactor`.

Issue descriptions should include:

- `Problem`
- `Outcome`
- `Acceptance Criteria`
- `Validation`
- `Source`

Link the relevant repo evidence when it exists:

- `AGENTS.md`
- `docs/index.md`
- `docs/programs/PROGRAMS.md`
- `docs/exec-plans/PLANS.md`
- `docs/release-workflow.md`
- active Program or ExecPlan paths
- release proof artifacts
- runtime-intake exports
- GitHub PRs

## PostHog Bug Triage

PostHog is the source for generic product analytics, error tracking, source-mapped stack traces, and session replay evidence. Linear remains the workflow source of truth for bugs that should become durable work.

The PostHog-to-Linear path starts draft-only. Codex or another agent may inspect PostHog Error Tracking, related replays, deploy evidence, GitHub checks, and existing Linear issues, then draft a ranked report and proposed issue bodies. It must not create, assign, label, close, comment, rerun, or edit Linear issues until a separate action policy approves mutation.

Use `.agents/skills/shared/posthog-linear-triage/SKILL.md` for repo-local triage instructions. Drafted bug issues should use the `man meets ai` team, the `Ship By Sunday` project, and these labels when applicable: `Bug`, `posthog`, `production`, and `observability`.

Every PostHog bug draft should include:

- `Problem`
- `Observed Evidence`
- `PostHog Issue`
- `Replay`
- `Affected Surface`
- `Priority Rationale`
- `Duplicate Check`
- `Recommended Fix`
- `Acceptance Criteria`
- `Validation`

P0 and P1 findings should always draft Linear issues. P2 findings should draft issues only when recurring, affecting paying users, or blocking checkout or access. P3 findings should stay in the triage report unless explicitly selected.

## Repo Skills

Use these repo-local skills for Linear work:

- `.agents/skills/shared/linear/SKILL.md`
- `.agents/skills/shared/posthog-linear-triage/SKILL.md`
- `.agents/skills/shared/debug/SKILL.md`

The `linear` skill owns issue, project, status, label, document, and PR-link
operations. The `debug` skill owns correlation from Linear issue identifiers to
repo evidence, release proof, Vercel, Convex, GitHub, and runtime-intake
artifacts.

## Boundary

Linear tracks execution state and accountability. It does not replace the repo's
Program, ExecPlan, generated-output, or release-proof contracts.

Do not create GitHub issues for Ship By Sunday backlog work unless Parker
explicitly asks for GitHub mirroring. When implementation work ships through a
PR, attach the PR URL to the Linear issue and include the Linear identifier in
the PR body.
