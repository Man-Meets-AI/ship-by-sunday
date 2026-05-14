---
title: "T3 Code Source Design System Planning Brief 1"
program_id: "t3-code-source-design-system-port"
brief_version: 1
status: "superseded"
summary: "First planning brief for the design source contract and foundation slice."
read_when:
  - "Writing the first child ExecPlan for the T3 Code design-system Program."
  - "Starting the foundation slice for the visual-system replacement."
---

# T3 Code Source Design System Planning Brief 1

## Slice

Design source contract and foundation.

## Desired Outcome

Make T3 Code the checked-in visual source of truth for the tracked Ship by Sunday app and establish the runtime foundation that later primitive and surface migrations can build on.

The first implementation slice should end with the old design doctrine no longer being canonical, the tracked app loading DM Sans, T3 Code-compatible light/dark tokens present in global CSS, and no generated design-system injection overriding those tokens. It should also record that generated codebases are part of the broader Program, even if their implementation waits for a later slice.

## Scope

In scope:

- `DESIGN.md`
- `docs/DESIGN.md`
- `docs/FRONTEND.md`
- `docs/ship-by-sunday/design-pack/README.md`
- `docs/ship-by-sunday/design-pack/AGENTS.md`
- `docs/ship-by-sunday/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/PLANS.md`
- `docs/ship-by-sunday/design-pack/documentation.md`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/fonts.ts`
- `apps/web/src/app/layout.tsx`
- app runtime generated design-system CSS bridge only where it affects the tracked app
- focused proof route or screenshot showing light and dark token application

Out of scope:

- implementing `packages/codebase-compiler` changes in this first slice
- implementing `templates/starter-app` changes in this first slice
- regenerating `docs/generated` in this first slice
- implementing generated customer repo design presets in this first slice
- implementing generated customer repo starter templates in this first slice
- full primitive migration
- broad marketing or dashboard route rewrites
- Telegram widget migration

## Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/research-pass-t3-code-and-current-ui.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/normalized-pass-t3-code-target.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/converged-decision-packet.md`
- `/Users/bazelrex/Developer/t3code/apps/web/src/index.css`
- `/Users/bazelrex/Developer/t3code/apps/web/components.json`
- `/Users/bazelrex/Developer/t3code/apps/web/src/hooks/useTheme.ts`
- `apps/web/AGENTS.md`
- `docs/ship-by-sunday/design-pack/AGENTS.md`

## Acceptance

- The child ExecPlan records `program_id: "t3-code-source-design-system-port"` and this planning brief path.
- Root and supporting design docs name T3 Code as the visual source of truth.
- Old Inter/Berkeley/Instrument/Bebas design doctrine is removed or demoted from current canonical guidance.
- `apps/web` loads DM Sans for primary UI typography.
- Global light and dark tokens match or intentionally adapt T3 Code values.
- The tracked app does not inject old generated design-system CSS over the new global tokens.
- Generated customer repo and compiler paths are identified as later-slice scope, not permanent exclusions.
- At least one light and one dark visual proof surface confirms the foundation renders.
- Focused static checks for touched docs and app files pass, or blockers are recorded.

## Watchpoints

- Do not start porting every primitive before the source contract and global token layer are stable.
- Do not leave docs that tell future agents to preserve the old visual system.
- Do not break Clerk, Convex, or route layout providers while editing root layout.
- Do not apply T3 Code's `body { overflow: hidden; }` globally without checking marketing/docs scrolling.
- Do not implement generated customer repo surfaces in this slice unless the ExecPlan explicitly expands to include the required compiler/template source and generated-mirror validation.
