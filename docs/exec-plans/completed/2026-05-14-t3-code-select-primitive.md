---
title: T3 Code Select Primitive
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move the shared Select primitive toward T3 Code recipes while preserving current Radix Select call-site behavior.
post_build_recap: Select now carries T3 Code trigger, content, item, separator, scroll affordance, and compatibility helper recipes on the existing Radix Select API, with focused unit, codebase-flow integration, EA-authenticated browser, lint, format, and typecheck proof.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md
read_when:
  - Resuming the Select primitive slice.
  - Reviewing whether Select should stay on Radix or move to Base UI.
  - Validating codebase-flow Select behavior during the T3 Code migration.
---

# T3 Code Select Primitive

This document is a living execution plan for the Select primitive slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday's codebase-flow screens use the shared `Select` primitive for design-preset and theme-configuration choices. Those controls should visually move to T3 Code's compact trigger, popup, item, and scroll-arrow treatment without breaking existing Radix Select imports or value-change behavior. After this slice, current codebase-flow Select call sites should still compile and interact, while the shared primitive source exposes T3 Code-only class tokens and slot names that later app-shell and route migrations can build on.

## Progress

- [x] 2026-05-14: Read root, app, ExecPlan, Program, planning brief 4, release-workflow, completed primitive plans, T3 Code Select/Popover/Tooltip source, current Select source, live call sites, tests, and package dependencies.
- [x] 2026-05-14: Created this active ExecPlan and recorded the Radix-adapter strategy before coding.
- [x] 2026-05-14: Validate this plan with `plans:lint`.
- [x] 2026-05-14: Port the Select class recipes and compatibility exports.
- [x] 2026-05-14: Add focused Select render tests and run codebase-flow integration proof.
- [x] 2026-05-14: Run app lint/typecheck, plan/program/docs lint, markdown lint, `git diff --check`, and browser proof or record the exact blocker.
- [x] 2026-05-14: Move this ExecPlan to completed and update the Program ledger with the next slice.

## Surprises & Discoveries

The current worktree already includes unrelated prior-slice changes: `MISTAKES.md`, `apps/web/src/components/ui/field.tsx`, `apps/web/tests/unit/ui-form-scaffold-controls.test.tsx`, the completed form-scaffold ExecPlan move, and Program ledger updates. This Select slice must preserve those changes and edit only the Select-specific files plus the Program ledger entry for this new slice.

T3 Code's Select source uses `@base-ui/react/select`, `mergeProps`, `useRender`, a `SelectPopup` plus `SelectContent` alias, `SelectButton`, `selectTriggerVariants`, `SelectGroupLabel`, and CSS variables such as `--anchor-width` and `--available-height`. Ship by Sunday currently has no `@base-ui/react` dependency and live codebase-flow call sites use the Radix Select API from the bundled `radix-ui` package.

The real Select route, `http://localhost:3000/starter/generate-codebase`, is protected by authentication and entitlement. The connected Gmail account could send to `ea@parkerrex.com` but only exposed the sent copy, not an EA inbox-delivered verification email. The ignored release-persona file was therefore pointed at `ea@parkerrex.com`, `bun run release:personas:prepare -- --proof=default_ship --persona=member_with_access --base-url=http://localhost:3000` confirmed that the Clerk user exists and is entitled, and a one-off ignored Playwright proof used Clerk testing sign-in for the browser session.

## Decision Log

Decision: Adapt T3 Code Select recipes onto the current Radix Select implementation instead of adding `@base-ui/react` in this slice.
Rationale: Select has live codebase-flow usage, and the current call sites expect Radix props, content positioning, `onValueChange`, `SelectValue`, `SelectContent`, `SelectGroup`, `SelectItem`, and `SelectTrigger`. Adding Base UI now would require a dependency and popup API migration before Popover, Tooltip, Dialog, Menu, and Sheet have a shared adapter plan. The T3 visual result can be reached by copying class recipes, slot names, sizes, variants, item layout, and popup surface treatment onto Radix.
Date: 2026-05-14

Decision: Preserve current exports and add only cheap T3-compatible aliases.
Rationale: Current routes import `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectTrigger`, and `SelectValue`. Keeping those exports prevents route churn. Adding `SelectButton`, `selectTriggerVariants`, and `SelectGroupLabel` helps future T3-style call sites without forcing existing code to move.
Date: 2026-05-14

Decision: Use the repo's release-persona auth path for browser proof when the real Select route is entitlement-gated.
Rationale: The user requested a real login for `ea@parkerrex.com`. Manual Gmail-code retrieval for EA was unavailable through the connected mailbox, but the repo's release proof path supports real Clerk personas and deterministic testing sign-in after the passwordless challenge surface is verified. This keeps proof on the live protected route without changing product code or committing local auth state.
Date: 2026-05-14

## Outcomes & Retrospective

This slice kept Select Radix-backed and copied the T3 Code Select visual recipes onto the existing shared primitive. `apps/web/src/components/ui/select.tsx` now exports `selectTriggerVariants`, `SelectButton`, and `SelectGroupLabel` in addition to the existing Radix-compatible Select exports. The trigger supports `xs`, `sm`, `default`, and `lg` sizes plus `default` and `ghost` variants. Content, viewport, item, separator, and scroll controls now carry T3 popup/list/item surface tokens while preserving `SelectContent`, `SelectGroup`, `SelectItem`, `SelectTrigger`, and `SelectValue` behavior for current codebase-flow call sites.

The focused unit test proves export compatibility, trigger size/className behavior, T3-only class tokens, and content/item slot availability. The existing codebase-page integration-ui test still proves codebase-flow value-change behavior through the shared Select export shape. The authenticated browser proof signs in as `ea@parkerrex.com`, opens the protected Starter codebase route, opens the design-preset Select, verifies trigger/content/item slots, verifies 8 rendered items, checks the migrated T3 class fragments, and captures desktop and mobile screenshots. No package or lockfile change was needed. The next heavier primitive slice should handle Popover and Tooltip together because T3 Select's popup treatment depends on the same Base UI positioner pattern those primitives expose directly.

## Context and Orientation

The T3 Code source app is `/Users/bazelrex/Developer/t3code/apps/web`. The relevant source files are `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/select.tsx`, `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/popover.tsx`, `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/tooltip.tsx`, and `/Users/bazelrex/Developer/t3code/apps/web/components.json`. T3 Code uses Base UI and a `base-mira` shadcn style, but the visible class recipes are Tailwind strings and `class-variance-authority` variants.

The target primitive is `apps/web/src/components/ui/select.tsx`. Current live call sites are `apps/web/src/app/(app)/_components/codebase-flow/codebase-design-preset-field.tsx`, `apps/web/src/app/(app)/_components/codebase-flow/codebase-theme-configurator-controls.tsx`, and `apps/web/src/app/(app)/_components/codebase-flow/codebase-theme-configurator-knob.tsx`. The existing integration-ui test `apps/web/tests/integration-ui/codebase-page.test.tsx` mocks the Select exports and proves codebase-flow value changes, so this slice should keep those export names stable.

### In Scope

This plan updates `apps/web/src/components/ui/select.tsx`, adds a focused unit test for Select under `apps/web/tests/unit`, runs the existing codebase-flow integration-ui test when relevant, and updates this ExecPlan plus `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`. It may add T3-compatible `SelectButton`, `selectTriggerVariants`, and `SelectGroupLabel` exports if they do not require a new dependency or call-site rewrite.

### Out Of Scope

This plan does not add `@base-ui/react`, migrate Popover, Tooltip, Dialog, Sheet, DropdownMenu, Command, Toast, Sidebar, generated customer repo templates, Telegram widget CSS, auth behavior, checkout behavior, Convex code, or route-file structure. It does not change current codebase-flow call sites unless a tiny class-name update is necessary to preserve current visual width behavior.

## Plan of Work

First, validate this plan with `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md`.

Second, update `apps/web/src/components/ui/select.tsx`. Keep Radix as the implementation. Import `cva` and `VariantProps`, copy T3 Code's trigger variant recipe where it compiles in this Tailwind setup, and expose `selectTriggerVariants`. Update `SelectTrigger` to accept `size?: "xs" | "sm" | "default" | "lg"` and `variant?: "default" | "ghost"`, keep `data-slot="select-trigger"`, keep `data-size`, keep children rendering, and use Radix `SelectPrimitive.Icon` for the chevron. Add `SelectButton` as a plain button helper using the same recipe, because T3 exports it and future T3-style route code may expect it.

Third, update Radix `SelectContent`, `SelectItem`, `SelectSeparator`, scroll buttons, `SelectGroup`, `SelectLabel`, and a new `SelectGroupLabel` alias to use T3 popup/list/item/separator recipes while preserving current Radix props. The Radix content wrapper should retain `--radix-select-trigger-width` support and may also expose equivalent T3-style slot names such as `select-popup`, `select-list`, and `select-positioner` where safe.

Fourth, add `apps/web/tests/unit/ui-select-primitive.test.tsx`. Server-render tests should prove existing exports compile, `SelectTrigger` preserves `className`, `size`, and current Radix-friendly data attributes, `SelectContent` and `SelectItem` expose usable data slots, and T3-only class tokens such as `not-dark:bg-clip-padding`, `before:shadow-[0_1px_--theme(--color-black/4%)]`, `min-w-(--radix-select-trigger-width)`, `data-highlighted:bg-accent`, and `select-item-indicator` are present.

Fifth, run focused validation. The meaningful feature is codebase-flow selection, with P1 core-product risk because these controls affect the generated codebase configuration path. The source of truth is the selected value passed through `onValueChange` and visible trigger/content UI state. Must work: current design-preset and font/theme dropdown usage, current className sizing, item rendering, and current export names. Must fail safely: disabled items stay non-interactive, invalid triggers keep destructive styling, and missing Base UI does not break imports. Tests are focused render tests, the existing codebase-page integration-ui test, static lint/typecheck, and browser proof or a recorded auth limitation. CI gate is app baseline plus integration-ui coverage.

Sixth, once validation passes, update this ExecPlan's progress, discoveries, outcomes, and validation artifacts, move it to `docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md`, and update the Program ledger so the next slice points at a single follow-up primitive family.

## Milestones

Milestone 1 creates and lints the child ExecPlan. Success means the active plan links to `planning-brief-4.md`, records the Base UI decision, and names the exact Select files and call sites.

Milestone 2 ports Select recipes onto Radix. Success means existing Select exports and live call-site prop values still compile while the trigger, content, item, separator, and scroll affordances carry T3 Code class tokens.

Milestone 3 adds focused proof. Success means the new unit test proves export compatibility, trigger size/className behavior, content and item slot usability, and T3-only tokens, while the existing codebase-flow integration-ui test still passes.

Milestone 4 validates and records completion. Success means focused tests, app lint/typecheck, plan/program/docs lint, markdown lint, browser proof or a documented auth blocker, and `git diff --check` pass, then the ExecPlan moves to completed and the Program ledger names the next slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md

Edit:

    apps/web/src/components/ui/select.tsx
    apps/web/tests/unit/ui-select-primitive.test.tsx
    docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md
    docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-select-primitive.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx

Run static and docs validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is completed and moved, rerun plan lint against the completed path:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md

## Validation and Acceptance

Acceptance requires `Select` to remain Radix-backed and current-call-site compatible while carrying T3 Code class recipes for trigger, content, item, separator, and scroll affordances. Existing imports must keep compiling, `SelectTrigger className="w-full"` must still affect the trigger, `SelectTrigger size="sm"` must preserve small sizing, and `SelectContent` plus `SelectItem` must retain usable `data-slot` attributes. The focused test must prove T3-only class tokens are present. The codebase-flow integration-ui test must continue proving value changes through the mocked export shape. Browser proof should run against a route that renders Select; if authentication blocks live browser proof, the exact route and blocker must be recorded here.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-select-primitive.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

## Idempotence and Recovery

The Select edits are local and deterministic. If a T3 selector does not compile in this app, replace only that selector with the closest Tailwind-supported equivalent and record the change in the Decision Log. If a current call-site type breaks, preserve the existing public prop value and adjust the adapter instead of changing route behavior. Do not add `@base-ui/react` in this slice without updating this plan first, adding dependency and lockfile changes, and running dependency validation. Do not reset or remove the unrelated prior-slice worktree changes.

## Artifacts and Notes

Important source references:

    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/select.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/popover.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/tooltip.tsx
    /Users/bazelrex/Developer/t3code/apps/web/components.json
    apps/web/src/components/ui/select.tsx
    apps/web/src/app/(app)/_components/codebase-flow/codebase-design-preset-field.tsx
    apps/web/src/app/(app)/_components/codebase-flow/codebase-theme-configurator-controls.tsx
    apps/web/src/app/(app)/_components/codebase-flow/codebase-theme-configurator-knob.tsx
    apps/web/tests/integration-ui/codebase-page.test.tsx

No package or lockfile change is expected because this slice deliberately avoids Base UI.

Plan lint before coding:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-select-primitive.md
    docs/exec-plans/active/2026-05-14-t3-code-select-primitive.md: ok

Validation completed on 2026-05-14:

    bun run format
    Finished in 406ms on 1030 files using 12 threads.

    bun run --cwd apps/web test:unit -- tests/unit/ui-select-primitive.test.tsx
    1 file passed, 4 tests passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx
    1 file passed, 4 tests passed.

    bun lint
    App and package lint passed with 0 warnings and 0 errors.

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    App production build, app typecheck, and package typechecks passed.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md
    docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md: ok

    bun run programs:lint
    Program docs, packets, and prompts passed.

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-select-primitive.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    Markdown metadata lint passed for the completed plan and Program.

    git diff --check
    No whitespace errors.

Browser proof on the webpack dev server:

    PLAYWRIGHT_BASE_URL=http://localhost:3000 E2E_ENTITLED_EMAIL=ea@parkerrex.com node codex-scripts/prove-select-browser.mjs
    status: ok
    email: ea@parkerrex.com
    URL: http://localhost:3000/starter/generate-codebase
    Desktop Select trigger count: 2.
    Desktop Select item count: 8.
    First rendered item: Vercel Hosting Black-and-white precision with Geist typography.
    Verified slots: select-trigger, select-content, select-item.
    Verified class fragments: not-dark:bg-clip-padding, data-[state=open]:animate-in, data-[side=bottom]:slide-in-from-top-2, data-highlighted:bg-accent, in-data-[side=none]:min-w-[calc(var(--radix-select-trigger-width)+1.25rem)].
    Desktop screenshot: codex-scripts/artifacts/select-desktop.png.
    Mobile screenshot: codex-scripts/artifacts/select-mobile.png.

## Interfaces and Dependencies

This slice depends on the existing `radix-ui` package, `class-variance-authority`, `tailwind-merge` through `cn`, lucide icons, Tailwind CSS v4 arbitrary selector support, and the T3 Code token foundation in `apps/web/src/app/globals.css`. It intentionally keeps the Radix Select public interface while adopting T3 Code's visual recipes, leaving true Base UI adoption for a later coordinated Popover, Tooltip, Dialog, Menu, and Sheet slice.
