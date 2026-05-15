---
title: "T3 Code Source Design System Cross Repo Review"
summary: "Cross-repo review notes for copying the T3 Code app design system into Ship by Sunday."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Checking which T3 Code patterns are being imported."
  - "Reviewing risks from copying T3 Code UI into Ship by Sunday."
---

# T3 Code Source Design System Cross Repo Review

## Reusable Patterns

T3 Code patterns to import or adapt:

- Tailwind v4 `@theme inline` token structure from `src/index.css`.
- `@custom-variant dark (&:is(.dark, .dark *))`.
- DM Sans UI typography and SF Mono-style code typography.
- `base-mira`, zinc base color, blue primary, semantic status colors, and additive radius values.
- Base UI primitive implementations under `src/components/ui`.
- Sidebar-first app shell and resizable sidebar behavior.
- Chat view and rounded composer treatment.
- Settings row/card density.
- Markdown/code/diff styling where current app has comparable surfaces.
- Transition suppression during theme changes.

## Patterns To Adapt

T3 Code is Vite/TanStack Router and includes desktop bridge behavior. Ship by Sunday should adapt visual and primitive patterns to Next.js App Router, `next-themes`, Clerk, Convex, and current route protection.

T3 Code primitives use `~/` aliases and Base UI `render` APIs. Ship by Sunday uses `@/` aliases and many Radix `asChild` call sites. The migration should choose compatibility deliberately instead of doing a blind file copy that breaks existing routes.

T3 Code's full-height app assumes `body { overflow: hidden; }`. Ship by Sunday has marketing pages, docs, and app routes with different scroll needs. Child slices should copy the visual shell while preserving route-specific scrolling where required.

## Patterns To Avoid Preserving

- Current Inter/Berkeley/Instrument/Bebas visual hierarchy.
- Current root design docs that say to preserve the old visual system.
- Generated design-system CSS injection as a global override in the tracked app.
- Route-local hardcoded marketing colors and serif H1 styling.
- Docs-specific theme island that drifts from app `.dark`.
- Hardcoded dark-only Telegram widget styling.

## Review Risks

- A partial primitive migration can create broken imports because T3 and Ship expose different component APIs.
- A global CSS swap can break marketing scroll, docs layout, or protected app shell height if copied without Next.js adaptation.
- Removing generated design CSS can affect codebase preview/configurator UI that currently expects those variables.
- Auth and checkout surfaces may look visual-only but carry behavior and release risk.
- Telegram package changes require package-level validation, not only app validation.
- Generated codebase work adds compiler/template proof burden and should wait until current-app tokens and primitive decisions are stable.

## Review Conclusion

T3 Code is a strong source repo for the requested look, but Ship by Sunday should copy it as a design-system migration, not as a framework migration or brand replacement. The safe rule is: T3 Code visuals and primitives win; Ship by Sunday branding stays; Next.js product behavior stays proven; generated customer output follows once the source contract is stable.
