---
title: Direct Starter Download Planning Brief 6
program_id: starter-template-source-and-billing-proof
brief_version: 6
status: superseded
summary: Create the next child ExecPlan for adding a no-questions Starter download path backed by the same generated repo pipeline.
read_when:
  - "Writing the sixth child ExecPlan for this Program."
  - "Adding a direct Starter template download entry point."
  - "Checking how default facts should flow through the existing generated repo pipeline."
---

# Direct Starter Download Planning Brief 6

## Planning Context

Generated Starter repo downloads now consume the pinned `templates/starter-app/source` snapshot, map it into generated `apps/web/`, apply manifest-allowed overlays, ship a first customer Program with ordered setup ExecPlans, and preserve clean-room no-provider validation. The app surface now starts from a protected `/chat` product instead of the old Notes sample: Convex owns conversations and messages, OpenAI calls stay server-side, `OPENAI_API_KEY` is setup-gated, and generated output tests prove no client key leakage or customer-facing `/notes` route.

The next dependency is product access. Today the strongest generated repo path still flows through the questionnaire/review download route. Starter should also have a direct no-questions template download path that uses the same compiler pipeline with default product facts. That path must not become a static zip, a second generator, or a looser artifact that skips Program, ExecPlan, provenance, validation, or no-provider proof.

## Next Plan Recommendation

Exact next plan title: `Add Direct Template Download Path`.

Exact target path: `docs/exec-plans/active/2026-05-13-add-direct-template-download-path.md`.

Exact scope: add a direct Starter repo download entry point backed by the existing `packages/codebase-compiler` repo-generation pipeline and conservative default facts. The generated artifact should be the same monorepo-shaped Starter output customers get from the review flow: pinned template source, generated overlays, docs spine, first Program, setup ExecPlans, skills, scripts, provenance, and no-provider-safe app behavior. Add focused tests that prove the direct path uses the dynamic generator, not a static zip or separate artifact.

Exact boundaries: do not introduce a static zip, do not fetch mutable template source at request time, do not weaken the questionnaire-backed review download path, do not add live Clerk/Convex/Stripe/OpenAI requirements to the direct download, and do not fork the generated repo contract for the direct path.

## Success Criteria

The slice succeeds when a customer can request the Starter template without answering product questions, the response is generated from the same pinned template-source pipeline with default facts, the direct artifact includes the same generated operating pack and `/chat` app contract, and focused tests prove path parity plus clean-room no-provider behavior.
