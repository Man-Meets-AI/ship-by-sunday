---
title: Starter Template App Planning Brief 5
program_id: starter-template-source-and-billing-proof
brief_version: 5
status: superseded
summary: Create the next child ExecPlan for turning the pinned Starter template app into a richer customer-ready app starter.
read_when:
  - "Writing the fifth child ExecPlan for this Program."
  - "Replacing the template sample domain with the ChatGPT-style Starter app."
  - "Checking how the pinned template app should evolve after operating-pack setup plans are generated."
---

# Starter Template App Planning Brief 5

## Planning Context

Generated Starter repo materialization now consumes the pinned template source under `templates/starter-app/source`, maps that single-app source into generated `apps/web/`, applies manifest-allowed generated overlays afterward, and preserves clean-room no-provider validation. Generated repos now also ship a first customer Program with ordered active ExecPlans for Core Boot, Clerk Setup, Convex Setup, Stripe Setup, and First Product Slice, plus onboarding and wrapper skills that route setup work through those plans.

The next dependency is the app experience itself. The pinned sibling skeleton currently gives the generated repo a stronger Next.js, Convex, Clerk, Stripe, route-group, billing, auth, and docs foundation, but the customer-facing sample domain is still the template's Notes-style flow. The Program direction is settled: replace that sample domain with a ChatGPT-style BYO OpenAI chat app while preserving no-provider setup states and the sibling template architecture.

## Next Plan Recommendation

Exact next plan title: `Beef Up Starter Template App`.

Exact target path: `docs/exec-plans/active/2026-05-13-beef-up-starter-template-app.md`.

Exact scope: build the real Starter app template experience from the pinned source architecture. Include a credible public homepage, protected app shell, dashboard or chat entry, settings/account area, generated design-system wiring, provider setup affordances, and a ChatGPT-style BYO OpenAI chat screen with conversation sidebar, composer, message timeline, model picker, and missing-key setup state. Preserve generated overlays, Program/ExecPlan output, template provenance, and clean-room no-provider validation.

Exact boundaries: do not add live provider requirements to generated clean-room proof, do not fetch or mutate the sibling template, do not copy Worker local-runner internals or Worker Dashboard route naming, do not expose OpenAI keys to client code, do not let arbitrary unvalidated model ids into the UI, and do not change direct download behavior in this slice.

## Success Criteria

The slice succeeds when the generated Starter template feels like a real app starter instead of a Notes sample, `/chat` is the protected primary product surface, missing Clerk/Convex/Stripe/OpenAI configuration renders clear setup states, generated no-provider install/typecheck/operating-pack proof still passes, and the child ExecPlan records any intentional divergence from ChatGPT's current user-facing behavior.
