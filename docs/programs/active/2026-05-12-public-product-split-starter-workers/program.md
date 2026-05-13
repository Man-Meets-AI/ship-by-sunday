---
program_id: public-product-split-starter-workers
title: Public Product Split To Starter And Workers
status: active
created_at: 2026-05-12
completed_at: null
summary: Split Man Meets AI into a brand homepage, public Starter and Workers sales paths, protected Starter/Worker subroute families, Starter-owned generator/videos, unpromoted support docs, and generated template-app boundaries.
post_build_recap: null
read_when:
  - Resuming the public Man Meets AI, Starter, and Workers split.
  - Creating child ExecPlans for public routes, split checkout, Starter ownership, generated template output, docs visibility, blog content, or existing-customer migration.
  - Checking how the new product direction supersedes the older Generate Codebase, Tutorials, and Worker IA Program.
---

# Public Product Split To Starter And Workers

This Program is a living initiative document for splitting the product into a Man Meets AI brand homepage, a public Starter path for new builders, a protected Starter app route family, and a public Workers path for existing repos.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The product needs a hard, working split around buyer intent. Man Meets AI is the public index and brand layer: part media, part technology, and part founder story. Starter is the newbie offer for people starting from an idea, a Lovable-style prototype, or a pile of prompts. Starter has two paths: answer step-by-step questions to get a customized repo with a Program and ExecPlans in it, or skip customization and get the template plus guided videos. Its public marketing route is `/starter`, and its protected app routes are `/starter/home`, `/starter/lessons`, and `/starter/generate-codebase`. Workers is the existing-repo offer: a public landing page that sells the Worker install and sends buyers into protected worker setup, doctor pass, findings, loop, proof, and run surfaces.

The old three-surface protected IA treated Generate Codebase, Tutorials, and Worker as parallel product destinations. That is now superseded where it conflicts with the current product decision. Tutorials are not a separate marketed product. They belong inside Starter. Docs remain available when useful for generated-codebase customers, but the public site should not promote docs as a primary product path. The generated repo must become a clean template app influenced by the customer's intake answers, capable of producing Programs and ExecPlans for future AI loops, and free of Worker local-runner code.

The implementation bias is practical: make the split work with the smallest durable changes. Do not introduce a broad brand system, abstract offer framework, or generalized pricing platform unless an implementation boundary requires it.

## Program Inputs

The current repository research is recorded in `research-pass-current-public-product-split.md`. The product-owner decisions are normalized in `normalized-pass-product-decisions.md`. The canonical decision packet is `converged-decision-packet.md`. Ordering is recorded in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is recorded in `cross-repo-review.md`. The decision interview is recorded in `decision-interview-log.md`. The first implementation brief is `planning-brief-1.md`, the generated snapshot purity brief is `planning-brief-2.md`, the explicit generated template app brief is `planning-brief-3.md`, the docs/blog cleanup brief is `planning-brief-4.md`, the existing-customer migration notes brief is `planning-brief-5.md`, the protected route group rename brief is `planning-brief-6.md`, and `current-planning-brief.txt` points at the current brief.

This Program supersedes `docs/programs/active/2026-05-05-worker-generate-tutorials-ia/` for public IA, Starter/Tutorials ownership, protected Starter route naming, public `/workers`, and generated-repo boundary decisions. That older Program remains useful as historical context for paid-app route and access work that already shipped.

## Current State

The public root route is now the Man Meets AI brand/thesis page with paths into Starter and Workers. `/starter` is the public new-builder sales page, `/workers` is the public existing-repo Workers landing page, and `/blog` is a usable publishing surface. `/docs` remains direct-link reachable and noindexed, but it is not promoted as a public product path in the main IA.

The protected paid app lives under the pathless `apps/web/app/(protected)/` route group. Starter app work is under `/starter/home`, `/starter/lessons`, `/starter/lessons/[lessonKey]`, `/starter/generate-codebase`, and `/starter/generate-codebase/review`. Worker app work is under `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/findings/[findingId]`, `/workers/loops`, `/workers/runs`, and `/workers/privacy`. `/home` remains the protected multi-product and recovery hub; old `/generate-codebase` and `/tutorials` routes are unpromoted compatibility redirects into Starter.

Checkout and access now have explicit Starter and Workers purchase intent. Starter is `$297`, grants generator plus videos, and routes buyers to `/starter/home`. Workers is `$600`, grants Worker access only by default, and routes buyers to `/workers/setup`. Capability-less grants no longer unlock every product surface by default, and the hosted Stripe verification docs/scripts name the purchased product route rather than the old one-product `/home` destination.

The generated Starter repo is an explicit template app, not a broad copy of the core app. It excludes Worker routes, runner APIs, Worker Convex state, Codex bridge files, existing-codebase Worker components, workspace read models, and local-runner package paths. Intake answers shape source truth, generated docs, Program material, ExecPlans, and agent instructions for future loops.

There are three existing paid customers. They should not be mass-migrated by assumption. Each customer should be handled outside git using `docs/internal/existing-customer-product-split-migration.md`, based on fit, preference, and operator discretion.

## Progress

- [x] 2026-05-12: Completed the first research pass on the proposed three-surface split and confirmed that Workers needs its own public landing page.
- [x] 2026-05-12: Completed a second repository research pass after product-owner clarifications covering public IA, docs visibility, Starter ownership, compiler coupling, checkout/access, and migration risk.
- [x] 2026-05-12: Recorded the product decisions that Starter includes the generator and videos, docs are not a promoted product path, `/workers` is public marketing, and generated output must exclude Worker local-runner code.
- [x] 2026-05-12: Resolved the first interview question: `/workers` is permanently public marketing and protected Worker work lives only below explicit operational subroutes.
- [x] 2026-05-12: Resolved the second interview question: product-specific checkout success should send buyers directly into the purchased product, with `/home` reserved for returning, multi-capability, or unresolved access.
- [x] 2026-05-12: Captured the Starter first-run split: guided questions to a customized repo with Program and ExecPlans, or a direct template plus guided videos path.
- [x] 2026-05-12: Resolved the third interview question: Worker is totally separate from Starter, so Worker purchases do not include Starter template or guided video access by default.
- [x] 2026-05-12: Resolved the fourth interview question: protected Starter app work belongs under `/starter/home`, `/starter/lessons`, and `/starter/generate-codebase`, while `/starter` remains public marketing.
- [x] 2026-05-12: Resolved the fifth interview question: Starter checkout success lands on `/starter/home`, where buyers choose customized repo generation or template plus guided videos.
- [x] 2026-05-13: Resolved the sixth interview question: `/home` remains a protected hub/fallback, but single-product users should auto-forward to their product home.
- [x] 2026-05-13: Resolved the seventh interview question: old protected Starter/Tutorial routes should become unpromoted redirects during the first implementation pass and can be deleted later after the new route family is stable.
- [x] 2026-05-13: Resolved the eighth interview question: Starter lessons use `/starter/lessons` as an index and `/starter/lessons/[lessonKey]` for individual lesson pages.
- [x] 2026-05-13: Resolved the ninth interview question: the first implementation must build two real app-backed Stripe checkout offers, not temporary/manual payment links.
- [x] 2026-05-13: Resolved the tenth interview question: first public prices are Starter `$297` and Workers `$600`, with no shared auto-promotion code in the new default checkout path.
- [x] 2026-05-13: Resolved the eleventh interview question: multi-product `/home` should show only Starter and Workers cards, with generator and lessons nested inside Starter.
- [x] 2026-05-13: Resolved the twelfth interview question: public navigation should include only Man Meets AI, Starter, Workers, Blog, and Sign in.
- [x] 2026-05-13: Resolved the thirteenth interview question: `/` is a brand/thesis routing page, not a direct sales page or pricing page.
- [x] 2026-05-13: Resolved the fourteenth interview question: `/starter` should lead with “Ship your idea by Sunday.” and sell the Starter outcome at `$297`.
- [x] 2026-05-13: Resolved the fifteenth interview question: `/workers` should lead with “Install AI workers into your existing codebase.” and sell Workers at `$600`.
- [x] 2026-05-13: Resolved the sixteenth interview question: the `$600` Workers purchase includes local runner setup, private doctor pass, top findings, one approved worker loop, and proof or blocked-proof report.
- [x] 2026-05-13: Resolved the seventeenth interview question: `/workers` should explicitly set the expectation that founding installs are hands-on while self-serve hardens.
- [x] 2026-05-13: Resolved the eighteenth interview question: the first generated repo should be a clean template app whose docs/source truth/Program/ExecPlans are customized by questionnaire answers.
- [x] 2026-05-13: Resolved the nineteenth interview question: compiler/generated-repo extraction is Slice 2, not part of the first public IA and checkout slice.
- [x] 2026-05-13: Resolved the twentieth interview question: `/docs` remains publicly reachable but unpromoted during the first pass.
- [x] 2026-05-13: Resolved the twenty-first interview question: extracting Plan/Program homepage material into blog posts belongs to a later content slice, not Slice 1.
- [x] 2026-05-12: Created this active Program packet to supersede the older three-surface IA direction where the decisions conflict.
- [x] 2026-05-13: Completed the decision interview branches required for the repo-side public product split and captured the remaining customer-specific migration work as external operator execution.
- [x] 2026-05-13: Completed the first child ExecPlan for the public route, protected route, Starter/Tutorials, and minimal split-checkout hard cut at `docs/exec-plans/completed/2026-05-13-hard-cut-public-ia-to-starter-and-workers.md`.
- [x] 2026-05-13: Created planning brief 2 and the second child ExecPlan for removing Worker and runner leakage from generated Starter snapshots at `docs/exec-plans/completed/2026-05-13-remove-worker-leakage-from-generated-starter-snapshots.md`.
- [x] 2026-05-13: Completed the generated Starter snapshot purity implementation and validation. Generated snapshots now exclude Worker routes, runner APIs, Worker Convex state, Codex bridge files, existing-codebase Worker components, workspace read models, and local-runner package paths.
- [x] 2026-05-13: Created planning brief 3 and the active child ExecPlan for explicit generated template app extraction at `docs/exec-plans/active/2026-05-13-extract-explicit-generated-template-app.md`.
- [x] 2026-05-13: Completed the explicit generated template app extraction. Generated Starter snapshots now render a small intake-shaped Next app shell instead of copying broad core app routes, and the clean-room generated repo test now runs app typecheck.
- [x] 2026-05-13: Created planning brief 4 and the active child ExecPlan for docs and blog cleanup at `docs/exec-plans/active/2026-05-13-clean-up-docs-promotion-and-blog-content.md`.
- [x] 2026-05-13: Completed the docs/blog cleanup slice. Docs remain direct-link reachable but are removed from public sitemap discovery and explicit robots allow rules, docs metadata is noindex, the old demo nav now points to Blog, and a Starter/Workers split blog post is published.
- [x] 2026-05-13: Created planning brief 5 and the active child ExecPlan for existing-customer migration notes at `docs/exec-plans/active/2026-05-13-document-existing-customer-product-split-migration.md`.
- [x] 2026-05-13: Completed the existing-customer migration notes slice. `docs/internal/existing-customer-product-split-migration.md` now documents one-customer-at-a-time decisions, grant targets, verification, and private-data boundaries.
- [x] 2026-05-13: Recorded the protected-route-group cleanup: the paid app folder should move from `apps/web/app/(workspace)/` to `apps/web/app/(protected)/` so the codebase names the pay-guarded area directly.
- [x] 2026-05-13: Created planning brief 6 and completed the child ExecPlan for the protected route group rename at `docs/exec-plans/completed/2026-05-13-rename-workspace-route-group-to-protected.md`.
- [x] 2026-05-13: Completed the protected route group rename. The paid app route tree now lives under `apps/web/app/(protected)/`, and validation proved public `/starter` and `/workers` still exist while protected app subroutes remain in the same URL positions.
- [x] 2026-05-13: Completed final review hardening for hosted Stripe checkout proof, generated Starter forbidden path contracts, active Program dependency paths, and release workflow product-route proof language.

## Decision Log

Decision: `/` is the Man Meets AI brand homepage, not the primary Ship by Sunday sales page.
Rationale: The index should explain the media, technology, and founder thesis without forcing Starter and Workers through one sales page.
Date: 2026-05-12.

Decision: `/` is a brand/thesis routing page, not a direct sales page.
Rationale: The index should lead with Man Meets AI, a short media-plus-technology thesis, and two buyer-intent paths: starting from an idea to `/starter`, or already having a codebase to `/workers`. Pricing belongs on the product pages.
Date: 2026-05-13.

Decision: `/starter` is the public Starter page and includes the codebase generator plus videos.
Rationale: Starter is the new-builder path. Tutorials are part of that product, not a separate product surface to market.
Date: 2026-05-12.

Decision: `/starter` leads with “Ship your idea by Sunday.”
Rationale: `/starter` is a product page, not the company page. The clearest newbie outcome is shipping an idea, with the hero explaining the two Starter paths and CTAing to `Get Starter — $297`.
Date: 2026-05-13.

Decision: Starter has two first-run paths.
Rationale: Starter buyers should be able to answer step-by-step questions to get a customized repo with a Program and ExecPlans in it, or skip customization and get a template plus guided videos.
Date: 2026-05-12.

Decision: Protected Starter app work lives under `/starter/*`.
Rationale: `/starter` is the public sales page. The protected Starter app should use `/starter/home`, `/starter/lessons`, and `/starter/generate-codebase` so Starter is one coherent route family instead of a public `/starter` page plus a separate top-level `/generate-codebase` app.
Date: 2026-05-12.

Decision: Worker is totally separate from Starter.
Rationale: Worker buyers are purchasing the existing-repo Worker path, not Starter templates or guided videos. Worker-specific onboarding can exist inside Worker, but Starter access should not be granted by default.
Date: 2026-05-12.

Decision: `/workers` is the permanent public Workers landing page.
Rationale: Existing-repo buyers need a separate intent and should not be buried inside the brand homepage or Starter page.
Date: 2026-05-12.

Decision: `/workers` leads with “Install AI workers into your existing codebase.”
Rationale: `/workers` is the existing-repo product page. The hero should sell the direct outcome: private codebase doctor pass, top findings, first approved worker loop, and proof or blocked-proof report, with `Get Workers — $600` as the primary CTA.
Date: 2026-05-13.

Decision: `$600` Workers includes a bounded first install scope.
Rationale: The purchase includes local runner setup, private doctor pass, top findings, approval of one worker loop, and proof or blocked-proof report. This is concrete enough to sell and bounded enough to fulfill without implying unlimited implementation work.
Date: 2026-05-13.

Decision: Workers founding installs are explicitly hands-on while self-serve hardens.
Rationale: The page should set the expectation that buyers get the local runner and worker system that is becoming self-serve, with help through setup, diagnosis, first loop approval, and proof review.
Date: 2026-05-13.

Decision: Protected Worker app work must live on explicit Worker subroutes, not on `/workers`.
Rationale: `/workers` is permanently public marketing. Paid app entry points should use concrete operational routes such as `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/loops`, `/workers/runs`, and `/workers/privacy`.
Date: 2026-05-12.

Decision: Product-specific checkout success should route buyers directly into the purchased product.
Rationale: The public page already resolved intent. Starter buyers should start at `/starter/home`, Worker buyers should start at `/workers/setup`, and `/home` should remain the returning-user, multi-capability, or unresolved-access hub.
Date: 2026-05-12.

Decision: Starter checkout success lands on `/starter/home`.
Rationale: Starter has two valid first actions: guided questions for a customized repo, or template plus guided videos. `/starter/home` can present those paths without turning public `/starter` into an app chooser.
Date: 2026-05-12.

Decision: `/home` is a protected multi-product and recovery hub, not the default stop for single-product users.
Rationale: Starter-only users should forward to `/starter/home`; Worker-only users should forward to `/workers/setup` or a later most-relevant Worker progress route; multi-product, unresolved, and legacy users can use `/home` as a chooser or recovery state.
Date: 2026-05-13.

Decision: The protected paid-app route group should be named `(protected)`, not `(workspace)`.
Rationale: `(workspace)` describes a product workspace concept, but the folder is currently doing access-boundary work. The route group name should make the pay-guarded app area explicit for future agents without changing URLs. Public marketing routes such as `/starter`, `/workers`, `/blog`, and `/docs` should remain outside that group.
Date: 2026-05-13.

Decision: Multi-product `/home` shows only Starter and Workers as product cards.
Rationale: Generator and lessons belong inside Starter. Setup, doctor pass, findings, loops, runs, and privacy belong inside Workers. A separate Tutorials or Generate Codebase card would recreate the old peer-surface hierarchy.
Date: 2026-05-13.

Decision: Keep old protected Starter/Tutorial routes as unpromoted redirects during the first implementation pass.
Rationale: Redirects are cheap and reduce accidental breakage while the visible IA changes. `/generate-codebase`, `/tutorials`, and `/tutorials/[lessonKey]` should redirect to the matching `/starter/*` routes for the first cut and can be deleted later once the new route family has shipped cleanly.
Date: 2026-05-13.

Decision: Starter lessons use an index plus keyed detail pages.
Rationale: `/starter/lessons` should be the lesson library/index, and `/starter/lessons/[lessonKey]` should be the individual watch/detail page. This preserves direct lesson links and gives old `/tutorials/[lessonKey]` routes a clean redirect target.
Date: 2026-05-13.

Decision: Do not promote docs as a public product path.
Rationale: The docs are useful support material for generated-codebase customers, but they are not the thing being sold.
Date: 2026-05-12.

Decision: `/docs` remains public but unpromoted for the first pass.
Rationale: Direct docs links should keep working for generated-codebase support and generated repos, but docs should not appear in public nav, homepage CTAs, or product-sales paths.
Date: 2026-05-13.

Decision: Public navigation includes only Man Meets AI, Starter, Workers, Blog, and Sign in.
Rationale: Docs, Tutorials, Generate Codebase, and Pricing should not appear as top-level public nav items. Pricing belongs on the relevant sales pages, and Tutorials/Generate Codebase belong inside Starter.
Date: 2026-05-13.

Decision: Blog post extraction is a later content slice.
Rationale: Slice 1 should keep `/blog` linked and usable, but extracting Plan/Program homepage material into posts is valuable content work rather than a blocker for the public IA, checkout, and access split.
Date: 2026-05-13.

Decision: Generated codebases must not include Worker local-runner code.
Rationale: The generated repo is a template app for Starter customers. Worker local-runner code belongs to the Worker product and creates confusing coupling in generated output.
Date: 2026-05-12.

Decision: The generated repo should be shaped by intake answers and include an operating spine that can produce Programs and ExecPlans.
Rationale: The value is not only files. The generated app should be ready for continued AI work based on the customer's stated product direction.
Date: 2026-05-12.

Decision: First-pass generated repo customization is mostly source truth, docs, Program, ExecPlans, and agent instructions.
Rationale: The first compiler rewrite should produce a clean working template app. Questionnaire answers should shape the product truth and operating materials first, rather than generating substantially different application code per answer.
Date: 2026-05-13.

Decision: Compiler/generated-repo extraction is the second implementation slice.
Rationale: The first slice already owns public IA, protected route moves, checkout, access, redirects, `/home`, nav, and copy. Generated-output extraction touches package boundaries and should not be mixed into that first high-risk slice unless it becomes a hard blocker.
Date: 2026-05-13.

Decision: Use the simplest working price and entitlement split.
Rationale: The immediate need is a working product split, not a generalized offer model or brand configuration layer.
Date: 2026-05-12.

Decision: Build two real app-backed checkout offers in the first implementation pass.
Rationale: Starter and Workers pages should not look complete while fulfillment remains manual. A minimal explicit `starter` offer and `workers` offer is enough: Starter grants generator and videos and routes to `/starter/home`; Workers grants Worker access and routes to `/workers/setup`.
Date: 2026-05-13.

Decision: Use clean first public prices of Starter `$297` and Workers `$600`.
Rationale: The split needs clear offer-specific prices rather than the current single blended price with a shared auto-applied promotion code.
Date: 2026-05-13.

Decision: Migrate existing paid customers manually.
Rationale: There are only three customers, and the correct destination depends on customer preference and operator discretion.
Date: 2026-05-12.

## Slice Ledger

Active child ExecPlans:

- None currently.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-13-hard-cut-public-ia-to-starter-and-workers.md` owns the completed public IA hard cut, protected Worker route boundary, Starter-owned videos, paid-home card cleanup, and minimal split-checkout/access implementation.
- `docs/exec-plans/completed/2026-05-13-remove-worker-leakage-from-generated-starter-snapshots.md` owns the completed generated Starter snapshot purity pass: blocking Worker, runner, Codex bridge, and local-runner leakage from generated downloads while preserving generated docs, Program, ExecPlans, and agent instructions.
- `docs/exec-plans/completed/2026-05-13-extract-explicit-generated-template-app.md` owns the completed generated template app extraction: broad core app routes are no longer copied, generated app runtime files are rendered from intake facts, and the clean-room generated repo test proves the app typechecks.
- `docs/exec-plans/completed/2026-05-13-clean-up-docs-promotion-and-blog-content.md` owns the completed docs/blog cleanup: docs are reachable but unpromoted, and the blog now carries the Starter / Workers split thesis.
- `docs/exec-plans/completed/2026-05-13-document-existing-customer-product-split-migration.md` owns the completed private-data-safe operator runbook for manually mapping legacy paid customers into Starter, Workers, both, or a bespoke path.
- `docs/exec-plans/completed/2026-05-13-rename-workspace-route-group-to-protected.md` owns the completed protected route group rename from `apps/web/app/(workspace)/` to `apps/web/app/(protected)/`.

## Next Slice

No required repo child slice remains inside this Program. External operator execution still remains: review the three real legacy paid customers using `docs/internal/existing-customer-product-split-migration.md`, apply grants outside git, verify access, and record customer-specific outcomes in the operator-owned system.

## Risks and Watchpoints

Do not reintroduce `/workers` as a protected app page. `/workers` is public marketing; protected Worker work belongs below explicit operational subroutes such as `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/loops`, `/workers/runs`, and `/workers/privacy`.

Do not confuse the `(workspace)` to `(protected)` folder rename with a URL change. Next route groups are pathless. The cleanup should move files and references only, keep public `/starter`, `/workers`, `/blog`, and `/docs` outside the protected group, and preserve route-guard behavior.

Do not keep Tutorials as a top-level product card after deciding Starter owns videos. Existing protected tutorial routes may remain as internal implementation routes during migration, but the customer-facing IA should not market Tutorials as its own product.

Do not overfit checkout into a generic offer platform. The implementation needs two real app-backed offers with prices, success routes, and capability mappings, not a new pricing framework, unless Stripe or access boundaries force a small durable model.

Do not let static Stripe payment links bypass app-owned purchase intent, webhook reconciliation, or capability grants. If static links are used temporarily, the Program must record the access limitation and operator migration path.

Do not let the generated repo keep inheriting broad core-app folders that contain Worker or local-runner routes. The compiler extraction should prefer an explicit template contract over a large snapshot with fragile exclusions.

Do not silently break the three current paid customers. The code can support the new model, but actual customer grants should be reviewed and adjusted manually.

## Outcomes & Retrospective

This Program is active only because real customer-specific migrations happen outside git. Repo-side work is complete: public IA and checkout, generated Starter snapshot purity, explicit generated template app extraction, docs/blog cleanup, private-data-safe existing-customer migration notes, and protected route group naming have all landed.

## Validation and Acceptance

Program-level acceptance requires the public site to expose `/` as Man Meets AI, a brand/thesis routing page with paths to `/starter` and `/workers`, `/starter` as the newbie Starter page, `/workers` as the existing-repo Workers page, and `/blog` as a usable publishing surface. Public navigation should include only Man Meets AI, Starter, Workers, Blog, and Sign in. `/docs` remains publicly reachable by direct link but must not be promoted as a primary public product path or sales CTA. Single-product paid customers should forward from `/home` into the matching product route, while multi-product, unresolved, and legacy users can use `/home` as a chooser or recovery state. Multi-product `/home` should show only Starter and Workers cards. Starter must support both guided-question customized repo generation with Program and ExecPlans, and direct template plus guided videos under `/starter/home`, `/starter/lessons`, `/starter/lessons/[lessonKey]`, and `/starter/generate-codebase`. Worker app setup, doctor pass, findings, loops, runs, and privacy should remain protected below specific Worker subroutes. Once the route-group cleanup lands, pay-guarded app routes should live under `apps/web/app/(protected)/` rather than `apps/web/app/(workspace)/`; public marketing and support routes should stay outside that group.

Starter checkout must be app-backed at `$297`, grant the generator and videos, and route to `/starter/home`. Worker checkout must be app-backed at `$600`, grant only Worker access by default, route to `/workers/setup`, and communicate the bounded included scope: local runner setup, private doctor pass, top findings, one approved worker loop, and proof or blocked-proof report. Existing customers must remain recoverable through manual grants. The generated repo must be a template app, must not include Worker local-runner code, and must use intake answers to customize source truth, docs, Program, ExecPlans, and agent instructions for future loops.

## Artifacts and Notes

The current `apps/web/content/docs/` material is mostly relevant to generated-codebase customers, so the docs cleanup should reduce promotion rather than delete the route by default. If later work makes docs protected or customer-scoped, that should be planned separately because it changes discoverability, sitemap, and customer setup behavior.

The older Worker Generate Tutorials IA Program should not be used as the current product destination model. It remains relevant for code that already moved paid app routes and access toward `/home`, `/generate-codebase`, `/tutorials`, and `/workers`.

## Interfaces and Dependencies

This Program depends on public routes under `apps/web/app/`, protected paid-app routes under `apps/web/app/(protected)/`, route protection in `apps/web/proxy.ts`, route and price constants in `apps/web/config/product.ts`, homepage content and render models under `apps/web/app/_content/` and `apps/web/app/_lib/`, paid-home models under the protected route group, checkout code under `apps/web/platform/billing/checkout/`, managed Stripe config under `apps/web/platform/billing/`, access code under `apps/web/platform/access/`, Convex access code under `apps/web/convex/access/`, Starter lesson library code under the protected route group, blog content loading under `apps/web/app/blog/` and `apps/web/content/blog/`, docs content under `apps/web/content/docs/`, and generated repo code under `packages/codebase-compiler/src/repo-generation/`.
