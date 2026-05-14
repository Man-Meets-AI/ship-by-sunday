---
title: T3 Code Form Scaffold Controls
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move Field, Label, Separator, Checkbox, Switch, and RadioGroup toward T3 Code recipes while preserving current Radix call-site compatibility.
post_build_recap: Field, Label, Separator, Checkbox, Switch, and RadioGroup now use T3 Code recipes on the current Radix compatibility surface with focused render and public sign-in browser proof.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md
read_when:
  - Resuming the form scaffold primitive slice.
  - Reviewing Field, Label, Separator, Checkbox, Switch, or RadioGroup compatibility during the T3 Code migration.
  - Deciding whether Select or other heavier interactive primitives should adopt Base UI.
---

# T3 Code Form Scaffold Controls

This document is a living execution plan for the form scaffold and binary-control primitive slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday's forms currently mix old shadcn-neutral field wrappers, Radix labels, simple separators, and binary controls with the new T3 Code input and textarea wrappers. This slice makes the nearby form scaffolding look and behave like T3 Code while preserving the existing Radix-based public API. After this slice, sign-in, codebase-flow fields, lesson checkboxes, separators, and any future switch or radio use will share T3 Code's compact typography, focus rings, before-shadow surfaces, and control sizing.

## Progress

- [x] 2026-05-14: Read planning brief 4, Program state, current and T3 Code Field, Label, Separator, Checkbox, Switch, RadioGroup, and Select sources, plus current call-site usage.
- [x] 2026-05-14: Port Field, Label, Separator, Checkbox, Switch, and RadioGroup class recipes with compatibility exports.
- [x] 2026-05-14: Add focused render tests that prove T3 Code class tokens, current export names, checked/disabled states, and field error rendering.
- [x] 2026-05-14: Run focused tests, app lint/typecheck, Program/plan/docs checks, whitespace checks, and representative browser proof.

## Surprises & Discoveries

T3 Code's Field, Label, Separator, Checkbox, Switch, and RadioGroup source uses Base UI, but the visible recipes can be adapted onto the current `radix-ui` primitives for this slice. This avoids a dependency change and avoids converting live route call sites from Radix APIs to Base UI APIs before Select, Dialog, Menu, Popover, Tooltip, and Sheet have a coherent dependency plan.

`Select` is intentionally excluded from this slice. Current codebase-flow routes use Radix Select trigger/content/item APIs and T3 Code's Select source has a different Base UI popup/positioner surface. Select should get its own child ExecPlan so trigger/content behavior and browser interactions can be proven directly.

Current usage of Checkbox is small and course-local, while Switch and RadioGroup currently have no app call sites. Preserving their exports still matters because they are shared primitives future slices may compose.

Public browser proof can exercise Field and Label through `/sign-in`. Public routes currently do not expose Separator, Checkbox, Switch, or RadioGroup without authentication or route gating, so those primitives are covered by focused render tests and the production build for this slice.

## Decision Log

Decision: Keep Radix implementations for these primitives in this slice.
Rationale: The user wants T3 Code visuals and source shape, but the current app still expects Radix exports. These controls can adopt T3 recipes without a dependency addition. Base UI adoption should be made at the heavier selection/menu/dialog layer where the API differences matter.
Date: 2026-05-14

Decision: Defer Select.
Rationale: Select has active codebase-flow call sites and larger positioning/content behavior differences. Keeping it out preserves a small, verifiable slice and avoids silent scope widening.
Date: 2026-05-14

## Outcomes & Retrospective

This slice moved `apps/web/src/components/ui/field.tsx`, `label.tsx`, `separator.tsx`, `checkbox.tsx`, `switch.tsx`, and `radio-group.tsx` toward T3 Code recipes while keeping the existing Radix implementation and current export names. Label and Field label typography now use the T3 compact `text-base/4.5` and `sm:text-sm/4` treatment. Field descriptions and errors use the smaller T3 text scale, with `FieldError` still rendering `role="alert"`. Separator now uses explicit orientation selectors. Checkbox, Switch, and Radio now use T3-style before-shadow surfaces, focus-ring offset treatment, checked/disabled state classes, and compact indicator recipes. `Radio` is now exported as a T3-compatible name while `RadioGroupItem` remains an alias.

Focused render tests prove the T3 class tokens and compatibility exports. Browser proof on `/sign-in` proved Field, Label, and Input still render together without horizontal overflow on desktop and mobile.

## Context and Orientation

The source references are:

    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/field.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/label.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/separator.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/checkbox.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/switch.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/radio-group.tsx

The target files are:

    apps/web/src/components/ui/field.tsx
    apps/web/src/components/ui/label.tsx
    apps/web/src/components/ui/separator.tsx
    apps/web/src/components/ui/checkbox.tsx
    apps/web/src/components/ui/switch.tsx
    apps/web/src/components/ui/radio-group.tsx
    apps/web/tests/unit/ui-form-scaffold-controls.test.tsx

Current route call sites import `Field`, `FieldGroup`, `FieldLabel`, `FieldContent`, `FieldDescription`, `FieldError`, `FieldTitle`, `Label`, `Separator`, and `Checkbox`. Current `Switch` and `RadioGroup` exports are kept for shared primitive compatibility even though no app route currently imports them.

### In Scope

This plan updates Field, Label, Separator, Checkbox, Switch, and RadioGroup class recipes and compatibility exports only. It may add `Radio` as a T3-compatible export while keeping `RadioGroupItem`.

### Out Of Scope

This plan does not change Select, Popover, Tooltip, Dialog, Sheet, Menu, Command, Toast, Sidebar, generated-codebase templates, Telegram widget CSS, auth behavior, checkout behavior, or Convex-backed data flow. It does not add `@base-ui/react`.

## Plan of Work

First, update `apps/web/src/components/ui/label.tsx` and `separator.tsx` to use T3 Code typography and orientation selectors while keeping Radix primitive props and current defaults such as decorative separators.

Second, update `apps/web/src/components/ui/field.tsx` to make Field, FieldLabel, FieldDescription, and FieldError match T3 Code's compact form scaffolding. Preserve existing extra exports such as FieldSet, FieldLegend, FieldGroup, FieldContent, FieldTitle, and FieldSeparator because route call sites use them.

Third, update `apps/web/src/components/ui/checkbox.tsx`, `switch.tsx`, and `radio-group.tsx` to copy T3 Code's surface, focus-ring, before-shadow, checked, disabled, and indicator recipes onto the current Radix primitive implementations. Preserve current export names and props.

Fourth, add focused server-render tests under `apps/web/tests/unit` proving T3-only class tokens, field error rendering, separator orientation classes, checkbox checked surface classes, switch thumb recipe, and `Radio` plus `RadioGroupItem` export compatibility.

Fifth, run focused unit tests, app lint/typecheck, plan/program/docs lint, whitespace checks, and browser proof on public routes that exercise Field/Label/Input and Separator.

## Milestones

Milestone 1 creates this child ExecPlan and validates it with `plans:lint`.

Milestone 2 updates the six primitive files. Success means existing import names still compile and the T3 recipes are present.

Milestone 3 adds focused primitive tests. Success means server-render tests prove the recipes and compatibility exports without needing protected route state.

Milestone 4 validates and records completion. Success means focused tests, app lint/typecheck, plan/program/docs lint, browser proof, and `git diff --check` pass, then the plan moves to `docs/exec-plans/completed/` and the Program ledger names the next primitive follow-up.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-form-scaffold-controls.md

Edit:

    apps/web/src/components/ui/field.tsx
    apps/web/src/components/ui/label.tsx
    apps/web/src/components/ui/separator.tsx
    apps/web/src/components/ui/checkbox.tsx
    apps/web/src/components/ui/switch.tsx
    apps/web/src/components/ui/radio-group.tsx
    apps/web/tests/unit/ui-form-scaffold-controls.test.tsx

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-form-scaffold-controls.test.tsx

Run static validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-form-scaffold-controls.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-form-scaffold-controls.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is completed and moved, rerun plan lint against the completed path.

## Validation and Acceptance

Acceptance requires Field, Label, Separator, Checkbox, Switch, and RadioGroup to expose T3 Code class recipes while existing imports and props still typecheck. Focused tests must prove at least one T3-only class token on each primitive family, `FieldError` still renders a role alert, `RadioGroupItem` remains available, `Radio` is available as the T3-compatible alias, and no package dependency change is needed.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-form-scaffold-controls.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-form-scaffold-controls.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-form-scaffold-controls.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

## Idempotence and Recovery

The primitive edits are local and deterministic. If a T3 selector does not compile in this app, replace only that selector with the closest Tailwind-supported equivalent and record it in the Decision Log. If a call-site type breaks, preserve the existing public prop value instead of changing route call sites. Do not add dependencies in this slice.

## Artifacts and Notes

No package or lockfile change was needed.

Validation completed on 2026-05-14:

    bun run --cwd apps/web test:unit -- tests/unit/ui-form-scaffold-controls.test.tsx
    1 file passed, 4 tests passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    Next.js production build compiled, typechecked, and generated 103 static pages.

    Browser proof through the webpack dev server:
    `/sign-in` at 1440x1000 and 390x844 rendered one shared Field, one shared FieldLabel, and one shared Input control with T3 form scaffold treatment and no horizontal overflow.

Separator, Checkbox, Switch, and RadioGroup browser proof was not run because current public routes do not expose those primitives without authentication or route gating. They are covered by focused render tests and the production build in this slice.

## Interfaces and Dependencies

This slice depends on the existing `radix-ui` package, `class-variance-authority` for Field variants, `tailwind-merge` through `cn`, Tailwind CSS v4 selector support, and the T3 Code token foundation in `apps/web/src/app/globals.css`. It deliberately avoids the Base UI Field, Checkbox, Switch, Radio, and Separator APIs until a later dependency adoption slice.
