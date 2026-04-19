---
title: Release Hardening And Proof Automation
status: active
created_at: 2026-04-18
completed_at: null
summary: Harden the Ship by Sunday release system so a pricing, checkout, or billing change can move from dev to main without multi-day env drift, mergeability surprises, or brittle browser-proof debugging.
post_build_recap: null
read_when:
  - Resuming release-hardening implementation.
  - Grilling the release-system plan before coding.
  - Updating billing proof automation or release workflow docs.
---

# Release Hardening And Proof Automation

This document is a living execution plan for making the Ship by Sunday release system predictably shippable, especially when pricing, checkout, Stripe, Clerk, Convex, or release workflows change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The user-visible outcome is simple: a release owner should be able to say "ship this to main" and get one clean answer about whether the current `dev` head is releasable, what exact deployment and env are being proved, and what has to be fixed before promotion. A small marketing or pricing change should not require rediscovering Stripe env drift, preview alias drift, proof-path drift, or branch-merge policy drift across multiple emergency follow-up PRs. When this plan is complete, the repository will have one explicit release-triage flow, one explicit billing-proof doctor, one stable hosted billing verifier path, one hardened land skill, and one documented snapshot-release fallback for repositories that cannot rely on a simple `dev -> main` PR merge.

## Progress

- [x] 2026-04-18 12:xx EDT — Captured the release-hardening scope from the just-completed `price-fixes` ship and the observed release failures in staging and production.
- [x] 2026-04-18 12:xx EDT — Inspected the current release workflow, QA control plane, and shared land skill to anchor the plan in real repo surfaces instead of a vague retrospective.
- [ ] Write the new shared release-triage skill and the supporting repo command surface.
- [ ] Add a Stripe billing-proof doctor that fails fast on env and asset drift before browser proof starts.
- [ ] Move hosted staging and production billing proof onto the direct hosted verifier path as the default proof contract and remove hidden sandbox-only assumptions from hosted lanes.
- [ ] Harden the shared land skill so it runs release triage first, distinguishes feature landing from release hardening, and knows when snapshot release mode is required.
- [ ] Codify the release-snapshot fallback as a repeatable repo skill or command instead of an improvised recovery maneuver.
- [ ] Update release docs and QA docs so a newcomer can understand what a release candidate is and what has to be green before `main`.

## Surprises & Discoveries

The release that motivated this plan did not stall because the feature itself was especially large. It stalled because the release system had multiple independent sources of drift that only became visible after the feature landed into `dev`. The concrete failures were layered: staging preview env was missing `STRIPE_PROMOTION_CODE_ID`; staging preview still pointed at a stale `$250` managed Stripe price; the checkout route sent a Stripe payload containing both `discounts` and `allow_promotion_codes`; the hosted staging billing lane depended on brittle Stripe sandbox UI behavior; the hosted billing verifier was invoked from the wrong working directory for Convex CLI resolution; manual proof forcing also forced an unrelated hosted Convex sync path; production Vercel env later pointed at a stale `$250` live price; and the live promo code initially configured for production did not actually apply to the current order.

The release path also exposed a branch-policy surprise. The repository's protected-branch setup disallowed merge commits, while the long-lived historical divergence between `dev` and `main` made the normal `dev -> main` PR structurally hard to merge. That forced a snapshot-release branch to preserve the current `dev` tree on top of `main`. This is not a coding bug inside the product; it is a release-operations contract bug inside the repository.

The most important operational discovery is that the safest hosted billing proof path is not the sandbox browser lane. Local development can still use a sandbox path, but hosted staging and production need a direct hosted verifier that proves the real `/api/stripe/checkout -> Checkout -> /checkout/success -> access handoff` flow without depending on Stripe's ever-changing interactive UI structure.

## Decision Log

2026-04-18 — Decision: treat release hardening as its own initiative instead of burying it inside the finished `price-fixes` branch. Rationale: the failure set spans GitHub Actions, Vercel env management, Stripe asset parity, QA proof routing, and release-branch policy, which is wider than a single feature diff.

2026-04-18 — Decision: define "release candidate" in repo-local, evidence-bearing terms. Rationale: the prior release implicitly treated "whatever is on `dev`" as the candidate, which hid the need to freeze one exact `dev` SHA, one exact preview deployment, and one exact proof run.

2026-04-18 — Decision: use direct hosted verifiers for hosted staging and production billing proof, while keeping sandbox UI proof only for local development. Rationale: hosted proof must be stable against Stripe UI churn and should validate app-owned contracts before browser automation enters brittle surfaces.

2026-04-18 — Decision: the land skill must explicitly know when it is doing feature landing versus release hardening. Rationale: the previous rollout kept discovering release-system failures inline because the orchestration layer did not stop and reframe the work as release repair.

2026-04-18 — Decision: codify a release-snapshot fallback. Rationale: if `dev -> main` is structurally blocked by repo history or policy, the recovery path must be explicit and reviewable rather than improvised under pressure.

## Outcomes & Retrospective

This section is intentionally incomplete because the work has not been implemented yet. The expected finished state is a release system that answers four questions before any ship begins: what exact `dev` commit is the release candidate, what exact deployment is being proved, whether hosted Stripe env and assets match repo pricing truth, and whether the normal `dev -> main` merge path is structurally valid. The retrospective must compare the final workflow against the recent release and call out whether we actually reduced the number of surprise follow-up PRs, reruns, and production env edits required to ship a pricing or checkout change.

## Context and Orientation

The current release system lives across four durable surfaces. `docs/release-workflow.md` defines the human release contract. `qa/README.md` and `qa/scripts/lib/billing-integration-step-planner.mjs` define how staging and production proof are selected and run. `.github/workflows/dev-staging-proof.yml` defines the integrated staging proof. The shared land skill at `.agents/skills/shared/land/SKILL.md` defines what an agent is supposed to do when asked to ship. The Stripe contract lives under `apps/web/platform/billing/stripe.ts` and `apps/web/scripts/verify-managed-stripe-env.ts`, with the hosted billing verifier in `apps/web/scripts/verify-hosted-stripe-checkout.mjs`.

The repository currently has the right low-level ingredients, but they are not assembled into one deterministic release operating system. There is no dedicated release-triage skill, no first-class billing doctor command that runs before browser proof, no stable documented snapshot-release fallback, and no hardened explanation of what a release candidate is. The newcomer implementing this plan should think of the task as "build the release control plane that tells the truth early."

### In Scope

This plan covers release-triage authoring, billing-proof drift detection, hosted billing proof routing for staging and production, workflow flag hygiene, land skill hardening, release snapshot fallback design, and the docs updates needed to make those flows legible to future agents and humans. It also covers the supporting tests and docs-lint surfaces needed to keep the release-control-plane changes stable.

### Out Of Scope

This plan does not redesign checkout UX, homepage copy, or the product itself. It does not migrate the repository back to a long-lived merge-commit workflow, replace GitHub branch protection policy globally, or redesign Stripe pricing strategy. It does not introduce dedicated Convex-backed feature previews for every feature branch. It also does not attempt to rewrite the full historical backlog on `dev`; it only codifies how to handle that situation safely in the future.

## Plan of Work

The work should proceed in five layers. First, define and implement a release-triage layer that inspects the exact `dev` candidate before any release attempt begins. Second, add a billing-proof doctor that checks hosted Stripe truth before any browser step begins. Third, cleanly separate proof routing so local uses sandbox billing while hosted staging and production use direct hosted verifiers. Fourth, update the shared land skill to call triage first, surface stop conditions sooner, and choose snapshot mode when the normal release PR path is structurally broken. Fifth, write the durable docs and command references so future agents stop improvising this logic during a live ship.

The implementation should stay narrow and additive. Prefer new shared skills and small workflow or script entrypoints over broad refactors. The tests should focus on planner selection, workflow flag behavior, and Stripe doctor logic. Documentation should only be updated after the workflow and skill surfaces are implemented and validated.

## Milestones

Milestone 1 creates the release-triage layer. At the end of this milestone, a newcomer can run one command or invoke one shared skill and learn whether the current `dev` head is actually releasable, what preview deployment and env are bound to that release candidate, whether the release PR path is mergeable, and whether snapshot release mode should be used. Success is a deterministic summary rather than another exploratory debugging session.

Milestone 2 creates the billing-proof doctor. At the end of this milestone, hosted staging and production proof fail immediately when Stripe env or assets drift from repo truth. Success is that stale `STRIPE_PRICE_ID`, stale `STRIPE_PROMOTION_CODE_ID`, or a promo code that does not apply to the current product are caught before Playwright ever opens a browser.

Milestone 3 hardens proof routing and workflow flags. At the end of this milestone, local billing proof still uses the sandbox browser lane, but hosted staging and production use direct hosted verifiers by default. Manual `force_billing` runs only force billing proof, not unrelated Convex sync. Success is that hosted proof no longer depends on Stripe sandbox UI structure.

Milestone 4 hardens the shared shipping workflow. At the end of this milestone, the land skill starts with triage, distinguishes feature landing from release hardening, and uses a documented snapshot fallback when `dev -> main` cannot merge cleanly under repo policy. Success is that the next release does not require improvising recovery branches or hidden Git strategies.

Milestone 5 writes the durable docs and post-ship guidance. At the end of this milestone, release docs, QA docs, and skill docs explain what a release candidate is, what has to be green before `main`, and how local developers should reconcile after a messy release. Success is that a newcomer can understand the release process without replaying this incident.

## Concrete Steps

Start by creating a new shared skill under `.agents/skills/shared/release-triage/SKILL.md`. Pair it with either a repo-level script or a narrow Node entrypoint under `scripts/` or `qa/scripts/` that can print a structured summary of the current release candidate. The triage output should name the `dev` SHA, preview deployment URL, current `dev -> main` PR state if one exists, whether the head is mergeable into `main`, and whether billing or Convex proof are required by the changed files.

Add a billing doctor command, ideally something like `bun run release:billing:doctor -- --env=preview` and `--env=production`, backed by `apps/web/scripts/verify-managed-stripe-env.ts` and `apps/web/platform/billing/stripe.ts`. Extend the script so it does more than check for presence: it should verify that the configured managed price amount matches `productConfig.priceUsdCents`, that the configured promo code exists, and that the promo code applies to the current product or order. Keep the command runnable from the repository root and from `apps/web` without ambiguity.

Update `qa/scripts/lib/billing-integration-step-planner.mjs` so local billing targets use the sandbox browser pack, but hosted staging and production use the hosted verifier path by default. Keep the planner tests under `apps/web/tests/unit/billing-integration-step-planner.test.ts` aligned with the command contract. The planner must make the proof path explicit in dry-run output.

Update `.github/workflows/dev-staging-proof.yml` so workflow-dispatch `force_billing=true` only means "billing proof required" and does not imply hosted Convex sync. If a Convex sync is needed, it should come only from actual release scope. Also make sure any hosted Convex sync that remains always sources the env file before running `bunx convex dev --once`.

Update `.agents/skills/shared/land/SKILL.md` so it explicitly runs release triage before opening or trusting a `dev -> main` release path. Add a stop condition that says "if the release PR is structurally unmergeable under repo policy, switch to the documented release-snapshot fallback instead of improvising." Add a short section about waiting for push completion before opening a PR to avoid the race that repeatedly caused false "No commits between..." GitHub responses.

Add a release-snapshot fallback skill or script. The minimal version can live under `.agents/skills/shared/release-snapshot/SKILL.md` and call a repo script that builds a one-commit release snapshot branch whose tree exactly matches `origin/dev` on top of `origin/main`. The docs must explain when that path is appropriate and when it is not.

After the code and skills are stable, update `docs/release-workflow.md`, `qa/README.md`, and any linked QA or release docs to define "release candidate" explicitly. That definition must say: one exact `dev` SHA, one exact preview deployment, one exact env set, and one green staging proof run. Also document post-ship reconciliation: after a messy release, local work should move onto a fresh branch from current `origin/dev` for feature work or current `origin/main` for hotfix work, and stale local release-repair branches should be deleted.

Recommended commands while implementing:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-18-release-hardening-and-proof-automation.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-18-release-hardening-and-proof-automation.md
    git diff --check
    bun run format
    bun run lint
    bun run typecheck
    bun run qa:validate

## Validation and Acceptance

Acceptance is operational, not rhetorical. The release-triage surface must answer release readiness before anyone starts shipping. The billing doctor must fail immediately on stale Stripe price or promo configuration in preview and production. Hosted staging and production billing proof must use the direct hosted verifier instead of the sandbox UI path. The land skill must choose a documented snapshot-release fallback when the normal `dev -> main` PR path is structurally blocked. The release docs must explain what a release candidate is and what local reconciliation should look like after a messy ship.

### Test Commands

    bun run plans:lint -- --plan docs/exec-plans/active/2026-04-18-release-hardening-and-proof-automation.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-04-18-release-hardening-and-proof-automation.md
    git diff --check
    bun run format
    bun run lint
    bun run typecheck
    bun run qa:validate
    QA_ALLOW_BILLING_INTEGRATION=1 PLAYWRIGHT_BASE_URL=https://dev.man-meets-ai.com node qa/scripts/run-pack.mjs --pack=billing_integration --slug=dev-proof-check --dry-run=1
    QA_ALLOW_BILLING_INTEGRATION=1 PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com node qa/scripts/run-pack.mjs --pack=billing_integration --slug=prod-proof-check --dry-run=1

## Idempotence and Recovery

All new commands and skills must be safe to rerun. Release triage and billing doctor commands should be read-only unless they explicitly declare an operator action. Hosted proof helpers may create temporary Stripe proof assets, but they must either reuse durable configured assets or delete one-time proof coupons after use. If a workflow-dispatch proof run fails because of env drift, fix the env and rerun the same proof; do not paper over the failure by weakening the contract. If a snapshot-release branch is created, it should be deletable and reproducible from the same `origin/dev` and `origin/main` inputs. If implementation goes sideways, revert the new release-hardening scripts or skill files independently without touching product code.

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
    docs/release-workflow.md
    qa/README.md
    qa/scripts/lib/billing-integration-step-planner.mjs
    .github/workflows/dev-staging-proof.yml
    apps/web/scripts/verify-managed-stripe-env.ts
    apps/web/scripts/verify-hosted-stripe-checkout.mjs
    apps/web/platform/billing/stripe.ts

## Interfaces and Dependencies

The release-triage interface should return a structured summary that can be used by both a skill and a script. It depends on Git state, GitHub PR metadata, and Vercel deployment metadata. The billing doctor depends on the Stripe SDK and the server env contract in `apps/web/platform/env/server.ts`; it should treat `STRIPE_PRICE_ID`, `STRIPE_PRODUCT_ID`, and `STRIPE_PROMOTION_CODE_ID` as a single contract rather than isolated flags. The hosted verifier depends on Playwright, Clerk-authenticated QA personas, and the Convex debug path. The land skill depends on all of these and should orchestrate them, not reimplement them. Any snapshot-release fallback depends on Git history and tree creation, but its public contract should stay simple: "create a release branch whose tree exactly matches `origin/dev` on top of `origin/main`."
