---
program_id: "t3-code-source-design-system-port"
title: "T3 Code Source Design System Port"
status: "active"
created_at: "2026-05-14"
completed_at: null
summary: "Replace Ship by Sunday's current and generated web-facing visual systems and app implementation shape with the T3 Code app while keeping Ship by Sunday branding."
post_build_recap: null
read_when:
  - "Planning or executing the T3 Code visual-system migration for Ship by Sunday."
  - "Changing app UI, marketing pages, docs chrome, tutorials, worker surfaces, shadcn primitives, the Telegram widget, or generated codebase UI."
  - "Deciding whether current Ship by Sunday design doctrine or the T3 Code source should win."
---

# T3 Code Source Design System Port

This Program is the living initiative document for replacing Ship by Sunday's current web-facing design system and browser-app implementation shape with the T3 Code app.

Maintain this Program in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday should stop blending its existing visual system and app structure with T3 Code. The target is to make `/Users/bazelrex/Developer/t3code/apps/web` the source of truth for every web-facing Ship by Sunday UI surface: file shape, component organization, colors, typography, spacing rhythm, primitive styling, dark mode, light mode, shell chrome, dense operational surfaces, command/settings patterns, chat/composer treatment, and generated-codebase app output.

This Program exists because the reset spans more than one implementation slice. It touches repo instructions, old design/frontend doctrine docs, `apps/web` file layout, `apps/web` global CSS and font loading, shared primitives, protected app shell, marketing pages, docs chrome, blog prose, worker dashboards, tutorials/course surfaces, checkout/auth surfaces, the standalone Telegram widget package, and generated codebase runtime/templates/docs.

Ship by Sunday branding stays. The migration should not copy T3 Code's product name, wordmark, logos, copy identity, or app-specific domain language. It should adopt T3 Code's design system and interaction feel around Ship by Sunday's own brand and product language.

Generated customer repositories are in scope for this Program as later slices. `packages/codebase-compiler`, `templates/starter-app`, generated customer repo templates, generated customer docs, and compiler design-preset output should eventually produce T3 Code-styled generated codebases. These surfaces should still be sequenced after the current app foundation and primitive source are stable.

The guiding rule is simple: when the current Ship by Sunday design docs, frontend docs, implementation-folder conventions, or components conflict with T3 Code, T3 Code wins.

## Program Inputs

- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/research-pass-t3-code-and-current-ui.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/normalized-pass-t3-code-target.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/converged-decision-packet.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/dependency-graph.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/plan-split-recommendation.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/cross-repo-review.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-1.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-2.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-3.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/planning-brief-4.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/structure-map-t3-code-to-ship-by-sunday.md`
- `docs/programs/active/2026-05-14-t3-code-source-design-system-port/current-planning-brief.txt`
- T3 Code source app: `/Users/bazelrex/Developer/t3code/apps/web`
- Current web app: `apps/web`
- Current widget package: `packages/telegram-chat-widget`
- Generated codebase compiler: `packages/codebase-compiler`
- Generated app template: `templates/starter-app`
- Generated documentation mirrors: `docs/generated`
- Retired doctrine and cleanup targets: `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, and `docs/ship-by-sunday/design-pack/`

## Current State

T3 Code uses a CSS-first Tailwind v4 system with `base-mira`, `baseColor: zinc`, lucide icons, DM Sans, additive radius tokens, a blue primary accent, semantic `info/success/warning/destructive` tokens, class-based `.dark` mode, Base UI primitives, and a dense app shell built around a resizable sidebar and compact chat/workspace surfaces.

T3 Code also uses a simpler browser-app source shape: plain directories such as `src/components`, `src/hooks`, `src/lib`, `src/routes`, `src/rpc`, `src/environments`, and `src/observability`, plus plain feature files and colocated `.logic.ts` and `.test.ts` files. It does not use Ship by Sunday's deep Next App Router private implementation folders as a general pattern.

Ship by Sunday currently uses Inter, Berkeley Mono, Instrument Serif, and Bebas Neue; neutral shadcn tokens; `radix-nova`; Radix-style primitives; `next-themes`; generated design-system CSS injection; a top-header AppShell with optional local rail; a separate docs CSS theme island; and route-local marketing/blog/home sections with old art direction. The standalone Telegram widget package has a mostly hardcoded dark theme that only partially maps to host tokens.

Ship by Sunday also currently puts a large amount of implementation under underscore folders in `apps/web/src/app`: `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, and `_metadata`. These folders are replacement inventory. Next.js route groups such as `(auth)`, `(marketing)`, and `(app)` are not the target of this cleanup; they can stay when they are useful framework organization.

Generated codebase output currently has its own visual stack through `packages/codebase-compiler`, `templates/starter-app`, generated design-system facts, starter template globals, starter primitives, and customer-facing generated docs. Those surfaces are no longer excluded; they should be migrated after the canonical current-app T3 Code foundation is stable.

The largest technical mismatch is not Tailwind. Both apps are Tailwind 4. The mismatch is T3 Code's Base UI plus `base-mira` primitive system versus Ship by Sunday's Radix plus generated design-system layer.

## Progress

- [x] 2026-05-14: Audited T3 Code's design source files, theme tokens, font stack, primitive system, app shell, chat composer, settings surfaces, and theme hook.
- [x] 2026-05-14: Audited Ship by Sunday's current global CSS, font loading, generated design-system bridge, primitives, marketing/docs/blog routes, AppShell, worker dashboards, tutorials, and Telegram widget package.
- [x] 2026-05-14: Created this active Program packet and first planning brief.
- [x] 2026-05-14: Expanded scope to every available screen plus generated codebases while keeping Ship by Sunday branding.
- [x] 2026-05-14: Hardened the research pass with exact source references for T3 Code tokens, primitives, theme behavior, Ship by Sunday overrides, app shell, docs theme island, Telegram widget CSS, and generated-codebase sources.
- [x] 2026-05-14: Clarified that the Program includes T3 Code file/directory shape, not just visual styling. Next.js route groups may stay; underscore implementation folders are cleanup targets.
- [x] 2026-05-14: Added `planning-brief-2.md` and `structure-map-t3-code-to-ship-by-sunday.md` to steer the next slice toward structure and doctrine retirement before token work.
- [x] 2026-05-14: Completed `docs/exec-plans/completed/2026-05-14-t3-code-structural-source-adoption.md`, moving Worker Seal Team 6 Cal booking from route-local underscore folders to `apps/web/src/components/workerSealTeam6` and aligning app structure docs.
- [x] 2026-05-14: Added `planning-brief-3.md` for the app foundation slice and pointed `current-planning-brief.txt` at it.
- [x] 2026-05-14: Completed `docs/exec-plans/completed/2026-05-14-t3-code-app-foundation.md`, making DM Sans, T3 Code light/dark tokens, additive radii, and removal of tracked-app generated-design CSS injection the `apps/web` foundation.
- [x] 2026-05-14: Added `planning-brief-4.md` for the shared primitive slice and pointed `current-planning-brief.txt` at it.
- [x] 2026-05-14: Completed `docs/exec-plans/completed/2026-05-14-t3-code-button-badge-primitives.md`, moving Button and Badge to T3 Code class recipes while preserving current Radix `asChild` call-site compatibility.
- [x] 2026-05-14: Completed `docs/exec-plans/completed/2026-05-14-t3-code-display-primitives.md`, moving Card, Alert, Skeleton, and Kbd to T3 Code display primitive recipes while preserving current call-site aliases.
- [x] 2026-05-14: Completed `docs/exec-plans/completed/2026-05-14-t3-code-input-textarea-primitives.md`, moving Input and Textarea to T3 Code form-control wrappers with native compatibility escape hatches.

## Decision Log

Decision: Treat T3 Code as the design source of truth.
Rationale: The user explicitly prefers T3 Code for everything in the current product. Existing Ship by Sunday design doctrine should be treated as replacement inventory, not a constraint.

Decision: Treat T3 Code as the browser-app structure source too.
Rationale: The requested reset is not only visual. Ship by Sunday's underscore-heavy implementation folders keep the old codebase shape alive even if tokens change. T3 Code's plain module structure is the target where Next.js permits it.

Decision: Keep useful Next.js route groups while cleaning up underscore implementation folders.
Rationale: `(auth)`, `(marketing)`, and `(app)` are framework route organization. The disliked pattern is the internal `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, and `_metadata` implementation shape.

Decision: Keep Ship by Sunday branding while adopting T3 Code's design system.
Rationale: The user wants the T3 Code look and feel, not T3 Code's brand identity. Ship by Sunday names, logos, product language, and customer promises remain ours.

Decision: Include generated codebases in this Program.
Rationale: The same design reset should apply to generated customer apps. Generated codebase work is a later slice because it depends on stable current-app tokens, primitives, and docs, but it is not a separate excluded effort.

Decision: Prefer a literal T3 Code primitive port over a token-only imitation.
Rationale: T3 Code's look comes from Base UI primitive implementations, component class recipes, focus/hover geometry, dense sidebar chrome, and composer/card structure. Copying only color variables would leave Ship by Sunday's current UI shape intact.

Decision: Keep Next.js and `next-themes` where they are app architecture, but adapt them to T3 Code's visual contract.
Rationale: T3 Code is Vite/TanStack Router and includes desktop-window theme behavior. Ship by Sunday is a Next.js app. The visual source should be copied; framework-specific runtime plumbing should be adapted where needed.

Decision: Remove or neutralize the current generated design-system CSS bridge in the tracked app if it overrides T3 Code tokens.
Rationale: A runtime style block sourced from the old generated design system can silently undo the T3 Code palette, radius, and font decisions.

Decision: Rebuild docs and marketing surfaces instead of trying to preserve their current editorial serif language.
Rationale: The current public surfaces are part of the disliked visual system. They should inherit T3 Code density, typography, token usage, and product-tool feel.

Decision: Retire `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, and the old design-pack docs as doctrine.
Rationale: Keeping those files as active doctrine steers agents back toward the old system. During the migration, they should be redirects or cleanup targets until references are removed.

Decision: Treat auth, checkout, and billing-adjacent UI as risky even when the change is visual.
Rationale: Those screens carry P0/P1 product flows. Visual rewrites must preserve route behavior, auth boundaries, and checkout recovery behavior.

## Slice Ledger

Active child ExecPlans:

- `docs/exec-plans/active/2026-05-14-t3-code-form-scaffold-controls.md`: port Field, Label, Separator, Checkbox, Switch, and RadioGroup to T3 Code recipes while preserving current Radix call-site compatibility.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-14-t3-code-structural-source-adoption.md`: retired old doctrine routing as active guidance, added the structural source map, preserved Next route groups, and proved one underscore implementation-folder migration by moving Worker Seal Team 6 Cal booking into plain component modules.
- `docs/exec-plans/completed/2026-05-14-t3-code-app-foundation.md`: installed the tracked app foundation by loading DM Sans, copying T3 Code-compatible light and dark tokens, additive radius semantics, no-transition/noise/scrollbar base styles, and removing generated-design CSS injection from the Next root layout.
- `docs/exec-plans/completed/2026-05-14-t3-code-button-badge-primitives.md`: copied T3 Code Button and Badge class recipes into the shared primitives while keeping existing variants, sizes, and `asChild` behavior compatible.
- `docs/exec-plans/completed/2026-05-14-t3-code-display-primitives.md`: copied T3 Code Card, Alert, Skeleton, and Kbd recipes into the shared primitives while keeping `CardContent`, `Alert variant="destructive"`, className passthrough, and `KbdGroup` compatibility.
- `docs/exec-plans/completed/2026-05-14-t3-code-input-textarea-primitives.md`: copied T3 Code Input and Textarea wrapper/control recipes into native compatibility primitives while keeping native props, refs, and explicit native field class escape hatches.

Planned child slices:

- Shared primitive migration: port or adapt T3 Code Base UI primitives into `apps/web/src/components/ui`, add dependencies, and preserve call-site compatibility deliberately.
- App shell and operational dashboard migration: replace the current AppShell/header/local-rail feel with a T3 Code sidebar-first shell across protected app, codebase flow, workers, settings, support, and admin surfaces while moving implementation out of underscore folders.
- Public surfaces migration: rebuild marketing pages, homepage sections, docs chrome, blog prose, starter/workers pages, and public support surfaces with the T3 Code system.
- Course, tutorials, auth, checkout, and edge-surface sweep: convert the remaining user-facing route islands and high-risk screens with targeted behavior proof.
- Telegram widget visual migration: update `packages/telegram-chat-widget` CSS and any package UI assumptions so the widget supports T3 Code light and dark mode.
- Generated codebase migration: update `packages/codebase-compiler`, `templates/starter-app`, generated design facts, generated customer docs, and generated app primitives/templates so downloaded codebases inherit the T3 Code system.
- Visual proof and cleanup: remove old font utilities, stale design-pack conflicts, and remaining avoidable underscore implementation folders; run desktop/mobile browser proof; and lock the new source in Program/docs.

## Next Slice

The next recommended slice is `Form and selection primitive migration`.

That slice should continue using `planning-brief-4.md` and move the next form and selection primitive family toward T3 Code. Good candidates are Field, Label, Checkbox, Switch, RadioGroup, Select, Popover, Tooltip, and Separator. This is the point where Base UI dependency adoption should be decided deliberately, because T3 Code's heavier interactive primitives rely on Base UI APIs more than the primitive slices completed so far.

That slice does not need to implement generated-codebase changes. Generated codebase implementation should wait until the tracked app primitive strategy is proven.

## Risks and Watchpoints

- A token-only patch will not achieve the requested outcome. T3 Code's primitive implementations and shell structure are part of the source.
- A visual-only patch will not achieve the requested outcome. T3 Code's directory and file shape are also part of the source.
- Next.js route groups such as `(auth)`, `(marketing)`, and `(app)` should not be removed merely because T3 Code is not a Next app.
- Underscore implementation folders are the cleanup target. Do not add new `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, or `_metadata` folders in migrated areas.
- The current generated design-system bridge can override copied tokens unless it is removed or changed for the tracked app.
- T3 Code primitives use Base UI APIs such as `render`, while current call sites often assume Radix `asChild` and Radix export names.
- Dark mode is currently split between global `next-themes`, docs-specific theme cookies/attributes, Prism/code styles, app-shell toggles, and widget CSS.
- Auth, checkout, billing success, support/admin indicators, and protected app shell UI must preserve behavior while their visuals change.
- The old `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, and design-pack docs will actively mislead future agents unless retired or routed away early.
- The Telegram widget is standalone package CSS and will not automatically inherit app primitive changes.
- Generated codebase work depends on stable app tokens and primitive decisions. Do not start compiler/template rewrites before the T3 Code contract is clear.

## Outcomes & Retrospective

This section remains future-facing while the Program is active. The final retrospective should record which T3 Code files became source references, which Ship by Sunday design/frontend docs were retired, which underscore folders were removed or intentionally left due framework constraints, which primitives were ported or adapted, how dark/light mode was unified, which current-app and generated-codebase surfaces received proof, and which follow-up work remains intentionally deferred.

## Validation and Acceptance

This Program can move to completed only when:

- `AGENTS.md`, `apps/web/AGENTS.md`, and docs routing point UI and structure work at this Program and T3 Code instead of old design/frontend doctrine.
- `DESIGN.md`, `docs/DESIGN.md`, `docs/FRONTEND.md`, and design-pack guidance are retired, removed, or clearly marked as non-canonical cleanup targets.
- A structural source map exists and distinguishes useful Next.js route groups from underscore implementation folders.
- Avoidable `_components`, `_hooks`, `_lib`, `_server`, `_styles`, `_content`, `_fonts`, and `_metadata` implementation folders are migrated or intentionally deferred with reasons.
- `apps/web` uses DM Sans and T3 Code token semantics for both light and dark mode.
- The tracked app no longer injects old generated design-system CSS that overrides the T3 Code source contract.
- Shared primitives used by app surfaces visibly match T3 Code button, card, input, badge, dialog, sheet, menu, sidebar, command, toast, tooltip, and form-control patterns or have documented equivalent adaptations.
- Protected app shell, internal dashboard, codebase flow, worker setup/support/findings, settings/admin, tutorials/course, auth, checkout success, marketing/home/starter/workers/service pages, docs, blog, and public support surfaces have been migrated or explicitly deferred with reasons.
- `packages/telegram-chat-widget` supports the T3 Code look in light and dark mode.
- Generated customer codebases inherit the T3 Code visual system through compiler facts, starter templates, generated docs, and generated runtime UI.
- Desktop and mobile browser proof exists for representative marketing, docs, app dashboard, worker, tutorial, auth/checkout, and Telegram widget states.
- Generated-codebase proof exists for a representative downloaded app in light and dark mode.
- Focused behavior tests cover any auth, checkout, support, or protected-route UI touched by visual rewrites.
- `bun run format`, `bun lint`, `bun typecheck`, and the narrower app/package checks relevant to touched slices pass, or exact blockers are recorded in the owning ExecPlan.
- Generated customer repositories and compiler output are migrated in this Program or explicitly deferred in the final retrospective with a new owner.

## Artifacts and Notes

Important T3 Code source references:

- `/Users/bazelrex/Developer/t3code/apps/web/src/index.css`
- `/Users/bazelrex/Developer/t3code/apps/web/components.json`
- `/Users/bazelrex/Developer/t3code/apps/web/src/components/ui`
- `/Users/bazelrex/Developer/t3code/apps/web/src/components/AppSidebarLayout.tsx`
- `/Users/bazelrex/Developer/t3code/apps/web/src/components/ChatView.tsx`
- `/Users/bazelrex/Developer/t3code/apps/web/src/components/chat/ChatComposer.tsx`
- `/Users/bazelrex/Developer/t3code/apps/web/src/components/settings/settingsLayout.tsx`
- `/Users/bazelrex/Developer/t3code/apps/web/src/hooks/useTheme.ts`
- `/Users/bazelrex/Developer/t3code/apps/web/src/routes`
- `/Users/bazelrex/Developer/t3code/apps/web/src/hooks`
- `/Users/bazelrex/Developer/t3code/apps/web/src/lib`
- `/Users/bazelrex/Developer/t3code/apps/web/src/rpc`
- `/Users/bazelrex/Developer/t3code/apps/web/src/environments`

Important Ship by Sunday replacement surfaces:

- `AGENTS.md`
- `apps/web/AGENTS.md`
- `DESIGN.md`
- `docs/DESIGN.md`
- `docs/FRONTEND.md`
- `docs/ship-by-sunday/design-pack`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/fonts.ts`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/ui`
- `apps/web/src/app/**/_components`
- `apps/web/src/app/**/_hooks`
- `apps/web/src/app/**/_lib`
- `apps/web/src/app/**/_server`
- `apps/web/src/app/**/_styles`
- `apps/web/src/app/**/_content`
- `apps/web/src/app/**/_fonts`
- `apps/web/src/app/**/_metadata`
- `apps/web/src/app/(app)/_components/app-shell`
- `apps/web/src/app/(marketing)`
- `apps/web/src/app/(marketing)/docs`
- `apps/web/src/app/(app)/tutorials`
- `apps/web/src/app/(app)/_components/existing-codebase-*`
- `packages/telegram-chat-widget/src/styles/telegram-chat-widget.css`
- `packages/codebase-compiler/src/design-system`
- `packages/codebase-compiler/src/repo-generation`
- `templates/starter-app/source`
- `docs/generated`

## Interfaces and Dependencies

- Next.js App Router, `next-themes`, root layout, and global CSS loading in `apps/web`.
- Next.js route groups remain a framework compatibility interface and are not themselves the structural cleanup target.
- Tailwind CSS v4 CSS-first token definitions.
- Shared UI primitives under `apps/web/src/components/ui`.
- Clerk auth appearance and route protection surfaces.
- Convex-backed protected app views that render worker, codebase, support, and course UI.
- Telegram widget package exports and package CSS.
- Codebase compiler design-system generation and starter app templates.
- Retired design/frontend doctrine docs and design-pack docs that still need references removed or redirected.
