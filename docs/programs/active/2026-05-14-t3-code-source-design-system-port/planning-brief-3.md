---
title: "T3 Code App Foundation Planning Brief 3"
program_id: "t3-code-source-design-system-port"
brief_version: 3
status: "current"
summary: "Next slice for tracked-app fonts, tokens, dark/light mode, and generated-design override removal after structural source adoption proof."
read_when:
  - "Writing the app foundation child ExecPlan for the T3 Code migration."
  - "Changing apps/web global CSS, font loading, or root layout theme injection."
---

# T3 Code App Foundation Planning Brief 3

## Slice

App foundation: fonts, tokens, dark/light mode, and tracked-app generated-design override removal.

## Desired Outcome

Install the first tracked-app runtime foundation that makes T3 Code's look win globally in `apps/web`, now that the Program has stopped treating old design/frontend doctrine and underscore route-local folders as the source.

At the end of the slice, `apps/web` should load DM Sans as the primary UI font, expose T3 Code-compatible light and dark CSS tokens, use T3 Code additive radius semantics, keep class-based `.dark` behavior through `next-themes`, and stop injecting old generated design-system CSS over the tracked app's global tokens.

This is still not the shared primitive or broad route rewrite slice. It should make the foundation true and leave old route-local visual islands as later migration inventory.

## Scope

In scope:

- `apps/web/src/app/fonts.ts`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/lib/generated-design-system-css.ts` only if needed to remove tracked-app runtime injection without breaking generated-output tests
- focused app tests or static checks that prove the root layout and generated-design CSS boundaries still compile
- Program progress and next-slice updates

Out of scope:

- shared primitive port
- app shell rewrite
- broad marketing, docs, tutorials, auth, checkout, or worker route rewrites
- generated-codebase compiler/template migration
- Telegram widget migration
- deleting compatibility font utilities still used by unmigrated routes
- applying T3 Code's global `body { overflow: hidden; }` to the entire Next app

## Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/structure-map-t3-code-to-ship-by-sunday.md`
- `/Users/bazelrex/Developer/t3code/apps/web/src/index.css`
- `/Users/bazelrex/Developer/t3code/apps/web/components.json`
- `/Users/bazelrex/Developer/t3code/apps/web/src/hooks/useTheme.ts`
- `apps/web/src/app/fonts.ts`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/lib/generated-design-system-css.ts`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- `apps/web` loads DM Sans for the canonical `font-sans` path while preserving compatibility variables only where old routes still need them.
- Global CSS uses T3 Code-compatible light/dark semantic tokens, status tokens, and additive radii.
- `.dark` remains class-based and compatible with `next-themes`.
- The tracked app root layout no longer injects the old generated design-system CSS style block.
- Generated-codebase output is not silently changed in this slice; any generated-design helper tests are kept aligned with the tracked-app boundary decision.
- Focused app lint/typecheck/build and Program/plan/docs checks pass, or blockers are recorded in the child ExecPlan.

## Watchpoints

- Do not preserve the old Inter/Berkeley/Instrument visual doctrine as canonical.
- Do not delete compatibility font variables until route-level migrations remove all call sites.
- Do not let the old generated design-system bridge override the tracked app's T3 global tokens.
- Do not break Clerk, Convex, `next-themes`, Toaster, or root layout provider ordering.
- Do not copy T3 Code's global overflow lock into the Next app without route-level proof for marketing and docs scroll.
- Do not implement generated customer repo app foundation in this slice.
