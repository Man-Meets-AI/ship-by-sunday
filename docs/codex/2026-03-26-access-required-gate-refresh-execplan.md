---
summary: "Redesigns the access-required gate into a branded, calm checkpoint that explains the user state and the next action more clearly. It keeps the underlying access behavior intact while replacing the generic fallback-card feel."
read_when: "Open this when changing protected-route fallback UI, access-gate copy, or product-access shell/controller behavior."
plan_status: "done"
---

# Refresh the Access-Required Gate Experience

This document is a living execution plan for redesigning the Ship by Sunday access-required gate so it feels branded, calm, and trustworthy instead of like a generic fallback card. It must be updated as implementation progresses so a new coding agent can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this work, a person who hits the canonical protected blueprint entry at `/start` without access will land on a branded Ship by Sunday checkpoint instead of a stock card with stacked alerts. The screen will show the Ship by Sunday wordmark in the header, explain the account state with stronger hierarchy, and make the two real next steps obvious: recover an existing purchase or buy access now. This matters because the gate is not a throwaway utility screen. It appears at the exact moment a buyer is trying to regain trust, recover access, or decide whether to purchase. The work is successful when a human can open `/start` without access, immediately recognize the product, understand why they are blocked, and take the right next action on mobile and desktop in both light and dark themes.

## Progress

- [x] 2026-03-26 09:21 ET: Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, and `docs/prompts/execplan-writer.md` before planning.
- [x] 2026-03-26 09:21 ET: Read the blueprint-first source docs listed by `apps/web/AGENTS.md` to confirm that protected workspace entry remains part of the blueprint-first funnel and that unlock logic must stay intact.
- [x] 2026-03-26 09:21 ET: Confirmed design context from `.impeccable.md` and locked the quality bar to premium, serious, and operational rather than playful or generic.
- [x] 2026-03-26 09:21 ET: Inspected the current gate entrypoints and presentation files in `apps/web/app/(workspace)/layout.tsx`, `apps/web/features/product-access/components/access-required-page.tsx`, `apps/web/features/product-access/components/access-required-content.tsx`, `apps/web/features/product-access/components/access-required-actions.tsx`, and `apps/web/features/product-access/lib/access-required-view-model.ts`.
- [x] 2026-03-26 09:21 ET: Confirmed the current surface is one generic `Card` with nested `Alert`, `Badge`, and `Separator` blocks, with no branded header and very little visual hierarchy.
- [x] 2026-03-26 09:21 ET: Inspected existing brand and shell patterns in `apps/web/components/product-brand.tsx`, `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx`, `apps/web/features/docs/components/docs-navbar.tsx`, and `apps/web/features/course/shared/components/app-shell/app-shell-workspace-nav.tsx`.
- [x] 2026-03-26 09:21 ET: Reviewed `apps/web/tests/unit/access-required-page.test.tsx` and `apps/web/tests/integration-ui/access-required-page.interactions.test.tsx` to understand the current UI and behavior contract.
- [x] 2026-03-26 09:21 ET: Read the local `polish`, `harden`, `optimize`, and `normalize` skill guidance as planning input only and folded the relevant quality requirements into this ExecPlan.
- [x] 2026-03-26 10:03 ET: Normalized the access gate against the existing Ship by Sunday brand by anchoring the redesign on `ProductBrand`, shared buttons, the existing spinner, and the current access-state view-model contract instead of introducing a separate mini design system.
- [x] 2026-03-26 10:03 ET: Extracted the live polling, retry, refresh, and signed-out redirect logic into `apps/web/features/product-access/hooks/use-access-required-controller.ts`, reducing `apps/web/features/product-access/components/access-required-page.tsx` to a thin page wrapper.
- [x] 2026-03-26 10:03 ET: Replaced the generic one-card gate with a branded checkpoint shell composed from `access-required-header.tsx`, `access-required-status-panel.tsx`, `access-required-path-card.tsx`, `access-required-help-panel.tsx`, and the updated action row component.
- [x] 2026-03-26 10:56 ET: Hardened the inline access states by making the path actions stack cleanly on mobile, keeping helper and support copy wrap-safe, preserving visible busy-state feedback for retry and reauthenticate actions, and avoiding any new motion or heavy media that would complicate reduced-motion or layout stability.
- [x] 2026-03-26 10:06 ET: Ran the broader validation slice with `bun run lint` and `bun run build`; both passed after retrying the build once because another shared `next build` process was already active in the worktree.
- [x] 2026-03-26 10:06 ET: Manually verified the signed-out protected-route path by navigating `http://localhost:3000/start` through Chrome DevTools and confirming the live redirect to Clerk sign-in.
- [x] 2026-03-26 10:56 ET: Added deterministic sandbox persona normalization by resetting product access for the non-entitled QA user, granting access for the entitled QA user, syncing the new Convex mutation with `bunx convex dev --once --env-file .env.local`, and rerunning `tests/e2e/auth-protection.sandbox.spec.ts` to a fully green result.
- [x] 2026-03-26 10:03 ET: Ran the narrow validation slice from `apps/web` with `bunx vitest run --project unit tests/unit/access-required-page.test.tsx` and `bunx vitest run --project integration-ui tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx`; both passed.
- [x] 2026-03-26 10:59 ET: Added a durable note to `apps/web/content/docs/local-qa.mdx` explaining that sandbox bootstrap now normalizes the no-access and entitled personas through Convex, and tightened the access-required integration test to assert that the non-checkout fallback link targets `/#pricing`.
- [x] 2026-03-26 15:48 ET: Ran a distill pass on the access-required shell by removing pill labels, badge-like chips, boxed sub-panels, and the remaining card framing, renaming the path card model plus component to `paths` and `AccessRequiredPathPanel`, and revalidating the feature with focused unit and integration-ui suites plus repo lint and build.

## Surprises & Discoveries

The first important discovery is that this screen is not an isolated route page. `apps/web/app/(workspace)/layout.tsx` returns `AccessRequiredPage` whenever `getServerProductAccess()` reports no access, which means the gate is the blocking shell for every protected workspace route. A redesign here must preserve the redirect, retry, and unlock behavior exactly or the whole workspace entry flow changes.

The second discovery is that the current implementation already sits at the repository’s component-boundary limit. `apps/web/features/product-access/components/access-required-page.tsx` is near the 150-line ceiling and mixes Convex polling, router refreshes, retry timers, signed-out redirects, and page rendering in one component. A visual refresh without a controller extraction would worsen the repo’s stated UI/logic separation rule.

The third discovery is that the “missing logo” problem is a reuse problem, not an asset problem. `apps/web/components/product-brand.tsx` already defines the canonical Ship by Sunday wordmark used by both home and docs surfaces. No separate dedicated header logo asset was found in `apps/web/public/`, only favicon images, so the safest default is to use `ProductBrand` as the header logo treatment for this screen.

The fourth discovery is that the view model architecture is directionally correct even though the UI is poor. `apps/web/features/product-access/lib/access-required-view-model.ts` already centralizes state-specific copy and action choices for `loading`, `signed_out`, `token_missing`, `no_access`, `pending`, `revoked`, and `refunded`. The redesign should keep that single-source-of-truth pattern and evolve it to support a better shell instead of scattering copy into multiple visual components.

The fifth discovery is that the current page looks bad for structural reasons, not because a few classes are missing. `apps/web/features/product-access/components/access-required-content.tsx` renders one centered `Card`, then stacks badges, an alert, a separator, the action sections, and another alert. The problem is the entire composition: there is no branded top frame, no clear dominant idea, no visual distinction between recovery and purchase paths, and no premium use of space.

The sixth discovery from the grill pass is that `signed_out` is not a primary visual state today. `apps/web/features/product-access/components/access-required-page.tsx` immediately redirects `signed_out` users to the sign-in route. That means the redesign should preserve this behavior and focus its main visual quality work on the inline states users actually dwell in: `loading`, `token_missing`, `no_access`, `pending`, `revoked`, and `refunded`.

The seventh discovery from the grill pass is that the current non-checkout purchase fallback is underspecified. The view model currently points “See offer” to `routeConfig.home`, but the repo already has a canonical pricing destination at `${routeConfig.home}${routeConfig.pricingHash}` used by adjacent checkout flows. The redesign should explicitly align the gate to that pricing destination.

The eighth discovery during implementation is that the feature did not need a nested `components/access-required/` folder after all. Eight focused presentation files plus one controller hook fit cleanly inside `apps/web/features/product-access/components/` and `hooks/` without mixing unrelated concerns, while also avoiding unnecessary import churn on the existing `AccessRequiredPage` entrypoint.

The ninth discovery during validation is that the sandbox auth bootstrap was session-only, not access-state aware. Global setup created signed-in storage states for both personas, but it never reset the non-entitled user back to `no_access`, so historical Convex data could silently make the “member without access” fixture look entitled until the bootstrap started normalizing access rows explicitly.

## Decision Log

2026-03-26 ET — Decision: treat this as a premium “access checkpoint” redesign, not a quick style cleanup. Rationale: the user complaint is about the whole visual and trust experience, and the route appears during payment recovery and gated entry, which makes it a flagship trust screen.

2026-03-26 ET — Decision: preserve the access and unlock behavior exactly. Rationale: `apps/web/app/(workspace)/layout.tsx`, `apps/web/features/product-access/server/product-access.ts`, and `api.access.viewerProductAccess` are already the gate contract. This plan changes presentation and UI organization, not product-access semantics.

2026-03-26 ET — Decision: use `apps/web/components/product-brand.tsx` as the header logo treatment. Rationale: it is the canonical branded wordmark already used elsewhere in the repo, and no stronger approved header-logo asset was found during inspection.

2026-03-26 ET — Decision: extract a feature-local controller hook before or during the shell rebuild. Rationale: `access-required-page.tsx` currently mixes stateful behavior and rendering; the repo rules explicitly require UI and logic separation.

2026-03-26 ET — Decision: keep the user choice architecture centered on two paths, “I already paid” and “I need access,” but present them as differentiated panels instead of generic stacked sections. Rationale: the current `cards` model already encodes that split, and it matches the real jobs users are trying to do on this screen.

2026-03-26 ET — Decision: do not widen this into a sign-in or checkout redesign. Rationale: adjacent flows may need related work, but the smallest safe slice is the access-required gate itself plus any feature-local support files needed to improve it.

2026-03-26 ET — Decision: preserve immediate redirect for `signed_out` users and treat that state as fallback-only for the gate UI. Rationale: the current product already routes signed-out viewers directly to sign-in, which is the fastest recovery path and keeps this slice focused on the inline blocked-access states.

2026-03-26 ET — Decision: route the non-checkout “need access” fallback CTA to pricing, not generic home. Rationale: the repo already exposes a canonical pricing destination at `${routeConfig.home}${routeConfig.pricingHash}`, and that is a clearer “review before buying” action than a general home link.

2026-03-26 ET — Decision: keep the header branding wordmark-only. Rationale: `ProductBrand` is the canonical reusable brand treatment, while an icon-plus-wordmark treatment or new asset path would widen the slice into new brand work.

2026-03-26 ET — Decision: keep the help area informational only. Rationale: no canonical runtime support destination is wired into the live app, so a real support CTA would require new product configuration outside this UI refresh.

2026-03-26 ET — Decision: treat `/start` as the canonical validation route for this plan. Rationale: current auth-protection E2E already uses `/start`, and it is the repo’s current blueprint-first entry route.

2026-03-26 ET — Decision: preserve the text “Access Required” somewhere on the screen, but not necessarily as the main heading. Rationale: this keeps continuity with current tests and route orientation while allowing stronger state-specific headlines in the new shell.

2026-03-26 ET — Decision: require sandbox auth-protection Playwright proof when the environment is available. Rationale: the repo already has a real E2E for this gate, and this screen is too trust-critical to validate only with static rendering tests when live auth proof is possible.

2026-03-26 10:03 ET — Decision: keep the refreshed presentation files flat inside `apps/web/features/product-access/components/` instead of introducing a nested `components/access-required/` folder. Rationale: the new shell stayed small enough to remain readable at the feature root, and keeping the `AccessRequiredPage` import path stable reduced churn while still enforcing UI/logic separation through the new controller hook.

2026-03-26 10:56 ET — Decision: normalize sandbox QA personas inside Playwright global setup, not just through manual prep scripts. Rationale: end-to-end auth coverage must be deterministic even when the hosted Convex dev deployment contains historical access rows for the no-access test user.

## Outcomes & Retrospective

The implementation achieved the intended user-visible result: the gate now renders as a branded checkpoint with the Ship by Sunday wordmark in the header, a dedicated status section, differentiated recovery-versus-purchase paths, and a quieter help rail instead of one stacked fallback card. A follow-up distill pass removed the pill, badge, and nested-box framing so the screen now relies on spacing, type hierarchy, and dividers instead of generic cards. The controller extraction materially improved maintainability because the page wrapper is now presentation-first and the retry, refresh, and redirect behavior lives in one hook.

The validation result is fully green for the touched surfaces. The targeted access-required unit and integration-ui suites passed, the new product-access reset unit coverage passed, lint passed, build passed, the signed-out live redirect was verified manually, and the opt-in sandbox auth-protection Playwright suite passed after making persona access-state setup deterministic.

## Context and Orientation

The protected workspace gate starts in `apps/web/app/(workspace)/layout.tsx`. That layout calls `getServerProductAccess()` from `apps/web/features/product-access/server/product-access.ts`. If access is granted, the protected children render. If access is missing, the layout returns `AccessRequiredPage`. This means the redesign is not for a low-value error page. It is the primary blocker surface for every protected workspace route.

The runtime behavior is split across server and client. The server helper returns `signed_out`, `token_missing`, or the result of `api.access.viewerProductAccess`. On the client, `apps/web/features/product-access/components/access-required-page.tsx` uses `useQuery(api.access.viewerProductAccess)` to poll for live access changes, retries `router.refresh()` when access becomes ready, redirects signed-out users to the sign-in route, and manages the manual retry button busy state. That behavior is critical and should be preserved. In particular, the grill pass locked the rule that `signed_out` remains an immediate redirect path, not a primary redesigned gate state.

The copy and action contract lives in `apps/web/features/product-access/lib/access-required-view-model.ts`. That file maps the access states `loading`, `signed_out`, `token_missing`, `no_access`, `pending`, `revoked`, and `refunded` into shell copy, helper text, help items, and action cards. It already distinguishes the recovery path from the purchase path. The redesign should keep this file as the only source of truth for state-specific messaging and CTA semantics. The grill pass also locked two specific action expectations: the non-checkout “need access” fallback should point to pricing, and the help area should remain informational rather than introducing a new support destination.

The old presentation was weak because `apps/web/features/product-access/components/access-required-content.tsx` reduced the whole gate to one generic `Card`. After the first implementation slice, `access-required-content.tsx` is only a compatibility alias to `access-required-shell.tsx`, while the actual shell is split across `access-required-header.tsx`, `access-required-status-panel.tsx`, `access-required-path-card.tsx`, `access-required-help-panel.tsx`, and the updated `access-required-actions.tsx`. That keeps the new visual identity explicit without scattering copy or behavior across unrelated files.

The canonical brand primitive is `apps/web/components/product-brand.tsx`. The strongest repo-local references for the brand in a header are `apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx`, `apps/web/features/docs/components/docs-navbar.tsx`, and `apps/web/features/course/shared/components/app-shell/app-shell-workspace-nav.tsx`. The redesign should feel closer to those surfaces than to a default dialog or fallback card.

The design context from `.impeccable.md` matters directly here. Ship by Sunday should feel bold, serious, expensive, and operational. The access gate should therefore feel like a deliberate checkpoint, not a playful onboarding page and not a glowing dark-mode SaaS cliché. The recommended aesthetic direction for this screen is a premium checkpoint: a restrained wordmark header, a strong status headline, two clear path panels, and a quiet but helpful informational support rail. The one memorable thing should be that the gate feels like part of a working system, not like a dead end.

The current feature tree is small, but the redesign will likely add enough pieces that a subfolder is justified. The current structure is:

    apps/web/features/product-access/
      components/
        access-required-actions.tsx
        access-required-content.tsx
        access-required-page.tsx
      lib/
        access-required-view-model.ts
        product-access.ts
      server/
        product-access.ts

The implemented structure after the first build slice is:

    apps/web/features/product-access/
      components/
        access-required-actions.tsx
        access-required-content.tsx
        access-required-header.tsx
        access-required-help-panel.tsx
        access-required-page.tsx
        access-required-path-card.tsx
        access-required-shell.tsx
        access-required-status-panel.tsx
      hooks/
        use-access-required-controller.ts
      lib/
        access-required-view-model.ts
        product-access.ts
      server/
        product-access.ts

This structure preserves feature ownership, keeps the import surface stable, and keeps stateful logic out of the render tree. `access-required-content.tsx` now exists only as a compatibility alias to the new shell so the feature can move forward without leaving the old giant-card implementation behind.

## Plan of Work

Start by normalizing the redesign against the existing system instead of treating the access gate as a greenfield composition. Re-read `apps/web/components/product-brand.tsx`, the shared UI primitives already used on the page, and the existing header patterns elsewhere in the repo. The access gate should feel more intentional without inventing a disconnected style language or bypassing the existing button, spinner, and route config primitives.

Once the visual direction is frozen, extract the behavior from `apps/web/features/product-access/components/access-required-page.tsx` into a new controller hook such as `apps/web/features/product-access/hooks/use-access-required-controller.ts`. That hook should own live access polling, router refresh behavior, retry timers, signed-out redirect logic, and the derived refresh label. The page component should become a small orchestration wrapper that passes stable props into the presentation shell.

After the controller extraction, replace the current one-card composition with a branded shell. The shell should open with a top header that includes `ProductBrand` linked back to `routeConfig.home`, plus a compact context label such as “Access Required” or “Access check” so the familiar gate label remains visible even if it is not the main headline. Below the header, the layout should create clear hierarchy: the dominant state-specific headline and explanation first, the recovery-versus-purchase panels second, and the informational help notes last. The design should use deliberate spacing and framing rather than more badges and more boxed alerts.

Once the shell exists, reshape the view model only as much as needed to support the new layout. Keep the copy centralized in `apps/web/features/product-access/lib/access-required-view-model.ts`, but evolve it from a loosely generic `cards` structure into explicit shell sections if that makes the UI clearer. Do not duplicate logic or scatter strings across multiple components. The goal is better presentation, not a harder-to-maintain copy system.

After the main composition is correct, harden and polish. Make sure long helper text wraps cleanly, the refresh hint stays readable, button groups do not collapse awkwardly on mobile, and focus states remain visible. Keep the page lightweight: no heavy illustrations, no decorative videos, no layout-shifting async assets. Finish with a manual polish pass only after the behavior and state coverage are stable.

## Milestones

### Milestone 1: Normalize the access gate and lock the redesign contract

At the end of this milestone, the implementer will have confirmed the exact behavior boundaries that must remain unchanged, the canonical brand and token sources that should anchor the redesign, and the new feature-local structure that keeps components small. The files reviewed or lightly touched in this milestone are `apps/web/app/(workspace)/layout.tsx`, `apps/web/features/product-access/server/product-access.ts`, `apps/web/features/product-access/components/access-required-page.tsx`, `apps/web/features/product-access/lib/access-required-view-model.ts`, and `apps/web/components/product-brand.tsx`. Success is proven when the implementer can state, in the plan and in code comments where needed, that this is a pure gate-surface refresh with unchanged access semantics and a clear file structure for the redesign.

### Milestone 2: Extract controller logic and restore a branded top frame

At the end of this milestone, the access gate will have a dedicated controller hook and a lightweight page wrapper, and the screen will render a real branded header using `ProductBrand`. The most likely touched files are `apps/web/features/product-access/components/access-required-page.tsx`, a new `apps/web/features/product-access/hooks/use-access-required-controller.ts`, and a new `apps/web/features/product-access/components/access-required/access-required-header.tsx`. Success is proven when the route still redirects and refreshes correctly, but the render tree is smaller and the top of the screen immediately reads as Ship by Sunday rather than a generic card.

### Milestone 3: Replace the generic card stack with a premium checkpoint shell

At the end of this milestone, `apps/web/features/product-access/components/access-required-content.tsx` will either be replaced or subsumed by a new shell composed of focused feature-local components. The new shell should present the state headline, supporting explanation, path panels, and help content in a more intentional composition. The likely touched files are new components such as `access-required-shell.tsx`, `access-required-status-panel.tsx`, `access-required-path-card.tsx`, and `access-required-help-panel.tsx`, plus `apps/web/features/product-access/components/access-required-actions.tsx`. Success is proven when the screen no longer depends on a single generic `Card` and when the two user paths are visually distinct without changing their underlying behavior.

### Milestone 4: Harden every access state and keep the page fast

At the end of this milestone, the redesigned gate will handle all inline access states and real-world layout stress cleanly. The likely touched files are `apps/web/features/product-access/lib/access-required-view-model.ts`, the new feature-local presentation components, and the existing tests. This milestone includes long-text wrapping, 200% zoom checks, mobile action stacking, reduced-motion respect, focus visibility, retry busy-state clarity, and ensuring that the page remains lightweight with no unnecessary media or third-party dependencies. Success is proven when the screen looks composed and remains usable for `loading`, `token_missing`, `no_access`, `pending`, `revoked`, and `refunded`, while `signed_out` continues to redirect immediately as before.

### Milestone 5: Validate, polish, and record evidence

At the end of this milestone, the targeted unit and integration UI tests will be green, the broader build checks will pass, and the plan will contain concise notes about what was validated and what remains. The touched files in this milestone are primarily `apps/web/tests/unit/access-required-page.test.tsx`, `apps/web/tests/integration-ui/access-required-page.test.tsx`, `apps/web/tests/integration-ui/access-required-page.interactions.test.tsx`, and this ExecPlan itself. Success is proven when the redesigned gate is demonstrably working, the repo checks pass, and a human can manually verify the route under at least one real blocked-access scenario.

## Concrete Steps

Work from the repository root at `/Users/parkerrex/Projects/ship-by-sunday`.

Begin by re-reading the current gate contract and the shared brand surfaces so implementation stays anchored in the actual code.

    pwd
    /Users/parkerrex/Projects/ship-by-sunday

    sed -n '1,220p' apps/web/app/'(workspace)'/layout.tsx
    sed -n '1,220p' apps/web/features/product-access/server/product-access.ts
    sed -n '1,240p' apps/web/features/product-access/components/access-required-page.tsx
    sed -n '1,260p' apps/web/features/product-access/lib/access-required-view-model.ts
    sed -n '1,260p' apps/web/components/product-brand.tsx
    sed -n '1,220p' apps/web/features/marketing/components/home-page/home-hero-top-bar.tsx
    sed -n '1,220p' apps/web/features/docs/components/docs-navbar.tsx

Before editing, decide whether the new shell can fit cleanly inside the proposed `components/access-required/` subfolder and `hooks/` folder. The implementation should not leave any single component above the repository’s 150-line boundary, and stateful logic should not stay embedded in the main page component.

Implement the controller extraction first. Move the refresh, retry, redirect, and label logic into `apps/web/features/product-access/hooks/use-access-required-controller.ts`, then reduce the page component to a small wrapper that reads initial access and renders the new shell.

Implement the header and shell next. Use `ProductBrand` for the wordmark-only header treatment. Keep the link target on the brand explicit, most likely `routeConfig.home`, because the user may not yet have access to the workspace start screen. Make the branded header stable on small widths and at browser zoom without truncating the wordmark.

As the shell takes shape, update `apps/web/features/product-access/lib/access-required-view-model.ts` only where the new layout truly needs additional structure. Preserve the current behavior contract for action kinds such as `checkout`, `retry`, `reauthenticate`, and `link`, and keep `CheckoutButton` as the actual checkout boundary. Update the non-checkout purchase fallback to use the canonical pricing destination instead of generic home.

Once the layout is stable, run the narrowest relevant tests from `apps/web`.

    cd apps/web
    bunx vitest run --project unit tests/unit/access-required-page.test.tsx
    bunx vitest run --project integration-ui tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx

Expected success signal: the access-required test files pass, including any updated assertions for the branded header, clearer shell structure, and preserved retry and reauthenticate behavior.

Run the broader repo checks from the repository root after the targeted tests are green.

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run lint
    bun run build

Expected success signal: lint passes without new access-gate warnings, and the build completes without type or route errors.

For manual verification, start the web app and exercise the gate through the canonical protected route at `/start`. If local auth state is available, use a signed-out browser session and a signed-in user without access so both the sign-in redirect path and the no-access purchase path can be observed.

    bun run dev:web

Expected observation: opening `/start` without access shows a Ship by Sunday-branded gate with the wordmark in the header, a visible “Access Required” shell label, a clear explanation of the current access state, visually distinct recovery and purchase paths, legible informational help guidance, stable button states, and no awkward layout collapse on mobile or desktop widths.

If the local auth environment is available, also run the existing sandbox auth-protection Playwright spec from `apps/web`:

    cd apps/web
    E2E_RUN_SANDBOX=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 bunx playwright test tests/e2e/auth-protection.sandbox.spec.ts --project=sandbox-e2e

Expected success signal: the signed-out protected-route redirect still lands on sign-in, and the member-without-access flow still shows inline access recovery on `/start`.

Observed on 2026-03-26 10:56 ET: the rerun passed after the sandbox bootstrap began resetting the non-entitled persona’s product-access row, granting the entitled persona deterministically, and updating the stale legacy-lesson assertion to the current blueprint-first redirect contract.

If the local auth environment is not available, document that limitation in this plan and treat the targeted unit and integration UI tests plus `bun run build` as the minimum acceptable proof before handoff.

## Validation and Acceptance

Acceptance is based on observable user behavior. A person who hits `/start` without access must immediately see Ship by Sunday branding in the header instead of a plain fallback shell. The page must feel like a deliberate checkpoint, not a dead end. The header must contain the Ship by Sunday wordmark via `ProductBrand`, the shell must keep the label “Access Required” visible somewhere on the screen, and the layout must visibly separate the “recover existing access” path from the “buy access now” path.

The redesign must preserve every meaningful access state. `loading` should feel like a calm hold state, not a generic spinner page. `signed_out` must continue to redirect immediately to sign-in rather than becoming a new inline dwell state. `token_missing`, `revoked`, and `refunded` must continue to emphasize recovery before repurchase. `no_access` must offer both recovery and checkout without making the user guess. `pending` must avoid encouraging a duplicate purchase while access is still processing. The non-checkout purchase fallback should point to pricing rather than generic home.

Every interactive surface must be validated in its meaningful states: default, hover, focus, active, disabled, busy, and error-adjacent states where applicable. The retry button must still announce busy state and remain disabled while retrying. The reauthenticate action must still call Clerk sign-out with the correct redirect target. The checkout action must still render through `CheckoutButton`, not a fake link.

Responsive and accessibility acceptance are explicit. The screen must work at mobile, tablet, and desktop widths without horizontal scroll or dead-space-heavy composition. At 200% zoom, the header, title, helper copy, action panels, and support content must still fit without collisions. Focus indicators must remain visible. Long copy, long email references inside text, and longer-than-normal helper strings must wrap without clipping. If motion is added, it must respect `prefers-reduced-motion` and rely on transform and opacity rather than layout-janking animation.

Performance is part of acceptance. The refreshed gate must stay lightweight and above-the-fold. No decorative heavy images, autoplay media, or new third-party packages should be introduced just to make the page feel premium. The page should render without obvious layout shift when the view state changes or when help and refresh hints appear.

Implementation is not complete until the targeted access-required tests pass, `bun run lint` passes, `bun run build` passes, and the existing sandbox auth-protection Playwright spec passes when the environment is available. If live sandbox verification cannot be run because local auth infrastructure is unavailable, that limitation must be recorded explicitly in this plan and in the final implementation summary.

## Idempotence and Recovery

This work is safe to execute incrementally because it is a UI refactor with no data migrations or destructive operations. The safest order is controller extraction first, header second, shell composition third, and hardening plus polish last. That sequence keeps behavior stable while presentation changes layer on top.

If the controller extraction introduces redirect or refresh regressions, revert only the hook and page wrapper changes and restore the last known-good behavior before continuing. If the shell redesign makes the layout worse or creates test failures, keep the new structure only if the failure reflects an approved contract change. Otherwise, back out the last presentation slice and reintroduce it more narrowly.

If the view model refactor becomes too broad, stop and simplify. The recovery path is to keep the existing `cards` structure and improve the shell around it rather than forcing a deep model rewrite. The priority is user clarity and design quality, not an abstractly cleaner type model.

Because the worktree is already active in this repository, do not revert unrelated changes. Scope edits to the product-access feature and the directly associated tests. If implementation reveals the need for a new shared primitive or a new logo asset, pause and record that as a new decision before widening the scope.

## Artifacts and Notes

Current evidence from implementation and validation:

    apps/web/app/(workspace)/layout.tsx currently gates every protected workspace route by returning AccessRequiredPage when access is missing.

    apps/web/features/product-access/components/access-required-page.tsx is now a thin wrapper that renders the shell background and passes controller state into AccessRequiredShell.

    apps/web/features/product-access/hooks/use-access-required-controller.ts now owns:
    - live access polling through useQuery(api.access.viewerProductAccess)
    - automatic router.refresh retries when access becomes ready
    - signed-out redirect to the sign-in route
    - manual retry busy state and refresh timestamp

    apps/web/features/product-access/components/access-required-shell.tsx now renders:
    - a branded ProductBrand header with a visible Access Required label
    - a dedicated status panel
    - two differentiated path cards
    - an informational help rail

    apps/web/tests/e2e/auth-protection.sandbox.spec.ts currently proves:
    - signed-out users are redirected away from protected `/start`
    - non-entitled signed-in users see the inline access-required gate on `/start`
    - entitled users can still render `/start`
    - legacy lesson routes redirect back to the blueprint-first start page

    apps/web/components/product-brand.tsx currently exports:
    - ProductBrand
    - productWordmarkFontClassName
    - productWordmarkClassName

    apps/web/public currently contains favicon assets but no dedicated header-logo or wordmark asset:
    - apple-touch-icon.png
    - favicon-16x16.png
    - favicon-32x32.png
    - favicon.ico

Planning notes from the local skill guidance that shaped this plan:

    polish:
    - treat this as a flagship trust surface, not an MVP cleanup
    - reserve a late pass for optical alignment and interaction completeness

    harden:
    - validate all access states, not only the no-access happy path
    - test overflow, zoom, long copy, and reduced-motion behavior

    optimize:
    - keep the gate lightweight and avoid introducing layout shift or heavy decorative assets
    - preserve fast above-the-fold rendering and clear busy states

    normalize:
    - root the redesign in ProductBrand, shared buttons, spinner, and existing tokens
    - do not solve the problem with one-off styling that drifts from the rest of the product

Validation transcripts:

    cd apps/web
    bunx vitest run --project unit tests/unit/access-required-page.test.tsx tests/unit/course-entitlements.test.ts
    # 2 files passed, 12 tests passed

    cd apps/web
    bunx vitest run --project integration-ui tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx
    # 2 files passed, 10 tests passed

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run lint
    # oxlint finished with 0 warnings and 0 errors

    cd apps/web
    bunx convex dev --once --env-file .env.local
    # Convex functions ready

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run build
    # next build completed successfully

    Chrome DevTools navigate_page -> http://localhost:3000/start
    # observed redirect to https://amused-cattle-61.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fstart

    cd apps/web
    E2E_RUN_SANDBOX=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 bunx playwright test tests/e2e/auth-protection.sandbox.spec.ts --project=sandbox-e2e
    # 4 tests passed

## Interfaces and Dependencies

`apps/web/app/(workspace)/layout.tsx` remains the routing boundary for the protected workspace gate. `apps/web/features/product-access/server/product-access.ts` remains the server access boundary. `api.access.viewerProductAccess` remains the live client access source. None of those interfaces should change for this redesign unless a genuine bug is found.

`apps/web/features/product-access/lib/access-required-view-model.ts` remains the single source of truth for state-specific copy and CTA semantics. If the model grows, it should grow to support the new shell shape while keeping state handling exhaustive and centralized. That model should also own the updated pricing fallback destination so CTA behavior remains explicit and testable.

`apps/web/features/product-access/hooks/use-access-required-controller.ts` is the intended new behavior boundary. It should own retry timers, refresh state, redirect state, and any derived labels that the shell needs. The page and its child components should become presentation-first and remain small.

`apps/web/convex/access.ts` and `apps/web/convex/access/model.ts` now also expose `access:resetProductAccess` as an internal mutation so QA and sandbox tooling can force the no-access state deterministically. `apps/web/scripts/lib/convex-product-access-grant.mjs`, `apps/web/tests/e2e/global-setup.ts`, and `qa/scripts/personas.mjs` depend on that mutation to keep the entitled and non-entitled personas stable across reruns.

`apps/web/components/product-brand.tsx` is the required brand dependency for the header logo treatment. `apps/web/components/ui/button.tsx`, `apps/web/components/ui/spinner.tsx`, and the existing shared UI primitives remain the correct control-level dependencies. `apps/web/features/checkout/components/checkout-button.tsx` must remain the checkout execution boundary, and `@clerk/nextjs` via `useClerk()` must remain the reauthenticate boundary.

The primary test interfaces are `apps/web/tests/unit/access-required-page.test.tsx`, `apps/web/tests/integration-ui/access-required-page.test.tsx`, `apps/web/tests/integration-ui/access-required-page.interactions.test.tsx`, and `apps/web/tests/e2e/auth-protection.sandbox.spec.ts`. The required toolchain interfaces for verification are `bunx vitest`, `bunx playwright`, `bun run lint`, `bun run build`, and `bun run dev:web`.
