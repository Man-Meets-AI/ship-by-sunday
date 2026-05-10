---
title: Shipping Evidence Release Evidence Truthfulness Planning Brief 4
program_id: shipping-evidence-hardening
brief_version: 4
status: current
summary: Fourth planning brief for making protected tag release evidence consume production proof summary artifacts instead of loose check-run conclusions.
read_when:
  - Writing or resuming the release evidence truthfulness child ExecPlan.
  - Changing `.github/workflows/release.yml`, release evidence scripts, or release proof summary validators.
---

# Shipping Evidence Release Evidence Truthfulness Planning Brief 4

Create the next child ExecPlan for release evidence truthfulness. This slice should make protected tag evidence derive hosted proof from the summary artifacts produced by `Production Release Proof` and `Convex Production Deploy`, rather than from same-commit check-run names alone.

The problem to close is not that production proof is absent. The problem is that `.github/workflows/release.yml` currently maps check-run conclusions by name. A successful `deploy` job can mean Convex deploy, dry-run, or skip unless the summary artifact is inspected. A skipped `billing_integration` job can be valid only when production proof says the release was not billing-sensitive. The release evidence must not compose unrelated check runs or hide skipped required provider work.

Use the existing summary artifact contracts. `production-release-proof-summary` records `billingSensitive`, `convexSensitive`, `defaultShip`, and `billingIntegration`. `convex-production-deploy-summary` records `deployMode` and Convex proof. Add a production summary validator beside the existing Convex validator, and add collection logic that downloads same-commit artifact summaries for the tag target. Derive `vercel`, `auth`, `entitlement`, and `billing` from the production summary. Derive Convex as `passed` only when production proof says Convex was sensitive and the same-commit Convex summary proves `deployMode: deploy`; otherwise use `not_required` when production proof says Convex was not sensitive.

Keep this as a tag-release evidence slice. Do not add new provider checks or change production proof behavior unless the evidence collector exposes a real impossible state. Do not move hosted proof into PR CI. Update release docs to say tag evidence consumes proof summaries and fails closed on missing, mismatched, skipped-required, or corrupt summaries.

The result should answer: which workflow run produced each release proof state, which summary artifact was validated, why billing or Convex was `passed` or `not_required`, and which cases block publish.
