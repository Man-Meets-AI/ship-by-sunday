---
program_id: ui-design-system-alignment
title: UI Design System Alignment
status: complete
created_at: 2026-05-03
completed_at: 2026-05-03
summary: Align Ship by Sunday app UI around screenshot-grounded color, typography, spacing, and control rules.
post_build_recap: The app UI now has a screenshot-grounded design library, semantic color roles, normal operational shell tracking, compact control geometry, documented spacing/radius rules, and desktop/mobile browser proof across representative light and dark routes.
read_when:
  - Reviewing the completed UI consistency initiative.
  - Deciding whether a future visual cleanup belongs in color, typography, spacing, controls, or proof.
  - Checking the final browser-proof and validation record for app design-system alignment.
---

# UI Design System Alignment

This Program is a completed initiative document. Preserve it as the durable record of the UI design-system alignment work.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday should feel like one coherent desktop-grade product in light and dark mode. Users should not see one route using warm marketing blacks, another using default shadcn grays, another using arbitrary hard-coded neutrals, and another using different button or text density. The completed initiative gives designers and implementers one durable app UI reference for color, typography, spacing, button sizes, and audit proof.

The first visible outcome is color consistency. The first child slice gave protected app surfaces and shared primitives a stable semantic color vocabulary that maps to the screenshot-grounded UI design library while preserving intentional brand and marketing exceptions.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/completed/2026-05-03-ui-design-system-alignment/`.

The screenshot and design library research is recorded in `research-pass-screenshot-design-library.md`. Current repository implementation research is recorded in `research-pass-current-app-surfaces.md`. The normalized ordering is in `normalized-pass-design-system-alignment.md`. The initiative decision is in `converged-decision-packet.md`. The implementation ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. The review of risk boundaries is in `cross-repo-review.md`. The current immutable implementation brief is `planning-brief-3.md`, and `current-planning-brief.txt` points at that brief.

The main design input is `docs/design-docs/ui-design-library.md`. Root `DESIGN.md` remains the high-level visual source of truth.

## Current State

The repo now has a screenshot-grounded UI design library linked from the design docs spine. It defines desired light and dark app color roles, typography roles, spacing scale, radii, button/control sizes, layout patterns, and an audit checklist.

The implemented app token source is `apps/web/app/globals.css`. It defines the shadcn-style semantic color tokens, the first promoted `accent.info`, `state.success`, and `state.warning` roles, radius scale, font utilities, body style, code style, and selection colors. The component primitives in `apps/web/components/ui/` already consume many of those tokens and are close to the desired compact control geometry.

The first alignment pass is complete. Some route-specific visual differences remain because they are intentional brand expression, editorial surfaces, generated previews, docs/blog chrome, or lower-risk follow-up work. The durable design library now describes how future changes should classify those differences instead of treating every visual mismatch as app UI drift.

The custom homepage editorial sections are not targets for this Program. Specifically, do not normalize the graphics, font treatments, color choices, or layout styles for the `Install leverage` / `the loop repeats TOMORROW` hero, the `Exec Loops: OpenAI's WEAPON of choice` section, or the worker/how-workers-work sections. They may be used only as regression surfaces to confirm they were not accidentally changed.

## Progress

- [x] 2026-05-03: Created `docs/design-docs/ui-design-library.md` from the attached UI screenshots and linked it from the design docs spine.
- [x] 2026-05-03: Created this Program packet and current planning brief for multi-slice UI consistency work.
- [x] 2026-05-03: Created the first child ExecPlan, `docs/exec-plans/completed/2026-05-03-color-token-alignment.md`.
- [x] 2026-05-03: Implement and validate the color token alignment slice.
- [x] 2026-05-03: Refresh this Program with the next planning brief after color lands.
- [x] 2026-05-03: Created the second child ExecPlan, `docs/exec-plans/completed/2026-05-03-typography-tracking-alignment.md`.
- [x] 2026-05-03: Implement and validate the typography tracking alignment slice.
- [x] 2026-05-03: Refreshed this Program with `planning-brief-3.md` for the control geometry and spacing slice.
- [x] 2026-05-03: Created the third child ExecPlan, `docs/exec-plans/completed/2026-05-03-control-geometry-spacing-alignment.md`.
- [x] 2026-05-03: Implement and validate the control geometry and spacing alignment slice.
- [x] 2026-05-03: Folded the representative route visual audit into the completed geometry slice by recorded decision.
- [x] 2026-05-03: Completed this Program and prepared it for archive under `docs/programs/completed/`.

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

Decision: Fold the representative route proof slice into the control geometry and spacing slice.
Rationale: After color, inherited tracking, and compact control geometry landed, the remaining proof work was validation rather than a new implementation surface. The geometry slice ran focused protected-route integration tests, full integration UI, broad gates, and desktop/mobile browser proof for reachable light and dark routes, satisfying the Program's representative proof requirement without creating a fourth ExecPlan that would only repeat validation.
Date: 2026-05-03

## Slice Ledger

The completed first child slice is `docs/exec-plans/completed/2026-05-03-color-token-alignment.md`. It delivered the color token audit, minimal token promotion, high-value app UI migration, exception documentation, and light/dark proof.

The completed second child slice is `docs/exec-plans/completed/2026-05-03-typography-tracking-alignment.md`. It delivered the inherited operational tracking reset, design doc reconciliation, and typography exception documentation.

The completed third child slice is `docs/exec-plans/completed/2026-05-03-control-geometry-spacing-alignment.md`. It normalized reusable control heights, icon button sizing, protected review/access spacing, and representative browser proof.

The planned fourth representative route visual audit was deliberately removed by decision and folded into the completed third child slice. No required Program slice remains.

## Next Slice

No required next slice remains inside this Program. Future UI cleanup should start from `docs/design-docs/ui-design-library.md` and create a new focused ExecPlan only when it changes a durable surface beyond the completed baseline.

## Risks and Watchpoints

Do not turn the color slice into a homepage redesign, typography refactor, spacing pass, or component rewrite. Each child ExecPlan must keep its boundary.

Do not treat every hard-coded color as a bug. Integration logo colors, marketing illustration colors, Figma-derived hero colors, Open Graph image colors, and generated preview theme colors can be intentional content.

Do not restyle the named custom homepage editorial sections. This includes `apps/web/app/_components/home-page/sections/blueprint-demo/blueprint-demo-leverage-hero.tsx`, `apps/web/app/_components/home-page/sections/sprint-path-unified-section.tsx`, `apps/web/app/_components/home-page/sections/exec-loop-section.tsx`, `apps/web/app/_components/home-page/sections/exec-loop/exec-loop-visual.tsx`, and their related content in `apps/web/app/_content/home-page.ts`.

Do not add a hidden third palette. New color roles should live in `apps/web/app/globals.css` and be documented in the design library when they become durable.

Do not regress dark mode. The screenshots show dark mode as a first-class surface, so light and dark proof are both required.

Do not revert unrelated work. The local worktree may contain unrelated app UI changes and image assets; child slices must inspect and preserve them.

## Outcomes & Retrospective

This Program completed the first screenshot-grounded app UI alignment pass. It created `docs/design-docs/ui-design-library.md`, promoted the first reusable app color roles, reset inherited operational tracking at shell boundaries, normalized shared button and icon button geometry, tightened the highest-value protected review/access spacing drift, and proved representative reachable routes in light and dark mode on desktop and mobile.

The Program intentionally did not normalize the named homepage editorial sections, blog/docs editorial rhythm, generated preview art, or every explicit route-level typography choice. Those remain future route-level decisions, not unfinished Program work.

## Validation and Acceptance

The Program completed after the color, typography, spacing/control, and representative proof requirements landed or were deliberately folded together by recorded decision. The final slice passed focused route tests, full integration UI, `bun run format`, `bun run format:check`, `bun lint`, `bun typecheck`, plan lint, Program lint, markdown lint, `git diff --check`, and desktop/mobile browser proof for representative reachable light and dark routes.

## Artifacts and Notes

Useful audit commands from the initial scan:

    rg -n "#[0-9A-Fa-f]{3,8}|oklch\\(|text-black|bg-black|border-black|ring-black|text-white|bg-white|text-zinc|bg-zinc|border-zinc|text-neutral|bg-neutral|border-neutral|text-stone|bg-stone|border-stone|text-slate|bg-slate|border-slate|text-gray|bg-gray|border-gray" apps/web/app apps/web/components apps/web/lib apps/web/platform -S
    rg -n "text-\\[[0-9.]+(px|rem)\\]|tracking-\\[|letter-spacing|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)" apps/web/app apps/web/components -S
    rg -n "rounded-\\[|rounded-(none|sm|md|lg|xl|2xl|3xl|4xl|full)|h-\\[|size-\\[|h-(6|7|8|9|10|11|12)|size-(6|7|8|9|10|11|12)" apps/web/app apps/web/components -S

The design library created before this Program passed `bun run markdown:lint` and `bun run public-readiness:lint`.

The completed color token slice promoted `--accent-info`, `--state-success`, and `--state-warning`, migrated workspace status and feedback colors to semantic utilities, documented the homepage-only `Cover` exception, and passed format, lint, typecheck, focused unit/integration tests, full integration UI, plan lint, Program lint, markdown lint, public-readiness lint, `git diff --check`, and light/dark browser token proof.

The completed typography tracking slice added `tracking-normal` at operational shell boundaries for workspace, access-required, identity, checkout success, and checkout cancel UI. It reconciled root `DESIGN.md` with the screenshot-grounded design library, preserved homepage/editorial typography exceptions, and passed format, lint, typecheck, focused route tests, full integration UI, plan lint, Program lint, markdown lint, `git diff --check`, and desktop/mobile browser proof.

The completed control geometry and spacing slice identified and implemented the first durable geometry baseline: shared buttons use 28px, 32px, and 40px visual heights; icon-only buttons use 24px, 28px, and 32px visual sizes; operational app panels stay at `rounded-xl` or `rounded-2xl` unless they are explicit modal, composer, docs/editorial, hero/pricing, or homepage art-direction exceptions; and access-state shell spacing uses 32px major gaps with 40px as the current desktop split high-water mark.

Final browser proof used a fresh `next start` server on `http://localhost:3002`. Desktop and mobile light proof on `/sign-in` showed no horizontal overflow, `main` tracking as `normal`, the Home small button at `28px`, and the default Sign in button at `32px`. Desktop dark proof on `/checkout/success` showed no horizontal overflow, `main` tracking as `normal`, and the primary checkout button at `32px`. Mobile dark proof on `/checkout/cancel` showed no horizontal overflow, `main` tracking as `normal`, and the primary checkout button at `32px`. Direct `/access-required` browser access redirected to sign-in under local auth, so protected access/review rendering is covered by focused integration tests.

## Interfaces and Dependencies

This Program depends on root `DESIGN.md`, `docs/DESIGN.md`, `docs/design-docs/ui-design-library.md`, `docs/ship-by-sunday/design-pack/AGENTS.md`, `apps/web/AGENTS.md`, `apps/web/app/globals.css`, shared primitives under `apps/web/components/ui/`, and representative app surfaces under `apps/web/app/(workspace)/`, `apps/web/app/(identity)/`, and `apps/web/app/checkout/`.

The Program uses the existing package manager and validation commands. It should not add dependencies unless a later child ExecPlan records a specific need.
