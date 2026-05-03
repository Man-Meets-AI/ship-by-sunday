---
title: Color Token Alignment
status: active
created_at: 2026-05-03
completed_at: null
summary: Align app UI color tokens and high-value surfaces to the screenshot-grounded light and dark design library.
post_build_recap: null
program_id: ui-design-system-alignment
planning_brief: docs/programs/active/2026-05-03-ui-design-system-alignment/planning-brief-1.md
read_when:
  - Implementing the first UI design-system alignment slice.
  - Changing app color tokens, hard-coded neutrals, dark mode, or visual audit rules.
  - Validating the color slice before moving to typography or spacing.
---

# Color Token Alignment

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday app UI should use one coherent light and dark color system instead of a mixture of tokenized shadcn colors, hard-coded grays, and route-specific neutral values. After this plan, shared app primitives and representative product surfaces should use semantic color roles that match `docs/design-docs/ui-design-library.md`, while intentional marketing and illustration colors remain documented exceptions.

The user-visible result is that protected app surfaces, checkout handoff UI, identity UI, and shared controls feel like the same product in light and dark mode. A reviewer should be able to open the representative routes, toggle theme, and see consistent canvas, shell, card, selected, hover, border, text, muted text, action, state, and diff colors.

## Progress

- [x] 2026-05-03: Authored this ExecPlan from `docs/programs/active/2026-05-03-ui-design-system-alignment/planning-brief-1.md`.
- [ ] 2026-05-03: Run the color inventory and classify hard-coded colors by role and exception type.
- [ ] 2026-05-03: Add or refine the minimum needed color tokens in `apps/web/app/globals.css`.
- [ ] 2026-05-03: Migrate shared primitives and high-value app surfaces to semantic colors.
- [ ] 2026-05-03: Update design docs with durable implementation decisions and allowed exceptions.
- [ ] 2026-05-03: Run focused checks, broad gates, and desktop/mobile visual proof in light and dark mode.

## Surprises & Discoveries

Initial planning scan found that `apps/web/app/globals.css` is already the central color token source and that shared primitives mostly consume semantic tokens. The likely cleanup is not a ground-up system replacement; it is token promotion, exception classification, and targeted migration.

Initial planning scan also found intentional hard-coded colors in homepage editorial sections and integration brand content. Those should not be normalized in this color slice.

Parker clarified on 2026-05-03 that the custom homepage graphics, font treatments, and styles for `Install leverage` / `the loop repeats TOMORROW`, `Exec Loops: OpenAI's WEAPON of choice`, and worker/how-workers-work sections must be ignored by this Program. Treat those as hard exclusions, not drift.

Initial planning scan found a typography conflict: `apps/web/app/globals.css` applies `letter-spacing: -0.02em` to `body`, while the UI design library says operational UI should use `0` tracking. That belongs to the later typography child slice unless a color edit must touch the same rule.

## Decision Log

Decision: Color alignment is the first implementation slice in the UI Design System Alignment Program.
Rationale: Color is the most visible inconsistency, is mostly centralized, and de-risks later typography and spacing work.
Date: 2026-05-03

Decision: Preserve intentional marketing, illustration, and brand-content colors.
Rationale: Root `DESIGN.md` explicitly separates neutral app UI from warmer editorial and marketing expression. The color slice should not erase intentional art direction.
Date: 2026-05-03

Decision: Promote only needed tokens.
Rationale: `docs/design-docs/ui-design-library.md` is an audit target. Adding the full token table to CSS before it is used would increase API surface without proof.
Date: 2026-05-03

Decision: Do not normalize named homepage editorial sections.
Rationale: The leverage hero, sprint-path exec-loop section, and worker/how-workers-work graphics are intentional custom homepage art direction. This color slice exists to align app UI, not to restyle those marketing moments.
Date: 2026-05-03

## Outcomes & Retrospective

This plan is active. Fill this section after implementation with the exact tokens added or changed, the surfaces migrated, the exceptions documented, the visual proof collected, and any remaining color drift intentionally deferred to later Program slices.

## Context and Orientation

The high-level design source is root `DESIGN.md`. The detailed screenshot-grounded audit target is `docs/design-docs/ui-design-library.md`. The owning Program is `docs/programs/active/2026-05-03-ui-design-system-alignment/program.md`.

The app token implementation lives in `apps/web/app/globals.css`. The `@theme inline` block maps CSS variables to Tailwind color utilities. The `:root` block defines light mode values, and the `.dark` block defines dark mode values. Existing semantic colors include `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-*`, and `sidebar-*`.

Shared UI primitives live in `apps/web/components/ui/`. Relevant primitives for this slice include `button.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `card.tsx`, `tabs.tsx`, `dropdown-menu.tsx`, `dialog.tsx`, `alert.tsx`, `badge.tsx`, `sidebar.tsx`, `tooltip.tsx`, and `code-block.tsx`. Many already use semantic tokens; do not rewrite them unless the inventory proves color drift.

Representative app surfaces live under `apps/web/app/(workspace)/`, `apps/web/app/(identity)/`, and `apps/web/app/checkout/`. High-value color surfaces include the app shell, local navigation, blueprint flow, settings page, checkout success page, access-required pages, review handoff, and Codex connection cards.

Marketing and content surfaces under `apps/web/app/_components/home-page/`, `apps/web/app/_content/home-page.ts`, and `apps/web/app/opengraph-image.tsx` contain intentional brand and editorial colors. They are not the primary target of this slice.

Hard homepage exclusions are `apps/web/app/_components/home-page/sections/blueprint-demo/blueprint-demo-leverage-hero.tsx` and `productPreviewSection.leverageHero` for `Install leverage` / `the loop repeats TOMORROW`; `apps/web/app/_components/home-page/sections/sprint-path-unified-section.tsx` and `homePageContent.sprintPathSection` for `Exec Loops: OpenAI's WEAPON of choice`; and `apps/web/app/_components/home-page/sections/exec-loop-section.tsx`, `apps/web/app/_components/home-page/sections/exec-loop/exec-loop-visual.tsx`, and `homePageContent.execLoopSection` for worker/how-workers-work graphics. Do not change their colors, custom type, section art, graphics, or layout as part of this plan.

Before implementation, run `git status --short`. The worktree may include unrelated app UI changes and image assets. Preserve unrelated user changes and avoid broad formatting churn.

### In Scope

Audit color usage across app UI. Add or refine the minimum needed semantic color roles in `apps/web/app/globals.css`. Migrate shared primitives and high-value app surfaces away from arbitrary neutral colors where they represent reusable UI roles. Document intentional exceptions in `docs/design-docs/ui-design-library.md` or this plan. Verify representative surfaces in light and dark mode.

### Out Of Scope

Do not normalize typography, tracking, spacing, control heights, route information architecture, copy, checkout behavior, auth behavior, Convex data, provider setup, package dependencies, or generated customer docs. Do not redesign the homepage or remove intentional Figma-derived black editorial sections. Do not update the custom homepage graphics/font/styles for `Install leverage` / `the loop repeats TOMORROW`, `Exec Loops: OpenAI's WEAPON of choice`, or worker/how-workers-work sections. Do not add every design-library token if the implementation does not need it.

## Plan of Work

Start by reading the current design sources and app owner instructions. The implementation must follow root `DESIGN.md`, `docs/design-docs/ui-design-library.md`, `docs/ship-by-sunday/design-pack/AGENTS.md`, and `apps/web/AGENTS.md`.

Next, inventory color usage. Use `rg` to find hard-coded hex colors, raw OKLCH outside the token source, and Tailwind neutral color utilities. Classify each result as one of six categories: app UI drift, hard-excluded homepage editorial art, intentional marketing/editorial color, content brand color, generated preview/demo color, or token source.

Then decide the first-wave token shape. Prefer mapping screenshot roles into existing shadcn tokens when the role already exists. Add new roles only when a repeated app UI role cannot be expressed clearly with existing tokens. If new Tailwind color utilities are needed, add `--color-*` mappings in the `@theme inline` block and matching light and dark CSS variables in `:root` and `.dark`.

After the token decision, migrate high-value surfaces. Start with shared primitives only where the primitive itself uses hard-coded neutrals or generic neutral utilities. Then migrate protected app shell, workspace navigation, blueprint flow, settings, checkout success, access-required, identity, and review surfaces as needed. Keep edits small and feature-local.

Update documentation after implementation clarifies durable rules. If a new token becomes part of the app contract, add it to `docs/design-docs/ui-design-library.md`. If an exception is intentionally left hard-coded, document why it is content, art, or marketing expression.

Finally, run focused checks, then broad gates, then browser proof. Light and dark mode must both be reviewed because the screenshots make dark mode a first-class target.

## Milestones

Milestone 1 inventories and classifies color usage. Success means the implementer can explain which colors are token source, which are intentional exceptions, and which are true app UI drift before editing. Run the `rg` commands in Concrete Steps and record meaningful findings in Surprises & Discoveries.

Milestone 2 updates the token layer. Success means `apps/web/app/globals.css` has the smallest viable set of light and dark roles needed for the first migration and no unused broad palette was introduced. Run focused lint or typecheck if the touched files require it, then read the CSS directly to confirm both light and dark values exist for every new role.

Milestone 3 migrates representative UI. Success means shared primitives and selected app surfaces use semantic colors, hard-coded app neutrals are reduced, and intentional exceptions remain documented. Run focused tests for touched routes or components.

Milestone 4 proves the color system. Success means format, lint, typecheck, plan lint, Program lint, markdown lint, `git diff --check`, and light/dark browser proof pass or any blocker is recorded with exact cause.

## Concrete Steps

Start from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Check the worktree and do not overwrite unrelated changes:

    git status --short

Read required guidance:

    sed -n '1,220p' DESIGN.md
    sed -n '1,260p' docs/design-docs/ui-design-library.md
    sed -n '1,180p' docs/ship-by-sunday/design-pack/AGENTS.md
    sed -n '1,180p' apps/web/AGENTS.md
    sed -n '1,220p' docs/programs/active/2026-05-03-ui-design-system-alignment/program.md

Inspect token and primitive sources:

    sed -n '1,260p' apps/web/app/globals.css
    sed -n '1,180p' apps/web/components/ui/button.tsx
    sed -n '1,140p' apps/web/components/ui/input.tsx
    sed -n '1,160p' apps/web/components/ui/card.tsx
    sed -n '1,220p' apps/web/components/ui/sidebar.tsx

Inventory current color usage:

    rg -n "#[0-9A-Fa-f]{3,8}|oklch\\(|text-black|bg-black|border-black|ring-black|text-white|bg-white|text-zinc|bg-zinc|border-zinc|text-neutral|bg-neutral|border-neutral|text-stone|bg-stone|border-stone|text-slate|bg-slate|border-slate|text-gray|bg-gray|border-gray" apps/web/app apps/web/components apps/web/lib apps/web/platform -S

Classify results before editing. Expected categories are token source, app UI drift, intentional marketing/editorial color, content brand color, and generated preview/demo color. A successful classification should produce a short note in this plan's Surprises & Discoveries or Artifacts and Notes section, not a hidden local scratch file.

Implement the smallest viable token and migration patch. Use `apply_patch` for manual edits. Do not add package dependencies.

After implementation, rerun the color inventory command and compare results. Remaining hard-coded colors should be explainable exceptions or token-source values.

Run the test commands listed below.

For browser proof, start the dev server only after focused checks are stable:

    bun run dev:core

Then verify at least one desktop viewport and one mobile viewport in both light and dark mode. Prefer protected app UI such as `/blueprint` or `/settings` when local auth is available. If auth is blocked, verify reachable app-adjacent routes and record the auth blocker exactly.

## Validation and Acceptance

The implementation is acceptable when app UI color roles are centralized, representative surfaces use semantic roles, hard-coded app neutrals are reduced, exceptions are documented, and light plus dark mode read as one coherent product system.

Acceptance is not "no hard-coded colors anywhere." Marketing art, integration brand colors, Open Graph rendering, and generated theme previews can still use specific values. Acceptance is that reusable app UI does not depend on arbitrary one-off colors where semantic roles exist.

### Test Commands

Run these from the repo root:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-03-color-token-alignment.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-03-color-token-alignment.md docs/programs/active/2026-05-03-ui-design-system-alignment docs/design-docs/ui-design-library.md DESIGN.md docs/DESIGN.md docs/design-docs/index.md
    bun run format
    bun lint
    bun typecheck
    git diff --check

Also run focused app tests for any touched routes or components. Examples:

    bun run --cwd apps/web test:integration:ui
    bun run --cwd apps/web vitest run tests/integration-ui/checkout-success-view.test.tsx tests/integration-ui/checkout-success-view.interactions.test.tsx

Use the narrowest relevant focused test set first if the implementation touches a smaller surface than these examples.

## Idempotence and Recovery

Color token changes should be additive or narrowly substitutive. If a new token proves unused or unclear, remove it before finishing the slice. If a migration creates unreadable dark mode, revert only the smallest changed class or variable and retest that surface.

If browser proof is blocked by local auth, Clerk, Convex, or dev-server setup, do not claim visual proof. Record the exact blocker, the routes that were still verified, and the tests that passed.

If a later slice needs to revise a token introduced here, update `docs/design-docs/ui-design-library.md`, this plan if still active, and the owning Program so the change is durable.

## Artifacts and Notes

Initial planning scan examples:

    apps/web/app/globals.css owns current OKLCH semantic color variables.
    apps/web/components/ui/button.tsx already uses bg-primary, text-primary-foreground, bg-muted, border-border, and ring tokens.
    apps/web/app/_content/home-page.ts contains intentional integration brand colors.
    apps/web/app/_components/home-page/sections/blueprint-demo/blueprint-demo-codebase-branch.tsx contains intentional Figma-derived editorial colors.
    apps/web/app/_components/home-page/sections/blueprint-demo/blueprint-demo-leverage-hero.tsx, sprint-path-unified-section.tsx, exec-loop-section.tsx, and exec-loop/exec-loop-visual.tsx are hard-excluded custom homepage editorial surfaces.
    apps/web/components/ui/cover.tsx and pointer-highlight.tsx contain generic neutral utilities that need classification before reuse in app UI.

Record implementation proof here as the slice proceeds.

## Interfaces and Dependencies

This plan depends on Tailwind v4 token mapping in `apps/web/app/globals.css`, the existing shadcn-style component primitives in `apps/web/components/ui/`, and the design contracts in root `DESIGN.md` and `docs/design-docs/ui-design-library.md`.

Do not add dependencies. Do not change external provider setup. Do not change route behavior. The only intended public contract change is visual consistency.
