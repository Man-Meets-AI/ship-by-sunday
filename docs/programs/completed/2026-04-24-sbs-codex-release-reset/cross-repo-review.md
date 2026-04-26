# Cross-Repo Review

## What Holds Up

The overall architecture holds up: copy Codex's operating model, not its Rust/Bazel/npm implementation. The Program correctly identifies the transferable shape as GitHub-native checks, protected tags, version validation, release evidence, narrow permissions, source-level tests, and release-scoped hosted proof.

The dependency order is sound. Required-check truth before workflow replacement is a real prerequisite, not preference. Release identity before tag automation is also a real prerequisite. Release-critical helper relocation before QA deletion is necessary because `qa/scripts` currently owns release triage, Vercel/Convex helpers, billing proof, snapshot behavior, and intake/export contracts.

The plan split keeps the most dangerous destructive actions late. CLI deletion waits until scripts, CI, branch protection, docs, tests, and lockfile state are unwired. QA control-plane retirement waits until release helpers and browser proof have replacements. That sequencing avoids the two most likely breakages: deleting a still-required check and deleting release-critical scripts as if they were QA bookkeeping.

The split preserves source-level tests rather than framing this as a test purge. That matches both the Codex test model and the SBS test inventory. The dangerous browser/e2e harness surfaces are isolated into a proof-migration plan instead of mixed into QA deletion.

The first plan is the right first plan. Reconcile Release Proof And Required Checks unlocks every later action because it establishes what GitHub, workflow files, package scripts, and remote Actions state currently require. It is not merely easy; it prevents later work from deleting or renaming surfaces GitHub still treats as required.

## What Is Still Weak

The branch model remains under-specified. The packet says SBS may move to `main`, preserve `dev`, or use a hybrid, but Plan 2 and Plan 4 need an explicit decision point before implementation. Vercel and Convex currently tracking `main` is a cross-system constraint, not just a GitHub preference.

The deploy-versus-attest choice is still the central release risk. If the workflow tags after `main` deploys, it must prove the deployed Vercel and Convex SHAs match the tag. If the workflow deploys from tags, it may need project/platform changes outside normal GitHub Actions YAML. This must be resolved before Plan 4.

The version source of truth is unresolved. The packet knows SBS does not currently have a release-grade version source, but Plan 2 must choose one. Without that, tag validation becomes ceremonial.

The destination for relocated release helpers is not settled. `scripts/release`, `.github/scripts`, `apps/web/features/observability/export`, or a package boundary have different ownership and import implications. Plan 3 cannot proceed safely until it names the target boundary and the command API it preserves.

Plan 6 may be too broad if it tries to both preserve source tests and define hosted release checks. The planning brief should require Plan 6 to preserve behavior gaps first, then decide whether hosted proof belongs inside Plan 6 or remains part of Plan 4's release workflow validation.

Plan 8 is correctly late, but CODEOWNERS could be a dependency for protected branch policy if GitHub rules require code-owner review. The current split treats CODEOWNERS as support automation. That is fine unless Plan 1 finds live or desired branch protection needs code-owner review.

Credential and QA account risk is visible but not yet assigned. If the reported QA credential reference is real, it should not wait until destructive QA cleanup if rotation is needed. The planning brief should include a conditional security checkpoint before Plan 7.

The final docs plan is late, which is correct for broad docs. But each implementation plan still needs local docs updates for behavior it changes. Plan 9 should not become the only docs writeback path.

## Corrections

Keep the nine-plan split, but add explicit decision gates to the planning brief before Plan 4: branch model, deploy-versus-attest, and version source of truth must be decided by Plan 2 and consumed by Plan 4.

Clarify Plan 3's first deliverable: it must name the owning module or script boundary for release helpers before moving code. The plan should not scatter helpers across `.github/scripts`, `scripts/release`, and app feature folders without a single ownership rule.

Clarify Plan 4's scope: it owns workflow implementation and branch/tag protection alignment, but it should not own broad source-test rewrites. It can call existing source tests and hosted proof, but test creation belongs to Plan 6 unless it is directly required for release workflow validation.

Clarify Plan 6's scope: it owns replacement proof for browser harness behavior and stale test cleanup. It should not own QA inventory deletion, but it may need to update transitional references so validation remains green until Plan 7.

Add a conditional security checkpoint before Plan 7. If Plan 1 or Plan 7 verifies real QA credentials or account secrets in tracked files, credential rotation and removal must happen before or inside the earliest safe slice, not as final cleanup.

Add an explicit rule that every implementation plan updates its own local docs surfaces. Plan 9 should be final reconciliation and archive cleanup, not a dumping ground for all documentation changes.

## Final Recommended Plan Order

1. Reconcile Release Proof And Required Checks.
2. Define Tag Release Identity And Hosted Evidence Contract.
3. Relocate Release-Critical Helpers Out Of QA.
4. Implement Codex-Shaped CI And Tag Release Workflows.
5. Retire The Helper CLI.
6. Replace Browser Harness Proof With Source And Release Proof.
7. Retire Disposable QA Control Plane.
8. Add GitHub Policy And Codex Automation.
9. Final Docs And Archive Cleanup.

If Plan 1 verifies tracked QA credentials or account secrets, insert a focused security cleanup checkpoint before Plan 7 and before any public documentation or archive work that could expose those surfaces further. If Plan 2 discovers tag-based Vercel or Convex deployment requires larger platform migration, split that platform migration before Plan 4 rather than hiding it inside workflow replacement.

## Final Recommended First Plan

Title: Reconcile Release Proof And Required Checks.

Scope: inventory and reconcile the current release proof surface across local workflow files, remote GitHub Actions state, branch protection, required status contexts, tag rulesets, package scripts, documented release proof, and orphaned remote workflows. The plan should produce repo-visible truth about the current required check surface and identify stale or mismatched contexts that must be removed, renamed, or preserved.

Boundaries: it must not implement tag-driven release, delete QA files, delete the helper CLI, move release helpers, rewrite tests, add CODEOWNERS, or perform broad docs cleanup. It may update narrow documentation only if needed to record the verified proof surface and keep the Program resumable.
