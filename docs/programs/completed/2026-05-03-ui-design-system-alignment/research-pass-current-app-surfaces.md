---
title: 'Current App Surfaces Research Pass'
summary: 'Research pass mapping the current app token sources, primitive components, and visible drift areas for UI design-system alignment.'
docType: 'program_research'
status: 'active'
read_when:
  - 'Auditing current app UI before a design-system slice.'
  - 'Checking which files own colors, typography, spacing, and component primitives.'
---

# Current App Surfaces Research Pass

Root `DESIGN.md` is the canonical visual source of truth. It already says the shared app shell and component library use a neutral shadcn-based token system defined in `apps/web/app/globals.css`, while marketing illustrations and docs add warmer brand expression on top. The new `docs/design-docs/ui-design-library.md` is linked from root `DESIGN.md`, `docs/DESIGN.md`, and `docs/design-docs/index.md`.

The implemented token source is `apps/web/app/globals.css`. It defines the Tailwind theme mappings, app fonts, radius scale, light and dark semantic colors, body base text style, code typography, selection colors, and utility font classes. It currently applies `letter-spacing: -0.02em` to `body`, which conflicts with the screenshot-grounded app UI rule that operational controls and dense product text should use `0` letter spacing. That conflict belongs to the typography slice, not the first color slice, unless a color implementation has to touch the same body rule.

The shared component primitives already align with much of the screenshot language. `apps/web/components/ui/button.tsx` uses compact `h-8` default buttons, `h-7` small buttons, and `size-8` icon buttons. `apps/web/components/ui/input.tsx`, `textarea.tsx`, `select.tsx`, `card.tsx`, `tabs.tsx`, `dropdown-menu.tsx`, `dialog.tsx`, and `sidebar.tsx` mostly route through semantic tokens like `background`, `foreground`, `muted`, `accent`, `border`, `input`, `ring`, and `sidebar-*`.

The current scan found several categories of color drift. `apps/web/app/globals.css` is the expected home for OKLCH and base hex tokens. `apps/web/app/_content/home-page.ts` contains brand integration colors for Vercel, Linear, Notion, Stripe, Supabase, Framer, Raycast, and Cursor; those are intentional content colors and should not be normalized into UI neutrals. Homepage Figma-derived sections such as `codebase-demo-codebase-branch.tsx`, `codebase-demo-leverage-hero.tsx`, and `codebase-demo-section.tsx` contain intentional hard-coded editorial colors. Generic components such as `apps/web/components/ui/cover.tsx` and `apps/web/components/ui/pointer-highlight.tsx` still include hard-coded neutral utilities and need classification before reuse in protected app surfaces.

Workspace and protected route surfaces are the highest-value audit targets after the token layer. Useful paths include `apps/web/app/(workspace)/_components/app-shell/`, `apps/web/app/(workspace)/_components/workspace-navigation/`, `apps/web/app/(workspace)/_components/codebase-flow/`, `apps/web/app/(workspace)/_components/codex-connection-card/`, `apps/web/app/(workspace)/settings/`, `apps/web/app/checkout/success/_components/`, and `apps/web/app/(identity)/_components/`.

The custom homepage editorial graphics, typography, and art-direction sections are explicit exclusions from normalization. This includes the `Install leverage` / `the loop repeats TOMORROW` hero in `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-leverage-hero.tsx` and `productPreviewSection.leverageHero` in `apps/web/app/_content/home-page.ts`; the `Exec Loops: OpenAI's WEAPON of choice` section represented by `homePageContent.sprintPathSection` and `apps/web/app/_components/home-page/sections/sprint-path-unified-section.tsx`; and the worker/how-workers-work style sections around `homePageContent.execLoopSection`, `apps/web/app/_components/home-page/sections/exec-loop-section.tsx`, and `apps/web/app/_components/home-page/sections/exec-loop/exec-loop-visual.tsx`. Later slices can use those routes for regression proof, but they should not restyle those custom graphics, font treatments, or section art as part of this Program.

The current worktree already contains unrelated app UI edits and image assets from another slice. Any implementation of this Program must run `git status --short` first, preserve unrelated changes, and avoid broad formatting churn that would obscure ownership.
