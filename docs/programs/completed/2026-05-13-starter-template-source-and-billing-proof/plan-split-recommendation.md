---
title: "Starter Template Source And Billing Proof Plan Split Recommendation"
summary: "Recommended child ExecPlan split for billing proof parity and the Starter template source program."
docType: "plan_split_recommendation"
status: "active"
read_when:
  - "Planning the child ExecPlans for this Program."
  - "Deciding whether to combine billing proof and template work."
---

# Starter Template Source And Billing Proof Plan Split Recommendation

## Recommendation

Use one Program with several child ExecPlans. The billing proof work and template source work are related because they both harden the Starter and Workers split, but they should not be implemented in one ExecPlan.

The first child ExecPlan should be `Parameterize Hosted Billing Proof By Offer`. It should make the hosted proof accept `starter` and `workers`, assert offer-specific amount and destination, update docs, and keep Starter as the default.

The second child ExecPlan should be `Introduce Pinned Starter Template Source`. It should import or copy a pinned snapshot of `~/Developer/next-js-convex-clerk-stripe-template` into `templates/starter-app/`, create the source boundary, define how the generator consumes template source, and prove the generated repo output is reproducible.

The third child ExecPlan should be `Migrate Generated Template App To Template Source`. It should remove the fragile renderer-only app shell and route app source through the new template boundary while preserving generated overlays and clean-room proof.

The fourth child ExecPlan should be `Upgrade Generated Starter Operating Pack`. It should make the generated first customer Program include ordered provider setup ExecPlans for Clerk, Convex, and Stripe, plus the Program/ExecPlan commands, prompt assets, and validation surface those plans need.

The fifth child ExecPlan should be `Beef Up Starter Template App`. It should build the actual app starter experience from the sibling-template architecture: homepage, app shell, dashboard, settings, generated design-system wiring, provider setup affordances, and a ChatGPT-style BYO OpenAI chat screen with a model picker.

The sixth child ExecPlan should be `Add Direct Template Download Path`. It should make Starter's no-questions path generate a repo from default facts using the same compiler output path as the questionnaire flow.

The seventh child ExecPlan should be `Template Update And Release Proof Docs`. It should document how to update the template source, how to prove both billing offers, and how future agents should avoid static zip drift.

## First Slice Boundary

Do not begin by building the full template. Start with proof parity because it is smaller, billing-sensitive, and already has a known gap.

Do not begin by creating an external repo. Start with a pinned repo-local template boundary or a lockable import path so determinism is solved before cross-repo process is added.
