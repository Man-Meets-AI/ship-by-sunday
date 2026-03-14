# Upskill Report

Date: 2026-03-14
Window analyzed: 2026-02-28 through 2026-03-14

## Evidence base

- Threads reviewed from `/Users/parkerrex/.codex/state_5.sqlite`: 249
- History entries reviewed from `/Users/parkerrex/.codex/history.jsonl`: 217
- User-managed skills inspected under `/Users/parkerrex/.agents/skills`: 72

## Highest-signal activity

### Conversation themes

1. Docs and agent-instruction work: 128 recent threads, 27 history entries
2. Lesson and curriculum work: 64 recent threads, 16 history entries
3. UX and copy critique: 58 recent threads, 8 history entries
4. Automation and skill maintenance: 41 recent threads
5. Convex, Clerk, Stripe, and browser QA issues appeared repeatedly as smaller but persistent clusters

### Explicit skill mentions

From recent threads:

1. `docs`: 58
2. `ux-design-crit`: 27
3. `figma`: 21
4. `convex`: 14
5. `clerk`: 8

From recent history entries:

1. `convex`: 12
2. `figma`: 7
3. `clerk`: 6
4. `docs`: 6

## Run update: 2026-03-14 11:15 ET

### Additional signal from this pass

- Manual threads after excluding automation prompts: 208
- Direct follow-up prompt `Implement the plan.`: 17
- Direct local-ops prompt `restart our services.`: 5

Manual-thread skill mentions in this pass:

1. `docs`: 36
2. `figma`: 13
3. `convex`: 11
4. `ux-design-crit`: 9
5. `clerk`: 7
6. `shadcn`: 4

### Additional findings and fixes from this pass

#### A. Planning handoffs still leak ambiguity into execution

Evidence:

- `Implement the plan.` recurred 17 times.
- `prd-strategy` came up directly in planning-workflow refinement threads.

Risk:

- The plan artifact is structurally valid but not always executable without a second interpretation pass.

Fix applied:

- Strengthened [`/Users/parkerrex/Projects/team-wiki/.agents/skills/prd-strategy/SKILL.md`](/Users/parkerrex/Projects/team-wiki/.agents/skills/prd-strategy/SKILL.md) so the chosen slice must make the first implementation milestone, affected systems, and first verification step obvious enough for a direct coding handoff.

#### B. Deprecated UX naming is still sticky in real usage

Evidence:

- `ux-design-crit` appeared 9 times in manual threads from this pass.
- `design-ux-crit` appeared only once in the same slice.

Risk:

- Keeping two full bodies invites drift while the deprecated alias remains the live muscle-memory prompt.

Fix applied:

- Converted [`/Users/parkerrex/.agents/skills/ux-design-crit/SKILL.md`](/Users/parkerrex/.agents/skills/ux-design-crit/SKILL.md) into a compatibility alias that explicitly routes to `design-ux-crit` instead of carrying its own duplicate doctrine.

#### C. `eng-implement` still had a dead specialist route

Evidence:

- `shadcn` appeared 4 times in manual threads from this pass.
- The implementation skill still told agents to call `$shadcn` even though no `shadcn` skill is installed in the current runtime.

Risk:

- Agents get routed into a non-existent teammate, which weakens trust in the skill graph and encourages improvisation.

Fix applied:

- Updated [`/Users/parkerrex/Projects/team-wiki/.agents/skills/eng-implement/SKILL.md`](/Users/parkerrex/Projects/team-wiki/.agents/skills/eng-implement/SKILL.md) so shadcn/ui routing is conditional on an actually installed `shadcn` skill.

#### D. Local service recovery is recurring but still not codified

Evidence:

- `restart our services.` appeared 5 times in the same 14-day window.

Risk:

- Repeated local restart work still depends on ad hoc shell knowledge instead of a stable contract.

Recommended fix:

- If the pattern continues next run, add a narrow local-dev restart skill with service discovery, restart order, health checks, and rollback guidance.

## Ranked findings

### 1. High-use skills still assumed a root `todo.md` after the repo moved its tracker

Impact: high

Evidence:

- This workspace now treats `docs/internal/todo.md` as the operational source of truth.
- Recent thread volume was heavily concentrated in docs, planning, and critique work.
- Several high-use skills still told agents to read or update `todo.md` directly.

Risk:

- Agents miss the real tracker.
- Updates land in stale pointer files instead of the launch operating doc.

Fix applied:

- Updated these skills to prefer `docs/internal/todo.md` when present and fall back to `todo.md` otherwise:
  - [`/Users/parkerrex/.agents/skills/docs/SKILL.md`](/Users/parkerrex/.agents/skills/docs/SKILL.md)
  - [`/Users/parkerrex/.agents/skills/prd-strategy/SKILL.md`](/Users/parkerrex/.agents/skills/prd-strategy/SKILL.md)
  - [`/Users/parkerrex/.agents/skills/prd-eng-review/SKILL.md`](/Users/parkerrex/.agents/skills/prd-eng-review/SKILL.md)
  - [`/Users/parkerrex/.agents/skills/ux-design-crit/SKILL.md`](/Users/parkerrex/.agents/skills/ux-design-crit/SKILL.md)
  - [`/Users/parkerrex/.agents/skills/design-ux-crit/SKILL.md`](/Users/parkerrex/.agents/skills/design-ux-crit/SKILL.md)

### 2. Local skill discovery still drifts toward global-install behavior

Impact: high

Evidence:

- Recent lessons already recorded `.codex` path drift and the need for local-first discovery.
- Conversation history still included `.codex/skills` references and install-oriented prompting.
- The managed `find-skills` skill remains global-install and leaderboard-first rather than local-inventory-first.

Risk:

- Duplicate installs instead of reusing or managing the existing `.agents` inventory.
- Ongoing confusion between local skills, Team Hub-managed skills, and Codex system skills.

Action this run:

- I tested a local improvement, but validation flagged it immediately because `find-skills` is a managed skill.
- I did not persist that local edit.

Recommended fix:

- Move the local-first and Team Hub-first guidance into the managed source for `find-skills`, then refresh the installed copy through the normal skill pipeline.

### 3. Cross-stack launch work is more of a handoff problem than a raw coverage problem

Impact: medium

Evidence:

- Repeated history snippets crossed `figma`, `clerk`, `convex`, `stripe`, and browser QA in the same workstream.
- The inventory already contains domain skills for each piece.
- The recurring failures happened at the transitions: auth to entitlement, design critique to implementation, and checkout to QA.

Risk:

- Agents pick the right domain skill but still miss sequencing, verification order, or source-of-truth constraints.

Recommended fix:

- Add a thin cross-stack launch handoff skill or reference for `Stripe -> Clerk -> Convex -> QA` so checkout, access, entitlement, and verification are treated as one flow.

### 4. UX critique skill duplication is still a maintenance risk

Impact: medium

Evidence:

- `ux-design-crit` and `design-ux-crit` are materially duplicated.
- Usage favored `ux-design-crit`, but both installed copies still need manual maintenance.

Risk:

- Future drift if only one alias gets updated.

Recommended fix:

- Keep one canonical skill body and generate the alias from it, or add an alias-maintenance rule in Team Hub.

### 5. Skill inventory breadth is strong, but consistency is uneven

Impact: low

Evidence:

- Inventory breadth is healthy at 72 installed skills.
- A quick structure pass showed many skills do not share consistent heading labels even when the content is good.

Risk:

- Lower scanability during fast routing, especially for newly added skills.

Recommended fix:

- Add a Team Hub lint rule for minimum structural headings or equivalent metadata rather than hand-editing dozens of otherwise healthy skills.

## Repeated struggle patterns

1. Source-of-truth drift after repo conventions changed.
2. Cross-skill workflow fragmentation in launch-critical flows.
3. A docs-heavy operating mode that makes tracker-path accuracy unusually important.

## Safe improvements applied this run

1. Updated five high-use skills to prefer the canonical internal tracker path when a repo uses one.
2. Added one new local lesson to prevent future tracker-path drift.
3. Added two new local lessons covering executable plan handoffs and missing-specialist routing.
4. Updated the `ux-design-crit` alias so it defers to the canonical `design-ux-crit` workflow.
5. Updated team-owned `prd-strategy` and `eng-implement` source skills, then republished them to the home skill store.

## Deferred work

1. Update the managed `find-skills` source so it checks local `.agents` coverage before suggesting install paths.
2. Add a cross-stack launch-handoff skill or reference for checkout, entitlement, and buyer-journey QA.
3. Consolidate `ux-design-crit` and `design-ux-crit` into a single maintained source.
4. Add Team Hub skill linting for heading and alias consistency.
