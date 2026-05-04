---
title: UI Design System Alignment Planning Brief 1
program_id: ui-design-system-alignment
brief_version: 1
status: current
summary: Write and execute the first child ExecPlan for color token alignment across app UI.
read_when:
  - Writing the color token alignment child ExecPlan.
  - Refreshing the UI design-system alignment Program after the first slice lands.
---

# UI Design System Alignment Planning Brief 1

## Planning Context

Ship by Sunday now has a screenshot-grounded UI design library at `docs/design-docs/ui-design-library.md`. The product needs the implementation to move toward that library without turning one cleanup into a broad redesign. The first implementation slice should target color because color inconsistency is the most visible drift and the app already routes much shared UI through semantic tokens in `apps/web/app/globals.css`.

The Program packet lives at `docs/programs/active/2026-05-03-ui-design-system-alignment/`.

## Next Plan Recommendation

Exact next plan title: `Color Token Alignment`.

Exact target path: `docs/exec-plans/active/2026-05-03-color-token-alignment.md`.

Exact scope: audit current color usage in app UI, promote the minimum needed screenshot-derived color roles into `apps/web/app/globals.css`, migrate high-value protected app and shared primitive surfaces away from hard-coded neutral colors, keep intentional marketing/editorial colors as documented exceptions, and prove representative light and dark mode behavior.

Exact implementation boundaries: stay inside app styling, shared UI primitives, protected app shell/workspace/codebase/settings/checkout handoff/review presentation files, and durable design docs. Do not change product routes, auth, checkout, entitlement, Convex data, provider setup, package dependencies, generated customer docs, homepage structure, or marketing copy. Do not restyle the custom homepage editorial graphics, font treatments, or section art for `Install leverage` / `the loop repeats TOMORROW`, `Exec Loops: OpenAI's WEAPON of choice`, or worker/how-workers-work sections.

Exact validation boundaries: run focused lint or tests for touched UI files, run `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-03-color-token-alignment.md`, run `bun run programs:lint`, run markdown lint for the Program and child ExecPlan, run `bun run format`, `bun lint`, and `bun typecheck` before considering the implementation complete, and capture desktop plus mobile visual proof in light and dark mode for representative routes.

## Required First-Slice Decisions

The child ExecPlan must decide whether the first color slice adds explicit `ui-*`, `action-*`, `state-*`, and `diff-*` tokens or maps the screenshot roles back into existing shadcn tokens only. The plan should prefer the smallest token addition that makes repeated roles clear.

The child ExecPlan must classify hard-coded colors into app UI drift, intentional marketing/editorial color, content brand color, generated preview/demo color, or unreachable/deprecated code before editing.

The child ExecPlan must treat the named homepage editorial sections as out of scope even if their colors, font sizes, tracking, radii, or layout differ from the app UI design library.

The child ExecPlan must preserve root `DESIGN.md` as the high-level source of truth and `docs/design-docs/ui-design-library.md` as the detailed audit target. Any implementation-discovered rule should update those docs only if it is durable.

## Success Criteria

The slice succeeds when the app has one documented light and dark color vocabulary for shared UI, representative app surfaces use semantic color roles instead of arbitrary neutral values, intentional exceptions are documented, and visual proof shows that light and dark UI read as the same product system.
