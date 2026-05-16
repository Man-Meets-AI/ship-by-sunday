---
title: "Starter Interactive Preview Plan Split Recommendation"
summary: "Recommended child ExecPlan split for the Starter preview Program."
docType: "plan_split_recommendation"
status: "active"
read_when:
  - "Choosing the next child ExecPlan."
  - "Deciding whether the preview needs one or several slices."
---

# Starter Interactive Preview Plan Split Recommendation

## Recommended Split

The Program can start with one child ExecPlan: `Add Starter Interactive Preview`.

That slice should add the Starter-specific preview, extract or reuse the required old demo pieces, wire the preview into `/starter`, and prove desktop/mobile behavior. The slice is large enough to deserve an ExecPlan because it touches public marketing UI, client state, old compatibility code, draft handoff, checkout CTAs, tests, and browser proof.

Do not split extraction and route integration unless the first implementation attempt shows that old demo dependencies are harder to isolate than expected. A separate extraction-only slice would be acceptable if it preserves the old homepage demo first, then a second slice could mount the Starter preview.

## First Child ExecPlan

Suggested title: `Add Starter Interactive Preview`.

Suggested path: `docs/exec-plans/active/2026-05-15-add-starter-interactive-preview.md`.

Program linkage:

    program_id: "starter-interactive-preview"
    planning_brief: "docs/programs/active/2026-05-15-starter-interactive-preview/planning-brief-1.md"

Expected scope:

- add `apps/web/src/components/starter/` or an equivalent plain module home for the Starter preview
- keep `apps/web/src/app/(marketing)/starter/page.tsx` as route assembly
- reuse or extract codebase-demo draft storage, form cards, design and pricing controls, sidebar, locked cards, and save-before-checkout behavior
- preserve old homepage demo behavior and tests if still referenced
- add focused public marketing and integration-ui tests for the new preview
- capture `/starter` desktop and mobile proof

Out of scope:

- changing Stripe offer IDs or checkout session params
- changing protected Starter access or route behavior
- touching Workers, Worker Seal Team 6, Cal.com, Telegram widget mounting, generated repo output, or MDX cleanup
- bringing back the old homepage section stack

## Possible Follow-Up Slices

If the first slice lands cleanly, no second child slice is required. If it leaves old `_components/home-page` imports in awkward positions, a follow-up cleanup slice can move the shared codebase-demo primitives into a plain module while preserving both `/starter` and old compatibility tests.

If browser proof reveals the preview still reads as old homepage design, a visual polish slice can tighten responsive geometry and T3 public surface alignment without changing behavior.
