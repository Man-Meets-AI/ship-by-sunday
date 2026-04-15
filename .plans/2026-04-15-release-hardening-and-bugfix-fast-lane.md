---
summary: Harden the Ship by Sunday release path so urgent checkout and access fixes can reach production without alias drift, stale hosted Convex code, stale QA fixtures, or stale Stripe price envs blocking the ship.
read_when: Open this when production bug fixes are taking too long to land because the dev-to-main release path, staging aliases, hosted Convex sync, QA bootstrap, or Stripe environment drift keep failing.
plan_status: not_done
---

# Build A Fast, Durable Release Lane For Checkout And Access Fixes

This is a living execution plan. It captures the release hardening work needed so a future coding agent can take a real customer-facing bug from code change to proven production release without depending on chat history, manual alias repoints, or one-off environment surgery.

This ExecPlan must be maintained in accordance with `.plans/PLANS.md`.

## Purpose / Big Picture

Right now, a real bug fix can be correct in code and still take hours to reach production because several release dependencies drift independently: the `dev` staging alias can point at the wrong Vercel preview, hosted Convex dev can lag behind the repository, QA personas can keep stale checkout state, QA inventory can fail only inside the staging workflow, and preview or production Stripe environment values can still point at the wrong price. After this work, a maintainer should be able to ship a checkout, webhook, entitlement, or auth-handoff fix quickly by following a deterministic path: either a true hotfix branch from `main` or a short-lived feature branch into `dev`, with automated deployment binding, automated backend sync, stable QA fixtures, and release-proof billing paths that match the repository’s actual policy. The change is successful when the repo can demonstrate one full urgent-fix release without manual Vercel alias surgery and without ad hoc direct production data edits.

## Progress

- [x] 2026-04-15 21:48 EDT — Draft this ExecPlan from the live release failure/recovery sequence and freeze the first pass of scope, constraints, milestones, and acceptance criteria.
- [x] 2026-04-15 23:30 EDT — Codified the production billing proof into executable code. Added `apps/web/scripts/verify-hosted-stripe-checkout.mjs`, the shared session builder in `apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs`, the hosted-production switch in `qa/scripts/lib/billing-integration-step-planner.mjs`, and the production workflow guard `QA_REQUIRE_CONVEX_DEBUG=1`. Focused unit tests plus a live local production proof succeeded.
- [x] 2026-04-15 23:33 EDT — Added an explicit hotfix lane for P0 and P1 production bugs to the release workflow, QA docs, and agent instructions.
- [x] 2026-04-15 23:33 EDT — Implemented preview-alias self-healing for `dev.man-meets-ai.com` inside the Vercel deployment wait helper and opted the staging workflow into alias assignment.
- [x] 2026-04-15 23:33 EDT — Added hosted Convex dev sync automation for staging-proof runs when the release touches Convex functions or schema, including release-scope detection for Convex-sensitive files and the one-shot sync command wrapper.
- [x] 2026-04-15 23:33 EDT — Moved QA inventory failures earlier in CI by adding `qa:inventory:check` and a dedicated `qa_control_plane` job in `.github/workflows/ci.yml`.
- [x] 2026-04-15 23:33 EDT — Added Stripe price and product environment drift checks for preview and production billing-sensitive proof runs using `apps/web/scripts/verify-managed-stripe-env.ts`.
- [x] 2026-04-15 23:33 EDT — The no-access QA persona reset requirement was already satisfied by the earlier access-fix work that clears both access grants and pending checkout claims during Playwright bootstrap.
- [x] 2026-04-15 23:38 EDT — Removed the stale `.env` snapshot dependency from release proof. `dev-staging-proof.yml` and `production-release-proof.yml` now pull the current app env directly from Vercel instead of trusting frozen GitHub secret copies.
- [ ] Re-run the full staging and production proof path on a controlled test release and document the measured reduction in manual operator steps.

## Surprises & Discoveries

As of 2026-04-15 21:48 EDT, the biggest surprise is that the original customer fix was not the slow part. The delay came from release plumbing drift. The code change to recover paid access by verified email was implemented and the specific customer was repaired directly in production, but the release still stalled because `dev.man-meets-ai.com` repeatedly pointed at the wrong Vercel preview, hosted Convex dev did not have the newest public functions, QA bootstrap still left stale `pendingCheckoutClaims` around for the “member without access” persona, `qa/test-inventory.csv` did not include newly added tests, and preview Stripe still referenced an outdated `$500` test price while the app expected `$250`. The production billing proof also revealed that the current browser automation assumes a generic hosted Checkout flow even though the repo’s own runbooks already say the safe production proof is a no-cost direct discounted Checkout Session. That mismatch is evidence that the docs and automation are no longer aligned.

Evidence from the live release shepherding on 2026-04-15:

    Dev staging proof failed waiting for the exact Vercel preview even while Vercel itself showed a ready deployment.
    Later staging proof failed because hosted Convex dev did not have checkoutClaims:resetPendingCheckoutClaimsForEmail until a manual bunx convex dev --once sync.
    Preview checkout returned 500 with "Configured Stripe price ... charges 50000 cents, expected 25000" until preview Vercel env was corrected and redeployed.
    Production default_ship passed, but production billing_integration failed because the automation still relied on the hosted browser flow instead of the documented direct discounted session path.

As of 2026-04-15 23:33 EDT, two additional discoveries matter. First, the production browser proof was already strong enough to prove the live handoff without the local Convex debug query: the buyer reached `/checkout/success` and then `/blueprint`, which is the user-visible truth. The strict Convex row check still belongs in CI, but local reruns need a softer mode because operator laptops may not carry the same Convex CLI auth material as GitHub Actions. Second, `qa:validate` immediately caught the missing inventory rows for the new release-hardening helper tests. That is confirmation that moving QA inventory enforcement earlier into `ci.yml` solves a real class of release surprises instead of adding ceremony.

As of 2026-04-15 23:38 EDT, the staging and production workflow env snapshots were still one more hidden drift source. A local run of `scripts/verify-managed-stripe-env.ts` against the copied production `.env.production` file failed with the old live `$500` price ID even though Vercel production had already been corrected to the `$250` price. That proved `PRODUCTION_WEB_ENV_LOCAL` and `DEV_STAGING_WEB_ENV_LOCAL` style secrets were fundamentally the wrong source of truth for release proof. The workflows now pull the current app env straight from Vercel with `vercel env pull`.

## Decision Log

Decision: treat release hardening as one cross-system initiative instead of splitting it into separate Vercel, Convex, QA, and Stripe cleanup plans.
Rationale: the live failure pattern only existed because these systems drifted together. Solving them separately would hide the real operator path.
Date: 2026-04-15

Decision: keep the work focused on release and proof reliability, not on broad product refactors.
Rationale: the goal is to shorten time-to-prod for bug fixes and reduce brittle manual intervention, not to redesign checkout or blueprint product behavior.
Date: 2026-04-15

Decision: add an explicit hotfix path from `main` as part of this initiative.
Rationale: even with perfect staging automation, urgent production fixes should not be forced to ride a large feature branch that is many commits ahead of `dev`.
Date: 2026-04-15

Decision: automate the `dev` alias and hosted Convex sync inside the release workflows instead of relying on manual operator intervention.
Rationale: these were repeated blockers during a single real release. They are workflow responsibilities, not tribal-knowledge tasks.
Date: 2026-04-15

Decision: change the production billing proof automation to match the repo’s documented “no-cost direct discounted Checkout Session” policy.
Rationale: the current automation exercises a broader browser path than the repository considers reliable for live proof. That turns a policy-compliant release into a false negative.
Date: 2026-04-15

Decision: keep the hosted production billing verifier strict in CI but tolerant locally when the only missing signal is the Convex debug query.
Rationale: GitHub Actions writes the production Convex CLI auth config before the billing pack and should enforce the row-level access check there. Local operators still need a way to prove the live user journey without being blocked by missing local Convex auth material.
Date: 2026-04-15

Decision: make release-scope classification return both `billing_sensitive` and `convex_sensitive`.
Rationale: the staging workflow should auto-sync hosted Convex dev only when staged backend code actually changed, not on every `dev` push.
Date: 2026-04-15

Decision: stop materializing release-proof app env files from long-lived GitHub secrets and pull them directly from Vercel instead.
Rationale: local validation proved the frozen production env secret still referenced the retired `$500` live price after Vercel production had already been corrected. Pulling from Vercel makes the workflows verify the live deployment contract instead of a stale copy.
Date: 2026-04-15

## Outcomes & Retrospective

When this plan is complete, the repository should have a measurable reduction in release friction for billing-sensitive bug fixes. The target outcome is that a maintainer can either branch from `main` for a hotfix or merge a short-lived feature branch into `dev`, then rely on deterministic automation to bind the correct preview alias, sync hosted Convex dev, prepare truly isolated QA personas, verify Stripe environment values, and run the right production billing proof path. The retrospective should record how many manual operator actions were removed, whether the hotfix lane was exercised successfully, and whether any remaining proof failures were real product bugs rather than workflow drift. If the work only shifts manual steps elsewhere, the plan is not done.

## Context and Orientation

The release path lives across several repository areas. The human and agent contract is in `AGENTS.md`, `.docs/scripts.md`, `docs/release-workflow.md`, `apps/web/content/docs/ship-live.mdx`, `qa/AGENTS.md`, and `qa/README.md`. GitHub Actions workflows that enforce the release path are in `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/convex-production-deploy.yml`. The deployment-selection helper that waits for a specific Vercel deployment by commit and alias is `qa/scripts/wait-for-vercel-production-deployment.mjs`. The QA control-plane validator is `qa/scripts/validate.mjs`. The Playwright authenticated persona bootstrap that prepares “member with access” and “member without access” is `apps/web/tests/e2e/global-setup.ts`, with persona definitions in `qa/personas.json` and local secrets in `qa/personas.local.json`.

The billing path itself spans both web app code and proof automation. The live checkout route is `apps/web/app/api/stripe/checkout/route.ts`. Stripe product and price helpers live in `apps/web/platform/billing/stripe.ts`. Checkout recovery state and claims live in `apps/web/convex/checkoutClaims.ts`, `apps/web/convex/checkoutClaimsActions.ts`, `apps/web/convex/schema.ts`, `apps/web/features/checkout/server/checkout-session-recovery.ts`, and `apps/web/features/product-access/server/product-access.ts`. The staging and production browser proof for the buyer path is in `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts`. The durable runbook for a correct no-cost live billing proof already exists in `qa/runs/2026-04-01-prod-billing-proof-v0.1.0.md` and the surrounding billing notes in `qa/AGENTS.md`, `qa/README.md`, and `docs/release-workflow.md`.

The important terms in this repository are as follows. A “preview alias” means the stable hostname `dev.man-meets-ai.com` that should always point at the exact Vercel preview deployment for the current `dev` head. A “hosted Convex dev deployment” means the cloud Convex development deployment referenced by `apps/web/.env.local`; this repo explicitly does not use local Convex mode. A “pending checkout claim” means a Convex row in `pendingCheckoutClaims` that records a paid checkout not yet attached to a Clerk account. A “no-access QA persona” means the reusable test account that is intentionally signed in but must not have access or a claimable checkout during access-recovery tests. A “production billing proof” means a no-cost live checkout verification that still exercises `checkout.session.completed`, the webhook path, `/checkout/success`, and the protected blueprint entry without charging a real card.

## Plan of Work

Start by hardening the release control plane before changing product logic again. The first edits should make the release workflows and helper scripts align with the repository’s existing documented policy. That means adding an explicit hotfix lane to the documented and agent-facing release rules, then teaching the GitHub Actions workflows how to bind the correct `dev` preview alias automatically and how to sync hosted Convex dev before trying to run browser QA against a commit whose public or backend functions may have changed.

Once workflow-level drift is handled, fix the QA substrate. `qa/scripts/validate.mjs` and `qa/scripts/generate-test-inventory.mjs` should move inventory failures earlier into ordinary CI, while `apps/web/tests/e2e/global-setup.ts` should leave the “member without access” persona in a fully clean state by clearing access grants and pending checkout claims. These changes are additive and can be validated with targeted unit and browser proof before they are trusted in production workflows.

After that, harden Stripe environment handling. `apps/web/platform/billing/stripe.ts`, the release workflows, and any supporting scripts should gain explicit price and product drift checks for preview and production. The preview and production environments should be validated against the code’s intended managed price before release proof begins, and the production billing proof should be rewritten to use the repository’s documented direct discounted live session path rather than the current generic hosted browser flow that can fail for reasons unrelated to the app. Finish by proving the entire release loop on a controlled test change and writing down the final operator path in the durable release docs.

## Milestones

Milestone 1 makes urgent bug-fix shipping explicit and safe. At the end of this milestone, the repository has a documented and agent-visible hotfix path from `main`, plus branch-model guidance that clearly tells a maintainer when to avoid bundling a production fix with unrelated `dev` work. Validation is behavioral: a newcomer can read the release docs and explain the difference between a normal `feature -> dev -> main` release and a P0/P1 hotfix.

Milestone 2 removes deployment-binding drift. At the end of this milestone, `dev-staging-proof.yml` and the helper scripts can resolve the correct Vercel preview deployment for the current `dev` commit and ensure the staging alias points at it before browser QA runs. The workflow should no longer require manual Vercel alias intervention during an ordinary release. Validation is behavioral: a test push to `dev` reaches the browser proof without a human running `vercel alias set`.

Milestone 3 removes backend-sync and QA-fixture drift. At the end of this milestone, hosted Convex dev is synchronized automatically or deterministically before staging proof, `qa:validate` catches inventory issues before staging proof, and the no-access QA persona is always reset to a truly no-access state. Validation is behavioral: staging proof no longer fails because a new Convex function is missing, an inventory row is missing, or a no-access fixture silently carries stale claims.

Milestone 4 hardens Stripe environment and billing proof behavior. At the end of this milestone, preview and production Stripe envs are validated against the intended managed price, and the production billing proof uses the repository’s direct discounted session method instead of the brittle generic hosted browser flow. Validation is behavioral: a billing-sensitive release can pass preview and production proof without a real card charge, without false failures from stale price IDs, and without timing out between Checkout completion and `/checkout/success`.

Milestone 5 proves the new release lane end to end. At the end of this milestone, one controlled release candidate has gone through the hardened path, and the final report documents which manual steps were eliminated and which still remain. Validation is behavioral: a maintainer can follow the repo and workflow alone to ship a billing-sensitive bug fix with fewer manual interventions than the April 15 release required.

## Concrete Steps

Work from the repository root unless a step explicitly says otherwise.

For Milestone 1, inspect and update these files together: `AGENTS.md`, `.docs/testing-and-release.md`, `docs/release-workflow.md`, `apps/web/content/docs/ship-live.mdx`, `qa/AGENTS.md`, and `qa/README.md`. Add one explicit prose section for “hotfix from main” that explains when to use it, how to back-merge or cherry-pick to `dev`, and how billing-sensitive proof works in that path. Re-run:

    pwd
    bun run format
    bun run lint

Expected observation: the docs and agent rules all describe the same normal-release and hotfix paths, and no file still implies that an urgent fix must ride a large feature branch into `dev`.

For Milestone 2, inspect and update `.github/workflows/dev-staging-proof.yml`, `qa/scripts/wait-for-vercel-production-deployment.mjs`, and any necessary helper scripts or Vercel CLI/API steps. The implementation should make the workflow either attach `dev.man-meets-ai.com` to the exact preview deployment for the current `dev` head or stop requiring the alias before proving the exact deployment URL and then verify alias state separately. Re-run on a non-production test commit:

    gh workflow run dev-staging-proof.yml --ref dev
    gh run list --workflow dev-staging-proof.yml --limit 3

Expected observation: the workflow reaches the browser-proof steps without manual `vercel alias set` commands.

For Milestone 3, inspect and update `qa/scripts/validate.mjs`, `qa/scripts/generate-test-inventory.mjs`, `apps/web/tests/e2e/global-setup.ts`, `apps/web/convex/checkoutClaims.ts`, and any supporting tests in `apps/web/tests/unit/checkout-claims*.test.ts` and `apps/web/tests/unit/course-access.test.ts`. Add or update tests that prove the no-access persona reset clears pending claims and that inventory sync catches new tests in ordinary CI. Re-run:

    bun run qa:inventory:sync
    bun run qa:validate
    bun run --cwd apps/web test:unit -- tests/unit/checkout-claims.test.ts tests/unit/checkout-claims-actions.test.ts tests/unit/course-access.test.ts

Expected observation: inventory is current, QA validate passes locally, and the no-access bootstrap reset has a deterministic test.

For Milestone 4, inspect and update `apps/web/platform/billing/stripe.ts`, `apps/web/app/api/stripe/checkout/route.ts`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts`, and any helper scripts needed to create or validate the discounted no-cost live session path. Also inspect environment management for preview and production to ensure the intended `STRIPE_PRICE_ID` and `STRIPE_PRODUCT_ID` values are checked before proof. Re-run:

    curl -i -s -X POST https://dev.man-meets-ai.com/api/stripe/checkout
    curl -i -s -X POST https://www.man-meets-ai.com/api/stripe/checkout
    gh workflow run production-release-proof.yml --ref main -f force_billing=true

Expected observation: both checkout routes return `200` plus a Checkout URL when configuration is correct, and the production billing proof uses the discounted session path documented in `qa/runs/2026-04-01-prod-billing-proof-v0.1.0.md`.

For Milestone 5, choose a controlled bug-fix or release-candidate commit and run the full path. Use the repository’s real commands and watch the actual workflow IDs:

    gh run list --workflow dev-staging-proof.yml --limit 5
    gh run list --workflow convex-production-deploy.yml --limit 5
    gh run list --workflow production-release-proof.yml --limit 5
    git branch -r --contains <main-release-sha>

Expected observation: the exact release commit is on `origin/main`, Vercel and Convex are both green for that commit, and the post-release proof is green without manual alias repoints or ad hoc backend sync steps.

## Validation and Acceptance

Acceptance is behavioral, not just code-level. A release hardening change is only complete if a maintainer can use the repository and automation to ship a billing-sensitive bug fix faster and with fewer manual steps than the April 15 release required.

For documentation and branch-model hardening, acceptance means the normal release path and hotfix path are both explicitly described and no checked-in doc contradicts them. For deployment hardening, acceptance means `Dev Staging Proof` reaches its browser steps on the correct preview deployment without manual alias surgery. For backend and QA hardening, acceptance means staging proof does not fail because of stale hosted Convex code, missing QA inventory rows, or stale no-access persona state. For Stripe hardening, acceptance means preview and production checkout can be verified at the intended price and the production billing proof uses the repo’s intended no-cost direct discounted session approach. For end-to-end release proof, acceptance means a release commit is demonstrably on `origin/main`, Vercel production serves it, Convex production is deployed for it, and the release-proof gate is green.

Minimum command set before marking this plan done:

    bun run format
    bun run lint
    bun run typecheck
    bun run qa:validate
    bun run sbs:check
    gh workflow run dev-staging-proof.yml --ref dev -f force_billing=true
    gh workflow run production-release-proof.yml --ref main -f force_billing=true

Success is not “the command exited.” Success is “the command exited and the resulting workflow state proves the intended release behavior without manual cleanup.”

## Idempotence and Recovery

Every workflow-facing step in this plan must be safe to rerun. Repointing `dev.man-meets-ai.com` should be idempotent. Hosted Convex dev sync should be safe to rerun on the same commit. QA persona reset should delete pending claims and access grants repeatedly without leaving the database in a worse state. Stripe environment validation should detect stale values before any browser proof starts, and correcting the env values should be safe to do more than once.

If a workflow fails halfway, recover by fixing the smallest root cause and rerunning the exact workflow on the same head commit rather than advancing the branch. If a temporary release branch or scratch branch is created to test mergeability, delete or reset it immediately after use so the main worktree stays clean. If production billing proof is partially completed, do not compensate with direct entitlement edits unless the production incident itself requires emergency repair. Use the repo’s existing incident-control and observability paths for emergency production repairs, then return to the automated proof path once the environment is truthful again.

## Artifacts and Notes

Use these April 15 artifacts as the baseline evidence for why this plan exists:

    Customer repair evidence:
    - production Clerk user existed for content@helpsmin.com
    - latest paid Stripe session existed and was complete
    - pending checkout claim was claimed onto that user
    - product access grant was present and linked to that Stripe session

    Release friction evidence:
    - dev staging proof timed out waiting for the exact dev alias even while Vercel had a ready preview
    - hosted Convex dev lacked new functions until a manual bunx convex dev --once sync
    - preview checkout returned 500 because STRIPE_PRICE_ID still pointed at the old $500 test price
    - production checkout route returned 200 only after Vercel production env was updated to the new $250 price ID
    - production billing proof still failed because the automation used a generic hosted browser flow instead of the documented direct discounted session path

These artifacts should be copied into follow-up reports or linked from the eventual retrospective once the hardening work is complete.

## Interfaces and Dependencies

This plan depends on GitHub Actions workflows in `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/convex-production-deploy.yml`. It depends on Vercel deployment discovery through `qa/scripts/wait-for-vercel-production-deployment.mjs` and on the Vercel CLI being able to list deployments and set aliases. It depends on hosted Convex dev and production deployments being accessible through the Convex CLI and the auth config in `~/.convex/config.json` or the workflow-provided JSON. It depends on Stripe price and product management through the Stripe API and the environment variables consumed by `apps/web/platform/billing/stripe.ts`.

The code-level interfaces that must continue to exist are `apps/web/app/api/stripe/checkout/route.ts` for checkout creation, `apps/web/features/checkout/server/checkout-session-recovery.ts` and `apps/web/features/product-access/server/product-access.ts` for account-to-checkout recovery, `apps/web/convex/checkoutClaims.ts` and `apps/web/convex/checkoutClaimsActions.ts` for pending claim storage and claiming, and `apps/web/tests/e2e/global-setup.ts` plus `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts` for the authenticated QA personas and billing handoff proof. The plan should preserve those boundaries while making the release path around them more deterministic.
