---
summary: "ExecPlan for redesigning the Ship by Sunday identity sign-in experience so it feels branded, premium, resilient, and fast across sign-in, password reset, and SSO callback routes. It records the route-shell decisions, brand reuse, and validation that brought the auth flow into a single system."
read_when: "Open this when you need the design and route decisions behind the refreshed identity auth experience."
plan_status: "done"
---

# Refresh the Identity Sign-In Experience

This document is a living execution plan for redesigning the Ship by Sunday identity sign-in experience so it feels premium, branded, resilient, and fast instead of generic and unfinished. It must be updated as implementation progresses so a new coding agent can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this work, a visitor who lands on `/sign-in` will see a Ship by Sunday-specific identity experience that matches the product’s serious, premium, and operational tone. The top navigation will show the real brand treatment instead of plain text, the page will no longer be a stock card dropped into empty space, and the route will clearly support both cold entry and paid-access recovery without turning into a mini landing page. The same refreshed shell must also carry through to `/session-tasks/reset-password` and `/sso-callback`, because both routes are real parts of the current auth flow. This matters because the identity route is a first-impression surface for paid users trying to regain access, which makes it a trust screen rather than a back-office utility. The work is successful when a human can open `/sign-in`, recognize Ship by Sunday immediately, understand what happens next, and complete the auth flow without friction while the route stays visually polished, accessible, and fast on mobile and desktop in both light and dark themes.

## Progress

- [x] 2026-03-26 ET: Inspected the current identity route entrypoints and presentation boundaries in `apps/web/app/(identity)/layout.tsx`, `apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx`, and `apps/web/features/auth/sign-in/`.
- [x] 2026-03-26 ET: Confirmed the current identity layout bypasses the shared brand system and renders plain text instead of `ProductBrand`.
- [x] 2026-03-26 ET: Confirmed the current auth shell in `apps/web/features/auth/sign-in/auth-page-shell.tsx` is a stock `Card` that explains the “cheap and off brand” complaint.
- [x] 2026-03-26 ET: Inspected the shared design-system surfaces that should anchor this redesign: `apps/web/components/product-brand.tsx`, `apps/web/components/ui/button.tsx`, `apps/web/components/ui/input.tsx`, `apps/web/components/ui/field.tsx`, `apps/web/components/ui/alert.tsx`, `apps/web/components/ui/spinner.tsx`, and `apps/web/app/globals.css`.
- [x] 2026-03-26 ET: Reviewed the existing UI contract in `apps/web/tests/integration-ui/sign-in-page.test.tsx` and the route-level proof in `apps/web/tests/browser-smoke/app-smoke.spec.ts`.
- [x] 2026-03-26 ET: Read the local skill guidance for `polish`, `harden`, `optimize`, and `normalize` as planning input only, then folded the relevant quality-system requirements into this ExecPlan.
- [x] 2026-03-26 ET: Grilled the ExecPlan against the real codebase and resolved the remaining high-impact scope branches: only reset-password is a real session task, organizations and MFA are not product requirements here, the desktop shell should be split layout, the identity header should be brand plus one `Home` link, adjacent copy should normalize to `Sign in`, the quiet pricing path should appear only on cold/default sign-in visits, reset-password gets shell parity only, and `/sso-callback` must receive full refreshed-shell parity plus browser-smoke proof.
- [x] 2026-03-26 ET: Normalized the adjacent auth entry-point terminology by changing `starterConfig.marketing.loginLabel` in `apps/web/config/product.ts` from `Log in` to `Sign in` and added focused proof in `apps/web/tests/unit/home-page-content.test.ts`.
- [x] 2026-03-26 ET: Replaced the plain-text identity header with `apps/web/features/auth/identity/identity-layout-header.tsx`, which uses `ProductBrand` plus a single `Home` link and is wired into `apps/web/app/(identity)/layout.tsx`.
- [x] 2026-03-26 ET: Rebuilt `apps/web/features/auth/sign-in/auth-page-shell.tsx` into a split shell for `/sign-in`, added `auth-page-support-panel.tsx` plus `sign-in-page-content.ts`, and moved the quiet pricing path to cold/default credentials visits only.
- [x] 2026-03-26 ET: Extended the refreshed shell to `/session-tasks/reset-password` and `/sso-callback` by adding shared route-panel content in `identity-route-panel-content.ts`, leaving `TaskResetPassword` internals untouched, and updating focused UI proof for both routes.
- [x] 2026-03-26 ET: Hardened the refreshed routes by keeping the new shell static, preserving the existing duplicate-submit guards in `useSignInFlow`, constraining support-panel copy to wrapping-friendly layouts, and covering recovery-state pricing visibility plus sibling-route parity in focused UI tests.
- [x] 2026-03-26 ET: Added route-level browser-smoke proof for `/sign-in`, `/session-tasks/reset-password`, and `/sso-callback` in `apps/web/tests/browser-smoke/app-smoke.spec.ts`.
- [x] 2026-03-26 ET: Ran a late-stage polish pass on optical alignment and token consistency while finalizing `auth-page-shell.tsx`, `auth-page-support-panel.tsx`, and the route-panel copy so the three auth routes read as one premium system.
- [x] 2026-03-26 ET: Ran validation, captured results, and updated this plan with the final outcomes plus the validation-unblocking compatibility repairs required by the dirty worktree.

## Surprises & Discoveries

The first important discovery is that the repository already has a canonical brand implementation for Ship by Sunday, but the identity layout does not use it. `apps/web/components/product-brand.tsx` defines the wordmark styling, and both `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx` and `apps/web/features/docs/components/docs-navbar.tsx` already use it. The “missing logo” issue on the sign-in page is therefore a reuse problem, not a missing-asset problem.

The second discovery is that the current auth shell is generic by construction. `apps/web/features/auth/sign-in/auth-page-shell.tsx` returns a small `Card`, which means the route starts from a generic component pattern and then tries to look branded on top of it. The redesign should reverse that relationship. The shell should be custom to the route, while shared primitives such as buttons, fields, alerts, and the brand component remain the reusable pieces.

The third discovery is that `AuthPageShell` is shared more widely than the original complaint suggested. It is used by `/sign-in`, `/session-tasks/reset-password`, and `/sso-callback`. The refresh must therefore account for all three routes or the shell will drift into inconsistency immediately.

The fourth discovery is that the only real session-task UI surface in this product is password reset. `apps/web/app/(identity)/sign-up/[[...sign-up]]/page.tsx` redirects to pricing instead of rendering a sign-up UI, and the product owner explicitly confirmed that organizations and MFA are not part of the intended product flow. The code contains verification and unknown-task fallback behavior, but those are not design targets for this refresh.

The fifth discovery is that the repo already strongly prefers `Sign in` as the user-facing term. The only clear `Log in` outlier is `starterConfig.marketing.loginLabel` in `apps/web/config/product.ts`, which feeds marketing-facing entry points. That means adjacent terminology normalization can stay small and concrete rather than becoming a broad copy audit.

The sixth discovery is that current browser-smoke coverage for auth pages is too light for this redesign. `apps/web/tests/browser-smoke/app-smoke.spec.ts` only verifies that `/sign-in` renders and emits `noindex`. It does not yet prove the branded identity shell or any parity on `/session-tasks/reset-password` or `/sso-callback`.

The seventh discovery is that narrow `vitest` filters for this repo need paths relative to `apps/web`, because the root `bun run test:unit` script changes the working directory before invoking Vitest. `bun run test:unit -- --run apps/web/tests/unit/home-page-content.test.ts` reports “No test files found,” while `bun run test:unit -- --run tests/unit/home-page-content.test.ts` passes.

The eighth discovery is that `ProductBrand` already exposes the right accessible name for auth-header verification. Even though the visible wordmark is uppercase by default, the linked brand surface still resolves cleanly as `role="link"` with the accessible name `Ship by Sunday`, which keeps the route-level tests stable while aligning the header with the rest of the product.

The ninth discovery is that the quiet pricing-path rule belongs in the sign-in page model, not in the banner component. Once `purchase_required` was treated as a recovery state instead of a marketing state, `SignInBanners` could stay focused on error messaging while `getSignInPageContent` owned the support-panel action visibility.

The tenth discovery is that this repo’s integration-UI assertions do not include the Jest DOM `toHaveTextContent` matcher by default. The new reset-password route test needed a plain `element.textContent` assertion instead, which is worth remembering for any additional route-shell tests added in this pass.

The eleventh discovery is that the browser-smoke local-server flow disables Clerk middleware on purpose by setting `DISABLE_CLERK_MIDDLEWARE=1` in `apps/web/playwright.config.ts`. Any auth route entrypoint that calls `auth()` during server render must therefore respect `shouldBypassClerkProtection()` or browser smoke will fail before the actual route assertions even run.

The twelfth discovery is that the dirty worktree already contained an in-progress `product-access` refactor with compile gaps that blocked `next build` inside browser smoke. The minimal compatible repairs were to pass the new `pricingHref` argument in `access-required-page.tsx`, align `AccessRequiredPathCard` with the new `cards` prop shape, switch one co-located import to a relative path for Turbopack stability, and format the new `use-access-required-controller.ts` hook file so `bun run format:check` could pass.

## Decision Log

2026-03-26 ET — Decision: treat this as a flagship identity-screen refresh, not an MVP cleanup. Rationale: `/sign-in` is a first-impression route for paid access recovery, so the acceptance bar is “visibly premium and intentional,” not merely “less bad than the old card.”

2026-03-26 ET — Decision: use `apps/web/components/product-brand.tsx` as the navbar logo treatment. Rationale: it is the canonical Ship by Sunday wordmark source already used elsewhere in the repo, and no separate canonical navbar logo asset was found during repository inspection.

2026-03-26 ET — Decision: keep the redesign scoped to the `(identity)` route group and adjacent entry-point terminology instead of widening into a site-wide navigation refactor. Rationale: the problem is concentrated in the identity route shell, and the smallest safe fix is to improve that surface directly while normalizing the one nearby terminology outlier.

2026-03-26 ET — Decision: normalize against existing tokens and shared primitives before inventing new page-specific styling. Rationale: the route should feel more premium without drifting away from the rest of the product. `apps/web/app/globals.css` and the existing UI components define the baseline system that the redesign must reuse.

2026-03-26 ET — Decision: normalize adjacent entry-point copy to `Sign in`. Rationale: `Sign in` already dominates the auth UI, checkout recovery flows, access recovery flows, docs navigation, and tests. Changing the isolated `Log in` outlier in `apps/web/config/product.ts` is lower-risk than rewriting everything else.

2026-03-26 ET — Decision: the identity header should contain the brand plus one `Home` link only. Rationale: the route should remain focused on access recovery, not become a broader site navigation surface.

2026-03-26 ET — Decision: the desktop shell direction is an explicit split layout. Rationale: a split layout gives the page enough structure to feel designed, creates a natural place for operational trust content, and still collapses cleanly to one column on mobile.

2026-03-26 ET — Decision: the secondary panel content is minimal operational trust only. Rationale: it may include a short brand line, one purchase/access reminder, and two or three concise bullets about what happens after sign-in, but it must not pull in testimonials, founder proof, screenshots, or other marketing proof blocks.

2026-03-26 ET — Decision: include one quiet pricing path, but only on cold/default sign-in visits. Rationale: new visitors need a clear escape hatch, but already-paid users should not be nudged toward a second checkout while they are reconnecting access. The plan defines cold/default visits as the credentials state with no `redirect_url` and no `auth_error` query parameter.

2026-03-26 ET — Decision: include `/session-tasks/reset-password` in scope for shell parity only. Rationale: it uses `AuthPageShell`, so it must not be ignored, but the plan should not widen into bespoke theming of Clerk’s `TaskResetPassword` internals beyond the existing shadcn-based Clerk theme.

2026-03-26 ET — Decision: include `/sso-callback` in scope with full refreshed-shell parity. Rationale: it is a first-class auth route, uses `AuthPageShell`, and should look like part of the same identity system even though it is a transient loading screen.

2026-03-26 ET — Decision: organizations, MFA, and non-reset Clerk session tasks are explicit non-goals. Rationale: the product owner confirmed that these are not part of the intended product flow here. Existing fallback behavior should remain intact, but the refresh should not spend design effort on those branches.

2026-03-26 ET — Decision: route-level browser-smoke proof is required for `/sign-in`, `/session-tasks/reset-password`, and `/sso-callback`. Rationale: this change is heavily visual and route-level, so integration-UI tests alone are not enough.

2026-03-26 ET — Decision: performance acceptance uses a relative no-regression rule rather than hard numeric budgets. Rationale: the repo does not already define stable numeric auth-route budgets, but the refresh still needs a concrete “do not get slower” enforcement rule.

2026-03-26 ET — Decision: keep Milestone 1 terminology normalization scoped to the existing marketing config outlier only. Rationale: repository search showed `starterConfig.marketing.loginLabel` was the only nearby `Log in` surface, so widening into a broader copy sweep would add risk without improving the identity route contract.

2026-03-26 ET — Decision: extract the identity header into `apps/web/features/auth/identity/identity-layout-header.tsx`. Rationale: the `(identity)` layout should stay small, and a route-local header component preserves the feature boundary without promoting auth-specific navigation into the global component layer.

2026-03-26 ET — Decision: model the quiet `See pricing` path with `isColdDefaultVisit` inside `useSignInFlow` and consume it in `getSignInPageContent`. Rationale: the visibility rule depends on raw route state (`redirect_url` and `auth_error`) plus the current sign-in step, so keeping it in the page-model layer avoids leaking route-state branching into the banner or form components.

2026-03-26 ET — Decision: keep sibling-route support copy in `apps/web/features/auth/sign-in/identity-route-panel-content.ts`. Rationale: reset-password and SSO callback need the same shell language as `/sign-in`, but the route-specific support content is static and should not be duplicated inline across server and client entrypoints.

2026-03-26 ET — Decision: make `apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx` skip `auth()` when `shouldBypassClerkProtection()` is true. Rationale: browser smoke intentionally runs with Clerk middleware disabled, so the server entrypoint must honor the repo’s existing bypass contract or the route cannot be rendered for smoke verification.

2026-03-26 ET — Decision: accept minimal compatibility fixes inside `apps/web/features/product-access/` to unblock validation. Rationale: those files were already mid-refactor in the dirty worktree, and the fixes were small, type-directed, and necessary to get the required build and browser-smoke commands back to green.

## Outcomes & Retrospective

2026-03-26 ET — Milestone 1 completed cleanly with a low-risk terminology change instead of a broader copy pass. The repo now exposes `Sign in` consistently across the touched marketing entry point and the auth route itself, which keeps the upcoming shell redesign anchored to one terminology system before visual work starts.

2026-03-26 ET — Milestone 2 completed with a feature-local header extraction instead of inline layout markup. The identity routes now use the same wordmark system as the home and docs surfaces while preserving the constrained brand-plus-Home contract that the redesign depends on.

2026-03-26 ET — Milestone 3 completed with a page-model-driven split shell rather than one oversized route component. `/sign-in` now has a dominant form panel, an operational trust panel, and explicit recovery-state rules for the pricing path while the Clerk flow logic remains inside `useSignInFlow`.

2026-03-26 ET — Milestone 4 completed by giving `/session-tasks/reset-password` and `/sso-callback` the same shell language without widening into bespoke Clerk task styling. The shared frame now reads as one identity system across all three real auth routes, while the reset-password route still delegates the actual task UI to Clerk.

2026-03-26 ET — Final outcome: the identity refresh landed with the intended scope. `/sign-in` now uses a branded header and split premium shell, the quiet pricing path appears only on cold/default credentials visits, `/session-tasks/reset-password` and `/sso-callback` inherit the same system, and the required validation stack is green. The only scope expansion beyond the ExecPlan was a set of validation-unblocking compatibility repairs in the already-dirty `product-access` feature so browser smoke and build could execute successfully.

## Context and Orientation

The primary route entrypoint is `apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx`, which renders `SignInPage` from `apps/web/features/auth/sign-in/sign-in-page.tsx`. The route-group wrapper is `apps/web/app/(identity)/layout.tsx`, and it currently owns the page-level header and the centering container for identity screens. Any brand or layout change in this file affects every screen in the `(identity)` route group.

Three identity routes matter to this plan. `/sign-in` is rendered by `SignInPage`. `/session-tasks/reset-password` is defined in `apps/web/app/(identity)/session-tasks/reset-password/page.tsx` and renders Clerk’s `TaskResetPassword` inside `AuthPageShell`. `/sso-callback` is defined in `apps/web/app/(identity)/sso-callback/page.tsx` and renders `SsoCallbackPage`, which also uses `AuthPageShell`. `apps/web/app/(identity)/sign-up/[[...sign-up]]/page.tsx` is not a designed UI surface here because it redirects to pricing.

The core presentation shell is `apps/web/features/auth/sign-in/auth-page-shell.tsx`. Today that file renders a generic `Card`, which is the main reason the route looks like a default template rather than a designed product surface. The refresh should replace that generic shell with a route-specific structure while still grounding controls in the shared UI system.

`SignInPage` computes the title and description based on the current sign-in step and renders one of several state-specific components. The primary ones relevant to this plan are `SignInCredentialsForm` and `SignInResetForm`. The code also contains verification flows in `SignInVerificationForm`, `useSignInFlow.ts`, and related files, but those are not active product requirements for this refresh and should not become new design branches. The shared shell must not make them unusable if they appear unexpectedly, but they are not named acceptance targets.

The route already has a shared brand source of truth at `apps/web/components/product-brand.tsx`. That file exports `ProductBrand`, `productWordmarkFontClassName`, and `productWordmarkClassName`. The redesign should use those exports rather than duplicating brand font classes or spelling the product name as raw text.

The token and theme source for the web app is `apps/web/app/globals.css`. It defines the OKLCH color tokens, radii, light and dark values, and the `font-marketing-display` utility. The redesign should reuse these system-level values and avoid one-off colors, shadows, radii, or spacing values unless they are promoted into the shared system intentionally. The auth route should not become a visual exception that ignores `globals.css`.

The most relevant shared primitives for the redesign are `apps/web/components/ui/button.tsx`, `apps/web/components/ui/input.tsx`, `apps/web/components/ui/field.tsx`, `apps/web/components/ui/alert.tsx`, and `apps/web/components/ui/spinner.tsx`. The redesign may wrap or compose those primitives differently, but it should not bypass them lightly. The shell should be custom, while the controls remain grounded in the shared UI system.

Two route-state query parameters matter to the plan. `redirect_url` is governed by `apps/web/features/auth/sign-in/sign-in-route-utils.ts` and indicates a deep-link or recovery flow that should preserve the return path after auth. `auth_error` is currently used to represent the purchase-required Google sign-in case. The quiet pricing link approved for this plan should only appear on cold/default sign-in visits, which means credentials state with neither of those query parameters present.

The primary existing UI contracts are `apps/web/tests/integration-ui/sign-in-page.test.tsx` and `apps/web/tests/integration-ui/sso-callback-page.test.tsx`. Route-level smoke proof currently lives in `apps/web/tests/browser-smoke/app-smoke.spec.ts` and must be extended by this plan. Because adjacent entry-point terminology is in scope, `apps/web/config/product.ts` and `apps/web/features/starter/lib/starter-selectors.ts` also belong to the orientation context.

The product design context comes from `.impeccable.md` at the repository root. The relevant constraints are that Ship by Sunday should feel curious, bold, serious, premium, and operational. The interface should use decisive hierarchy, restrained but confident styling, and deliberate interaction polish. Light and dark themes are both first-class experiences, and childish or generic SaaS styling is explicitly out of bounds.

## Plan of Work

Start by normalizing the route against the existing system rather than drawing a new auth style in isolation. That means reading `apps/web/app/globals.css`, the shared primitives, and the current brand component first, then identifying which parts of the identity routes already match the product system and which parts drift away from it. The work should avoid introducing one-off colors, new font stacks, decorative hero media, or extra UI libraries. In the same normalization pass, update adjacent entry-point terminology so the product consistently says `Sign in` where this plan touches auth entry surfaces, including the marketing login label in `apps/web/config/product.ts`.

Once the route is normalized conceptually, rebuild the route-group header in `apps/web/app/(identity)/layout.tsx` so it uses `ProductBrand` and establishes a stronger top-line frame. If the header grows beyond a small route wrapper, extract a feature-local component such as `apps/web/features/auth/identity/identity-layout-header.tsx`. The header must remain lightweight, contain only the brand and a `Home` link, and survive narrow widths, zoom, and long copy without truncation or collisions.

After the header is corrected, redesign `apps/web/features/auth/sign-in/auth-page-shell.tsx` as an explicit split layout on large screens. One side holds the active form or loading state. The other side holds minimal operational trust content only. That secondary panel may include a short brand line, one purchase/access reminder, and two or three concise bullets about what happens after sign-in. It must not include founder proof, testimonials, screenshots, feature grids, or broader marketing proof content.

Once the split shell exists, apply it to the primary `/sign-in` route. The form panel must remain dominant and direct. The operational trust panel may include one quiet `See pricing` path, but only on cold/default sign-in visits. Hide that path when `redirect_url` or `auth_error` is present and on the reset-password and callback routes. The same shell should still hold together when the route shows error banners, loading states, or reset copy.

Then extend the refreshed shell to the two shared-shell sibling routes. `/session-tasks/reset-password` must inherit the new header and shell cleanly, but the plan does not authorize bespoke restyling of Clerk’s `TaskResetPassword` internals beyond the existing theme import in `apps/web/app/globals.css`. `/sso-callback` must receive the full refreshed-shell treatment appropriate to a loading screen, meaning it should feel like part of the same premium identity system rather than a leftover spinner page.

Only after the routes are structurally correct and behaviorally stable should the final polish pass happen. That pass should cover optical alignment, spacing consistency, line breaks, heading balance, theme checks, hover and focus quality, reduced-motion behavior, and manual “use it yourself” QA. The plan deliberately pushes this pass late so time is not wasted polishing a layout that still needs structural changes.

## Milestones

### Milestone 1: Normalize the identity routes against the shared system and terminology

At the end of this milestone, the implementer will have audited the identity routes against `apps/web/app/globals.css`, `apps/web/components/product-brand.tsx`, and the shared UI primitives so the redesign uses system tokens and components instead of introducing one-off styling. This milestone also includes the adjacent terminology decision to normalize touched entry points to `Sign in`, including the current `Log in` outlier in `apps/web/config/product.ts`. Success is proven when the implementation direction and the touched copy surfaces are clearly anchored to the same token, typography, component, and terminology system used elsewhere in the product.

### Milestone 2: Restore a branded identity header

At the end of this milestone, `apps/web/app/(identity)/layout.tsx` will render a real Ship by Sunday brand treatment using `ProductBrand`, and the top bar will feel intentional instead of placeholder-like. If a new `apps/web/features/auth/identity/identity-layout-header.tsx` component is introduced, it must remain small and route-specific. Success is proven when opening the identity routes shows the same wordmark system used elsewhere in the product and when the header remains stable at small widths, high zoom, and in both themes.

### Milestone 3: Replace the generic auth card with a split shell for `/sign-in`

At the end of this milestone, `apps/web/features/auth/sign-in/auth-page-shell.tsx` will no longer be a stock small card. It will be a split layout on large screens and a clear single-column layout on smaller screens. `/sign-in` will use a dominant form panel and a minimal operational trust panel. The trust panel may include one quiet `See pricing` path only on cold/default visits. Success is proven when the route feels like a premium identity screen instead of a generic auth card and when the layout still collapses cleanly on mobile.

### Milestone 4: Extend the refreshed shell to reset-password and callback flows

At the end of this milestone, `/session-tasks/reset-password` and `/sso-callback` will both use the refreshed identity shell appropriately. `/session-tasks/reset-password` must have shell parity only, with no bespoke restyle of `TaskResetPassword` internals. `/sso-callback` must receive full refreshed-shell parity appropriate to its loading-state role. Success is proven when all three real identity routes feel like the same system and none of them looks abandoned or mismatched.

### Milestone 5: Harden, prove, and polish the refreshed routes

At the end of this milestone, the refreshed identity routes will be resilient under long text, long email addresses, autofill, error states, keyboard-only navigation, reduced-motion preferences, rapid repeated user actions, and high zoom. Route-level browser-smoke proof will exist for `/sign-in`, `/session-tasks/reset-password`, and `/sso-callback`. Validation commands will be green, and the plan will include concise evidence about what passed and any remaining gaps. Success is proven when the routes look intentional, behave correctly, and stay fast without obvious regression.

## Concrete Steps

Work from the repository root at `/Users/parkerrex/Projects/ship-by-sunday`. Begin by re-reading the current header, shell, sibling identity routes, shared-system files, and browser-smoke spec so the redesign is anchored in actual code instead of memory.

    pwd
    /Users/parkerrex/Projects/ship-by-sunday

    sed -n '1,220p' apps/web/app/'(identity)'/layout.tsx
    sed -n '1,220p' apps/web/app/'(identity)'/session-tasks/reset-password/page.tsx
    sed -n '1,220p' apps/web/app/'(identity)'/sso-callback/page.tsx
    sed -n '1,260p' apps/web/features/auth/sign-in/sign-in-page.tsx
    sed -n '1,220p' apps/web/features/auth/sign-in/auth-page-shell.tsx
    sed -n '1,240p' apps/web/features/auth/sign-in/sso-callback-page.tsx
    sed -n '1,260p' apps/web/app/globals.css
    sed -n '1,220p' apps/web/components/product-brand.tsx
    sed -n '1,220p' apps/web/tests/browser-smoke/app-smoke.spec.ts

Before changing structure, compare the identity routes to the existing branded surfaces that already feel correct enough to reuse. The main references inside this repository are `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx` and `apps/web/features/docs/components/docs-navbar.tsx`.

    sed -n '1,220p' apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx
    sed -n '1,220p' apps/web/features/docs/components/docs-navbar.tsx

Normalize terminology before or alongside the shell work. The most likely touched source is `apps/web/config/product.ts`, where `starterConfig.marketing.loginLabel` currently uses `Log in`. Keep the normalization tight: this plan only authorizes adjacent entry-point changes that make the product consistently say `Sign in` where auth entry is exposed.

Implement the header changes first in `apps/web/app/(identity)/layout.tsx` and any extracted feature-local header component. Then rebuild `apps/web/features/auth/sign-in/auth-page-shell.tsx` and any new feature-local shell panels so the route becomes an explicit split layout on large screens. Keep the header limited to the brand and a `Home` link. Keep the shell’s secondary panel limited to operational trust content, not marketing proof.

Apply the refreshed shell to `/sign-in` first. As the shell takes shape, verify that the form-level components still preserve input values and labels. The most likely files to touch after the shell are `apps/web/features/auth/sign-in/sign-in-credentials-form.tsx`, `apps/web/features/auth/sign-in/sign-in-secondary-actions.tsx`, `apps/web/features/auth/sign-in/sign-in-banners.tsx`, and possibly `apps/web/features/auth/sign-in/sign-in-page.tsx` to express cold/default-state logic for the quiet pricing path.

After `/sign-in` is stable, extend the shell to `apps/web/app/(identity)/session-tasks/reset-password/page.tsx` and `apps/web/features/auth/sign-in/sso-callback-page.tsx`. Do not restyle `TaskResetPassword` internals beyond the existing theme. Do make the callback route feel like part of the same premium identity system.

Update route-level proof after the shell is stable. Add browser-smoke assertions in `apps/web/tests/browser-smoke/app-smoke.spec.ts` so `/sign-in`, `/session-tasks/reset-password`, and `/sso-callback` each prove the refreshed shell and `noindex` behavior. Update integration-UI tests in `apps/web/tests/integration-ui/sign-in-page.test.tsx` and `apps/web/tests/integration-ui/sso-callback-page.test.tsx` for approved visible changes.

Run the narrowest relevant automated suites from the repository root once route structure is stable.

    bun run format:check
    bun run lint
    bun run test:unit
    bun run test:integration:ui

Expected success signal: formatting, lint, unit, and integration-UI checks pass, including updated auth-route assertions and any product-config-driven copy expectations affected by the `Sign in` normalization.

Run browser-smoke with the local environment loaded so the route-level proof runs against the actual app.

    set -a; source apps/web/.env.local; set +a; bun run test:browser-smoke

Expected success signal: the browser-smoke suite passes and proves the refreshed shell and `noindex` behavior on `/sign-in`, `/session-tasks/reset-password`, and `/sso-callback`.

Run a production build from the repository root once automated UI checks are green.

    bun run build

Expected success signal: Next.js completes the build without route, type, or bundling errors.

For manual verification, start the web app from the repository root and open `/sign-in`, `/session-tasks/reset-password`, and `/sso-callback` at mobile and desktop widths in both themes. If the refresh adds motion or rich visual framing, capture a quick before-and-after performance check in browser tooling so the route does not regress silently.

    bun run dev:web

Expected observation: `/sign-in` shows the Ship by Sunday wordmark in the header, a split layout on large screens, a dominant form panel, and a minimal operational trust panel. The quiet `See pricing` path is visible only on cold/default sign-in visits. `/session-tasks/reset-password` inherits the new shell without bespoke Clerk-task restyling. `/sso-callback` inherits the refreshed shell and feels visually coherent as a loading route. If browser tooling is available, the routes should show no obvious layout shift when banners appear or when auth-state content changes.

## Validation and Acceptance

Acceptance is based on observable behavior, not only changed code. A human opening `/sign-in` must immediately recognize Ship by Sunday from the shared wordmark treatment and the page’s overall structure. The page must no longer look like a stock auth card on an empty background. On large screens it must use a split layout. One side is the active form. The other side is a minimal operational trust panel, not a marketing panel.

The identity header must contain exactly the brand and one `Home` link. The route must not sprout extra docs, pricing, or secondary navigation items. The adjacent entry-point terminology touched by this plan must normalize to `Sign in`, including the current marketing login label outlier in `apps/web/config/product.ts`.

The secondary panel content on `/sign-in` is tightly constrained. It may include a short brand line, one purchase/access reminder, and two or three concise bullets explaining what happens after sign-in. It may include one quiet `See pricing` path only on cold/default sign-in visits, defined as credentials state with no `redirect_url` and no `auth_error`. It must not include founder proof, testimonials, screenshots, feature grids, or a broad CTA stack. The pricing path must be hidden on explicit recovery states such as deep-link return flows and the purchase-required banner case.

The refresh must explicitly cover three routes. `/sign-in` gets the full redesigned experience. `/session-tasks/reset-password` must inherit the new header and shell cleanly, but Clerk’s `TaskResetPassword` internals should remain governed by the existing Clerk theme rather than a bespoke restyle. `/sso-callback` must receive the same refreshed-shell quality bar appropriate to a loading screen. All three routes must still emit `noindex`.

Organizations, MFA, and non-reset Clerk session tasks are non-goals. The code already contains fallback behavior for unknown tasks and verification states, and the shared shell must not make those branches unusable if they appear unexpectedly. However, this plan does not authorize new design work or new validation branches for organization setup, second-factor UX, or other session-task surfaces beyond password reset.

The refreshed routes must remain resilient under long email addresses, long error messages, longer helper copy, autofill, keyboard-only navigation, reduced-motion preferences, rapid repeated user actions, and 200% zoom. Every interactive surface must preserve clear focus visibility and logical keyboard order. Rapid repeated clicks on “Sign in” and “Continue with Google” must not create duplicate-submit confusion. If the refresh introduces motion, it must respect `prefers-reduced-motion` and use only transform or opacity animations so the layout remains stable.

Responsive and accessibility acceptance are explicit. The routes must remain readable and intact on mobile, tablet, and desktop widths. Touch targets should remain comfortably tappable. The header, wordmark, banners, fields, and secondary actions must still fit without collisions or truncation at 200% zoom. Light and dark themes must both remain usable and maintain contrast without hard-coded colors that fight the token system.

Performance is part of acceptance. The refreshed routes must not introduce heavy decorative media, extra third-party scripts, or unnecessary font loads above the fold. Above-the-fold content should render eagerly. If the shell introduces richer framing, it must not materially worsen quick DevTools or Lighthouse observations compared with the current routes, and it must not introduce obvious CLS when the page loads or when auth-state content changes.

The implementation is not complete until `bun run format:check`, `bun run lint`, `bun run test:unit`, `bun run test:integration:ui`, `set -a; source apps/web/.env.local; set +a; bun run test:browser-smoke`, and `bun run build` all pass from the repository root or any skipped command is explicitly justified in this plan with a concrete reason.

## Idempotence and Recovery

This plan is safe to execute incrementally because it does not require migrations, backend changes, or destructive operations. The safest implementation order is normalization and terminology first, header second, primary sign-in shell third, reset-password and callback parity fourth, and late-stage polish last. If a redesign experiment breaks the screen, revert only the in-progress presentation files and keep the existing auth logic intact. Do not couple shell experiments to Clerk flow changes unless a genuine bug demands it.

If an extracted component proves unnecessary, fold it back into the nearest feature-local parent before finalizing. If a test fails after copy or structure changes, decide whether the test describes a still-required user-visible contract or merely outdated expectations. Update the test only after confirming that the visible change is intentional and approved. If the build or manual QA reveals layout instability, return to the last green shell state, rerun the auth-focused test surfaces, and then reintroduce the visual treatment in smaller slices.

If a proposed visual flourish requires new assets, new font weights, or new dependencies, treat that as a red flag and prove it is necessary before keeping it. The default recovery path is to prefer typography, spacing, framing, and token-consistent surfaces over heavy media or ornamental effects.

If implementation starts drifting into organizations, MFA, or broader session-task redesign, stop and trim scope back to what this plan explicitly allows. The same applies if the copy sweep starts expanding beyond adjacent `Sign in` entry points or if the quiet pricing path starts appearing on deep-link or recovery states.

## Artifacts and Notes

Current evidence from repository inspection that should remain true unless intentionally changed:

    apps/web/app/(identity)/layout.tsx currently renders:
    - IdentityLayoutHeader from apps/web/features/auth/identity/identity-layout-header.tsx
    - a single Home link beside ProductBrand
    - children centered inside a full-screen container

    apps/web/components/product-brand.tsx currently exports:
    - ProductBrand
    - productWordmarkFontClassName
    - productWordmarkClassName

    apps/web/app/(identity)/session-tasks/reset-password/page.tsx currently:
    - wraps Clerk TaskResetPassword inside AuthPageShell
    - passes resetPasswordSupportPanelContent for shell parity

    apps/web/features/auth/sign-in/auth-page-shell.tsx currently:
    - renders a framed shell instead of a stock Card
    - shows a split layout when support-panel content is provided
    - now powers all three identity routes

    apps/web/features/auth/sign-in/sso-callback-page.tsx currently:
    - wraps a loading spinner and message inside AuthPageShell
    - passes ssoCallbackSupportPanelContent for route parity

    apps/web/app/(identity)/sign-up/[[...sign-up]]/page.tsx currently:
    - redirects to pricing instead of rendering a sign-up UI

    apps/web/config/product.ts currently sets:
    - starterConfig.marketing.loginLabel = "Sign in"

    apps/web/tests/browser-smoke/app-smoke.spec.ts currently:
    - proves the branded sign-in shell plus `noindex`
    - proves reset-password shell parity plus `noindex`
    - proves SSO callback shell parity plus `noindex`

Validation evidence gathered during execution:

    bun run format:check
    All matched files use the correct format.

    bun run lint
    Found 0 warnings and 0 errors.

    bun run test:unit -- --run tests/unit/home-page-content.test.ts
    Test Files  1 passed (1)
    Tests       2 passed (2)

    bun run test:unit -- --run tests/unit/sign-in-route.test.ts
    Test Files  1 passed (1)
    Tests       4 passed (4)

    bun run test:unit
    Test Files  83 passed (83)
    Tests       312 passed (312)

    bun run test:integration:ui -- --run tests/integration-ui/sign-in-page.test.tsx
    Test Files  1 passed (1)
    Tests       10 passed (10)

    bun run test:integration:ui -- --run tests/integration-ui/reset-password-page.test.tsx tests/integration-ui/sso-callback-page.test.tsx
    Test Files  2 passed (2)
    Tests       5 passed (5)

    bun run test:integration:ui
    Test Files  15 passed (15)
    Tests       51 passed (51)

    set -a; source apps/web/.env.local; set +a; bun run test:browser-smoke
    5 passed

    bun run build
    ✓ Compiled successfully
    ✓ Finished TypeScript
    ✓ Generating static pages using 9 workers (65/65)

Current planning evidence from local skill review and grill decisions that shaped this plan:

    polish:
    - raise the quality bar to flagship, not MVP
    - reserve late-stage time for optical alignment and self-QA

    harden:
    - test overflow, zoom, long copy, keyboard order, and reduced motion
    - keep duplicate-submit and route-state resilience explicit

    optimize:
    - do not make the auth routes slower while trying to make them feel premium
    - avoid CLS and keep above-the-fold auth content eager

    normalize:
    - ground the redesign in globals.css tokens and shared UI primitives
    - forbid one-off styling unless it is intentionally promoted into the system

    grill decisions:
    - only reset-password is a real session-task UI surface here
    - organizations, MFA, and non-reset tasks are non-goals
    - header is brand plus one Home link
    - desktop shell is split layout
    - pricing path is quiet and only for cold/default sign-in visits
    - browser-smoke must prove /sign-in, /session-tasks/reset-password, and /sso-callback

## Interfaces and Dependencies

`apps/web/app/(identity)/layout.tsx` remains the correct route-level interface for the identity header and page frame. If the header needs extraction, the new component should remain feature-local under `apps/web/features/auth/identity/` rather than becoming a global site header.

`apps/web/features/auth/sign-in/auth-page-shell.tsx` is the central shared shell boundary for this plan. It must support `/sign-in`, `/session-tasks/reset-password`, and `/sso-callback` without turning those routes into separate visual systems.

`apps/web/features/auth/sign-in/sign-in-page.tsx` remains the controller boundary for the sign-in route. `apps/web/features/auth/sign-in/use-sign-in-flow.ts` remains the Clerk-backed behavior source and should not be rewritten for this visual refresh unless a real bug is discovered. `apps/web/features/auth/sign-in/sign-in-route-utils.ts` defines the meaning of `redirect_url` and `auth_error`, which this plan uses to distinguish cold/default sign-in visits from recovery states.

`apps/web/app/(identity)/session-tasks/reset-password/page.tsx` depends on Clerk’s `TaskResetPassword`. That dependency should remain intact. The plan only authorizes shell parity, not a bespoke internal restyle of the Clerk task surface. `apps/web/features/auth/sign-in/sso-callback-page.tsx` is a first-class identity route and must receive the refreshed shell treatment appropriate to a loading screen. `apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx` now also depends on `apps/web/platform/auth/clerk-middleware-bypass.ts` so the route can render safely in the repo’s Clerk-bypassed local-server smoke environment.

`apps/web/components/product-brand.tsx` is the canonical Ship by Sunday brand interface and must be the source of the wordmark treatment in the identity header. `apps/web/app/globals.css` is the token and theme contract for colors, radii, and typography utilities. Shared controls should continue to use `apps/web/components/ui/button.tsx`, `apps/web/components/ui/input.tsx`, `apps/web/components/ui/field.tsx`, `apps/web/components/ui/alert.tsx`, and `apps/web/components/ui/spinner.tsx`.

`apps/web/config/product.ts` and `apps/web/features/starter/lib/starter-selectors.ts` are in scope because this plan explicitly normalizes the adjacent `Sign in` terminology that flows into entry-point surfaces. `apps/web/tests/integration-ui/sign-in-page.test.tsx`, `apps/web/tests/integration-ui/sso-callback-page.test.tsx`, and `apps/web/tests/browser-smoke/app-smoke.spec.ts` are the primary proof surfaces for this slice and must be updated to reflect approved visible changes while preserving meaningful behavioral assertions.

The required tooling interfaces are the root scripts in `package.json`, especially `bun run format:check`, `bun run lint`, `bun run test:unit`, `bun run test:integration:ui`, `bun run test:browser-smoke`, `bun run build`, and `bun run dev:web`.
