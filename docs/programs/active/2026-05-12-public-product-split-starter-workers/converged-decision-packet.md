---
title: "Public Product Split Converged Decision Packet"
summary: "Canonical decisions for splitting Man Meets AI, Starter, and Workers."
docType: "decision_packet"
status: "active"
read_when:
  - "Checking the canonical public IA decisions."
  - "Resolving whether Tutorials, Docs, or Codebase Doctor should be first-class public sales pages."
---

# Public Product Split Converged Decision Packet

## Decisions

Decision: Use `/` as the Man Meets AI brand page.

Rationale: The index should explain the company and thesis without forcing two different buyer intents into one sales page.

Decision: Make `/` a brand/thesis routing page.

Rationale: `/` should lead with Man Meets AI, the media-plus-technology thesis, and two paths: starting from an idea to `/starter`, or already having a codebase to `/workers`. Pricing belongs on product pages.

Decision: Add `/starter` as the new-builder sales page.

Rationale: Starter is the offer for people beginning from an idea, Lovable-style prototype, or prompt pile. It includes the codebase generator and videos.

Decision: Lead `/starter` with “Ship your idea by Sunday.”

Rationale: Starter should sell the new-builder outcome directly. Man Meets AI can remain the surrounding brand; the page headline should be the Starter promise.

Decision: Put the protected Starter app under `/starter/home`, `/starter/lessons`, and `/starter/generate-codebase`.

Rationale: `/starter` should remain public marketing, while protected Starter work should share one coherent route family instead of living at top-level `/generate-codebase` and `/tutorials`.

Decision: Add keyed Starter lesson detail pages.

Rationale: `/starter/lessons` should be the lesson library/index, and `/starter/lessons/[lessonKey]` should be the individual lesson detail/watch page. This keeps direct lesson links and redirect targets simple.

Decision: Give Starter two first-run paths.

Rationale: Starter buyers should be able to answer step-by-step questions to get a customized repo with a Program and ExecPlans, or skip customization and get a template plus guided videos.

Decision: Keep Worker totally separate from Starter.

Rationale: Worker buyers are purchasing the existing-repo path. They should not receive Starter template or guided video access by default. Worker onboarding can be added inside the Worker surface later.

Decision: Add public `/workers` as the existing-repo sales page.

Rationale: Existing-repo buyers need their own landing page and message. The current protected `/workers` route must be reconciled with this public use.

Decision: Lead `/workers` with “Install AI workers into your existing codebase.”

Rationale: Workers should sell the existing-repo outcome directly: doctor pass, top findings, first approved worker loop, and proof. `/codebase-doctor` can remain a later marketing alias.

Decision: Bound the `$600` Workers purchase to one first install.

Rationale: The included scope is local runner setup, private doctor pass, top findings, approval of one worker loop, and proof or blocked-proof report.

Decision: Present Workers as a hands-on founding install while self-serve hardens.

Rationale: This sets honest expectations and matches the current fulfillment reality without weakening the long-term self-serve product direction.

Decision: Keep protected Worker app work below explicit Worker subroutes.

Rationale: `/workers` is permanently public marketing. Paid app entry points should target specific operational routes such as `/workers/setup`, `/workers/doctor-pass`, `/workers/findings`, `/workers/loops`, `/workers/runs`, and `/workers/privacy`.

Decision: Route known checkout success flows directly into the purchased product.

Rationale: Starter buyers should land on `/starter/home`, Worker buyers should land on `/workers/setup`, and `/home` should be reserved for returning users, multi-capability users, or unresolved purchases.

Decision: Use `/starter/home` as the Starter post-checkout landing page.

Rationale: Starter has two valid first actions: guided questions for a customized repo, or direct template plus guided videos. `/starter/home` should present those paths.

Decision: Auto-forward single-product users from `/home`.

Rationale: `/home` remains valuable for multi-product users, unresolved access, legacy grants, and account recovery, but Starter-only users should land on `/starter/home` and Worker-only users should land on `/workers/setup` or the later most-relevant Worker progress route.

Decision: Show only Starter and Workers on multi-product `/home`.

Rationale: Generate Codebase and Lessons are Starter subpaths, and Worker operational routes are Worker subpaths. Showing more than two product cards would recreate the old peer-surface model.

Decision: Redirect old protected Starter/Tutorial routes for the first implementation pass.

Rationale: `/generate-codebase`, `/tutorials`, and `/tutorials/[lessonKey]` should stop being promoted but can redirect to the matching `/starter/*` routes to avoid accidental breakage while the new IA ships.

Decision: Stop treating Tutorials as a standalone product surface.

Rationale: Videos support Starter. They should not compete with Starter as a separate public destination or top-level paid-home card.

Decision: Keep docs available but unpromoted.

Rationale: Docs are support material for generated-codebase customers, not the public thing being sold.

Decision: Keep `/docs` public by direct link for the first pass.

Rationale: Generated-codebase support paths and generated repos can still use docs links. Protecting docs would add auth and support complexity without helping the first product split.

Decision: Limit public navigation to Man Meets AI, Starter, Workers, Blog, and Sign in.

Rationale: Docs, Tutorials, Generate Codebase, and Pricing should not be top-level public nav items. Pricing belongs on the relevant sales pages.

Decision: Defer blog post extraction to a later content slice.

Rationale: Slice 1 only needs `/blog` linked and usable. Reworking Plan/Program homepage material into blog posts is content work, not a blocker for route, checkout, and access correctness.

Decision: Keep `/codebase-doctor` out of the first cut.

Rationale: Codebase Doctor can become a later marketing alias or product lane, but the immediate split is `/starter` and `/workers`.

Decision: Make generated repos template apps, not snapshots of the core app with Worker code removed after the fact.

Rationale: The generated repo should be understandable, shaped by intake answers, and ready for future Program and ExecPlan loops. Broad snapshot coupling risks leaking Worker local-runner code and core-app internals.

Decision: Keep first-pass generated app code template-shaped.

Rationale: Questionnaire answers should customize source truth, docs, Program, ExecPlans, and agent instructions first. Substantially different app code generation can come later.

Decision: Do compiler/generated-output extraction as Slice 2.

Rationale: Slice 1 should focus on public IA, protected routes, checkout, access, redirects, `/home`, nav, and copy. Compiler extraction touches package and generated-output contracts and should not be mixed into that first slice unless it becomes a hard blocker.

Decision: Use direct split pricing and entitlements.

Rationale: The product needs to work now. A generalized offer model is unnecessary unless implementation boundaries force a small durable representation.

Decision: Build two real app-backed checkout offers in the first pass.

Rationale: Public pages should not depend on manual payment links. A minimal explicit `starter` offer and `workers` offer should drive Stripe Checkout, metadata, success routing, and access grants.

Decision: Price Starter at `$297` and Workers at `$600`.

Rationale: The first public split needs clear offer-specific prices, not the current one-price plus shared promotion-code model.

Decision: Migrate the three existing paid customers manually.

Rationale: The correct path depends on customer preference and operator discretion.

## Non-Decisions

This packet does not decide the final `/codebase-doctor` page, Worker expansion packages, agency pricing, or monthly maintenance pricing.

This packet does not decide to delete the docs route.

This packet does not decide whether tutorial implementation routes must be physically removed immediately. It only decides they should not be marketed or presented as a separate product.

This packet does not decide to rewrite the full compiler in the same slice as the public IA hard cut.
