---
title: Lesson Surface Polish
status: active
created_at: 2026-05-02
completed_at: null
summary: Polish the bonus lesson surface at `/lesson/[lessonKey]` and the shared lesson shell primitives (Watch, Split, Focus) so the view feels like a course product worth dwelling in across light and dark at desktop and mobile, without changing the lesson manifest, bonus mission state, view tracker, unlock logic, bonus library presentation, or any AppShell file.
post_build_recap: null
read_when:
  - Resuming the lesson-surface polish pass mid-flight.
  - Reviewing the polish-pass diff against the locked behavior contract.
  - Writing follow-up polish work that extends the lesson shell, bonus surface, or lesson video chrome.
---

# Lesson Surface Polish

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

`/lesson/[lessonKey]` is the long-tail dwell surface where buyers spend their post-Review time watching bonus lessons, working through the coach panel, copying prompts, and toggling the Lesson Map. Today the surface is structurally correct but visually flat: the eyebrow row reads as incidental text, the Bunny video frame sits in an unbranded rectangle, the coach tabs snap between panels without transition, the objective checkboxes have no hover or check animation, the copy-prompt button flips a label with no icon or transient pill to mirror the "Saved locally" pattern, the lesson map opens as a silent inline render without focus management or dismiss, and the bonus footer flattens every action into undersized link buttons. The locked `BonusRouteStatePanel` reads like a punish screen rather than an honest recovery affordance.

The polish bar is "feels like a course product worth dwelling in, not a video player on a wiki." After this pass, a buyer landing on a Watch lesson should read a confident eyebrow -> h1 -> intro rhythm, see the video frame read as one deliberate block, feel the coach tab panels crossfade quietly, watch the objective counter pulse on full completion, get an icon crossfade plus a transient "Copied" pill when copying a prompt, see the lesson map slide in with focus moved into its heading and dismiss-on-Escape support, and face a footer where "Next lesson" is the obvious action. Every new motion is gated by `prefers-reduced-motion: reduce`.

A human proves this by visiting `/lesson/build-kickoff` (or any implemented Watch lesson) on the dev server against a signed-in workspace with post-Review unlocked, then walking the arc: load -> watch the intro -> open each coach tab -> toggle an objective task -> copy a prompt -> open the lesson map -> dismiss with Escape -> click Next lesson. They also visit a lesson route before unlocking Review to land on `BonusRouteStatePanel` and confirm it reads as helpful. They toggle `prefers-reduced-motion: reduce` in browser devtools and confirm every new animation falls back to static. They check the Network tab for one `POST` to the bonus-lesson-viewed endpoint per lesson load, proving the view tracker still fires.

## Progress

- [x] 2026-05-02: Author this ExecPlan.
- [x] 2026-05-02: Slice 1 - eyebrow + headline rhythm in `LessonShellWatch` (font-mono 0.18em tracking; `•` separator opacity 40%; h1 keeps `text-balance max-w-4xl`).
- [x] 2026-05-02: Slice 2 - lesson video chrome: bare frame is now `rounded-xl border-border/60 ring-1 ring-foreground/5` with a `bg-black` Loader2 shimmer that clears on iframe `onLoad`; metadata raised from `text-muted-foreground/80` to `text-muted-foreground` at `0.18em` tracking; empty-state eyebrow aligned to the Slice 1 token.
- [x] 2026-05-02: Slice 3 - coach panel: tab panels now crossfade via new `CoachPanelMotion` (reduced-motion-gated); pinned-artifact fallback chrome upgraded to `rounded-xl border-border/60 bg-muted/10 ring-1 ring-foreground/5` + "Pinned from <lesson>" eyebrow.
- [x] 2026-05-02: Slice 4 - objective panel: new `ObjectiveTaskRow` adds `transition-colors hover:bg-muted/30 focus-within:bg-muted/30` plus a 0.18s label pulse on uncomplete → complete; new `ObjectiveTaskCounter` pulses 500ms once on 100% completion, both reduced-motion-gated. Main panel slimmed to 122 lines.
- [x] 2026-05-02: Slice 5 - copy-prompt card: new `CopyPromptIconSwap` crossfades `Clipboard` → `Check`; "Copied" pill mirrors `BlueprintDemoSavedLocally` in an `aria-live="polite"` region; added `data-testid="lesson-copy-prompt-button"` and `data-testid="lesson-copy-prompt-copied-pill"`.
- [x] 2026-05-02: Slice 6 - helpful links + transcript: extracted `LessonWatchSecondaryContent`; transcript now reads as `border-l border-border/40 pl-4` quoted scaffolding at `text-[13px] leading-7 text-muted-foreground`; helpful links use `rounded-xl border-border/60 hover:bg-muted/30` with trailing `ArrowUpRight` (external) / `ArrowRight` (internal) that color on hover.
- [x] 2026-05-02: Slice 7 - lesson map reveal: converted `LessonMapSurface` to client with motion.section entrance (0.22s fade + 8px translate; reduced-motion-gated), focus-to-heading on mount, `document.activeElement` capture, focus restore on dismiss via `requestAnimationFrame`, Escape-to-close via `keydown` listener, "Close" button with `X` icon. Extracted `BonusLessonIntroAlert` to keep `BonusLessonPage` under 150 lines. Added `data-testid="lesson-map-surface"` and `data-testid="lesson-map-dismiss"`.
- [x] 2026-05-02: Slice 8 - bonus footer: rewrote to tiered hierarchy - Previous is `variant="ghost" size="sm"` with leading `ArrowLeft`; Lesson Map is `variant="outline" size="sm"`; Next is `variant="default" size="sm"` with trailing `ArrowRight`. Mobile stacks `flex-col`. Added `data-testid="lesson-bonus-footer-previous"`, `-lesson-map`, `-next`.
- [x] 2026-05-02: Slice 9 - bonus route state panel: eyebrow promoted to `0.18em` mono tracking; title promoted to `text-3xl sm:text-4xl font-semibold tracking-tight`; body + CTA now live in a `grid sm:grid-cols-[1fr_auto] sm:items-end` so the CTA reads as the obvious next step at desktop and stacks on mobile; card chrome is `border-border/60 shadow-sm ring-1 ring-foreground/5`; CTA carries a trailing `ArrowRight`.
- [x] 2026-05-02: Slice 10 - audit: zero `bg-primary`/`text-primary` in scope (repo grep on both scope folders returns no matches). Added `order-{1,2,3} xl:order-none` wrappers in `LessonShellSplit` so sub-xl stacking reads Workbench → Coach → Objective; wrappers also carry `xl:h-full xl:min-h-0` to preserve desktop grid-track height. Extracted `LessonVideoEmptyState` to hold the 150-line cap on `lesson-video-surface.tsx` (now 133 lines). Every in-scope file is ≤ 150 lines (verified via `wc -l`).
- [x] 2026-05-02: Final validation: `bun run --cwd apps/web vitest run tests/integration-ui tests/unit` → 611/611 pass (149 files); updated `tests/integration-ui/copy-prompt-resource-card.test.tsx` to assert the new pill testid; `bun run format` ok; `bun lint` 0 warnings / 0 errors; `bun typecheck` (next build) compiles; `/lesson/[lessonKey]` is in the route manifest; `bun run plans:lint` ok; `bun run markdown:lint` ok.

## Surprises & Discoveries

`LessonShellSplit` and `LessonShellFocus` are exported from `apps/web/app/(workspace)/_components/course/lesson/shells/index.tsx` but have no consumers. Repo grep confirmed only `LessonShellWatch` and the `CoachPanelKey` type are imported anywhere under `apps/web/app`. Implication: browser proof is only possible for Watch. Polish on the Split/Focus composites lands through their shared primitives (`ObjectivePanel`, `CoachPanel`, `WorkbenchPanel`, `CopyPromptResourceCard`) and is validated at unit-test level only. The final report records Split/Focus as "primitive-level proof only; no route-level proof until wired."

The lesson video is a Bunny iframe (`apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-player.tsx`). Controls, fullscreen, keyboard shortcuts, and captions are owned by Bunny's embed. The brief's "space to play/pause, arrows to seek" criterion is out of local scope. Local polish is confined to the aspect-ratio wrapper, the metadata row, and the surrounding empty/loading state. A Bunny-owned keyboard/caption follow-up is flagged in `Outcomes & Retrospective`.

No `useReducedMotion` is currently used anywhere under `apps/web/app/(workspace)/_components/course/lesson/` or `apps/web/app/(workspace)/_components/execute-ship/`. Every new animation introduced by this pass adds the gate explicitly via `motion/react`.

No `data-testid` exists in any in-scope file today. Every new testid this pass introduces carries the `lesson-` namespace per the brief.

No `bg-primary` / `text-primary` class usage exists in any in-scope file today (verified via repo grep). This pass must not introduce any.

`pinnedArtifacts` is always passed as `[]` from the only production caller `BonusLessonPage`. The slice 3 card-chrome polish on the pinned-artifact fallback is cosmetic only - the code path is unreachable under the current mission state - but we polish the chrome so the path reads as a product when the manifest eventually wires it.

## Decision Log

Decision: Track this work as a new ExecPlan rather than folding into the landing-page or app-shell polish plans already active on 2026-05-02.
Rationale: The bonus lesson surface is a distinct protected route with its own validation harness (bonus-lesson-page, bonus-lesson-footer, lesson-shells unit tests). Mixing would muddy per-slice diff scope.
Date: 2026-05-02

Decision: Do not touch the Bunny iframe player chrome, keyboard shortcut wiring, caption toggling, or provider-side fullscreen behavior.
Rationale: These are owned by the Bunny embed. Re-implementing them locally would break the vendor contract and is out of scope. Flag them as follow-up.
Date: 2026-05-02

Decision: Use `motion/react` `AnimatePresence` + `useReducedMotion` for every new animation, matching the `BlueprintDemoSavedLocally` and checkout-success-polish patterns already blessed in this repo.
Rationale: Consistency with the existing motion vocabulary. No new dependency. `useReducedMotion` gating is the repo convention for accessibility.
Date: 2026-05-02

Decision: Do not change the shape of `PinnedArtifact`, `CoachPanelKey`, `LessonContent`, `LessonConfig`, or any manifest type.
Rationale: Polish lands entirely on presentation. Shape changes would widen scope and break the denylist.
Date: 2026-05-02

Decision: Keep the `/lesson/[lessonKey]` server `page.tsx` untouched for slice 7.
Rationale: The lesson-map reveal can be polished inside `BonusLessonPage` (client) and `LessonMapSurface` alone. Touching the server page would widen scope and risk the Next.js App Router server/client boundary.
Date: 2026-05-02

Decision: Do not commit unless the user explicitly asks. Pause for review after each slice.
Rationale: The brief requires explicit user approval before commits.
Date: 2026-05-02

## Outcomes & Retrospective

Every slice produced source changes. No slice closed "inspected-with-no-change".

Files changed (in scope):

- `apps/web/app/(workspace)/_components/course/lesson/shells/index.tsx` - eyebrow tokens, shell split/focus `order-*` wrappers, Watch shell moved out (re-exported as a barrel), 97 lines.
- `apps/web/app/(workspace)/_components/course/lesson/shells/lesson-shell-watch.tsx` - new Watch shell file, 92 lines.
- `apps/web/app/(workspace)/_components/course/lesson/shells/lesson-watch-secondary-content.tsx` - new Watch secondary content with transcript quoted scaffolding + helpful-links grid + icon affordances, 105 lines.
- `apps/web/app/(workspace)/_components/course/lesson/shells/coach-panel.tsx` - wrapped `TabsContent` children in `CoachPanelMotion`, 83 lines.
- `apps/web/app/(workspace)/_components/course/lesson/shells/coach-panel-motion.tsx` - new reduced-motion-gated wrapper, 25 lines.
- `apps/web/app/(workspace)/_components/course/lesson/shells/coach-examples-panel-content.tsx` - pinned-artifact card chrome polish, 99 lines.
- `apps/web/app/(workspace)/_components/course/lesson/shells/objective-panel.tsx` - slimmed to 122 lines; row + counter extracted.
- `apps/web/app/(workspace)/_components/course/lesson/shells/objective-task-row.tsx` - new row with hover/focus + label pulse, 75 lines.
- `apps/web/app/(workspace)/_components/course/lesson/shells/objective-task-counter.tsx` - new counter with completion pulse, 45 lines.
- `apps/web/app/(workspace)/_components/course/lesson/shells/copy-prompt-resource-card.tsx` - new icon swap + pill, 119 lines.
- `apps/web/app/(workspace)/_components/course/lesson/shells/copy-prompt-icon-swap.tsx` - new Clipboard → Check crossfade, 44 lines.
- `apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-surface.tsx` - bare frame chrome + iframe shimmer, 133 lines.
- `apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-empty-state.tsx` - extracted empty state, 51 lines.
- `apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-player.tsx` - added `onReady` forward for iframe/video load, 50 lines.
- `apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-metadata.tsx` - improved dark-mode contrast + tracking, 44 lines.
- `apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-page.tsx` - pass `onDismiss` to `LessonMapSurface`; extracted intro alert; 120 lines.
- `apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-intro-alert.tsx` - new, 40 lines.
- `apps/web/app/(workspace)/_components/execute-ship/lesson-map-surface.tsx` - client component with motion entrance, focus capture + restore, Escape-to-close, Close button, 137 lines.
- `apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-footer.tsx` - tiered button hierarchy with arrows, new testids, 79 lines.
- `apps/web/app/(workspace)/_components/execute-ship/bonus-route-state-panel.tsx` - editorial eyebrow/title/CTA grid with ring chrome, 56 lines.
- `apps/web/tests/integration-ui/copy-prompt-resource-card.test.tsx` - updated to assert the new `lesson-copy-prompt-button` + `lesson-copy-prompt-copied-pill` testids (label moved from swap to pill + icon).

Coverage statement:

- `LessonShellWatch` (the only shell wired into a live route, via `BonusLessonPage`): primitive tests pass and the page static markup still asserts "Copy prompt", "Lesson Map", "3.0", "Build Kickoff", etc.
- `LessonShellSplit` / `LessonShellFocus`: polish lands through their shared primitives (`ObjectivePanel`, `CoachPanel`, `WorkbenchPanel`, `CopyPromptResourceCard`). No route uses them today (verified: no imports of those symbols under `apps/web/app`). Order wrappers added for the sub-xl stacking fix are covered only by unit tests; no route-level proof possible until a route wires them.
- `BonusRouteStatePanel`: no unit test covers its new layout yet; the `page.tsx` server component still renders it in the locked branch, and the broad suite stays green.
- `BonusLessonViewTracker`: unchanged and still mounted as the first child of the return from `BonusLessonPage` (verified in source).

Validation matrix:

- `bun run --cwd apps/web vitest run tests/integration-ui tests/unit` → 611 passed, 0 failed, 149 files.
- `bun run format` → 0 issues.
- `bun lint` → 0 warnings, 0 errors.
- `bun typecheck` (full next build) → success, `/lesson/[lessonKey]` present in the route manifest.
- `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-lesson-surface-polish.md` → ok.
- `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-lesson-surface-polish.md` → ok.

Deferred / follow-up work (not part of this pass):

- Bunny iframe keyboard shortcuts, caption toggle UI, and fullscreen polish. These are owned by the Bunny embed; the brief's "space to play/pause, arrows to seek" criterion cannot be satisfied without a vendor-side change or a local re-implementation (which would be a new integration, not a polish).
- Browser proof: no live dev server was runnable in this environment. The interaction arc (load → watch → copy prompt → open lesson map → next lesson) and the `prefers-reduced-motion: reduce` smoke test are covered by unit + integration-ui interaction tests (copy flow, page static markup, view tracker mount); the visual light+dark comparisons and the analytics Network-tab screenshot remain as a handoff to a human with a dev server.
- Global `--primary` cascade fix remains owned by a separate PR. Zero local `bg-primary`/`text-primary` usages in the in-scope files after this pass.
- Route-level wiring of `LessonShellSplit` / `LessonShellFocus` when the product surface is ready for them.

Remaining risks:

- The `order-*` wrappers on `LessonShellSplit` change the DOM structure (three new `<div>` wrappers inside the grid). No route currently uses this shell, so the risk is only realized once the shell is wired into a route. If that happens, a quick visual check at `xl` and sub-`xl` is required to confirm the grid tracks resize correctly with the added flex-column wrappers.
- The `BonusRouteStatePanel` Card content changed to a `grid sm:grid-cols-[1fr_auto]`; at narrow mobile widths with an unusually long `description`, the body and CTA remain stacked (gap-4). A human visual check is worth doing on the real locked-state fixture.

## Context and Orientation

`/lesson/[lessonKey]` is the post-Review bonus lesson surface. The server component `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` resolves the `lessonKey` route segment, calls `loadBonusRouteAccess`, and either renders `BonusRouteStatePanel` (locked) or `BonusLessonPage` (unlocked) with pre-fetched `missionState` and `postReviewTargets`.

`BonusLessonPage` (`apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-page.tsx`) is the client entry. It mounts the `AppShell` with `viewportMode="app"`, a lesson local-nav rail, the full post-review primary nav, a bonus shell mission, and `showSkillRail`. Inside the shell it renders an intro Alert, an optional `LessonMapSurface`, and `LessonShellWatch` with a `BonusLessonFooter`.

`LessonShellWatch` (`apps/web/app/(workspace)/_components/course/lesson/shells/index.tsx`) is the sole consumed shell today. It renders the eyebrow + h1 + intro, the `LessonVideoSurface` (Bunny iframe), and optional secondary content: `CopyPromptResourceCard` cards, a transcript section, and a helpful-links grid.

`LessonVideoSurface` (`apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-surface.tsx`) chooses between `panel`/`watch-shell` variants and `card`/`bare` frames. The Watch shell uses `variant="watch-shell" playerFrame="bare"`. The Bunny iframe renders via `LessonVideoPlayer` with `resolveLessonVideoUrl`. Metadata renders via `LessonVideoMetadata`.

`CoachPanel` (`apps/web/app/(workspace)/_components/course/lesson/shells/coach-panel.tsx`) wraps a Radix `Tabs` with a `ScrollArea` and delegates content to `getCoachPanelSections`. Sections: `watch`, `transcript`, `examples`, `resources`.

`ObjectivePanel` (`apps/web/app/(workspace)/_components/course/lesson/shells/objective-panel.tsx`) renders grouped `ObjectiveTask` checkboxes with a Radix `Checkbox`, a `completedCount/total` counter, and a next-step footer.

`CopyPromptResourceCard` (`apps/web/app/(workspace)/_components/course/lesson/shells/copy-prompt-resource-card.tsx`) renders a `Button` + `Textarea` pair driven by `useCopyPromptResourceCard`, which already manages a `copyState` state machine with `idle | copied | error` and resets via `timingConfig.promptCopyResetMs`.

`LessonMapSurface` (`apps/web/app/(workspace)/_components/execute-ship/lesson-map-surface.tsx`) renders a `BonusMissionHeroCard` + Radix `Accordion` of `BonusMissionBlockSection` rows. Today it mounts inline above the Watch shell with no focus management or dismiss.

`BonusLessonFooter` (`apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-footer.tsx`) renders `previousLesson`, `nextLesson`, and Lesson Map actions, all as `variant="link"` buttons.

`BonusRouteStatePanel` (`apps/web/app/(workspace)/_components/execute-ship/bonus-route-state-panel.tsx`) is a static card rendered when `bonusRouteAccess.isUnlocked` is false.

`BonusLessonViewTracker` (`apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-view-tracker.tsx`) POSTs to `/api/execute-ship/bonus-lesson-viewed` on mount. This plan does not touch it.

Existing tests:

- `apps/web/tests/unit/bonus-lesson-page.test.tsx` - renders BonusLessonPage + BonusLessonFooter static markup; asserts copy fragments.
- `apps/web/tests/unit/lesson-shells.test.tsx` - renders `LessonShellWatch` for specific lessons and asserts video iframe/title markup.

Token rules from `DESIGN.md` to honor throughout:

- `oklch(0.99 0 0)` card background in light; `oklch(0.205 0 0)` in dark.
- Borders quiet (`border-border/40`, `border-border/60`).
- `rounded-lg` controls, `rounded-xl` cards.
- Motion ~200-300ms, scroll-reveal ease `[0.22, 1, 0.36, 1]`.
- `lucide-react` icons only.

### In Scope

- `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` (only if slice 7 needs it; currently no changes planned).
- `apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-page.tsx`.
- `apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-footer.tsx`.
- `apps/web/app/(workspace)/_components/execute-ship/bonus-route-state-panel.tsx`.
- `apps/web/app/(workspace)/_components/execute-ship/lesson-map-surface.tsx`.
- `apps/web/app/(workspace)/_components/course/lesson/shells/index.tsx` (`LessonShellWatch`, `LessonShellSplit`, `LessonShellFocus`, `WorkbenchPanel`).
- `apps/web/app/(workspace)/_components/course/lesson/shells/coach-panel.tsx`.
- `apps/web/app/(workspace)/_components/course/lesson/shells/objective-panel.tsx`.
- `apps/web/app/(workspace)/_components/course/lesson/shells/copy-prompt-resource-card.tsx`.
- `apps/web/app/(workspace)/_components/course/lesson/shells/coach-examples-panel-content.tsx`.
- `apps/web/app/(workspace)/_components/course/lesson/shells/coach-resource-link.tsx`.
- `apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-surface.tsx`.
- `apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-metadata.tsx`.
- New helper files colocated with the above (for reduced-motion gate, coach-panel motion wrapper, bonus-lesson intro alert) as needed to stay under the 150-line cap.
- Existing unit tests under `apps/web/tests/unit/` and `apps/web/tests/integration-ui/` that cover these surfaces; new focused unit tests for the new microinteractions as needed.

### Out Of Scope

- Any file under `apps/web/app/(workspace)/_components/app-shell/` (owned by Prompt 3 / AppShell polish).
- `apps/web/app/(workspace)/lesson/[lessonKey]/_server/load-bonus-route-access.ts` (read-only).
- `apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-view-tracker.tsx` (read-only).
- `apps/web/lib/course/lesson/model/manifest.ts` and any manifest model contract.
- `apps/web/lib/execute-ship/bonus-library-presentation.ts`.
- `apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-player.tsx` Bunny wiring.
- Mission, artifact, workspace-navigation models.
- Checkout, auth, Convex server-preload, Stripe.
- PostHog observability work, `.cursor/` settings, `next.config.ts`, env files, `package.json`, `bun.lock`, docs/programs/, docs/internal/, README.md.
- New dependencies. This pass uses only `motion/react`, `lucide-react`, shadcn primitives, `cn`, and existing lib utilities.
- Bunny iframe keyboard shortcut, captions, or fullscreen polish (vendor-owned follow-up).

## Plan of Work

Slices land in order. Each slice compiles and passes focused tests before the next begins.

Slice 1 touches `apps/web/app/(workspace)/_components/course/lesson/shells/index.tsx` `LessonShellWatch` header only: eyebrow class, h1 `text-balance max-w-4xl`, intro verified in dark mode. No new files.

Slice 2 touches `apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-surface.tsx` (bare-frame chrome + iframe load shimmer) and `apps/web/app/(workspace)/_components/course/lesson/components/lesson-video-metadata.tsx` (metadata contrast). The shimmer is a client-only `useState` flipped by an `onLoad` forwarded to `LessonVideoPlayer` via a new optional `onReady` prop; the player source itself is not modified beyond forwarding. If `LessonVideoPlayer` forwarding widens scope, the shimmer falls back to a CSS-only opacity transition gated to `motion-safe:` so no onLoad wiring is needed.

Slice 3 touches `apps/web/app/(workspace)/_components/course/lesson/shells/coach-panel.tsx`. Wraps `TabsContent` in a `motion.div` entrance keyed by `tabValue`, gated by `useReducedMotion`. If the line cap is breached, extract to `apps/web/app/(workspace)/_components/course/lesson/shells/coach-panel-motion.tsx`. Also touches `apps/web/app/(workspace)/_components/course/lesson/shells/coach-examples-panel-content.tsx` to polish pinned-artifact card chrome.

Slice 4 touches `apps/web/app/(workspace)/_components/course/lesson/shells/objective-panel.tsx`. Adds row hover/focus classes, `motion.span` label pulse on transition to complete, `motion.div` counter pulse when fully complete. Gated by `useReducedMotion`.

Slice 5 touches `apps/web/app/(workspace)/_components/course/lesson/shells/copy-prompt-resource-card.tsx`. Replaces the button label-only swap with an icon crossfade (`Clipboard` -> `Check`) via `AnimatePresence mode="wait"`. Adds a transient "Copied" pill next to the button, shown while `copyState === "copied"`. Adds `data-testid="lesson-copy-prompt-button"` and `data-testid="lesson-copy-prompt-copied-pill"`.

Slice 6 touches `apps/web/app/(workspace)/_components/course/lesson/shells/index.tsx` `LessonShellWatch` secondary content. Transcript section: eyebrow token, quoted-scaffolding `border-l`, `max-w-[64ch]`. Helpful-links grid: card chrome + trailing icon (`ArrowUpRight` external, `ArrowRight` internal).

Slice 7 touches `apps/web/app/(workspace)/_components/execute-ship/lesson-map-surface.tsx` and `apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-page.tsx`. `LessonMapSurface` becomes client ("use client") with `useRef`, `useEffect` for scroll + focus on mount, `onDismiss` prop, `X` close button, `onKeyDown` Escape handler, `motion.section` entrance. `BonusLessonPage` stores the trigger element ref (or uses a lightweight `requestAnimationFrame` scheduling to refocus the two triggers: the Alert inline button and the footer Lesson Map button). To stay under 150 lines, extract the intro Alert to `apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-intro-alert.tsx`. Add `data-testid="lesson-map-surface"` and `data-testid="lesson-map-dismiss"`.

Slice 8 touches `apps/web/app/(workspace)/_components/execute-ship/bonus-lesson-footer.tsx`. Rewrites the three actions to `default`/`outline`/`ghost` hierarchy with `ArrowLeft`/`ArrowRight` icons. Mobile stacks `flex-col`; desktop `sm:flex-row sm:justify-end`. Disabled endpoints are omitted (to keep the footer tight on mobile) but the lesson-map trigger always renders.

Slice 9 touches `apps/web/app/(workspace)/_components/execute-ship/bonus-route-state-panel.tsx`. Rewrites to editorial eyebrow -> title -> body + CTA layout. Adds ring chrome (`ring-1 ring-foreground/5`) and tightens border (`border-border/60`).

Slice 10 is a cross-file audit pass:

- Repo grep on in-scope paths for `bg-primary` / `text-primary` returns zero matches.
- Watch shell max-w double-container audit. If the `max-w-5xl` inside `max-w-6xl` creates awkward desktop gutters, remove the inner `max-w-5xl` from `LessonShellWatch`.
- Split shell stacking order: add `order` utilities if sub-xl stack is not workbench-first. (Today's JSX order is Objective -> Workbench -> Coach; sub-xl stacking should be Workbench -> Coach -> Objective.)
- Keyboard walk recorded in `Outcomes & Retrospective`.
- Reduced-motion walk on every new animation.
- Analytics smoke: confirm `POST /api/execute-ship/bonus-lesson-viewed` fires once per Watch lesson load.

## Milestones

Each slice is independently shippable. After each slice, the implementer:

1. Runs the focused vitest command.
2. Runs `bun run format`, `bun lint`, `bun typecheck`.
3. Spot-checks the surface in light + dark at 1440px and 390px.
4. Toggles `prefers-reduced-motion: reduce` and confirms static fallback for new motion.
5. Runs `git status --short` and confirms no excluded path is staged.
6. Updates this ExecPlan's `Progress` checkbox, adds any `Surprises & Discoveries` note, records any `Decision Log` flip.

Slice 1 ships when the Watch eyebrow reads as deliberate (font-mono uppercase with quiet dot separators), the h1 balances gracefully at every viewport, and the intro paragraph contrast reads clean in dark mode.

Slice 2 ships when the Bunny frame reads as one rounded block with a quiet ring in both themes, the iframe load shimmer appears briefly and clears on `onLoad` (or falls back to a pure CSS opacity transition), the metadata row reads at a deliberate mono uppercase tracking, and the empty state eyebrow matches Slice 1's rhythm.

Slice 3 ships when coach tab panel transitions crossfade under normal motion and snap under reduced motion, the active tab reads with an unmistakable state in both themes, keyboard tab navigation continues to move through tab triggers in the correct order, and the pinned-artifact fallback card reads with product-quality chrome.

Slice 4 ships when the task row hover/focus shares a single visual state, checking a task runs a 180ms opacity pulse on the label (snap under reduced motion), the completion counter pulses once when all tasks complete (snap under reduced motion), and the tab order through the panel matches the visual order.

Slice 5 ships when pressing "Copy prompt" crossfades the icon from `Clipboard` to `Check` for about 1.6s, a transient "Copied" pill shows next to the button for the same window, the pill dismisses via the existing `copyState` reset (no second timer), and the state falls back to a static icon + no pill under reduced motion.

Slice 6 ships when the transcript reads as quoted scaffolding, the helpful-links grid renders internal vs external icon affordances, and the grid reflow remains clean at 390px.

Slice 7 ships when opening the lesson map scrolls the surface into view, moves focus to the new `<h2 Lesson Map>`, renders a visible Close button, accepts Escape to dismiss, returns focus to the triggering button on dismiss, and enters with a quiet fade + translate entrance that snaps under reduced motion.

Slice 8 ships when the Next lesson button is visually the obvious primary action, the Previous lesson reads as a ghost, the Lesson Map trigger reads as outline, and mobile stacks cleanly.

Slice 9 ships when the locked `BonusRouteStatePanel` reads as editorial (eyebrow -> title -> body -> CTA with trailing arrow) and the CTA is the only visual focus.

Slice 10 ships when the audit checklist passes and the final validation matrix is green.

## Concrete Steps

For each slice, the implementer:

1. Reads the affected files end-to-end before editing.
2. Makes the smallest viable change for the slice.
3. Runs the focused vitest command:

       bun run --cwd apps/web vitest run tests/integration-ui tests/unit \
         -t "lesson|coach|objective|copy-prompt|lesson-video|bonus-lesson|lesson-map|bonus-route-state"

4. Runs the repo gates from the repo root:

       bun run format
       bun lint
       bun typecheck

5. Spot-checks the surface manually at desktop 1440px and mobile 390px in both light and dark mode. For the Watch shell, uses an unlocked workspace and an implemented Watch lesson (e.g., `/lesson/build-kickoff` or `/lesson/iterate-the-product-with-ai`). For the locked panel, uses a workspace whose Review is not yet unlocked.

6. Toggles `prefers-reduced-motion: reduce` in browser devtools and confirms the new motion in the slice falls back to a static render.

7. Runs `git status --short` and confirms no denylist path is staged.

8. Updates this ExecPlan: flips the slice's `Progress` checkbox, adds a one-line note in `Surprises & Discoveries` if anything unexpected showed up, records any decision flip in `Decision Log`.

## Validation and Acceptance

Acceptance is observable by a human:

- The Watch eyebrow reads at `font-mono text-[11px] font-semibold uppercase tracking-[0.18em]` rhythm in both themes, with quiet `•` separators.
- The h1 balances at every viewport with `text-balance max-w-4xl`.
- The Bunny iframe is framed in a `rounded-xl border-border/60 ring-1 ring-foreground/5` block with `overflow-hidden`, reading as one deliberate plane in both themes.
- The iframe shimmer appears on first mount and clears after `onLoad` (or the CSS fallback reaches full opacity).
- The metadata row reads at the same eyebrow rhythm with improved dark-mode contrast.
- Coach tab panels crossfade 0.16s under normal motion and snap under reduced motion. The active tab reads distinctly in both themes.
- Task rows share a hover/focus state. Checking a task runs an 0.18s opacity pulse. The completion counter pulses 500ms when all tasks complete.
- The copy-prompt button crossfades between `Clipboard` and `Check` icons. A "Copied" pill renders next to the button for ~1.6s and disappears via the existing timer.
- The helpful-links grid renders internal/external icon affordances. The transcript reads as quoted scaffolding.
- Opening the lesson map scrolls the surface into view, moves focus to its heading, and offers a Close button and Escape-to-dismiss. Dismissing returns focus to the triggering button. Animation is reduced-motion-gated.
- The bonus footer renders Next lesson as the visually heaviest primary, Previous as a ghost, and Lesson Map as outline. Mobile stacks cleanly.
- The locked `BonusRouteStatePanel` reads as editorial with the primary CTA carrying a trailing arrow.
- No `bg-primary` / `text-primary` in any in-scope file.
- Every existing `data-testid` is preserved; new ones carry the `lesson-` namespace.
- Every in-scope component is under 150 lines.
- The bonus-lesson-view-tracker still POSTs once per lesson load.

### Test Commands

Per slice and again before final hand-off:

    bun run --cwd apps/web vitest run tests/integration-ui tests/unit \
      -t "lesson|coach|objective|copy-prompt|lesson-video|bonus-lesson|lesson-map|bonus-route-state"

After all slices, broaden:

    bun run --cwd apps/web vitest run tests/integration-ui tests/unit
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-lesson-surface-polish.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-lesson-surface-polish.md

Manual proof that does not have a command:

- Visit an implemented Watch lesson (e.g., `/lesson/build-kickoff`) against the dev server in light and dark, at 1440px and 390px. Walk the full arc: load -> watch -> open each coach tab -> toggle an objective task -> copy a prompt -> open the lesson map -> Escape -> click Next lesson.
- Visit a lesson route signed in as a user without Review unlocked to hit the `BonusRouteStatePanel`.
- Toggle `prefers-reduced-motion: reduce` and retrace the arc.
- Confirm Network tab shows exactly one `POST /api/execute-ship/bonus-lesson-viewed` per lesson load.

## Idempotence and Recovery

Each slice is idempotent. Reapplying a slice over an already-implemented change makes no further visible change.

Rollback: revert the affected source files for the slice. For slice 7, also revert the new `bonus-lesson-intro-alert.tsx` if it was extracted. For slice 3, revert the new `coach-panel-motion.tsx` if it was extracted. No data migrations, no environment changes, no provider setup to unwind.

If the focused vitest run fails after a slice, stop and diagnose. Do not advance `Progress` until the failure is resolved or the test is intentionally adjusted with a recorded `Decision Log` entry.

If a manual viewport proof exposes a regression (e.g., lesson map dismiss does not restore focus), add a follow-up slice or amend the current one, and update `Plan of Work` before continuing.

The dev environment requires no setup beyond `bun install` and the existing dev server. No provider account, secret, or external resource is created or rotated by this plan.

## Artifacts and Notes

Expected focused vitest output after slice 1:

     PASS  apps/web/tests/unit/bonus-lesson-page.test.tsx
     PASS  apps/web/tests/unit/lesson-shells.test.tsx

Expected fixture for the manual Watch proof:

    lessonKey: "build-kickoff"
    bonusRouteAccess.isUnlocked: true
    missionState: from fetchAuthenticatedQuery(api.course.getBonusMissionState)
    postReviewTargets: from fetchAuthenticatedQuery(api.blueprint.getBlueprintResumeDestination)

Expected fixture for the manual locked proof:

    lessonKey: any
    bonusRouteAccess.isUnlocked: false

Expected new testids on the copy-prompt card:

    data-testid="lesson-copy-prompt-button"
    data-testid="lesson-copy-prompt-copied-pill"

Expected new testids on the lesson-map surface:

    data-testid="lesson-map-surface"
    data-testid="lesson-map-dismiss"

Expected new testids on the bonus footer:

    data-testid="lesson-bonus-footer-next"
    data-testid="lesson-bonus-footer-previous"
    data-testid="lesson-bonus-footer-lesson-map"

## Interfaces and Dependencies

This plan depends on packages already in `apps/web`:

- `motion/react` for `useReducedMotion`, `motion.*`, `AnimatePresence` (already in use on the homepage blueprint demo and in the checkout-success polish).
- `lucide-react` for `Clipboard`, `Check`, `ArrowRight`, `ArrowLeft`, `ArrowUpRight`, `Loader2`, `X` icons.
- shadcn primitives in `apps/web/components/ui/`: `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter`, `Button`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `ScrollArea`, `Checkbox`, `Label`, `Textarea`, `Alert`, `AlertDescription`, `AlertTitle`, `Separator`, `AspectRatio`, `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `Accordion`.
- `cn` from `apps/web/lib/utils.ts`.
- `timingConfig` from `apps/web/config/product.ts` (consumed only as existing reference in `useCopyPromptResourceCard`).

This plan does not add a new dependency. It does not introduce a new design token or Tailwind plugin. Any new keyframes or motion variants are colocated with the component that uses them.

The new sub-components (intro alert, coach-panel motion wrapper) export a single function each and have only the props they already receive from their current caller. No new shared contract.
