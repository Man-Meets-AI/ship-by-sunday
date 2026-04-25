---
title: Repair Release Intake Control Plane
status: active
created_at: 2026-04-23
completed_at: null
summary: Make release triage, release intake, runtime intake, and QA evidence truthful after the rejected Dub-style CI/CD path is retired.
post_build_recap: null
read_when:
  - Resuming release or intake control-plane repair.
  - Validating release triage, release intake, or runtime intake exports.
  - Executing the second recovery slice after CI/CD harness retirement.
program_id: sbs-codebase-recovery
planning_brief: docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-2.md
---

# Repair Release Intake Control Plane

This is a living execution plan. Keep it current as implementation, proof, and discoveries change the release and intake control-plane repair path.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The release and intake layer should tell a maintainer whether the current Ship by Sunday work is safe to ship. Right now that layer has concrete correctness risks: blocker slugs can normalize incorrectly, documented triage flags can miss the fields the collector reads, runtime intake can group unrelated incidents together, and QA evidence maps new intake tests too generically. The visible outcome of this plan is that release and runtime intake exports produce stable, specific evidence after the rejected Dub-style CI/CD path has been retired.

This plan is the second child slice of the Program packet at `docs/programs/active/2026-04-23-sbs-codebase-recovery/`, currently governed by `planning-brief-2.md`.

## Progress

- [x] 2026-04-23 EDT: Reviewed Worker Program syntax, Ship by Sunday `docs/exec-plans/PLANS.md`, and the current dirty release/intake worktree.
- [x] 2026-04-23 EDT: Identified this as the first recovery slice because control-plane evidence gates the rest of the work.
- [x] 2026-04-23 EDT: Grilled the plan against the live release intake, release triage, runtime intake, QA inventory, and active Dub-style harness-plan surfaces.
- [x] 2026-04-24 EDT: Reordered this plan to the second recovery slice after the user rejected the Dub-style CI/CD harness direction and made CI/CD path codification the first slice.
- [x] 2026-04-24 EDT: Re-grilled this plan after the CI/CD harness retirement slice completed, and tightened release triage, generated-at parsing, product-aware runtime identity, QA scenario mapping, and stale CI/CD boundaries before implementation.
- [x] 2026-04-24 EDT: Deferred implementation to a dedicated release/intake Program because this control-plane work is larger than the current recovery sequence should absorb.
- [ ] Fix release intake blocker slug normalization and add edge-case tests.
- [ ] Fix release triage option normalization so documented flags populate the fields the collector reads.
- [ ] Add product-aware runtime intake grouping and tests.
- [ ] Map intake tests to specific QA evidence rows instead of generic content coverage.
- [ ] Run focused validation, plan lint, markdown lint, and repo-level closeout checks.

## Surprises & Discoveries

`qa/scripts/lib/release-intake-export.mjs` contains a broken slug-normalization chain in `slugify`. Treat any previous green intake-test result as stale until the focused release-intake tests are rerun in this checkout. The tests also do not yet cover leading punctuation, trailing punctuation, or long blocker names, so the edge-case defect can survive even after the syntax-level repair.

The active Dub-style CI/CD harness plan has been rejected as the first recovery correction. Do not use this release/intake plan to implement or retire that harness direction; the dedicated first slice owns that.

Ship by Sunday's ExecPlan linter accepts paired `program_id` and `planning_brief` frontmatter for Program-owned child plans. This plan now records its Program provenance in frontmatter and keeps the body prose as human-readable context.

`qa/scripts/lib/release-triage-source.mjs` currently parses documented kebab-case flags literally, such as `--base-ref` into `options["base-ref"]`, while `collectReleaseTriageSummary` reads underscore keys such as `options.base_ref`. That means the documented operator flags can be silently ignored unless the parser normalizes option names before returning.

`apps/web/features/observability/export/runtime-intake.mjs` currently groups runtime incidents by environment, source, surface, code, and canonical path. It does not include `incident.product`, and `buildRuntimeIntakeIdentity` in `qa/scripts/lib/engineering-intake-contract.mjs` also omits product, so two products with the same runtime shape can collapse into one downstream identity.

The completed CI/CD correction slice is now the source of truth for workflow direction. This plan must not read the retired Dub-style plan as active guidance, and it must not replace `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, or `.github/workflows/convex-production-deploy.yml`.

The 2026-04-24 grill found one parser coupling that the original plan missed. `qa/scripts/export-release-intake.mjs` currently reads `options["generated-at"]`, so normalizing all long option keys from kebab-case to snake_case in `parseReleaseTriageArgs` will break deterministic generated timestamps unless the release-intake command is updated to read `options.generated_at`.

The same grill found one release-triage boundary worth making explicit. `collectReleaseTriageSummary` still gets the release pull request through `gh pr list` and `gh pr view`, which have historically depended on GitHub metadata transport that can fail independently from option parsing. This plan's release-triage implementation must fix the documented flag normalization bug and add direct coverage for it. It should not claim to solve every GitHub metadata transport failure unless the implementer also adds a repo-local REST PR helper and focused tests in this same plan update.

## Decision Log

Decision: Repair the current dirty release and intake work before runtime or product refactors.
Rationale: A misleading release/intake surface can make every later slice look safer than it is.
Date: 2026-04-23

Decision: Keep this slice control-plane only.
Rationale: Product runtime fixes have separate plans. This plan should repair release evidence and planning truth without changing user-facing product behavior.
Date: 2026-04-23

Decision: Remove Dub-style harness retirement from this slice.
Rationale: The user corrected the Program order on 2026-04-24. A dedicated first slice now owns retiring the rejected CI/CD harness direction and codifying the proven remote workflow path.
Date: 2026-04-23

Decision: Runtime intake identity must be product-aware anywhere grouping is product-aware.
Rationale: Adding `product` only to the grouping key would still let different product groups emit the same `externalId` and `dedupeKey`. The implementation should include a normalized product discriminator in the runtime identity payload or explicitly stop and revise this plan if that would require a versioned contract migration.
Date: 2026-04-23

Decision: Keep the CI/CD correction completed and out of this implementation slice.
Rationale: The completed first child slice already retired the rejected Dub-style harness direction and codified the proven workflow path. This plan should consume that result as a boundary, not reopen workflow design or repair nightly/deployment-smoke lanes.
Date: 2026-04-24

Decision: Treat product-aware runtime identity as a v1-compatible corrective identity change with explicit fixture proof.
Rationale: The v1 compatibility policy allows additive fields, and `sourceContext.runtime.product` is additive. The `externalId` and `dedupeKey` values will change for runtime items because the old identity was missing a required discriminator, so the implementation must update the stable identity test and checked-in fixtures in the same milestone rather than leaving old and new identity semantics mixed.
Date: 2026-04-24

Decision: Add explicit QA scenario IDs for engineering intake evidence instead of hiding intake tests under `CONTENT-01`.
Rationale: The current generated inventory rows for intake tests default to generic content coverage. Release and runtime intake are control-plane evidence surfaces, so `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv` need specific rows that a future QA review can interpret.
Date: 2026-04-24

Decision: Defer implementation to a dedicated release/intake Program.
Rationale: The release triage, intake export, runtime intake grouping, and QA inventory contracts form a larger control-plane repair than this recovery Program should execute next. Keep this plan as the scoped implementation contract, but do not start it until the dedicated Program owns the lane.
Date: 2026-04-24

## Outcomes & Retrospective

This plan is active but implementation is deferred. Fill this section after the dedicated release/intake Program resumes implementation with the exact release/intake behavior that changed and the commands that passed.

## Context and Orientation

The current release and intake work is spread across `qa/scripts/`, `qa/scripts/lib/`, `apps/web/features/observability/export/`, `apps/web/scripts/`, `apps/web/tests/unit/`, `qa/test-inventory.csv`, `qa/README.md`, and `docs/release-workflow.md`. The current dirty worktree already contains untracked export scripts, fixtures, and tests. Do not revert or overwrite unrelated dirty work.

Release intake is the export path that turns release blockers into engineering-intake items. Runtime intake is the export path that turns observability incidents into engineering-intake items. Release triage is the operator command that inspects the current release candidate and reports whether metadata, proof, or branch state blocks promotion.

The exact code seams for this slice are:

- `qa/scripts/lib/release-intake-export.mjs`, especially `slugify`, `classifyReleaseBlocker`, and `buildReleaseIntakeItems`.
- `qa/scripts/lib/release-triage-source.mjs`, especially `parseReleaseTriageArgs`, `collectReleaseTriageSummary`, `readReleasePullRequest`, and `writeReleaseTriageSummary`.
- `qa/scripts/export-release-intake.mjs`, especially the generated timestamp option read after `parseReleaseTriageArgs` starts returning snake_case keys.
- `apps/web/features/observability/export/runtime-intake.mjs`, especially `buildRuntimeGroupingKey`, `buildRuntimeIntakeItem`, and the runtime context emitted under `sourceContext.runtime`.
- `qa/scripts/lib/engineering-intake-contract.mjs`, especially `buildRuntimeIntakeIdentity`, `assertRuntimeItem`, runtime fixture validation, and the `runtime-intake.v1` compatibility policy.
- `apps/web/tests/unit/release-intake-export.test.ts`, `apps/web/tests/unit/release-triage.test.ts`, `apps/web/tests/unit/runtime-intake-export.test.ts`, `apps/web/tests/unit/engineering-intake-contract.test.ts`, `apps/web/tests/unit/engineering-intake-snapshot.test.ts`, `apps/web/tests/unit/export-release-intake-command.test.ts`, and `apps/web/tests/unit/export-runtime-intake-command.test.ts`.
- `qa/fixtures/engineering-intake/runtime-intake.v1.json` and `qa/fixtures/engineering-intake/engineering-intake.snapshot.v1.json` if product-aware runtime identity changes the checked-in runtime fixture.
- `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv` for the QA evidence mapping.

### In Scope

In scope is fixing release intake blocker ID normalization, adding tests for blocker edge cases, normalizing release triage CLI options, ensuring runtime intake grouping and identity include product identity, and updating or adding QA inventory and coverage rows for the intake tests.

### Out Of Scope

Out of scope is changing product runtime behavior, deleting the QA control plane wholesale, redesigning GitHub workflows, changing Vercel deployments, retiring the Dub-style harness plan, or implementing the later runtime, route, blueprint, observability-storage, or design cleanup plans.

## Plan of Work

Start with the narrowest bug. Add failing tests around `qa/scripts/lib/release-intake-export.mjs` through `apps/web/tests/unit/release-intake-export.test.ts` for punctuation-heavy blocker text, trailing punctuation, leading punctuation, long blocker text, and duplicate-looking metadata blockers. Fix `slugify` so it lowercases, replaces non-alphanumerics, trims leading and trailing underscores, and caps the result deterministically after trimming. The current implementation has a broken transformation chain in `slugify`; repair the chain rather than adding a fallback that hides bad inputs.

Then fix release triage option normalization in `qa/scripts/lib/release-triage-source.mjs`. Add a small normalizer inside or next to `parseReleaseTriageArgs` that converts long option keys from kebab-case to snake_case before returning, so documented flags populate the exact option names that `collectReleaseTriageSummary` reads. Add parser tests in `apps/web/tests/unit/release-triage.test.ts` for `--base-ref`, `--head-ref`, `--base-branch`, `--head-branch`, `--alias-domain`, `--vercel-environment`, `--billing-github-environment`, `--github-environment`, `--qa-env-file`, `--vercel-project-id`, `--vercel-team-id`, `--vercel-token`, `--output`, and `--generated-at`. Include both `--flag value` and `--flag=value` forms for at least one token-like option so the operator path cannot silently regress. Update `qa/scripts/export-release-intake.mjs` so it reads `options.generated_at` after the parser changes, and add or extend `apps/web/tests/unit/export-release-intake-command.test.ts` to prove `--generated-at` controls the exported document timestamp.

Next update runtime intake grouping. Define one product normalizer and use it consistently for grouping, identity, source context, and tags. The normalized value should trim whitespace, lowercase, replace non-alphanumeric runs with underscores, trim leading and trailing underscores, and fall back to `unknown_product` only when the incoming product is missing or normalizes to an empty string. Include that normalized product in `buildRuntimeGroupingKey` in `apps/web/features/observability/export/runtime-intake.mjs`, include it in the stable payload passed to `buildRuntimeIntakeIdentity`, emit it under `sourceContext.runtime.product`, and include it in `rawTags` so the exported record remains inspectable. Add tests in `apps/web/tests/unit/runtime-intake-export.test.ts` that prove two incidents with the same environment, source, surface, code, and canonical path but different products produce two items with different `externalId` and `dedupeKey` values. Add or update contract tests in `apps/web/tests/unit/engineering-intake-contract.test.ts` so `assertRuntimeIntakeFeed` requires `sourceContext.runtime.product` on runtime items after the repair. Update `qa/fixtures/engineering-intake/runtime-intake.v1.json` and `qa/fixtures/engineering-intake/engineering-intake.snapshot.v1.json` in the same milestone because the stable runtime digest is expected to change.

After the code-level fixes, update the QA evidence map. Run `bun run qa:inventory:sync` first so any genuinely new test files are seeded, then manually curate the rows instead of accepting generic `CONTENT-01` defaults. Add two narrowly scoped journey rows if they do not already exist: `RELEASE-INTAKE-01` for release triage and release-intake export correctness, and `RUNTIME-INTAKE-01` for runtime-intake export and engineering-intake snapshot correctness. Add matching `qa/coverage.csv` rows for the focused intake tests. Update `qa/test-inventory.csv` so `apps/web/tests/unit/release-intake-export.test.ts`, `apps/web/tests/unit/release-triage.test.ts`, and `apps/web/tests/unit/export-release-intake-command.test.ts` map to `RELEASE-INTAKE-01`, and `apps/web/tests/unit/runtime-intake-export.test.ts`, `apps/web/tests/unit/engineering-intake-contract.test.ts`, `apps/web/tests/unit/engineering-intake-snapshot.test.ts`, and `apps/web/tests/unit/export-runtime-intake-command.test.ts` map to `RUNTIME-INTAKE-01` or `RUNTIME-INTAKE-01|OBS-01` as appropriate. Then run `bun run qa:inventory:check`; because that command rewrites `qa/test-inventory.csv` before diffing it, stop and inspect `git diff -- qa/test-inventory.csv` if it changes any curated row.

After the code-level fixes, keep this plan aligned with the completed CI/CD correction slice. Do not edit or execute the rejected Dub-style harness plan from this slice; the completed first slice at `docs/exec-plans/completed/2026-04-24-retire-dub-style-harness-and-codify-cicd.md` retired it and codified the proven release path.

## Milestones

Milestone 1 fixes release intake blocker IDs. At the end of this milestone, malformed blocker labels and long labels produce stable normalized IDs, duplicate-looking metadata blockers do not produce surprising empty or punctuation-wrapped keys, and focused unit tests prove the edge cases.

Milestone 2 fixes release triage flag normalization. At the end of this milestone, documented CLI flags and collector option names agree, parser tests prove the operator-facing command does not silently ignore kebab-case flags, and the release-intake export command still honors deterministic `--generated-at` timestamps after parser normalization. This milestone does not replace GitHub PR metadata transport unless implementation proof shows that transport failure is part of this same defect.

Milestone 3 fixes runtime intake grouping. At the end of this milestone, runtime incidents from different products do not collapse into one engineering-intake item, product identity is visible in the runtime source context and raw tags, identity digests are product-aware, checked-in fixtures match the new digest, and export plus contract tests prove the separation.

Milestone 4 fixes QA evidence truth. At the end of this milestone, QA journeys, coverage, and inventory point at real release-intake and runtime-intake evidence, `qa:inventory:check` is idempotent, and this plan clearly depends on the completed first CI/CD correction slice instead of owning it.

Milestone 5 validates the slice. At the end of this milestone, focused tests, plan lint, markdown lint, and repo quality checks have passed or any unrelated blocker is recorded with exact output.

## Concrete Steps

1. Confirm the starting dirty state without cleaning it:

       cd /Users/parkerrex/Developer/ship-by-sunday
       git status --short

2. Add release intake tests in `apps/web/tests/unit/release-intake-export.test.ts` for punctuation-heavy blocker text, long blocker text, leading punctuation, trailing punctuation, and duplicate-looking blocker text. Exercise the public export builder instead of exporting `slugify` just for tests.

3. Fix `qa/scripts/lib/release-intake-export.mjs` so slug normalization actually chains every intended transformation before returning.

4. Add parser tests in `apps/web/tests/unit/release-triage.test.ts` for documented release triage flags. Then fix `parseReleaseTriageArgs` in `qa/scripts/lib/release-triage-source.mjs` so kebab-case flags reach the collector's snake_case fields.

5. Update `qa/scripts/export-release-intake.mjs` and `apps/web/tests/unit/export-release-intake-command.test.ts` so `--generated-at` still controls the document timestamp after `parseReleaseTriageArgs` returns snake_case keys.

6. Add runtime intake tests that create two incidents with the same environment/source/surface/code/path but different product values. Then update the export grouping in `apps/web/features/observability/export/runtime-intake.mjs` and the runtime identity plus runtime assertion contract in `qa/scripts/lib/engineering-intake-contract.mjs`. Update the engineering-intake fixtures and snapshot tests in the same commit or work slice because the runtime identity digest is expected to change.

7. Run `bun run qa:inventory:sync`, then update `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv` so the tests are mapped to `RELEASE-INTAKE-01` and `RUNTIME-INTAKE-01` evidence instead of broad content coverage. Run `bun run qa:inventory:check` after this edit; if it rewrites unrelated rows, stop and inspect the diff before continuing.

8. Run focused tests:

       cd /Users/parkerrex/Developer/ship-by-sunday
       PATH="$HOME/.bun/bin:$PATH" bun run qa:inventory:sync
       PATH="$HOME/.bun/bin:$PATH" bun run --cwd apps/web test:unit -- tests/unit/release-intake-export.test.ts tests/unit/release-triage.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts tests/unit/engineering-intake-snapshot.test.ts tests/unit/export-release-intake-command.test.ts tests/unit/export-runtime-intake-command.test.ts
       PATH="$HOME/.bun/bin:$PATH" bun run qa:inventory:check
       PATH="$HOME/.bun/bin:$PATH" bun run qa:validate

9. Run plan and docs validation:

       cd /Users/parkerrex/Developer/ship-by-sunday
       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md
       PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md
       git diff --check

10. Run the repository closeout checks required by `AGENTS.md`:

       cd /Users/parkerrex/Developer/ship-by-sunday
       PATH="$HOME/.bun/bin:$PATH" bun run format
       PATH="$HOME/.bun/bin:$PATH" bun run lint
       PATH="$HOME/.bun/bin:$PATH" bun run typecheck

## Validation and Acceptance

This slice is complete when release intake produces stable blocker IDs for malformed labels, release triage documented flags reach the collector, runtime intake keeps product-separated incidents distinct, and QA evidence maps the new tests to specific release/runtime intake coverage.

Acceptance for release intake means metadata and release-path blockers with leading punctuation, trailing punctuation, repeated separators, and long text produce non-empty blocker keys that are trimmed, lowercased, underscore-separated, and capped after trimming. Acceptance for release triage means every documented long flag reaches the same snake_case field that `collectReleaseTriageSummary` reads, and `--generated-at` still reaches the release-intake export document timestamp. Acceptance for runtime intake means two otherwise identical incidents with different `product` values produce two export items, two distinct identities, source context that names the normalized product, and checked-in fixture evidence that validates against `runtime-intake.v1`. Acceptance for QA evidence means the intake tests no longer sit under generic `CONTENT-01` rows and `qa:validate` can resolve the new scenario mappings.

### Test Commands

Run these commands from `/Users/parkerrex/Developer/ship-by-sunday`:

       PATH="$HOME/.bun/bin:$PATH" bun run --cwd apps/web test:unit -- tests/unit/release-intake-export.test.ts tests/unit/release-triage.test.ts tests/unit/runtime-intake-export.test.ts tests/unit/engineering-intake-contract.test.ts tests/unit/engineering-intake-snapshot.test.ts tests/unit/export-release-intake-command.test.ts tests/unit/export-runtime-intake-command.test.ts
       PATH="$HOME/.bun/bin:$PATH" bun run qa:inventory:sync
       PATH="$HOME/.bun/bin:$PATH" bun run qa:inventory:check
       PATH="$HOME/.bun/bin:$PATH" bun run qa:validate
       PATH="$HOME/.bun/bin:$PATH" bun run plans:lint -- --plan docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md
       PATH="$HOME/.bun/bin:$PATH" bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-23-repair-release-intake-control-plane.md
       git diff --check
       PATH="$HOME/.bun/bin:$PATH" bun run format
       PATH="$HOME/.bun/bin:$PATH" bun run lint
       PATH="$HOME/.bun/bin:$PATH" bun run typecheck

## Idempotence and Recovery

All fixes should be safe to rerun. Intake exports and tests should use fixtures or mocked data rather than live release or Convex state. `bun run qa:inventory:sync` is expected to rewrite `qa/test-inventory.csv` from the current test tree while preserving existing curated rows. If `bun run qa:inventory:check` rewrites unrelated rows after curation, stop and inspect `git diff -- qa/test-inventory.csv` before proceeding. If product-aware runtime identity changes existing fixture digests, update the fixture and snapshot evidence in the same slice and record the identity decision in this plan's `Decision Log`; do not leave old and new identity semantics mixed. If release triage still reports `GitHub release metadata unavailable` after the parser fix, do not mask it as an intake-export issue; either repair the GitHub PR metadata path with a focused REST helper and tests, or update this plan before continuing.

## Artifacts and Notes

Program source for this plan:

       docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-1.md
       docs/programs/active/2026-04-23-sbs-codebase-recovery/planning-brief-2.md

High-signal files from the review:

       qa/scripts/lib/release-intake-export.mjs
       qa/scripts/lib/release-triage-source.mjs
       apps/web/features/observability/export/runtime-intake.mjs
       qa/scripts/lib/engineering-intake-contract.mjs
       apps/web/tests/unit/release-intake-export.test.ts
       apps/web/tests/unit/release-triage.test.ts
       apps/web/tests/unit/runtime-intake-export.test.ts
       apps/web/tests/unit/engineering-intake-contract.test.ts
       qa/test-inventory.csv
       qa/coverage.csv

## Interfaces and Dependencies

This plan depends on Bun test execution, the current `qa:inventory:check` and `qa:validate` integrity commands, the release and runtime intake fixtures under `qa/fixtures/`, and the repository's ExecPlan and markdown linters. It must preserve the existing release and runtime intake public command surfaces unless the tests and docs are updated in the same slice. The runtime intake contract remains `runtime-intake.v1`; additive product context is allowed, but removing fields or redefining existing field meanings requires a versioned contract decision before implementation continues.
