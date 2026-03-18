# Developer Architecture

## Runtime surfaces

- `app/`: thin route and API entrypoints required by Next.js
- `features/marketing/`: landing-page content and public marketing UI
- `features/checkout/`: checkout components and checkout session state helpers
- `features/course/`: protected student runtime, course access, mission, lesson UI, lesson model, and shared product shell
- `features/codex/`: in-app Codex connection and server helpers
- `shared/`: truly cross-feature branding and UI primitives
- `platform/`: env, billing, Convex client, and Next/server integration adapters
- `convex/`: entitlements, mission state, lesson state, and uploads

## Lesson workbench

- `features/course/lesson/workbench/` is the public workbench surface.
- `features/course/lesson/workbench/renderer.tsx` handles runtime derivation plus typed mode dispatch.
- `features/course/lesson/workbench/modes/` owns mode-specific layout and behavior.
- `features/course/lesson/workbench/fields/` owns field-kind controls and pure parsing helpers.
- `features/course/lesson/workbench/shared/` owns shell-level primitives reused across modes, including the single thin-label workbench header treatment.
- See `docs/dev/lesson-workbench.md` for the working rules and file-boundary guardrails.
- `features/course/lesson/hooks/` owns route-level lesson orchestration hooks such as save state, chrome state, and completion flow.
- `features/course/lesson/shells/` is the public shell entrypoint, with smaller presentational pieces living beside `index.tsx`.

## Purchase to access flow

1. `features/checkout/components/checkout-button.tsx` sends signed-out buyers to Clerk sign-in with a redirect back to `#pricing`.
2. `POST /api/stripe/checkout` creates the Stripe Checkout Session, sets `client_reference_id`, `customer_email`, and both session/payment-intent metadata from the Clerk user and `courseSlug`, and returns the Stripe-hosted checkout URL using the canonical app base URL for success/cancel redirects.
3. Stripe returns buyers to `/checkout/success?session_id=...` or `/checkout/cancel`.
4. `POST /api/stripe/webhook` verifies the Stripe signature, accepts only completed / async-succeeded checkout events, and calls Convex to upsert the active entitlement.
5. `api.course.grantEntitlementFromStripe` re-checks `STRIPE_WEBHOOK_SECRET` inside Convex before patching or inserting the entitlement row.
6. `/checkout/success` validates the `session_id` against Stripe server-side, distinguishes missing/invalid/pending/wrong-account states, then polls `api.course.viewerAccess` and redirects to `/mission` once access becomes active for a validated paid session.
7. `/access-required` uses the same `viewerAccess` query and auto-recovers to `/mission` if entitlement appears later.
8. The home page server-side redirect path uses `getServerResumeDestination`, so entitled users landing on `/` resume to `/mission` or their most recently viewed accessible lesson unless `?marketing=1` is present.
9. Server-side Clerk -> Convex reads now use the Clerk `convex` JWT template explicitly, matching `convex/auth.config.ts`.
10. Codex account and generation routes require both a valid Clerk session and an active course entitlement; on Vercel they default to disabled unless `CODEX_APP_SERVER_ENABLED=true` is set on a compatible runtime.

## Product state flow

- `features/course/lesson/model/manifest.ts` assembles the course contract.
- `features/course/lesson/model/lessons/*.ts` own the manual lesson definitions and student-facing content.
- `features/course/lesson/model/research-prompt.ts` owns prompt templates, prompt-context helpers, and pasteback parsing for prompt-driven lesson imports such as lesson `1.4`.
- `features/course/lesson/model/registry.ts` is the public registry barrel. The actual runtime helpers are split under `features/course/lesson/model/registry/`.
- `app/lesson/[lessonId]/page.tsx` validates the lesson ID server-side, then the lesson page resolves the static lesson definition locally from `features/course/lesson/model`.
- `convex/course.ts` remains the public Convex function entrypoint. The implementation is now split under `convex/course/` by domain: entitlements, lesson state, mission, artifacts, shared viewer-state helpers, and validators.
- The course backend should continue routing lesson-state reads and writes through one internal viewer-state lifecycle so mission status, lesson access, artifacts, and draft/complete mutations all share the same compatibility rules.
