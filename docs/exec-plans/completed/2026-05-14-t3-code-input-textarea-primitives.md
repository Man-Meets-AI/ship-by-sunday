---
title: T3 Code Input Textarea Primitives
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move Input and Textarea toward T3 Code form-control recipes with native compatibility wrappers.
post_build_recap: Input and Textarea now use T3 Code form-control wrappers with native field escape hatches, focused render tests, app build proof, and public sign-in browser proof.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/completed/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md
read_when:
  - Resuming the Input and Textarea primitive slice.
  - Reviewing form-control compatibility during the T3 Code migration.
  - Deciding whether to add Base UI for form controls.
---

# T3 Code Input Textarea Primitives

This document is a living execution plan for the form-control primitive slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

After moving action and display primitives to T3 Code recipes, the next high-leverage shared primitives are `Input` and `Textarea`. T3 Code uses an outer control wrapper for border, ring, invalid, disabled, autofill, dark-mode, and before-shadow treatment, with a native field inside. Ship by Sunday's current primitives are native-only and current call sites use `className` for both layout and native field details. This slice adopts the T3 Code wrapper/control shape while preserving native input and textarea props, React 19 refs, and current call-site behavior.

## Progress

- [x] 2026-05-14: Read planning brief 4, T3 Code Input/Textarea sources, current Input/Textarea sources, package dependency state, and current call-site usage.
- [x] 2026-05-14: Implement native compatibility wrappers using T3 Code control recipes.
- [x] 2026-05-14: Adjust current call sites that need native padding, typography, or resize classes moved to `inputClassName` or `textareaClassName`.
- [x] 2026-05-14: Add focused render tests for wrapper/control slots, size props, invalid props, and native class escape hatches.
- [x] 2026-05-14: Run focused tests, app lint/typecheck, Program/plan/docs checks, whitespace checks, and representative browser proof.

## Surprises & Discoveries

T3 Code depends on `@base-ui/react`, but Ship by Sunday does not. Adding Base UI for only `Input` and `Textarea` would widen the dependency surface before dialogs, menus, select, and fields are planned. A native compatibility wrapper can copy the T3 visual recipe without adding the dependency yet.

At least one current call site passes a React ref to `Input`. React 19 permits refs as props for function components, and the current primitive forwards that prop by spreading onto the native `<input>`. The wrapper must preserve that behavior by passing `ref` to the native input, not the outer span.

Existing call-site `className` values include both layout classes like `h-9`, `flex-1`, and `max-w-48`, and native field classes like `pl-7`, `font-mono`, `resize-y`, and `leading-relaxed`. The primitive should support `inputClassName` and `textareaClassName` for native field styling while keeping `className` on the outer T3 control wrapper.

Current public routes expose `Input` on `/sign-in`, but do not expose a public `Textarea` route without authentication or route gating. Textarea proof for this slice is focused render proof plus the Next production build. Browser proof covered `Input` on `/sign-in` at desktop and mobile sizes.

## Decision Log

Decision: Do not add `@base-ui/react` in this slice.
Rationale: T3 Code's Input and Textarea are visually valuable without Base UI behavior. Base UI dependency adoption should happen deliberately with heavier interactive primitives, not incidentally through two native controls.
Date: 2026-05-14

Decision: Put `className` on the outer control and add native field class escape hatches.
Rationale: T3 Code's source treats the wrapper as the styled control. Current call sites that need native padding, typography, or resize behavior can be updated explicitly, which is clearer than trying to infer class intent from arbitrary strings.
Date: 2026-05-14

## Outcomes & Retrospective

This slice moved `apps/web/src/components/ui/input.tsx` and `textarea.tsx` to T3 Code-style outer control wrappers and inner native fields without adding `@base-ui/react`. `Input` now renders `data-slot="input-control"` around the native `data-slot="input"` and supports `size`, `unstyled`, `controlClassName`, and `inputClassName`. `Textarea` now renders `data-slot="textarea-control"` around the native `data-slot="textarea"` and supports matching wrapper controls plus `textareaClassName`.

The pricing demo input moved `pl-7` to `inputClassName`, the codebase text-field textarea moved native text sizing to `textareaClassName`, and the copy-prompt textarea moved native resize/monospace treatment to `textareaClassName`. Existing layout classes remain on the outer control wrapper. Focused render tests prove T3-only wrapper tokens, size handling, invalid attributes, and native field class escape hatches. App typecheck proves the existing React ref call site still compiles.

## Context and Orientation

Source files:

    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/input.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/textarea.tsx

Target files:

    apps/web/src/components/ui/input.tsx
    apps/web/src/components/ui/textarea.tsx
    apps/web/tests/unit/ui-form-control-primitives.test.tsx

Potential call-site adjustments:

    apps/web/src/app/_components/home-page/sections/codebase-demo/codebase-demo-pricing-card.tsx
    apps/web/src/app/(app)/_components/codebase-flow/codebase-stage-text-field.tsx
    apps/web/src/app/(app)/_components/course/lesson/shells/copy-prompt-resource-card.tsx

### In Scope

This plan updates only `Input`, `Textarea`, focused tests, and small call-site prop adjustments needed to preserve existing native field styling. It may add exported `InputProps` and `TextareaProps` types and optional `inputClassName`, `textareaClassName`, `controlClassName`, `size`, and `unstyled` props as compatibility and migration aids.

### Out Of Scope

This plan does not add Base UI, change Field primitives, select, checkbox, switch, dialogs, menus, command surfaces, generated-codebase templates, Telegram widget CSS, auth behavior, checkout behavior, or Convex-backed data flow.

## Plan of Work

First, update `Input` to render a T3 Code-style outer span with `data-slot="input-control"` and a native input with `data-slot="input"`. Keep native input props and pass `ref` through to the native input. Support `size="sm" | "default" | "lg" | number`, `unstyled`, `controlClassName`, and `inputClassName`.

Second, update `Textarea` to render a T3 Code-style outer span with `data-slot="textarea-control"` and a native textarea with `data-slot="textarea"`. Support `size`, `unstyled`, `controlClassName`, and `textareaClassName`.

Third, adjust current call sites where `className` must remain on the native field. Pricing input needs `pl-7` on the native input. Codebase text fields and copy-prompt textarea need native typography, resize, and min-height treatment preserved.

Fourth, add focused render tests under `apps/web/tests/unit` proving wrapper/control slots, T3 class tokens, size props, ref-compatible native attributes, and native class escape hatches.

Fifth, run focused unit tests, app lint/typecheck, plan/program/docs lint, whitespace checks, and browser proof on a public form-control surface if available.

## Milestones

Milestone 1 creates this child ExecPlan and validates it with `plans:lint`.

Milestone 2 updates Input and Textarea. Success means the primitives render T3 Code control wrappers while preserving native props and refs.

Milestone 3 adjusts needed call sites. Success means old native padding, typography, and resize behavior is represented explicitly through native class props.

Milestone 4 validates and records completion. Success means focused tests, app lint/typecheck, plan/program/docs lint, browser proof, and `git diff --check` pass, then the plan moves to `docs/exec-plans/completed/` and the Program ledger names the next primitive follow-up.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-input-textarea-primitives.md

Edit:

    apps/web/src/components/ui/input.tsx
    apps/web/src/components/ui/textarea.tsx
    apps/web/tests/unit/ui-form-control-primitives.test.tsx

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-form-control-primitives.test.tsx

Run static validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-input-textarea-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-input-textarea-primitives.md docs/programs/completed/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is completed and moved, rerun plan lint against the completed path.

## Validation and Acceptance

Acceptance requires `Input` and `Textarea` to expose T3 Code wrapper/control recipes while native props, refs, disabled, invalid state, current className layout usage, and adjusted native field classes still compile. Focused tests must prove the outer control slot, inner native slot, T3-only class tokens, size handling, native class escape hatches, and no package dependency change.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-form-control-primitives.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-input-textarea-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-input-textarea-primitives.md docs/programs/completed/2026-05-14-t3-code-source-design-system-port
    git diff --check

## Idempotence and Recovery

The primitive edits are local and deterministic. If T3 wrapper selectors do not compile, replace only those selectors with the closest Tailwind-supported equivalent and record it in the Decision Log. If a call-site visual behavior breaks because a class moved from native field to wrapper, add an explicit native field class prop instead of reverting the primitive. Do not add dependencies in this slice.

## Artifacts and Notes

No package or lockfile change was needed.

Validation completed on 2026-05-14:

    bun run --cwd apps/web test:unit -- tests/unit/ui-form-control-primitives.test.tsx
    1 file passed, 4 tests passed.

    bun run --cwd apps/web lint
    Found 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    Next.js production build compiled, typechecked, and generated 103 static pages.

    Browser proof through the webpack dev server:
    `/sign-in` at 1440x1000 and 390x844 rendered one shared Input control with T3 wrapper treatment, the native email input remained present with `autocomplete="email"`, and no horizontal overflow occurred.

Textarea browser proof was not run because no current public route exposes a Textarea without authentication or route gating. The Textarea change was covered by focused render tests and the production build.

## Interfaces and Dependencies

This slice depends on React 19 ref-as-prop behavior, Tailwind CSS v4 selector support, `tailwind-merge` through `cn`, and the T3 Code token foundation in `apps/web/src/app/globals.css`. It deliberately avoids the Base UI `Input` and `Field.Control` interfaces until a later primitive adapter slice.
