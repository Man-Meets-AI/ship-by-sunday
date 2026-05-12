---
program_id: worker-generate-tutorials-ia
title: Worker Generate Tutorials IA Migration
status: active
created_at: 2026-05-05
completed_at: null
summary: Hard-switch the protected product IA to Home, Generate Codebase, Tutorials, and Worker across routes, access, checkout handoff, navigation, docs, tests, and owned runtime contracts.
post_build_recap: null
read_when:
  - Resuming the Home, Worker, Tutorials, and Generate Codebase IA migration.
  - Removing workspace-named product or runtime surfaces.
  - Creating child ExecPlans for the hard-switch route, access, checkout handoff, navigation, copy, or runtime contract slices.
---

# Worker Generate Tutorials IA Migration

This Program is a living initiative document for the hard-switch migration from the current workspace/codebase IA to Home, Generate Codebase, Tutorials, and Worker.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Customers should land in one protected Home after purchase, then move between three clear product surfaces: Generate Codebase for creating a new Codebase, Tutorials for watching and learning, and Worker for operating on an existing repo. Today the app stores one `fulfillmentTrack` per customer and uses that scalar to block the opposite surface, so an existing-repo customer cannot naturally open generated-codebase tutorial material and a generated-codebase customer cannot naturally open the existing-repo worker surface. Checkout also uses weak Stripe metadata and routes unresolved buyers through `/workspace/choose`, which is a shim rather than a real app home. This Program makes a hard cut to the new IA: routes, access model, checkout handoff, navigation, docs, tests, and Ship by Sunday-owned runtime contracts must teach Home, Generate Codebase, Tutorials, and Worker, not Workspace.

## Program Inputs

The current repository research is recorded in `research-pass-current-ia-and-access.md`. The normalized naming and access direction is recorded in `normalized-pass-worker-generate-tutorials-naming.md`. The initiative decision is recorded in `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is recorded in `cross-repo-review.md`. The original implementation brief is `planning-brief-1.md`. The current immutable implementation brief is `planning-brief-2.md`, and `current-planning-brief.txt` points at that brief.

## Current State

Before the 2026-05-11 paid app IA slice, the generated-codebase route family was `/codebase`, `/review`, `/lesson/*`, and `/execute`, and the existing-repo route family was `/workspace/*`. The app also had `/tutorials` and `/tutorials/[lessonKey]`, but the older Program research predates that route and should be treated as stale on that single point. Checkout and Convex access used one scalar `fulfillmentTrack`, with `generated_codebase`, `existing_codebase_doctor`, or `unspecified`, and the app route guards, Convex guards, checkout success routing, Command-K, and docs assumed that scalar lane model.

The first implementation slice added protected paid `/home`, deleted `/workspace/choose`, moved generated-codebase navigation to `/generate-codebase` and `/generate-codebase/review`, moved the existing-repo app surface to `/workers` and `/workers/*`, and pointed checkout success, auth fallback, AppShell logo, user menu, and Command-K at the new Home and product surfaces. Checkout metadata now uses the app-owned `mma_checkout_v1` packet and Convex purchase intent records for new Checkout Sessions, while `courseSlug` remains only as legacy compatibility data.

The remaining desired end state is that `Worker` is the product noun everywhere Ship by Sunday means the existing-repo operation surface. Old workspace-named Ship by Sunday-owned runtime contracts, internal tests, and generated customer-facing instructions remain migration targets, not compatibility surfaces.

## Progress

- [x] 2026-05-05: Completed read-only research with three 5.5 high explorer passes covering naming/routes, navigation/Command-K, and access/data implications.
- [x] 2026-05-05: Recorded the product decision that the existing-repo operation surface is `Worker`, not `Workspace` or `Worker Space`, and that canonical routes are `/workers`, `/tutorials`, and `/generate-codebase`.
- [x] 2026-05-05: Created this active Program packet and the first implementation planning brief.
- [x] 2026-05-05: Reframed the Program from compatibility rollout to hard switch.
- [x] 2026-05-11: Refreshed the Program with the protected `/home` decision and Stripe checkout handoff cleanup scope in `planning-brief-2.md`.
- [x] 2026-05-11: Created and completed the first child ExecPlan from `planning-brief-2.md`: `docs/exec-plans/completed/2026-05-11-hard-switch-paid-app-ia-checkout-handoff.md`.
- [x] 2026-05-11: Hard-switched paid app access capabilities, checkout handoff, protected route families, route guards, resume destinations, top-level navigation, visible Home/Worker copy, Stripe metadata, purchase intents, and webhook queueing in the first child ExecPlan.
- [x] 2026-05-12: Created and advanced the Worker setup install affordance child ExecPlan: `docs/exec-plans/active/2026-05-12-workers-setup-install-affordance.md`.
- [ ] Complete the Worker setup install affordance slice so `/workers/setup` carries clean install guidance and sync-safe install status.
- [ ] Hard-switch Worker runtime contracts that are Ship by Sunday-owned.
- [ ] Finish migrating generated customer-facing instructions, Worker runtime contract naming, and any remaining workspace-named product tests/docs not covered by the first slice.
- [ ] Run scans proving workspace-named product and owned runtime surfaces are gone or explicitly classified as unrelated external/tooling language.

## Decision Log

Decision: Use `Worker` as the product noun.
Rationale: The product owner explicitly rejected `Workspace` and `Worker Space` and asked to make the naming right everywhere.
Date: 2026-05-05.

Decision: Use `/workers`, `/tutorials`, and `/generate-codebase` as canonical routes.
Rationale: These route families are direct and map to the three customer jobs.
Date: 2026-05-05.

Decision: Start with access capability widening.
Rationale: The current scalar `fulfillmentTrack` creates redirect loops if navigation and routes are added first.
Date: 2026-05-05.

Decision: Do a hard switch instead of a compatibility rollout.
Rationale: The product owner explicitly rejected a gentle compatibility path. Old names should not remain as product-supported aliases; they should be removed or rewritten unless a reference is unrelated external/tooling language.
Date: 2026-05-05.

Decision: Add protected `/home` as the paid app hub and replace `/workspace/choose`.
Rationale: `/workspace/choose` is a checkout shim, not a durable app home. Paid customers need one obvious navigation home that can show first-purchase treatment and route to Generate Codebase, Tutorials, and Worker.
Date: 2026-05-11.

Decision: Keep Stripe metadata limited to billing/access reconciliation and move first-run/path state into the app database.
Rationale: Stripe metadata should identify the app, access product, purchase intent, checkout surface, and optional Clerk user id. Path choice, first-time UI state, lesson ids, emails, names, and sensitive data belong in the app, not Stripe.
Date: 2026-05-11.

Decision: Tighten Stripe webhook proof to required events only and move fulfillment off the synchronous webhook response path.
Rationale: Stripe recommends only subscribing to required event types and handling webhook work asynchronously. The target design should record verified Stripe events quickly, reject wildcard webhook subscriptions in release preflight, and process fulfillment through an idempotent queued or equivalent async path.
Date: 2026-05-11.

## Slice Ledger

The first child ExecPlan is `docs/exec-plans/completed/2026-05-11-hard-switch-paid-app-ia-checkout-handoff.md`. It owns the paid app route/access/checkout/webhook hard switch from `planning-brief-2.md`.

The current child ExecPlan is `docs/exec-plans/active/2026-05-12-workers-setup-install-affordance.md`. It owns the `/workers/setup` Worker install stage, package-runner command affordance, and sync-safe Worker install runner events.

The intended later slices are Worker runtime contract hard switch, generated-output hard switch, and final scan/proof cleanup. These slices should not preserve old workspace or route names as supported aliases.

## Next Slice

The current slice is the Worker setup install affordance child ExecPlan. After it is completed, return to Worker runtime and generated-output naming: classify every remaining `workspace` use, rename Ship by Sunday-owned Worker runtime contracts where feasible, update generated customer-facing instructions from source rather than generated mirrors alone, and leave external/tooling uses documented as intentional.

## Risks and Watchpoints

Do not do a blind rename of `workspace`. The word appears in product language, route groups, API paths, Convex tables, local-runner events, monorepo package manager language, and Codex sandbox terminology. Each use must be classified as Ship by Sunday-owned Worker language or unrelated external/tooling language. Ship by Sunday-owned Worker language must move to Worker.

Do not leave `fulfillmentTrack` as the only authorization boundary. That would make the new navigation lie to customers.

Do not rename the generated Codebase artifact as part of this Program unless the product owner explicitly requests that artifact rename. The route `/generate-codebase` names the tool, not necessarily the delivered artifact.

Do not keep old `/workspace/*`, `/codebase`, `/review`, `/lesson/*`, or `/api/workspace/runner/*` as supported product aliases. If a route or API path must survive briefly during a single deploy for internal sequencing, the owning ExecPlan must call it transitional and remove it inside the same hard-switch milestone.

Do not put product path choice, first-purchase UI state, lesson ids, emails, names, or sensitive data in Stripe metadata. Stripe metadata should only carry compact reconciliation keys, especially the app-owned purchase intent id.

Do not keep accepting `enabled_events: ["*"]` as release-ready Stripe webhook configuration. Wildcard subscriptions can still exist during local debugging, but production and dev-staging preflight should require the exact Checkout events the integration consumes.

## Outcomes & Retrospective

This Program is active. The paid customer app now teaches Home, Generate Codebase, Tutorials, and Worker as the primary IA. Remaining Program work is concentrated in Worker runtime contract naming, generated customer-facing instructions, and final proof scans that classify or remove leftover workspace/codebase route language.

## Validation and Acceptance

Program-level acceptance requires a paid customer with the right capabilities to land on `/home`, see first-purchase treatment when appropriate, and open `/generate-codebase`, `/tutorials`, and `/workers` without redirect loops. Command-K and the header must expose Home and the three surfaces. Product-facing copy and docs must use Worker where the product means existing-repo operations. Stripe checkout must write the `mma_checkout_v1` metadata packet to both the Checkout Session and PaymentIntent, and Stripe webhook release preflight must fail wildcard event subscriptions. Old `/workspace/*`, `/workspace/choose`, `/codebase`, `/review`, and `/lesson/*` product routes must not remain documented or supported aliases. Runtime migration must prove Ship by Sunday-owned worker APIs, events, local-runner commands, tests, and proof docs no longer expose workspace naming.

## Artifacts and Notes

The initial research found that the existing generated-codebase and worker data stores can coexist, but entitlement cannot yet represent dual access. That is why the current planning brief starts at access and checkout handoff rather than route copy.

The 2026-05-11 Stripe review found the app is correctly using Checkout Sessions, signature-verified webhooks, duplicate-event protection, and success-page recovery. The first child ExecPlan replaced new public checkout `courseSlug` metadata with an app-owned purchase intent packet, made wildcard webhook subscriptions fail release preflight, and moved webhook fulfillment off the synchronous webhook response path.

## Interfaces and Dependencies

This Program depends on `apps/web/config/product.ts`, the App Router files under `apps/web/app/(workspace)/`, access code under `apps/web/convex/access/`, checkout code under `apps/web/platform/billing/checkout/`, Stripe config and webhook code under `apps/web/platform/billing/`, `apps/web/convex/stripeWebhook.ts`, and `apps/web/convex/stripeWebhookEvents.ts`, product access code under `apps/web/platform/access/`, Command-K and shell components under `apps/web/app/(workspace)/_components/app-shell/`, worker route models under `apps/web/app/(workspace)/_lib/`, Convex worker code under `apps/web/convex/workspace/`, local runner code under `packages/local-runner/`, route and UI tests under `apps/web/tests/`, and the docs under `apps/web/content/docs/`, `docs/internal/`, and `docs/programs/`.
