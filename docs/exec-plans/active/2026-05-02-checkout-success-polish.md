---
title: Checkout Success Polish
status: active
created_at: 2026-05-02
completed_at: null
summary: Polish the post-checkout success view at /checkout/success so the first 5-15 seconds after Stripe feel like a deliberate delivery handoff in light and dark mode, by tuning typography, motion, microinteractions, CTA hierarchy, and mobile reflow without changing polling cadence, redirect timing, cookie recovery, the view-model contract, Stripe behavior, or metadata.robots.
post_build_recap: null
read_when:
  - Resuming the checkout-success polish pass mid-flight.
  - Reviewing the polish-pass diff against the locked behavior contract.
  - Writing follow-up polish work that extends the same surfaces.
---

# Checkout Success Polish

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

A buyer who just handed Ship by Sunday their money lands on `/checkout/success` for roughly 5-15 seconds before this view auto-redirects into the workspace. Today that view reads as a Stripe-like receipt with engineery status pills, generic motion, undersized headings, default shadcn CTA chrome, and a `bg-primary` accent that does not flip cleanly in dark mode under the active design preset. The polish bar is "feels like a premium delivery handoff, not a Stripe receipt."

This pass raises the craft layer on `/checkout/success` only. After this work, a buyer should see a confidently sized headline, a status frame that signals a calm working system rather than a hopeful spinner, progress steps that crossfade rather than snap, a clear primary CTA in the marketing invert pattern, a "Opening your workspace…" affordance during the auto-redirect window, and a layout that reads cleanly at 390px and 1440px in both light and dark mode.

A human can prove this by visiting `/checkout/success?session_id=test` against the dev server with a fixture that returns a `validated` checkout session and a Convex access query that initially returns `{ hasAccess: false }` and later flips to `{ hasAccess: true }`. They should see the polling status, watch the `validatedStatusCopy` rotate every 1600ms, observe the icon crossfade on the access-handoff step, then see the redirect-armed affordance fade in for the 700ms window before `router.replace("/codebase")` fires. They should toggle `prefers-reduced-motion: reduce` in browser devtools and confirm every new animation falls back to a static render. They should resize between 390px and 1440px and confirm the help panel never clips below the fold without affordance and the CTA cluster never wraps awkwardly.

## Progress

- [x] 2026-05-02: Author this ExecPlan.
- [x] 2026-05-02: Slice 1 - status frame polish (drop "Manual recovery available" pill, replace `bg-primary` polling dot with token-aware shimmer ring).
- [x] 2026-05-02: Slice 2 - typography + eyebrow rhythm (promote shell title to text-2xl/sm:text-3xl, keep inner heading at xl/2xl with semibold tracking-tight, harmonize eyebrows at `tracking-[0.18em]`, add a `Recovery help` eyebrow + lg title to the help panel, tighten bullet rhythm).
- [x] 2026-05-02: Slice 3 - progress step motion (extracted `checkout-success-progress-step.tsx` with `motion/react` `AnimatePresence mode="wait"` 180ms icon crossfade and `transition-colors duration-200` row chrome; gated by `useReducedMotion`).
- [x] 2026-05-02: Slice 4 - redirect-armed affordance (new `checkout-success-redirect-affordance.tsx` renders "Opening your workspace…" with a fade + 4px translate-up entrance gated by `useReducedMotion`; static-render assertions for both presence and absence added to the integration test).
- [x] 2026-05-02: Slice 5 - CTA hierarchy + invert primary (extracted `checkout-success-cta-row.tsx`, applied marketing invert pattern to primary, demoted "Go home" to ghost with muted-foreground, mobile stacks primary first full-width, namespaced `checkout-success-cta-*` testids).
- [x] 2026-05-02: Slice 6 - mobile reflow + dark-mode parity audit (`min-h-dvh items-start sm:items-center`, `pb-[max(1.5rem,env(safe-area-inset-bottom))]`, bumped wrapper to `max-w-xl`; repo-wide grep on `apps/web/app/checkout/success/` reports zero applied `bg-primary` / `text-primary` classes — only a doc comment explaining why the marketing invert pattern is used).
- [x] 2026-05-02: Validation matrix - focused vitest 9/9, broader `tests/integration-ui` + `tests/unit` 590/590, `bun run format` 0 issues, `bun lint` 0 warnings/errors, `bun typecheck` (next build) compiles successfully and `/checkout/success` is in the route manifest, `bun run plans:lint` ok, `bun run markdown:lint` ok. Browser proof captured 5 screenshots across desktop 1440 + mobile 390 in light + dark + reduced-motion (limited to the `invalid_session` recovery surface in the live browser; the polling -> validated -> redirect-armed arc is proven by the integration-ui interaction tests with fake timers).

## Surprises & Discoveries

The `bg-primary motion-safe:animate-pulse` polling dot at line 85 of `apps/web/app/checkout/success/_components/checkout-success-main-panel.tsx` is the only `bg-primary` instance on this surface. It does not flip cleanly under the active design preset, which leaves it visually broken in dark mode while polling. The structural cascade fix is being addressed in another PR; this plan removes the local instance and replaces it with `bg-foreground` plus a token-aware shimmer ring.

The "Manual recovery available" badge in the same file is asserted nowhere across `apps/web/tests/**` (verified via repo-wide grep on 2026-05-02). It can be removed cleanly without test churn. Recovery is already affordable through the help panel copy and the CTA cluster.

`apps/web/app/checkout/success/_components/checkout-success-main-panel.tsx` sits at 147 lines today. Adding the new redirect-armed affordance and the CTA invert wiring inline would breach the 150-line component boundary cap. Slices 3, 4, and 5 extract small presentational sub-components into `apps/web/app/checkout/success/_components/` to keep every file well under the cap.

The view-model in `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts` already exposes a `primaryActionBody` string that complements the primary CTA. Slice 4 renders the "Opening your workspace…" affordance below the primary CTA when `canAutoRedirect` flips, without adding any new field to `CheckoutViewModel`. The affordance reads from `canAutoRedirect`, which is already plumbed from `CheckoutSuccessView` into `CheckoutSuccessSurface` and `CheckoutSuccessMainPanel`.

The integration interaction test at `apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx` already uses `vi.useFakeTimers()` and asserts the `replaceMock` redirect after 700ms. This same harness can prove the new redirect affordance renders during the redirect window without rewriting the test scaffold.

## Decision Log

Decision: Track this work as a new ExecPlan rather than reusing the active landing-page polish plan.
Rationale: The landing-page polish plan covers the public homepage; `/checkout/success` is a separate protected surface with its own validation harness and risk profile. Mixing the two would muddy the slice cadence and the per-slice diff scope.
Date: 2026-05-02

Decision: Keep the surface as a single column at all viewports, bumping `max-w-lg` to `max-w-xl`.
Rationale: The brief explicitly leaves the column count open and notes the receipt-like feel is intentional. A 5-15s view that ends in auto-redirect should not split focus across two desktop columns. A subtle width bump fills more desktop space without inventing 2-col chrome, and vertical centering plus safe-bottom padding solves the 390px "help panel below the fold" concern.
Date: 2026-05-02

Decision: Drop the "Manual recovery available" badge entirely instead of moving it to the help panel.
Rationale: The badge is engineery jargon. Recovery is already affordable through help panel copy and the CTA cluster. Repeating "recovery is available" in three places would dilute the live-status pill (`Polling access` / `Redirect armed`) that actually conveys system state.
Date: 2026-05-02

Decision: Do not change the `CheckoutViewModel` shape.
Rationale: Every polish item works against existing fields. Adding fields would expand the validation surface across all six `CheckoutSessionState` branches without buying anything visible to the buyer.
Date: 2026-05-02

Decision: Use the marketing invert pattern (`bg-foreground text-background hover:bg-foreground/90 disabled:bg-foreground disabled:text-background`) on the primary CTA, copying the rationale and class string from `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx`.
Rationale: The brief explicitly directs reuse of the marketing-CTA invert pattern. The pattern is already proven in dark mode on the homepage and avoids the `--primary` token cascade bug.
Date: 2026-05-02

Decision: Do not commit unless the user explicitly asks. Pause for review after each slice.
Rationale: The brief requires explicit user approval before commits.
Date: 2026-05-02

## Outcomes & Retrospective

All six slices shipped source changes. No slice closed as inspected-but-no-change.

Source-changing slices:
- Slice 1 dropped the "Manual recovery available" pill, removed the lone `bg-primary motion-safe:animate-pulse` polling dot from this surface, and introduced `checkout-success-status-pulse.tsx` (`bg-foreground` core + `motion-safe:animate-ping` token-aware shimmer ring). The aria-live region is preserved unchanged.
- Slice 2 promoted the shell `CardTitle` to `text-2xl sm:text-3xl font-semibold tracking-tight`, locked the inner heading at `text-xl sm:text-2xl font-semibold tracking-tight`, harmonized "Checkout status" / "Next step" eyebrows on `tracking-[0.18em]`, added a `Recovery help` eyebrow + `text-lg font-semibold tracking-tight` title to the help panel, and gave help-panel bullets `leading-relaxed` so they breathe at 390px.
- Slice 3 extracted `checkout-success-progress-step.tsx` and added a `motion/react` `AnimatePresence mode="wait"` icon crossfade (180ms, gated by `useReducedMotion`) plus a `transition-colors duration-200` on the active row chrome.
- Slice 4 introduced `checkout-success-redirect-affordance.tsx`. It renders nothing while polling and renders an "Opening your workspace…" line with a `Loader2` spinner when `canAutoRedirect` flips true, with a fade + 4px translate-up entrance (`duration: 0.24, ease: [0.22, 1, 0.36, 1]`) gated by `useReducedMotion`.
- Slice 5 extracted `checkout-success-cta-row.tsx`, applied the marketing invert pattern (`bg-foreground text-background hover:bg-foreground/90 disabled:bg-foreground disabled:text-background`) to the primary CTA, kept the alternate as `secondary`, demoted "Go home" to `ghost` with `text-muted-foreground hover:text-foreground`, and switched the cluster to `flex flex-col gap-2 sm:flex-row sm:flex-wrap` so the primary stacks first and full-width on mobile. Each button received a namespaced `data-testid` (`checkout-success-cta-primary` / `-alternate` / `-tertiary`).
- Slice 6 reflowed `checkout-success-view-surface.tsx` to `flex min-h-dvh items-start justify-center ... pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:items-center sm:py-10` with a `max-w-xl` column. The final `apps/web/app/checkout/success/` grep reports zero applied `bg-primary` / `text-primary` classes; the only match is a doc comment in the new CTA row that explains why the marketing invert pattern is used.

Test deltas:
- `apps/web/tests/integration-ui/checkout-success-view.test.tsx` gained five assertions: positive presence of the redirect affordance copy and `data-testid="checkout-success-redirect-affordance"`, positive presence of the new `checkout-success-cta-primary` and `checkout-success-cta-tertiary` testids, and explicit absence of both the affordance and its testid in the polling state. The existing assertions for "Polling access", "Redirect armed", "Open workspace", "Opening workspace", "Access ready", "Access confirmed", "Finalizing access", "Confirming your product access.", "What happens next", "Use the checkout account", "Account mismatch", "Sign in to continue", "Wrong account for this checkout", "Missing checkout session", "Session invalid", and "Go home" are all preserved unchanged.
- `apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx` was not modified. Its existing assertions on `replaceMock("/codebase")` after 700ms and on the rotating `validatedStatusCopy` strings still pass against the polished tree.

Validation matrix:
- focused vitest (`tests/integration-ui/checkout-success-view*.test.tsx`): 9/9 passed.
- broader vitest (`tests/integration-ui` + `tests/unit`): 590/590 passed after one transient flake on `tests/integration-ui/codebase-page.test.tsx` (a 5s timeout under heavy parallel load on a file untouched by this slice; passed cleanly on isolated re-run).
- `bun run format`: 0 issues across 771 files.
- `bun lint`: 0 warnings, 0 errors across 711 files.
- `bun typecheck`: full `next build` succeeded; `/checkout/success` is in the route manifest as `ƒ /checkout/success`.
- `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-checkout-success-polish.md`: ok.
- `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-checkout-success-polish.md`: ok.
- Browser proof: captured 5 screenshots at 1440x900 and 390x844 in both light and dark mode plus one reduced-motion frame against a live dev server on http://localhost:3000/checkout/success?session_id=cs_test_polish. The live page rendered the `invalid_session` recovery surface (since the synthetic session id does not resolve in Stripe), which exercises the typography, CTA invert, ghost tertiary, max-w-xl column, vertical centering, and dark-mode parity. The validated -> polling -> redirect-armed arc is proven by the integration-ui interaction tests with `vi.useFakeTimers()` rather than by a live browser run, because mocking `getCheckoutSessionState` and `viewerProductAccess` from a live browser would require either a real Stripe test session and a Convex grant or a test-only server-side fixture that does not exist in this repo today.

Diff scope: `git diff --stat -- apps/web/app/checkout/success/ apps/web/tests/integration-ui/checkout-success-view.test.tsx apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx` reports 4 files changed (3 modified source + 1 modified test), 43 insertions, 90 deletions. The five new files (four sub-components plus this ExecPlan) are tracked in `git status` as `??`. No PostHog observability, `.cursor/`, or other excluded path was touched.

Structural follow-ups:

Done in a follow-up pass on 2026-05-02:

- Reconciled the duplicated `bg-foreground text-background hover:bg-foreground/90 disabled:bg-foreground disabled:text-background` invert string between `apps/web/app/_components/home-page/sections/home-page-primary-cta.tsx` and `apps/web/app/checkout/success/_components/checkout-success-cta-row.tsx`. Both files now import a shared `PRIMARY_CTA_INVERT_CLASSES` constant from a new `apps/web/lib/styling/primary-cta-invert-classes.ts` module. The colocated docstring on the new module names this as the single deletion target when the structural `--primary` / `--primary-foreground` cascade is fixed elsewhere. Behavior is unchanged; both surfaces continue to render the marketing invert pattern.
- Strengthened the interaction-time coverage of the redirect affordance in `apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx`. The "arms the codebase redirect once access is ready" test now advances fake timers to t=699ms, asserts the `checkout-success-redirect-affordance` testid and "Opening your workspace…" copy are present and that `replaceMock` has not yet fired, then advances 1ms more and asserts `replaceMock("/codebase")`. A new "does not render the redirect affordance while access is still pending" test asserts both the testid and the copy are absent when `useQueryMock` returns `{ hasAccess: false }`.

Intentionally not done in this pass:

- The structural fix for the global `--primary` / `--primary-foreground` cascade itself. The original brief explicitly carved this out ("the structural cascade fix is being handled in a separate PR") and the active `docs/exec-plans/active/2026-05-02-landing-page-polish.md` ExecPlan also lists it as out of scope ("Fixing the structural `--primary` / `--primary-foreground` cascade bug. A separate prompt owns that fix; this pass only routes around it."). Doing it here would risk colliding with that other workstream. The shared `PRIMARY_CTA_INVERT_CLASSES` constant gives that future PR a single, well-marked deletion target across both consumers.
- Promoting the shadcn `CardTitle` default to the larger "milestone" sizing system-wide. This is a true design-system change that would touch many surfaces (`apps/web/components/ui/card.tsx`) and require explicit team buy-in on the new default's effect across every existing card consumer. The local `text-2xl sm:text-3xl font-semibold tracking-tight` override on `/checkout/success` shipped in slice 2 is not in conflict; it just opts this surface in.

## Context and Orientation

`/checkout/success` is the post-Stripe handoff surface. `apps/web/app/checkout/success/page.tsx` is a server component that resolves the Stripe `session_id` from the URL or recovery cookie, validates it via `getCheckoutSessionState`, and prefetches `viewerProductAccess` from Convex when the session is `validated`. It then renders `CheckoutSuccessView` with the session state and the prefetched access.

`apps/web/app/checkout/success/_components/checkout-success-view.tsx` is a client component that subscribes to `viewerProductAccess` via Convex, polls until access is ready, rotates `validatedStatusCopy` every `timingConfig.checkoutStatusRotateMs` (1600ms), and calls `router.replace(routeConfig.codebase)` after `timingConfig.checkoutAutoRedirectMs` (700ms) once `canAutoRedirect` flips true.

`apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx` is the layout shell: a `min-h-screen` `<main>` wrapping a single `max-w-lg` column with the main panel above the help panel.

`apps/web/app/checkout/success/_components/checkout-success-main-panel.tsx` renders the status badges, eyebrow labels, the live heading + body, the progress steps, and the CTA cluster. This is where the polish lands.

`apps/web/app/checkout/success/_components/checkout-success-help-panel.tsx` is a static help card built from `CheckoutViewModel.helpItems`.

`apps/web/app/checkout/success/_lib/checkout-success-view-model.ts` is the single source of copy and progress-step state per `CheckoutSessionState` branch. This plan does not change its shape.

The existing integration tests live at:
- `apps/web/tests/integration-ui/checkout-success-view.test.tsx` (renders the static markup for each state and asserts copy fragments).
- `apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx` (uses `vi.useFakeTimers()` to prove the rotate cadence and the auto-redirect).

Token rules from `DESIGN.md` to honor:
- Cards default to `rounded-xl`, flat, `ring-1 ring-foreground/10`.
- Borders are quiet (`border-border/40`, `border-border/60`).
- Motion: 200-300ms hover transitions, scroll-reveal style ease `[0.22, 1, 0.36, 1]`, body color transitions ~300ms.
- Light mode is the visual center of gravity; dark mode must feel intentional, not an inverted afterthought.
- Use `lucide-react` for icons. Avoid ornamental iconography.

### In Scope

- The six files under `apps/web/app/checkout/success/` listed in `Plan of Work` below.
- Four new presentational sub-components under `apps/web/app/checkout/success/_components/` (status pulse, progress step, CTA row, redirect affordance).
- Two integration-ui test files that already cover this surface.
- A repo-relative ExecPlan (this file).

### Out Of Scope

- The polling cadence, redirect timing (`timingConfig.checkoutAutoRedirectMs` / `timingConfig.checkoutStatusRotateMs`), and cookie recovery flow (`getPendingCheckoutSessionIdFromCookie` / `getCheckoutSessionState` / `fetchAuthenticatedQuery`).
- The view-model contract in `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts` (no new fields).
- The `metadata.robots` block on `apps/web/app/checkout/success/page.tsx` (this view stays noindex).
- Stripe SDK usage and any client-side Stripe call. None is added.
- New dependencies. The plan uses existing `motion/react`, `lucide-react`, and shadcn primitives only.
- The global `--primary` cascade fix; that work is owned by a separate PR. This plan removes the local `bg-primary` instance on this surface and does not introduce new ones.
- The PostHog observability work and `.cursor/` settings present in the working tree on the same branch. Every `git add` is explicit by file.
- Other surfaces (homepage, codebase, review, docs).

## Plan of Work

The polish lands across these files in slice order.

In `apps/web/app/checkout/success/_components/checkout-success-main-panel.tsx`, slice 1 removes the `Manual recovery available` badge and swaps the polling indicator from a raw `bg-primary motion-safe:animate-pulse` `<span>` to a `<CheckoutSuccessStatusPulse>` element. Slice 2 promotes the inner `CardTitle` to `text-2xl sm:text-3xl font-semibold tracking-tight` and softens the shell `CardTitle` so it pairs with the eyebrow as a calm pre-headline rather than competing with it. Slice 3 swaps the inline `CheckoutSuccessStepRow` for an extracted `<CheckoutSuccessProgressStep>` import. Slice 4 adds a `<CheckoutSuccessRedirectAffordance canAutoRedirect={canAutoRedirect} />` element below the primary CTA. Slice 5 swaps the inline button cluster for a `<CheckoutSuccessCtaRow>` import.

In `apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx`, slice 6 changes the wrapper from a top-aligned column to `min-h-screen flex items-center justify-center` with safe-bottom padding and bumps `max-w-lg` to `max-w-xl`. The mobile gap is left at `gap-4` so the help panel sits within the fold at 390px when vertically centered; if the centering pushes content off the top at 390px, the slice 6 implementation shifts to `min-h-dvh items-start sm:items-center` so the surface remains scrollable on small phones.

In `apps/web/app/checkout/success/_components/checkout-success-help-panel.tsx`, slice 2 promotes the help-panel `CardTitle` to `text-base font-semibold` and adds `leading-relaxed` to the bullet list so it does not pinch at 390px.

The four new files land under `apps/web/app/checkout/success/_components/`:
- `checkout-success-status-pulse.tsx` (slice 1) accepts a single `isPolling` boolean. When `isPolling` is true, it renders a `bg-foreground` core dot wrapped by a token-aware shimmer ring built from a CSS keyframe scoped via Tailwind's arbitrary-value syntax. The keyframe is a low-amplitude opacity + scale pulse on a ring drawn with `ring-1 ring-foreground/40`. The pulse is gated under `motion-safe:` so reduced-motion users see a static ring, with a secondary JS gate via `useReducedMotion` from `motion/react` for the rare case the user toggles preference at runtime. When `isPolling` is false, it renders only the `bg-foreground` core dot with a calm `ring-1 ring-foreground/30`.
- `checkout-success-progress-step.tsx` (slice 3) accepts the same `step: CheckoutProgressStep` prop the inline `CheckoutSuccessStepRow` accepts today. It uses `motion/react` `AnimatePresence mode="wait"` to crossfade the icon when `step.state` changes, with a 180ms fade and no layout shift. It also adds a quiet `transition-colors duration-200` to the active row chrome. Both behaviors are gated by `useReducedMotion`; under reduced motion the icon swap is instant and the colors transition without animation.
- `checkout-success-cta-row.tsx` (slice 5) accepts the `viewModel: CheckoutViewModel` it needs to render the three-button cluster. The primary `<Button asChild>` carries `bg-foreground text-background hover:bg-foreground/90 disabled:bg-foreground disabled:text-background` plus the existing `min-w-48 justify-center`. The alternate stays as `variant="secondary"`. The "Go home" button drops to `variant="ghost"` with `text-muted-foreground hover:text-foreground` to read as tertiary. The container uses `flex flex-col gap-2 sm:flex-row sm:flex-wrap` so the primary stacks first and full-width on mobile, then flows side-by-side on small viewports up. Source order is preserved (primary, alternate, tertiary) so keyboard tab order matches visual order. Each button gets `data-testid="checkout-success-cta-primary"` / `-alternate` / `-tertiary`.
- `checkout-success-redirect-affordance.tsx` (slice 4) accepts a single `canAutoRedirect` boolean. When false, it renders nothing. When true, it renders a small `<p>` reading `"Opening your workspace…"` with `text-sm text-muted-foreground`, a left dot icon (`Loader2` from `lucide-react`, `size-3 animate-spin motion-safe:animate-spin`), and a `motion/react` `motion.div` fade + 4px translate-up entrance. Animation is gated by `useReducedMotion`; under reduced motion the element renders statically with the icon set to a static `Loader2` (still visually a spinner because Tailwind's `animate-spin` is suppressed under `prefers-reduced-motion: reduce`). The affordance carries `data-testid="checkout-success-redirect-affordance"`.

In `apps/web/tests/integration-ui/checkout-success-view.test.tsx`, no assertion changes are required because no test asserts on the dropped "Manual recovery available" badge today. The test file is touched only if a new copy assertion needs to land.

In `apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx`, slice 4 adds a small assertion: when `useQueryMock.mockReturnValue({ hasAccess: true })`, the rendered tree must contain `data-testid="checkout-success-redirect-affordance"` before the 700ms redirect timer fires. The existing redirect assertion is preserved as-is.

## Milestones

Each slice is independently shippable. After each slice, the implementer runs the focused vitest command, runs `bun run format && bun lint && bun typecheck`, manually inspects the surface in light + dark at 1440px and 390px, and updates `Progress` with a checkbox flip and a one-line note in `Surprises & Discoveries` for any unexpected finding.

Slice 1 ships when the polling badge no longer uses `bg-primary` on this surface, the "Manual recovery available" pill is gone, the new `<CheckoutSuccessStatusPulse>` renders the shimmer ring under normal motion and a static ring under `prefers-reduced-motion: reduce`, and the existing tests pass without modification.

Slice 2 ships when the inner heading is the visually dominant element on the card (larger than the shell title), the eyebrows ("Checkout status", "Next step") still feel deliberate at 390px, the help-panel title and bullets sit cleanly at 390px in both modes, and the existing tests pass without modification.

Slice 3 ships when the progress-step icon swap from `pending` -> `active` -> `complete` crossfades smoothly under normal motion and is instant under reduced motion, the active row chrome transitions colors quietly, no layout shift occurs during the swap, and the existing tests pass without modification.

Slice 4 ships when `canAutoRedirect=true` renders an "Opening your workspace…" line below the primary CTA with a fade/translate entrance, the line is suppressed entirely when `canAutoRedirect=false`, and the new vitest assertion proves the affordance renders during the 700ms window before `router.replace` fires.

Slice 5 ships when the primary CTA renders with the marketing invert classes in both modes, the secondary CTA stays solid, the "Go home" CTA reads as a tertiary, the mobile stack puts primary first and stacks full-width, the keyboard tab order is primary -> alternate -> tertiary, and existing copy assertions still pass.

Slice 6 ships when the surface vertically centers at desktop and remains scroll-friendly at 390px, the help panel never clips below the fold without affordance, the column is `max-w-xl`, and a final repo-wide grep on `apps/web/app/checkout/success/` reports zero `bg-primary` / `text-primary` matches.

## Concrete Steps

For each slice, the implementer:

1. Reads the affected files end-to-end before editing.
2. Makes the smallest viable change for the slice.
3. Runs the focused vitest command:

       bun run --cwd apps/web vitest run \
         tests/integration-ui/checkout-success-view.test.tsx \
         tests/integration-ui/checkout-success-view.interactions.test.tsx

4. Runs the repo gates from the repo root:

       bun run format
       bun lint
       bun typecheck

5. Spot-checks the surface manually at desktop 1440px and mobile 390px in both light and dark mode by visiting `/checkout/success?session_id=test` against the dev server, with a fixture that returns a `validated` checkout session and a `viewerProductAccess` query that initially returns `{ hasAccess: false }` and later flips to `{ hasAccess: true }`.

6. Toggles `prefers-reduced-motion: reduce` in browser devtools and confirms the new motion in the slice falls back to a static render.

7. Runs `git status --short` and confirms no excluded path is staged. The excluded paths are anything under `apps/web/lib/observability/`, `apps/web/platform/`, `apps/web/instrumentation*.ts`, `scripts/observability/`, `docs/programs/completed/2026-05-02-posthog-observability-migration/`, `docs/exec-plans/completed/2026-05-02-posthog-observability-contract.md`, `apps/web/tests/unit/observability-posthog-*.test.ts`, `apps/web/tests/integration/observability-client-error-route.test.ts`, `apps/web/tests/unit/observability-client-report.test.ts`, `apps/web/tests/unit/env.test.ts`, `apps/web/.env.local.example`, `apps/web/next.config.ts`, root `package.json`, `apps/web/package.json`, `bun.lock`, `.cursor/`, `.agents/skills/shared/posthog-linear-triage/`, `apps/web/content/docs/`, `docs/internal/`, `docs/programs/`, and `README.md`.

8. Updates this ExecPlan: flips the slice's `Progress` checkbox, adds a one-line note in `Surprises & Discoveries` if anything unexpected showed up, and records any decision flip in `Decision Log`.

## Validation and Acceptance

Acceptance is observable by a human:

- The polling state shows a calm shimmer ring around a `bg-foreground` core dot, not a `bg-primary` pulse. The dark-mode dot is visible against the `oklch(0.205 0 0)` card.
- The badge row reads `Polling access` while polling and `Redirect armed` once `canAutoRedirect` flips. There is no "Manual recovery available" pill.
- The headline ("Finalizing access" / "Opening workspace") is visually dominant on the card at all viewports.
- Progress steps crossfade between icon states smoothly under normal motion and snap instantly under reduced motion.
- When `canAutoRedirect` flips true, an "Opening your workspace…" line fades in below the primary CTA and stays visible for the 700ms window before redirect.
- The primary CTA is visually heaviest in both light and dark mode (marketing invert), the alternate is medium-weight (secondary), and "Go home" is light (ghost). The mobile stack puts the primary first and full-width.
- The help panel renders fully in the fold at 390px or affords its scroll cleanly; it never appears clipped.
- Every interactive element has visible hover, focus-visible, active, and disabled states in both modes.
- The full polling -> validated -> auto-redirect arc reads as one deliberate moment, not three jumps.

### Test Commands

Per slice and again before final hand-off:

    bun run --cwd apps/web vitest run \
      tests/integration-ui/checkout-success-view.test.tsx \
      tests/integration-ui/checkout-success-view.interactions.test.tsx

After all slices, broaden:

    bun run --cwd apps/web vitest run tests/integration-ui tests/unit
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-checkout-success-polish.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-checkout-success-polish.md

Manual proof that does not have a command:

- Visit `/checkout/success?session_id=test` against the dev server in light and dark, at 1440px and 390px, and run the polling -> validated -> redirect arc with the access fixture.
- Toggle `prefers-reduced-motion: reduce` in browser devtools and confirm the shimmer ring, icon crossfade, and redirect affordance entrance all fall back to a static render.

## Idempotence and Recovery

Each slice is idempotent. Reapplying a slice over an already-implemented checkout makes no further visible change.

Roll back a slice by reverting the source files it touched (the four new sub-components are leaf imports; reverting the import in `checkout-success-main-panel.tsx` and deleting the leaf file is sufficient). Roll back the layout slice by reverting `checkout-success-view-surface.tsx`.

If the focused vitest run fails after a slice, stop and diagnose before continuing. Do not advance the `Progress` checkbox until the failure is resolved or the test is intentionally adjusted with a recorded `Decision Log` entry.

If a manual viewport proof exposes a real regression (e.g., the help panel clips on a specific small viewport), record the finding in `Surprises & Discoveries`, add a follow-up slice or amend the current one, and update `Plan of Work` before continuing.

The dev environment requires no setup beyond `bun install` and the existing dev server. No provider account, secret, or external resource is created or rotated by this plan.

## Artifacts and Notes

Expected fixture for the manual viewport proof:

    sessionId: "cs_test_polish"
    getCheckoutSessionState -> { kind: "validated", sessionId }
    viewerProductAccess (initial)  -> { hasAccess: false }
    viewerProductAccess (after t)  -> { hasAccess: true }

Expected vitest output for the new redirect-affordance assertion:

     PASS  apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx
       CheckoutSuccessView interactions
         ✓ arms the codebase redirect once access is ready
         ✓ rotates the validated status copy while access is still pending
         ✓ surfaces the redirect affordance once access is ready

## Interfaces and Dependencies

This plan depends on packages already in `apps/web`:
- `motion/react` for `useReducedMotion`, `motion.div`, and `AnimatePresence` (already used by `apps/web/components/ui/cover.tsx` and `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-saved-locally.tsx`).
- `lucide-react` for `Loader2`, `CheckCircle2`, `Circle` (already imported by `checkout-success-main-panel.tsx`).
- shadcn primitives in `apps/web/components/ui/` (`Card`, `CardContent`, `CardDescription`, `CardFooter`, `CardHeader`, `CardTitle`, `Badge`, `Button`, `Separator`).
- `cn` from `apps/web/lib/utils.ts`.
- `routeConfig` from `apps/web/config/product.ts` (consumed only as a route reference; no value changes).

This plan does not add any new dependency. It does not introduce a new design token or tailwind plugin. The shimmer ring keyframe in `checkout-success-status-pulse.tsx` is implemented with Tailwind's arbitrary-value `animate-[name_duration_easing_iteration]` syntax against a small `@keyframes` block colocated with the component.

The new sub-components export a single function each and have no internal state beyond `useReducedMotion()`. They do not reach into Convex, Stripe, or routing. They are pure presentational boundaries owned by `/checkout/success`.
