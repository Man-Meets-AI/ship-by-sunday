---
title: "Starter Template Source And Billing Proof Cross Repo Review"
summary: "Risk review for hosted billing proof parity, template-source determinism, generated output, and future external template updates."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Reviewing risks before implementing this Program."
  - "Checking what could break when the Starter template becomes a real source tree."
---

# Starter Template Source And Billing Proof Cross Repo Review

## Findings

Risk: Workers billing can regress while Starter proof remains green.

Impact: Workers has a separate price, checkout offer, access capability, and success route. A Starter-only proof does not prove Workers purchase fulfillment.

Risk: A live external template fetch can make customer zips nondeterministic.

Impact: Two buyers can receive different source for the same app version, and release proof cannot easily reconstruct what shipped.

Risk: A hand-maintained zip can drift from the generator.

Impact: The direct template path can become a different product from the questionnaire path, with stale docs, missing Program material, or mismatched scripts.

Risk: A richer template can accidentally require provider setup before local validation.

Impact: New buyers can fail before they see the app if Clerk, Convex, or Stripe are hard requirements for typecheck or dev startup.

Risk: Template source can reintroduce Worker or Codex bridge leakage.

Impact: Starter customers may receive local-runner, Worker protected routes, Codex account bridge code, or internal Man Meets AI implementation paths.

Risk: Generated overlays can become too broad and overwrite template source accidentally.

Impact: The template may work in isolation but break when generator overlays replace app files unexpectedly.

Risk: Template version metadata can be absent or weak.

Impact: Support cannot tell which template version a customer downloaded, and future update work cannot compare outputs deterministically.

## Required Review Focus

Billing proof review should inspect metadata, amount, destination, and capability assertions for both Starter and Workers.

Generator review should inspect the generated file list, forbidden path assertions, template version metadata, and clean-room generated repo command contract.

Template app review should inspect no-provider local validation, provider setup affordances, UI quality, and whether generated design-system values are actually used.

Docs review should inspect generated `README.md`, `START-HERE.md`, provider setup docs, template update docs, and release workflow proof language.

Security review should verify that no secrets, local paths, support-mode state, Worker runner code, Codex bridge internals, or private Program archives enter generated output.
