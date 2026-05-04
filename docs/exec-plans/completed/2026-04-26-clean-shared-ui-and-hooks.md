---
title: Clean Shared UI And Hooks
status: complete
created_at: 2026-04-26
completed_at: 2026-04-26
summary: Move non-primitive marketing effects and a codebase-only keyboard hook into their owning features while preserving compatibility exports.
post_build_recap: Marketing-only effect implementations now live under the marketing feature, the codebase-only keyboard shortcut hook now lives under codebase-flow, compatibility exports preserve old paths, and focused plus app validation passed.
program_id: app-structure-refactor
planning_brief: docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-6.md
read_when:
  - Resuming the shared UI and hook cleanup slice.
  - Checking why shared UI inventory was preserved instead of deleted.
  - Validating that marketing visual effects and the codebase keyboard hook moved without behavior changes.
---

# Clean Shared UI And Hooks

This is a living execution plan. It describes the sixth implementation slice for the app structure refactor Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The shared UI folder should read as the app's reusable primitive layer, not a miscellaneous home for marketing motion effects and feature-specific hooks. After this slice, marketing-only visual effects will live under the marketing feature, the codebase-only keyboard shortcut hook will live under codebase-flow, and the old paths will remain as compatibility exports so the migration is behavior-neutral.

This slice does not redesign the homepage, remove shadcn inventory, or change runtime behavior. It makes ownership visible while keeping the app and tests working exactly as before.

## Progress

- [x] 2026-04-26 EDT: Confirmed the first five child ExecPlans are complete and the Program names shared UI and hooks cleanup as the next recommended slice.
- [x] 2026-04-26 EDT: Inspected the Program packet, frontend docs, design instructions, homepage configuration docs, `apps/web/components/ui`, `apps/web/hooks`, and focused tests before editing.
- [x] 2026-04-26 EDT: Wrote planning brief 6 and opened this active child ExecPlan.
- [x] 2026-04-26 EDT: Moved marketing-style effect implementations into `apps/web/features/marketing/components/effects` and kept old `apps/web/components/ui` paths as compatibility exports.
- [x] 2026-04-26 EDT: Updated first-party marketing imports and focused encrypted-text tests to use feature-owned effect paths.
- [x] 2026-04-26 EDT: Moved the keyboard shortcut hook into `apps/web/features/codebase-flow/hooks` and kept the old global hook path as a compatibility export.
- [x] 2026-04-26 EDT: Added focused `marketing-effects.test.tsx` coverage for the moved marketing effect exports.
- [x] 2026-04-26 EDT: Confirmed no first-party imports remain from the old `components/ui` effect paths or old global keyboard shortcut hook path.
- [x] 2026-04-26 EDT: Focused marketing effect, encrypted text, codebase page, homepage content, homepage render-model, homepage structured-data, and homepage CTA tests passed.
- [x] 2026-04-26 EDT: App format check, app lint, and app typecheck passed after the shared UI and hook moves.
- [x] 2026-04-26 EDT: Completed-path plan lint, Program lint, markdown lint, and `git diff --check` passed after archival.

## Surprises & Discoveries

2026-04-26 EDT: `DottedGlowBackground` is not marketing-only in the current import graph. It is imported by `apps/web/features/marketing/components/home-page/hero-atmosphere.tsx` and `apps/web/features/course/mission/components/mission/mission-hero-card.tsx`, so this slice leaves it in place.

2026-04-26 EDT: `apps/web/hooks/use-mobile.ts` remains a global shared hook because `apps/web/components/ui/sidebar.tsx` imports it.

2026-04-26 EDT: `apps/web/features/shared/hooks/use-autosave.ts` has no production consumer in the current scan, but `apps/web/tests/unit/use-autosave.test.tsx` still exercises it. This slice does not delete or move that tested hook.

## Decision Log

Decision: Move only compatibility-preserving effect and hook paths in this slice.
Rationale: The Program explicitly says not to delete UI inventory yet. Re-exporting old paths keeps the migration reversible and avoids surprising any remaining consumers.
Date: 2026-04-26

Decision: Keep `DottedGlowBackground` out of the marketing move.
Rationale: The current code uses it from both marketing and course mission UI. Moving it into marketing would turn a shared visual effect into a cross-feature dependency.
Date: 2026-04-26

## Outcomes & Retrospective

This plan is complete. Marketing-style effect implementations now live under `apps/web/features/marketing/components/effects`, first-party marketing imports and focused tests use those paths, and the old `apps/web/components/ui` effect paths remain as compatibility exports. The codebase keyboard shortcut hook now lives under `apps/web/features/codebase-flow/hooks`, the codebase stage card imports it from that feature path, and the old global hook path remains as a compatibility export.

Focused marketing-effect, encrypted-text, codebase, homepage contract, format, app lint, app typecheck, plan, Program, markdown, and diff validation passed. The implementation did not delete shared UI inventory, move `DottedGlowBackground`, move `use-mobile`, move or delete `use-autosave`, change homepage content, change homepage section visibility, change CTA behavior, change structured data, change route behavior, change Convex, change Stripe checkout, change webhook behavior, change pricing, change promo code behavior, change billing proof, change environment behavior, or include the unrelated stashed scrollbar styling.

## Context and Orientation

Ship by Sunday's web app lives in `apps/web`. Reusable UI primitives currently live under `apps/web/components/ui`. Durable feature-owned code lives under `apps/web/features`.

The marketing homepage imports `Cover` from `apps/web/components/ui/cover.tsx` through `apps/web/features/marketing/components/home-page/home-hero-headline.tsx`, and imports `PointerHighlight` from `apps/web/components/ui/pointer-highlight.tsx` through `apps/web/features/marketing/components/home-page/sprint-path-unified-section.tsx` and `apps/web/features/marketing/components/home-page/whats-inside-section.tsx`. These components are visual motion effects, not base UI primitives.

The files `apps/web/components/ui/encrypted-text.tsx`, `apps/web/components/ui/hero-highlight.tsx`, and `apps/web/components/ui/text-hover-effect.tsx` are also marketing-style motion effects. The current production import scan finds no first-party production consumers for them, but `apps/web/tests/unit/encrypted-text.test.tsx` exercises `EncryptedText`.

The keyboard shortcut hook lives at `apps/web/hooks/use-keyboard-shortcut.ts`, but the only current first-party consumer is `apps/web/features/codebase-flow/components/codebase-stage-step-card.tsx`. That makes it feature-owned in practice.

### In Scope

Create `apps/web/features/marketing/components/effects/` and move `cover.tsx`, `pointer-highlight.tsx`, `encrypted-text.tsx`, `hero-highlight.tsx`, and `text-hover-effect.tsx` there.

Update first-party marketing imports and focused tests to import the moved effects from `@/features/marketing/components/effects/...`.

Keep the old `apps/web/components/ui` effect files as temporary compatibility exports to the new marketing-owned files.

Move `apps/web/hooks/use-keyboard-shortcut.ts` to `apps/web/features/codebase-flow/hooks/use-keyboard-shortcut.ts`, update the codebase stage card import, and keep the old global hook path as a temporary compatibility export.

Add focused test coverage that renders the moved marketing effect exports from their new feature-owned path.

Update this ExecPlan, the owning Program, the current planning brief pointer, and only plan surfaces required by the actual changes.

### Out Of Scope

Do not move or delete `apps/web/components/ui/dotted-glow-background.tsx` in this slice.

Do not move or delete active shadcn-style primitives in `apps/web/components/ui`, including `button`, `card`, `badge`, `separator`, `alert`, `field`, `label`, `input`, `textarea`, `sidebar`, or `input-otp`.

Do not delete unused UI inventory, rename or delete feature folders, move route screens, move AppShell, change homepage content, change homepage section visibility, change CTA behavior, change structured data, change route behavior, change Convex schema or generated files, change Stripe checkout, webhook, pricing, promo code, billing proof, or environment behavior.

Do not include the unrelated stashed scrollbar styling change.

## Plan of Work

Start by preserving the baseline import evidence for the marketing effect files, shared hook files, and deferred shared visual files. Record any hidden consumers in `Surprises & Discoveries` before changing the approach.

Create the marketing effects folder and move the five marketing-style effect files into it. Replace the old `components/ui` files with compatibility exports. Update the homepage sections and focused tests to import the new feature-owned paths.

Move the keyboard shortcut hook into the codebase-flow feature and replace the old global hook file with a compatibility export. Update the codebase stage card to import the hook from the feature-owned path.

Run focused tests immediately after the code move, then run app-level and plan-level validation. Keep this ExecPlan and the Program current as implementation and validation results become real.

## Milestones

The first milestone is plan and baseline evidence. It is complete when planning brief 6 and this ExecPlan exist, lint cleanly, and baseline scans prove which effect and hook files are safe to move now.

The second milestone is marketing effect ownership. It is complete when the marketing-style effect files live under `apps/web/features/marketing/components/effects`, first-party imports use those paths, the old `components/ui` effect files are compatibility exports, and focused marketing-effect tests pass.

The third milestone is codebase hook ownership. It is complete when the keyboard shortcut hook lives under `apps/web/features/codebase-flow/hooks`, the codebase stage card imports it from there, the old global hook path is a compatibility export, and focused codebase tests pass.

The fourth milestone is validation. It is complete when focused tests, app format check, app lint, app typecheck, plan lint, Program lint, markdown lint, and `git diff --check` pass.

The fifth milestone is archival. It is complete when this ExecPlan records the completed outcome, moves from `docs/exec-plans/active/` to `docs/exec-plans/completed/`, and the Program names the next slice.

## Concrete Steps

From repo root, confirm branch and status:

    git status --short --branch

Read the Program, the current planning brief, and this plan:

    sed -n '1,260p' docs/programs/completed/2026-04-26-app-structure-refactor/program.md
    sed -n '1,220p' docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-6.md
    sed -n '1,320p' docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md

Record baseline imports:

    rg 'from "@/components/ui/(cover|pointer-highlight|encrypted-text|hero-highlight|text-hover-effect)"|from "@/hooks/use-keyboard-shortcut"|DottedGlowBackground|useAutosave|useIsMobile' apps/web --glob '!node_modules'

After the moves and import updates, prove first-party consumers use the feature-owned paths and old paths remain compatibility exports:

    rg 'from "@/components/ui/(cover|pointer-highlight|encrypted-text|hero-highlight|text-hover-effect)"|from "@/hooks/use-keyboard-shortcut"' apps/web --glob '!node_modules'
    rg 'features/marketing/components/effects/(cover|pointer-highlight|encrypted-text|hero-highlight|text-hover-effect)|features/codebase-flow/hooks/use-keyboard-shortcut' apps/web --glob '!node_modules'

Run focused tests:

    bun run --cwd apps/web test:unit -- tests/unit/marketing-effects.test.tsx tests/unit/encrypted-text.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx

Then run app and plan checks:

    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md
    git diff --check

## Validation and Acceptance

This slice is accepted because the marketing-style effect implementations live under `apps/web/features/marketing/components/effects`, first-party marketing imports and focused tests use those new paths, the old `components/ui` effect paths are compatibility exports, the keyboard shortcut hook lives under `apps/web/features/codebase-flow/hooks`, the codebase stage card imports it from that feature path, and the old global hook path remains a compatibility export.

The shared UI primitive inventory must remain present. `DottedGlowBackground`, `use-mobile`, and `use-autosave` must remain in their existing homes for this slice.

Focused tests must prove the new marketing effect exports render, the encrypted text server markup remains stable, codebase page behavior still works, and homepage content, render model, structured data, and primary CTA behavior remain unchanged.

### Test Commands

Run these commands from repo root after implementation:

    bun run --cwd apps/web test:unit -- tests/unit/marketing-effects.test.tsx tests/unit/encrypted-text.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx
    bun run --cwd apps/web test:unit -- tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx
    bun run format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md
    git diff --check

## Idempotence and Recovery

The moves are safe to retry because old paths remain compatibility exports. If an import update is missed, update the import to the new feature-owned path and rerun the focused tests.

If a moved effect is found to have a non-marketing production consumer, stop and record the consumer in `Surprises & Discoveries` before deciding whether the implementation should stay in marketing, return to `components/ui`, or move to a neutral shared effects folder in a later slice.

If focused tests fail, repair path and module-boundary issues before considering behavior changes. This slice should not change homepage copy, structure, animation behavior, codebase save behavior, routes, Convex, Stripe, or billing behavior.

Do not broaden recovery into deleting unused UI inventory, moving `DottedGlowBackground`, moving route screens, course-domain cleanup, billing cleanup, or final feature-folder deletion.

## Artifacts and Notes

Source Program packet:

    docs/programs/completed/2026-04-26-app-structure-refactor/

Current planning brief:

    docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-6.md

Baseline marketing-only effect fan-in:

    apps/web/features/marketing/components/home-page/home-hero-headline.tsx
    apps/web/features/marketing/components/home-page/sprint-path-unified-section.tsx
    apps/web/features/marketing/components/home-page/whats-inside-section.tsx
    apps/web/tests/unit/encrypted-text.test.tsx

Baseline codebase keyboard hook fan-in:

    apps/web/features/codebase-flow/components/codebase-stage-step-card.tsx

Deferred shared visual and hook surfaces:

    apps/web/components/ui/dotted-glow-background.tsx
    apps/web/hooks/use-mobile.ts
    apps/web/features/shared/hooks/use-autosave.ts

Post-move import scan found no first-party imports from old effect or global keyboard shortcut paths:

    rg 'from "@/components/ui/(cover|pointer-highlight|encrypted-text|hero-highlight|text-hover-effect)"|from "@/hooks/use-keyboard-shortcut"' apps/web --glob '!node_modules'
    no matches

Focused marketing effect and encrypted-text validation passed:

    bun run --cwd apps/web test:unit -- tests/unit/marketing-effects.test.tsx tests/unit/encrypted-text.test.tsx
    Test Files  2 passed (2)
    Tests  2 passed (2)

Focused codebase validation passed:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx
    Test Files  1 passed (1)
    Tests  4 passed (4)

Focused homepage contract validation passed:

    bun run --cwd apps/web test:unit -- tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-structured-data.test.ts
    Test Files  3 passed (3)
    Tests  7 passed (7)

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-primary-cta.test.tsx
    Test Files  1 passed (1)
    Tests  2 passed (2)

App-level validation passed:

    bun run format:check
    All matched files use the correct format.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    bun run --cwd apps/web typecheck
    Compiled successfully.

Completed-path plan and Program validation passed:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md
    docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md: ok

    bun run programs:lint
    app-structure-refactor: ok

    bun run markdown:lint -- --paths docs/programs/completed/2026-04-26-app-structure-refactor docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md
    docs/exec-plans/completed/2026-04-26-clean-shared-ui-and-hooks.md: ok
    docs/programs/completed/2026-04-26-app-structure-refactor/program.md: ok

    git diff --check
    no output

## Interfaces and Dependencies

This plan depends on `docs/programs/completed/2026-04-26-app-structure-refactor/program.md`, `docs/programs/completed/2026-04-26-app-structure-refactor/planning-brief-6.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, root `DESIGN.md`, `docs/FRONTEND.md`, `apps/web/content/docs/configure-the-homepage.mdx`, `apps/web/components/ui`, `apps/web/features/marketing/components/home-page`, `apps/web/features/codebase-flow/components/codebase-stage-step-card.tsx`, `apps/web/tests/unit`, and `apps/web/tests/integration-ui`.
