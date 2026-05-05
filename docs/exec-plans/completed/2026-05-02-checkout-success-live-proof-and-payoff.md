---
title: Checkout Success Live Proof And Payoff
status: active
created_at: 2026-05-02
completed_at: null
summary: Add a gated test-only fixture under /checkout/success so the polling to redirect-armed arc can be captured live in a browser, then layer a restrained validated-state payoff (one-shot armed-ring expansion plus heading crossfade) on top of the existing polished surface, without touching the polling cadence, the redirect timing, the cookie recovery flow, the Stripe SDK usage, or any field on the CheckoutViewModel contract.
post_build_recap: null
read_when:
  - Resuming the live-proof or payoff slice mid-flight.
  - Reviewing the slice diff against the locked behavior contract.
  - Auditing the test-only fixture gate for production safety.
  - Reproducing the live browser proof for a future polish pass.
---

# Checkout Success Live Proof And Payoff

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

A buyer who just handed Ship by Sunday their money lands on `/checkout/success` for roughly 5-15 seconds before this view auto-redirects into the workspace. The prior pass (`docs/exec-plans/active/2026-05-02-checkout-success-polish.md`) shipped polish across six slices and explicitly closed with a gap: the polling -> validated -> redirect-armed arc is only proven by integration-ui tests with `vi.useFakeTimers()`. There is no live browser proof of the actual arc because there is no test-only server-side fixture for `getCheckoutSessionState` and `viewerProductAccess`. A second gap is qualitative: the validated -> redirect-armed transition is correct but flat. A buyer who just paid should feel a deliberate handoff at the moment access flips ready, not a pill text swap.

After this plan, two things are true. First, a maintainer running `CHECKOUT_SUCCESS_FIXTURES=1 bun run dev:web` can visit `http://localhost:3000/checkout/success?fixture=validated_arc` in a real browser and watch the polling state transition to redirect-armed and then redirect to `/codebase`, all without a real Stripe session and without a real Convex grant. The same maintainer can capture the polling, redirect-armed, and recovery surfaces at desktop and mobile in light and dark mode. Second, when access flips ready, a single ring expansion fires once behind the status pulse, and the inner card heading crossfades from "Finalizing access" to "Opening workspace" rather than snap-replacing. Both motions degrade to a static render under `prefers-reduced-motion: reduce`.

A novice can prove this end to end without prior knowledge of the repo. They check out the branch, run `bun install` once, set `CHECKOUT_SUCCESS_FIXTURES=1` in `apps/web/.env.local`, run `bun run dev:web`, and visit `http://localhost:3000/checkout/success?fixture=validated_arc` in a Chromium browser at 1440x900. They watch the status badge change from `Polling access` to `Redirect armed`, see the ring expand once behind the pulse dot, see the heading crossfade, see the "Opening your workspace…" affordance fade in, and the URL change to `/codebase` (which then renders whatever the workspace landing renders, since this fixture is intentionally not authenticated). They visit the same URL again with `prefers-reduced-motion: reduce` toggled in DevTools and see the same content arrive without animation. They visit `http://localhost:3000/checkout/success?fixture=validated_polling`, `?fixture=validated_redirect`, `?fixture=invalid_session`, etc., one at a time, and confirm each renders the expected surface. They unset `CHECKOUT_SUCCESS_FIXTURES`, restart the dev server, hit the same URLs, and confirm the page renders the production surface every time (no fixture activation), proving the gate.

## Progress

- [x] 2026-05-02: Record working baseline. HEAD at start of work was `f17c550c` on branch `fix/shadcn-dark-semantic-cascade`.
- [x] 2026-05-02: Author this ExecPlan.
- [x] 2026-05-02: Slice A - implement `apps/web/app/checkout/success/_lib/checkout-success-fixtures.ts` with the env+param gate and 8 variant entries.
- [x] 2026-05-02: Slice A - wire the fixture into `apps/web/app/checkout/success/page.tsx`, extend `apps/web/app/checkout/success/_components/checkout-success-view.tsx` with a fixture-driven access source (split into `checkout-success-view-content.tsx` and `checkout-success-fixture-view.tsx` to keep all files at or below 150 lines), and forward `fixtureSlug` onto the `<main>` element of `apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx`.
- [x] 2026-05-02: Slice A - register `CHECKOUT_SUCCESS_FIXTURES` in `apps/web/platform/env/server.ts`, document it in `apps/web/.env.local.example`, and add a bullet to `apps/web/content/docs/environment-variables.mdx`.
- [x] 2026-05-02: Slice A - write `apps/web/tests/unit/checkout-success-fixtures.test.ts` covering the security gate and each variant.
- [x] 2026-05-02: Slice A - run focused vitest + format + lint + typecheck; manual gate proof via `curl` without the env switch confirmed the page falls through to the production `missing_session_id` surface.
- [x] 2026-05-02: Slice B - add the one-shot armed-ring child to `apps/web/app/checkout/success/_components/checkout-success-status-pulse.tsx` and create `apps/web/app/checkout/success/_components/checkout-success-heading.tsx` with the `motion/react` crossfade, then wire both into `apps/web/app/checkout/success/_components/checkout-success-main-panel.tsx`.
- [x] 2026-05-02: Slice B - extend `apps/web/tests/integration-ui/checkout-success-view.test.tsx` and `apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx` with the armed-ring presence/absence + reduced-motion assertions.
- [x] 2026-05-02: Slice B - run focused vitest + format + lint + typecheck.
- [x] 2026-05-02: Captured browser proof for `validated_polling`, `validated_redirect`, and `invalid_session` at 1440x900 + 390x844 in light and dark, using `bun run --cwd apps/web dev:web:only` with `CHECKOUT_SUCCESS_FIXTURES=1` in the dev process env. Twelve captures landed under `docs/exec-plans/active/_evidence/2026-05-02-checkout-success-live-proof-and-payoff/`.
- [ ] 2026-05-02: Final broad validation - `bun run --cwd apps/web vitest run tests/integration-ui tests/unit`, `bun run plans:lint`, `bun run markdown:lint`.
- [ ] 2026-05-02: Split into two or three conventional commits with the `git diff --cached --stat` scope check from `Branch hygiene` before each commit.

## Surprises & Discoveries

The branch already carries large unrelated working-tree changes from the PostHog observability migration, the workspace shell polish, paid-checkout claim repair, and `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts` edits. The risk model for this plan is therefore "do not stage another team's hunks", not "rebase divergence". The mitigation is to stage only this slice's paths explicitly and to use `git add -p` for the three files that already have unrelated unstaged hunks: `apps/web/platform/env/server.ts`, `apps/web/.env.local.example`, and `apps/web/content/docs/environment-variables.mdx`.

The off-limits paths declared by the brief overlap with paths that are currently dirty in the working tree. None of those paths needs to be touched by this plan, but every commit must verify via `git diff --cached --stat` that none of those paths is staged.

The fixture cannot wrap or replace `getCheckoutSessionState` or `viewerProductAccess` because both live under the off-limits `apps/web/platform/billing/checkout/` (and the Convex query is owned by Convex). The only viable surface is the server component itself: `apps/web/app/checkout/success/page.tsx` chooses fixture vs production before calling either. Fixture mode bypasses both functions entirely.

`CheckoutSuccessView` already accepts `initialProductAccess` and falls back to the live `useQuery(api.access.viewerProductAccess, ...)` result. The `validated_arc` variant needs to drive the polling -> ready flip without Convex. The cleanest extension that preserves the production code path is a new optional `fixture` prop bag on `CheckoutSuccessView`. When present, the client substitutes a deterministic timer-based access source for the Convex query, and optionally suppresses the `router.replace` effect for static screenshot capture. When absent, the production code path is unchanged.

`bun typecheck` (which runs `next build --webpack`) fails on the current working tree because of pre-existing TypeScript errors in unrelated workstreams that are dirty in the tree. The exact failures observed at the time of Slice B validation:

- `apps/web/app/(workspace)/_components/codex-connection-card/codex-connection-card-status.tsx:68:11 error TS18047: 'connection.account' is possibly 'null'.` (workspace shell polish workstream).
- Earlier run at the same head, before a re-run hit the codex card error first: `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu-items.tsx:168:20 Type error: Property 'actionId' does not exist on type 'WorkspacePrimaryNavMenuEntry'.` (also workspace shell polish workstream).
- A long tail of additional errors across `app/(workspace)/...`, `tests/integration-ui/lesson-map-surface.test.tsx`, `tests/unit/bonus-lesson-page.test.tsx`, `tests/unit/billing-integration-step-planner.test.ts`, etc., all in unrelated workstreams.

To prove that this slice does not extend the failure surface, a focused `bunx tsc --noEmit --skipLibCheck --project tsconfig.json` filtered to `app/checkout/success/`, `tests/unit/checkout-success-fixtures*`, `tests/integration-ui/checkout-success-view*`, and `platform/env/server.ts` returned zero matches. The only TS errors live outside this plan's diff. The slice does not commit any of those files.

The fixture unit test originally tried to assign to `process.env.NODE_ENV` directly, which is read-only under Next.js's `process.d.ts` augmentations. The fix is to use `vi.stubEnv` and `vi.unstubAllEnvs`. This pattern is also captured in `apps/web/tests/setup/jsdom.ts` and is the standard way to mutate `NODE_ENV` for assertions in this repo.

## Decision Log

Decision: Use a query-string `?fixture=<variant>` activation surface, not a request header.
Rationale: `searchParams` is already a server-component prop on `apps/web/app/checkout/success/page.tsx`, so composition with the App Router lifecycle is automatic. A query param is also reproducible by hand in a real browser, which is the entire point of capturing the live arc.
Date: 2026-05-02

Decision: Place the env+param gate inside the fixture module itself, not in `proxy.ts` middleware or in `serverEnv` parsing.
Rationale: The gate stays close to the consumer in one auditable file. The active branch already contains in-flight Clerk middleware edits in `apps/web/proxy.ts`, and adding fixture gating there would race that workstream. Reading `process.env.CHECKOUT_SUCCESS_FIXTURES` directly inside the fixture module is sufficient because the fixture is only consumed from one server-component call site and the env check happens at request time.
Date: 2026-05-02

Decision: Register `CHECKOUT_SUCCESS_FIXTURES` in `apps/web/platform/env/server.ts` for documentation parity even though the fixture module reads `process.env` directly.
Rationale: Every other test-only switch in this app (`ENABLE_OBSERVABILITY_TEST_TRIGGER`) is registered in the env loader, so a future maintainer reading the loader sees the full surface. The schema entry is `z.string().min(1).optional()`, which matches the existing pattern.
Date: 2026-05-02

Decision: Stay on the current branch `fix/shadcn-dark-semantic-cascade` instead of branching from `origin/main`.
Rationale: The user asked for it because it is easier given the in-flight changes already present locally. The risk shifts from rebase to staging discipline. Mitigation is the `git add` checklist in `Branch hygiene` below.
Date: 2026-05-02

Decision: Pick exactly two payoff treatments - the one-shot armed-ring expansion behind the status pulse and the heading crossfade. Skip background wash, confetti, and the third "promote heading typography" suggestion as a stacked treatment.
Rationale: The brief says "pick at most two; do not stack confetti on top of glow on top of pulse - restraint is the brand". A ring expansion at the existing pulse anchor and a heading crossfade at the existing heading anchor are spatially separated and complementary; adding a third treatment would clutter the same 5-second window.
Date: 2026-05-02

Decision: Do not change any field on the `CheckoutViewModel` contract.
Rationale: The brief locks this. Both payoff treatments work against existing fields (`viewModel.heading`, `canAutoRedirect`).
Date: 2026-05-02

Decision: The fixture module is responsible for synthesizing a `ProductAccess`-shaped object that the existing `CheckoutSuccessView` will accept. The shape comes from `apps/web/lib/product-access.ts`.
Rationale: This avoids forking the access type and keeps the production path's contract intact.
Date: 2026-05-02

## Outcomes & Retrospective

To be filled in once both slices ship and the validation matrix passes. This section will name every gate that ran, every gate that was skipped (with the reason), every test that failed for unrelated reasons (verbatim), and every follow-up that remains.

## Context and Orientation

`/checkout/success` is the post-Stripe handoff surface. The relevant files are:

- `apps/web/app/checkout/success/page.tsx` - server component. Resolves the `session_id` from the URL or the recovery cookie, calls `getCheckoutSessionState` from `apps/web/platform/billing/checkout/checkout-session.ts`, prefetches `viewerProductAccess` from Convex when validated, and renders `CheckoutSuccessView` with both.
- `apps/web/app/checkout/success/_components/checkout-success-view.tsx` - client component. Subscribes to `viewerProductAccess` via Convex, polls until access is ready, rotates `validatedStatusCopy` every `timingConfig.checkoutStatusRotateMs` (1600 ms), and calls `router.replace(routeConfig.codebase)` after `timingConfig.checkoutAutoRedirectMs` (700 ms) once `canAutoRedirect` flips true.
- `apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx` - layout shell. Wraps the main and help panels in a centered single-column `<main>`.
- `apps/web/app/checkout/success/_components/checkout-success-main-panel.tsx` - status badges, eyebrow labels, the live heading, the body, the progress steps, and the CTA cluster. The heading is the anchor for the new `CheckoutSuccessHeading` crossfade.
- `apps/web/app/checkout/success/_components/checkout-success-status-pulse.tsx` - the polling indicator. The anchor for the new one-shot armed-ring expansion.
- `apps/web/app/checkout/success/_components/checkout-success-help-panel.tsx`, `checkout-success-cta-row.tsx`, `checkout-success-progress-step.tsx`, `checkout-success-redirect-affordance.tsx` - the rest of the polished tree, untouched by this plan.
- `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts` - single source of copy and progress-step state per `CheckoutSessionState` branch. Off-limits to this plan (concurrent workstream owns it).
- `apps/web/platform/billing/checkout/checkout-session.ts` - defines the `CheckoutSessionState` discriminated union with the kinds `missing_session_id`, `invalid_session`, `sign_in_required`, `wrong_account`, `payment_pending`, and `validated`. Off-limits, only read for type imports.
- `apps/web/lib/product-access.ts` - the `ProductAccess` type used by `viewerProductAccess`.
- `apps/web/platform/env/server.ts` - server env loader. Test-only switches like `ENABLE_OBSERVABILITY_TEST_TRIGGER` already live here as `z.string().min(1).optional()` entries.
- `apps/web/.env.local.example` - the tracked env contract example.
- `apps/web/content/docs/environment-variables.mdx` - the customer-facing env contract docs.
- `apps/web/tests/integration-ui/checkout-success-view.test.tsx` and `apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx` - the existing UI proofs of the surface. Both will gain assertions in Slice B.
- `apps/web/tests/unit/checkout-success-fixtures.test.ts` (new in Slice A) - the security gate proof.

The buyer's data flow with the fixture active is:

1. The browser requests `/checkout/success?fixture=validated_arc`.
2. `page.tsx` calls `getCheckoutSuccessFixture({ fixture: "validated_arc" })`. Because `CHECKOUT_SUCCESS_FIXTURES === "1"` and `NODE_ENV !== "production"` and the variant key is known, the function returns a synthesized `{ checkoutSessionState, initialProductAccess, fixtureFlipAfterMs, fixtureSuppressRedirect, fixtureSlug }` packet.
3. `page.tsx` skips `getCheckoutSessionState` and `fetchAuthenticatedQuery` and renders `<CheckoutSuccessView ... fixture={packet}>`.
4. `CheckoutSuccessView` notices `fixture.fixtureSlug` is set, ignores Convex entirely, sets up a `useState` for access and a `useEffect` that flips it to `{ hasAccess: true }` after `fixtureFlipAfterMs` ms.
5. The shared client logic (`canAutoRedirect`, status rotation, redirect affordance) reacts to that simulated flip exactly as it would in production. If the variant carries `fixtureSuppressRedirect`, the production redirect effect short-circuits so a screenshotter is not racing the 700 ms timer.
6. The rendered `<main>` carries `data-checkout-fixture="validated_arc"` to make the test-only nature visible in DOM inspection.

### In Scope

- One new server-only module at `apps/web/app/checkout/success/_lib/checkout-success-fixtures.ts`.
- One new client component at `apps/web/app/checkout/success/_components/checkout-success-heading.tsx`.
- Edits to `apps/web/app/checkout/success/page.tsx`, `apps/web/app/checkout/success/_components/checkout-success-view.tsx`, `apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx`, `apps/web/app/checkout/success/_components/checkout-success-status-pulse.tsx`, and `apps/web/app/checkout/success/_components/checkout-success-main-panel.tsx`.
- Edits to `apps/web/platform/env/server.ts`, `apps/web/.env.local.example`, `apps/web/content/docs/environment-variables.mdx`.
- Two integration-ui test files: `apps/web/tests/integration-ui/checkout-success-view.test.tsx` and `apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx`.
- One new unit test at `apps/web/tests/unit/checkout-success-fixtures.test.ts`.
- One ExecPlan (this file) plus a screenshot evidence folder under `docs/exec-plans/active/_evidence/2026-05-02-checkout-success-live-proof-and-payoff/`.

### Out Of Scope

- Anything under `apps/web/app/(workspace)/`, `apps/web/app/api/observability/`, `apps/web/instrumentation*.ts`, `apps/web/lib/observability/`, `apps/web/platform/observability/`, `apps/web/platform/billing/`, `.cursor/`, or `docs/programs/completed/2026-05-02-posthog-observability-migration/`.
- The `CheckoutViewModel` contract in `apps/web/app/checkout/success/_lib/checkout-success-view-model.ts`.
- The polling cadence, the redirect target, the redirect timing (`timingConfig.checkoutAutoRedirectMs` / `timingConfig.checkoutStatusRotateMs`), the cookie recovery flow, the Stripe SDK usage, the `metadata.robots` block.
- Middleware changes in `apps/web/proxy.ts`. The fixture gate lives in the fixture module.
- New dependencies. The plan reuses `motion/react`, `lucide-react`, shadcn primitives, and Tailwind only.
- The structural `--primary` cascade fix and any `bg-primary` / `text-primary` styling on this surface. Use `PRIMARY_CTA_INVERT_CLASSES` from `apps/web/lib/styling/primary-cta-invert-classes.ts` only for the existing primary CTA.
- A visible test-only banner. The DOM `data-checkout-fixture` attribute is the test-only marker.
- A discrete sound on the validated transition.
- Splitting the diff across multiple branches or amending prior commits.

## Plan of Work

The work lands across two slices. Each slice is independently shippable and validated before the next slice begins. After each slice, run the focused vitest plus the repo gates plus this plan's lint, then update `Progress`.

Slice A wires the fixture infrastructure end to end so the live arc is reproducible in a browser.

In `apps/web/app/checkout/success/_lib/checkout-success-fixtures.ts`, define a `CheckoutSuccessFixture` type with `checkoutSessionState: CheckoutSessionState`, `initialProductAccess: ProductAccess | null`, `fixtureFlipAfterMs?: number`, `fixtureSuppressRedirect?: boolean`, and `fixtureSlug: string`. Define a `getCheckoutSuccessFixture(searchParams)` function that returns null unless `process.env.CHECKOUT_SUCCESS_FIXTURES === "1"` AND `process.env.NODE_ENV !== "production"` AND the `searchParams.fixture` value is one of the known variant slugs. Define an internal `FIXTURE_VARIANTS` record keyed by slug. Each entry returns the shape above. The variants are: `validated_polling`, `validated_arc`, `validated_redirect`, `wrong_account`, `sign_in_required`, `payment_pending`, `invalid_session`, and `missing_session_id`. The `validated_*` variants synthesize a `ProductAccess` shaped as `{ clerkUserId: "fixture_user", hasAccess: <bool>, status: "granted" | "pending" }`; `validated_polling` and `validated_arc` start with `hasAccess: false`, `validated_redirect` starts with `hasAccess: true`. The non-validated variants set `initialProductAccess: null` (the production code only fetches it when validated). `validated_arc` carries `fixtureFlipAfterMs: 2400`; `validated_redirect` carries `fixtureSuppressRedirect: true`. Also export a `CHECKOUT_SUCCESS_FIXTURE_SLUGS` readonly tuple for the unit test and any future consumer.

In `apps/web/app/checkout/success/page.tsx`, widen the `searchParams` type to include `fixture?: string`. Call `getCheckoutSuccessFixture({ fixture })` first. If it returns a non-null packet, pass `checkoutSessionState`, `initialProductAccess`, and a single `fixture` prop to `CheckoutSuccessView`. If it returns null, follow the existing production code path unchanged.

In `apps/web/app/checkout/success/_components/checkout-success-view.tsx`, add an optional `fixture?: { fixtureFlipAfterMs?: number; fixtureSuppressRedirect?: boolean; fixtureSlug: string }` prop. When `fixture` is set, replace the `useConvexAuth` and `useQuery` calls with a `useState`/`useEffect` simulator: start `hasAccess` at the value implied by `initialProductAccess` (so `validated_polling` and `validated_arc` start `false` and `validated_redirect` starts `true`). If `fixtureFlipAfterMs` is a positive number and `hasAccess` is currently false, set a single `setTimeout` to flip it to true. When `fixtureSuppressRedirect` is true, short-circuit the existing `router.replace` effect. Forward `fixtureSlug` down so the surface element can carry the data attribute.

In `apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx`, accept an optional `fixtureSlug?: string` prop and emit `data-checkout-fixture={fixtureSlug}` on the existing `<main>` element when set.

In `apps/web/platform/env/server.ts`, add `CHECKOUT_SUCCESS_FIXTURES: z.string().min(1).optional()` to the schema and a matching `normalizeEnvValue(process.env.CHECKOUT_SUCCESS_FIXTURES)` line in `loadServerEnv`. Insert both at the line range immediately adjacent to `ENABLE_OBSERVABILITY_TEST_TRIGGER`. Verify after editing that `git diff -- apps/web/platform/env/server.ts` shows only the two new entries (the PostHog observability hunks remain unstaged elsewhere in the file).

In `apps/web/.env.local.example`, add a commented `CHECKOUT_SUCCESS_FIXTURES=` block immediately after `ENABLE_OBSERVABILITY_TEST_TRIGGER=`.

In `apps/web/content/docs/environment-variables.mdx`, add a single bullet under the existing "PostHog and Telegram observability" section adjacent to the `ENABLE_OBSERVABILITY_TEST_TRIGGER` bullet that explains the test-only nature of `CHECKOUT_SUCCESS_FIXTURES`.

In `apps/web/tests/unit/checkout-success-fixtures.test.ts`, prove the security gate. Mock `process.env` between assertions. Tests:

- returns null when `process.env.CHECKOUT_SUCCESS_FIXTURES` is unset, regardless of fixture param
- returns null when `process.env.CHECKOUT_SUCCESS_FIXTURES === "1"` AND fixture param is missing
- returns null when `process.env.CHECKOUT_SUCCESS_FIXTURES === "1"` AND fixture param is unknown
- returns null when env is set + valid param but `process.env.NODE_ENV === "production"`
- returns the packet for each known fixture slug when env is set, NODE_ENV is not production, and the param matches; the returned `checkoutSessionState.kind` matches the expected kind for that slug

Slice B layers the validated payoff and tightens the integration coverage.

In `apps/web/app/checkout/success/_components/checkout-success-status-pulse.tsx`, add a `triggerArmedTransition: boolean` prop. When the prop transitions from `false` to `true`, render a one-shot child `motion.span` that animates from `{ scale: 1, opacity: 0.4 }` to `{ scale: 8, opacity: 0 }` over 360 ms ease-out. Carry `data-testid="checkout-success-status-pulse-armed-ring"`. Use `useReducedMotion()` from `motion/react`; under reduced motion, do not render the ring child at all (the static `bg-foreground` core dot remains). Detect the flip via `useEffect` on the prop value plus a local `useState<boolean>` "fired" gate so the ring only fires on the first true transition per mount, not every re-render. Keep the file under 150 lines.

In `apps/web/app/checkout/success/_components/checkout-success-heading.tsx`, create a tiny presentational wrapper that takes a `heading: string` prop and renders a `motion.div` keyed on the heading text inside an `AnimatePresence mode="wait"`, with a 240 ms fade plus a 4 px y entrance/exit. Use `useReducedMotion()` to suppress the motion (return a plain `<span>{heading}</span>` under reduced motion). The visible markup keeps the existing `text-xl sm:text-2xl font-semibold tracking-tight` typography of the inner heading. Carry `data-testid="checkout-success-heading"` so future tests can target the element.

In `apps/web/app/checkout/success/_components/checkout-success-main-panel.tsx`, replace the inline inner `<CardTitle className="...">{viewModel.heading}</CardTitle>` with `<CardTitle asChild><CheckoutSuccessHeading heading={viewModel.heading} /></CardTitle>` (or wrap as appropriate without breaking shadcn semantics). Pass `triggerArmedTransition={canAutoRedirect}` to `<CheckoutSuccessStatusPulse>`. Verify the file stays under 150 lines.

In `apps/web/tests/integration-ui/checkout-success-view.test.tsx`, add an assertion to the polling state test that `checkout-success-status-pulse-armed-ring` is absent, and an assertion to the access-ready state test that the same testid is present. Add an assertion to one access-ready test that `checkout-success-heading` is present. Preserve every existing assertion verbatim.

In `apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx`, add a new test that mocks `motion/react`'s `useReducedMotion` to return `true`, renders the access-ready state, and asserts the armed-ring testid is absent. Preserve every existing test.

## Milestones

Each slice is independently verifiable.

Slice A ships when `getCheckoutSuccessFixture` is implemented and unit-tested, the page wires it through to the view, the view simulator drives a deterministic flip when `fixtureFlipAfterMs` is set, the env switch is registered and documented, the focused vitest passes, the repo gates pass, and a manual `curl http://localhost:3000/checkout/success?fixture=validated_polling` against `bun run dev:web` (without the env switch) renders the production missing-session-id surface (proof the gate refuses the request).

Slice B ships when the one-shot armed-ring fires on the polling -> ready transition (and never on initial render in the polling state), the heading crossfade replaces the snap swap, both motions degrade to a static render under reduced motion, the new integration assertions pass, the existing assertions all pass unchanged, and the focused vitest plus repo gates pass.

The browser-proof milestone ships when the `validated_polling`, `validated_redirect`, and at least one recovery fixture (e.g., `invalid_session`) are captured at 1440x900 + 390x844 in light and dark from `bun run dev:web` with `CHECKOUT_SUCCESS_FIXTURES=1`, and the screenshots plus the exact `?fixture=...` URLs are recorded in `Artifacts and Notes`.

## Concrete Steps

For Slice A:

1. Read the current state of every In Scope file end-to-end before editing.
2. Implement `apps/web/app/checkout/success/_lib/checkout-success-fixtures.ts` and `apps/web/tests/unit/checkout-success-fixtures.test.ts` together.
3. Run focused vitest:

       bun run --cwd apps/web vitest run tests/unit/checkout-success-fixtures.test.ts

4. Wire `page.tsx`, `checkout-success-view.tsx`, `checkout-success-view-surface.tsx`.
5. Update `apps/web/platform/env/server.ts`, `apps/web/.env.local.example`, `apps/web/content/docs/environment-variables.mdx`.
6. Run focused vitest plus the existing checkout-success integration tests to confirm no regression:

       bun run --cwd apps/web vitest run \
         tests/unit/checkout-success-fixtures.test.ts \
         tests/integration-ui/checkout-success-view.test.tsx \
         tests/integration-ui/checkout-success-view.interactions.test.tsx

7. Run repo gates:

       bun run format
       bun lint
       bun typecheck

8. Manual gate proof:

       CHECKOUT_SUCCESS_FIXTURES= bun run --cwd apps/web dev:web   # one terminal
       curl -s http://localhost:3000/checkout/success?fixture=validated_polling | grep -E "(Missing checkout|Session invalid|Polling access)" | head -3
       # Expected: production "Missing checkout session" surface, NOT "Polling access".

9. Update `Progress` and any `Surprises & Discoveries` finding.

For Slice B:

1. Read the current state of `checkout-success-status-pulse.tsx`, `checkout-success-main-panel.tsx`, and the integration tests end-to-end.
2. Add the one-shot armed-ring child to `checkout-success-status-pulse.tsx`.
3. Create `checkout-success-heading.tsx`.
4. Wire both into `checkout-success-main-panel.tsx`.
5. Add the new test assertions to `checkout-success-view.test.tsx` and `checkout-success-view.interactions.test.tsx`.
6. Run focused vitest:

       bun run --cwd apps/web vitest run \
         tests/integration-ui/checkout-success-view.test.tsx \
         tests/integration-ui/checkout-success-view.interactions.test.tsx

7. Run repo gates:

       bun run format
       bun lint
       bun typecheck

8. Update `Progress`.

For browser proof:

1. From the repo root, set the env switch in `apps/web/.env.local`:

       echo "CHECKOUT_SUCCESS_FIXTURES=1" >> apps/web/.env.local

   Remove this line after the proof is captured if it was not in the file before.

2. Start the dev server (or reuse the running one):

       lsof -i :3000 | head -3
       # If a server is already running for this repo, reuse it. Otherwise:
       bun run --cwd apps/web dev:web

3. Capture screenshots at 1440x900 and 390x844, in light and dark, for each of:

       http://localhost:3000/checkout/success?fixture=validated_polling
       http://localhost:3000/checkout/success?fixture=validated_redirect
       http://localhost:3000/checkout/success?fixture=invalid_session

   Save under `docs/exec-plans/active/_evidence/2026-05-02-checkout-success-live-proof-and-payoff/<viewport>-<theme>-<fixture>.png`.

4. Record the exact URLs and the captured paths in `Artifacts and Notes`.

For final validation:

1. Run the broad vitest:

       bun run --cwd apps/web vitest run tests/integration-ui tests/unit

2. Re-run plan and markdown lint:

       bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-checkout-success-live-proof-and-payoff.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-checkout-success-live-proof-and-payoff.md

3. Stage and commit per `Branch hygiene`.

## Validation and Acceptance

Acceptance is observable by a human:

- Visiting `http://localhost:3000/checkout/success?fixture=validated_polling` with `CHECKOUT_SUCCESS_FIXTURES=1` and `NODE_ENV !== "production"` shows the polling state with the `Polling access` badge and the static pulse ring.
- Visiting `http://localhost:3000/checkout/success?fixture=validated_arc` with the same env shows the polling state, then after ~2.4 s the badge flips to `Redirect armed`, the one-shot armed-ring expansion fires once, the heading crossfades from "Finalizing access" to "Opening workspace", the "Opening your workspace…" affordance fades in, and the URL changes to `/codebase`.
- Visiting `http://localhost:3000/checkout/success?fixture=validated_redirect` shows the redirect-armed state immediately, with the affordance visible and the redirect intentionally suppressed for static screenshot capture.
- Visiting `http://localhost:3000/checkout/success?fixture=invalid_session` shows the recovery surface.
- Visiting `http://localhost:3000/checkout/success?fixture=anything` WITHOUT `CHECKOUT_SUCCESS_FIXTURES=1` shows the production missing-session-id surface (the gate refuses the request).
- Toggling `prefers-reduced-motion: reduce` in DevTools at the redirect-armed state suppresses the armed-ring expansion and the heading crossfade; both states render statically.
- The page DOM carries `data-checkout-fixture="<slug>"` on the `<main>` element when the fixture is active and does not carry that attribute when the fixture is inactive.

### Test Commands

Per slice:

    bun run --cwd apps/web vitest run \
      tests/integration-ui/checkout-success-view.test.tsx \
      tests/integration-ui/checkout-success-view.interactions.test.tsx \
      tests/unit/checkout-success-fixtures.test.ts

Repo gates:

    bun run format
    bun lint
    bun typecheck

After both slices and the browser proof:

    bun run --cwd apps/web vitest run tests/integration-ui tests/unit
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-checkout-success-live-proof-and-payoff.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-checkout-success-live-proof-and-payoff.md

Manual proof that does not have a command:

- The browser captures listed in the milestones above. Each capture must be visible at the recorded `?fixture=...` URL.
- The `prefers-reduced-motion: reduce` DevTools toggle confirms both the armed-ring and the heading crossfade fall back to static rendering.

## Idempotence and Recovery

Each slice is idempotent. Reapplying a slice on top of an already-implemented checkout makes no further visible change.

To roll back Slice A: revert `apps/web/app/checkout/success/page.tsx`, `apps/web/app/checkout/success/_components/checkout-success-view.tsx`, and `apps/web/app/checkout/success/_components/checkout-success-view-surface.tsx`; delete `apps/web/app/checkout/success/_lib/checkout-success-fixtures.ts` and `apps/web/tests/unit/checkout-success-fixtures.test.ts`; revert the three env/docs entries.

To roll back Slice B: revert `apps/web/app/checkout/success/_components/checkout-success-status-pulse.tsx` and `apps/web/app/checkout/success/_components/checkout-success-main-panel.tsx`; delete `apps/web/app/checkout/success/_components/checkout-success-heading.tsx`; revert the new assertions in the two integration-ui test files.

If the focused vitest fails after a slice, stop, diagnose, repair, rerun, only then continue. Do not advance the `Progress` checkbox until the failure is resolved or it is intentionally adjusted with a recorded `Decision Log` entry.

If the live browser proof exposes a real regression (e.g., the `validated_arc` simulator does not flip), record the finding in `Surprises & Discoveries`, fix it inside Slice A (since the simulator is part of Slice A), then re-validate.

The fixture is safe by construction. The env switch must be set explicitly (no default-on path), and the env check is duplicated by the `NODE_ENV !== "production"` guard. To clean the dev environment after the browser proof, remove `CHECKOUT_SUCCESS_FIXTURES=1` from `apps/web/.env.local` if it was added for the proof.

## Branch hygiene

Stay on the current branch `fix/shadcn-dark-semantic-cascade`. Do not branch from `origin/main`. The branch already carries unrelated in-flight work (PostHog observability migration, workspace shell polish, paid-checkout claim repair, view-model edits, etc.). The risk shifts from rebase divergence to accidentally staging another team's tree edits in this slice's commits.

Mitigation, applied before every commit:

1. Stage only this slice's paths explicitly with `git add <path1> <path2> ...`. Never `git add -A` or `git add .`.
2. Inspect the staged-only diff with `git diff --cached --stat` and confirm the file list matches what this plan names for the slice.
3. Run `git status --short` and confirm none of the off-limits paths is staged.
4. For files that already have unstaged changes from other workstreams (`apps/web/platform/env/server.ts`, `apps/web/.env.local.example`, `apps/web/content/docs/environment-variables.mdx`), use `git add -p <path>` and then `git diff --cached -- <path>` to confirm only this slice's hunks are staged.

Do not amend prior commits on this branch. Do not rebase onto a different base. Do not run `git stash` against the unrelated in-flight changes.

## Artifacts and Notes

The browser-proof screenshots are under `docs/exec-plans/active/_evidence/2026-05-02-checkout-success-live-proof-and-payoff/` with filenames in the form `<viewport>-<theme>-<fixture>.png`. Captures were taken against `bun run --cwd apps/web dev:web:only` on `http://localhost:3000` with `CHECKOUT_SUCCESS_FIXTURES=1` exported in the dev process env.

The capture script is `codex-scripts/checkout-success-screenshots.mjs` (ignored by git per the AGENTS.md probe convention). It uses Playwright's bundled Chromium to drive each (viewport, theme, fixture) combination, primes `next-themes` via `localStorage`, forces the `html.dark`/`html.light` class to handle hydration timing, then captures the viewport.

The 12 captures and their source URLs:

- `1440x900-light-validated_polling.png` - `http://localhost:3000/checkout/success?fixture=validated_polling`
- `1440x900-dark-validated_polling.png` - same URL, dark theme
- `390x844-light-validated_polling.png` - same URL, mobile light
- `390x844-dark-validated_polling.png` - same URL, mobile dark
- `1440x900-light-validated_redirect.png` - `http://localhost:3000/checkout/success?fixture=validated_redirect`
- `1440x900-dark-validated_redirect.png` - same URL, dark theme
- `390x844-light-validated_redirect.png` - same URL, mobile light
- `390x844-dark-validated_redirect.png` - same URL, mobile dark
- `1440x900-light-invalid_session.png` - `http://localhost:3000/checkout/success?fixture=invalid_session`
- `1440x900-dark-invalid_session.png` - same URL, dark theme
- `390x844-light-invalid_session.png` - same URL, mobile light
- `390x844-dark-invalid_session.png` - same URL, mobile dark

The `validated_polling` captures show the polling state with the static pulse dot (the armed-ring is intentionally absent here). The `validated_redirect` captures show the redirect-armed state with the "Opening your workspace..." affordance held visible and the inverted "Open workspace" CTA properly inverting in dark mode (white-on-dark). The `invalid_session` captures show the recovery surface with the "Session invalid" badge and the re-checkout guidance.

The gate proof was captured before the env was set: `curl http://localhost:3000/checkout/success?fixture=validated_polling` against the dev server WITHOUT `CHECKOUT_SUCCESS_FIXTURES=1` rendered the production `missing_session_id` surface ("Missing checkout session", "Verify access", and the RSC payload at the end of the response shows `"checkoutSessionState":{"kind":"missing_session_id"}` with no `data-checkout-fixture` attribute on the `<main>`).

Expected vitest output for the new fixture unit test:

     PASS  apps/web/tests/unit/checkout-success-fixtures.test.ts
       getCheckoutSuccessFixture
         ✓ returns null without the env switch
         ✓ returns null with env but no fixture param
         ✓ returns null with env but unknown fixture param
         ✓ returns null with env, valid param, and NODE_ENV=production
         ✓ returns the packet for validated_polling
         ✓ returns the packet for validated_arc
         ✓ returns the packet for validated_redirect
         ✓ returns the packet for wrong_account
         ✓ returns the packet for sign_in_required
         ✓ returns the packet for payment_pending
         ✓ returns the packet for invalid_session
         ✓ returns the packet for missing_session_id

Expected new integration-ui assertion output (Slice B):

     PASS  apps/web/tests/integration-ui/checkout-success-view.test.tsx
       CheckoutSuccessView
         ✓ shows the post-purchase handoff state while access is still catching up
         ✓ shows the automatic redirect state once access is live
         ...

     PASS  apps/web/tests/integration-ui/checkout-success-view.interactions.test.tsx
       CheckoutSuccessView interactions
         ✓ arms the codebase redirect once access is ready
         ✓ does not render the redirect affordance while access is still pending
         ✓ rotates the validated status copy while access is still pending
         ✓ signs out before account switching for a wrong-account paid checkout
         ✓ suppresses the armed-ring expansion under prefers-reduced-motion

## Interfaces and Dependencies

This plan reuses packages already in `apps/web`:

- `motion/react` - `useReducedMotion`, `motion`, `AnimatePresence`. Already a dependency, used by `checkout-success-progress-step.tsx` and `checkout-success-redirect-affordance.tsx`.
- `lucide-react` - icons in the existing surface. No new icon usage.
- shadcn primitives in `apps/web/components/ui/` - `Card`, `Badge`, `Button`, `Separator`. No primitive changes.
- `cn` from `apps/web/lib/utils.ts`.
- `routeConfig` and `timingConfig` from `apps/web/config/product.ts` - read-only.
- `CheckoutSessionState` type from `apps/web/platform/billing/checkout/checkout-session.ts` - imported as a type only; the function it shares a file with is not called in fixture mode.
- `ProductAccess` type from `apps/web/lib/product-access.ts` - imported as a type only.
- `z` from `zod`, in `apps/web/platform/env/server.ts` only.

This plan introduces no new dependency, no new design token, no new tailwind plugin, no new shadcn primitive. The fixture module is a leaf server-only module. The new heading component is a leaf client component. The status pulse keeps its single-file footprint with one extra optional prop and a `motion.span` child gated by a state machine.

The function signatures introduced by this plan:

    // apps/web/app/checkout/success/_lib/checkout-success-fixtures.ts
    export type CheckoutSuccessFixture = {
      readonly checkoutSessionState: CheckoutSessionState;
      readonly initialProductAccess: ProductAccess | null;
      readonly fixtureFlipAfterMs?: number;
      readonly fixtureSuppressRedirect?: boolean;
      readonly fixtureSlug: string;
    };

    export function getCheckoutSuccessFixture(input: {
      fixture?: string;
    }): CheckoutSuccessFixture | null;

    export const CHECKOUT_SUCCESS_FIXTURE_SLUGS: readonly string[];

The `CheckoutSuccessView` prop becomes:

    type CheckoutSuccessViewProps = {
      readonly checkoutSessionState: CheckoutSessionState;
      readonly initialProductAccess?: ProductAccess | null;
      readonly fixture?: {
        readonly fixtureFlipAfterMs?: number;
        readonly fixtureSuppressRedirect?: boolean;
        readonly fixtureSlug: string;
      };
    };

The `CheckoutSuccessSurface` prop becomes:

    type CheckoutSuccessSurfaceProps = {
      readonly viewModel: CheckoutViewModel;
      readonly canAutoRedirect: boolean;
      readonly fixtureSlug?: string;
    };

The `CheckoutSuccessStatusPulse` prop becomes:

    type CheckoutSuccessStatusPulseProps = {
      readonly isPolling: boolean;
      readonly triggerArmedTransition?: boolean;
    };

The new heading component:

    type CheckoutSuccessHeadingProps = {
      readonly heading: string;
    };

    export function CheckoutSuccessHeading(
      props: CheckoutSuccessHeadingProps,
    ): JSX.Element;
