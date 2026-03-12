# Codex Session Audit

Last updated: 2026-03-12

## Scope

- Source scanned: `/Users/parkerrex/.codex/state_5.sqlite`
- Threads scanned: 1,521
- Time window: September 2025 through March 2026
- Signals used: `cwd`, thread `title`, and `first_user_message`
- This is a practical pattern audit, not an exact scientific taxonomy. Some threads overlap multiple categories.

## Where you use Codex most

| Repo cluster                                                                                               | Approx. thread count | What you use it for                                                                         |
| ---------------------------------------------------------------------------------------------------------- | -------------------: | ------------------------------------------------------------------------------------------- |
| `shorts-factory`                                                                                           |                  424 | AI-product UX, agent orchestration, runtime parity, Figma-driven UI work, automations       |
| `man-meets-ai` cluster (`manmetai.com`, `man-meets-ai.com`, `manmeetsai-workspace`, `man-meets-ai-simple`) |                  327 | course product UX, launch stack, copy, SEO, onboarding, launch operations                   |
| `genesis`                                                                                                  |                  132 | simplifying product architecture, standardizing terminology, config/source-of-truth cleanup |
| `zeke`                                                                                                     |                  118 | repo standards, infra/VPS work, AGENTS patterns, Next.js/backend conventions                |
| `map-ai`                                                                                                   |                   72 | iOS/web parity, Apple-style UX, agent/file/workflow architecture                            |
| `midday`                                                                                                   |                   49 | codebase understanding, architecture study, package-level AGENTS guidance                   |

## What you actually do with Codex

These are the recurring behaviors that showed up most clearly.

1. You use Codex as a product UI surgeon.
   Evidence: dozens of screen-specific prompts around lessons, storyboards, watch views, navbars, settings, FAQ, onboarding, and home/sidebar UX.
   Best packaging: mostly `skills` plus repo-specific `AGENTS.md` rules.

2. You use Codex as an architecture and repo-audit assistant.
   Evidence: repeated `audit`, `inspect`, `summarize`, `find stale references`, `map call graph`, and `review current diff` threads.
   Best packaging: `agents` for bounded scans plus one reusable audit `skill`.

3. You use Codex to design Codex-like systems.
   Evidence: many threads about `codex`, `agent teams`, `orchestrator`, `tool registry`, `MCP`, `automation`, `subagents`, and `skills`.
   Best packaging: `skills` for planning/implementation patterns and `agents` for large spec decomposition.

4. You use Codex for backend/infrastructure integration cleanup.
   Evidence: many `Clerk`, `Convex`, `Stripe`, `deploy`, `workflow`, `SSH`, `auth`, `server`, and `CI/CD` threads.
   Best packaging: mostly existing skills plus a few targeted plugins only when dashboard state matters.

5. You use Codex for marketing and growth operations.
   Evidence: landing-page rewrites, offer sharpening, transcript mining, SEO engine checks, email/copy work, YouTube/content strategy.
   Best packaging: `skills`, not plugins.

6. You use Codex to extract and repurpose external reference material.
   Evidence: repeated `yt-dlp` / transcript / subtitle / research-note work.
   Best packaging: a `skill` with bundled scripts, not a plugin.

7. You occasionally use Codex for Apple-platform work.
   Evidence: `Swift`, `SwiftUI`, `iOS`, `macOS`, `Liquid Glass`, concurrency, parity work.
   Best packaging: skills, which you already have for part of this.

8. You use Codex for environment and machine-level ops.
   Evidence: SSH keys, local tool installs, zsh/Homebrew/Codex version drift, dotfiles, env cleanup.
   Best packaging: usually `AGENTS.md` guidance plus shell, not new plugins.

## What should become skills

These are the strongest missing skill opportunities.

### 1. `repo-change-sweep`

Use when a flow or feature changed and you need Codex to find every stale doc, test, static reference, checklist, or copy mention.

- Why: you repeatedly ask for stale-reference sweeps after UX/flow changes.
- Evidence signals:
  - `find all repo files that should be updated`
  - `still describe`
  - `scan the repository for legacy ... references`
- Why this is a skill: the work is procedural and local-file based. It does not need new external tool access.

### 2. `rapid-ux-pass`

Use when you want Codex to inspect a surface, identify the highest-leverage UX changes, and implement only the strongest few.

- Why: this is one of your most common behaviors across `shorts-factory` and `man-meets-ai`.
- Evidence signals:
  - screen-specific prompts like `this page is useless`, `make this screen better`, `high impact UX improvements`
  - repeated “focus mode”, “clear next step”, “big obvious action” type requests
- Why this is a skill: your preference pattern is stable and can be codified.

### 3. `agents-md-author`

Use when you want Codex to inspect a repo or package, infer architecture + coding standards, and write or update `AGENTS.md`.

- Why: you have many explicit `AGENTS.md` authoring/update sessions across multiple repos.
- Evidence signals:
  - package-by-package `AGENTS.md` authoring in `midday`
  - repo-level `AGENTS.md` generation in `zeke`
  - repeated `update our AGENTS.md` prompts
- Why this is a skill: this is a repeated documentation workflow with a stable output contract.

### 4. `transcript-to-research-note`

Use when you want to fetch a transcript, clean it, distill it, and file a structured note in the right repo folder.

- Why: transcript mining appears repeatedly in marketing, content, and strategy work.
- Evidence signals:
  - `yt-dlp`
  - `transcript`
  - `subtitle`
  - `whisper`
- Why this is a skill: shell access is enough, and the workflow benefits from bundled scripts/templates.

### 5. `spec-to-workstreams`

Use when you want a spec turned into streams, sprint slices, ownership packets, and subagent-ready assignments.

- Why: you repeatedly break projects into streams and hand chunks to agents.
- Evidence signals:
  - `pick stream`
  - `workstream A/B/C`
  - `break this project down into sprints and tasks`
  - `codex-like orchestrator`
- Why this is a skill: this is a planning workflow with a stable assignment format.

### 6. `repo-understanding`

Use when you need Codex to reverse-engineer how a repo handles auth, data flow, state, jobs, or architecture, and return a concise map.

- Why: you ask this in unfamiliar repos often enough to justify a reusable pattern.
- Evidence signals:
  - `where is X declared`
  - `how does this project`
  - `reverse-engineer data fetching and state`
- Why this is a skill: it is mostly search + explanation + architecture mapping.

## What should become plugins/tools

This is the biggest takeaway: you probably need fewer new plugins than you think.

Most of your repeated work is not blocked on missing capability. It is blocked on repeatable workflow and preference encoding. That means `skills` win by default.

The plugin/tool candidates that do look justified:

### 1. Deployment-status plugin layer

Only worth it if you keep checking live deploy state, preview URLs, workflow runs, and environment status across providers.

- Strong candidates: GitHub Actions, Cloudflare Pages/Workers, Vercel, Render
- Why: you repeatedly inspect deploy workflows, PR-comment behavior, CI/CD simplification, and runtime status
- If you do not need live dashboard state, keep this as shell + skill instead

### 2. Ops-status plugin layer

Only worth it if you frequently need live incidents, logs, auth dashboard state, or payment state.

- Strong candidates: Better Stack, Clerk admin, Stripe admin
- Why: you repeatedly touch support/access, auth, webhook, and incident surfaces
- If most work remains code/config inspection, do not build this yet

### 3. Codex session analytics tool

Not a full plugin first. Start with a local script inside a skill.

- Why: the data is already available in `/Users/parkerrex/.codex/state_5.sqlite`
- Best first move: make a skill with a bundled script that can answer “what have I been doing lately?”

### Already proven plugin/tooling

- Figma MCP is clearly worth it
  - strong repeated usage
  - design-to-code is one of your actual recurring workflows
- Browser automation is situational, not central
  - keep Playwright available, but it is not one of your dominant repeated patterns

## What should become agents or automations

These are the strongest agent-shaped opportunities because they are bounded scans, recurring sweeps, or independent lanes.

### 1. Daily bug scan per active repo

- Already validated by your `daily-bug-scan` automation in `shorts-factory`
- Good candidate to duplicate for 1-2 other high-velocity repos

### 2. Post-refactor stale-reference sweep

- Trigger: after a major workflow/route/model rename
- Job: scan docs, tests, checklists, prompts, and static copy for stale assumptions
- This is more agent-shaped than skill-shaped when you want a broad independent pass

### 3. Repo audit/review worker

- Trigger: large diff, architecture cleanup, or migration
- Job: independently review for mismatches, regressions, missing docs/tests, and naming drift
- You already do this manually a lot

### 4. Spec decomposition worker

- Trigger: you have a large spec and want stream-by-stream task packets
- Job: convert a plan/spec into subagent-ready assignment units
- Especially useful in `shorts-factory` and `genesis`

### 5. Monthly session-mining report

- Trigger: once a month
- Job: scan local Codex history and report new repeated behaviors, wasted loops, and skill candidates
- This turns your own session history into productized leverage

## What belongs in `AGENTS.md`

Use `AGENTS.md` for rules that are true almost every time inside a repo. Do not put procedural workflows there if they deserve a skill.

The patterns from your sessions that belong in `AGENTS.md`:

1. Component and file-shape constraints.
   Example: component length caps, split UI from logic, prefer smaller focused files.

2. Required collateral updates after user-flow changes.
   Example: if you change a workflow, also update docs, tests, static references, support copy, and checklists in the same pass.

3. Source-of-truth boundaries.
   Example: which files define curriculum, runtime contracts, route ownership, schema, copy, or launch tracker state.

4. Verification expectations.
   Example: run targeted tests, typecheck, or QA passes before calling a task done.

5. Design-language rules.
   Example: preserve existing visual language unless explicitly changing it; avoid generic dashboard patterns.

6. Repo-specific business constraints.
   Example: founder-free execution, later-phase labeling, launch-critical path protection.

Good rule of thumb:

- If it is a stable repo law, put it in `AGENTS.md`
- If it is a reusable workflow, make it a `skill`
- If it needs external system state or privileged APIs, consider a `plugin`
- If it is a recurring bounded sweep or independent work lane, make it an `agent`

## Recommended priority order

1. Build `repo-change-sweep`
2. Build `agents-md-author`
3. Build `rapid-ux-pass`
4. Build `transcript-to-research-note`
5. Build `spec-to-workstreams`
6. Expand automations beyond the existing daily bug scan
7. Add new plugins only for live deploy/ops surfaces you truly inspect often

## Bottom line

Your dominant pattern is not “I need more tools.” It is “I do the same kinds of high-judgment workflow over and over.”

That means:

- Build more `skills`
- Add a few `agents`
- Keep `AGENTS.md` tighter and more invariant-focused
- Be selective about new plugins

If you only act on one thing, build a small stack around:

1. `repo-change-sweep`
2. `agents-md-author`
3. `rapid-ux-pass`

Those three match your actual repeated behavior best.
