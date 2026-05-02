---
title: Blueprint Page Polish
status: active
created_at: 2026-05-02
completed_at: null
summary: Polish the `/blueprint` authoring surface end-to-end so every input, section transition, and save moment feels handcrafted in light and dark mode at desktop and mobile, without changing the Convex contracts, the workspace draft state hook, the leave-guard, the local-draft seeder, the canonical project-fact keys, or any compiler-owned types.
post_build_recap: null
read_when:
  - Resuming the blueprint-page polish pass mid-flight.
  - Reviewing the polish diff against the locked behavior contract.
  - Writing follow-up polish work that extends `/blueprint`, the section card, or any field renderer.
---

# Blueprint Page Polish

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

`/blueprint` is the primary work surface where a new buyer spends the most active time. They land here right after `/checkout/success` and stay until they finish 7 sections of canonical project facts (`foundation`, `problem`, `outcome`, `design`, `pricing`, `setup`, `generated-preview`). Today the surface is functionally complete and behaviorally correct, but the craft layer is uneven: the section card numbered badge swap to a check is a hard swap, the XL-only progress sidebar shows only complete vs. incomplete (no "started" affordance and no active-section indication), the save bar reads as a placeholder ("Continue to Review" + a tiny spinner), the list field add/remove jumps without reflow, the design-preset summary card does not yet rhyme with the public `blueprint-demo-design-card.tsx`, and several files exceed the 150-line component boundary cap that `apps/web/AGENTS.md` enforces.

This pass raises the craft layer on `/blueprint` only. After this work, a buyer should see a section card whose completion badge morphs (instead of swapping) and earns one short check pulse, a sidebar that distinguishes empty / started / complete and tracks the section currently in view, list and link-list fields that reflow on add and remove, a design and theme surface that visually rhymes with the polished demo, and a save bar that is sticky on mobile, phase-aware in copy, and surfaces save errors inline with `role="alert"`.

A human can prove this by signing into the dev workspace at `/blueprint`, walking through all 7 sections in light mode and dark mode at 1440px, 768px, and 390px, exercising at least one field per section against the live Convex re-query loop, dirtying a field then clicking a primary nav link to confirm the leave dialog flow, and toggling `prefers-reduced-motion: reduce` to confirm every new animation falls back to a static or opacity-only render.

## Progress

- [x] 2026-05-02: Author this ExecPlan.
- [x] 2026-05-02: Slice 1 - page shell, overview rhythm, sidebar in-progress affordance + active-section scroll-spy, motion helper.
- [x] 2026-05-02: Slice 2 - section card completion moment (`layoutId` morph + one-shot check pulse, mobile stack audit, description leading).
- [x] 2026-05-02: Slice 3 - list and link-list field micro (`AnimatePresence` row reflow, `whileTap` on add/remove, keyboard regression check).
- [x] 2026-05-02: Slice 4 - design preset + theme polish (extract design and theme field wrappers, split theme configurator controls, summary card rhythm, dark ring audit).
- [x] 2026-05-02: Slice 5 - save bar + leave dialog (phase-aware copy, sticky-on-mobile shell, dismissible inline error, dialog audit).
- [x] 2026-05-02: Slice 6 - dark-mode + reflow audit across all 7 sections, mid-breakpoint tightening, no-new-`bg-primary` sweep (clean).
- [x] 2026-05-02: Slice 7 - validation matrix (focused vitest, full apps/web vitest sweep, format, lint, typecheck).

## Surprises & Discoveries

The workspace blueprint draft layer does not own a `localStorage` debounce. `rg localStorage apps/web/app/(workspace)/_hooks/blueprint-flow` returns nothing on 2026-05-02. The only `localStorage` seam in the workspace is `blueprint-local-draft-seeder.tsx`, which the prompt forbids changing. Adding a `localStorage` "Saved locally" pill on the authoring surface would therefore be a behavior change rather than polish, and is intentionally out of scope for this plan. The existing optimistic Convex save plus the `BlueprintStageSaveFeedback` "Draft saved." line already cover the "your work is safe" affordance.

`BlueprintPageSectionStatus` (in `apps/web/lib/blueprint-flow/blueprint-page-validation-model.ts`) already exposes `missingFactKeys` per section. A "started" sidebar affordance can be derived purely in the presentation layer via `missingFactKeys.length < (section.requiredFieldKeys ?? section.fieldKeys).length && !isComplete`, so no change to `useBlueprintPageState` is required.

`motion/react` is already a transitive dependency that the public `blueprint-demo` surface uses (e.g. `apps/web/app/_components/home-page/sections/blueprint-demo/blueprint-demo-saved-locally.tsx`). Adopting it on the workspace authoring surface introduces no new dependency and lets the polish moments (badge morph, list reflow, chip add/remove) reuse the same `useReducedMotion` gating shape as the demo.

Three blueprint-flow files exceed the 150-line component cap in `apps/web/AGENTS.md`: `blueprint-page.tsx` (158), `blueprint-stage-step-field.tsx` (252), and `blueprint-theme-configurator.tsx` (362). All three are split as part of this polish.

The active branch on 2026-05-02 is `fix/shadcn-dark-semantic-cascade`, one commit ahead of the polish baseline `d1cad98`. The workspace already carries unrelated parallel polish work (homepage sections, checkout-success, observability). Per the prompt's denylist, none of those files are touched here. `git status --short` is run after every write to confirm scope.

## Decision Log

Decision: Track this work as a new ExecPlan rather than extending `2026-05-02-checkout-success-polish.md` or `2026-05-02-landing-page-polish.md`.
Rationale: `/blueprint` is its own protected surface with a Convex re-query loop, an unsaved-changes leave guard, and a 7-section field grid. Mixing it with the marketing or post-checkout polish plans would muddy the per-slice diff scope and the validation harness.
Date: 2026-05-02

Decision: Do not add a `localStorage`-driven "Saved locally" pill on the authoring surface.
Rationale: The workspace draft layer does not have a `localStorage` debounce today. Adding one would change behavior, not polish. The brief explicitly says "DO NOT add localStorage to this view if it doesn't already exist there - check first." Confirmed via `rg localStorage apps/web/app/(workspace)/_hooks/blueprint-flow`.
Date: 2026-05-02

Decision: Derive the sidebar "started" status purely in the sidebar component from `BlueprintPageSectionStatus.missingFactKeys`.
Rationale: The status type already exposes everything needed. Mutating `useBlueprintPageState` would violate the hard rule against changing the page state hook.
Date: 2026-05-02

Decision: Use `motion/react` `layoutId` plus a one-shot scale pulse for the section-card completion moment, both gated by a new `useBlueprintPageReducedMotion` helper that mirrors `useBlueprintDemoReducedMotion`.
Rationale: The brief explicitly suggests both moves. `layoutId` provides the morph; the scale pulse provides the earned-feeling pulse. A workspace-namespaced helper keeps the demo and authoring helpers independent so future demo polish does not accidentally regress the authoring surface.
Date: 2026-05-02

Decision: Implement the save bar phase-aware copy (`saving` -> "Saving your blueprint..." and `redirecting` -> "Opening review...") inside the save bar component, derived from existing props.
Rationale: `useBlueprintPageState` cannot change. The save flow already sets `feedback.tone === "success"` and keeps `isSaving` true through `unlockExecuteShip`. The save bar can derive a `redirecting` phase as `isSaving && feedback?.tone === "success"` without any hook change.
Date: 2026-05-02

Decision: Make the save bar sticky only on mobile (`sticky bottom-2 sm:static` with `bg-background/85 backdrop-blur` and safe-area padding), copying the pattern from `apps/web/app/_components/home-page/sections/blueprint-demo/blueprint-demo-cta-bar.tsx`.
Rationale: On desktop the section column is short enough that sticky is distracting. On mobile the section list is tall enough that the save action would be one or two scroll-flicks below the fold without sticky.
Date: 2026-05-02

Decision: Add active-section indication to the sidebar via `IntersectionObserver` against the existing `<section id={section.id}>` anchors, scoped to a local `useState` in the sidebar.
Rationale: The section anchors already exist for hash navigation. An observer is snappy, runs in the presentation layer only, never touches the leave guard, and adds zero work to the Convex path.
Date: 2026-05-02

Decision: Do not commit unless the user explicitly asks. Pause for review after each slice.
Rationale: The brief requires explicit user approval before commits.
Date: 2026-05-02

## Outcomes & Retrospective

### Source-changing slices

- Slice 1: split `blueprint-page.tsx` (158 -> 113 lines) by extracting `blueprint-page-body.tsx` (93 lines). Added `blueprint-page-motion.ts` (`useBlueprintPageReducedMotion`). Tightened `blueprint-page-overview.tsx` rhythm with an "Authoring" eyebrow and softened description leading. Polished `blueprint-page-progress-sidebar.tsx` to add an "empty / started / complete" `data-progress` indicator (with new `data-testid="blueprint-page-progress-{sectionId}"` namespacing) and an `IntersectionObserver`-driven active-section affordance that highlights the in-view section without touching the leave guard. Extracted `blueprint-page-progress-sidebar-item.tsx` to keep the sidebar under the line cap.
- Slice 2: replaced the section-card badge `<span>` with a `motion.span` (`layout="preserve-aspect"` + AnimatePresence-driven number/check swap with a spring scale pulse on first complete) extracted into `blueprint-page-section-badge.tsx`. Softened section description leading (`text-[13.5px] leading-6` + `mt-1.5`). Audited the mobile stack of badge / title / description / draft-assistant - the existing `pl-9 sm:pl-0` on the assistant chip already aligns cleanly under the title at 390px, no further change.
- Slice 3: wrapped list rows in `AnimatePresence` with `motion.div` height/opacity reflow gated by `useBlueprintPageReducedMotion`, added `whileTap={{ scale: 0.97 }}` on the Add button and `{ scale: 0.92 }` on remove. Did the same for the link-list chip add/remove (`whileTap={{ scale: 0.9 }}` on the chip close button). Extracted `blueprint-stage-list-field-row.tsx` (presentation), `use-blueprint-stage-list-field.ts` and `use-blueprint-stage-link-list-field.ts` (state + keyboard handlers) so each component file stays under 150 lines while keeping the existing keyboard contract (Enter inserts, Backspace on empty deletes, ChevronUp/Down reorder).
- Slice 4: split `blueprint-stage-step-field.tsx` (252 -> 117 lines) by extracting `blueprint-stage-design-field.tsx` (78), `blueprint-stage-theme-field.tsx` (76), `blueprint-stage-array-field.tsx` (75), and `blueprint-stage-text-field.tsx` (86). Split `blueprint-theme-configurator.tsx` (362 -> 93 lines) into the orchestration parent plus `blueprint-theme-configurator-controls.tsx` (138), `blueprint-theme-configurator-knob.tsx` (49), `blueprint-theme-radius-selector.tsx` (64), and `blueprint-theme-advanced-options.tsx` (89). Added `whileTap` to color swatches, style buttons, and radius buttons; the existing `dark:ring-white/10` ring states already provide the right separation in dark mode and were left intact. Polished the design preset summary card with a true browser-chrome wrapper (traffic lights + URL pill + 4:3 preview crop) that rhymes with `blueprint-demo-design-card.tsx` without copying it; extracted `blueprint-design-preset-summary.tsx` (137) and `blueprint-design-preset-rows.tsx` (64) so `blueprint-design-preset-field.tsx` drops to 102 lines.
- Slice 5: rewrote `blueprint-page-save-bar.tsx` with phase-aware loading copy ("Saving your blueprint..." vs. "Opening review...") computed in a new presentation-only `use-blueprint-save-bar-phase.ts` hook (does not touch `useBlueprintPageState`); made the bar sticky on mobile (`sticky bottom-2 z-20 sm:static` plus `bg-background/85 backdrop-blur` plus safe-area padding) while staying static on desktop; added a dismissible inline error region with `role="alert"`-shaped semantics via the existing `BlueprintStageSaveFeedback` plus an X dismiss button. `blueprint-stage-leave-dialog.tsx` was tightened: title becomes "Leave with unsaved changes?" with a small destructive `AlertTriangleIcon`, copy is more concrete about consequences, and the dialog now wires `onOpenChange` so external close attempts (e.g. Escape from the underlying primitive) fall through to `onStay`. Destructive button visual weight unchanged - the existing dark-mode override class string already keeps the destructive contrast right.
- Slice 6: tightened the lg/md mid-breakpoint by centering the content column when the XL sidebar is hidden (`mx-auto ... xl:mx-0`). Confirmed `rg "bg-primary|text-primary" apps/web/app/(workspace)/_components/blueprint-flow apps/web/app/(workspace)/_hooks/blueprint-flow` returns no matches.

### Inspected-but-no-change

- `blueprint-stage-nav.tsx` - the horizontal stage nav was being touched by a parallel polish prompt (added `motion-reduce:transition-none`); deferred any further audit because the file is in a sibling polish PR's scope.
- `blueprint-section-draft-assistant.tsx` - the existing 119-line component already reads cleanly at all viewports; mobile stack is correctly indented under the title via the parent's `pl-9 sm:pl-0` wrapper.
- `blueprint-stage-scale-field.tsx` - already polished and cohesive; not in this pass.
- `blueprint-theme-preview.tsx` - already maps every CSS variable correctly via inline `style={{ var(--...) }}` and is not affected by the no-`bg-primary` rule (CSS variables are not Tailwind classes). The hard-coded `oklch` strings inside it are a structural follow-up (see below), not a polish concern.
- `blueprint-local-draft-seeder.tsx` - explicitly forbidden to change; left untouched.

### Validation matrix

- `bun run --cwd apps/web vitest run tests/integration-ui/blueprint-page.test.tsx tests/integration-ui/blueprint-stage-navigation.test.tsx tests/integration-ui/blueprint-local-draft-seeder.test.tsx tests/unit/blueprint-page-state-model.test.ts tests/unit/use-blueprint-page-state.test.tsx tests/unit/blueprint-stage-step-field.test.tsx tests/unit/blueprint-stage-scale-field.test.tsx tests/unit/blueprint-stage-save-feedback.test.tsx tests/unit/blueprint-step-save-feedback.test.ts tests/unit/blueprint-section-draft-assistant.test.tsx tests/unit/blueprint-theme-tokens.test.ts tests/unit/blueprint-field-scales.test.ts` - 12 files, 50 tests, all green.
- `bun run --cwd apps/web vitest run tests/integration-ui tests/unit` - 148 files, 593 tests, all green. No collateral failures from the field router split, the save bar rewrite, or the theme configurator split.
- `bun run format` - green.
- `bun lint` - green (0 warnings, 0 errors).
- `bun typecheck` - green; the full Next.js production build also re-runs at this gate and finished successfully.
- `rg "bg-primary|text-primary" apps/web/app/(workspace)/_components/blueprint-flow apps/web/app/(workspace)/_hooks/blueprint-flow` - no matches.

### Validation that could not run

- Manual browser proof against the live Convex dev workspace: no signed-in browser session is available in this environment, so the per-slice viewport-by-viewport screenshot grid was not captured. The polish is verified only against vitest (which exercises the static markup) and the type/lint/format gates. A maintainer running the dev server should still walk all 7 sections at 1440px / 768px / 390px in light and dark, exercise the live save -> Convex -> live re-query loop on at least one field per section, dirty a field then click a primary nav link to confirm the leave dialog flow, and toggle `prefers-reduced-motion: reduce` to confirm every new animation falls back to a static or opacity-only render before merging.

### Structural follow-ups for separate Linear issues

- `blueprint-theme-preview.tsx` still contains hard-coded `oklch(...)` strings for the live CSS variable preview. That is a separate compiler/theme-token concern and out of scope for a polish pass.
- The `--primary` token cascade in dark mode is being addressed in `fix/shadcn-dark-semantic-cascade`. Once that lands, the `bg-foreground` / `text-foreground` workarounds on the badge, sidebar dot, and design preset row could be reconsidered, but only if the visual behavior remains identical; the workaround is not buggy.
- The `BlueprintStageStepField`'s `memo` equality is now thinner because the inline branch logic moved into wrapper files. Worth a profiling pass to confirm there's no measurable re-render regression in the section list.

### Untouched, intentionally polished elsewhere

- `blueprint-local-draft-seeder.tsx` - already polished by an earlier PR; behavior contract is locked.
- `blueprint-stage-nav.tsx` - parallel polish prompt is touching this file in the same checkout; not stomped here.
- The shadcn semantic cascade fix (the active branch `fix/shadcn-dark-semantic-cascade`) handles the global `--primary` dark-mode behavior; this polish PR avoids any new `bg-primary` / `text-primary` styling and should ride on top of that fix.

## Context and Orientation

`/blueprint` is server-loaded by `apps/web/app/(workspace)/blueprint/page.tsx`, which calls `loadBlueprintWorkspaceState` plus (when post-review is unlocked) `loadPostReviewNavigationTargets` and the bonus mission state, then renders the client `BlueprintPage` from `apps/web/app/(workspace)/_components/blueprint-flow/blueprint-page.tsx`.

`BlueprintPage` mounts the workspace `AppShell` in `viewportMode="app"` with `appScrollMode="page"`, mounts the invisible `BlueprintLocalDraftSeeder`, runs the live Convex re-query (`api.blueprint.getBlueprintWorkspaceState`), and orchestrates two custom hooks: `useBlueprintPageState` (draft buffers, derived facts, field errors, save + continue, optimistic update) and `useBlueprintStageLeaveGuard` (history sentinel, beforeunload, dialog-driven navigation). Inside the AppShell main column it renders the XL-only `BlueprintPageProgressSidebar`, the `BlueprintPageOverview`, the 7 `BlueprintPageSectionCard` sections built from `blueprintPageSections`, the `BlueprintPageSaveBar`, and the `BlueprintStageLeaveDialog`.

Each section card maps `section.fieldKeys` to a `BlueprintStageStepField`, which routes by field key into the design preset field, the theme configurator (both `dynamic()`-imported with skeletons), the scale field, the link-list field (only `design_references`), the newline-separated list field (any `isBlueprintArrayField`), a textarea, or a plain input. `BlueprintSectionDraftAssistant` is the section-level "Draft with AI" affordance.

`BlueprintPageSectionStatus` (`sectionId`, `isComplete`, `missingFactKeys`) is derived from `currentFacts` by `buildSectionStatuses` in `apps/web/lib/blueprint-flow/blueprint-page-validation-model.ts`. `feedback` (`tone`, `title`, `description`) is derived by `buildPageFeedback` in the same file.

### In Scope

- Polish-only diffs to the files in the prompt's "In-scope files" block, plus new presentational sub-components colocated under `apps/web/app/(workspace)/_components/blueprint-flow/` to enforce the 150-line component boundary.
- Mirror the polished `blueprint-demo` patterns (sidebar progress dots, demo motion helper shape, demo CTA bar sticky shell, demo design card browser-chrome rhythm) where they are conceptually right for the authoring surface, without copying verbatim.
- A new ExecPlan at `docs/exec-plans/active/2026-05-02-blueprint-page-polish.md` (this file).
- A new motion helper at `apps/web/app/(workspace)/_components/blueprint-flow/blueprint-page-motion.ts` that wraps `useReducedMotion` from `motion/react` for the workspace authoring surface.
- New thin wrapper files for the design and theme branches of `BlueprintStageStepField` so the field router stays under 150 lines.
- New presentational split for the theme configurator controls so the configurator stays under 150 lines.
- New presentational sub-components for the sidebar item, save bar status, or page body only when the parent file would otherwise breach the 150-line cap.

### Out Of Scope

- Any change to `useBlueprintPageState`, `useBlueprintStageLeaveGuard`, or `useBlueprintLocalDraftSeeder`.
- Any change to the Convex queries or mutations (`api.blueprint.getBlueprintWorkspaceState`, `api.blueprint.saveProjectDefinitionFacts`, `api.blueprint.unlockExecuteShip`, or the seeder mutation).
- Any change to the `blueprintPageSections` array, the canonical project-fact keys, or any `@shipbysunday/blueprint-compiler` type or function.
- Any change to the local draft seeder's behavior or its toast.
- Any change to the post-review unlock flow or `unlockExecuteShip` call.
- Adding a `localStorage` debounce on the authoring draft layer.
- Introducing any new `bg-primary` or `text-primary` styling. The structural cascade fix is in another PR (`fix/shadcn-dark-semantic-cascade`, the active branch).
- Touching any file already modified by parallel polish work (homepage sections, checkout-success, observability, posthog, `.cursor/`).
- Adding any new third-party dependency.
- Editing `blueprint-stage-nav.tsx` and `blueprint-section-draft-assistant.tsx` beyond a dark-mode + mobile-stack audit unless a real visual regression is visible.

## Plan of Work

Slice 1 splits `blueprint-page.tsx` (158 lines) into `blueprint-page.tsx` (the data + leave-guard wiring) plus a new `blueprint-page-body.tsx` (the AppShell-internal layout: sidebar column + main column + section list + save bar). The new `blueprint-page-motion.ts` is added with `useBlueprintPageReducedMotion` and (if needed) a stagger helper. `blueprint-page-overview.tsx` gets a tightened title-to-description rhythm and the mobile progress row already present is left alone unless its spacing is off. `blueprint-page-progress-sidebar.tsx` gains an empty/started/complete `data-progress` indicator (mirroring `blueprint-demo-sidebar.tsx`'s shape, namespaced as `data-testid="blueprint-page-progress-{sectionId}"`) and an `IntersectionObserver`-driven active-section affordance scoped to a local `useState`. The active link gets a subtle `data-active="true"` attribute and `bg-muted/60` background. If the sidebar exceeds 150 lines after these additions, `BlueprintPageProgressSidebarItem` is extracted into a sibling file.

Slice 2 polishes `blueprint-page-section-card.tsx`. The badge `<span>` is replaced with a `motion.span` keyed off `layoutId={`blueprint-page-badge-${section.id}`}` so the morph between numbered and check states is continuous. A second `motion.span` wraps the `CheckCircle2Icon` and runs a one-shot `initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}` pulse on first render. Both motion props collapse to identity values when `useBlueprintPageReducedMotion()` returns true. The description is given `text-[13.5px] leading-6` for breathing room (only if the audit finds the current `text-sm leading-relaxed` reads tight). The mobile stack of badge / title / description / draft-assistant is audited for crowding at 390px and adjusted only if the assistant button overlaps the title.

Slice 3 polishes `blueprint-stage-list-field.tsx` and `blueprint-stage-link-list-field.tsx`. List rows are wrapped in `AnimatePresence` and each row becomes a `motion.div` with a short height/opacity exit, gated by reduced motion. The add and remove buttons gain `whileTap={{ scale: 0.97 }}`. Keyboard reorder (`Enter` to insert, `Backspace` on empty to delete, ChevronUp/ChevronDown buttons) and the existing `requestAnimationFrame`-based focus management are verified by the existing test suite plus a manual keyboard pass. Link-list chips reflow with the same `AnimatePresence` pattern; the close button gets a soft scale on tap.

Slice 4 splits `blueprint-stage-step-field.tsx` (252 lines) by extracting the design and theme branches into `blueprint-stage-design-field.tsx` and `blueprint-stage-theme-field.tsx` (both client modules). The `dynamic()` boundary stays in `blueprint-stage-step-field.tsx` and only the inner `<Field>` markup moves into the wrappers. `blueprint-theme-configurator.tsx` (362 lines) is split: `blueprint-theme-configurator.tsx` keeps the orchestration (config decode/encode, advanced toggle, randomize, code readout, preview slot) and a new `blueprint-theme-configurator-controls.tsx` owns `ThemeColorGrid`, `StyleSelector`, `FontSelector`, `RadiusSelector`, `DropdownKnob`, and `KnobLabel`. Color swatches gain `whileTap` and the dark-mode `ring-white/10` already present is audited for parity. `blueprint-design-preset-field.tsx` summary card is polished to rhyme with `blueprint-demo-design-card.tsx`'s browser-chrome address-pill / accent-strip rhythm and the typographic scale, without copying verbatim. If the field grows above 150 lines after the polish, `BlueprintDesignPresetSummary` is extracted into a sibling file.

Slice 5 polishes `blueprint-page-save-bar.tsx`. The bar is wrapped in a sticky-on-mobile shell (`sticky bottom-2 z-20 sm:static` plus `bg-background/85 backdrop-blur` plus `pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-0`) so the save action stays reachable. Loading copy becomes phase-aware: `Saving your blueprint...` while `isSaving && feedback?.tone !== "success"`, `Opening review...` while `isSaving && feedback?.tone === "success"` (i.e. the unlock-and-redirect window). Destructive feedback (the `hasSubmitError` branch surfaced via `feedback.tone === "destructive"`) is rendered with `role="alert"` and a small dismiss affordance. If the file would exceed 150 lines, `BlueprintPageSaveBarStatus` is extracted. `blueprint-stage-leave-dialog.tsx` is audited: the destructive button's class string already keeps a strong dark-mode background; copy is unchanged ("Stay" / "Leave without saving"). Escape and backdrop click already invoke `onStay` via the AlertDialog primitive's `onOpenChange` chain since `open={isOpen}` is controlled - audited only.

Slice 6 walks all 7 sections at 1440px, 768px, and 390px in light and dark mode. The lg/md mid-breakpoint between losing the XL sidebar and the section column getting room to breathe is tightened by adjusting the page body wrapper's `max-w-*` and `gap-*` if a real awkward middle viewport is observed. A repo grep (`rg "bg-primary|text-primary" apps/web/app/\(workspace\)/_components/blueprint-flow`) confirms no new violations. Any non-polish issues observed (e.g. theme preview hard-coded `oklch` strings, the `--primary` cascade) are noted as structural follow-ups for separate Linear issues, not absorbed.

Slice 7 runs the full validation matrix and assembles the screenshot bundle.

## Milestones

Milestone 1: Page shell, overview, sidebar
- Scope: Slice 1.
- End state: `blueprint-page.tsx` is under 150 lines; `blueprint-page-body.tsx` exists; `blueprint-page-motion.ts` exposes `useBlueprintPageReducedMotion`; the sidebar shows empty / started / complete dots and an active-section affordance; the overview rhythm reads cleaner.
- Run: `bun run --cwd apps/web vitest run tests/integration-ui/blueprint-page.test.tsx tests/unit/use-blueprint-page-state.test.tsx tests/unit/blueprint-stage-step-field.test.tsx`, then `bun run format && bun lint && bun typecheck`.
- Success: tests green, gates green, manual pass at 1440px desktop in light and dark shows the sidebar dots updating as fields are filled, and the active-section affordance tracks the section in view.

Milestone 2: Section card completion moment
- Scope: Slice 2.
- End state: completion badge morphs via `layoutId` and pulses once on first complete; reduced-motion fallback verified; mobile stack reads cleanly at 390px.
- Run: same test bundle as Milestone 1.
- Success: tests green, gates green, manual proof of the morph and pulse, reduced-motion proof.

Milestone 3: List + link-list micro
- Scope: Slice 3.
- End state: list rows reflow with `AnimatePresence`; chips reflow on add/remove; keyboard reorder and focus management still pass.
- Run: same test bundle as Milestone 1, plus manual keyboard interaction.
- Success: tests green, gates green, no focus regression, reduced-motion proof.

Milestone 4: Design + theme polish
- Scope: Slice 4.
- End state: `blueprint-stage-step-field.tsx` is under 150 lines; `blueprint-stage-design-field.tsx`, `blueprint-stage-theme-field.tsx`, and `blueprint-theme-configurator-controls.tsx` exist; `blueprint-theme-configurator.tsx` is under 150 lines; the design summary card rhymes visually with the demo card; dark-mode rings audited.
- Run: same test bundle as Milestone 1, plus `bun run --cwd apps/web vitest run tests/unit/blueprint-theme-tokens.test.ts tests/unit/blueprint-field-scales.test.ts`.
- Success: tests green, gates green, the design preset Notion test in `blueprint-page.test.tsx` (which exercises the Select interaction) still passes, manual proof in both modes.

Milestone 5: Save bar + leave dialog
- Scope: Slice 5.
- End state: save bar is sticky on mobile, copy is phase-aware, destructive feedback is `role="alert"` with dismiss; leave dialog audited.
- Run: same test bundle as Milestone 1, plus `bun run --cwd apps/web vitest run tests/integration-ui/blueprint-stage-navigation.test.tsx tests/unit/blueprint-stage-save-feedback.test.tsx tests/unit/blueprint-step-save-feedback.test.ts`.
- Success: tests green, gates green, manual leave-dialog proof (dirty a field, click a primary nav link, see Stay vs. Leave behavior), manual sticky-save-bar proof on the 390px viewport.

Milestone 6: Dark-mode + reflow audit
- Scope: Slice 6.
- End state: all 7 sections audited at 3 viewports in both modes; the mid-breakpoint between losing the sidebar and getting column room is tightened; no new `bg-primary` / `text-primary` introduced; structural follow-ups noted.
- Run: `rg "bg-primary|text-primary" apps/web/app/\(workspace\)/_components/blueprint-flow` returns no matches.
- Success: grep clean, screenshot grid captured, follow-up notes recorded.

Milestone 7: Validation matrix and screenshot bundle
- Scope: Slice 7.
- End state: all gates pass, the focused vitest set passes, browser proof captured, reduced-motion proof captured.
- Run: see Test Commands.
- Success: matrix table written into `Outcomes & Retrospective`, screenshot index linked from `Artifacts and Notes`.

## Concrete Steps

The exact commands and file-touch lists are recorded per slice below. Update this section as work proceeds.

Slice 0 (this milestone): write this ExecPlan. No code changes. Run `git status --short` from the repo root to confirm scope.

Slice 1 commands:

    bun run --cwd apps/web vitest run tests/integration-ui/blueprint-page.test.tsx tests/unit/use-blueprint-page-state.test.tsx tests/unit/blueprint-stage-step-field.test.tsx
    bun run format
    bun lint
    bun typecheck

Slice 2..6 commands: same shape, with the per-milestone test bundle named above.

Slice 7 commands:

    bun run --cwd apps/web vitest run tests/integration-ui tests/unit
    bun run format
    bun lint
    bun typecheck

## Validation and Acceptance

Acceptance is observable. After every slice the focused vitest bundle for that slice and the repo gates `bun run format`, `bun lint`, `bun typecheck` must pass. The final slice runs the full `apps/web` `tests/integration-ui tests/unit` vitest sweep. Manual browser proof against the live Convex dev workspace must demonstrate, at minimum:

- the sidebar dots update (empty -> started -> complete) as a section is edited and saved
- the active-section affordance tracks the section currently in view as the page is scrolled
- the section-card badge morphs from number to check on first complete and pulses once
- adding and removing a list row animates the reflow; keyboard reorder still works
- adding and removing a link chip animates; Backspace on the empty input still removes the last chip
- selecting a different design preset re-seeds `theme_preset` and `design_references` (already covered by the Notion test in `blueprint-page.test.tsx`)
- the theme configurator color swatches show a tap pulse and the dark-mode rings stay legible
- the save bar shows `Saving your blueprint...` while saving partial work, then shows `Add an answer here before Review can unlock.` errors inline
- the save bar shows `Opening review...` while the unlock-and-redirect window is open
- dirtying a field then clicking a primary nav link opens the leave dialog; Stay returns focus to the page; Leave navigates away
- a forced save error renders an inline `role="alert"` region with a dismiss control

Reduced-motion proof: enable `prefers-reduced-motion: reduce` (macOS Reduce Motion or DevTools emulation) and confirm every new animation falls back to opacity-only or no animation. The `useBlueprintPageReducedMotion` helper is verified by inspection (it returns the `useReducedMotion()` value from `motion/react`).

### Test Commands

Focused, per-slice (substitute the slice's bundle from Milestones above):

    bun run --cwd apps/web vitest run tests/integration-ui/blueprint-page.test.tsx tests/unit/use-blueprint-page-state.test.tsx tests/unit/blueprint-stage-step-field.test.tsx

Wider blueprint vitest sweep (Slice 7):

    bun run --cwd apps/web vitest run \
        tests/integration-ui/blueprint-page.test.tsx \
        tests/integration-ui/blueprint-stage-navigation.test.tsx \
        tests/integration-ui/blueprint-local-draft-seeder.test.tsx \
        tests/unit/blueprint-page-state-model.test.ts \
        tests/unit/use-blueprint-page-state.test.tsx \
        tests/unit/blueprint-stage-step-field.test.tsx \
        tests/unit/blueprint-stage-scale-field.test.tsx \
        tests/unit/blueprint-stage-save-feedback.test.tsx \
        tests/unit/blueprint-step-save-feedback.test.ts \
        tests/unit/blueprint-section-draft-assistant.test.tsx \
        tests/unit/blueprint-theme-tokens.test.ts \
        tests/unit/blueprint-field-scales.test.ts

Repo-level gates (after every slice):

    bun run format
    bun lint
    bun typecheck

Manual browser proof (Slice 7):

    bun run --cwd apps/web dev

Then visit `/blueprint` against the hosted Convex dev workspace at 1440px, 768px, and 390px in light and dark mode. Exercise at least one field per section. Trigger the leave dialog. Toggle `prefers-reduced-motion: reduce`.

## Idempotence and Recovery

Every slice is additive at the file level except for the splits (`blueprint-page.tsx`, `blueprint-stage-step-field.tsx`, `blueprint-theme-configurator.tsx`). Splits are safe to rerun: the import-from-source files reference the extracted modules by relative path and the extracted modules contain only presentational components.

To recover from a partially completed slice:

- run `git status --short` to see what was added or modified
- if a new sub-component file was created but the parent was not yet wired, either delete the new file or finish the wiring; do not leave orphaned files
- if the new ExecPlan file is incomplete, finish writing it before moving on; the lint command in the wider sweep does not yet enforce ExecPlan structure but the contract in `docs/exec-plans/PLANS.md` does
- if the focused vitest bundle fails after a polish-only diff, the failure is the source of truth: do not patch the test to make it pass; revert the polish that caused the regression and replan

To recover from a forgotten "do not commit": run `git status` to confirm nothing was actually committed, since the brief explicitly says do not commit unless asked.

## Artifacts and Notes

Baseline notes captured during research on 2026-05-02:

- `BlueprintPage` line count: 158
- `BlueprintPageSectionCard` line count: 109
- `BlueprintPageProgressSidebar` line count: 78
- `BlueprintPageSaveBar` line count: 54
- `BlueprintPageOverview` line count: 34
- `BlueprintStageLeaveDialog` line count: 47
- `BlueprintStageStepField` line count: 252
- `BlueprintStageListField` line count: 195
- `BlueprintStageLinkListField` line count: 149
- `BlueprintDesignPresetField` line count: 234
- `BlueprintThemeConfigurator` line count: 362
- `BlueprintThemePreview` line count: 306
- `BlueprintSectionDraftAssistant` line count: 119
- `BlueprintLocalDraftSeeder` line count: 42 (untouched by this plan)
- No `data-testid` attributes exist in any blueprint-flow component on the workspace authoring surface today.
- No `bg-primary` or `text-primary` Tailwind classes exist in the blueprint-flow folder today.
- No `motion/react` imports exist in the blueprint-flow folder today.
- `BlueprintThemePreview` already uses inline `style={{ backgroundColor: "var(--primary)" }}` for the live preview; that is a CSS variable, not a Tailwind class, and is not affected by the no-`bg-primary` rule.

Browser screenshot bundle (light + dark, 1440px + 768px + 390px, all 7 sections) is captured during Slice 7 against the hosted Convex dev workspace and indexed below.

Per-slice screenshot index: to be filled in.

Untouched-but-already-polished list: to be filled in.

Structural follow-ups for separate Linear issues: to be filled in.

## Interfaces and Dependencies

Existing libraries and modules this plan depends on:

- `motion/react` from the workspace `node_modules` (already a transitive dependency via the `blueprint-demo` surface). Imports used: `motion`, `AnimatePresence`, `useReducedMotion`, optionally `LayoutGroup`.
- `lucide-react` for `CheckCircle2Icon`, `ChevronDownIcon`, `ChevronUpIcon`, `Circle`, `Lock`, `LinkIcon`, `XIcon`, `PlusIcon`, `DicesIcon`, `CheckIcon`, `ArrowRightIcon` (all already imported by the in-scope files).
- shadcn primitives: `Field`, `Input`, `Textarea`, `Button`, `Spinner`, `Progress`, `Select`, `Collapsible`, `AlertDialog`, `Dialog`. No primitive contract changes.
- `@/lib/blueprint-flow/blueprint-page-sections` (`blueprintPageSections`, `BlueprintPageSectionId`, `BLUEPRINT_OVERVIEW_ID`). Imported only.
- `@/lib/blueprint-flow/blueprint-page-validation-model` (`BlueprintPageSectionStatus`). Imported only.
- `@shipbysunday/blueprint-compiler` (`CanonicalProjectFactKey`, `CanonicalProjectFactsDraft`, `BlueprintStepDefinition`, `isBlueprintArrayField`, `designPresetDefinitions`, `resolveDesignPresetDefinition`, `buildDesignPresetFactSeed`). Imported only.

New helpers introduced by this plan:

- `useBlueprintPageReducedMotion()` in `apps/web/app/(workspace)/_components/blueprint-flow/blueprint-page-motion.ts`. Wraps `useReducedMotion()` from `motion/react` and returns a non-null `boolean` (defaults to `false`).

No new mutations, queries, schema, env vars, lockfile changes, or third-party packages.
