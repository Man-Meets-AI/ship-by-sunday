---
summary: Ship the Bunny fail-open lesson player fix on top of current dev, then close the remaining protected-route redirect that still sends signed-out users to Clerk-hosted auth.
read_when: Open when Bunny lesson playback is blocked in production or protected routes are escaping to accounts.man-meets-ai.com instead of the app-owned auth pages.
plan_status: not_done
---

# Ship Bunny And Auth Redirect Hotfixes

This document is a living execution plan for the Bunny playback hotfix and the protected-route auth redirect fix.

Maintain this ExecPlan in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this work, Bunny lesson videos will render immediately instead of blocking behind an availability gate, and signed-out users who open protected app routes will land on the branded app-owned `/sign-in` flow instead of the Clerk-hosted `accounts.man-meets-ai.com` surface. The change matters because Bunny playback is currently a production-blocking lesson failure, and the hosted auth redirect breaks the branded product experience on protected routes. Success is visible by loading a Bunny-backed lesson page and by opening a protected route such as `/mission` in a signed-out browser.

## Progress

- [x] 2026-04-01 16:29 EDT: Confirmed the old `fix/bunny-fail-open` branch contains one useful commit (`ec656f9`) on an outdated base plus unrelated historical changes.
- [x] 2026-04-01 16:30 EDT: Created clean worktree `/private/tmp/mma-bunny-auth-release` from `origin/dev` on branch `fix/bunny-auth-surfaces`.
- [x] 2026-04-01 16:34 EDT: Reproduced the hosted auth escape on production: navigating to `https://www.man-meets-ai.com/mission` redirects to `https://accounts.man-meets-ai.com/sign-in?...`.
- [x] 2026-04-01 16:32 EDT: Rebuilt the Bunny fail-open patch on top of current `origin/dev` by editing only `apps/web/features/course/lesson/components/lesson-video-player.tsx` and `apps/web/tests/unit/lesson-shells.test.tsx`.
- [x] 2026-04-01 16:33 EDT: Patched `apps/web/proxy.ts`, `apps/web/app/layout.tsx`, and `apps/web/tests/unit/proxy-protected-routes.test.ts` so Clerk middleware and the provider both pin auth entrypoints to `/sign-in` and `/sign-up`.
- [x] 2026-04-01 16:33 EDT: Passed targeted lesson-player and proxy unit validation with `bun run --cwd apps/web test:unit -- tests/unit/lesson-shells.test.tsx tests/unit/proxy-protected-routes.test.ts`.
- [x] 2026-04-01 16:34 EDT: Passed `bun run --cwd apps/web lint` and `bun run --cwd apps/web format:check`.
- [x] 2026-04-01 16:35 EDT: Passed `set -a; source /Users/parkerrex/Projects/manmeetsai-workspace/apps/web/.env.local; set +a; bun run --cwd apps/web typecheck`.
- [ ] Push branch, open PR into `dev`, merge, and verify `dev`.
- [ ] Promote `dev` to `main` and verify production.

## Surprises & Discoveries

The dirty root workspace contains user-owned edits, including a modified Bunny player file, so implementation must happen from a clean worktree and not from the root checkout.

The old `fix/bunny-fail-open` branch looked large at first because it diverged from an old `dev` base, but the branch-only commit is narrowly scoped. The useful change is `ec656f9 fix(video): stop blocking Bunny player behind availability check` and it only touches `apps/web/features/course/lesson/components/lesson-video-player.tsx` and `apps/web/tests/unit/lesson-shells.test.tsx`.

Production already serves the branded app-owned `/sign-in` page directly, but Clerk middleware protection still escapes to the hosted Clerk sign-in domain when a signed-out user opens a protected route. That means the real auth bug is not the route page itself; it is the middleware configuration path.

This temporary worktree needed a real local `node_modules` install. A symlink to the root workspace `node_modules` was good enough for unit tests, but Turbopack rejected it during `typecheck` because the symlink pointed outside the worktree root.

## Decision Log

Decision: Treat the old Bunny branch as reference material only and rebuild on top of current `origin/dev`. Rationale: the branch base is stale and mixing it directly into current `dev` would risk replaying unrelated checkout and QA history. Date: 2026-04-01.

Decision: Fix the protected-route hosted auth redirect in the same branch as the Bunny hotfix, but keep auth scope limited to the real production escape path. Rationale: the user marked Bunny as P0 and auth as P1, so the branch should include the real production auth bug without widening into a full account-settings redesign. Date: 2026-04-01.

## Outcomes & Retrospective

Implementation is ready for branch publication. The Bunny patch stayed minimal and did not resurrect the stale checkout/auth history from the old reference branch. The auth scope also stayed tight: the branch fixes the real protected-route hosted redirect without widening into a settings-account redesign.

## Context and Orientation

The Bunny playback gate lives in `apps/web/features/course/lesson/components/lesson-video-player.tsx`. Current `origin/dev` imports `useBunnyVideoAvailability` from `apps/web/features/course/lesson/hooks/use-bunny-video-availability.ts` and shows placeholder copy while availability is being checked or when the check reports unavailable. The reference branch commit removes this blocking UI for Bunny videos and renders the iframe directly.

The lesson-shell regression coverage lives in `apps/web/tests/unit/lesson-shells.test.tsx`. Today those tests assert the placeholder copy. They must be updated to assert the iframe render path instead.

Protected-route auth is enforced in `apps/web/proxy.ts` via `clerkMiddleware` plus `auth.protect()`. Current production behavior proves that middleware is not being given the app-owned auth URLs explicitly, because a signed-out navigation to a protected route lands on `accounts.man-meets-ai.com/sign-in`. The branded auth pages themselves are implemented in `apps/web/app/(identity)/sign-in/[[...sign-in]]/page.tsx` and `apps/web/app/(identity)/sign-up/[[...sign-up]]/page.tsx`, while `apps/web/app/layout.tsx` wires Clerk globally for the client side.

The relevant product routes live in `apps/web/config/product.ts`, where `routeConfig.signIn` is `/sign-in` and `routeConfig.signUp` is `/sign-up`. The cleanest fix is to make middleware and the provider use these app-owned routes directly in code instead of relying on environment configuration to be present everywhere.

## Plan of Work

First, patch `apps/web/features/course/lesson/components/lesson-video-player.tsx` to remove the Bunny availability gate and render the Bunny iframe immediately when a valid Bunny source is present. Then update `apps/web/tests/unit/lesson-shells.test.tsx` so the tests assert the real iframe-based lesson shell instead of the temporary placeholder copy.

Next, patch `apps/web/proxy.ts` so Clerk middleware is configured with explicit `signInUrl` and `signUpUrl` values from `routeConfig`. Patch `apps/web/app/layout.tsx` to pass the same app-owned auth URLs into `ClerkProvider` so client-side Clerk navigation uses the same branded routes. Add or update unit coverage so the protected-route middleware contract proves the app routes remain the auth entrypoints.

After the code changes, run the narrowest local checks first, then open a PR into `dev`, merge it, verify the relevant `dev` proof, promote `dev` to `main`, and verify production behavior with live evidence.

## Milestones

The first milestone is the Bunny fail-open patch. At the end of it, the code on this branch should stop rendering the availability placeholder for Bunny lesson videos, and the unit lesson-shell assertions should reflect that. Success means the affected tests pass and the component code no longer depends on `useBunnyVideoAvailability`.

The second milestone is the protected-route auth redirect fix. At the end of it, signed-out navigations to protected routes should resolve to `/sign-in` rather than the hosted Clerk auth domain. Success means unit coverage reflects the middleware config change and a browser check shows the app route instead of `accounts.man-meets-ai.com`.

The final milestone is shipping and verification. At the end of it, the branch is merged through `dev` to `main`, and live production checks show both the Bunny player and the branded auth entrypoint working.

## Concrete Steps

Work from `/private/tmp/mma-bunny-auth-release`.

Inspect the reference Bunny commit:

    git -C /private/tmp/mma-bunny-p0 show --stat ec656f9eb87d7e7d9a62ef644fdc873e553fec42

Apply the Bunny patch on the clean branch by editing:

    apps/web/features/course/lesson/components/lesson-video-player.tsx
    apps/web/tests/unit/lesson-shells.test.tsx

Apply the auth redirect patch by editing:

    apps/web/proxy.ts
    apps/web/app/layout.tsx
    apps/web/tests/unit/proxy-protected-routes.test.ts

Run targeted checks:

    cd /private/tmp/mma-bunny-auth-release
    bun run test:unit -- lesson-shells proxy-protected-routes

If the repo script does not accept file filters, run the equivalent Vitest command for those files directly from `apps/web`.

Run live signed-out browser verification against production after the branch lands:

    open https://www.man-meets-ai.com/mission

Expected observation after the auth fix ships: the browser lands on `https://www.man-meets-ai.com/sign-in?...`, not `https://accounts.man-meets-ai.com/sign-in?...`.

## Validation and Acceptance

The work is acceptable only if all of the following are true.

For Bunny playback, the lesson player component no longer renders the `Checking video availability` and `Video temporarily unavailable` gate for Bunny videos, and the updated lesson-shell tests pass.

For auth redirects, protected routes continue to be protected, but a signed-out visit to a protected page resolves to the branded app-owned auth route. Unit coverage must prove the middleware uses app route config, and a browser check must confirm the production URL lands on `/sign-in`.

Before the change is considered shipped, the branch must merge into `dev`, the relevant `dev` proof must pass, the release must be promoted to `main`, and production must be rechecked for both visible behaviors.

## Idempotence and Recovery

All edits are additive and safe to rerun in this worktree. If the Bunny patch introduces regressions, restore only the clean-branch file edits and reapply the single reference commit by hand; do not merge or cherry-pick the entire stale Bunny branch.

If the auth redirect fix fails, keep the Bunny patch intact and revert only the middleware/provider changes in this branch before retrying with a narrower configuration edit. If a live proof fails after merge into `dev`, fix forward on a new branch from the latest `origin/dev`.

## Artifacts and Notes

Reference Bunny commit:

    ec656f9 fix(video): stop blocking Bunny player behind availability check

Live production evidence before auth fix:

    https://www.man-meets-ai.com/mission
      -> https://accounts.man-meets-ai.com/sign-in?redirect_url=https%3A%2F%2Fwww.man-meets-ai.com%2Fmission

## Interfaces and Dependencies

`apps/web/features/course/lesson/components/lesson-video-player.tsx` must continue to accept `LessonVideoContent`, `className`, and optional `title` and must still render standard HTML video for non-Bunny providers.

`apps/web/proxy.ts` depends on `clerkMiddleware` from `@clerk/nextjs/server`. The required interface change is to provide explicit app-owned `signInUrl` and `signUpUrl` options in the middleware configuration path so `auth.protect()` uses branded app routes.

`apps/web/app/layout.tsx` depends on `ClerkProvider` from `@clerk/nextjs`. The provider should mirror the app-owned auth URLs so client-side Clerk flows stay aligned with middleware behavior.
