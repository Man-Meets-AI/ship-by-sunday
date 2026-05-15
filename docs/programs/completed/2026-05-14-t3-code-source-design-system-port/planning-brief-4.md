---
title: "T3 Code Shared Primitive Planning Brief 4"
program_id: "t3-code-source-design-system-port"
brief_version: 4
status: "superseded"
summary: "Next slice for moving shared UI primitives toward the T3 Code Base UI source after app foundation tokens landed."
read_when:
  - "Writing the shared primitive child ExecPlan for the T3 Code migration."
  - "Changing apps/web shared primitives, shadcn component wrappers, or primitive dependencies."
---

# T3 Code Shared Primitive Planning Brief 4

## Slice

Shared primitive migration: port or adapt T3 Code's primitive source into Ship by Sunday's shared UI layer.

## Desired Outcome

Make `apps/web/src/components/ui` start behaving like the T3 Code primitive source instead of the current Radix/shadcn-neutral stack. The app foundation slice already made DM Sans, T3 Code tokens, additive radii, and tracked-app root layout true. The next slice should move the reusable controls that every screen composes from: buttons, cards, inputs, badges, dialogs, sheets, menus, tooltips, toasts, command surfaces, and form-control scaffolding.

This slice should be source-driven. Start from `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui`, `/Users/bazelrex/Developer/t3code/apps/web/components.json`, and current `apps/web/src/components/ui`. T3 Code uses Base UI patterns and `base-mira` class recipes, while Ship by Sunday call sites currently expect Radix-style exports and `asChild` behavior. Decide deliberately which primitives can be ported literally, which need compatibility adapters, and which must wait for route-level call-site migration.

## Scope

In scope:

- inventory T3 Code primitive files and current Ship by Sunday primitive files
- dependency review for Base UI or other primitive packages that T3 Code uses
- a bounded first implementation pass for the safest shared primitives
- compatibility decisions for existing call sites that still expect current APIs
- focused primitive tests or render tests for changed components
- Program progress and next-slice updates

Out of scope:

- broad app shell rewrite
- route-by-route marketing, docs, tutorial, auth, checkout, or worker page redesigns
- generated-codebase compiler/template migration
- Telegram widget migration
- removing Next route groups
- deleting old primitive APIs without proving all call sites have moved

## Inputs

- `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/structure-map-t3-code-to-ship-by-sunday.md`
- `/Users/bazelrex/Developer/t3code/apps/web/components.json`
- `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui`
- `/Users/bazelrex/Developer/t3code/apps/web/src/lib/utils.ts`
- `apps/web/src/components/ui`
- `apps/web/package.json`
- `bun.lock`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- The plan identifies the exact primitive files to change and their compatibility strategy.
- At least one meaningful primitive family moves toward the T3 Code implementation or class recipe without breaking current call sites.
- Any dependency additions are reflected in `apps/web/package.json` and the lockfile, with narrow dependency validation.
- Focused primitive/render tests pass for changed primitives.
- `bun run --cwd apps/web lint`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run --cwd apps/web typecheck`, Program/plan lint, markdown lint, and `git diff --check` pass or blockers are recorded.

## Watchpoints

- T3 Code primitives use Base UI APIs such as `render`; many current call sites may expect Radix `asChild`.
- Do not convert every primitive blindly in one pass. Keep the first primitive slice bounded and verifiable.
- Do not use token-only imitation as a substitute for copying the actual T3 Code primitive class recipes.
- Preserve auth, checkout, and protected route behavior while shared controls change.
- Do not start generated customer repo primitive migration before the tracked app primitive strategy is proven.
