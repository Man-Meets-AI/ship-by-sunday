---
name: linear
description: Use the installed Linear plugin for Ship By Sunday issue, project, status, label, document, and GitHub PR link operations.
---

# Linear

Use this skill for Linear work during Ship By Sunday Codex sessions.

Linear is the official home for Ship By Sunday product, release, web app,
billing, generated-repo, and operating-workflow backlog work. GitHub remains the
code and pull-request surface. Repo docs, Programs, ExecPlans, runtime-intake
exports, and release proof remain the durable evidence sources linked from
Linear issues.

## Primary Tools

Use the installed Linear plugin tools exposed in the Codex session:

- `mcp__codex_apps__linear._list_issues`
- `mcp__codex_apps__linear._get_issue`
- `mcp__codex_apps__linear._save_issue`
- `mcp__codex_apps__linear._list_projects`
- `mcp__codex_apps__linear._save_project`
- `mcp__codex_apps__linear._list_issue_statuses`
- `mcp__codex_apps__linear._list_issue_labels`
- `mcp__codex_apps__linear._create_issue_label`
- `mcp__codex_apps__linear._create_document`

The plugin reuses the operator's configured Linear auth for the session.

Avoid raw-token shell helpers for Linear API access. Do not add a local
`LINEAR_API_KEY` script unless the user explicitly asks for a runtime adapter
outside the plugin.

## Ship By Sunday Defaults

- Workspace: `vai-group`
- Team: `man meets ai`
- Team key: `MMAI`
- Canonical project: `Ship By Sunday`
- Canonical setup issue: `MMAI-267`
- Default issue state for intake: `Backlog`
- Default state for approved implementation-ready work: `Ready`
- Default official labels: `Bug`, `Feature`, `Improvement`, `Refactor`
- Default priority mapping:
  - `1`: Urgent
  - `2`: High
  - `3`: Normal
  - `4`: Low
  - `0`: No priority

## Workflow States

Use `_list_issue_statuses` for `man meets ai` before changing issue state when
you need the exact available state names.

Known Ship By Sunday-compatible states are currently `Backlog`, `Ready`, `Todo`,
`In Progress`, `In Review`, `Done`, `Canceled`, and `Duplicate`.

Use these states this way:

- `Backlog`: captured but not yet scoped.
- `Ready`: approved and implementation-ready, or intentionally queued.
- `Todo`: accepted for upcoming work but not started.
- `In Progress`: active implementation or planning work.
- `In Review`: awaiting Parker, code review, proof review, or release review.
- `Done`: shipped or otherwise completed with evidence.
- `Canceled`: intentionally abandoned.
- `Duplicate`: replaced by another Linear issue.

When work is waiting on proof, keep the issue in `In Review` and name the exact
proof blocker in the issue description or comment. Do not invent a separate
status until the Linear team workflow is deliberately changed.

## Discovering Unfamiliar Operations

Start with concrete list calls before creating or updating anything:

1. List projects with `_list_projects` scoped by `query` when possible.
2. List team statuses with `_list_issue_statuses` for `man meets ai`.
3. List labels with `_list_issue_labels`.
4. List or search existing issues with `_list_issues` or `_search`.

Broad project queries with members or milestones can exceed Linear complexity
limits. Prefer focused `query`, `team`, and `limit` values.

## Common Workflows

### Query An Issue By Key Or Title

Use these progressively:

- Start with `_list_issues` using `query` when you have a ticket key such as
  `MMAI-267` or exact title text.
- Add `team: "man meets ai"` and `project: "Ship By Sunday"` when the lookup
  should be scoped to official Ship By Sunday work.
- Once you have the issue identifier, use it as `id` for updates.

Example lookup:

```json
{
  "team": "man meets ai",
  "project": "Ship By Sunday",
  "query": "MMAI-267",
  "limit": 10
}
```

### Create A Ship By Sunday Issue

Use `_save_issue` without `id`:

```json
{
  "team": "man meets ai",
  "project": "Ship By Sunday",
  "state": "Backlog",
  "title": "Short imperative title",
  "description": "Markdown body with problem, outcome, acceptance criteria, validation, and source links.",
  "labels": ["Improvement"],
  "priority": 3
}
```

Issue descriptions should include:

- `Problem`
- `Outcome`
- `Acceptance Criteria`
- `Validation`
- `Source`

Link the relevant repo evidence when it exists: `AGENTS.md`, `docs/index.md`,
`docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`,
`docs/release-workflow.md`, release proof artifacts, or the exact active
Program/ExecPlan path.

### Update An Existing Issue

Use `_save_issue` with `id` set to the Linear identifier, for example
`MMAI-267`. Keep updates narrow. Do not rewrite a human-authored description
unless the task explicitly asks for it.

```json
{
  "id": "MMAI-267",
  "state": "In Progress"
}
```

### Attach A GitHub PR To An Issue

Use `_save_issue` with `links`. Links are append-only through the plugin, so
check existing issue links first when duplicate links matter.

```json
{
  "id": "MMAI-267",
  "links": [
    {
      "title": "GitHub PR #123",
      "url": "https://github.com/ParkerRex/ship-by-sunday/pull/123"
    }
  ]
}
```

### Create A Linear Document

Use `_create_document` for product notes or durable context that belongs in
Linear but is not itself an issue. Repo docs remain the source of truth for
Program, ExecPlan, generated-output, and release-proof contracts.

```json
{
  "project": "Ship By Sunday",
  "title": "Ship By Sunday intake notes",
  "content": "Markdown content"
}
```

## Usage Rules

- Prefer Linear issue identifiers as the official work id in conversation,
  commit messages, PR bodies, and handoff summaries.
- Prefer existing labels before creating new labels.
- Keep issue descriptions implementation-ready: problem, outcome, acceptance
  criteria, validation expectation, and source links.
- Do not create Linear issues from ambiguous Things, Telegram, or ad hoc chat
  intake. Ask the smallest clarification question first.
- Do not create GitHub issues for Ship By Sunday backlog work unless the user
  explicitly asks for GitHub issue mirroring.
- When linking GitHub work, attach the PR URL to the Linear issue and mention
  the Linear identifier in the PR body.
- Treat Linear mutations as external side effects. For unclear requests,
  preview the intended issue/update before saving it.
