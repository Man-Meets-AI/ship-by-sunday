---
title: Public Product Split Planning Brief 1
program_id: public-product-split-starter-workers
brief_version: 1
status: superseded
summary: Hard-cut the public IA to Man Meets AI, Starter, and Workers while creating protected Starter and Worker subroutes and adding a minimal split checkout/access path.
read_when:
  - "Creating the first child ExecPlan for the public product split."
  - "Implementing the public `/`, `/starter`, `/workers`, paid-home, checkout, and access hard cut."
---

# Public Product Split Planning Brief 1

The first child ExecPlan should be titled `Hard Cut Public IA To Man Meets AI Starter And Workers`.

The goal is to make the visible product split real. Anonymous visitors should see `/` as a Man Meets AI brand/thesis routing page, `/starter` as the Starter offer, `/workers` as the Worker offer, and `/blog` as the publishing surface. Paid customers should land on product-specific protected routes or `/home` and see product choices that match the new hierarchy: Starter and Workers, with videos belonging to Starter instead of a separate Tutorials product.

Exact scope: update the public routes under `apps/web/app/`, product route constants in `apps/web/config/product.ts`, homepage content and render model files, route protection in `apps/web/proxy.ts`, protected Worker app route ownership under `apps/web/app/(protected)/workers/`, paid-home card and navigation models under `apps/web/app/(protected)/_lib/`, app shell navigation where needed, docs/blog/public navigation links, sitemap and robots behavior if route visibility changes, checkout session creation, managed Stripe price handling, checkout metadata, Convex purchase/access grant code, and route/access tests for the touched paths.

Implementation requirements:

- `/` must become a Man Meets AI brand/thesis routing page, not the main mixed Ship by Sunday sales page or a pricing page.
- `/` must route visitors by intent: starting from an idea to `/starter`, or already having a codebase to `/workers`.
- `/starter` must be a public Starter page for the generator plus videos.
- `/starter` must lead with `Ship your idea by Sunday.` and a `Get Starter — $297` CTA.
- `/starter` hero copy must explain the two paths: answer guided product questions to generate a customized AI-ready repo, or start from the template and follow guided videos.
- Protected Starter app work must live under `/starter/home`, `/starter/lessons`, `/starter/lessons/[lessonKey]`, and `/starter/generate-codebase`.
- Starter must support two first-run paths: guided step-by-step questions that produce a customized repo with a Program and ExecPlans, or a direct template plus guided videos path.
- `/workers` must be a public Workers page.
- `/workers` must lead with `Install AI workers into your existing codebase.` and a `Get Workers — $600` CTA.
- `/workers` hero copy must explain the private codebase doctor pass, top findings, first approved worker loop, and proof or blocked-proof report.
- `/workers` purchase scope must be bounded to local runner setup, private doctor pass, top findings, approval of one worker loop, and proof or blocked-proof report.
- `/workers` must explain that founding installs are hands-on while the self-serve runner hardens.
- Worker setup, doctor pass, findings, loops, runs, and privacy must remain protected below explicit subroutes.
- Paid Home and app navigation must link Worker customers to `/workers/setup` or another specific protected Worker operational route, not to public `/workers`.
- Starter checkout success must route to `/starter/home`.
- Worker checkout success must route to `/workers/setup`.
- `/home` must remain the protected multi-product, unresolved-access, legacy, and recovery hub.
- `/home` must auto-forward Starter-only users to `/starter/home`.
- `/home` must auto-forward Worker-only users to `/workers/setup` or a later most-relevant Worker progress route when that progress signal exists.
- `/home` must show only Starter and Workers for multi-product, unresolved, and legacy users.
- `/home` must stop presenting Tutorials or Generate Codebase as peer product cards.
- `/generate-codebase`, `/tutorials`, and `/tutorials/[lessonKey]` must become unpromoted protected redirects to matching `/starter/*` routes for the first implementation pass, with lesson keys preserved.
- Starter must grant generator and videos.
- Workers must grant only Worker access by default.
- `/docs` must remain publicly reachable by direct link for the first pass.
- Docs must not be promoted as a primary public nav, homepage CTA, product path, or sales-page CTA.
- Public navigation must include only Man Meets AI, Starter, Workers, Blog, and Sign in.
- `/blog` should remain public, linked, and usable.
- Slice 1 should not extract Plan/Program homepage material into new blog posts.

Prefer the smallest durable checkout/access split. A typed pair of offer keys, such as `starter` and `workers`, is acceptable if it keeps Stripe metadata, purchase intents, webhook fulfillment, and access grants explicit. Do not build a broad offer framework, brand system, or configurable pricing platform unless the narrow implementation cannot safely support two prices.

The first implementation must use real app-backed Stripe checkout offers, not temporary/manual payment links. The `starter` offer should resolve to a `$297` configured price, grant generator and video access, and route to `/starter/home`. The `workers` offer should resolve to a `$600` configured price, grant Worker access only by default, and route to `/workers/setup`.

Current Stripe config is single-price. The implementation should replace or wrap the one-price path with the smallest explicit two-offer mechanism needed for `starter` and `workers`: offer-specific price env values, offer-specific checkout metadata or purchase-intent storage, offer-specific success routing, and offer-specific access grants. Do not preserve the current shared active promotion code behavior in the new default checkout path.

Do not rewrite the codebase compiler in this slice unless public route work exposes a hard blocker. Compiler/generated-output extraction is Slice 2. Avoid copy that strongly promises a clean generated template app until the compiler extraction lands. If the Starter page must mention the generated repo, keep the claim aligned with current behavior or explicitly frame the template-app cleanup as the next product hardening step in internal docs, not public caveat copy. The later compiler slice should keep first-pass app code template-shaped while questionnaire answers customize source truth, docs, Program, ExecPlans, and agent instructions.

Do not delete old Starter/Tutorial routes in the first implementation pass. Redirect them, remove promotion, and plan deletion only after the new route family has shipped cleanly.

Do not delete or protect docs by default. Keep `/docs` reachable by direct link, remove public promotion, and keep generated-codebase support paths available unless a later ExecPlan explicitly decides to move docs behind Starter access.

Do not turn Plan/Program homepage material into blog posts in this slice. Keep `/blog` visible and working; content extraction belongs to a later content slice.

Manual migration for the three existing paid customers should be documented as an operator task. Do not write a blind migration that changes customer grants without review.

Focused validation should include route protection tests for public `/workers` and protected Worker subroutes, checkout/access tests for Starter and Workers, paid-home model tests proving Tutorials is not a top-level product card, sitemap/robots tests if changed, and a browser smoke for `/`, `/starter`, `/workers`, `/blog`, and `/home`. Broader validation should include app lint and typecheck after focused checks pass.
