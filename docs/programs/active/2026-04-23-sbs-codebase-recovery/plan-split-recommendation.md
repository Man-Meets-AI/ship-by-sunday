# Plan Split Recommendation

This initiative should split into seven child ExecPlans.

## Slice 1

Path: `docs/exec-plans/active/2026-04-24-retire-dub-style-harness-and-codify-cicd.md`

Goal: retire the rejected Dub-style CI/CD harness direction and codify the dev and production CI/CD path that recent remote runs prove is working.

This slice should preserve the working `Dev Staging Proof`, `CI`, `Production Release Proof`, and `Convex Production Deploy` path, and label failing or unproven lanes separately. It should not repair intake code or delete workflows.

## Slice 2

Path: `docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md`

Goal: make release triage, release intake, runtime intake, and QA evidence truthful enough to guide the rest of the recovery.

This slice should fix current dirty-work defects after the rejected harness plan is retired. It should not change product runtime behavior.

## Slice 3

Path: `docs/exec-plans/active/2026-04-23-remove-runtime-footguns.md`

Goal: remove the known runtime incident classes around observability transport, bonus lesson view tracking, Codex route imports, sitemap dependencies, and docs route behavior.

This slice should harden current runtime behavior. It should not redesign the product route contract.

## Slice 4

Path: `docs/exec-plans/active/2026-04-23-reconcile-product-route-contract.md`

Goal: make app routes, docs, QA, navigation, redirects, and post-review language agree on the current product route model.

This slice should decide what is canonical and update truth surfaces. It should not split the main blueprint controller or redesign the UI.

## Slice 5

Path: `docs/exec-plans/active/2026-04-23-split-blueprint-and-workbench-systems.md`

Goal: reduce core feature complexity by splitting the blueprint controller and consolidating repeated workbench upload and checklist behavior.

This slice should preserve visible behavior and improve testable boundaries. It should not change the route contract or launch new product capability.

## Slice 6

Path: `docs/exec-plans/active/2026-04-23-harden-observability-data-contracts.md`

Goal: make observability storage, export, and intake contracts durable and intentionally owned.

This slice should separate rollups from event occurrence truth and preserve error details. It should not change release triage logic unless a shared contract requires it.

## Slice 7

Path: `docs/exec-plans/active/2026-04-23-reduce-design-dependency-sprawl.md`

Goal: remove unused heavy visuals, standardize icon usage, and reduce design-system drift without a redesign.

This slice should be build-backed and conservative. It should not start before higher-risk correctness work is underway.
