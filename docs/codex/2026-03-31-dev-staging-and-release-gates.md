---
summary: Move the repository to a deliberate branch-and-environment model where feature branches are preview-only, `dev` is the integrated staging environment with real auth, Convex, and Stripe test-mode proof, and `main` remains the production release branch.
read_when: Open this when changing branch strategy, GitHub Actions, release workflow, QA pack ownership, or pre-commit / local quality gates for Ship by Sunday.
plan_status: not_done
---

# Make Dev The Full Integration Staging Branch

This document is a living execution plan. Update it as discoveries are made, as milestones complete, and as design decisions change so another agent can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

This repository currently mixes two conflicting operating models. Some docs say releases flow through `dev` and then into `main`, while other docs still say feature branches go straight into `main` with no long-lived integration branch. That ambiguity is dangerous for the commercial path of the app because checkout, webhook delivery, Clerk auth, and Convex access grants need one canonical integrated environment where they are proven before production. The user-visible outcome after this change is that the team has one simple rule: feature branches prove code correctness, `dev` proves full system correctness in the integrated staging environment, and `main` is production only. The change is working when the docs, QA control plane, GitHub Actions, and branch-protection expectations all describe the same release path, and when the integrated `dev` environment is the required place to run real billing proof before production.

## Progress

- [x] 2026-03-31 20:40 EDT: Reviewed the current CI, release docs, ship-live docs, and QA control-plane files. Confirmed the repo is internally inconsistent today: `docs/release-workflow.md` says there is no long-lived integration branch, while `apps/web/content/docs/ship-live.mdx` already assumes `dev` is the integrated release candidate branch.
- [ ] Resolve the branch-and-environment source of truth in docs and decision log.
- [ ] Define the pre-commit scope explicitly so Husky or any local hook remains fast and side-effect free.
- [ ] Define the CI and environment-gated workflow changes needed to treat `dev` as staging and `main` as production.
- [ ] Define the QA pack expectations for feature branches, `dev`, and `main`.
- [ ] Capture the final rollout sequence and migration plan for moving the team to the new model.

## Surprises & Discoveries

The repository already contains the beginnings of the staging-branch model, but it is split across files and therefore easy to miss. `apps/web/content/docs/ship-live.mdx` already says the release candidate should be integrated on `dev` and that the release PR should be `dev -> main`. In contrast, `docs/release-workflow.md` still says there is no long-lived integration branch and that feature branches merge straight into `main`. The repo is therefore teaching two different release systems at once.

The second discovery is that the current CI setup is intentionally code-centric, not environment-centric. `.github/workflows/ci.yml` runs static checks, integration tests, browser smoke, and scheduled or manual sandbox e2e. It does not run a real `billing_integration` pack, and that is not an accident. The QA control plane in `qa/README.md` and `qa/AGENTS.md` treats `billing_integration` as an environment-gated proof lane because it touches real Stripe Checkout, Clerk personas, webhook delivery, and Convex writes.

The third discovery is that there is no Husky or pre-commit setup in the repository today. That means the plan can define pre-commit from first principles instead of having to preserve an existing workflow.

## Decision Log

Decision: adopt `dev` as the integrated staging branch and keep `main` as the production release branch.  
Rationale: this matches the team’s actual need for one environment where auth, Convex, Stripe, and access-grant behavior are proven together before production. It also matches the direction already implied by `apps/web/content/docs/ship-live.mdx`.  
Date: 2026-03-31

Decision: once this model is adopted, normal feature branches should branch from the current `dev`, merge into `dev`, and only reach `main` through a `dev -> main` release promotion. Hotfixes may still branch from `main`, but they must merge or cherry-pick back into `dev` immediately after release.  
Rationale: if `dev` is the integrated staging branch, feature work must actually integrate there before production so the tested candidate and the released candidate are the same branch lineage.  
Date: 2026-03-31

Decision: keep feature branches preview-only by default.  
Rationale: the repository does not currently support a fully isolated Convex + Clerk + Stripe environment per feature branch. Preview branches should therefore prove code correctness and non-integrated UX, not pretend to prove the full billing path.  
Date: 2026-03-31

Decision: do not put real integration proof in pre-commit hooks.  
Rationale: pre-commit must stay fast, local, and side-effect free. Real Checkout, webhook, and access-grant proof belongs in environment-backed QA on `dev`, not in Husky.  
Date: 2026-03-31

Decision: keep the full `billing_integration` proof as a `dev`-branch staging gate and a production release check, not an every-PR CI job.  
Rationale: billing proof depends on real environment wiring and safe test payments. Running it on every feature branch would be flaky, expensive, and operationally noisy unless the repo gains true per-branch backend isolation later.  
Date: 2026-03-31

Decision: `default_ship` should auto-run against the integrated `dev` environment, while `billing_integration` should be an environment-protected staging workflow that is required before release when checkout, auth, entitlement, or webhook behavior changed.  
Rationale: `default_ship` is broad, mostly non-destructive, and useful as continuous staging proof. `billing_integration` has real side effects and should stay explicit even if `dev` is tightly isolated.  
Date: 2026-03-31

Decision: pre-commit should be limited to fast local code-quality gates such as lint, format, secret scanning, and `qa:validate`, and must never run real browser or payment-path verification.  
Rationale: local hooks should catch cheap mistakes quickly. They are the wrong place for Playwright, Stripe, Clerk, or Convex integration proof.  
Date: 2026-03-31

## Outcomes & Retrospective

This section is incomplete because the workflow change is not implemented yet. At completion it must compare the old ambiguous release model against the final explicit branch-and-environment model, list the exact docs and workflow files changed, and note whether any temporary transitional rules remained in place.

## Context and Orientation

The current branch and release truth is split across a small number of files. `.github/workflows/ci.yml` defines the standing code-level checks. `docs/release-workflow.md` defines the GitHub, Vercel, and Convex production release flow. `apps/web/content/docs/ship-live.mdx` defines the product-facing “how we ship” story. `qa/README.md` and `qa/AGENTS.md` define how scenario packs such as `default_ship` and `billing_integration` are supposed to run and which environments they belong to.

Today those files do not fully agree. `docs/release-workflow.md` still describes feature branches merging directly into `main` and explicitly says there is no long-lived integration branch. `apps/web/content/docs/ship-live.mdx` already assumes the opposite: feature work lands in `dev`, and `dev -> main` is the release pull request. The QA control plane already thinks in environment terms: it says start with `dev` first, use `billing_integration` there, and use production second as release evidence.

The main workflow concepts in this repository are:

- A feature branch is a short-lived branch used for implementation and code review.
- A preview environment is a frontend preview with no guarantee of fully isolated Clerk, Convex, and Stripe wiring.
- The `dev` environment is the integrated staging environment where real Clerk, hosted Convex dev, and Stripe test mode can be exercised together.
- The `main` branch is the production release source for both Vercel and Convex production deploys.
- `default_ship` is the majority-coverage QA pack for the main user journey.
- `billing_integration` is the environment-gated QA pack for the payment path and access handoff.

The plan should make those concepts explicit and remove the current contradictions so a fresh operator knows exactly what has to pass on a feature branch, on `dev`, and on `main`.

The intended end-state workflow is:

- Feature branches branch from `dev`.
- Feature branches prove code correctness through PR CI and preview-only manual checks.
- `dev` auto-deploys to the integrated staging environment and is the only branch where full-system Clerk + Convex + Stripe proof is required before release.
- `main` is production only. Normal releases are `dev -> main`. Hotfixes branch from `main` and are merged or cherry-picked back into `dev`.

## Plan of Work

Start by making the source-of-truth branch model explicit in this plan and then in the repository docs. The first edits should be `docs/release-workflow.md` and `apps/web/content/docs/ship-live.mdx`, because those are the current conflicting public contracts. The final wording must say whether feature branches branch from `dev`, whether `dev` is the required integration stage, whether `main` is production only, and how hotfixes fit that model.

Then define the local pre-commit boundary. This should likely live in root `package.json` and, if adopted, a new `.husky/` directory. The plan should keep pre-commit to fast local checks such as lint, format, secret scanning, and possibly `qa:validate`, but explicitly forbid any real Stripe or browser-pack execution there.

After that, define the GitHub Actions and branch-protection strategy. `.github/workflows/ci.yml` should remain the place for code-level checks. If the team wants `dev` to be the full integration gate, the plan must say exactly which proof runs there and which proof stays environment-gated. The recommended split for this repository is:

- PR CI: `static`, `integration`, `browser-smoke`, and `cli`
- Push to `dev`: deploy staging and auto-run `default_ship`
- Environment-protected workflow against `dev`: run `billing_integration` when checkout, auth, entitlement, or webhook behavior changed
- Release to `main`: require a green `dev`, production deploy, and explicit production billing verification when the commercial path changed

The plan should also define which checks must be required on `dev` and which checks must remain required on `main`.

Finally, align the QA control plane and the release playbook. `qa/README.md`, `qa/AGENTS.md`, and `docs/release-workflow.md` should all describe the same rule: feature branches prove code, `dev` proves the integrated system including billing, and `main` proves production release readiness. If any commands or reports are added, the plan must say exactly where their outputs are stored and when they are required.

## Milestones

Milestone 1 resolves the source-of-truth branch model. At the end of this milestone, the ExecPlan and the target docs agree on whether `dev` is the integration branch and whether `main` is production only. Success looks like the contradictions between `docs/release-workflow.md` and `apps/web/content/docs/ship-live.mdx` being resolved in one direction instead of left implicit.

Milestone 2 defines the local and CI gates. At the end of this milestone, pre-commit scope, PR CI scope, and `dev` staging proof scope are each explicit and separated by purpose. Success looks like a novice being able to answer “what runs before commit,” “what runs on PR,” and “what proves billing before prod” without guessing.

Milestone 3 aligns QA packs and rollout. At the end of this milestone, the QA control plane, release docs, and any workflow changes all point at the same integrated staging ritual for `dev` and the same release ritual for `main`. Success looks like `default_ship` and `billing_integration` having a clearly named place in the branch lifecycle.

## Concrete Steps

Work from the repository root.

1. Re-read the current conflicting source-of-truth files:

   cd /Users/parkerrex/Projects/manmeetsai-workspace
   sed -n '1,220p' docs/release-workflow.md
   sed -n '1,220p' apps/web/content/docs/ship-live.mdx
   sed -n '1,260p' .github/workflows/ci.yml
   sed -n '1,220p' qa/README.md
   sed -n '1,220p' qa/AGENTS.md

   Expected observation: `docs/release-workflow.md` still denies a long-lived integration branch while `ship-live.mdx` and the QA docs already assume `dev` is the integration environment.

2. Write the branch-and-environment decisions directly into this ExecPlan first if anything changes materially during implementation. Do not change workflows or docs until the plan itself is explicit.

3. Update `docs/release-workflow.md` and `apps/web/content/docs/ship-live.mdx` so they agree on one branch model.

4. If adopting Husky, create only the minimal hook surface and keep it code-only. The likely files are root `package.json` and a new `.husky/pre-commit`.

5. Update `.github/workflows/ci.yml` or add a new environment-gated workflow so `dev` has an explicit integration-proof path for the billing pack.

6. Update `qa/README.md` and `qa/AGENTS.md` so they describe the same `feature branch -> dev -> main` lifecycle as the release docs.

## Validation and Acceptance

At minimum, the implementation of this plan must let a novice answer all of the following correctly from the repo alone:

- What is a feature branch expected to prove?
- What is `dev` expected to prove?
- What is `main` expected to prove?
- Where does real `billing_integration` run?
- What belongs in pre-commit and what absolutely does not?

Run the narrowest relevant checks after workflow/doc changes:

   cd /Users/parkerrex/Projects/manmeetsai-workspace
   bun run qa:validate

If GitHub workflow files are changed, also validate that the YAML is syntactically sane by inspecting the file carefully and, where available, using the repo’s normal CI as the next proof surface.

Acceptance requires these explicit repository truths:

- `docs/release-workflow.md` and `apps/web/content/docs/ship-live.mdx` no longer contradict each other on branch strategy.
- The repository explicitly says feature branches branch from `dev` and that `dev -> main` is the normal release promotion.
- The role of `dev` as integrated staging is spelled out plainly if it is adopted.
- Pre-commit is explicitly limited to fast local checks.
- Real checkout and webhook proof is explicitly assigned to `dev` and/or production release verification, not buried in vague language.
- The QA control plane names where `default_ship` and `billing_integration` run in the branch lifecycle.

## Idempotence and Recovery

This plan should prefer doc and workflow alignment before hard branch-protection changes. If the implementation changes docs first and workflow later, that is acceptable only if the plan records the temporary mismatch and the next step to close it.

If workflow changes are staged but not yet active in GitHub or Vercel, record that as an incomplete rollout rather than pretending the policy is live. External branch protection or deployment settings must be called out separately from git-tracked files.

If Husky or local hooks are added and they create developer friction, the safe rollback is to disable the hook and keep the documented policy in place until the hook can be narrowed. Do not widen pre-commit to environment-backed proof just because a code-only hook feels too weak.

## Artifacts and Notes

Useful evidence already captured:

   Current repo contradiction:
   - `docs/release-workflow.md`: says feature branches merge into `main` and there is no long-lived integration branch
   - `apps/web/content/docs/ship-live.mdx`: says the release candidate is integrated on `dev` and the release PR is `dev -> main`

   Current CI truth:
   - `.github/workflows/ci.yml` runs `static`, `integration`, `browser-smoke`, and scheduled/manual `e2e-sandbox`
   - it does not run a real `billing_integration` pack today

   Current QA truth:
   - `qa/README.md` and `qa/AGENTS.md` already treat `billing_integration` as environment-gated proof and tell operators to start on `dev` first

## Interfaces and Dependencies

The primary interfaces in this plan are GitHub Actions workflows under `.github/workflows/`, release docs under `docs/` and `apps/web/content/docs/`, and the QA control plane under `qa/`.

The plan depends on the existing `default_ship` and `billing_integration` pack model defined in `qa/scripts/run-pack.mjs` and documented in `qa/README.md` and `qa/AGENTS.md`.

If local hooks are added, they should depend only on fast local commands such as lint, format, secret scanning, and `qa:validate`. They must not depend on Stripe, Clerk, Convex remote state, Playwright browser packs, or any real payment-path command.
