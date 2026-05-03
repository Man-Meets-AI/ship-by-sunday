---
program_id: ui-design-system-alignment
title: UI Design System Alignment
status: active
created_at: 2026-05-03
completed_at: null
summary: Align Ship by Sunday app UI around screenshot-grounded color, typography, spacing, and control rules.
post_build_recap: null
read_when:
  - Resuming UI consistency work.
  - Deciding whether a visual cleanup belongs in color, typography, spacing, controls, or proof.
  - Updating the active planning brief for app design-system alignment.
---

# UI Design System Alignment

This Program is a living initiative document. Update it whenever a child slice lands, the ordering changes, or validation changes the durable truth.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday should feel like one coherent desktop-grade product in light and dark mode. Users should not see one route using warm marketing blacks, another using default shadcn grays, another using arbitrary hard-coded neutrals, and another using different button or text density. The completed initiative gives designers and implementers one durable app UI reference for color, typography, spacing, button sizes, and audit proof.

The first visible outcome is color consistency. After the first child slice, protected app surfaces and shared primitives should use a stable semantic color vocabulary that maps to the screenshot-grounded UI design library while preserving intentional brand and marketing exceptions.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-03-ui-design-system-alignment/`.

The screenshot and design library research is recorded in `research-pass-screenshot-design-library.md`. Current repository implementation research is recorded in `research-pass-current-app-surfaces.md`. The normalized ordering is in `normalized-pass-design-system-alignment.md`. The initiative decision is in `converged-decision-packet.md`. The implementation ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. The review of risk boundaries is in `cross-repo-review.md`. The current immutable implementation brief is `planning-brief-1.md`, and `current-planning-brief.txt` points at that brief.

The main design input is `docs/design-docs/ui-design-library.md`. Root `DESIGN.md` remains the high-level visual source of truth.

## Current State

The repo now has a screenshot-grounded UI design library linked from the design docs spine. It defines desired light and dark app color roles, typography roles, spacing scale, radii, button/control sizes, layout patterns, and an audit checklist.

The implemented app token source is `apps/web/app/globals.css`. It already defines the shadcn-style semantic color tokens, radius scale, font utilities, body style, code style, and selection colors. The component primitives in `apps/web/components/ui/` already consume many of those tokens and are close to the desired compact control geometry.

Current drift is still real. App and marketing surfaces mix semantic tokens with hard-coded hex values, generic neutral utilities, arbitrary text sizes, negative tracking, and route-specific card treatments. Some of those values are intentional brand expression. Others are implementation drift. The Program exists to classify and fix those differences slice by slice.

The custom homepage editorial sections are not targets for this Program. Specifically, do not normalize the graphics, font treatments, color choices, or layout styles for the `Install leverage` / `the loop repeats TOMORROW` hero, the `Exec Loops: OpenAI's WEAPON of choice` section, or the worker/how-workers-work sections. They may be used only as regression surfaces to confirm they were not accidentally changed.

## Progress

- [x] 2026-05-03: Created `docs/design-docs/ui-design-library.md` from the attached UI screenshots and linked it from the design docs spine.
- [x] 2026-05-03: Created this Program packet and current planning brief for multi-slice UI consistency work.
- [x] 2026-05-03: Created the first child ExecPlan, `docs/exec-plans/active/2026-05-03-color-token-alignment.md`.
- [ ] 2026-05-03: Implement and validate the color token alignment slice.
- [ ] 2026-05-03: Refresh this Program with the next planning brief after color lands.

## Decision Log

Decision: Use a Program instead of a single broad ExecPlan.
Rationale: The requested cleanup spans color, typography, spacing, control sizes, and route-level proof. Keeping all of that inside one implementation plan would invite scope bleed and make validation too broad.
Date: 2026-05-03

Decision: Make color the first child ExecPlan.
Rationale: Color inconsistency is highly visible, has a centralized token source, and can improve many surfaces before typography and spacing refactors begin.
Date: 2026-05-03

Decision: Preserve intentional marketing and editorial color exceptions.
Rationale: Root `DESIGN.md` distinguishes neutral app UI from warmer marketing and docs expression. The Program should normalize product UI without erasing intentional brand art.
Date: 2026-05-03

Decision: Promote only needed tokens during implementation.
Rationale: The design library lists an audit vocabulary. Adding every role to CSS at once would create unused surface area and make later decisions harder to validate.
Date: 2026-05-03

Decision: Exclude custom homepage editorial graphics and typography from normalization.
Rationale: The `Install leverage` / `the loop repeats TOMORROW`, `Exec Loops: OpenAI's WEAPON of choice`, and worker/how-workers-work sections are intentional art-directed homepage moments. They should not be pulled into the compact app UI token, type, spacing, or control rules.
Date: 2026-05-03

## Slice Ledger

The first child slice is `docs/exec-plans/active/2026-05-03-color-token-alignment.md`. It owns the color token audit, minimal token promotion, high-value app UI migration, exception documentation, and light/dark proof.

The planned second child slice is typography and tracking alignment. It should decide where operational UI resets letter spacing to `0`, normalize app text roles around the design library scale, and preserve brand/editorial type exceptions.

The planned third child slice is control geometry and spacing alignment. It should normalize reusable control heights, input density, nav row padding, app gutters, card radii, and shell spacing after color and type stop drifting.

The planned fourth child slice is representative route visual audit. It should use browser proof in light and dark mode across public and protected routes, repair any residual drift, and update durable docs with discovered rules.

## Next Slice

The active next slice is `docs/exec-plans/active/2026-05-03-color-token-alignment.md`. Its remaining outcome is to move from a documented UI design library to implemented color tokens and representative app UI color consistency.

## Risks and Watchpoints

Do not turn the color slice into a homepage redesign, typography refactor, spacing pass, or component rewrite. Each child ExecPlan must keep its boundary.

Do not treat every hard-coded color as a bug. Integration logo colors, marketing illustration colors, Figma-derived hero colors, Open Graph image colors, and generated preview theme colors can be intentional content.

Do not restyle the named custom homepage editorial sections. This includes `apps/web/app/_components/home-page/sections/blueprint-demo/blueprint-demo-leverage-hero.tsx`, `apps/web/app/_components/home-page/sections/sprint-path-unified-section.tsx`, `apps/web/app/_components/home-page/sections/exec-loop-section.tsx`, `apps/web/app/_components/home-page/sections/exec-loop/exec-loop-visual.tsx`, and their related content in `apps/web/app/_content/home-page.ts`.

Do not add a hidden third palette. New color roles should live in `apps/web/app/globals.css` and be documented in the design library when they become durable.

Do not regress dark mode. The screenshots show dark mode as a first-class surface, so light and dark proof are both required.

Do not revert unrelated work. The local worktree may contain unrelated app UI changes and image assets; child slices must inspect and preserve them.

## Outcomes & Retrospective

This Program is active. The expected final outcome is a repo where app UI color, type, spacing, and controls visibly follow the same system in light and dark mode, and where the design library remains the practical audit reference for future work.

## Validation and Acceptance

The Program can move to completed only after the color, typography, spacing/control, and representative proof slices have landed or been deliberately removed by a recorded decision. Completion requires the design docs to match implementation, focused checks for each slice to pass, repo-level format, lint, and typecheck to pass for the final slice, and browser proof to cover representative surfaces in light and dark mode on desktop and mobile.

## Artifacts and Notes

Useful audit commands from the initial scan:

    rg -n "#[0-9A-Fa-f]{3,8}|oklch\\(|text-black|bg-black|border-black|ring-black|text-white|bg-white|text-zinc|bg-zinc|border-zinc|text-neutral|bg-neutral|border-neutral|text-stone|bg-stone|border-stone|text-slate|bg-slate|border-slate|text-gray|bg-gray|border-gray" apps/web/app apps/web/components apps/web/lib apps/web/platform -S
    rg -n "text-\\[[0-9.]+(px|rem)\\]|tracking-\\[|letter-spacing|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)" apps/web/app apps/web/components -S
    rg -n "rounded-\\[|rounded-(none|sm|md|lg|xl|2xl|3xl|4xl|full)|h-\\[|size-\\[|h-(6|7|8|9|10|11|12)|size-(6|7|8|9|10|11|12)" apps/web/app apps/web/components -S

The design library created before this Program passed `bun run markdown:lint` and `bun run public-readiness:lint`.

## Interfaces and Dependencies

This Program depends on root `DESIGN.md`, `docs/DESIGN.md`, `docs/design-docs/ui-design-library.md`, `docs/ship-by-sunday/design-pack/AGENTS.md`, `apps/web/AGENTS.md`, `apps/web/app/globals.css`, shared primitives under `apps/web/components/ui/`, and representative app surfaces under `apps/web/app/(workspace)/`, `apps/web/app/(identity)/`, and `apps/web/app/checkout/`.

The Program uses the existing package manager and validation commands. It should not add dependencies unless a later child ExecPlan records a specific need.
