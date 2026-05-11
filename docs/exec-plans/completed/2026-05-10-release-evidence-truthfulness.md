---
title: Release Evidence Truthfulness
status: complete
created_at: 2026-05-10
completed_at: 2026-05-10
summary: Make protected tag release evidence consume production proof summary artifacts instead of loose check-run conclusions.
post_build_recap: Tag release evidence now downloads same-commit production proof summaries from push or manual proof runs, derives hosted proof from validated artifacts, preserves proof run ids, URLs, and notes, and refuses to treat active, skipped, or failed required billing or Convex work as passed.
program_id: shipping-evidence-hardening
planning_brief: docs/programs/completed/2026-05-09-shipping-evidence-hardening/planning-brief-4.md
read_when:
  - Resuming release evidence truthfulness work.
  - Changing tag release evidence collection, proof summary validators, or release workflow publication gates.
---

# Release Evidence Truthfulness

This is a living execution plan for the release evidence truthfulness slice of Shipping Evidence Hardening.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

A protected release tag should attest the actual hosted proof for the tagged `main` commit. The current tag workflow can summarize check-run conclusions by job name, which is too weak for release evidence: a Convex job can succeed while skipping deploy, and a billing job can be skipped for valid or invalid reasons unless the production proof summary says whether billing was required.

After this slice, `.github/workflows/release.yml` downloads same-commit proof summary artifacts, validates their schema and commit identity, derives proof states from those artifacts, and passes run ids, URLs, statuses, and notes into `release-evidence.v1`. The production proof summary may come from the latest same-commit successful push run or manual proof run after that run completes, so a manual `force_billing` proof can be release authority without letting an older push summary hide it. A skipped or failed Convex production deploy cannot become `passed`, and skipped billing can become `not_required` only when the selected production proof summary says the release was not billing-sensitive.

## Progress

- [x] 2026-05-10: Created Planning Brief 4 and this child ExecPlan.
- [x] 2026-05-10: Added production proof summary validation and artifact-derived proof-state helpers.
- [x] 2026-05-10: Changed tag release workflow to collect same-commit proof summary artifacts instead of check-run conclusions.
- [x] 2026-05-10: Extended release evidence CLI support for artifact-derived run ids, URLs, and notes.
- [x] 2026-05-10: Added focused tests and updated release docs.
- [x] 2026-05-10: Ran focused tests, workflow YAML validation, docs/plan/program validation, format check, lint, typecheck, and updated the parent Program.

## Surprises & Discoveries

- 2026-05-10: Existing Convex summary validation already rejects wrong commit, non-`deploy` mode, and non-passed Convex proof. The tag workflow simply bypasses it today.
- 2026-05-10: The production proof summary contains the release-scope facts needed to decide whether skipped billing or skipped Convex is acceptable.

## Decision Log

Decision: Make tag evidence consume summary artifacts before adding new evidence schema fields.
Rationale: `release-evidence.v1` already has proof status, run id, URL, and notes fields. The missing piece is truthful source data, not a schema migration.
Date: 2026-05-10

Decision: Treat missing or corrupt summary artifacts as collection failures.
Rationale: A release tag without valid same-commit proof artifacts cannot truthfully attest hosted proof. Failing the tag workflow is clearer than manufacturing an ambiguous evidence document.
Date: 2026-05-10

## Outcomes & Retrospective

This plan is complete. `.github/workflows/release.yml` now calls `scripts/release/collect-hosted-proof-summaries.mjs` instead of mapping commit check-run names. The collector downloads the latest same-commit successful `production-release-proof-summary` from either push or manual production proof runs after that run completes, derives Vercel, auth, entitlement, billing, and release-scope proof from the selected summary, and downloads `convex-production-deploy-summary` only when production proof says the release was Convex-sensitive. `release-evidence.v1` now preserves artifact-derived run ids, URLs, and notes for each hosted proof field.

The next Program slice remains generated customer repo proof.

## Context and Orientation

The tag release workflow is `.github/workflows/release.yml`. It currently validates `release.json`, collects hosted proof, builds `release-evidence.v1`, builds release notes, and publishes a GitHub Release for protected `v*` tags.

Production proof writes `production-release-proof-summary.json` as artifact `production-release-proof-summary`. Convex production deploy writes `convex-production-deploy-summary.json` as artifact `convex-production-deploy-summary`.

Release evidence is built by `scripts/release/build-release-evidence.mjs` and validated by `scripts/release/lib/release-evidence.mjs`.

### In Scope

This plan covers production proof summary validation, artifact-derived proof-state collection, release workflow wiring, release evidence CLI metadata options, focused tests, and release docs.

### Out Of Scope

This plan does not change production proof behavior, Vercel deployment waiting, Stripe webhook preflight, or generated customer repo validation. It does not add provider checks to PR CI.

## Plan of Work

First, add `scripts/release/lib/production-release-proof-summary.mjs`. It should validate summary schema, workflow name, `environment: production`, matching commit, proof object shape, and derive proof states for Vercel, auth, entitlement, and billing. Billing is `passed` only when `billingSensitive=true` and `billingIntegration=success`; it is `not_required` only when `billingSensitive=false`.

Second, extend Convex summary handling with a proof-state helper that returns `passed` only for same-commit `deployMode: deploy` plus passed Convex proof when Convex is required, and `not_required` when production proof says Convex was not sensitive.

Third, add a release-owned collector script or workflow step that uses `gh run list` and `gh run download` to fetch the latest same-commit `production-release-proof-summary` from production proof push or manual runs once that latest run is complete and, when Convex-sensitive, `convex-production-deploy-summary`. The collector writes `auth_status`, `billing_status`, `convex_status`, `entitlement_status`, `vercel_status`, plus matching `*_run_id`, `*_url`, and `*_notes` outputs.

Fourth, update `build-release-evidence.mjs` so those run ids, URLs, and notes are preserved in `release-evidence.v1`.

Fifth, update `.github/workflows/release.yml` to call the collector and remove the check-runs API mapping. Update release docs to explain artifact-derived evidence.

## Milestones

Milestone 1 is validator coverage. It is complete when production and Convex summary helpers prove success, wrong commit, skipped-required, and not-required cases.

Milestone 2 is workflow integration. It is complete when `release.yml` downloads proof summary artifacts and no longer calls the commit check-runs API to infer hosted proof.

Milestone 3 is evidence metadata. It is complete when `release-evidence.v1` records proof run ids, URLs, and notes from the artifacts.

## Concrete Steps

Inspect before editing:

    sed -n '1,340p' .github/workflows/release.yml
    sed -n '1,260p' scripts/release/build-release-evidence.mjs
    sed -n '1,260p' scripts/release/lib/release-evidence.mjs
    sed -n '1,220p' scripts/release/lib/convex-production-deploy-summary.mjs

Observed focused validation:

    bun run --cwd apps/web test:unit -- tests/unit/release-evidence.test.ts tests/unit/production-release-proof-summary.test.ts tests/unit/convex-production-deploy-summary.test.ts tests/unit/release-workflow.test.ts
    # Test Files  4 passed (4)
    # Tests  20 passed (20)

    ruby -e 'require "yaml"; YAML.load_file(ARGV[0]); puts "ok"' .github/workflows/release.yml
    # ok

Observed docs and Program validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-10-release-evidence-truthfulness.md
    # passed before this plan was moved to completed

    bun run programs:lint
    # passed

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-10-release-evidence-truthfulness.md docs/programs/completed/2026-05-09-shipping-evidence-hardening .github/workflows/README.md docs/release-workflow.md
    # passed before this plan was moved to completed

Observed broader gates:

    bun run format:check
    # passed

    bun lint
    # passed

    DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun typecheck
    # passed

## Validation and Acceptance

This plan is accepted because tag release evidence for a protected tag cannot mark Vercel, auth, entitlement, billing, or Convex proof as passed unless a same-commit production proof summary artifact supports that claim. Same-commit manual production proof reruns are considered alongside push proof runs, so a manual forced billing proof can supersede an older push summary; if that newer run is still active, evidence collection fails closed. Convex-sensitive releases also validate the same-commit Convex deploy summary. Non-billing or non-Convex releases can record `not_required` only from production proof release-scope facts.

### Test Commands

Run these before marking the plan complete:

    bun run --cwd apps/web test:unit -- tests/unit/release-evidence.test.ts tests/unit/production-release-proof-summary.test.ts tests/unit/convex-production-deploy-summary.test.ts tests/unit/release-workflow.test.ts
    ruby -e 'require "yaml"; YAML.load_file(ARGV[0]); puts "ok"' .github/workflows/release.yml
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-10-release-evidence-truthfulness.md
    bun run programs:lint

## Idempotence and Recovery

The collector is read-only against GitHub Actions. Re-running it downloads artifacts into a temporary directory and writes GitHub outputs. If summary collection fails, rerun or repair the underlying `Production Release Proof` or `Convex Production Deploy` run for the exact tag target commit rather than weakening evidence collection.

## Artifacts and Notes

Read-only subagent findings that shaped this plan:

    release.yml currently maps check-run names instead of summary artifacts.
    Convex deploy check success can hide deployMode skip.
    Billing skip is only valid when production proof says billingSensitive=false.
    Existing release-evidence proof fields can carry run id, URL, and notes without a schema migration.

Key files:

    .github/workflows/release.yml
    scripts/release/build-release-evidence.mjs
    scripts/release/lib/release-evidence.mjs
    scripts/release/lib/convex-production-deploy-summary.mjs
    scripts/release/lib/production-release-proof-summary.mjs

## Interfaces and Dependencies

This plan depends on GitHub Actions, the GitHub CLI in Actions, the `GITHUB_TOKEN` with `actions: read` permission, production proof summary artifact names, Convex deploy summary artifact names, protected release tags, `release.json`, and the existing `release-evidence.v1` schema.
