---
title: "T3 Code Target Normalized Pass"
summary: "Normalized target state for the T3 Code design-system migration."
docType: "normalized_pass"
status: "active"
read_when:
  - "Writing child ExecPlans for the T3 Code design-system port."
  - "Checking the intended target without reading the full research pass."
---

# T3 Code Target Normalized Pass

## Target Principles

- T3 Code is the visual source of truth for every Ship by Sunday web UI surface, including generated codebase output.
- Ship by Sunday branding, names, logos, and product language stay ours.
- Use DM Sans as the primary UI font.
- Use T3 Code's blue primary, zinc/neutral surfaces, semantic status tokens, alpha-based muted/accent surfaces, and additive radius system.
- Use class-based `.dark` mode with matching T3 Code light and dark token values.
- Prefer T3 Code Base UI primitive implementations and recipes over current Radix primitive styling.
- Preserve product behavior while replacing visual structure.
- Treat current design docs as stale unless updated to the T3 Code contract.

## Target Foundations

`apps/web/src/app/globals.css` should become the tracked app's T3 Code token surface. It should preserve required imports for Next.js, Clerk, and app dependencies only where they do not fight the T3 Code contract. Font loading should move to DM Sans through `next/font/google` or another Next-compatible route. The current generated design-system style injection should not override T3 Code tokens in the tracked app.

Dark mode should stay predictable for Next.js. The likely implementation path is to keep `next-themes` as the app integration point while adopting T3 Code's `.dark` token semantics and transition suppression behavior. Docs-specific theme state should be reconciled into the same class-based source rather than living as a separate product-theme island.

## Target Primitives

The shared primitive target is T3 Code's `base-mira` feel:

- Buttons: compact heights, rounded-lg geometry, subtle shadows, blue primary, ghost/outline/secondary/destructive variants, lucide icon sizing, pointer-coarse affordances, and strong focus-visible rings.
- Cards: rounded-2xl, token border, `bg-card`, restrained shadow, and optional card-frame grouping.
- Inputs and textareas: small heights, wrapper support where needed, dark `bg-input/32`, clear focus rings, and T3 Code placeholder/disabled states.
- Badges: compact semantic variants for info, success, warning, destructive/error, outline, secondary, and default.
- Dialogs, sheets, popovers, menus, command, tooltip, toast, select, checkbox, radio, switch, field, fieldset, input group, skeleton, spinner, and sidebar should follow T3 Code's Base UI recipes or documented adaptations.

Any compatibility shim for current `asChild` or Radix export names must be deliberate and temporary.

## Target Surfaces

Protected app shell should move toward T3 Code's sidebar-first app shell. The current top-header plus local rail should not remain the dominant product chrome unless a child ExecPlan documents a specific exception.

Marketing, docs, blog, starter, workers, and Worker Seal Team 6 public pages should drop the current serif editorial design language and use T3 Code typography, tokens, buttons, cards, dense product layout, and dark/light behavior.

Codebase flow, worker setup, worker findings, worker doctor pass, runs/loops, support/admin pages, tutorials, course screens, auth pages, and checkout success should migrate to T3 Code primitives and shell structure while preserving behavior and route protection.

The Telegram widget should expose its own package-level T3 Code CSS variable bridge and render correctly in light and dark mode.

## Generated Codebase Target

Generated codebases should eventually use the same T3 Code source contract. That includes:

- `packages/codebase-compiler`
- `templates/starter-app`
- `docs/generated`
- generated customer repo starter templates
- compiler design-preset catalog or generated design-system output

Generated output should be sequenced after the app foundation and primitive strategy are stable. When touched, source and generated mirrors must stay synced through the generator path rather than one-off edits to generated mirrors.
