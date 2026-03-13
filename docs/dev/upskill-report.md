# Upskill Report

Date: 2026-03-13
Window analyzed: 2026-02-27 through 2026-03-13

## Scope and evidence

- `~/.codex/state_5.sqlite`: 198 threads updated in the 14-day window.
- `~/.codex/history.jsonl`: 268 entries across 39 sessions in the same window.
- Explicit skill mentions in recent thread prompts: `figma` 16, `convex` 11, `clerk` 7, `playwright` 4.
- Explicit skill mentions in recent history entries: `convex` 12, `figma` 7, `clerk` 6.
- Team Hub audit run in `/Users/parkerrex/Projects/team-wiki`: 66 visible skills, `keep=66`, `combine=0`, `kill=0`, no unresolved bindings.

## Ranked findings

### 1. PRD packet skills optimized too hard for machine output and degraded chat usability

Evidence:

- On 2026-03-13 the user explicitly reported: `our global PRD skill for PRD-strategy gives a weird output format.. canu look into it? Should probably be markdown`.
- Both [`prd-strategy`](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/prd-strategy/SKILL.md) and [`prd-eng-review`](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/prd-eng-review/SKILL.md) were instructing JSON-only output, and both prompt bundles repeated that constraint.

Impact:

- The packet stayed parseable, but it was awkward to review, hard to paste into follow-up threads, and visually hostile for the main user workflow.

Fix applied:

- Updated the two PRD skills plus their prompt references to require one short markdown heading and one fenced `json` block, with no extra prose.

### 2. Local skill path guidance had drifted away from this machine's `.agents` setup

Evidence:

- Repo guardrails in [`/Users/parkerrex/.codex/worktrees/e968/.agents/AGENTS.md`](/Users/parkerrex/.codex/worktrees/e968/.agents/AGENTS.md) explicitly say not to reintroduce user-managed skills under `~/.codex/skills`.
- [`playwright`](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/playwright/SKILL.md), [`playwright` CLI reference](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/playwright/references/cli.md), and [`atlas`](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/atlas/SKILL.md) still told the agent to use `$CODEX_HOME/skills` and `~/.codex/skills`.

Impact:

- Any agent following those docs on this machine could resolve the wrong script path or suggest the wrong install location.

Fix applied:

- Repointed those skills to `$HOME/.agents/skills` and updated the examples accordingly.

### 3. Skill discovery guidance still assumed generic global installs instead of the Team Hub workflow

Evidence:

- [`find-skills`](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/find-skills/SKILL.md) recommended `npx skills add ... -g -y`.
- This conflicts with the current management model: local user skills live in `/Users/parkerrex/.agents/skills/`, while managed refresh/publish flows run from `/Users/parkerrex/Projects/team-wiki`.

Impact:

- The skill could send new installs into the wrong place and bypass the repo's intended maintenance workflow.

Fix applied:

- Updated `find-skills` to be local-first, to prefer existing `.agents` inventory, and to route adoption through Team Hub or a local fork instead of direct installs into `~/.codex/skills`.

### 4. Repeated formatting and artifact-shaping work points to a missing prompt-output skill

Evidence:

- 2026-03-06: repeated markdown cleanup requests across multiple docs.
- 2026-03-12: explicit request to rewrite the "bug hunter" prompt for machine readability instead of human styling.
- 2026-03-13: PRD output complaint was about output shape, not planning quality.

Impact:

- The agent is spending repeated cycles fixing presentation and prompt-structure issues ad hoc instead of using a reusable workflow.

Recommended next fix:

- Add a personal skill for prompt and artifact shaping. Scope: rewrite prompts for machine-readable outputs, choose fenced-block formats, strip decorative markdown, and define copy/paste-safe structured output contracts.

### 5. Existing UI/UX critique skills are under-signaled relative to actual conversation demand

Evidence:

- Recent conversations repeatedly asked for blunt UX critique and design teardown, while explicit mentions clustered around `figma`, `convex`, and `clerk`.
- The usage pattern suggests the critique work is being requested in plain language more often than through named skills.

Impact:

- Good critique skills exist, but they are not getting reliably surfaced at the moment the user asks for them.

Recommended next fix:

- Tighten descriptions or triggers for `eng-ui-polish`, `eng-practical-motion`, and `web-design-guidelines` around phrases like "tear this design apart", "critique the UX", and "what feels off".

## Fixes applied in this run

- Updated PRD packet output contracts to markdown-wrapped JSON:
  - [/Users/parkerrex/.codex/worktrees/e968/.agents/skills/prd-strategy/SKILL.md](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/prd-strategy/SKILL.md)
  - [/Users/parkerrex/.codex/worktrees/e968/.agents/skills/prd-strategy/references/PRD-strategy-prompts.md](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/prd-strategy/references/PRD-strategy-prompts.md)
  - [/Users/parkerrex/.codex/worktrees/e968/.agents/skills/prd-eng-review/SKILL.md](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/prd-eng-review/SKILL.md)
  - [/Users/parkerrex/.codex/worktrees/e968/.agents/skills/prd-eng-review/references/PRD-eng-review-prompts.md](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/prd-eng-review/references/PRD-eng-review-prompts.md)
- Updated stale local skill path guidance:
  - [/Users/parkerrex/.codex/worktrees/e968/.agents/skills/playwright/SKILL.md](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/playwright/SKILL.md)
  - [/Users/parkerrex/.codex/worktrees/e968/.agents/skills/playwright/references/cli.md](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/playwright/references/cli.md)
  - [/Users/parkerrex/.codex/worktrees/e968/.agents/skills/atlas/SKILL.md](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/atlas/SKILL.md)
- Updated discovery/install workflow guidance:
  - [/Users/parkerrex/.codex/worktrees/e968/.agents/skills/find-skills/SKILL.md](/Users/parkerrex/.codex/worktrees/e968/.agents/skills/find-skills/SKILL.md)

## Commands run

```bash
sqlite3 ~/.codex/state_5.sqlite ...
python3 ... ~/.codex/history.jsonl ...
bun run skills:audit
git diff --check
```

## Notes and blockers

- I did not run `bun run skills:global:update`, `bun run skills:wiki:sync`, or `bun run skills:team:publish`.
- Reason: this run only changed local published skill files under `.agents`; no corresponding Team Hub source files were updated, and `/Users/parkerrex/Projects/team-wiki` already had unrelated dirty changes. Running publish/sync from there would create churn without propagating these local fixes correctly.
