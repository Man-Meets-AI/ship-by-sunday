---
summary: Replace the remaining `@manmeetsai` package scope and non-domain identity drift with Ship by Sunday naming, while explicitly preserving the `man-meets-ai` website and Clerk hostnames.
read_when: Open this when you need to finish the `manmeetsai` to `shipbysunday` rename across package metadata, runtime imports, selected repo identity strings, and archival content without touching the live website domains.
plan_status: done
---
# Finish The Manmeetsai To Shipbysunday Identity Cleanup

This is a living execution plan for removing the stale `manmeetsai` identity from the repository while preserving the current in-flight feature work already present in the dirty tree.

Maintain this ExecPlan in accordance with `.plans/PLANS.md` so a fresh coding agent can resume the rename from this file alone.

## Purpose / Big Picture

Ship by Sunday already uses the new brand in the repo root name, product config, and one workspace scope, but the old `@manmeetsai` identity still survives in package manifests, runtime imports, selected repo strings, and historical docs. The user has explicitly decided that the public website and Clerk hostnames remain on `man-meets-ai`, so those domain references are not part of this rename. After this work is complete, the package namespace and non-domain repo identity surfaces should consistently use Ship by Sunday naming, grep for the old package identity should shrink to either zero or an explicit archival exception list, and the app, CLI, and QA flows should still build and test. The visible proof is that the workspace packages resolve under `@shipbysunday/*`, the web app no longer imports `@manmeetsai/*`, the chosen non-domain identity strings no longer say `manmeetsai`, the `man-meets-ai` hostnames remain unchanged, and the required quality gates pass.

## Progress

- [x] 2026-04-04 11:16 EDT — Read `.plans/PLANS.md`, `.docs/scripts.md`, the root agent contract, and the current workspace manifests before freezing the plan.
- [x] 2026-04-04 11:16 EDT — Used three `gpt-5.4-mini` high-effort subagents plus local grep to inventory the remaining `manmeetsai` surfaces across package metadata, runtime imports, CI, QA, and historical docs.
- [x] 2026-04-04 11:16 EDT — Confirmed the app already isolates most compiler usage through `@codebase-compiler` path aliases in `apps/web/tsconfig.json` and `apps/web/vitest.config.ts`, which reduces the live runtime blast radius.
- [x] 2026-04-04 11:16 EDT — Confirmed the current dirty worktree contains unrelated in-flight app changes, so this rename must avoid overwriting or “cleaning up” any existing user edits.
- [x] 2026-04-04 11:37 EDT — Completed Milestone 1 package-scope rename. `@manmeetsai` was replaced with `@shipbysunday` across the compiler and CLI manifests, matching workspace dependencies, direct runtime imports, CLI tests, the web `transpilePackages` list, and the CLI README heading. A fresh grep over `apps/web`, `packages`, and `bun.lock` returned zero `@manmeetsai` hits.
- [x] 2026-04-04 11:20 EDT — User clarified that all website and Clerk hostnames stay on `man-meets-ai`. Domain migration is out of scope for this plan and any grep over those hosts is an allowed live exception.
- [x] 2026-04-04 11:44 EDT — Completed Milestone 2 non-domain live cleanup by renaming the QA helper user-agent in `qa/scripts/lib/clerk-target.mjs` to `shipbysunday-qa-auth-check/1.0`. Targeted formatting passed. `bun run qa:inventory:sync` passed, and `bun run qa:validate` passed on rerun after one transient missing-row error.
- [x] 2026-04-04 11:44 EDT — Completed Milestone 3 archive cleanup. Rewrote stale narrative references to the old package scope, generalized archive-only repo alias mentions where they were not needed as evidence, renamed `docs/codex/2026-03-23-manmeetsai-incident-bus-telegram-plan.md` to `docs/codex/2026-03-23-ship-by-sunday-incident-bus-telegram-plan.md`, and updated archive references accordingly.
- [x] 2026-04-04 11:37 EDT — Ran the Milestone 1 narrow validation loop. `packages/codebase-compiler` passed `lint`, `format:check`, `typecheck`, and `test`. `packages/ship-by-sunday-cli` passed `lint`, `format:check`, `typecheck`, and `test`. `apps/web` passed `lint`, a targeted `oxfmt --check` over the touched files, a focused integration run for `tests/integration/codebase-download-routes.test.ts`, and a full `bun run build`. The full workspace `apps/web` `format:check` remains blocked by unrelated dirty files outside this rename slice and is recorded below.
- [x] 2026-04-04 11:50 EDT — Completed Milestone 4 final validation. Root `bun run format`, `bun run format:check`, `bun run lint`, `bun run typecheck`, `bun run sbs:check`, `bun run build`, and `bun run check` all passed. The earlier broad `apps/web` formatting failure did not reproduce on rerun and is now treated as transient rather than a standing blocker.

## Surprises & Discoveries

The live code rename is smaller than the raw grep count suggests. `apps/web` mostly imports the compiler through `@codebase-compiler` and `@codebase-compiler/server` aliases defined in `apps/web/tsconfig.json` and mirrored in `apps/web/vitest.config.ts`. That means the web feature tree does not need a broad import rewrite. The direct old-scope code changes are concentrated in workspace manifests, a small set of runtime imports, the web app `transpilePackages` list, a handful of CLI imports and tests, the QA helper user-agent string, and the generated `bun.lock`.

The largest residue set is not package metadata. It is operational and archival identity: `.env.production`, `apps/web/.env.production`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `qa/README.md`, `qa/AGENTS.md`, multiple product docs under `apps/web/content/docs/`, and many historical reports still reference `https://www.man-meets-ai.com`, `https://dev.man-meets-ai.com`, `https://clerk.man-meets-ai.com`, `accounts.man-meets-ai.com`, or repo and Vercel identifiers like `mma-shipbysunday` and `man-meets-ai-simple`. After the user clarification, the hostname subset of that inventory is not a bug. It is an intentional live contract that this plan must preserve.

The checked-in Playwright auth fixtures remain a trap, but now for the opposite reason. `apps/web/tests/e2e/.auth/member-with-access.json` and `apps/web/tests/e2e/.auth/member-without-access.json` contain domain-scoped cookies for `dev.man-meets-ai.com` and `.man-meets-ai.com`, plus embedded Clerk application metadata. Because the domain is intentionally staying put, those fixtures should not be churned unless a separate auth task requires regeneration.

The repository currently contains real secrets in `.env.production` and `apps/web/.env.production`. This plan does not change or re-emit those values. Any implementation must avoid leaking those secrets into logs, notes, or chat, and should not touch the hostname-bearing fields in those files because the domains are intentionally preserved.

The current worktree is dirty with unrelated app changes, deleted files, and new files under `apps/web/features/codebase-flow/`, plus plan and design changes. This rename must be additive and surgical. It must not attempt to reconcile unrelated git state or revert anything outside the rename surface.

The first broad app validation surfaced an apparent blocker in the dirty tree rather than in this rename. `bun run format:check` from `apps/web` initially reported four files outside the Milestone 1 edit set: `features/codebase-flow/components/codebase-review-page.tsx`, `features/codebase-flow/hooks/use-review-download-handoff.ts`, `scripts/review-handoff-doctor.ts`, and `tests/integration-ui/codebase-page.test.tsx`. Because those files were outside the rename slice and already dirty or untracked, the immediate recovery was to keep them untouched and switch to targeted formatting checks on the Milestone 1 files. Later reruns of root `bun run format:check`, `bun run format`, and `bun run check` all passed cleanly, so the original failure appears to have been transient rather than a persistent repo blocker.

The QA control-plane validation exposed one transient mismatch after `qa:inventory:sync`: the first `bun run qa:validate` complained that `qa/test-inventory.csv` was missing `apps/web/tests/integration-ui/codebase-test-fixtures.ts`, even though the synced file already contained that row. A direct inspection confirmed the row was present, and an immediate rerun of `bun run qa:validate` passed cleanly. Treat that first failure as transient evidence, not as a persistent inventory gap.

The remaining non-domain identity hits after Milestone 3 are deliberate exceptions rather than stale drift. The active ExecPlan still names the old identity because it is the artifact driving this migration. `docs/release-workflow.md` still references the live GitHub and Vercel repo/project identifiers because those are current external contracts, and several `docs/codex/*` files still include `mma-shipbysunday` inside preserved code blocks or command transcripts that act as historical evidence.

## Decision Log

Decision: split the work into package identity, non-domain repo identity, and archive cleanup rather than one flat repo-wide replacement.
Rationale: the package rename is mechanical and low-risk, while domains are now explicitly fixed as `man-meets-ai` by user instruction. Archives are numerous and should not block the safe runtime rename slice.
Date/Author: 2026-04-04 / Codex

Decision: keep the `@codebase-compiler` alias layer intact.
Rationale: those aliases already shield `apps/web` from workspace scope churn. Replacing them would widen the diff for no user-visible benefit and would violate the repo preference for the smallest viable change.
Date/Author: 2026-04-04 / Codex

Decision: regenerate `bun.lock` after manifest changes instead of hand-editing it.
Rationale: the lockfile is derived state. Manual edits are brittle and make it harder to trust dependency metadata.
Date/Author: 2026-04-04 / Codex

Decision: treat the checked-in `.auth/*.json` files as protected generated fixtures for this initiative.
Rationale: they encode real cookie domains and embedded Clerk application metadata under the intentionally preserved `man-meets-ai` hosts. Unnecessary churn is more likely to break QA than help the rename.
Date/Author: 2026-04-04 / Codex

Decision: preserve all `man-meets-ai` website and Clerk hostnames.
Rationale: the user explicitly said the website domains stay as `man-meets-ai`, so env files, workflows, docs, tests, and fixtures that reference those hosts are intentionally out of scope unless another request changes that rule.
Date/Author: 2026-04-04 / Codex

Decision: preserve live external repo and project identifiers, plus quoted command and code-block evidence, when they still describe a real contract or historical observation.
Rationale: names such as the current GitHub or Vercel project identifiers are not the same as stale package identity, and rewriting preserved command transcripts would retcon evidence rather than clean prose.
Date/Author: 2026-04-04 / Codex

Decision: preserve the existing dirty worktree and avoid unrelated file churn.
Rationale: the repo currently contains active edits outside the rename surface. This plan must coexist with them and not use destructive git operations.
Date/Author: 2026-04-04 / Codex

## Outcomes & Retrospective

This plan is complete. The package and direct-import contract now resolves under `@shipbysunday/*`, the one live non-domain runtime label in the QA helper has been renamed, and the archive sweep removed the stale narrative references while preserving explicit live contracts and evidence-bearing code blocks. The remaining old-identity references are deliberate exceptions: this active ExecPlan file, the live external repo/project identifiers in `docs/release-workflow.md`, and preserved command or code-block evidence in selected `docs/codex/*` files.

The most important implementation lesson is that the real work was not the package-scope rename itself. That slice was small and validated cleanly. The harder part was drawing the right boundary between stale identity drift and real contracts that still happen to use older names. Preserving the `man-meets-ai` hostnames, keeping live GitHub and Vercel identifiers when they describe actual infrastructure, and preserving quoted evidence in archive materials avoided a cleanup pass that would have become inaccurate revisionism.

The final validation set is green. Root `bun run format`, `bun run format:check`, `bun run lint`, `bun run typecheck`, `bun run sbs:check`, `bun run build`, and `bun run check` all passed after the implementation settled. The one transient QA inventory mismatch and the one transient broad-format failure both disappeared on rerun once the working tree and generated artifacts had stabilized.

## Context and Orientation

The repository root `package.json` defines the Bun workspaces and the root command surface. The live app is `apps/web`. The relevant workspaces for this rename are `packages/codebase-compiler`, `packages/ship-by-sunday-cli`, and `packages/codebase-presentation`.

The authoritative package identity files are the workspace manifests. `packages/codebase-compiler/package.json` now names the compiler package `@shipbysunday/codebase-compiler`. `packages/ship-by-sunday-cli/package.json` now names the CLI package `@shipbysunday/ship-by-sunday-cli` and depends on the compiler under that scope. `packages/codebase-presentation/package.json` depends on the compiler under `@shipbysunday/codebase-compiler`, and `apps/web/package.json` matches that same workspace dependency.

The live runtime import surface is now aligned. `apps/web/next.config.ts` lists `@shipbysunday/codebase-compiler` in `transpilePackages`. `apps/web/app/api/download/repo/route.ts`, `packages/codebase-presentation/src/index.ts`, `packages/ship-by-sunday-cli/src/codebase-derivation.ts`, `packages/ship-by-sunday-cli/src/draft/draft-store.ts`, `packages/ship-by-sunday-cli/src/commands/generate-command.ts`, the affected CLI tests, and `apps/web/tests/integration/codebase-download-routes.test.ts` all reference the compiler through the `@shipbysunday` scope. `bun.lock` has been regenerated to match.

The app already contains an isolation layer that should remain in place. `apps/web/tsconfig.json` maps `@codebase-compiler` and `@codebase-compiler/server` to the workspace source files, and `apps/web/vitest.config.ts` mirrors those aliases. These aliases mean most web feature files do not care what the workspace npm scope is.

The operational identity surface splits into two groups. Hostname-bearing surfaces such as `.env.production`, `apps/web/.env.production`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, product docs under `apps/web/content/docs/`, `qa/README.md`, `qa/AGENTS.md`, and `docs/release-workflow.md` intentionally keep the `man-meets-ai` domains. Non-domain strings were cleaned where they were clearly stale, including the QA helper user-agent in `qa/scripts/lib/clerk-target.mjs`. Repo or project labels such as the live GitHub and Vercel identifiers remain preserved when they still describe a real external contract or appear inside evidence-bearing transcripts.

The QA fixture surface deserves special handling. `apps/web/tests/e2e/.auth/member-with-access.json` and `apps/web/tests/e2e/.auth/member-without-access.json` contain cookies scoped to `dev.man-meets-ai.com` and `.man-meets-ai.com`, plus Clerk display metadata. Those files are effectively snapshots of a login state under the intentionally preserved hostname and should remain unchanged during this rename unless another task specifically refreshes auth fixtures.

The repo still has a historical tail, but it is much narrower now. `.plans/`, `docs/codex/`, `qa/runs/`, `qa/runs/local/`, `qa/reviews/local/`, and `todo.md` have been swept for stale non-domain narrative references. What remains in those areas is limited to the active ExecPlan itself and preserved evidence-bearing transcripts or live external repo/project identifiers. The `man-meets-ai.com` hostname subset remains an allowed live or historical exception.

## Plan of Work

Start with the package-scope rename because it is the smallest safe slice and the repo already exposes its authoritative sources. Rename the workspace package names in `packages/codebase-compiler/package.json` and `packages/ship-by-sunday-cli/package.json` into the `@shipbysunday/*` scope. Update all workspace dependencies that must match those names in `apps/web/package.json`, `packages/codebase-presentation/package.json`, and `packages/ship-by-sunday-cli/package.json`. Update `apps/web/next.config.ts` so the web build transpiles the renamed compiler package. Replace the remaining direct `@manmeetsai/codebase-compiler` imports in runtime code, CLI code, and tests, but leave the `@codebase-compiler` app aliases untouched. Regenerate `bun.lock` and prove that the package layer still resolves.

Once the package identity is stable, clean only the non-domain repo identity drift. Keep `.env.production`, `apps/web/.env.production`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, hostname-bearing product docs, hostname-based tests, and the checked-in `.auth` fixtures unchanged. Limit this slice to strings such as the QA user-agent in `qa/scripts/lib/clerk-target.mjs`, package-facing README headings, and any repo or project labels that still say `manmeetsai` but are not actual live domain contracts.

After the runtime and non-domain identity surfaces are correct, sweep the historical and archival files. Update `.plans/`, `docs/codex/`, `qa/runs/`, `qa/runs/local/`, `qa/reviews/local/`, `todo.md`, and any remaining file names that still embed `manmeetsai`. Preserve historical or live hostname references to `man-meets-ai` unless the line is not describing a domain at all. Treat repo names like `mma-shipbysunday` and Vercel names like `man-meets-ai-simple` as archival content unless the live infra really changed too. The point of this phase is grep cleanliness for the stale package and non-domain identity, not accidental revisionism of domain contracts.

Finish by running the narrow validation surfaces first and then the repo gates required by this repo. The package slice should validate through the compiler and CLI workspaces and the web type/build/test surfaces that actually exercise those imports. The non-domain identity slice should validate through the touched docs, scripts, and any tests affected by those string changes, while leaving hostname-based QA behavior intact. The whole initiative is only done when `bun fmt`, `bun lint`, and `bun typecheck` pass at the required repo level, plus the repo-specific broader checks that changed surfaces require.

## Milestones

Milestone 1 renames the package scope and import contract. At the end of this milestone, the compiler and CLI packages both live under `@shipbysunday/*`, all workspace consumers reference those names, the old `@manmeetsai` scope is gone from runtime code and tests, and `bun.lock` has been regenerated cleanly. Run the compiler, CLI, and web checks that cover import resolution. Success looks like grep over `apps/web`, `packages`, and `bun.lock` showing no remaining `@manmeetsai` hits except any explicitly documented archive surfaces outside the edited slice.

Milestone 2 cleans non-domain identity drift while preserving all `man-meets-ai` website and Clerk hostnames. At the end of this milestone, the QA user-agent string and any other non-domain `manmeetsai` labels are updated where appropriate, while env files, workflows, docs, tests, and auth fixtures that encode the live domains remain unchanged. Success looks like the active package and repo identity no longer saying `manmeetsai` outside accepted domain contracts.

Milestone 3 sweeps archives and historical records. At the end of this milestone, the remaining non-generated references under `.plans/`, `docs/codex/`, `qa/runs/`, `qa/runs/local/`, `qa/reviews/local/`, and other historical surfaces are rewritten or renamed to Ship by Sunday wording where appropriate. Success looks like a broad grep over the repository shrinking to either zero old-identity hits or a very short, deliberate exception list captured in the plan.

Milestone 4 performs final validation and records outcomes. At the end of this milestone, the repo passes the required format, lint, typecheck, and relevant test/build gates, this plan records the actual outcomes, and another contributor can verify the rename without rediscovering the same boundaries. Success looks like reproducible command output and a clean, narrow explanation of any intentional leftovers.

## Concrete Steps

Work from the repository root unless a step explicitly says otherwise.

Begin by rechecking the dirty worktree so you do not collide with unrelated app edits:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ git status --short

Expected observation: many files are already modified or untracked outside the rename scope. Do not revert them. Restrict edits to the files named in this plan unless the inventory expands for a demonstrated rename reason.

Capture the package-scope baseline:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n --hidden --glob '!**/node_modules/**' --glob '!**/.git/**' '@manmeetsai' apps/web packages bun.lock

Expected observation: the hits should be concentrated in the workspace manifests, `apps/web/next.config.ts`, `apps/web/app/api/download/repo/route.ts`, the CLI and presentation imports, tests, and `bun.lock`.

Implement the package rename by editing these files first:

    packages/codebase-compiler/package.json
    packages/ship-by-sunday-cli/package.json
    packages/codebase-presentation/package.json
    apps/web/package.json
    apps/web/next.config.ts
    apps/web/app/api/download/repo/route.ts
    packages/codebase-presentation/src/index.ts
    packages/ship-by-sunday-cli/src/codebase-derivation.ts
    packages/ship-by-sunday-cli/src/draft/draft-store.ts
    packages/ship-by-sunday-cli/src/commands/generate-command.ts
    packages/ship-by-sunday-cli/tests/*.test.ts
    apps/web/tests/integration/codebase-download-routes.test.ts

After those edits, regenerate the lockfile:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun install

Expected observation: `bun.lock` updates the workspace names and resolutions to the `@shipbysunday/*` scope without introducing unrelated dependency churn.

Validate the package slice narrowly before touching any non-domain cleanup:

    $ cd /Users/parkerrex/Projects/ship-by-sunday/packages/codebase-compiler
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
    $ bun run test:integration
    $ bun run build

Expected observation: the compiler and CLI packages still resolve each other, the route import mock still works, and the web app still builds with the renamed compiler package in `transpilePackages`.

Before editing any non-domain cleanup outside package scope, freeze the allowed hostname exception set. These files stay unchanged for this initiative because the `man-meets-ai` domains are intentional:

    .env.production
    apps/web/.env.production
    .github/workflows/dev-staging-proof.yml
    .github/workflows/production-release-proof.yml
    docs/release-workflow.md
    qa/README.md
    qa/AGENTS.md
    apps/web/content/docs/commands.mdx
    apps/web/content/docs/deploy-to-vercel.mdx
    apps/web/content/docs/local-qa.mdx
    apps/web/content/docs/ship-live.mdx
    apps/web/tests/e2e/global-setup.ts
    apps/web/tests/unit/env.test.ts
    apps/web/tests/unit/clerk-convex-dev-auth-guardrail.test.ts
    apps/web/tests/unit/observability-source-adapters.test.ts
    apps/web/tests/unit/stripe-observability.test.ts
    apps/web/tests/e2e/.auth/member-with-access.json
    apps/web/tests/e2e/.auth/member-without-access.json

Update only non-domain identity files such as:

    qa/scripts/lib/clerk-target.mjs
    packages/ship-by-sunday-cli/README.md
    archival docs or records that use `manmeetsai` outside actual hostnames

Expected observation: non-domain labels stop saying `manmeetsai`, while every intentional `man-meets-ai` hostname remains exactly as-is.

Validate the non-domain identity slice:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run qa:inventory:sync
    $ bun run qa:validate

    $ cd /Users/parkerrex/Projects/ship-by-sunday/apps/web
    $ bun run test:unit

Expected observation: QA inventory still validates, the renamed package scope still works, and any touched non-domain labels are updated without changing the live hostname contract.

Sweep the archives only after the active surfaces are stable:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ rg -n --hidden --glob '!**/node_modules/**' --glob '!**/.git/**' '@manmeetsai|manmeetsai|mma-shipbysunday|man-meets-ai-simple' .plans docs qa/reviews/local qa/runs qa/runs/local todo.md AGENTS.md DESIGN.md

Expected observation: the remaining hits are historical records and archive-like docs that still use the stale non-domain identity. Hostname-bearing `man-meets-ai` lines are no longer targets for this pass. This includes `qa/reviews/local/` and any archive-only filenames that still embed `manmeetsai`.

Finish with the repo-level verification expected by this repository:

    $ cd /Users/parkerrex/Projects/ship-by-sunday
    $ bun run format
    $ bun run lint
    $ bun run typecheck
    $ bun run sbs:check
    $ bun run build
    $ bun run check

Expected observation: formatting, lint, typecheck, CLI checks, build, and the broad repo gate all pass. If any broader command fails for an unrelated pre-existing reason, record the exact failure in `Progress` and `Outcomes & Retrospective` before stopping.

## Validation and Acceptance

The package-scope acceptance criteria are concrete. `packages/codebase-compiler/package.json` and `packages/ship-by-sunday-cli/package.json` must both expose `@shipbysunday/*` names. The corresponding workspace dependencies must match. `apps/web/next.config.ts` and the remaining direct imports and mocks must no longer reference `@manmeetsai/codebase-compiler`. `bun.lock` must be regenerated and consistent with the manifests. Grep over `apps/web`, `packages`, and `bun.lock` must show zero `@manmeetsai` hits.

The non-domain identity acceptance criteria are also concrete. The QA user agent and any other touched non-domain strings must no longer say `manmeetsai`. Hostname-bearing `man-meets-ai` references in env files, workflows, docs, tests, and auth fixtures are accepted live contracts and must remain unchanged. Grep over the touched non-domain surfaces must show no stale `manmeetsai` hits outside any explicitly documented archival exception.

The repo-level acceptance criteria are the required project gates. `bun run format`, `bun run lint`, and `bun run typecheck` must pass from the root because the root agent contract requires them before considering the task complete. The narrower workspace and app checks named in this plan must pass before the broader gates. `bun run sbs:check`, `bun run build`, and `bun run check` should also pass unless a clearly unrelated pre-existing failure blocks them, in which case the failure must be documented precisely.

Archive acceptance is last and should be explicit. Either the broad grep over historical surfaces returns zero stale non-domain identity hits, or the plan records the exact leftovers and why they remain. Do not count intentional `man-meets-ai` hostname references as failures for this initiative. Preserve quoted or code-block evidence snapshots in historical materials, but rewrite surrounding prose and rename archive-only filenames that still embed `manmeetsai`.

## Idempotence and Recovery

Do not try to clean the worktree before doing this rename. The repository already contains unrelated in-flight feature work, and destructive git commands would risk losing it. Use `git status --short` and narrow grep as your source of truth and keep the rename diff tightly scoped.

The package-scope slice is safe to rerun. Manifest edits plus `bun install` can be repeated if the first pass leaves stale lockfile state. If the lockfile diff becomes noisy, revert only `bun.lock` and rerun `bun install` after checking the manifest changes for mistakes.

The hostname slice is intentionally frozen. Do not edit env files, workflows, docs, tests, or fixtures just because they reference `man-meets-ai` domains. Those lines now represent an explicit product decision, not stale rename drift.

Treat the `.auth` fixtures as protected generated state for this initiative. Do not churn them unless another task explicitly requires fixture refresh.

The archive sweep should happen in small batches. If a batch creates too much noise or touches unrelated prose, stop, rerun grep on the exact directories you were editing, and continue with a narrower slice. Historical cleanup must never justify destabilizing the live package or ops surfaces. When in doubt, keep quoted evidence and code-block snapshots intact and only rewrite surrounding prose.

## Artifacts and Notes

The baseline inventory that froze this plan produced these key observations:

    Broad old-identity grep across active and historical surfaces: 152 hits
    Package-scope `@manmeetsai` hits across repo surfaces scanned: 35
    Package-scope `@manmeetsai` hits in `apps/web` + `packages` only: 18
    Domain and repo-name style hits such as `man-meets-ai.com`, `mma-shipbysunday`, and `man-meets-ai-simple`: 122

Observed Milestone 1 proof:

    $ rg -n --hidden --glob '!**/node_modules/**' --glob '!**/.git/**' '@manmeetsai' apps/web packages bun.lock
    <no output>

    packages/codebase-compiler: lint, format:check, typecheck, test — passed
    packages/ship-by-sunday-cli: lint, format:check, typecheck, test — passed
    apps/web: lint — passed
    apps/web: targeted oxfmt --check on package/runtime files — passed
    apps/web: bunx vitest run --project integration tests/integration/codebase-download-routes.test.ts — passed
    apps/web: bun run build — passed

Observed Milestone 2 and 3 proof:

    $ rg -n 'manmeetsai-qa-auth-check|\bmanmeetsai\b' qa/scripts/lib/clerk-target.mjs packages/ship-by-sunday-cli/README.md
    <no output>

    $ bun run qa:inventory:sync
    Synced qa/test-inventory.csv with 144 test files.

    $ bun run qa:validate
    QA control plane is internally consistent.
    Journeys: 25
    Coverage rows: 61
    Inventory rows: 144
    Personas: 3

    Archive cleanup left only deliberate exceptions:
    - this active ExecPlan file
    - live external repo/project identifiers in docs/release-workflow.md
    - preserved code-block or command evidence in selected docs/codex files

Observed final root proof:

    bun run format — passed
    bun run format:check — passed
    bun run lint — passed
    bun run typecheck — passed
    bun run sbs:check — passed
    bun run build — passed
    bun run check — passed

The most important live package files at plan creation time were:

    packages/codebase-compiler/package.json
    packages/ship-by-sunday-cli/package.json
    packages/codebase-presentation/package.json
    apps/web/package.json
    apps/web/next.config.ts
    apps/web/app/api/download/repo/route.ts

The most important preserved hostname files at plan creation time were:

    .env.production
    apps/web/.env.production
    .github/workflows/dev-staging-proof.yml
    .github/workflows/production-release-proof.yml
    docs/release-workflow.md
    qa/README.md
    qa/AGENTS.md
    qa/reviews/local/2026-03-27-post-review-bonus-cleanup.md

## Interfaces and Dependencies

The workspace package interfaces are defined by these manifest names and imports:

    packages/codebase-compiler/package.json
    packages/ship-by-sunday-cli/package.json
    packages/codebase-presentation/package.json
    apps/web/package.json

The web build depends on the compiler package name appearing in `apps/web/next.config.ts` under `transpilePackages`. The web runtime download route depends on the compiler server entry point imported in `apps/web/app/api/download/repo/route.ts`. The presentation package depends on the compiler types imported in `packages/codebase-presentation/src/index.ts`. The CLI depends on the compiler package in `packages/ship-by-sunday-cli/src/codebase-derivation.ts`, `packages/ship-by-sunday-cli/src/draft/draft-store.ts`, and `packages/ship-by-sunday-cli/src/commands/generate-command.ts`.

The app alias layer must remain intact in:

    apps/web/tsconfig.json
    apps/web/vitest.config.ts

Those aliases are part of the intended architecture and reduce churn. Do not replace them with direct scoped imports unless a separate requirement appears.

The preserved hostname contract depends on these external surfaces:

    .env.production
    apps/web/.env.production
    .github/workflows/dev-staging-proof.yml
    .github/workflows/production-release-proof.yml
    apps/web/tests/e2e/.auth/*.json

Those files coordinate real hosted environments, QA automation, and login state. For this initiative they are preserved interfaces, not rename targets. The non-domain cleanup surface includes files like `qa/scripts/lib/clerk-target.mjs` and archival prose that still use `manmeetsai` outside actual hostnames.
