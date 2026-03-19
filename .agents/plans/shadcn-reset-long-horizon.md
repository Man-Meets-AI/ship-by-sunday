# Reset App UI To Vanilla shadcn

This is a living long-horizon execution plan for resetting the app UI onto vanilla shadcn primitives, deleting the current custom design system, and migrating the product surfaces in staged, recoverable passes.

## Purpose / Big Picture
The goal is to remove the repo’s custom product-themed UI layer and replace it with stock shadcn components and stock shadcn globals so the app stops depending on custom wrappers, custom tokens, and custom shell styling. Success looks like this: the marketing page, auth pages, protected app pages, and active lesson flows render with standard shadcn styling, `components/ui` contains mostly stock shadcn files, `app/globals.css` is the shadcn default baseline, `tailwind.config.mjs` is gone, and the app still boots, routes, signs in, and renders the core protected experience. The Nextra docs surface is explicitly out of scope for design changes in this reset and should be left functionally alone.

## Progress
- [x] Inspect repo structure, route families, custom wrappers, and theme bootstrap paths.
- [x] Verify current shadcn installation, theming, CLI, and TanStack Form guidance.
- [x] Inventory every major app surface and map custom patterns to shadcn primitives.
- [x] Create the foundation reset: fresh `components.json`, fresh `app/globals.css`, remove `tailwind.config.mjs`, remove product-theme bootstrap wiring.
- [x] Reinstall stock shadcn primitives into `components/ui` and delete unused custom UI files.
- [x] Delete the currently unused custom `components/ui` files so primitive resets only touch live callers.
- [x] Replace the first low-blast primitives with stock shadcn files: `button`, `input`, `textarea`, and `separator`.
- [x] Replace the next stock primitives and adapt callers enough to restore a green build: `card`, `badge`, `alert`, `progress`, `select`, `checkbox`, and `radio-group`.
- [x] Migrate public/auth/app-shell routes to vanilla shadcn compositions.
- [x] Start the public/auth slice by migrating `sign-in`, `sign-up`, and `checkout/cancel` onto direct `Card`-based layouts.
- [x] Start protected-route migration by moving access, checkout, settings, and shared shell callers onto stock primitive APIs without restoring custom variants.
- [x] Migrate the routed lesson shells, active lesson workbench surfaces, and the shipped dormant lesson mode surfaces away from the old product palette.
- [x] Run repeated integration validation with `pnpm run build` after each major wave and end on a green build.

## Surprises & Discoveries
- The current “design system” is not limited to `components/ui`. It also depends on `app/globals.css`, `tailwind.config.mjs`, injected CSS variables in `features/course/shared/utils/product-theme.ts`, and layout wrappers like `shared/ui/public-surface.tsx` and `features/course/shared/components/product-shell.tsx`.
- Only 20 `components/ui/*` files are imported anywhere. The practical hot path is much smaller: `button`, `input`, `separator`, `textarea`, `card`, `badge`, `alert`, `select`, `checkbox`, `progress`, `skeleton`, `tooltip`, `sheet`, `dialog`, `item`, `radio-group`, `label`, `toggle`, `input-group`, and `sonner`.
- The docs surface on `/docs` is already showing hydration and nested-interactive-element errors in dev. The reset should not widen that blast radius.
- The active lesson experience is narrower than the codebase suggests. The live routes are dominated by focus-form and watch-video lessons; many advanced workbench layouts exist in code but are not currently routed by the manifest.
- `/artifacts` currently shows `"[object Object]"` previews in several rows. This is not caused by the reset, but it is worth preserving as a known bug during migration so it does not get mistaken for a regression.
- Clerk emits a structural CSS warning on `/settings`, which suggests the current custom styling is already pushing against Clerk assumptions.
- Replacing the foundation files with stock shadcn defaults did not break the production build. That confirms the custom token/bootstrap layer was removable before the route-level migrations.
- Replacing `button` with the stock shadcn file only required caller cleanup, not a compatibility shim. Deleting dead UI files first reduced the type-check blast radius exactly as intended.
- Replacing the next stock primitives in one pass was workable as long as caller cleanup happened immediately after. The build stayed recoverable because the failing sites were concentrated in a few route families rather than spread across every page.
- After the later worker waves, the remaining `product-*` grep hits in app code were reduced to symbol names and out-of-scope docs/theme wiring rather than actual route-level styling usage. That is the practical completion line for this reset.

## Decision Log
- Decision: Seeded from the explored “reset to vanilla shadcn” slice rather than from a formal `plan_packet_v1`.
  Rationale: The repo inspection is complete, the user approved the reset direction, and there is enough concrete code evidence to produce an execution-ready plan.
  Date/Author: 2026-03-19 / Codex
- Decision: Leave Nextra alone for design purposes.
  Rationale: The user explicitly narrowed scope. The docs surface is excluded from the visual reset except for making sure shared baseline changes do not break it.
  Date/Author: 2026-03-19 / Codex
- Decision: Replace custom shadcn forks with stock shadcn files instead of preserving current wrapper APIs.
  Rationale: The user explicitly wants the custom layer removed and wants `components/ui` to contain mostly stock shadcn components rather than bespoke variants and wrappers.
  Date/Author: 2026-03-19 / Codex
- Decision: Use TanStack Form for repo-owned forms introduced or rewritten during this migration.
  Rationale: The user explicitly chose the shadcn TanStack Form path. This is most relevant for starter repo access and future app-owned forms.
  Date/Author: 2026-03-19 / Codex
- Decision: Prefer phased vertical migrations over one giant delete-and-fix pass.
  Rationale: Deleting `globals.css`, `tailwind.config.mjs`, and all custom wrappers in one shot would break too many route families simultaneously and make recovery hard.
  Date/Author: 2026-03-19 / Codex

## Outcomes & Retrospective
Outcomes will be filled in as milestones complete. Current completed outcome: the repo now builds with stock shadcn globals, without `tailwind.config.mjs`, without root-level product-theme token injection, and with the routed marketing, auth, protected app, and lesson surfaces moved off the old product palette. Remaining non-goal surface: docs styling and docs-related theme wiring remain intentionally untouched, and a few product-branded symbol names still exist even though they no longer carry the old visual system.

## Context and Orientation
This is a Next.js app-router project rooted at `/Users/parkerrex/Projects/manmeetsai-workspace`.

The current visual system is anchored in these files:
- `app/globals.css`
- `tailwind.config.mjs`
- `components.json`
- `features/course/shared/utils/product-theme.ts`
- `features/course/shared/components/product-theme-provider.tsx`
- `shared/ui/public-surface.tsx`
- `features/course/shared/components/product-shell.tsx`
- `features/docs/styles/docs-theme.css`

Important route families:
- Marketing/public/auth:
  - `app/page.tsx`
  - `features/marketing/components/home-page/**/*`
  - `app/sign-in/[[...sign-in]]/page.tsx`
  - `app/sign-up/[[...sign-up]]/page.tsx`
- Protected app shell:
  - `app/mission/page.tsx`
  - `app/artifacts/page.tsx`
  - `app/settings/[[...rest]]/page.tsx`
  - `app/access-required/page.tsx`
  - `app/checkout/success/page.tsx`
  - `app/checkout/cancel/page.tsx`
- Lesson flows:
  - `app/lesson/[lessonId]/page.tsx`
  - `features/course/lesson/**/*`

Important shared UI modules that were deleted or flattened:
- `shared/ui/public-surface.tsx` was deleted and its route-local layout/surface concerns were inlined into the marketing subtree.
- `shared/ui/layout-grid.tsx` was moved next to the lesson field that actually uses it.
- `shared/branding/product-brand.tsx` was flattened to `components/product-brand.tsx`.
- `features/course/shared/components/product-shell.tsx` and `features/course/shared/components/skill-rail.tsx` still exist, but as app-shell components rather than a custom design system.
- `features/course/shared/components/product-theme-provider.tsx` still exists, but only as minimal theme state wiring instead of token/bootstrap infrastructure.

Current custom primitive pressure points:
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/badge.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/alert.tsx`
- `components/ui/progress.tsx`
- `components/ui/select.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/sheet.tsx`
- `components/ui/dialog.tsx`
- `components/ui/tooltip.tsx`
- `components/ui/item.tsx`

Repo-owned form target:
- `features/starter-repo/components/starter-repo-access-form.tsx`
  This should move from local `useState` handling toward the shadcn TanStack Form pattern.

Out-of-scope design area:
- `app/docs/**/*`
- `features/docs/**/*`
- `content/docs/**/*`
- `features/docs/styles/docs-theme.css`
These files should only be touched if the foundation reset accidentally breaks docs boot or build behavior. They are not part of the visual reset target.

Definitions for a newcomer:
- “Vanilla shadcn” means stock components generated by the official shadcn CLI with stock class structure and stock semantic CSS variables, not custom variants built around `product-*` tokens.
- “Foundation reset” means the baseline files that every route depends on: `components.json`, `app/globals.css`, `tailwind.config.mjs`, theme bootstrap wiring, and shared providers in `app/layout.tsx`.
- “Active lesson families” means the currently routed lesson layouts visible through the lesson manifest: focus-form lessons and watch-video lessons. Dormant workbench modes are secondary.

## Plan of Work
Start by replacing the shared foundation, because the current repo injects a custom theme before any route code renders. The first pass will remove the custom shadcn configuration and bootstrap path while keeping the app compiling. That means introducing a fresh stock `components.json`, a fresh stock `app/globals.css`, removing `tailwind.config.mjs`, removing product-theme CSS injection from `app/layout.tsx`, and deleting the custom theme provider path if it is no longer needed.

After the foundation is reset, reinstall the stock primitives actually used by the app. Do not reinstall every available component by default. Generate the stock files for the primitives that appear in imports, then delete the unused custom `components/ui` files. At this stage the codebase will still reference custom props and variants, so the next step is to migrate route families one by one onto stock shadcn API usage.

Migrate the easier surfaces first: marketing and auth. These are mostly custom composition problems and can collapse onto `Card`, `Button`, `Accordion`, and `AspectRatio` without business-logic risk. Next, migrate the protected app shell routes, especially `ProductShell`, because mission, settings, artifacts, checkout, and access all inherit its chrome. Once those are stable, move into the active lesson families and replace lesson-specific cards, chips, prompts, and panels with vanilla shadcn building blocks.

Keep docs visually untouched throughout. Any docs-related file should only be modified if the shared baseline reset breaks the docs route.

## Milestones

### Milestone 1: Freeze the foundation on stock shadcn defaults
Goal:
Replace the current custom shadcn initialization with stock shadcn defaults and remove the app-wide custom theme bootstrap path.

Touched files or systems:
- `components.json`
- `app/globals.css`
- `tailwind.config.mjs`
- `app/layout.tsx`
- `features/course/shared/components/product-theme-provider.tsx`
- `features/course/shared/utils/product-theme.ts`
- any imports that only exist to support the removed theme layer

Commands to run:
- `cd /Users/parkerrex/Projects/manmeetsai-workspace`
- `pnpm dlx shadcn@latest init --help`
- `pnpm dlx shadcn@latest add --help`
- `pnpm run build`

Successful completion looks like:
- `tailwind.config.mjs` is removed.
- `components.json` reflects a stock shadcn setup.
- `app/globals.css` uses stock shadcn semantic tokens and baseline Tailwind import structure.
- `app/layout.tsx` no longer injects `getProductThemeTokenStyles()` or `getProductThemeBootstrapScript()`.
- The app still builds or fails only because route files are using old custom primitive APIs.

### Milestone 2: Reinstall stock primitives and delete the dead custom UI surface
Goal:
Make `components/ui` mostly stock shadcn files and shrink the UI layer down to the primitives actually used by the app.

Touched files or systems:
- `components/ui/**/*`
- `components.json`
- package dependencies if the CLI adds missing ones

Commands to run:
- `cd /Users/parkerrex/Projects/manmeetsai-workspace`
- `pnpm dlx shadcn@latest add button card badge input textarea alert select checkbox label progress separator tooltip sheet dialog radio-group skeleton sonner`
- add `accordion`, `aspect-ratio`, `table`, `tabs`, `toggle-group`, `scroll-area`, `switch`, and `field` when the relevant route migration starts
- `pnpm run build`

Successful completion looks like:
- The hot-path primitives are stock shadcn files.
- Unused custom files in `components/ui` are deleted.
- There are no remaining custom `product-*` variants inside those stock files.

### Milestone 3: Migrate marketing and auth to plain shadcn composition
Goal:
Replace the public wrappers and landing-page section styling with direct shadcn composition and minimal route-local layout markup.

Touched files or systems:
- `shared/ui/public-surface.tsx`
- `features/marketing/components/home-page/**/*`
- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`
- `config/product.ts` if auth-specific Clerk appearance strings need to be removed

Commands to run:
- `cd /Users/parkerrex/Projects/manmeetsai-workspace`
- `pnpm run build`
- browser-check `http://localhost:3000/?marketing=1`
- browser-check `http://localhost:3000/sign-in`
- browser-check `http://localhost:3000/sign-up`

Successful completion looks like:
- `PublicPageFrame` and `PublicSurfaceCard` are deleted or reduced to trivial non-styling layout helpers.
- Marketing uses `Card`, `Button`, `Accordion`, `AspectRatio`, and plain grids instead of bespoke section shells.
- Auth pages use a normal card shell around Clerk and do not pass the old product-themed Clerk class string.

### Milestone 4: Migrate the protected app shell and app routes
Goal:
Replace `ProductShell`, mission chrome, access flows, checkout recovery flows, and settings/artifacts surfaces with standard shadcn composition.

Touched files or systems:
- `features/course/shared/components/product-shell.tsx`
- `features/course/shared/components/skill-rail.tsx`
- `features/course/access/components/access-required-page.tsx`
- `features/checkout/components/checkout-button.tsx`
- `features/checkout/components/checkout-success-view.tsx`
- `app/checkout/cancel/page.tsx`
- `features/course/mission/components/mission-page.tsx`
- `features/course/mission/components/bonus-course-card.tsx`
- `features/course/artifacts/components/artifacts-page.tsx`
- `features/settings/components/settings-page.tsx`
- `features/codex/components/codex-connection-card.tsx`
- `features/starter-repo/components/starter-repo-access-card.tsx`

Commands to run:
- `cd /Users/parkerrex/Projects/manmeetsai-workspace`
- `pnpm run build`
- browser-check `/mission`
- browser-check `/artifacts`
- browser-check `/settings`
- browser-check `/checkout/cancel`

Successful completion looks like:
- The custom shell chrome is gone or radically simplified.
- Status strips become plain cards, badges, and progress blocks rather than bespoke animated surfaces.
- `CheckoutButton` uses standard loading treatment.
- Mission, settings, and artifacts render without `product-*` visual assumptions.

### Milestone 5: Move repo-owned forms onto TanStack Form where they are being rewritten
Goal:
Start the form migration with the starter repo access flow and establish the shadcn TanStack Form pattern inside this repo.

Touched files or systems:
- `features/starter-repo/components/starter-repo-access-form.tsx`
- any local form helpers added for TanStack Form integration
- likely `components/ui/field.tsx` and related stock shadcn form dependencies

Commands to run:
- `cd /Users/parkerrex/Projects/manmeetsai-workspace`
- add missing packages if needed for TanStack Form and Zod adapter
- `pnpm run build`
- browser-check `/mission`
- browser-check `/settings`

Successful completion looks like:
- The starter repo access form uses TanStack Form with stock shadcn field primitives.
- Validation and server-error states are still visible.
- The form does not depend on local state for every field interaction.

### Milestone 6: Migrate active lesson families
Goal:
Replace the active lesson UI families with standard shadcn composition while leaving dormant lesson modes secondary.

Touched files or systems:
- `features/course/lesson/components/lesson-page.tsx`
- `features/course/lesson/components/lesson-video-surface.tsx`
- `features/course/lesson/shared/lesson-chrome-chip.tsx`
- `features/course/lesson/shells/**/*`
- `features/course/lesson/workbench/shared/**/*`
- `features/course/lesson/workbench/modes/guided-form-workbench.tsx`
- active field controls in `features/course/lesson/workbench/fields/**/*`

Commands to run:
- `cd /Users/parkerrex/Projects/manmeetsai-workspace`
- `pnpm run build`
- browser-check `/lesson/1.1`
- browser-check `/lesson/1.4`
- browser-check `/lesson/4.0`

Successful completion looks like:
- Focus lessons use cards, badges, standard inputs, and plain action rows.
- Watch lessons use a simple card layout with video, transcript/resources blocks, and footer controls.
- Completion UI no longer depends on the old `sbs-*` animation classes.

### Milestone 7: Cleanup and delete the old design system
Goal:
Remove leftover files, wrapper modules, old config values, and dead helper classes once all migrated routes are stable.

Touched files or systems:
- `shared/ui/public-surface.tsx`
- `features/course/shared/components/product-theme-provider.tsx`
- `features/course/shared/utils/product-theme.ts`
- any old `product-*` helper modules
- unused `components/ui` files
- any dead imports in `config/product.ts`

Commands to run:
- `cd /Users/parkerrex/Projects/manmeetsai-workspace`
- `pnpm run build`
- `pnpm run lint`
- optional targeted `rg 'product-' app components features shared lib config`

Successful completion looks like:
- Shared UI no longer depends on the deleted custom design system.
- Remaining app-specific wrappers are tiny and domain-specific rather than styling abstractions.
- The repo’s UI mental model is “stock shadcn plus route composition,” not “custom theme framework.”

## Concrete Steps
1. Work in `/Users/parkerrex/Projects/manmeetsai-workspace`.
2. Create or preserve this plan at `.agents/plans/shadcn-reset-long-horizon.md`.
3. Replace `components.json` with a stock shadcn configuration that is valid for Tailwind v4 and points at `app/globals.css`.
4. Replace `app/globals.css` with a stock shadcn baseline. Do not carry forward the old `product-*` token map.
5. Remove `tailwind.config.mjs` and any `@config "../tailwind.config.mjs";` usage.
6. Remove product-theme injection from `app/layout.tsx`.
7. Remove `ProductThemeProvider` from the root layout if nothing still depends on it.
8. Reinstall the stock primitives that are actually imported by the app.
9. Delete unused `components/ui` files that are not imported anywhere.
10. Migrate `shared/ui/public-surface.tsx` call sites and then delete or trivialize the module.
11. Migrate auth pages away from `authViewConfig.clerkCardClassName`.
12. Rewrite `ProductShell` so it is a simple layout container using stock shadcn primitives rather than a custom visual system.
13. Rewrite mission, settings, artifacts, access-required, and checkout surfaces on top of stock cards, badges, progress blocks, alerts, and buttons.
14. Add stock `field` and TanStack Form dependencies only when the starter repo form rewrite begins.
15. Rewrite the starter repo form using TanStack Form and stock shadcn form field primitives.
16. Rewrite active lesson families, starting with watch lessons and focus-form lessons, because those are the live customer paths.
17. Delete remaining old design-system files once no route imports them.

Expected observations during execution:
- Early in the migration, builds may fail because route code still expects old custom `variant` or `size` props on `Button`, `Badge`, `Card`, or `Progress`.
- The fastest way to recover is to migrate the route family that uses the broken prop rather than rebuilding the old variant system.
- `/docs` should be used as a smoke test only. It should remain visually as-is unless the baseline reset breaks rendering.

## Validation and Acceptance
Prove the reset works with behavior-based checks, not just file diffs.

Foundation acceptance:
- `pnpm run build` completes or fails only on known in-progress migration surfaces.
- `tailwind.config.mjs` is absent.
- `app/layout.tsx` no longer injects product theme token styles or bootstrap script.

Public/auth acceptance:
- `/?marketing=1` renders with stock shadcn-looking surfaces and no dependency on `PublicSurfaceCard`.
- `/sign-in` and `/sign-up` render with a simple shadcn card shell around Clerk.

Protected app acceptance:
- `/mission` loads, shows progress and actions, and no longer depends on the old custom shell styles.
- `/artifacts` loads grouped artifacts with a simple list, table, or accordion presentation.
- `/settings` loads the account intro, Codex panel, starter repo panel, and Clerk profile without relying on old theme wrappers.
- `/checkout/cancel` renders as a simple recovery card with valid CTA buttons.

Form acceptance:
- The starter repo access form validates, submits, and shows field/server errors using stock shadcn field patterns.

Lesson acceptance:
- `/lesson/1.1` renders the focus-form experience using stock cards and form controls.
- `/lesson/1.4` renders its selection and support content using stock shadcn building blocks.
- `/lesson/4.0` renders the watch lesson with video and footer actions using standard shadcn composition.

Regression acceptance:
- The docs route `/docs` still loads.
- Auth still works.
- Protected routes still render for an entitled account.

## Idempotence and Recovery
This migration should be performed in re-runnable slices.

Safe re-runs:
- Re-running `pnpm dlx shadcn@latest add ...` is safe with overwrite flags when intentionally regenerating stock primitives.
- Re-running build checks after each slice is required, not optional.

Recovery guidance:
- If the foundation reset breaks too many routes at once, stop and migrate one route family before deleting more shared files.
- If a stock primitive replacement breaks because route code still passes old custom props, remove the old props at the route level instead of reintroducing custom variants.
- If `/docs` breaks after the globals reset, patch only the minimum necessary docs-facing CSS or layout dependency to restore rendering; do not pull docs into the redesign scope.
- If Clerk surfaces break because of structure or styling, preserve the Clerk component itself and simplify the surrounding shell. Do not rebuild Clerk UI from scratch during this reset unless absolutely necessary.
- If lesson migrations stall on dormant workbench modes, defer those modes and finish only the active manifest-driven lesson families first.
- If a component file is deleted and later discovered to still be imported, regenerate the stock primitive and adapt the caller instead of restoring the custom fork.

Cleanup and rollback:
- Use git diff after each milestone to confirm only the intended slice changed.
- Avoid forceful repository resets because the worktree may already contain unrelated changes.
- When in doubt, recover by restoring the minimal deleted file or by re-running the shadcn CLI for that primitive, then continue migrating callers forward.
