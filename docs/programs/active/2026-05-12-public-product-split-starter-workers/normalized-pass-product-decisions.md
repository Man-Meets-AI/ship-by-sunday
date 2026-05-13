---
title: "Normalized Product Decisions"
summary: "Normalized decisions from the product-owner clarification for the Man Meets AI, Starter, Workers, docs, and generated-repo split."
docType: "normalized_pass"
status: "active"
read_when:
  - "Checking what was decided before implementation planning."
  - "Resolving whether Tutorials or Docs should be promoted as separate public products."
---

# Normalized Product Decisions

## Public Surfaces

Man Meets AI owns `/`. It should be an informational brand/thesis routing page about the media, technology, and founder thesis, with two main paths: starting from an idea to `/starter`, or already having a codebase to `/workers`. It should not be a pricing table or direct sales page.

Starter owns `/starter` as public marketing. Protected Starter app work lives under `/starter/home`, `/starter/lessons`, `/starter/lessons/[lessonKey]`, and `/starter/generate-codebase`. Starter is for new builders and includes the codebase generator plus videos. It has two paths: guided step-by-step questions that produce a customized repo with a Program and ExecPlans, or a direct template plus guided videos path.

`/starter` should lead with “Ship your idea by Sunday.” The hero subhead should explain that buyers can answer guided product questions to generate a customized AI-ready repo, or start from the template and follow guided videos. The primary CTA should be `Get Starter — $297`.

Workers owns `/workers`. It is for existing repos and should have its own public landing page. Protected Worker work lives below specific operational subroutes, not on `/workers`. Worker is totally separate from Starter and should not include Starter template or guided video access by default.

`/workers` should lead with “Install AI workers into your existing codebase.” The hero subhead should explain the private codebase doctor pass, top findings, first approved worker loop, and proof or blocked-proof report. The primary CTA should be `Get Workers — $600`.

The `$600` Workers purchase includes local runner setup, private doctor pass, top findings, approval of one worker loop, and proof or blocked-proof report.

`/workers` should explicitly say founding installs are hands-on while the self-serve runner hardens. Buyers get help through setup, diagnosis, first loop approval, and proof review.

Blog owns `/blog`. It should support posts that can reuse and expand material currently crowded into the homepage, including the Plan and Program thesis material.

Public navigation should include only Man Meets AI, Starter, Workers, Blog, and Sign in. It should not include Docs, Tutorials, Generate Codebase, or Pricing.

Slice 1 only needs `/blog` linked and usable. Extracting Plan/Program homepage material into real blog posts belongs to a later content slice.

## Demoted Or Internal Surfaces

Docs should remain available where generated-codebase customers need them, but docs should not be promoted as a primary product path. In the first pass, `/docs` remains public by direct link, but public nav, homepage CTAs, and sales pages should not promote it.

Tutorials should not be a dedicated public sales page or peer product. Videos belong to Starter.

`/codebase-doctor` is a later option, not part of the first hard cut.

## Generated Repo

Generating a codebase should not include Worker local-runner code.

The generated repo should be a template app influenced by the customer's intake answers. In the first pass, the app code should stay template-shaped while the questionnaire customizes source truth, docs, Program, ExecPlans, and agent instructions. It should be able to generate Programs and ExecPlans for continued AI loops.

The codebase compiler should be broken apart enough that generated output is not tightly coupled to the core app's current protected routes and Worker implementation.

## Pricing And Access

Different prices are expected for Starter and Workers.

The implementation should prefer a direct working split over a broad offer model, brand configuration system, or generalized pricing framework.

Starter purchases should use real app-backed checkout at `$297`, grant generator and guided video access, and route to `/starter/home`. Worker purchases should use real app-backed checkout at `$600`, grant Worker access only by default, and route to `/workers/setup`. Existing paid customers should be migrated individually based on desire and operator discretion.

The new default checkout path should not use the current shared auto-applied promotion code behavior.

For users with both products, `/home` should show only Starter and Workers. It should not show separate Generate Codebase or Tutorials cards.

## Implementation Posture

The goal is to make the split work. Avoid abstract product architecture unless it is the smallest safe way to preserve checkout, entitlement, generated-output, or route correctness.
