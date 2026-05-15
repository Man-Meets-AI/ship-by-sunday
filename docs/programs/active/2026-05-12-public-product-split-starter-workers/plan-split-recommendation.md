---
title: "Public Product Split Plan Recommendation"
summary: "Recommended child ExecPlan boundaries for implementing the Man Meets AI, Starter, and Workers split."
docType: "plan_split"
status: "active"
read_when:
  - "Creating child ExecPlans from the public product split Program."
  - "Deciding what belongs in the first implementation slice."
---

# Public Product Split Plan Recommendation

## Recommended Slices

1. Public IA and minimal checkout hard cut.

   Create `/` as the Man Meets AI brand/thesis routing page, `/starter` as the public Starter page, protected `/starter/home`, `/starter/lessons`, `/starter/lessons/[lessonKey]`, and `/starter/generate-codebase` as the Starter app, and public `/workers` as the Workers page. Reconcile protected Worker subroutes, update `/home` to auto-forward single-product users and present only Starter/Workers for multi-product, unresolved, or legacy users, stop presenting Tutorials or Generate Codebase as top-level products, limit public nav to Man Meets AI, Starter, Workers, Blog, and Sign in, add unpromoted redirects from old Starter/Tutorial routes, and wire direct Starter and Worker checkout/access paths with product-specific success routing.

2. Generated template app extraction.

   Replace broad core-app snapshot coupling with a cleaner template-app output contract. Generated repos must exclude Worker local-runner code. This is the second implementation slice unless the first slice finds a hard blocker. In the first compiler pass, app code stays template-shaped while intake answers customize source truth, docs, Program, ExecPlans, and agent instructions for future loops.

3. Docs and blog cleanup.

   Keep `/docs` public by direct link but remove docs from primary public promotion. Keep generated-codebase support docs available. Move reusable Plan and Program thesis content into blog posts and make `/blog` practical for ongoing publishing. This is a later content slice, not part of Slice 1.

4. Manual customer migration and final proof.

   Review the three paid customers, assign grants deliberately, and run release proof across public routes, checkout, protected routes, generated output, docs visibility, and browser smoke.

## First Slice Boundary

The first child ExecPlan should be titled `Hard Cut Public IA To Man Meets AI Starter And Workers`.

It should include enough checkout and access work to make public CTAs real. A public route split without real app-backed purchase and capability mapping would leave the site visually changed but operationally false.

It should not include the generated-template extraction unless the route work exposes a hard compile or access dependency. That extraction is bigger and should be handled with its own tests and generated-output snapshots as Slice 2.

It should avoid building a general offer model. A small explicit `starter` and `workers` mapping is enough unless Stripe, webhook, or entitlement code needs a narrow typed representation.

## Acceptance For The First Slice

Anonymous visitors can load `/`, `/starter`, `/workers`, and `/blog`.

`/` routes visitors by intent to Starter or Workers and does not carry the product pricing table.

Signed-in or entitled visitors can still reach protected Starter and Worker app surfaces that match their grants.

`/workers` is public, while Worker setup, doctor pass, findings, loops, runs, and privacy remain protected.

Old protected `/generate-codebase`, `/tutorials`, and `/tutorials/[lessonKey]` routes redirect to the matching `/starter/*` route and are not promoted. Lesson detail redirects preserve the lesson key.

`/home` auto-forwards single-product users and shows only Starter and Workers for multi-product, unresolved, and legacy users.

Starter checkout is app-backed at `$297`, grants generator and videos, and routes to `/starter/home`. Workers checkout is app-backed at `$600`, grants only Worker access by default, and routes to `/workers/setup`.

`/starter` leads with “Ship your idea by Sunday.” and a `Get Starter — $297` CTA.

`/workers` leads with “Install AI workers into your existing codebase.” and a `Get Workers — $600` CTA.

`/docs` remains public by direct link but is not promoted from primary public navigation, homepage CTAs, or sales pages.

Public navigation includes Man Meets AI, Starter, Workers, Blog, and Sign in only.

`/blog` remains linked and usable; new post extraction is deferred.
