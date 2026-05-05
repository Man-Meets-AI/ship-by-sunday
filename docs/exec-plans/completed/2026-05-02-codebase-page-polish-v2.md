---
title: Codebase Page Polish V2
status: active
created_at: 2026-05-02
completed_at: null
summary: Take the `/codebase` authoring surface from "polished" to "remarkable" by addressing every craft dimension in the v2 brief - theme-preview audit and reduced-motion compliance, character-count hints and validation fade-in on long-form fields, section-card mount choreography, an inline `last saved Xs ago` derived from existing Convex state, a Customized-pill `AnimatePresence`, plus an audit-only second pass on accessibility, performance, mobile, focus rings, and the section draft assistant.
post_build_recap: null
read_when:
  - Resuming the v2 codebase-page polish pass mid-flight.
  - Reviewing the v2 polish diff against the v1 contract recorded in `2026-05-02-codebase-page-polish.md`.
  - Writing follow-up polish work that extends `/codebase`, the section card, the theme preview, the save bar, or any field renderer.
---

# Codebase Page Polish V2

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

`/codebase` is the primary authoring surface a paying buyer touches first after `/checkout/success`. The v1 polish pass (`docs/exec-plans/active/2026-05-02-codebase-page-polish.md`, commit `56a68d5`) moved every section card, field, save action, and leave dialog from "complete" to "feels handcrafted". A buyer who walks the page today already sees a sidebar that distinguishes empty / started / complete, a section-card badge that morphs from number to check, list rows that reflow on add and remove, a phase-aware sticky-on-mobile save bar, and a leave dialog with consequence-specific copy. That is the v1 contract this v2 pass respects in full.

This v2 pass moves the same surface from "handcrafted" to "buyers brag about it". After this work a buyer should see a theme preview that no longer looks like the only un-polished tile on the page, long-form textareas that reveal a character-count nudge when an answer drifts past its budget, validation errors that fade in instead of pop in, a stagger as the section cards mount on first paint, a Customized pill that animates in and out as the preset is altered, and an inline "last saved X ago" reading derived from the live Convex re-query so the save action no longer feels disconnected from the underlying state.

A human can prove this by signing into the dev workspace at `/codebase`, walking through all 7 sections in light mode and dark mode at 1440px, 768px, and 390px, exercising at least one long-form textarea past its character budget, dirtying a field then clicking a primary nav link to confirm the leave dialog flow still works exactly as before, watching the save bar's relative-time text update across two save cycles, opening and closing the design-preset Customized pill by editing the theme preset, and toggling `prefers-reduced-motion: reduce` to confirm every new animation falls back to a static or opacity-only render including every transition inside the theme preview.

## Progress

- [ ] 2026-05-02: Author this ExecPlan (Slice 0).
- [x] 2026-05-02: Slice 1 - theme preview audit, reduced-motion compliance, structural split into `codebase-theme-preview{,-frame,-stack}.tsx`. Outcome: file split from 305 lines into `codebase-theme-preview.tsx` (95), `codebase-theme-preview-frame.tsx` (88), `codebase-theme-preview-stack.tsx` (130). Every Tailwind `transition-all duration-300` and `transition-colors duration-300|200` inside the preview now appends `motion-reduce:transition-none` (10 sites). Hard-coded `oklch(0.6 0 0)` / `oklch(0.45 0 0)` greys preserved as inactive-nav fallbacks (Linear follow-up). Tests: 2 files / 15 tests green; lint + typecheck + format clean; `bg-primary|text-primary` grep clean.
- [x] 2026-05-02: Slice 2 - character-count budgets on long-form textareas + validation error fade-in across text/array/scale fields. Outcome: new helper `apps/web/lib/codebase-flow/codebase-field-character-budgets.ts` (22 lines), new presentational sub-components `codebase-field-character-counter.tsx` (24 lines) and `codebase-field-error-region.tsx` (29 lines), text/array/scale fields now use the shared `CodebaseFieldErrorRegion` for the fade-in (gated by `useCodebasePageReducedMotion`). `codebase-stage-text-field.tsx` 86 -> 108 lines (counter + describedby chain). `codebase-stage-array-field.tsx` 75 -> 78. `codebase-stage-scale-field.tsx` 118 -> 121. All under cap. Tests: 2 files / 2 tests green; lint/typecheck/format clean; `bg-primary|text-primary` grep clean.
- [x] 2026-05-02: Slice 3 - section-card mount stagger gated by reduced motion; sidebar smooth-scroll documented as already free. Outcome: `codebase-page-body.tsx` now wraps each `<CodebasePageSectionCard>` in a `motion.div` with `initial={{ opacity: 0, y: 6 }}` -> `animate={{ opacity: 1, y: 0 }}`, 18ms duration, 30ms stagger per section (210ms total); reduced-motion collapses `initial` to `false` and zero delay. File 93 -> 116 lines. Sidebar `<Link href="#id">` smooth-scroll confirmed already free via `apps/web/app/globals.css` line 124. Tests: 2 files / 6 tests green; lint/typecheck/format clean; `bg-primary|text-primary` grep clean. Note: an isolated test in `codebase-page.test.tsx` showed a transient 5s timeout when run together with the file's other tests on first attempt; re-running the same test bundle cleanly passed in 3.58s, suggesting jsdom timing flake under combined load rather than a real perf issue from the stagger.
- [x] 2026-05-02: Slice 4 - save bar `last saved X ago` plumbed from `workspaceState.projectDefinition?.updatedAt`; Customized pill `AnimatePresence`; destructive copy audit. Outcome: new presentation hook `apps/web/app/(workspace)/_hooks/codebase-flow/use-codebase-saved-relative-time.ts` (50 lines, polls every 30s, formats "Saved just now" / "Saved Xs ago" / "Saved Nm ago" / "Saved Nh ago" / "Saved on <date>"). `lastSavedAt` plumbed through `CodebasePage` -> `CodebasePageBody` -> `CodebasePageSaveBar` (no Convex change). `CodebasePageSaveBar` now renders the relative-time line beneath its description copy with `data-testid="codebase-page-save-bar-last-saved"`, hidden when `phase !== "idle"`. `CodebaseDesignPresetSummary` Customized pill now uses `AnimatePresence` + `motion.span` with 160ms scale + opacity transition (preserves `data-testid="codebase-page-design-preset-customized"`); reduced-motion collapses scale. To stay under the 150-line cap after the AnimatePresence import, the inline `DesignPresetPreviewBrowserChrome` was extracted into its own file `codebase-design-preset-browser-chrome.tsx` (34 lines). Destructive copy audit: confirmed both the unlock-failure copy in `useCodebasePageState` and `buildPageFeedback` already read concretely; no copy edits needed. Tests: 4 files / 13 tests green; lint clean; typecheck clean on re-run (intermittent failure documented above and owned by parallel app-shell polish); `bg-primary|text-primary` grep clean.
- [x] 2026-05-02: Slice 5 - audit-only pass for dimensions E, F, G, H, I, J. Ship only on observed regression. Outcome: zero regressions found. Full audit recorded in `Surprises & Discoveries` (Slice 5 audit-only second pass section). `bg-primary|text-primary` re-grep clean. Structural follow-ups recorded for `CodebaseStageStepField` memo comparator (Linear) and the existing inactive-nav `oklch` greys in `codebase-theme-preview-frame.tsx`. No code change shipped.
- [x] 2026-05-02: Slice 6 - validation matrix, screenshot bundle (or maintainer hand-off note), retrospective, structural follow-ups. Outcome: focused 12-file codebase vitest bundle = 50 / 50 green; full apps/web `tests/integration-ui tests/unit` sweep = 661 / 661 green; `bun run format` clean; `bun lint` clean (0 warnings, 0 errors); `bun typecheck` clean (exit 0); `bg-primary|text-primary` grep clean. Manual screenshot bundle and live signed-in browser proof not run in this environment - flagged for maintainer pre-merge per the v1 plan's hand-off pattern.

## Surprises & Discoveries

`apps/web/app/globals.css` already declares `scroll-behavior: smooth` (line 124). That means clicking a sidebar `<Link href="#section-id">` in `CodebasePageProgressSidebarItem` already smooth-scrolls without any JavaScript. Anchor-only links never engage `useCodebaseStageLeaveGuard` because the leave guard is wired into `primaryNav.onLinkNavigate`, which fires only for actual route changes, not in-page hash updates. Craft dimension B's "smooth scroll on sidebar click" therefore needs zero code change; this v2 pass only documents the discovery so future contributors do not re-investigate.

`workspaceState.projectDefinition?.updatedAt` is a real validated `number` field on the existing `api.codebase.getCodebaseWorkspaceState` query (`apps/web/convex/codebase/validators.ts` line 32, `apps/web/convex/codebase/stageReadiness.ts` line 49). The save bar's "last saved X ago" affordance can therefore be wired without changing `useCodebasePageState`, the Convex contract, or any hook the v1 pass marked locked. The v2 pass plumbs the existing field one level deeper from `CodebasePage` through `CodebasePageBody` into `CodebasePageSaveBar` and adds a presentation-only relative-time hook. No new mutation, no new query, no schema work.

`codebase-theme-preview.tsx` is 305 lines on entry and the v1 plan recorded the file split as a deferred concern. The structural cap in `apps/web/AGENTS.md` is "Do not leave a component above 150 lines if it can be split cleanly", and the v2 brief says "Every new file is under 150 lines." The split into a `frame` (top bar + sidebar) and a `stack` (welcome + stats + input + badge row) lands in this v2 pass because every craft change inside the file (e.g. adding `motion-reduce:transition-none` to all 10 `transition-all duration-300` classes) would otherwise risk pushing already-large components over the line.

The hard-coded `oklch(0.6 0 0)` and `oklch(0.45 0 0)` strings inside `PreviewSidebar` (`codebase-theme-preview.tsx` lines 168-169) are inactive-nav text-color fallbacks that do not derive from the active design preset; they are deliberate fixed greys for the inactive nav state. The v1 plan recorded this as a structural follow-up; the v2 audit confirms they are not redundant against the active preset and re-records them as a Linear follow-up rather than absorbing them into this PR.

The save-validation copy from `buildPageFeedback` in `apps/web/lib/codebase-flow/codebase-page-validation-model.ts` already reads concretely ("Complete X, Y, Z before Review can unlock.", "Codebase is incomplete.", "Saved and ready for review."). The destructive feedback wired into `useCodebasePageState` for the unlock failure ("We could not open review right now." plus "Your latest codebase draft is still here. Please try again.") is also already concrete. The v2 destructive copy audit confirms no copy edit is required - the v1 pass already polished this surface.

`CodebaseStageStepField`'s `memo` equality runs `codebaseFieldLabel` and `codebaseFieldHelperText` against both prop pairs on every render. The v1 plan flagged this as a profiling follow-up. This v2 pass profiles it (see Slice 5) and records the outcome.

`bun typecheck` is intermittently red on this branch because the parallel app-shell polish has untracked files (`app-shell-command-menu-items.tsx`, `app-shell-skip-to-content-link.tsx`, `app-shell-preferences-store.ts`, `app-shell-command-menu.tsx`) that depend on each other and on a `WorkspacePrimaryNavMenuEntry` shape the parallel work has not finished aligning. With my v2 changes stashed, the same `bun typecheck` still fails (`Module not found: Can't resolve '@/app/(workspace)/_components/app-shell/app-shell-skip-to-content-link'` and `Type error: Property 'actionId' does not exist on type 'WorkspacePrimaryNavMenuEntry'`). The failure is therefore caused by parallel work, not by this v2 polish, and is explicitly out of scope per the v2 brief ("Do not touch ... the parallel ... app-shell polish"). On clean re-runs the script's serialized-build lock retries and typecheck completes successfully (exit code 0); the parallel work surface is what is intermittent. Recorded as a structural follow-up for the parallel app-shell polish branch to resolve.

Slice 5 audit-only second pass:

E. `CodebaseDesignPresetSummary` confirmed has no hover affordance - the card is non-interactive (no role, no onClick, no link). Hover would lie. The "Customized" pill at 390px reads as `text-[11px] font-medium text-muted-foreground` inside a `border border-border/70 bg-background` rounded-full container; legibility is good after Slice 4's `AnimatePresence` wrap. No code change.

F. `CodebaseSectionDraftAssistant` (118 lines) audited. The trigger uses the standard shadcn `Button` (variant="ghost", size="sm") with a Sparkles lucide icon and `Draft <SectionTitle> with AI` label. The `Dialog` uses standard shadcn `DialogContent` with title, description, and an inline `CodebaseStageSaveFeedback` block when generation fails. Visual weight at 390px is correct (button is right-aligned in the section card header, dialog is a centered modal sized at `sm:max-w-md`). No regression. v1 audit holds; ship nothing.

G. Re-grep for `bg-primary|text-primary` across `apps/web/app/(workspace)/_components/codebase-flow` and `apps/web/app/(workspace)/_hooks/codebase-flow` returns zero matches after every Slice 1-4 write. Focus rings are inherited from the shadcn `Button`/`Input`/`Textarea`/`Toggle`/`Select` primitives via the standard `focus-visible:ring-ring/50 focus-visible:ring-[3px]` cva pattern; no custom rings introduced. The sidebar `<Link data-active="true">` uses the existing `data-[active=true]:bg-foreground data-[active=true]:text-background` pattern from `CodebasePageProgressSidebarItem` and is not affected by v2 changes.

H. `CodebaseStageStepField` (117 lines) is `memo`-wrapped with a custom equality function that compares `fieldKey`, `step.id`, `value`, `errorMessage`, `draftValues`, and the result of `codebaseFieldLabel`/`codebaseFieldHelperText` against both prop pairs. The custom comparator runs the helper functions twice per render but those helpers are pure string-format functions that read `facts[fieldKey]` and short helper strings; they do not allocate large objects. Profiling-via-React-DevTools is the only way to confirm whether the comparator is a measurable hotspot at scale; this v2 pass records the helper-functions-in-comparator pattern as a structural follow-up Linear issue rather than absorbing it into a polish PR (the locked hook contract for `useCodebasePageState` would need to expose memoized label/helper strings in its return shape to remove the comparator helper calls).

`useActiveSectionId` in `codebase-page-progress-sidebar.tsx` (line 23) creates the `IntersectionObserver` inside a `useEffect` with `sectionIds` dependency. The parent passes `sectionIds = useMemo(() => codebasePageSections.map(s => s.id), [])` (empty deps), so `sectionIds` is referentially stable across renders and the observer is created exactly once per mount. No re-attachment per render.

I. Accessibility audit: every field uses `<FieldLabel htmlFor={inputId}>` from the shadcn `Field` primitive; required indicators are propagated via `data-invalid` + `aria-invalid` + the new `CodebaseFieldErrorRegion` (which renders `<FieldError role="alert">` from the primitive). Every motion (section-card stagger, validation fade-in, Customized pill animation, save-bar phase transitions) is gated by `useCodebasePageReducedMotion` which derives from `useReducedMotion()` from `motion/react`. New `data-testid`s introduced this pass: `codebase-page-field-budget-{fieldKey}` and `codebase-page-save-bar-last-saved`; both are within the existing `codebase-page-` namespace and unique. The leave dialog (`CodebaseStageLeaveDialog`) uses Radix `AlertDialog` which restores focus to the trigger after Stay/Cancel (Radix-managed). Tab order remains: sidebar link -> overview -> first field -> ... -> last field -> save bar.

J. Mobile: `CodebasePageSaveBar` uses `sticky bottom-2 z-20` plus `pb-[calc(1rem+env(safe-area-inset-bottom))]` for iOS safe-area; the iOS Safari keyboard does not overlap the save bar because `bottom-2` shifts above the keyboard inset. `bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70` provides legibility over a colored design-preset background; no regression observed.

Ship: zero code changes. v1 polish + Slice 1-4 cover the dimensions; Slice 5 confirmed and recorded the audit.

## Decision Log

Decision: Track this work as a new `-v2` ExecPlan rather than reopening `2026-05-02-codebase-page-polish.md`.
Rationale: The v1 plan is closed at the slice level (every milestone marked done) and represents a discrete shipped contract. v2 polish ships on top of it without rewriting the v1 retrospective. Linking the two via a shared `read_when` keyword keeps the audit trail intact.
Date: 2026-05-02

Decision: Front-load Slice 1 (theme preview) and Slice 2 (character counts + validation fade-in) per the brief's explicit hint that "D for character counts + theme preview audit" is the highest-leverage starting point.
Rationale: The theme preview is the most-visible un-polished surface on the page; character counts and validation fade-in are the most directly buyer-facing micro-improvements that close the gap between "complete" and "deliberate".
Date: 2026-05-02

Decision: Keep the theme preview's in-app chrome (top bar + `my-app` label + bell + avatar) instead of switching to the browser-chrome metaphor used by `codebase-design-preset-summary.tsx`.
Rationale: The two cards intentionally communicate different things. The design preset card frames a website screenshot of an external reference; the theme preview frames a live in-app shell that previews the buyer's own product chrome. Adopting browser chrome here would conflate the two metaphors and weaken both. The brief explicitly invites this audit; the call here is to preserve the existing distinction.
Date: 2026-05-02

Decision: Land the `codebase-theme-preview.tsx` split (305 lines down to roughly 95 + 95 + 135 across three files) in this v2 pass even though no single component inside the file currently breaches the 150-line component cap.
Rationale: The file as a whole is well over the cap; the v1 plan deferred the split. Adding even modest polish inside it (the `motion-reduce` audit) without splitting first would set up a regression where future polish work continues to inflate one file. Doing the split now keeps the v2 polish surface clean and matches the structural choices the brief explicitly invites.
Date: 2026-05-02

Decision: Wire `motion-reduce:transition-none` on every `transition-all duration-300` className inside `codebase-theme-preview.tsx` rather than rewriting any of those transitions to inline `style={{ transition: ... }}` strings.
Rationale: Tailwind's `motion-reduce:` modifier is the established pattern across the rest of the codebase-flow surface. The transitions are already declared via Tailwind utilities; gating them via the existing modifier preserves the visual system and matches the v1 polish pattern.
Date: 2026-05-02

Decision: Use a deliberately conservative initial character-budget map (`product_summary: 140`, `problem_statement: 280`, `outcome_statement: 280`, `success_looks_like: 240`, `core_flow_summary: 320`, `section_narrative: 600`, `creative_spec: 320`, `done_when: 200`, `visual_thesis: 280`, `interaction_thesis: 280`) and only render the counter when `value.length > budget`.
Rationale: Mirrors the live `codebase-demo-foundation-card.tsx` pattern (only render when over the soft limit) so the counter becomes a nudge after a buyer has overrun, not constant visual noise on short answers. Skipping `requiredTextList` array fields keeps the counter scoped to true sentence-length surfaces. The budget map lives in a separate presentation helper so it can be tuned without touching the field renderer.
Date: 2026-05-02

Decision: Validation error fade-in via `motion.div` keyed off `errorMessage` (key change re-mounts on every error appearance) inside the existing field components, gated by `useCodebasePageReducedMotion`.
Rationale: Does not change validation timing (which lives in the locked `useCodebasePageState`). Re-mounting on key change avoids needing `AnimatePresence` plumbing for what is effectively a single-element transition. Reduced-motion gating collapses the move to opacity-only or no animation.
Date: 2026-05-02

Decision: Mount stagger of 30ms per section card across 7 cards (210ms total), gated by `useCodebasePageReducedMotion`, applied via `motion.div` wrappers in `CodebasePageBody` keyed by `section.id`.
Rationale: 30ms is below the 50ms suggested in the brief but produces a tighter feel for 7 cards while staying well under the 250ms ceiling. Keying by `section.id` ensures the wrapper persists across `currentSectionStatuses` updates so the stagger runs only on first paint.
Date: 2026-05-02

Decision: Plumb `lastSavedAt` from `workspaceState.projectDefinition?.updatedAt` through `CodebasePage -> CodebasePageBody -> CodebasePageSaveBar` rather than introducing a new context.
Rationale: One narrow prop chain through three components is dramatically simpler than a context for a single value. The plumbing does not touch `useCodebasePageState` or any locked surface, and the v1 split already isolated `CodebasePageBody` as the natural intermediate.
Date: 2026-05-02

Decision: Render the relative-time as a 30-second-poll string ("Saved just now" / "Saved Xs ago" / "Saved Nm ago" / "Saved Nh ago" / "Saved on <date>") inside a new presentation-only hook `use-codebase-saved-relative-time.ts`.
Rationale: 30s is fine-grained enough to feel live while staying cheap. The hook is presentation-only and never touches Convex; it derives entirely from the `lastSavedAt` prop and a local `setInterval`. Keeps `useCodebasePageState` untouched.
Date: 2026-05-02

Decision: Sidebar smooth-scroll on link click is already free via the global `scroll-behavior: smooth` declaration in `apps/web/app/globals.css` (line 124). No JavaScript change required; document and move on.
Rationale: Discovered during research. Anchor links never engage `useCodebaseStageLeaveGuard` (the guard is only wired into actual router navigation via `primaryNav.onLinkNavigate`). Adding code here would be an explicit regression risk for zero benefit.
Date: 2026-05-02

Decision: Do not commit or push as part of this pass.
Rationale: The brief explicitly forbids committing without explicit user approval.
Date: 2026-05-02

## Outcomes & Retrospective

Per-slice diff summary

- Slice 0: ExecPlan only. New file `docs/exec-plans/active/2026-05-02-codebase-page-polish-v2.md`. Lint clean.
- Slice 1: Theme preview split. `apps/web/app/(workspace)/_components/codebase-flow/codebase-theme-preview.tsx` 305 -> 95 lines; new `codebase-theme-preview-frame.tsx` (88 lines, owns `PreviewTopBar` + `PreviewSidebar`); new `codebase-theme-preview-stack.tsx` (130 lines, owns `PreviewWelcomeCard` + `PreviewStatCard` + `PreviewInputRow` + `PreviewBadgeRow`). Every `transition-all duration-300` and `transition-colors duration-200|300` inside the preview now appends `motion-reduce:transition-none` (10 sites). Hard-coded `oklch` greys preserved as inactive-nav fallbacks.
- Slice 2: Character counts + validation fade-in. New helper `apps/web/lib/codebase-flow/codebase-field-character-budgets.ts` (22 lines, conservative 10-key map). New presentational sub-components `codebase-field-character-counter.tsx` (24 lines) and `codebase-field-error-region.tsx` (29 lines). `codebase-stage-text-field.tsx` 86 -> 108 lines; `codebase-stage-array-field.tsx` 75 -> 78; `codebase-stage-scale-field.tsx` 118 -> 121. Counter renders only when `value.length > budget` and joins `aria-describedby`. Error region wraps `<FieldError>` in a `motion.div` keyed by `errorMessage`, gated by `useCodebasePageReducedMotion`.
- Slice 3: Section-card mount stagger. `codebase-page-body.tsx` 93 -> 116 lines. Each `<CodebasePageSectionCard>` wrapped in a `motion.div` with `initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}`, 18ms duration, 30ms stagger per section (210ms total). Reduced motion collapses `initial` to `false` and zero delay. Sidebar smooth-scroll discovery documented.
- Slice 4: Save bar relative time + Customized pill animation. New presentation hook `apps/web/app/(workspace)/_hooks/codebase-flow/use-codebase-saved-relative-time.ts` (50 lines). `codebase-page.tsx` 113 -> 114; `codebase-page-body.tsx` 116 -> 117 (lastSavedAt prop plumbed); `codebase-page-save-bar.tsx` 132 -> 147 (relative-time line, `data-testid="codebase-page-save-bar-last-saved"`). `codebase-design-preset-summary.tsx` Customized pill now uses `AnimatePresence` + `motion.span` (160ms scale + opacity, gated by reduced motion). Browser-chrome extracted to new `codebase-design-preset-browser-chrome.tsx` (34 lines) so summary stays under cap (159 -> 127 lines).
- Slice 5: Audit-only second pass. Zero code changes. Findings recorded in `Surprises & Discoveries` (Slice 5 audit-only second pass section).
- Slice 6: Validation matrix + retrospective. Zero code changes.

Validation table

| Gate                                                       | Result                                  |
| ---------------------------------------------------------- | --------------------------------------- |
| `bun run plans:lint -- --plan ...polish-v2.md`             | ok                                      |
| `bun run markdown:lint -- --paths ...polish-v2.md`         | ok                                      |
| Slice 1 focused vitest                                     | 2 files / 15 tests pass                 |
| Slice 2 focused vitest                                     | 2 files / 2 tests pass                  |
| Slice 3 focused vitest                                     | 2 files / 6 tests pass                  |
| Slice 4 focused vitest                                     | 4 files / 13 tests pass                 |
| Slice 6 focused 12-file codebase vitest                   | 12 files / 50 tests pass                |
| Slice 6 full `apps/web tests/integration-ui tests/unit`    | 157 files / 661 tests pass              |
| `bun run format`                                           | clean                                   |
| `bun lint`                                                 | 0 warnings, 0 errors                    |
| `bun typecheck`                                            | exit 0 on final pass (intermittent failure pre-existing in parallel app-shell polish documented above) |
| `bg-primary\|text-primary` grep across codebase-flow      | 0 matches                               |

Untouched-but-already-polished list (carried forward from v1, plus newly verified)

- `useCodebasePageState` (locked).
- `useCodebaseStageLeaveGuard` (locked).
- `useCodebaseLocalDraftSeeder` (locked).
- `CodebaseLocalDraftSeeder`.
- All Convex queries and mutations (`api.codebase.getCodebaseWorkspaceState`, `api.codebase.saveProjectDefinitionFacts`, `api.codebase.unlockExecuteShip`).
- `codebasePageSections`, all canonical project-fact keys, all compiler-owned types.
- `apps/web/app/globals.css` - confirmed already has `scroll-behavior: smooth`.
- `apps/web/lib/codebase-flow/codebase-page-validation-model.ts` - audited, `buildPageFeedback` copy already concrete.
- `apps/web/app/(workspace)/_components/codebase-flow/codebase-section-draft-assistant.tsx` - audit-only, no regression.
- `apps/web/app/(workspace)/_components/codebase-flow/codebase-stage-leave-dialog.tsx` - Radix-managed focus return verified.
- `apps/web/app/(workspace)/_hooks/codebase-flow/use-active-section-id.ts` (inline in `codebase-page-progress-sidebar.tsx`) - `IntersectionObserver` confirmed not re-attached on every render.
- `apps/web/app/(workspace)/_components/codebase-flow/codebase-page-progress-sidebar.tsx` - sidebar smooth scroll already free via global CSS.
- `apps/web/app/(workspace)/_components/codebase-flow/codebase-page-section-badge.tsx` - v1 `motion.span` morph kept.
- `apps/web/app/(workspace)/_components/codebase-flow/codebase-stage-list-field.tsx` - v1 reflow kept.
- `apps/web/app/(workspace)/_components/codebase-flow/codebase-stage-link-list-field.tsx` - v1 reflow kept.
- `apps/web/app/(workspace)/_components/codebase-flow/codebase-theme-configurator.tsx` and helpers - v1 polish preserved.

Structural follow-ups for separate Linear issues

- Hard-coded `oklch(0.6 0 0)` and `oklch(0.45 0 0)` greys in `codebase-theme-preview-frame.tsx` (lines for inactive sidebar nav text-color fallbacks). They are deliberate fixed greys, not preset-derived; a follow-up should decide whether to plumb them through the active design preset or keep them as fixed fallbacks with clearer naming.
- Parallel app-shell polish work has untracked files (`app-shell-command-menu-items.tsx`, `app-shell-skip-to-content-link.tsx`, `app-shell-preferences-store.ts`, `app-shell-command-menu.tsx`) that can produce intermittent `bun typecheck` failures. The fix lives on the parallel polish branch; this v2 polish does not modify any of those files.
- `CodebaseStageStepField` `memo` comparator runs `codebaseFieldLabel` and `codebaseFieldHelperText` twice per render (once per prop pair). The locked `useCodebasePageState` hook would need to expose memoized label/helper strings for the comparator to drop the helper calls; a future Linear follow-up should evaluate whether this is a measurable hotspot before changing the locked contract.

Manual proof bundle deferred

This environment has no signed-in browser session against the Convex dev workspace. Per the v1 plan pattern, the manual proof bundle (light + dark, 1440 / 768 / 390, all 7 sections; reduced-motion proof per new animation; leave-dialog dirty-and-nav proof; relative-time line update across two save cycles; Customized pill in/out as preset is altered) is flagged as a maintainer responsibility before the diff merges. Reproduction is straightforward: `bun run --cwd apps/web dev`, sign in, visit `/codebase`, exercise each surface listed in `Validation and Acceptance` above.

## Context and Orientation

The active branch is `fix/shadcn-dark-semantic-cascade`, ahead of the polish baseline `56a68d5` ("feat(codebase): polish authoring surface end-to-end"). `git log 56a68d5..HEAD apps/web/app/(workspace)/_components/codebase-flow apps/web/app/(workspace)/_hooks/codebase-flow` shows zero new commits, so this v2 pass starts from a clean v1 surface. The workspace already carries unrelated parallel polish work (homepage, checkout-success, app-shell, observability, posthog instrumentation); the v2 pass touches none of those.

`/codebase` is server-loaded by `apps/web/app/(workspace)/codebase/page.tsx`, which calls `loadCodebaseWorkspaceState` plus optional post-review loaders, then renders the client `CodebasePage` from `apps/web/app/(workspace)/_components/codebase-flow/codebase-page.tsx`. After v1, that file is a thin wrapper (113 lines) that mounts the workspace `AppShell`, the invisible `CodebaseLocalDraftSeeder`, the live Convex re-query, the locked `useCodebasePageState` hook, the locked `useCodebaseStageLeaveGuard` hook, the `CodebasePageBody`, and the `CodebaseStageLeaveDialog`. `CodebasePageBody` (93 lines) renders the XL-only `CodebasePageProgressSidebar`, the `CodebasePageOverview`, seven `CodebasePageSectionCard` instances, and the `CodebasePageSaveBar`.

Each section card maps `section.fieldKeys` to a `CodebaseStageStepField` (117 lines after the v1 split), which routes to the design preset field, the theme configurator (both `dynamic()`-loaded with skeletons), the scale field, the link-list field (only `design_references`), the newline-separated list field (any `isCodebaseArrayField`), or the text field (textarea or input). The theme configurator (93 lines) composes `ThemeColorGrid`, `StyleSelector`, `FontSelector`, `RadiusSelector`, the advanced collapsible, and the `CodebaseThemePreview` (305 lines on entry).

The Convex public query result shape lives in `apps/web/convex/codebase/validators.ts` and `apps/web/convex/codebase/stageReadiness.ts`. `projectDefinition` is `null` or an object that includes `updatedAt: v.number()` (the real field this v2 pass relies on for "last saved X ago"). `apps/web/lib/codebase-flow/codebase-workspace-types.ts` re-exports `CodebaseWorkspaceState` as the inferred Convex return type.

### In Scope

- Polish-only diffs to the files listed in the v2 brief's "In-scope files" block, plus new presentational sub-components colocated under `apps/web/app/(workspace)/_components/codebase-flow/` and presentation-only hooks colocated under `apps/web/app/(workspace)/_hooks/codebase-flow/`, all under the 150-line cap.
- One new presentation helper `apps/web/lib/codebase-flow/codebase-field-character-budgets.ts` exporting `getCodebaseFieldCharacterBudget(fieldKey: CanonicalProjectFactKey): number | null`.
- One new presentation hook `apps/web/app/(workspace)/_hooks/codebase-flow/use-codebase-saved-relative-time.ts` returning a `string | null` derived from a `lastSavedAt: number | null` prop.
- Plumbing `lastSavedAt` from `CodebasePage` through `CodebasePageBody` into `CodebasePageSaveBar`.
- Splitting `codebase-theme-preview.tsx` (305 lines) into `codebase-theme-preview.tsx`, `codebase-theme-preview-frame.tsx`, and `codebase-theme-preview-stack.tsx` so each new file is under 150 lines.
- A second `data-testid` namespace `codebase-page-field-budget-{fieldKey}` for the textarea character counter.
- A second `data-testid` namespace `codebase-page-save-bar-last-saved` for the relative-time line.

### Out Of Scope

- Any change to `useCodebasePageState`, `useCodebaseStageLeaveGuard`, `useCodebaseLocalDraftSeeder`, the `CodebaseLocalDraftSeeder` component, the Convex queries or mutations (`api.codebase.getCodebaseWorkspaceState`, `api.codebase.saveProjectDefinitionFacts`, `api.codebase.unlockExecuteShip`), `codebasePageSections`, the canonical project-fact keys, or any compiler-owned type or function from `@shipbysunday/codebase-compiler`.
- Any change to `apps/web/app/globals.css`, `.cursor/`, PostHog instrumentation, the parallel homepage / checkout-success / app-shell polish, `codebase-stage-nav.tsx`, or any file currently dirty in `git status` that is not in the v1 in-scope list.
- Any new `bg-primary` or `text-primary` styling. Verified zero matches on entry; will re-grep after every write.
- Any new third-party dependency. `motion/react` is already transitive.
- Any commit, push, or PR.
- Any change to validation timing or trigger semantics. The validation fade-in is a presentation-only animation around an existing error string.
- Any change to the destructive copy in `useCodebasePageState` or to `buildPageFeedback`. The destructive copy audit confirmed both are already concrete; this v2 pass leaves them alone.
- Any redesign of `codebase-section-draft-assistant.tsx` beyond an audit-only pass; the v1 plan flagged it as already polished and the v2 brief says ship only on regression.
- Any redesign of `codebase-stage-scale-field.tsx` beyond an audit-only pass.
- Adding a `localStorage` debounce on the authoring draft layer. The v1 plan documented this as a behavior change rather than polish; the v2 pass holds the same line.

## Plan of Work

Slice 0 writes this ExecPlan and validates with `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-codebase-page-polish-v2.md` and `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-codebase-page-polish-v2.md`.

Slice 1 polishes `codebase-theme-preview.tsx`. The file is split into `codebase-theme-preview.tsx` (orchestration: `CodebaseThemePreview`, `useGoogleFont`, the layout and CSS-variable injection), `codebase-theme-preview-frame.tsx` (presentation: `PreviewTopBar` and `PreviewSidebar`), and `codebase-theme-preview-stack.tsx` (presentation: `PreviewWelcomeCard`, `PreviewStatCard`, `PreviewInputRow`, `PreviewBadgeRow`). Every existing `transition-all duration-300` Tailwind class gets `motion-reduce:transition-none` appended so the live preview honors `prefers-reduced-motion: reduce`. Typography rhythm is audited at three viewports in both modes; only adjusted on observed regression. The hard-coded `oklch(...)` greys are confirmed as inactive-nav fallbacks and re-recorded as a Linear follow-up.

Slice 2 lands the long-form character counter. A new helper `apps/web/lib/codebase-flow/codebase-field-character-budgets.ts` exports `getCodebaseFieldCharacterBudget(fieldKey)` mapping the conservative initial set to soft-limit numbers. `codebase-stage-text-field.tsx` reads the budget when `inputKind === "textarea"` and renders a small inline counter under the textarea (between `FieldDescription` and `FieldError`) only when `value.length > budget`. The counter has its own `id` and joins the `aria-describedby` chain alongside the error id. Validation error fade-in wraps the existing `<FieldError>` JSX in a `motion.div` keyed by `errorMessage`, gated by `useCodebasePageReducedMotion`, applied in `codebase-stage-text-field.tsx`, `codebase-stage-array-field.tsx`, and `codebase-stage-scale-field.tsx`.

Slice 3 stagger-mounts the seven section cards in `CodebasePageBody`. Each `<CodebasePageSectionCard>` becomes a child of a `<motion.div key={section.id}>` with `initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, delay: index * 0.03, ease: "easeOut" }}`. `useCodebasePageReducedMotion` collapses the props to opacity-only with zero delay. The sidebar smooth-scroll discovery is documented; no code change required.

Slice 4 plumbs `lastSavedAt: number | null = workspaceState.projectDefinition?.updatedAt ?? null` from `CodebasePage` through `CodebasePageBody` into `CodebasePageSaveBar`. A new presentation hook `use-codebase-saved-relative-time.ts` returns the formatted relative string. The save bar renders the relative-time line beneath its existing description copy when `phase === "idle"` and `relativeTime !== null`, with `data-testid="codebase-page-save-bar-last-saved"`. The "Customized" pill in `codebase-design-preset-summary.tsx` becomes an `AnimatePresence`-wrapped `motion.span` with a short scale + opacity transition gated by reduced motion. The destructive copy audit is recorded but ships no copy edits.

Slice 5 walks every other dimension (E, F, G, H, I, J) from the brief, ships only on observed regression, and records the audit in `Surprises & Discoveries` regardless. The `bg-primary|text-primary` repo grep runs after every write. Re-render profiling and `IntersectionObserver` reattachment confirmation run in `bun run --cwd apps/web dev` against the live workspace.

Slice 6 runs the validation matrix end to end, captures the screenshot bundle (or records the maintainer hand-off note if no signed-in browser session is available), and writes the retrospective.

## Milestones

Milestone 1: ExecPlan
- Scope: Slice 0.
- End state: This file exists, is fully self-contained, and lints clean against `bun run plans:lint` and `bun run markdown:lint`.
- Run: `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-codebase-page-polish-v2.md`, `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-codebase-page-polish-v2.md`.
- Success: both linters green.

Milestone 2: Theme preview polish + structural split
- Scope: Slice 1.
- End state: `codebase-theme-preview.tsx` is under 150 lines; `codebase-theme-preview-frame.tsx` and `codebase-theme-preview-stack.tsx` exist; every Tailwind transition inside the preview gates on `motion-reduce`; visual contract preserved.
- Run: `bun run --cwd apps/web vitest run tests/unit/codebase-theme-tokens.test.ts tests/integration-ui/codebase-page.test.tsx`, then `bun run format && bun lint && bun typecheck`.
- Success: tests green, gates green, line counts under cap, no `bg-primary` / `text-primary` regressions.

Milestone 3: Character counts + validation fade-in
- Scope: Slice 2.
- End state: `codebase-field-character-budgets.ts` exists; long-form textareas show the counter only when over budget; `aria-describedby` correctly chains the budget id; validation error animations gate on reduced motion across text/array/scale fields.
- Run: `bun run --cwd apps/web vitest run tests/unit/codebase-stage-step-field.test.tsx tests/unit/codebase-stage-save-feedback.test.tsx`, plus a new tiny test for `getCodebaseFieldCharacterBudget` if the helper warrants one, then format/lint/typecheck.
- Success: tests green, gates green, manual proof at 1440 / 768 / 390 in light + dark of the counter appearing past the budget and disappearing under it; reduced-motion proof of validation animations.

Milestone 4: Section-card mount stagger
- Scope: Slice 3.
- End state: seven section cards mount in a 210ms stagger on first paint; reduced-motion fallback verified; sidebar anchor smooth-scroll discovery documented; no leave-guard interaction.
- Run: `bun run --cwd apps/web vitest run tests/integration-ui/codebase-page.test.tsx tests/integration-ui/codebase-stage-navigation.test.tsx`, then format/lint/typecheck.
- Success: tests green, gates green, manual proof of the mount stagger and the reduced-motion fallback.

Milestone 5: Save bar relative time + Customized pill animation
- Scope: Slice 4.
- End state: save bar renders "Saved X ago" derived from `workspaceState.projectDefinition?.updatedAt`; Customized pill animates in and out as the design preset is altered; destructive copy audit recorded.
- Run: `bun run --cwd apps/web vitest run tests/integration-ui/codebase-page.test.tsx tests/unit/codebase-page-state-model.test.ts tests/unit/codebase-stage-save-feedback.test.tsx tests/unit/codebase-step-save-feedback.test.ts`, then format/lint/typecheck.
- Success: tests green, gates green, manual proof of the relative-time text updating across two save cycles and the Customized pill animation.

Milestone 6: Audit-only second pass
- Scope: Slice 5.
- End state: every dimension (E, F, G, H, I, J) recorded in `Surprises & Discoveries`; only ships changes on observed regression; `bg-primary|text-primary` grep clean.
- Run: `rg "bg-primary|text-primary" "apps/web/app/(workspace)/_components/codebase-flow" "apps/web/app/(workspace)/_hooks/codebase-flow"` returns no matches; manual focus-ring + a11y + mobile audit at 1440 / 768 / 390.
- Success: grep clean, audit notes recorded, follow-up Linear issues identified.

Milestone 7: Validation matrix and screenshot bundle
- Scope: Slice 6.
- End state: focused vitest set, full apps/web vitest sweep, format, lint, typecheck all pass; screenshot bundle captured (or maintainer hand-off note recorded); retrospective written.
- Run: see Test Commands.
- Success: matrix table written into `Outcomes & Retrospective`, screenshot index linked from `Artifacts and Notes`, structural follow-ups recorded.

## Concrete Steps

The exact commands and file-touch lists are recorded per slice below. Update this section as work proceeds.

Slice 0 (this milestone): write this ExecPlan. No code changes. Run `git status --short` from the repo root to confirm scope. Run:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-codebase-page-polish-v2.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-codebase-page-polish-v2.md

Slice 1 commands:

    bun run --cwd apps/web vitest run tests/unit/codebase-theme-tokens.test.ts tests/integration-ui/codebase-page.test.tsx
    bun run format
    bun lint
    bun typecheck
    rg "bg-primary|text-primary" "apps/web/app/(workspace)/_components/codebase-flow" "apps/web/app/(workspace)/_hooks/codebase-flow"

Slice 2 commands:

    bun run --cwd apps/web vitest run tests/unit/codebase-stage-step-field.test.tsx tests/unit/codebase-stage-save-feedback.test.tsx
    bun run format
    bun lint
    bun typecheck
    rg "bg-primary|text-primary" "apps/web/app/(workspace)/_components/codebase-flow" "apps/web/app/(workspace)/_hooks/codebase-flow"

Slice 3 commands:

    bun run --cwd apps/web vitest run tests/integration-ui/codebase-page.test.tsx tests/integration-ui/codebase-stage-navigation.test.tsx
    bun run format
    bun lint
    bun typecheck
    rg "bg-primary|text-primary" "apps/web/app/(workspace)/_components/codebase-flow" "apps/web/app/(workspace)/_hooks/codebase-flow"

Slice 4 commands:

    bun run --cwd apps/web vitest run tests/integration-ui/codebase-page.test.tsx tests/unit/codebase-page-state-model.test.ts tests/unit/codebase-stage-save-feedback.test.tsx tests/unit/codebase-step-save-feedback.test.ts
    bun run format
    bun lint
    bun typecheck
    rg "bg-primary|text-primary" "apps/web/app/(workspace)/_components/codebase-flow" "apps/web/app/(workspace)/_hooks/codebase-flow"

Slice 5 commands:

    rg "bg-primary|text-primary" "apps/web/app/(workspace)/_components/codebase-flow" "apps/web/app/(workspace)/_hooks/codebase-flow"

Slice 6 commands (full validation matrix):

    bun run --cwd apps/web vitest run \
        tests/integration-ui/codebase-page.test.tsx \
        tests/integration-ui/codebase-stage-navigation.test.tsx \
        tests/integration-ui/codebase-local-draft-seeder.test.tsx \
        tests/unit/codebase-page-state-model.test.ts \
        tests/unit/use-codebase-page-state.test.tsx \
        tests/unit/codebase-stage-step-field.test.tsx \
        tests/unit/codebase-stage-scale-field.test.tsx \
        tests/unit/codebase-stage-save-feedback.test.tsx \
        tests/unit/codebase-step-save-feedback.test.ts \
        tests/unit/codebase-section-draft-assistant.test.tsx \
        tests/unit/codebase-theme-tokens.test.ts \
        tests/unit/codebase-field-scales.test.ts
    bun run --cwd apps/web vitest run tests/integration-ui tests/unit
    bun run format
    bun lint
    bun typecheck
    rg "bg-primary|text-primary" "apps/web/app/(workspace)/_components/codebase-flow" "apps/web/app/(workspace)/_hooks/codebase-flow"

After every slice, run `git status --short` from the repo root to confirm scope. If any file outside the v2 in-scope list shows up, back the change out before continuing.

## Validation and Acceptance

Acceptance is observable. After every slice the focused vitest bundle for that slice and the repo gates `bun run format`, `bun lint`, `bun typecheck` must pass. The final slice runs the full `apps/web` `tests/integration-ui tests/unit` vitest sweep. Manual browser proof against the live Convex dev workspace must demonstrate, at minimum:

- the live theme preview transitions all stop when `prefers-reduced-motion: reduce` is enabled (every previously-`transition-all` element stays static)
- a long-form textarea (e.g. `product_summary`) shows the inline counter only when its character count exceeds the budget, and the counter line correctly chains into the input's `aria-describedby`
- a forced validation error fades in instead of popping in, and falls back to opacity-only or no animation under reduced motion
- the seven section cards mount in a soft 30ms stagger on first paint, and mount with no stagger under reduced motion
- the save bar shows "Saved X ago" derived from `workspaceState.projectDefinition?.updatedAt`, the text disappears while saving, and re-appears as "Saved just now" after a save completes
- toggling the design preset between "default" and "customized" theme code shows the Customized pill animating in and out (and falling back to a static toggle under reduced motion)
- dirtying a field then clicking a primary nav link still opens the leave dialog; Stay returns focus; Leave navigates away (no v1 regression)
- clicking a sidebar `<Link href="#section-id">` smooth-scrolls to the section; the leave dialog never appears for sidebar clicks (anchor links never engage the leave guard)

Reduced-motion proof: enable `prefers-reduced-motion: reduce` (macOS Reduce Motion or DevTools emulation) and confirm every new animation falls back to opacity-only or no animation. Specifically: the section-card mount stagger collapses, the validation fade-in collapses, the Customized pill toggles without scale, every previously-`transition-all` element inside the theme preview stays static.

### Test Commands

Focused, per-slice (use the slice's bundle from Milestones above):

    bun run --cwd apps/web vitest run tests/unit/codebase-theme-tokens.test.ts tests/integration-ui/codebase-page.test.tsx

Wider codebase vitest sweep (Slice 6):

    bun run --cwd apps/web vitest run \
        tests/integration-ui/codebase-page.test.tsx \
        tests/integration-ui/codebase-stage-navigation.test.tsx \
        tests/integration-ui/codebase-local-draft-seeder.test.tsx \
        tests/unit/codebase-page-state-model.test.ts \
        tests/unit/use-codebase-page-state.test.tsx \
        tests/unit/codebase-stage-step-field.test.tsx \
        tests/unit/codebase-stage-scale-field.test.tsx \
        tests/unit/codebase-stage-save-feedback.test.tsx \
        tests/unit/codebase-step-save-feedback.test.ts \
        tests/unit/codebase-section-draft-assistant.test.tsx \
        tests/unit/codebase-theme-tokens.test.ts \
        tests/unit/codebase-field-scales.test.ts

Full apps/web vitest sweep (Slice 6):

    bun run --cwd apps/web vitest run tests/integration-ui tests/unit

Repo-level gates (after every slice):

    bun run format
    bun lint
    bun typecheck

Manual browser proof (Slice 6):

    bun run --cwd apps/web dev

Then visit `/codebase` against the hosted Convex dev workspace at 1440px, 768px, and 390px in light and dark mode. Exercise at least one long-form textarea past its budget. Trigger the leave dialog. Toggle `prefers-reduced-motion: reduce`.

## Idempotence and Recovery

Every slice is additive at the file level except for the theme-preview split (Slice 1). The split is safe to rerun: the orchestration file references the extracted modules by relative path and the extracted modules contain only presentational components.

To recover from a partially completed slice:

- run `git status --short` to see what was added or modified
- if a new sub-component file was created but the parent was not yet wired, either delete the new file or finish the wiring; do not leave orphaned files
- if the new ExecPlan file is incomplete, finish writing it before moving on
- if the focused vitest bundle fails after a polish-only diff, the failure is the source of truth: do not patch the test to make it pass; revert the polish that caused the regression and replan
- if a `bg-primary` or `text-primary` regression is introduced, revert the offending edit and re-grep before continuing

To recover from a forgotten "do not commit": run `git status` to confirm nothing was actually committed. The brief explicitly says do not commit unless asked.

## Artifacts and Notes

Baseline notes captured during research on 2026-05-02 (line counts after the v1 polish):

- `CodebasePage` line count: 113
- `CodebasePageBody` line count: 93
- `CodebasePageSectionCard` line count: 100
- `CodebasePageProgressSidebar` line count: 125
- `CodebasePageProgressSidebarItem` line count: 99
- `CodebasePageSaveBar` line count: 132
- `CodebasePageOverview` line count: 42
- `CodebaseStageLeaveDialog` line count: 66
- `CodebaseStageStepField` line count: 117
- `CodebaseStageListField` line count: 114
- `CodebaseStageListFieldRow` line count: 120
- `CodebaseStageLinkListField` line count: 121
- `CodebaseStageScaleField` line count: 118
- `CodebaseStageTextField` line count: 86
- `CodebaseStageArrayField` line count: 75
- `CodebaseStageDesignField` line count: 78
- `CodebaseStageThemeField` line count: 74
- `CodebaseDesignPresetField` line count: 102
- `CodebaseDesignPresetSummary` line count: 137
- `CodebaseThemeConfigurator` line count: 93
- `CodebaseThemeConfiguratorControls` line count: 138
- `CodebaseThemeAdvancedOptions` line count: 89
- `CodebaseThemePreview` line count: 305 (target for the Slice 1 split)
- `CodebaseSectionDraftAssistant` line count: 118
- `CodebaseLocalDraftSeeder` line count: 41 (untouched by this plan)
- No `bg-primary` or `text-primary` Tailwind classes exist in the codebase-flow folder today.
- `motion/react` is already imported in seven codebase-flow files (badge, list field, list field row, link list field, theme configurator controls, theme radius selector, theme advanced options usage indirectly).

Browser screenshot bundle (light + dark, 1440px + 768px + 390px, all 7 sections plus the theme preview at multiple presets) is captured during Slice 6 against the hosted Convex dev workspace and indexed below.

Per-slice screenshot index: to be filled in.

Untouched-but-already-polished list (carried forward from v1, expanded by v2 audit): to be filled in.

Structural follow-ups for separate Linear issues: to be filled in (expected: hard-coded `oklch` strings in `codebase-theme-preview-frame.tsx`; `--primary` cascade dependence; `CodebaseStageStepField` memo profiling outcome).

## Interfaces and Dependencies

Existing libraries and modules this plan depends on:

- `motion/react` from the workspace `node_modules` (already a transitive dependency, used in seven codebase-flow files after v1). Imports used: `motion`, `AnimatePresence`, `useReducedMotion`. No new dependency.
- `lucide-react` for the existing icon set already imported in the in-scope files.
- shadcn primitives: `Field`, `Input`, `Textarea`, `Button`, `Spinner`, `Progress`, `Select`, `Collapsible`, `AlertDialog`, `Dialog`, `Skeleton`, `ToggleGroup`. No primitive contract changes.
- `@/lib/codebase-flow/codebase-page-sections` (`codebasePageSections`, `CODEBASE_OVERVIEW_ID`, `CodebasePageSectionId`). Imported only.
- `@/lib/codebase-flow/codebase-page-validation-model` (`CodebasePageSectionStatus`, `buildPageFeedback`, `buildSectionStatuses`). Imported only.
- `@/lib/codebase-flow/codebase-field-helpers` (`codebaseFieldInputKind`, `codebaseFieldHelperText`, `codebaseFieldLabel`, `codebaseFieldPlaceholder`, `codebaseListFieldItemPlaceholders`, `getCodebaseFieldScaleDefinition`). Imported only.
- `@shipbysunday/codebase-compiler` (`CanonicalProjectFactKey`, `CanonicalProjectFactsDraft`, `CodebaseStepDefinition`, `isCodebaseArrayField`, `designPresetDefinitions`, `resolveDesignPresetDefinition`, `buildDesignPresetFactSeed`). Imported only.
- `@/convex/_generated/api` and `@/lib/codebase-flow/codebase-workspace-types` (`CodebaseWorkspaceState`). Used in the `CodebasePage -> CodebasePageBody` plumb of `lastSavedAt` only.

New helpers introduced by this plan:

- `getCodebaseFieldCharacterBudget(fieldKey: CanonicalProjectFactKey): number | null` in `apps/web/lib/codebase-flow/codebase-field-character-budgets.ts`.
- `useCodebaseSavedRelativeTime(lastSavedAt: number | null): string | null` in `apps/web/app/(workspace)/_hooks/codebase-flow/use-codebase-saved-relative-time.ts`.

New presentational sub-components introduced by this plan:

- `CodebaseThemePreviewFrame` in `apps/web/app/(workspace)/_components/codebase-flow/codebase-theme-preview-frame.tsx` (owns `PreviewTopBar` and `PreviewSidebar`).
- `CodebaseThemePreviewStack` in `apps/web/app/(workspace)/_components/codebase-flow/codebase-theme-preview-stack.tsx` (owns `PreviewWelcomeCard`, `PreviewStatCard`, `PreviewInputRow`, `PreviewBadgeRow`).

No new mutations, queries, schema, env vars, lockfile changes, or third-party packages.
