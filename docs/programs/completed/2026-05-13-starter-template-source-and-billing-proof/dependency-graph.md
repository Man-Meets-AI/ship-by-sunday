---
title: "Starter Template Source And Billing Proof Dependency Graph"
summary: "Dependency ordering for hosted billing proof parity, template source extraction, generator integration, and Starter template hardening."
docType: "dependency_graph"
status: "active"
read_when:
  - "Choosing the next child ExecPlan."
  - "Checking why billing proof, template source, and template product work are ordered separately."
---

# Starter Template Source And Billing Proof Dependency Graph

## Dependency Order

The first dependency is product-specific billing proof. It is independent of template architecture and should land first because it hardens the existing split checkout and access model.

The second dependency is a template-source boundary seeded from `~/Developer/next-js-convex-clerk-stripe-template`. A richer Starter app should not be built inside string renderers, and the sibling template already has the right provider architecture. The generator needs a pinned repo-local snapshot to consume before template product work scales up.

The third dependency is generated overlay integration. Once the template source exists, the compiler must copy or materialize that source, then apply generated overlays for product config, homepage content, design system, docs, Program, ExecPlans, and skills.

The fourth dependency is the generated operating pack. Once the generator has a clearer template boundary, the first customer Program can be upgraded to include Clerk, Convex, and Stripe setup as real Program-linked ExecPlans that use the same Program/ExecPlan machinery as the rest of the repo.

The fifth dependency is the richer Starter app template. It depends on the source boundary so the work can be developed, tested, and reviewed like normal app code rather than embedded in renderer strings. This slice should build a ChatGPT-style BYO OpenAI chat app with a model picker while keeping Worker runtime internals and Worker Dashboard thread-console naming out of generated output.

The sixth dependency is the no-questions Starter path. It depends on the template and overlay pipeline because the immediate template download should be the same generated output with default intake facts.

The final dependency is release proof and documentation. Once both offers and both Starter paths are supported, the release workflow and generated customer docs must describe exactly what is proven and how to update the template source.

## Slice Ordering

Slice 1 should parameterize hosted billing proof by offer. This is the smallest self-contained risk reduction.

Slice 2 should import or copy a pinned sibling-template snapshot into `templates/starter-app/`, add provenance for that snapshot, and teach the compiler to read it while keeping output equivalent or intentionally minimal.

Slice 3 should move the existing rendered minimal app into the template-source pipeline and keep all clean-room generated repo tests passing.

Slice 4 should upgrade the generated operating pack so the first customer Program includes provider setup ExecPlans for Clerk, Convex, and Stripe, plus the local Program/ExecPlan commands and prompts those plans need.

Slice 5 should beef up the template into a product-grade Starter app.

Slice 6 should add the direct no-questions template path in the protected Starter app and prove it downloads the same generated repo kind with default facts.

Slice 7 should add or update release/operator docs for running Starter and Workers proof and for updating the template source.
