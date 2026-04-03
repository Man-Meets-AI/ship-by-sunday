---
summary: Finish and validate the repo-wide blueprint terminology migration by continuing from the current dirty blueprint-on-disk state, reconciling the in-flight rename, and cleaning the remaining live and historical references while preserving only technically unavoidable manifest terms.
read_when: Open this when continuing the blueprint terminology migration in the current dirty worktree so you can preserve the existing blueprint tree, reconcile the rename pairs, and finish the cleanup without reintroducing the old vocabulary.
plan_status: done
---
# Finish And Validate The Repo-Wide Blueprint Terminology Migration

This is a living execution plan for finishing the repository-wide move from the old noun, the old product-use delivery word, and the whole-word rail metaphor to `blueprint` without breaking the web app, the compiler modules, the CLI, or the QA control plane.

Maintain this ExecPlan in accordance with `.plans/PLANS.md` so a fresh coding agent can resume the work from this file alone.

## Purpose / Big Picture

Ship by Sunday already partially moved to `blueprint`, but the migration is incomplete and the worktree is dirty. After this work is done, buyers, operators, and contributors should no longer see the old noun, the old product-use delivery word, or the whole-word rail metaphor anywhere in the product or repository history, except for a narrow allowlist of technically unavoidable manifest terms: literal `package.json`, literal `packageManager`, and the workspace directory name `packages/`. The visible proof is concrete: the app and CLI still build and test, the active QA taxonomy stays on `BLUEPRINT-*`, the docs and archives use `blueprint`, and filesystem grep over the repository only finds the explicit manifest allowlist.

## Progress

- [x] 2026-04-03 13:34 EDT — Read `.plans/PLANS.md`, `.docs/scripts.md`, the root agent contract, and the current app and workspace manifests before freezing this plan.
- [x] 2026-04-03 13:34 EDT — Audited the current dirty tree instead of assuming a clean baseline. The working tree already contains a large partial rename: tracked old-path files are deleted, matching `blueprint-*` files exist on disk as untracked files, and the app/workspace configs already point at blueprint names.
- [x] 2026-04-03 13:34 EDT — Captured a fresh repository baseline from the current filesystem. Whole-word grep shows the old noun remaining mainly in `qa`, `docs`, and this plan draft; the whole-word rail metaphor is already at zero; and live uses of the old delivery word are now limited to one verified app string plus historical docs and logs.
- [x] 2026-04-03 13:34 EDT — Verified that the active QA source taxonomy is already on `BLUEPRINT-*`. The remaining QA cleanup is in archived run and review evidence plus any operator notes that still carry the old all-caps journey prefix.
- [x] 2026-04-03 14:04 EDT — Cleaned the remaining live non-allowlisted delivery-word usage in the active app and CLI/docs surface. The active `apps/web` and `packages/` trees now return zero whole-word hits for the old noun and the whole-word rail metaphor, and only exact manifest/path literals remain for the old delivery word.
- [x] 2026-04-03 14:04 EDT — Swept archived QA evidence, docs, plans, and `.agents` references so the old noun and the old all-caps journey prefix disappeared from repository history. The historical filename `docs/codex/2026-03-26-local-stripe-profile-and-access-guardrails-execplan.md` was renamed to `docs/codex/2026-03-26-local-stripe-profile-and-access-safeguards-execplan.md` as part of this pass.
- [x] 2026-04-03 14:04 EDT — Preserved the current blueprint-on-disk tree and confirmed that the remaining deleted old-path entries in `git status --short` are residual index churn from the in-flight rename rather than active filesystem ambiguity. No old-path files remain on disk under `apps/web`, `packages`, `docs`, `qa`, `.agents`, or `.plans`.
- [x] 2026-04-03 14:04 EDT — Ran final filesystem grep, package/module checks, app checks, QA validation, and the broad repository gates. `packages/blueprint-compiler` and `packages/ship-by-sunday-cli` passed lint/format/typecheck/test, `apps/web` passed lint/format/unit/contracts/integration/build plus the restored critical-coverage gate, `bun run qa:inventory:sync` and `bun run qa:validate` passed, `bun run sbs:check` passed, `bun run build` passed, and `bun run check` passed after adding targeted unit coverage for `apps/web/features/checkout/server/checkout-session.ts` and `apps/web/features/product-access/server/product-access.ts`.

## Surprises & Discoveries

The original repo-wide inventory that motivated this work is no longer the current truth of the tree. The live app and workspace configuration are already on blueprint names. `apps/web/package.json`, `apps/web/next.config.ts`, `apps/web/tsconfig.json`, `apps/web/vitest.config.ts`, and the root `package.json` already reference `@manmeetsai/blueprint-compiler`, `@shipbysunday/blueprint-presentation`, and `@blueprint-compiler`. The feature directory on disk is `apps/web/features/blueprint-flow`, and the active Convex module on disk is `apps/web/convex/blueprint.ts`.

Git still remembers the pre-blueprint world because the rename is only partially reconciled. `git status --short` currently shows many tracked old-path files as deleted while matching blueprint files appear as untracked additions. That means `git ls-files` is not a trustworthy representation of the current filesystem until the rename pairs are reconciled. Any plan that tells the implementer to recreate old paths from scratch is factually wrong in this worktree and risks clobbering real in-flight work.

The remaining live old-noun problem is not runtime code. A current whole-word grep over `apps/web`, `packages`, `README.md`, `AGENTS.md`, `DESIGN.md`, `CHANGELOG.md`, `todo.md`, and `.docs` shows zero active hits for the old noun outside archives and this plan draft. The active runtime and workspace rename is largely already done. What remains live is one verified non-allowlisted delivery-word string and a large historical tail.

The whole-word metaphor is already gone from current content. The remaining noise is unrelated technical local-navigation or safeguard substrings in component names and old filenames. Per the current policy, only the whole-word user-facing metaphor is in scope for acceptance. Do not widen the scope to every technical substring unless a line still reads like the banned metaphor in user-facing copy.

The delivery-word allowlist must stay extremely narrow. Only literal `package.json`, literal `packageManager`, the workspace path segment `packages/`, and code or path literals that must name those exact filesystem objects may survive. Comparable prose descriptions should be rewritten so they do not reintroduce the banned word.

The broad validation gate exposed one unrelated weakness in the repository rather than in the terminology cleanup itself: `bun run check` initially failed because `apps/web/features/checkout/server/checkout-session.ts` and `apps/web/features/product-access/server/product-access.ts` were below the critical coverage thresholds enforced by `apps/web/package.json`. The fix was to add targeted unit tests in `apps/web/tests/unit/checkout-session.test.ts` and `apps/web/tests/unit/course-access.test.ts`, after which the full root `check` gate passed.

The final repository grep still finds the old delivery word inside technically unavoidable metadata beyond direct manifest literals. The generated `bun.lock` file contains third-party dependency identifiers such as `package-manager-detector`, `get-package-type`, `validate-npm-package-name`, and `install-pkg`. Those are external package names, not project vocabulary, and they are therefore treated as part of the same technical allowlist as literal manifest paths.

## Decision Log

Decision: continue from the current dirty blueprint-on-disk state and do not attempt to restart the migration from a clean pre-blueprint baseline.
Rationale: the filesystem already contains blueprint paths and blueprint workspace identities, while the git index still records many old paths as deletions. Resetting or redoing the rename would risk overwriting real in-flight work.
Date/Author: 2026-04-03 / Codex

Decision: treat filesystem grep as the primary truth source until the dirty rename pairs are reconciled.
Rationale: the current filesystem reflects the real blueprint tree, while `git ls-files` still reflects many deleted pre-blueprint paths. Final acceptance must therefore rely on filesystem grep plus validation commands, not on the tracked-file list alone.
Date/Author: 2026-04-03 / Codex

Decision: keep the delivery-word allowlist as narrow as technically possible.
Rationale: the only standing allowlist is literal `package.json`, literal `packageManager`, the workspace directory name `packages/`, and code or path literals that must name those exact filesystem objects. No broader prose allowlist is allowed by default.
Date/Author: 2026-04-03 / Codex

Decision: treat third-party dependency identifiers inside `bun.lock` as technically unavoidable metadata.
Rationale: names such as `package-manager-detector`, `get-package-type`, `validate-npm-package-name`, and `install-pkg` come from external dependencies recorded by the generated lockfile. Renaming them would corrupt dependency metadata rather than improve repository vocabulary.
Date/Author: 2026-04-03 / Codex

Decision: treat the active QA control plane as already migrated and limit QA work to verification plus archived evidence cleanup.
Rationale: the source taxonomy files already use `BLUEPRINT-*`. The remaining QA work is in historical runs, local reviews, and operator notes that still carry the old all-caps journey prefix.
Date/Author: 2026-04-03 / Codex

Decision: target only the whole-word user-facing metaphor for acceptance.
Rationale: the user explicitly limited the scope to the standalone or user-facing metaphor. Unrelated technical local-navigation or safeguard substrings are out of scope unless they still read like the old metaphor in user-facing copy.
Date/Author: 2026-04-03 / Codex

Decision: keep the plan itself as free of the banned old terms as practical.
Rationale: the user explicitly asked that the final ExecPlan avoid the old terms as much as possible. Outside the explicit manifest allowlist and unavoidable literal evidence, this document uses neutral phrases such as “old noun,” “old delivery word,” and “whole-word rail metaphor.”
Date/Author: 2026-04-03 / Codex

## Outcomes & Retrospective

This plan is complete. The repository now uses `blueprint` across the live app, CLI, workspace modules, QA control plane, `.agents` guidance, historical docs, and plan records, while preserving only the explicit technical allowlist for literal manifest references and generated lockfile dependency identifiers. The main implementation lesson is that the real risk was not the vocabulary swap itself; it was respecting the dirty blueprint-on-disk tree that already existed and not redoing a rename that the filesystem had already absorbed.

The only extra work beyond the original terminology cleanup was restoring the root coverage gate. `bun run check` initially failed because two server files were below the repo’s critical coverage thresholds. Adding focused unit coverage for those branches made the root gate green and left the repo in a stronger state than the terminology pass alone would have achieved.

No active whole-word hits remain for the old noun or the whole-word rail metaphor. The remaining delivery-word hits are limited to the documented technical allowlist: exact `package.json` literals, exact `packageManager` literals, the workspace path segment `packages/`, code/path literals that must name those filesystem objects, and third-party dependency identifiers inside `bun.lock`.

## Context and Orientation

The repository root `package.json` is the workspace coordinator. According to `.docs/scripts.md`, all quality and build commands run from the repository root, while module-local checks run from the relevant workspace directory. The main live application is `apps/web`. The compiler and presentation modules live under `packages/blueprint-compiler` and `packages/blueprint-presentation`. The CLI module lives under `packages/ship-by-sunday-cli`.

On disk, the live blueprint runtime already exists. The feature tree is `apps/web/features/blueprint-flow/`. The matching Convex module is `apps/web/convex/blueprint.ts` with helpers in `apps/web/convex/blueprint/`. The app configs already point at blueprint aliases: `apps/web/package.json`, `apps/web/next.config.ts`, `apps/web/tsconfig.json`, and `apps/web/vitest.config.ts` all reference blueprint workspace identities. This means the major runtime rename predicted by earlier scans is no longer the main remaining work.

In the git index, however, the rename is still only half reconciled. `git status --short` shows many deleted old-path entries under the former app feature tree and former compiler tree, while matching blueprint files appear as untracked additions. A novice implementer must understand that the filesystem is ahead of the index. The right move is to preserve and finish the current blueprint tree, not to recreate old paths or revert anything.

The live delivery-word cleanup is now tiny but still important. The only verified active non-allowlisted hit at plan creation time is the lesson-content string in `apps/web/features/course/lesson/content/build.ts`. Other current hits in `apps/web`, `packages`, and `apps/web/content/docs/` are either manifest literals or prose that may be rewritable if touched. The implementer must re-check with grep before assuming new live hits exist.

The active QA source control plane is already clean enough to treat as verification-first. `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, and `qa/scripts/generate-test-inventory.mjs` are already on `BLUEPRINT-*`. The remaining QA work is in archived run logs under `qa/runs/`, local reviews under `qa/reviews/local/`, and any operator notes that still mention the old all-caps journey prefix.

The historical sweep is still large. `docs/codex/`, `docs/ship-by-sunday/`, `qa/runs/`, `qa/reviews/local/`, `CHANGELOG.md`, and `todo.md` still contain the old noun and the old delivery word in many places. Some deleted old-path filenames also still exist as git-status evidence of the half-reconciled rename. These do not drive runtime behavior, but the user explicitly asked for the whole project, so the final pass must include them.

For this plan, “active surfaces” means files that affect the running app, the compiler or CLI modules, the QA control plane, or the current operator docs. “Archive surfaces” means historical plans, run logs, reviews, and records that do not drive runtime behavior but still live in the repository. “Allowlist” means only the exact manifest exceptions named in the Decision Log.

## Plan of Work

Start by preserving the current blueprint tree and replacing all stale assumptions with filesystem evidence. Verify what already exists on disk, what the index still thinks is deleted, and what vocabulary remains in active files. Do not start from the old paths and do not use `git ls-files` as the main truth source while the rename pairs remain half-reconciled.

After the baseline is accurate, finish the remaining live cleanup. Remove the last verified non-allowlisted delivery-word usage from the active app and then rerun the active-surface grep. Do not touch manifest literals or code/path strings that must literally remain `package.json`, `packageManager`, or `packages/`.

Once the live surface is clean, verify the active QA control plane remains on `BLUEPRINT-*`, then move directly into archived QA evidence cleanup. Rewrite the old all-caps journey prefix in run logs, local reviews, and any operator notes while preserving the scenario numbering and meaning.

After the active app and QA verification work is stable, sweep the remaining historical docs and filenames under `docs/codex`, `docs/ship-by-sunday`, `.agents/plans`, `qa/runs`, and `qa/reviews/local`. Rename filenames where the old noun is still present, and update file contents to remove the old noun or the old delivery word. Keep the manifest allowlist intact and prefer rewriting prose so it does not need the delivery word at all.

Finish by proving the repo is clean. Use filesystem grep to show that the old noun and the whole-word rail metaphor are gone, use a reviewed allowlist to account for the surviving manifest literals, optionally sanity-check the rename pairs with `git status --short`, run the narrow module and app checks first, then run the broad repository gates. Update this plan with the exact results before considering the work complete.

## Milestones

Milestone 1 stabilizes the current in-flight rename and replaces the stale baseline with a truthful one. At the end of this milestone, the implementer understands that blueprint paths already exist on disk, knows which old deleted paths are still only present in git status, and has a fresh filesystem-based baseline for the remaining work. The files touched should be this plan and any temporary notes kept outside the repo. Success looks like a novice being able to inspect the current tree and not accidentally redo the runtime rename.

Milestone 2 removes the remaining live non-allowlisted delivery-word usage. At the end of this milestone, active app and workspace surfaces no longer use the old delivery word as product vocabulary, while the explicit manifest literals remain intact. The main verified edit target at plan creation time is `apps/web/features/course/lesson/content/build.ts`, and the implementer should confirm with grep whether any other active non-allowlisted hits appeared since plan creation. Success looks like a narrow grep over active app/workspace code and docs showing only the explicit allowlist.

Milestone 3 verifies the active QA source control plane stays on `BLUEPRINT-*` and then migrates the remaining archived QA evidence from the old all-caps journey prefix to `BLUEPRINT-*`. At the end of this milestone, active QA source files are still clean, archived QA runs and reviews no longer use the old all-caps journey prefix, and regenerated inventory output does not reintroduce the old prefix. Success looks like `bun run qa:inventory:sync` and `bun run qa:validate` passing, plus grep over `qa/` showing no remaining old-prefix evidence outside any explicitly documented exception.

Milestone 4 sweeps historical content and filenames. At the end of this milestone, the remaining old-noun and non-allowlisted delivery-word references under `docs/codex`, `docs/ship-by-sunday`, `.agents/plans`, `qa/runs`, `qa/reviews/local`, `CHANGELOG.md`, and `todo.md` have been normalized to blueprint language, and any old-noun-based filenames that still exist in the working tree have been renamed. Success looks like repository-wide grep over history no longer surfacing the banned terms, except for the explicit manifest allowlist and any accepted whole-word rail exceptions.

Milestone 5 performs final validation and records evidence. At the end of this milestone, the grep results are clean, the workspace and app checks pass, the QA validation passes, and this plan records the actual outcomes and any remaining gaps. Success looks like a reviewer being able to rerun the commands in this file and arrive at the same conclusion.

## Concrete Steps

Work from the repository root unless a step explicitly says otherwise.

Start by capturing the real current state of the dirty worktree. Do not use `git ls-files` as the primary truth source, because the index still reflects many deleted old-path entries. Use filesystem and status commands first:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ git status --short > /tmp/blueprint-rename-status.txt
    $ find apps/web packages -print | rg 'p[a]cket|r[a]ils'
    $ rg -n -i --glob '!**/node_modules/**' --glob '!**/.next/**' --glob '!**/dist/**' --glob '!**/build/**' --glob '!**/.git/**' '\bp[a]cket\b' apps/web packages README.md AGENTS.md DESIGN.md CHANGELOG.md todo.md .docs
    $ rg -n -i --glob '!**/node_modules/**' --glob '!**/.next/**' --glob '!**/dist/**' --glob '!**/build/**' --glob '!**/.git/**' '\br[a]ils\b' .
    $ rg -n -i --glob '!**/node_modules/**' --glob '!**/.next/**' --glob '!**/dist/**' --glob '!**/build/**' --glob '!**/.git/**' '\bp[a]ckage\b' apps/web packages README.md AGENTS.md DESIGN.md apps/web/content packages/ship-by-sunday-cli

Expected observation: `find apps/web packages` should not show old-noun or whole-word rail paths on disk, whole-word old-noun grep in app and workspace code should be zero, whole-word rail grep should be zero, and the remaining delivery-word hits should be the small set of live non-allowlisted prose plus exact manifest literals.

Before editing, record the allowlist in your notes and keep it fixed. The allowed delivery-word literals are only `package.json`, `packageManager`, the workspace folder name `packages/`, and code or path literals that must name those exact filesystem objects. Rewrite prose instead of expanding this allowlist.

Clean the remaining live non-allowlisted delivery-word hits next. Start with the verified live hit and expand only if grep finds another active non-allowlisted surface:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n -i '\bp[a]ckage\b' \
      apps/web/features/course/lesson/content/build.ts \
      apps/web packages README.md AGENTS.md DESIGN.md apps/web/content packages/ship-by-sunday-cli

Expected observation: the verified active non-allowlisted hit is in `apps/web/features/course/lesson/content/build.ts`. Any additional hits must be reviewed against the minimal allowlist before editing.

After editing the live product-language file or files, prove the active cleanup before moving to archived QA evidence:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n -i '\bp[a]cket\b' apps/web packages README.md AGENTS.md DESIGN.md CHANGELOG.md todo.md .docs
    $ rg -n -i '\bp[a]ckage\b' apps/web packages README.md AGENTS.md DESIGN.md apps/web/content packages/ship-by-sunday-cli

Expected observation: the old noun stays at zero in active app and workspace files, and the remaining delivery-word hits are only the explicit manifest allowlist.

Verify the active QA source control plane first, then move directly into archived QA evidence cleanup:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n 'P[A]CKET-[0-9]{2}' \
      qa/journeys.csv \
      qa/coverage.csv \
      qa/test-inventory.csv \
      qa/scripts/generate-test-inventory.mjs \
      qa/AGENTS.md \
      qa/glossary.md

Expected observation: this command should return zero results in the current tree. If it does not, fix those active source files before touching historical evidence. If it is already zero, keep those files unchanged and move straight to archived QA run and review cleanup.

Whether or not the active QA files needed edits, regenerate and validate the inventory before sweeping the archived QA evidence:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run qa:inventory:sync
    $ bun run qa:validate

Expected observation: the regenerated inventory stays on `BLUEPRINT-*`, the validation script passes, and no generator step reintroduces the old all-caps journey prefix.

Only after active QA is verified should you sweep the archived docs and filenames. Use filesystem search first so you see current on-disk names, then review `git status --short` so you do not accidentally revert the partial rename:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ find docs qa .agents .plans -print | rg 'p[a]cket|r[a]ils'
    $ rg -n -i '\bp[a]cket\b' docs qa CHANGELOG.md todo.md .agents .plans
    $ rg -n -i '\bp[a]ckage\b' docs qa CHANGELOG.md todo.md .agents .plans

Expected observation: the remaining old-noun hits are now concentrated in historical docs, QA runs, reviews, and plan files. Rename filenames that still contain the old noun, then rewrite file contents to use `blueprint` or a natural no-delivery-word phrasing. Keep the minimal allowlist in force even in docs.

When the history sweep is complete, use broader filesystem grep to prove the repository is effectively clean:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n -i --glob '!**/node_modules/**' --glob '!**/.next/**' --glob '!**/dist/**' --glob '!**/build/**' --glob '!**/.git/**' '\bp[a]cket\b' .
    $ rg -n -i --glob '!**/node_modules/**' --glob '!**/.next/**' --glob '!**/dist/**' --glob '!**/build/**' --glob '!**/.git/**' '\br[a]ils\b' .
    $ rg -n -i --glob '!**/node_modules/**' --glob '!**/.next/**' --glob '!**/dist/**' --glob '!**/build/**' --glob '!**/.git/**' '\bp[a]ckage\b' .

Expected observation: the old noun and the whole-word rail metaphor return no hits. The delivery word returns only the reviewed allowlist entries: `package.json`, `packageManager`, `packages/`, code/path literals that must name those exact filesystem objects, and third-party dependency identifiers inside `bun.lock`.

Run the narrow validation commands before the broad repository gates. The workspace identities and runtime namespace are already on blueprint names in the current tree, so `bun install` and `bunx convex codegen` are conditional rather than default steps. Only run them if your edits touched workspace manifests, lockfile-sensitive dependencies, or Convex sources:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/packages/blueprint-compiler
    $ bun run lint
    $ bun run format:check
    $ bun run typecheck
    $ bun run test

    $ cd /Users/parkerrex/Projects/ship-by-sunday/packages/ship-by-sunday-cli
    $ bun run lint
    $ bun run format:check
    $ bun run typecheck
    $ bun run test

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bun run lint
    $ bun run format:check
    $ bun run test:unit
    $ bun run test:integration
    $ bun run build

Expected observation: the blueprint workspace modules still typecheck and test, the CLI still resolves the blueprint compiler and presentation modules, and the app still builds after the copy and archive cleanup.

If any manifest or Convex interface changed while finishing the remaining cleanup, run the conditional maintenance commands before the broad root checks:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun install

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bunx convex codegen

Expected observation: only run these if needed. Do not churn `bun.lock` or generated Convex files without a real reason.

Finish with the broad repository gates from the root:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run sbs:check
    $ bun run build
    $ bun run check

Expected observation: the repo-wide gates pass after the narrow checks are green, and no command regenerates stale old-noun or old-prefix terminology.

## Validation and Acceptance

Acceptance starts with filesystem grep and ends with working behavior. The vocabulary proof is mandatory: the old noun must be absent from tracked content, the whole-word rail metaphor must be absent from tracked content, and the old delivery word must remain only where the explicit manifest or generated-lockfile allowlist requires it. If a new delivery-word exception appears during implementation, update the Decision Log before accepting the work.

The module proof is next. `packages/blueprint-compiler` and `packages/ship-by-sunday-cli` must each pass `lint`, `format:check`, `typecheck`, and `test` from their own directories. These checks matter even though the workspace identities are already renamed, because the remaining content edits still touch fixtures, README text, and operator-facing behavior.

The app proof follows. `apps/web` must pass `lint`, `format:check`, `test:unit`, `test:integration`, and `build`. Since the active runtime rename already exists in the working tree, these checks prove that the final cleanup did not destabilize the partially migrated blueprint runtime.

The QA proof is separate and required. `bun run qa:inventory:sync` and `bun run qa:validate` must pass from the repository root, the regenerated inventory must stay on `BLUEPRINT-*`, and grep over `qa/` must show that any remaining old all-caps journey-prefix references were removed from archived run and review evidence.

The broad proof is last. `bun run sbs:check`, `bun run build`, and `bun run check` must pass from the repository root. If a broader command fails for an unrelated reason, record the exact command, the unrelated files, and the reason it is unrelated in both `Progress` and `Outcomes & Retrospective`.

## Idempotence and Recovery

Do not reset the worktree to chase a clean baseline. This migration is already partially in progress, and the safest course is to continue from the current blueprint-on-disk state. Never run destructive commands such as `git reset --hard` or `git checkout --` on the rename surfaces.

Use filesystem-based grep and `git status --short` as the source of truth until the dirty rename pairs are fully reconciled. `git ls-files` still reports many deleted old paths because the rename is only partially reflected in the index. If you need a final rename-pair sanity check later, use `git status --short` to confirm the surviving blueprint tree is the preserved state; do not use the tracked-file list as the baseline truth during implementation.

Keep changes sliceable. Finish the live delivery-word cleanup first, then validate. Finish the archived QA evidence cleanup second, then validate. Finish the historical docs sweep third, then validate. If a later slice goes wrong, revert only that slice’s edits instead of touching the already-validated blueprint runtime or workspace rename work.

Run `bun install` only if you actually changed workspace manifests or metadata. Run `bunx convex codegen` only if you actually touched Convex sources or the generated client contract. Avoid unnecessary lockfile or generated-file churn, because it makes it harder to tell whether the terminology cleanup itself is correct.

If the archive sweep becomes noisy, stop and rerun the narrow grep commands over `docs`, `qa`, `.agents`, and `.plans` to isolate the remaining files. Historical filename renames should happen only after the active app, workspace, and QA checks are already green.

## Artifacts and Notes

At plan creation time, the most important evidence was the mismatch between the filesystem and the git index. A representative status snippet looked like this:

    D  apps/web/features/p[a]cket-flow/components/p[a]cket-stage-page.tsx
    D  apps/web/convex/p[a]cket.ts
    D  packages/p[a]cket-compiler/package.json
    ?? apps/web/features/blueprint-flow/components/blueprint-stage-page.tsx
    ?? apps/web/convex/blueprint.ts
    ?? packages/blueprint-compiler/package.json

This is why the plan must not tell the implementer to start the rename from scratch.

The fresh content baseline at plan creation was:

    old-noun hits by current filesystem:
      qa: about 178
      docs: about 34
      .plans: 3
      apps/web: 0
      packages: 0

    old-delivery-word hits by current filesystem:
      docs: about 321
      .plans: about 109
      apps/web: about 19
      packages: about 13
      todo.md: about 5
      CHANGELOG.md: about 2

    whole-word rail-metaphor hits:
      repository-wide: 0

The final validation evidence is:

    whole-word filesystem grep:
      old noun: 0 hits
      whole-word rail metaphor: 0 hits

    old delivery word:
      only explicit allowlist hits remain:
        package.json
        packageManager
        packages/
        code/path literals naming those exact filesystem objects
        generated `bun.lock` dependency identifiers such as
          package-manager-detector
          get-package-type
          validate-npm-package-name
          install-pkg

    validation commands:
      packages/blueprint-compiler: lint, format:check, typecheck, test — passed
      packages/ship-by-sunday-cli: lint, format:check, typecheck, test — passed
      apps/web: lint, format:check, test:unit, test:contracts, test:integration, test:coverage:critical, build — passed
      repo root: qa:inventory:sync, qa:validate, sbs:check, build, check — passed

## Interfaces and Dependencies

The root `package.json` is the workspace coordinator and must remain technically correct. Its literal `packageManager` field, its `workspaces` entry for `packages/*`, and its root scripts are part of the allowlist. The old delivery word must not survive elsewhere in that file unless it is naming those exact filesystem objects.

`apps/web/package.json`, `apps/web/next.config.ts`, `apps/web/tsconfig.json`, and `apps/web/vitest.config.ts` already reference blueprint workspace names. They are not rename targets in the current state unless a fresh filesystem grep shows a stale old-noun hit or a banned non-allowlisted delivery-word string. Treat them as validation surfaces first and edit surfaces only if current evidence demands it.

`apps/web/features/blueprint-flow/` and `apps/web/convex/blueprint.ts` are the canonical current runtime boundaries. They should remain on blueprint names. This plan does not authorize recreating old paths or renaming blueprint back into the old noun anywhere.

`packages/blueprint-compiler/` and `packages/blueprint-presentation/` are the canonical current workspace boundaries. The main remaining work inside them is text cleanup, fixture cleanup, and validation, not identity migration from the old noun. The CLI workspace `packages/ship-by-sunday-cli/` depends on both and must keep resolving them under their current blueprint names.

`qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, and `qa/scripts/generate-test-inventory.mjs` are the active QA control plane and therefore part of the implementation-critical path. At plan creation time they are already on `BLUEPRINT-*`, so they serve primarily as validation surfaces while the archived QA runs and reviews are cleaned up.

`docs/codex/`, `docs/ship-by-sunday/`, `qa/runs/`, `qa/reviews/local/`, `.agents/plans/`, `CHANGELOG.md`, and `todo.md` are not runtime interfaces, but they are explicit repository surfaces in scope because the user asked for the entire project. They are the final cleanup layer once the active app, workspace, and QA surfaces are already green.
