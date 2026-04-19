---
title: Release Hardening And Proof Automation
status: complete
created_at: 2026-04-18
completed_at: 2026-04-19
summary: Harden the Ship by Sunday release system so a pricing, checkout, or billing change can move from dev to main without multi-day env drift, mergeability surprises, or brittle browser-proof debugging.
post_build_recap: "The repo now has a real release control plane: release triage, a root-safe billing doctor, a hardened land skill, a guarded snapshot fallback, and aligned release/QA docs, all validated through format, lint, typecheck, QA integrity, and focused unit plus command proofs."
read_when:
  - Reviewing the finished release-hardening control plane.
  - Reusing release triage, billing doctor, or snapshot fallback patterns.
  - Auditing a future release incident against the codified workflow.
---

# Release Hardening And Proof Automation

This document is a living execution plan for making the Ship by Sunday release system predictably shippable, especially when pricing, checkout, Stripe, Clerk, Convex, or release workflows change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The user-visible outcome is simple: a release owner should be able to say "ship this to main" and get one clean answer about whether the current `dev` head is releasable, what exact deployment and env are being proved, and what has to be fixed before promotion. A small marketing or pricing change should not require rediscovering Stripe env drift, preview alias drift, proof-path drift, or branch-merge policy drift across multiple emergency follow-up PRs. When this plan is complete, the repository will have one explicit release-triage flow, one explicit billing-proof doctor, one stable hosted billing verifier path, one hardened land skill, and one documented snapshot-release fallback for repositories that cannot rely on a simple `dev -> main` PR merge.

## Progress

- [x] 2026-04-18 12:xx EDT — Captured the release-hardening scope from the just-completed `price-fixes` ship and the observed release failures in staging and production.
- [x] 2026-04-18 12:xx EDT — Inspected the current release workflow, QA control plane, and shared land skill to anchor the plan in real repo surfaces instead of a vague retrospective.
- [x] 2026-04-19 11:xx EDT — Grilled the plan against the current repo and rebased scope after confirming that hosted billing verifiers, pre-proof Stripe env verification, and part of the release-candidate documentation already ship on `main`.
- [x] 2026-04-19 00:45 EDT — Implemented the first Milestone 1 slice: `bun run release:triage` now reuses the existing release-scope classifier, resolves the current `origin/dev` candidate, inspects the matching `dev -> main` PR, summarizes the latest staging proof checks on that SHA, and reports when local Vercel deployment metadata is still blocked.
- [x] 2026-04-19 00:54 EDT — Implemented the Milestone 2 billing doctor slice: `bun run release:billing:doctor` now works from the repo root and from `apps/web`, maps preview and production to the correct env file plus expected Stripe mode, and extends hosted Stripe verification to reject promo codes that do not apply to the configured product or current order amount.
- [x] 2026-04-19 01:00 EDT — Hardened `.agents/skills/shared/land/SKILL.md` so release work now runs triage before trusting `dev -> main`, uses real command names (`format:check`, `check`, `qa:validate`, billing doctor), waits for push propagation before opening PRs, and treats snapshot fallback as an explicit stop condition instead of ad hoc recovery.
- [x] 2026-04-19 01:00 EDT — Codified the release-snapshot fallback as `bun run release:snapshot` plus `.agents/skills/shared/release-snapshot/SKILL.md`, with deterministic branch naming, a dry-run path, tree-identity proof, rollback commands, and a hard refusal when the current release PR is still mergeable.
- [x] 2026-04-19 01:19 EDT — Updated `docs/release-workflow.md` and `qa/README.md` to define the release candidate contract, point at the new triage and billing-doctor commands, document snapshot fallback use, and codify local reconciliation after release repairs.
- [x] 2026-04-19 01:19 EDT — Ran the full completion proof: `bun run format`, `bun run lint`, `bun run typecheck`, `bun run qa:validate`, focused unit suites for triage/billing/snapshot helpers, command dry-runs for triage and billing doctor, `release:snapshot -- --dry-run`, plan lint, markdown lint, and `git diff --check`.

## Surprises & Discoveries

The release that motivated this plan did not stall because the feature itself was especially large. It stalled because the release system had multiple independent sources of drift that only became visible after the feature landed into `dev`. The concrete failures were layered: staging preview env was missing `STRIPE_PROMOTION_CODE_ID`; staging preview still pointed at a stale `$250` managed Stripe price; the checkout route sent a Stripe payload containing both `discounts` and `allow_promotion_codes`; the hosted staging billing lane depended on brittle Stripe sandbox UI behavior; the hosted billing verifier was invoked from the wrong working directory for Convex CLI resolution; manual proof forcing also forced an unrelated hosted Convex sync path; production Vercel env later pointed at a stale `$250` live price; and the live promo code initially configured for production did not actually apply to the current order.

The release path also exposed a branch-policy surprise. The repository's protected-branch setup disallowed merge commits, while the long-lived historical divergence between `dev` and `main` made the normal `dev -> main` PR structurally hard to merge. That forced a snapshot-release branch to preserve the current `dev` tree on top of `main`. This is not a coding bug inside the product; it is a release-operations contract bug inside the repository.

The most important operational discovery is that the safest hosted billing proof path is not the sandbox browser lane. Local development can still use a sandbox path, but hosted staging and production need a direct hosted verifier that proves the real `/api/stripe/checkout -> Checkout -> /checkout/success -> access handoff` flow without depending on Stripe's ever-changing interactive UI structure.

The plan itself also started stale one day after it was written. By the time this grilling pass happened, `qa/scripts/lib/billing-integration-step-planner.mjs`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `docs/release-workflow.md`, and `qa/README.md` already defaulted hosted staging and production to the direct hosted verifier path and already verified managed Stripe env before hosted billing proof. The remaining work is therefore not "switch hosted proof routing" but "make triage, land orchestration, and snapshot fallback explicit and safe."

The first live `release:triage` run surfaced the exact local blind spot the plan is supposed to catch. GitHub metadata resolved cleanly enough to prove that `origin/dev` currently has an open `dev -> main` release PR, that the PR head matches the `origin/dev` candidate SHA, and that the latest `release_scope`, `default_ship`, `billing_integration`, and `release_gate` checks on that SHA are all green. The command still returned `releasePath.state = blocked_metadata` because local triage had no `VERCEL_TOKEN`, so it could not prove which preview deployment currently owns `dev.man-meets-ai.com`. That is the right failure mode: missing deployment truth should block the release-control-plane answer instead of letting the operator infer it from stale memory.

The other implementation discovery is practical rather than architectural: the raw `main..dev` file list is already 863 paths in this repository state. The release-triage surface therefore needs counts plus small samples by default, not full changed-file arrays, or the command becomes unreadable before it helps anyone.

The billing doctor slice showed that the missing proof gap was narrower than it first looked. The existing managed env verifier already covered secret mode, price amount, currency, product ID, and promotion-code presence. The real missing contract was promotion-code applicability. Extending `apps/web/platform/billing/stripe.ts` to inspect the promotion code's coupon product restrictions and minimum-amount requirements was enough to turn the existing verifier into a release-ready doctor without adding any write-path or second Stripe verification stack.

The real `release:snapshot -- --dry-run` result is useful evidence on its own: the fallback is now codified tightly enough to refuse the current repo state. Right now PR `#83` is `mergeable=MERGEABLE` with `mergeStateStatus=BEHIND`, so the snapshot command exits non-zero and prints that snapshot mode is forbidden because the normal release path is not structurally blocked. That is the intended control-plane behavior after the earlier incident.

## Decision Log

2026-04-18 — Decision: treat release hardening as its own initiative instead of burying it inside the finished `price-fixes` branch. Rationale: the failure set spans GitHub Actions, Vercel env management, Stripe asset parity, QA proof routing, and release-branch policy, which is wider than a single feature diff.

2026-04-18 — Decision: define "release candidate" in repo-local, evidence-bearing terms. Rationale: the prior release implicitly treated "whatever is on `dev`" as the candidate, which hid the need to freeze one exact `dev` SHA, one exact preview deployment, and one exact proof run.

2026-04-18 — Decision: use direct hosted verifiers for hosted staging and production billing proof, while keeping sandbox UI proof only for local development. Rationale: hosted proof must be stable against Stripe UI churn and should validate app-owned contracts before browser automation enters brittle surfaces.

2026-04-18 — Decision: the land skill must explicitly know when it is doing feature landing versus release hardening. Rationale: the previous rollout kept discovering release-system failures inline because the orchestration layer did not stop and reframe the work as release repair.

2026-04-18 — Decision: codify a release-snapshot fallback. Rationale: if `dev -> main` is structurally blocked by repo history or policy, the recovery path must be explicit and reviewable rather than improvised under pressure.

2026-04-19 — Decision: reuse the existing release-scope classifier and managed Stripe env verifier instead of designing parallel detection surfaces. Rationale: `qa/scripts/lib/release-scope.mjs`, `qa/scripts/detect-release-scope.mjs`, and `apps/web/scripts/verify-managed-stripe-env.ts` already carry part of the release contract; the remaining work is to assemble and expose them coherently.

2026-04-19 — Decision: treat metadata failure as a release-triage result, not as an implementation detail hidden inside a script. Rationale: if `gh` mergeability or Vercel deployment metadata cannot be fetched, the release owner still needs a deterministic answer, which should be "blocked, cannot prove release candidate" rather than a silent fallback.

2026-04-19 — Decision: split the triage result into release-path state and overall readiness. Rationale: the repository can have a clean `dev -> main` PR plus green staging proof and still be blocked because the exact preview deployment cannot be proven locally; collapsing those into one boolean would hide which control-plane surface actually needs repair.

2026-04-19 — Decision: default the triage payload to counts and small file samples instead of full diff lists. Rationale: the current `origin/main...origin/dev` delta is already large enough that a full changed-file dump makes the operator output noisy without improving the release decision.

2026-04-19 — Decision: implement the billing doctor as one shared command surface in `apps/web` and delegate to it from the repo root. Rationale: the release owner needs one operator command that behaves the same in both working directories, but the underlying verifier already lives inside `apps/web` and should remain the single billing contract implementation.

2026-04-19 — Decision: verify promotion-code applicability by reading Stripe promotion-code and coupon metadata instead of creating a disposable checkout session inside the doctor. Rationale: Milestone 2 needs a safe, read-only drift detector that can fail before browser proof starts; product restrictions plus minimum-amount restrictions cover the missing misconfiguration class without widening the command into a write path.

2026-04-19 — Decision: snapshot fallback should require a structurally blocked open `dev -> main` PR before it will create anything. Rationale: the earlier incident proved that snapshot mode is a release-policy recovery tool, not a convenience path. Refusing the command when the normal release PR is still mergeable keeps the fallback from becoming the default.

2026-04-19 — Decision: harden `land` by routing release-specific proof through repo-owned commands instead of invented aliases. Rationale: stale command names like `fmt:check` and `proof:ci` hide the real control plane and make release repair harder during incidents.

## Outcomes & Retrospective

The planned release-control-plane layers are all in place now. A release owner can run `bun run release:triage` to resolve the exact `origin/dev` candidate, see the matching `dev -> main` PR state, and understand whether the normal release path is clean, metadata-blocked, scope-blocked, or snapshot-only. They can run `bun run release:billing:doctor -- --env=preview|production` from either the repo root or `apps/web` to fail fast on Stripe price, product, or promo drift before hosted billing proof begins. `land` now points at these repo-owned commands instead of stale aliases, and `release:snapshot` codifies the fallback with a dry-run gate, deterministic branch naming, tree-identity proof, rollback commands, and a hard refusal when the normal release PR is still mergeable.

Compared with the motivating incident, the repo now surfaces the earlier hidden drift points as explicit operator answers instead of scattered tribal knowledge: missing Vercel deployment truth shows up in triage as `blocked_metadata`, stale Stripe promo applicability fails in the billing doctor instead of later in browser proof, stale ship commands are gone from `land`, and snapshot mode is no longer an improvised git trick. The remaining operational limitation is deliberate rather than accidental: local `release:triage` still needs a local `VERCEL_TOKEN` to resolve the exact preview deployment and alias binding, and it now says so plainly when that token is absent.

## Context and Orientation

The current release system lives across five durable surfaces. `docs/release-workflow.md` defines the human release contract. `qa/README.md` and `qa/scripts/lib/billing-integration-step-planner.mjs` define how staging and production proof are selected and run. `qa/scripts/lib/release-scope.mjs` plus `qa/scripts/detect-release-scope.mjs` already classify billing-sensitive and Convex-sensitive diffs. `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml` define the integrated staging and production proof runs. The shared land skill at `.agents/skills/shared/land/SKILL.md` defines what an agent is supposed to do when asked to ship. The Stripe contract lives under `apps/web/platform/billing/stripe.ts` and `apps/web/scripts/verify-managed-stripe-env.ts`, with the hosted billing verifier in `apps/web/scripts/verify-hosted-stripe-checkout.mjs`.

The repository now has the release-control-plane layers it was missing. `qa/scripts/release-triage.mjs`, `qa/scripts/lib/release-triage.mjs`, and `.agents/skills/shared/release-triage/SKILL.md` cover release candidate truth. `apps/web/scripts/release-billing-doctor.mjs`, `apps/web/scripts/lib/release-billing-doctor.mjs`, and the delegated root `release:billing:doctor` script cover Stripe env and promo drift detection. `.agents/skills/shared/land/SKILL.md`, `qa/scripts/release-snapshot.mjs`, `qa/scripts/lib/release-snapshot.mjs`, and `.agents/skills/shared/release-snapshot/SKILL.md` cover orchestration and fallback. `docs/release-workflow.md` and `qa/README.md` now teach the same contract instead of diverging from the implemented repo surfaces.

An exact release candidate in this repository must mean four things at once: one exact `origin/dev` SHA, one exact Vercel deployment URL bound to that SHA, one exact pulled app env file for that deployment target, and one green staging proof run on that same SHA. If any of those are missing or unverifiable, triage should say the candidate is blocked.

### In Scope

This plan covers release-triage authoring, billing-proof drift detection, workflow flag hygiene, land skill hardening, release snapshot fallback design, and the docs updates needed to make those flows legible to future agents and humans. It also covers the focused tests and docs-lint surfaces needed to keep the release-control-plane changes stable. Reusing and tightening existing hosted-proof routing is in scope; re-implementing hosted proof routing from scratch is not.

### Out Of Scope

This plan does not redesign checkout UX, homepage copy, or the product itself. It does not migrate the repository back to a long-lived merge-commit workflow, replace GitHub branch protection policy globally, or redesign Stripe pricing strategy. It does not introduce dedicated Convex-backed feature previews for every feature branch. It also does not attempt to rewrite the full historical backlog on `dev`; it only codifies how to handle that situation safely in the future.

## Plan of Work

The work should proceed in four layers. First, define and implement a release-triage layer that inspects the exact `dev` candidate before any release attempt begins and reuses the existing release-scope classifier instead of replacing it. Second, extend the existing managed Stripe env verifier into a billing-proof doctor that is explicit about preview versus production and that can be called from the repository root as a stable operator surface. Third, update the shared land skill to call triage first, surface stop conditions sooner, fix its stale local-proof commands, and choose snapshot mode only when the normal release PR path is structurally broken. Fourth, codify the release-snapshot fallback and the release docs so future agents stop improvising this logic during a live ship.

The implementation should stay narrow and additive. Prefer new shared skills and small wrapper entrypoints over broad refactors. The tests should focus on release-scope detection, planner selection, workflow flag behavior, triage output, and snapshot dry-run behavior. Documentation should only be updated after the workflow and skill surfaces are implemented and validated.

## Milestones

Milestone 1 creates the release-triage layer. At the end of this milestone, a newcomer can run one command or invoke one shared skill and learn whether the current `dev` head is actually releasable, what preview deployment and pulled env are bound to that release candidate, whether the release PR path is mergeable, and whether snapshot release mode should be used. Success is a deterministic summary rather than another exploratory debugging session, and a metadata failure must show up as an explicit blocked result.

Milestone 2 creates the billing-proof doctor. At the end of this milestone, preview and production proof fail immediately when Stripe env or assets drift from repo truth, but the doctor is implemented as an explicit contract around the existing `apps/web/scripts/verify-managed-stripe-env.ts` behavior instead of a second independent verifier. Success is that stale `STRIPE_PRICE_ID`, stale `STRIPE_PROMOTION_CODE_ID`, or a promo code that does not apply to the current product are caught before Playwright ever opens a browser, from either the repo root or `apps/web`.

Milestone 3 hardens the shared shipping workflow. At the end of this milestone, the land skill starts with triage, uses real local proof commands that exist in `package.json`, distinguishes feature landing from release hardening, and only allows snapshot release mode when the triage result proves the normal `dev -> main` PR path is structurally blocked under repo policy. Success is that the next release does not require improvising recovery branches or hidden Git strategies.

Milestone 4 codifies the snapshot fallback. At the end of this milestone, the repository has one repeatable release-snapshot skill or script with a literal git procedure, branch naming convention, tree-identity proof against `origin/dev`, rollback guidance, and post-merge cleanup instructions. Success is that a fresh agent can run the dry-run path safely without asking how the previous incident was recovered.

Milestone 5 writes the durable docs and post-ship guidance. At the end of this milestone, release docs, QA docs, and skill docs explain what a release candidate is, what has to be green before `main`, how triage results should be interpreted, and how local developers should reconcile after a messy release. Success is that a newcomer can understand the release process without replaying this incident.

## Concrete Steps

Start by creating a new shared skill under `.agents/skills/shared/release-triage/SKILL.md`. Pair it with a repo-level script, preferably under `qa/scripts/`, that prints a structured summary of the current release candidate. The implementation must reuse `qa/scripts/lib/release-scope.mjs` and `qa/scripts/detect-release-scope.mjs` for changed-file classification rather than duplicating billing and Convex sensitivity logic. The triage output must name the candidate branch and SHA, the preview deployment URL if one can be resolved, the current `dev -> main` PR state if one exists, whether the head is mergeable into `main`, whether billing or Convex proof are required by the changed files, and whether snapshot mode is required. If GitHub or Vercel metadata cannot be fetched, the command should still return a structured blocked result that says exactly which source of truth is unavailable.

This first slice now exists as `bun run release:triage`. The command defaults to `origin/main` versus `origin/dev`, samples large file lists down to a readable payload, and currently reports `blocked_metadata` locally when `VERCEL_TOKEN` is absent even if GitHub proof metadata is green. Keep that behavior intact while adding the remaining release-control-plane layers.

Define the exact meaning of "one exact env set" inside the triage contract. In this repository that should mean the app env file pulled from Vercel for the target deployment environment, plus the GitHub Actions environment name that supplied secrets for the proof run. The triage output should say which env file path or Vercel environment it used so the operator can tell whether preview or production truth was checked.

Add a billing doctor command, ideally something like `bun run release:billing:doctor -- --env=preview` and `--env=production`, but implement it as a root-safe wrapper around `apps/web/scripts/verify-managed-stripe-env.ts` and `apps/web/platform/billing/stripe.ts`. Extend the verifier only where the current contract is missing proof. It should verify that the configured managed price amount matches `productConfig.priceUsdCents`, that the configured promo code exists, and that the promo code applies to the current product or order. Keep the command runnable from the repository root and from `apps/web` without ambiguity, and document which flags map to `--expected-mode=test` versus `--expected-mode=live`.

This second slice now exists as `bun run release:billing:doctor -- --env=preview|production`. The command delegates into `apps/web`, supports a read-only `--dry-run` mode, and currently proves the env/mode mapping without requiring local Stripe or Vercel credentials. The underlying `assertManagedStripeEnvReadyForRelease()` contract now also fails on promotion codes whose coupon product restrictions or minimum-order restrictions do not match the repository pricing truth.

Do not rewrite hosted proof routing from scratch. Instead, preserve the current behavior in `qa/scripts/lib/billing-integration-step-planner.mjs` and tighten only what is missing: dry-run output should explicitly surface whether the chosen path is local sandbox, hosted dev verifier, or hosted production verifier, and the tests under `apps/web/tests/unit/billing-integration-step-planner.test.ts` should cover that language. Keep `.github/workflows/dev-staging-proof.yml` and `.github/workflows/production-release-proof.yml` aligned with the planner contract and make sure manual `force_billing=true` only means "billing proof required," not "run unrelated Convex sync."

Update `.agents/skills/shared/land/SKILL.md` so it explicitly runs release triage before opening or trusting a `dev -> main` release path. Replace the stale local-proof commands `bun run fmt:check` and `bun run proof:ci` with commands that actually exist in `package.json`, or with the exact narrower commands the triage output says are required. Add a stop condition that says "if the release PR is structurally unmergeable under repo policy, switch to the documented release-snapshot fallback instead of improvising." Add a short section about waiting for push completion before opening a PR to avoid the race that repeatedly caused false "No commits between..." GitHub responses.

This third slice is now in place. Keep `land` aligned with the repo-owned command surfaces (`release:triage`, `release:billing:doctor`, `release:snapshot`, `qa:validate`, `check`) instead of reintroducing made-up aliases or hidden git recovery moves.

Add a release-snapshot fallback skill or script. The minimal version can live under `.agents/skills/shared/release-snapshot/SKILL.md` and call a repo script that builds a one-commit release snapshot branch whose tree exactly matches `origin/dev` on top of `origin/main`. The implementation contract must spell out the branch naming convention, the exact git recipe, a dry-run mode, the tree-identity proof command, the PR target, how to roll the branch back if validation fails, and when snapshot mode is forbidden because it would ship unapproved `dev` scope.

This fourth slice is now in place as `bun run release:snapshot`. The current repo state proves the forbidden path: dry-run exits non-zero and prints that snapshot mode is not allowed because PR `#83` is still mergeable.

After the code and skills are stable, update `docs/release-workflow.md`, `qa/README.md`, and any linked QA or release docs to define "release candidate" explicitly in the same words the triage command prints. Also document post-ship reconciliation: after a messy release, local work should move onto a fresh branch from current `origin/dev` for feature work or current `origin/main` for hotfix work, and stale local release-repair branches should be deleted.

Recommended commands while implementing:

    bun run release:triage
    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-18-release-hardening-and-proof-automation.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-18-release-hardening-and-proof-automation.md
    git diff --check
    bun run format
    bun run lint
    bun run typecheck
    bun run qa:validate

## Validation and Acceptance

Acceptance is operational, not rhetorical. The release-triage surface must answer release readiness before anyone starts shipping, and it must emit an explicit blocked result when GitHub mergeability or Vercel deployment metadata cannot be fetched. The billing doctor must fail immediately on stale Stripe price or promo configuration in preview and production and must be callable from the repository root without guessing the right working directory. The land skill must use commands that exist, must call triage first, and must choose a documented snapshot-release fallback only when the triage result proves the normal `dev -> main` PR path is structurally blocked. The snapshot-release helper must prove that the snapshot branch tree matches `origin/dev` before a PR is opened. The release docs must explain what a release candidate is and what local reconciliation should look like after a messy ship.

### Test Commands

    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-18-release-hardening-and-proof-automation.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-18-release-hardening-and-proof-automation.md
    git diff --check
    bun run format
    bun run lint
    bun run typecheck
    bun run qa:validate
    bunx vitest --config apps/web/vitest.config.ts run --project unit apps/web/tests/unit/release-scope.test.ts apps/web/tests/unit/billing-integration-step-planner.test.ts apps/web/tests/unit/hosted-stripe-checkout-proof.test.ts apps/web/tests/unit/qa-run-pack.test.ts
    QA_ALLOW_BILLING_INTEGRATION=1 PLAYWRIGHT_BASE_URL=https://dev.man-meets-ai.com node qa/scripts/run-pack.mjs --pack=billing_integration --slug=dev-proof-check --dry-run=1
    QA_ALLOW_BILLING_INTEGRATION=1 PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com node qa/scripts/run-pack.mjs --pack=billing_integration --slug=prod-proof-check --dry-run=1
    node qa/scripts/detect-release-scope.mjs --base="$(git merge-base origin/main origin/dev)" --head="origin/dev"
    bun run release:triage -- --output=/tmp/release-triage.json
    bun run release:billing:doctor -- --env=preview --dry-run
    bun run release:billing:doctor -- --env=production --dry-run

## Idempotence and Recovery

All new commands and skills must be safe to rerun. Release triage and billing doctor commands should be read-only unless they explicitly declare an operator action. Hosted proof helpers may create temporary Stripe proof assets, but they must either reuse durable configured assets or delete one-time proof coupons after use. If a workflow-dispatch proof run fails because of env drift, fix the env and rerun the same proof; do not paper over the failure by weakening the contract. If a snapshot-release branch is created, it should be reproducible from the same `origin/dev` and `origin/main` inputs, and the dry-run path must prove that no branch or PR was created. The live path must record how to delete the snapshot branch and close the PR if validation fails. If implementation goes sideways, revert the new release-hardening scripts or skill files independently without touching product code.

## Artifacts and Notes

Important release clues from the motivating incident:

    staging preview env initially had STRIPE_PRICE_ID set to a stale $250 test price
    staging preview env initially had no STRIPE_PROMOTION_CODE_ID at all
    production env later had the correct live promo ID missing, then the correct promo ID present but a stale $250 live price, then a promo that existed but did not apply to the current order
    checkout route previously failed because it sent both discounts and allow_promotion_codes
    hosted Stripe sandbox proof later failed because the UI required explicit card selection and card-form filling
    the final working production release used main commit b0dcf3e with green CI, green Convex Production Deploy, and green Production Release Proof

Important repo surfaces to touch:

    .agents/skills/shared/land/SKILL.md
    .agents/skills/shared/release-triage/SKILL.md
    .agents/skills/shared/release-snapshot/SKILL.md
    apps/web/tests/unit/release-triage.test.ts
    apps/web/tests/unit/release-billing-doctor.test.ts
    apps/web/tests/unit/release-snapshot.test.ts
    docs/release-workflow.md
    qa/README.md
    qa/scripts/detect-release-scope.mjs
    qa/scripts/lib/release-scope.mjs
    qa/scripts/lib/release-triage.mjs
    qa/scripts/lib/release-snapshot.mjs
    qa/scripts/release-triage.mjs
    qa/scripts/release-snapshot.mjs
    qa/scripts/lib/billing-integration-step-planner.mjs
    .github/workflows/dev-staging-proof.yml
    .github/workflows/production-release-proof.yml
    apps/web/scripts/lib/release-billing-doctor.mjs
    apps/web/scripts/release-billing-doctor.mjs
    apps/web/scripts/verify-managed-stripe-env.ts
    apps/web/scripts/verify-hosted-stripe-checkout.mjs
    apps/web/platform/billing/stripe.ts
    apps/web/tests/unit/release-scope.test.ts
    apps/web/tests/unit/billing-integration-step-planner.test.ts
    qa/test-inventory.csv

Release-triage evidence from the first local run:

    candidate sha: dc03ccec93e285416831657511bc7836c80de7bd
    release path state: blocked_metadata
    latest required checks: release_scope=success, default_ship=success, billing_integration=success, release_gate=success
    blocker: missing VERCEL_TOKEN prevented preview deployment resolution for dev.man-meets-ai.com

Billing-doctor dry-run evidence from both working directories:

    root preview dry-run:
    envFile=.env.local
    expectedMode=test
    appBaseUrl=https://dev.man-meets-ai.com

    root production dry-run:
    envFile=.env.production
    expectedMode=live
    appBaseUrl=https://www.man-meets-ai.com

    apps/web preview dry-run:
    envFile=.env.local
    expectedMode=test
    appBaseUrl=https://dev.man-meets-ai.com

Release-snapshot dry-run evidence from the current repo state:

    allowed=false
    blocker=Snapshot release is forbidden because release PR #83 is not structurally blocked (mergeable=MERGEABLE, mergeStateStatus=BEHIND).
    candidate tree sha=ca70bc096cf3806959389b8859581f178de2fefd
    proposed branch name format=release-snapshot-YYYYMMDD-HHMMSS

## Interfaces and Dependencies

The release-triage interface now lives in `qa/scripts/release-triage.mjs` with pure summary helpers in `qa/scripts/lib/release-triage.mjs`. It returns a structured summary that can be used by both the shared skill and future orchestration code. It depends on Git state, GitHub PR metadata, the existing release-scope classifier, and Vercel deployment metadata. It must keep distinguishing four release-path states clearly: releasable, blocked by metadata, blocked by unrelated `dev` scope, and snapshot-required. It also now exposes overall readiness separately from release-path state so the operator can tell whether the release path is clean but the exact deployment/env proof is still missing. The billing doctor now lives in `apps/web/scripts/release-billing-doctor.mjs` with config helpers in `apps/web/scripts/lib/release-billing-doctor.mjs`, delegated from the root `release:billing:doctor` script. It depends on the Stripe SDK and the server env contract in `apps/web/platform/env/server.ts`, and it now treats `STRIPE_PRICE_ID`, `STRIPE_PRODUCT_ID`, and `STRIPE_PROMOTION_CODE_ID` as a single release contract that includes promo applicability, not just existence. The hardened land skill depends on the triage output and these repo-owned commands; it should orchestrate them, not reimplement them. The snapshot-release fallback now lives in `qa/scripts/release-snapshot.mjs` with pure eligibility and branch-plan helpers in `qa/scripts/lib/release-snapshot.mjs`. Its public contract is explicit: "create a release branch whose tree exactly matches `origin/dev` on top of `origin/main`, but only after the open `dev -> main` PR proves the normal path is structurally blocked."
