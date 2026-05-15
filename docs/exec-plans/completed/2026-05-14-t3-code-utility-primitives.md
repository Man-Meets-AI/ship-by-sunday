---
title: T3 Code Utility Primitives
status: complete
created_at: 2026-05-14
completed_at: 2026-05-14
summary: Move ScrollArea, Collapsible, Toggle, ToggleGroup, Spinner, and Empty toward T3 Code recipes while preserving current Radix call-site compatibility.
post_build_recap: ScrollArea, Collapsible, Toggle, ToggleGroup, Spinner, and Empty now carry T3-style utility recipes on top of the existing Radix/shared runtime. Focused primitive tests, representative codebase/workspace integration tests, desktop/mobile browser proof, app lint/typecheck, repo lint/typecheck, plan/program/docs lint, markdown lint, and diff checks passed. Sidebar remains intentionally deferred to the protected app-shell/sidebar slice because it has no live imports today.
program_id: t3-code-source-design-system-port
planning_brief: docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md
read_when:
  - Resuming the utility primitive slice.
  - Reviewing shared ScrollArea, Collapsible, Toggle, Spinner, or Empty compatibility during the T3 Code migration.
  - Deciding whether Sidebar should be migrated with utilities or with the protected app-shell slice.
---

# T3 Code Utility Primitives

This document is a living execution plan for the utility primitive slice of the T3 Code source design-system port.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday still has several lower-level utility primitives that are composed by the codebase flow, worker setup panels, course lesson surfaces, Dialog/Sheet panels, and support pages. They are not as visually dominant as buttons or menus, but they carry old shadcn-neutral scrollbars, toggles, collapsible content, and empty-state treatment. This slice adapts T3 Code's ScrollArea, Collapsible, Toggle, ToggleGroup, Spinner, and Empty recipes onto the current app primitives while keeping Radix-backed behavior and existing call-site props.

After this slice, current call sites should keep importing the same primitive names. Scroll areas should have the T3 compact scrollbar and optional fade/gutter controls, Collapsible should expose the T3 `CollapsiblePanel` alias while targeting Radix `data-state`, Toggle and ToggleGroup should use T3 compact button recipes while preserving Radix group selection, Spinner should keep current loading semantics, and Empty should expose the T3 icon/media layout.

## Progress

- [x] 2026-05-14: Read root and app agent instructions, Program packet, planning brief 4, current utility primitive files, live call sites, T3 Code utility source files, and recent primitive test patterns.
- [x] 2026-05-14: Split Sidebar out of this utility slice because `apps/web/src/components/ui/sidebar.tsx` has no live imports yet and should be migrated with the app-shell/sidebar slice where it can be proven.
- [x] 2026-05-14: Created this active ExecPlan and recorded the Radix-adapter strategy before coding.
- [x] 2026-05-14: Validated the active plan with `plans:lint`.
- [x] 2026-05-14: Migrated ScrollArea, Collapsible, Toggle, ToggleGroup, Spinner, and Empty recipes while preserving current exports and props.
- [x] 2026-05-14: Added focused primitive tests and reran representative live call-site tests.
- [x] 2026-05-14: Ran desktop/mobile browser proof through a temporary local route, captured ignored screenshots, and removed the temporary route before final validation.
- [x] 2026-05-14: Ran final format, repo lint/typecheck, Program/plan/docs lint, markdown lint, and `git diff --check`.
- [x] 2026-05-14: Moved this ExecPlan to completed and updated the Program ledger with the next slice.

## Surprises & Discoveries

`apps/web/src/components/ui/sidebar.tsx` exists but has no live imports in `apps/web/src` or `apps/web/tests`. Migrating Sidebar now would mostly be static churn without app-shell proof, while utility primitives in this plan have live route-level consumers.

T3 Code's utility primitives use Base UI. Ship by Sunday's current ScrollArea, Collapsible, Toggle, and ToggleGroup wrappers use the bundled `radix-ui` package, so copied state selectors must target Radix `data-state`, `data-orientation`, or `aria-pressed` output instead of Base UI-only attributes such as `data-open` or `data-pressed`.

## Decision Log

Decision: Keep these utility primitives Radix-backed in this slice.
Rationale: Current call sites rely on Radix `asChild`, Radix ToggleGroup `type="single"` behavior, Radix Collapsible open state, and Radix ScrollArea markup. The Program's recent primitive slices have successfully copied T3 recipes onto Radix adapters without adding `@base-ui/react`.
Date: 2026-05-14

Decision: Defer Sidebar to the app-shell/sidebar migration slice.
Rationale: Sidebar has no live imports today, while the next major Program milestone is a T3 sidebar-first protected app shell. Migrating Sidebar together with that shell will produce meaningful browser proof and avoid unproven static wrapper churn.
Date: 2026-05-14

## Outcomes & Retrospective

This slice moved the shared utility primitives closer to the T3 Code source recipes while keeping the current app's Radix and shared-library behavior. `ScrollArea` kept Radix Root/Viewport/Scrollbar/Thumb/Corner and added T3-compatible `scrollFade`, `scrollbarGutter`, `hideScrollbars`, and `chainVerticalScroll` controls. `CollapsibleContent` remains exported but now aliases the T3-compatible `CollapsiblePanel`, with height animation mapped to Radix `data-state` and `--radix-collapsible-content-height`. `Toggle` and `ToggleGroup` kept Radix pressed and single-selection behavior while mapping copied T3 pressed styling to `data-state="on"` and adding `ToggleGroupSeparator`. `Spinner` kept the existing loading role and label. `Empty` moved to the T3 media/title/description/content recipes and now exposes `data-slot="empty-media"`.

The focused unit test renders the primitives directly and reads source tokens to guard against accidental Base UI imports or copied Base UI-only state selectors. Representative live call-site integration coverage passed for the codebase page and workspace setup page. Desktop and mobile browser proof ran against a temporary `/codex-utility-proof` route on a local webpack dev server, verified the Collapsible panel, ToggleGroup item, ScrollArea viewport, Empty media, and Spinner state, and captured screenshots under ignored `codex-scripts/artifacts/`. The temporary route was deleted before final validation.

Sidebar stayed out of this slice. The file exists, but current app and test imports do not use it, so moving it with the protected app-shell/sidebar slice gives the Program a real call site and browser-proof target instead of static wrapper churn.

## Context and Orientation

The T3 Code source app is `/Users/bazelrex/Developer/t3code/apps/web`. The relevant source files are `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/scroll-area.tsx`, `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/collapsible.tsx`, `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/toggle.tsx`, `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/toggle-group.tsx`, `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/spinner.tsx`, and `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui/empty.tsx`.

The target shared files are `apps/web/src/components/ui/scroll-area.tsx`, `apps/web/src/components/ui/collapsible.tsx`, `apps/web/src/components/ui/toggle.tsx`, `apps/web/src/components/ui/toggle-group.tsx`, `apps/web/src/components/ui/spinner.tsx`, and `apps/web/src/components/ui/empty.tsx`. Live consumers include Dialog/Sheet panels, codebase theme advanced options, codebase scale fields, worker setup command selectors, lesson panels, Codex connection buttons, access-required buttons, and lesson empty states.

### In Scope

This plan updates the six utility primitive files above, adds focused tests under `apps/web/tests/unit`, reruns representative live call-site tests, and updates this ExecPlan plus `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`.

### Out Of Scope

This plan does not add `@base-ui/react`, migrate `apps/web/src/components/ui/sidebar.tsx`, rewrite the protected app shell, change generated codebase templates, update Telegram widget CSS, touch auth or checkout behavior, or alter codebase flow state. Any temporary browser proof route must not remain in the final diff.

## Plan of Work

First, validate this active plan with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-utility-primitives.md`.

Second, update `apps/web/src/components/ui/scroll-area.tsx`. Preserve the Radix root, viewport, scrollbar, thumb, corner, `className`, and children behavior. Add T3-compatible props `scrollFade`, `scrollbarGutter`, `hideScrollbars`, and `chainVerticalScroll`. Use T3 compact scrollbar classes adapted to Radix `data-orientation`.

Third, update `apps/web/src/components/ui/collapsible.tsx`. Preserve `Collapsible`, `CollapsibleTrigger`, and `CollapsibleContent`, add `CollapsiblePanel` as an alias, and adapt T3 panel height animation classes to Radix `data-state` plus `--radix-collapsible-content-height`.

Fourth, update `apps/web/src/components/ui/toggle.tsx` and `apps/web/src/components/ui/toggle-group.tsx`. Preserve current variants, sizes, `spacing`, `type`, `value`, `onValueChange`, and item exports. Copy T3 compact button recipes while replacing Base UI `data-pressed` selectors with Radix `data-state="on"` selectors. Add `ToggleGroupSeparator` if it maps cleanly to the existing `Separator` primitive.

Fifth, update `apps/web/src/components/ui/spinner.tsx` and `apps/web/src/components/ui/empty.tsx`. Keep Spinner's role and label behavior. Move Empty to the T3 spacing, media, title, description, content, and icon-card recipes while preserving existing export names.

Sixth, add focused tests. The meaningful user-facing risk is P2 normal product risk because these primitives affect live setup, codebase, and lesson UI, but this slice does not change persisted state, auth, checkout, billing, or external I/O. The source of truth is visible markup, class recipes, and live call-site behavior. Must work: Radix ScrollArea render, hide-scrollbar behavior, Collapsible `asChild`, Collapsible open state selectors, Toggle pressed state selectors, ToggleGroup single selection, Empty media/title/description rendering, and Spinner loading semantics.

Seventh, run desktop/mobile browser proof with a temporary local route or equivalent local proof harness, delete temporary route code before final validation, record validation results, complete this ExecPlan, move it to `docs/exec-plans/completed/2026-05-14-t3-code-utility-primitives.md`, and update the Program progress, completed ledger, and next slice.

## Milestones

Milestone 1 creates and validates the active ExecPlan. Success means the plan links to `planning-brief-4.md`, names the exact utility primitive files, and records the Sidebar split decision.

Milestone 2 migrates ScrollArea and Collapsible. Success means current exports keep compiling, new T3-compatible props and aliases exist, and rendered markup targets Radix state/orientation attributes.

Milestone 3 migrates Toggle, ToggleGroup, Spinner, and Empty. Success means ToggleGroup call sites keep their existing selection behavior while the visible controls and empty states carry T3 recipes.

Milestone 4 validates and records completion. Success means focused tests, app lint/typecheck, plan/program/docs lint, desktop/mobile browser proof or an exact limitation, and `git diff --check` pass, then the ExecPlan moves to completed and the Program ledger names the next slice.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Validate this plan before implementation:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-utility-primitives.md

Edit:

    apps/web/src/components/ui/scroll-area.tsx
    apps/web/src/components/ui/collapsible.tsx
    apps/web/src/components/ui/toggle.tsx
    apps/web/src/components/ui/toggle-group.tsx
    apps/web/src/components/ui/spinner.tsx
    apps/web/src/components/ui/empty.tsx
    apps/web/tests/unit/ui-utility-primitives.test.tsx
    docs/exec-plans/active/2026-05-14-t3-code-utility-primitives.md
    docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md

Run focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/ui-utility-primitives.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/workspace-setup-page.test.tsx

Run static and docs validation:

    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-utility-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-utility-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    git diff --check

If the plan is still active while running intermediate checks, use the active path for `plans:lint` and `markdown:lint`. Once it is moved to completed, use the completed path shown above.

## Validation and Acceptance

Acceptance requires ScrollArea, Collapsible, Toggle, ToggleGroup, Spinner, and Empty to keep existing imports and call-site behavior while carrying T3 Code recipes or documented Radix adaptations. No package or lockfile change should be needed. Focused tests must prove export compatibility, T3-only class tokens, Radix state mappings, and live render behavior for the utility primitives. Browser proof should cover a representative desktop and mobile render state or record why browser proof is not meaningful for the slice.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/ui-utility-primitives.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx tests/integration-ui/workspace-setup-page.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-utility-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-utility-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

## Idempotence and Recovery

The primitive edits are local and deterministic. If a T3 selector does not compile in this app, replace only that selector with the closest Tailwind-supported equivalent and record it in the Decision Log. If a current call-site type breaks, preserve the existing Radix public API instead of changing route behavior. Do not add `@base-ui/react` or replace current primitives in this slice without updating this plan first, adding dependency and lockfile changes, and running dependency validation. Do not touch generated-codebase output or Telegram widget CSS.

## Artifacts and Notes

Important source references:

    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/scroll-area.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/collapsible.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/toggle.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/toggle-group.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/spinner.tsx
    /Users/bazelrex/Developer/t3code/apps/web/src/components/ui/empty.tsx
    apps/web/src/components/ui/scroll-area.tsx
    apps/web/src/components/ui/collapsible.tsx
    apps/web/src/components/ui/toggle.tsx
    apps/web/src/components/ui/toggle-group.tsx
    apps/web/src/components/ui/spinner.tsx
    apps/web/src/components/ui/empty.tsx

No package or lockfile change should be needed because this slice deliberately avoids Base UI and reuses Radix.

Validation completed on 2026-05-14:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-14-t3-code-utility-primitives.md
    bun run format
    bun run --cwd apps/web test:unit -- tests/unit/ui-utility-primitives.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/codebase-page.test.tsx tests/integration-ui/workspace-setup-page.test.tsx
    bun run --cwd apps/web lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck
    PLAYWRIGHT_BASE_URL=http://localhost:3015 node codex-scripts/prove-utility-browser.mjs
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-14-t3-code-utility-primitives.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-14-t3-code-utility-primitives.md docs/programs/active/2026-05-14-t3-code-source-design-system-port
    bun lint
    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    git diff --check

Browser proof used a temporary local route and local webpack dev server at `http://localhost:3015/codex-utility-proof`, then deleted the route before final validation. Ignored screenshots were written to `codex-scripts/artifacts/utility-desktop.png` and `codex-scripts/artifacts/utility-mobile.png`.

Scope checks completed on 2026-05-14:

    rg -n "@base-ui/react|base-ui" apps/web/src/components/ui/{scroll-area.tsx,collapsible.tsx,toggle.tsx,toggle-group.tsx,spinner.tsx,empty.tsx} apps/web/package.json package.json bun.lock
    git diff --name-only -- packages/codebase-compiler templates docs/generated

## Interfaces and Dependencies

This slice depends on the existing `radix-ui` package, `class-variance-authority`, React 19, Tailwind CSS v4 selector support, `tailwind-merge` through `cn`, and the T3 Code token foundation in `apps/web/src/app/globals.css`. ScrollArea remains used by Dialog, Sheet, and lesson panels. Collapsible remains used by codebase and worker setup panels. ToggleGroup remains used by codebase scale fields and worker package-manager selection. Spinner remains the shared loading indicator. Empty remains the shared empty-state primitive.
