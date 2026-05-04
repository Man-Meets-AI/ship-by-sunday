# Dependency Graph

## Workstreams

- Current proof surface inventory and required-check truth
- Release identity, tag policy, and version source of truth
- Hosted release evidence for Vercel, Convex, billing, auth, and entitlement
- Release-critical helper relocation out of disposable QA surfaces
- Helper CLI retirement
- QA control-plane and browser harness retirement
- Source-level test preservation and replacement proof
- Branch, PR, CODEOWNERS, and GitHub automation policy
- Docs cleanup and historical archive classification

## Dependency Order

1. Inventory and reconcile the current proof surface.
2. Define release identity, protected tag policy, and version source of truth.
3. Decide the hosted release strategy: deploy the tagged SHA or attest an already deployed SHA.
4. Relocate or replace release-critical helpers currently under `qa/scripts`.
5. Reshape CI and release workflows around the chosen release identity and hosted proof.
6. Retire the helper CLI after scripts, CI, branch protection, docs, and tests are unwired.
7. Replace broad QA/browser harness proof with source-level and release-scoped hosted proof.
8. Demote or delete disposable QA control-plane files and QA-specific agents.
9. Add or refine branch, PR, CODEOWNERS, and GitHub automation policy.
10. Clean public/internal docs and historical archives after the operating model is stable.

## Why This Order

Current proof surface inventory must happen first because the Program already found a mismatch between protected checks and release-gate reality. If this is skipped, later workflow edits can preserve stale required contexts, delete the wrong checks, or leave GitHub branch protection blocking merges on removed jobs.

Release identity and version truth must come before tag-driven workflow implementation. A protected tag workflow cannot be meaningful until the Program chooses the tag pattern and the file or manifest that owns version truth.

The hosted release strategy must come before release workflow replacement. SBS must decide whether a tag deploys the exact SHA to Vercel and Convex or attests a SHA already deployed from `main`. If this order is reversed, release jobs may publish GitHub Releases for commits that do not match production.

Release-critical helper relocation must come before QA deletion. `qa/scripts` currently contains release triage, release snapshot, Vercel, Convex, billing, and engineering-intake behavior. Deleting or demoting QA before this relocation breaks release proof.

CI and release workflow reshaping depends on release identity and hosted proof decisions. The workflows need to know which tag starts the release, which SHA is deployed, which hosted checks prove readiness, and which artifacts are gathered before publication.

Helper CLI retirement can happen after the required-check and command surfaces are unwired. The CLI is not an upstream dependency of generated starter output, but it is still wired into root `check`, the `cli` CI job, `bin/sbs`, release docs, public docs, and branch-protection expectations.

Browser harness replacement must happen before QA browser/e2e deletion. The Program identified replacement gaps for robots/sitemap, signed-out `/codebase`, entitled `/codebase -> /review -> /settings`, checkout success, and metadata/noindex behavior. Removing harness files first loses proof.

Disposable QA deletion follows release-helper relocation and replacement proof. Once release-critical helpers and test-critical browser proof no longer depend on `qa/`, QA journey, coverage, inventory, run reports, run-pack scripts, and QA-specific agent prompts can be removed or archived.

Branch, PR, CODEOWNERS, and GitHub automation can land after the core release model is clear. These surfaces help reduce process friction, but they should not define release mechanics before the Program settles tag, branch, hosted proof, and required-check truth.

Docs cleanup should come after the operating model is stable. Public docs, `docs/release-workflow.md`, `qa/README.md`, `apps/web/content/docs`, `docs/codex`, and AGENTS surfaces should describe the actual final model, not an intermediate migration state.

## Unsafe Orders To Avoid

Do not delete `qa/` before release-critical helpers are relocated or replaced. That order breaks release triage, snapshot/reconcile behavior, Vercel/Convex helpers, billing proof, engineering-intake exports, tests, and root scripts.

Do not delete browser-smoke or e2e harness files before replacement proof exists. That order removes route, auth, checkout, entitlement, robots/sitemap, and metadata proof before source or hosted release checks cover it.

Do not delete the helper CLI before unwiring `package.json`, `.github/workflows/ci.yml`, `bin/sbs`, docs, lockfile state, tests, and GitHub branch protection. That order turns a conceptually valid retirement into an immediate CI break.

Do not build a tag release workflow before choosing deploy-versus-attest and version source of truth. That order creates release tags without trustworthy production identity.

Do not add CODEOWNERS or required checks before deciding ownership and workflow names. That order can create permanent review bottlenecks or blocked PRs on stale job names.

Do not collapse CLI deletion, QA deletion, CI replacement, and tag release into one implementation slice. That order hides dependencies and makes validation too broad to be meaningful.

Do not copy Codex's Bazel, Rust, npm, DotSlash, WinGet, or signing details into SBS as a default. That order adds irrelevant machinery before solving the hosted-product release problem.

Do not treat `docs/codex` cleanup as the main migration. Historical docs cleanup is downstream of the actual operating model and should not distract from release correctness.

## Proposed Plan Boundaries

One ExecPlan should own current proof inventory and required-check reconciliation. It should stop after the repo knows which workflows, required contexts, branch protections, tag rules, and orphaned remote workflows are real. It should not delete QA, CLI, or tests.

One ExecPlan should own release identity and hosted tag design. It should choose the tag pattern, version source, deploy-versus-attest model, and release evidence contract. It should stop before moving scripts or deleting old workflows.

One ExecPlan should own release-helper relocation. It should move or replace only release-critical helpers currently trapped under `qa/scripts`, including release triage, Vercel/Convex, billing, and intake contracts. It should stop before deleting QA journey and run-pack surfaces.

One ExecPlan should own CI and release workflow replacement. It should implement always-visible required checks, tag-triggered or tag-attested release proof, hosted Vercel/Convex/billing proof, release artifacts, and branch/tag protection alignment. It should stop before CLI deletion and broad QA deletion.

One ExecPlan should own helper CLI retirement. It should unwire root scripts, CI job, branch-protection references, `bin/sbs`, package files, tests, lockfile entries, and public docs. It should preserve or move any selected non-CLI draft/generation behavior.

One ExecPlan should own test and browser-proof migration. It should preserve source-level tests, remove stale tests, add replacement source or release-scoped proof for identified gaps, and only then remove browser harness artifacts.

One ExecPlan should own QA control-plane retirement. It should remove or archive journeys, coverage, test inventory, run reports, run-pack scripts, QA-specific `.codex` agents, and `qa-team` skill references after release and test dependencies are gone.

One ExecPlan should own GitHub policy and automation. It should add or refine PR/issue templates, `.github/codex` prompts, issue labeler/deduplicator workflows, minimal CODEOWNERS, and branch/tag rules documentation after the core release model is implemented or at least fixed enough to name accurately.

One ExecPlan should own final docs and archive cleanup. It should update `docs/release-workflow.md`, `README.md`, `apps/web/content/docs`, AGENTS files, `qa/README.md` or its replacement, and `docs/codex` archive classification after the implementation slices have made the new operating model real.
