---
title: 'Design System Alignment Normalized Pass'
summary: 'Normalized track for ordering UI design-system alignment into color, typography, spacing, controls, and proof slices.'
docType: 'program_normalized_pass'
status: 'active'
read_when:
  - 'Choosing the next design-system alignment slice.'
  - 'Checking why color is first and which follow-up slices remain.'
---

# Design System Alignment Normalized Pass

The Program should move from most visible and least invasive to more structural. Color comes first because the token source is centralized, the screenshots make the desired light and dark roles clear, and many shared primitives already consume semantic color tokens. A color pass can improve the app feel without touching data flow or redesigning every component.

Typography should be second. The screenshots prefer `14px` default app text and `0` operational tracking, while the current global body rule applies negative letter spacing and many surfaces use custom arbitrary text sizes. That pass should decide where marketing/editorial tracking remains allowed and where app UI resets to a tighter role scale.

Spacing and control geometry should be third. The component primitives are already close to the screenshot targets, but app surfaces use a mixture of `h-7`, `h-8`, `h-9`, `h-10`, `h-11`, `h-14`, `h-16`, custom radii, and card treatments. This pass should normalize reusable primitives and selected workspace surfaces without flattening hero CTAs or marketing exceptions.

Route-level audit and screenshot proof should be the final alignment slice. After tokens, type, spacing, and controls are coherent, each representative surface should be verified in light and dark mode on desktop and mobile. The proof should include the public homepage only as a regression surface, while protected workspace, codebase, settings, checkout success, and review surfaces carry the core app UI quality bar.

Each slice should update `docs/design-docs/ui-design-library.md` only when implementation reveals a better durable rule. The library should not be rewritten for one-off exceptions.
