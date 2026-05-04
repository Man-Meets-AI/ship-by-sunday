---
summary: Harden the repository's local, staging, and production release gates so tests, build proof, release-critical browser proof, and billing proof are enforced by the repo instead of depending on memory or manual follow-through.
read_when: Open this when changing local git hooks, GitHub Actions release gates, billing-proof policy, or production verification for Ship by Sunday.
plan_status: not_done
---

# Harden CI And Release Verification

This document is a living execution plan. Update it as discoveries are made, as milestones complete, and as design decisions change so another agent can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

The repository already has a good skeleton for code-centric CI and a separate `dev` staging workflow, but the most important release protections are still too easy to skip. A contributor can currently push without local test or build proof, the deepest browser lane is non-blocking and not part of the everyday release path, billing proof on `dev` is manual even when commercial code changed, and production web verification still lives mostly in docs and human memory. After this work, a contributor should be able to rely on the repository itself to enforce the expected safety path: local pushes run a real pre-push gate, `dev` runs blocking staging proof, billing-sensitive changes automatically trigger billing proof, and `main` runs a repository-owned production verification workflow with artifacts and explicit pass or fail evidence.

## Progress

- [x] 2026-04-01 09:34 EDT: Read the root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, and `docs/prompts/execplan-grill.md`.
- [x] 2026-04-01 09:34 EDT: Inspected the current control points in `package.json`, `apps/web/package.json`, `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `qa/scripts/run-pack.mjs`, `docs/release-workflow.md`, `apps/web/content/docs/ship-live.mdx`, and `apps/web/content/docs/deploy-to-vercel.mdx`.
- [x] 2026-04-01 09:34 EDT: Confirmed the current weak spots from the repository itself: the fast local gate is only `lint`, `format:check`, and `qa:validate`; `e2e-sandbox` in CI is limited to scheduled or manual runs and uses `continue-on-error: true`; `billing_integration` on `dev` is behind a workflow input; and production verification is documented but not enforced in a repository-owned workflow.
- [x] 2026-04-01 09:34 EDT: Completed the first grill pass on the plan and resolved three high-leverage design choices that were still too open for implementation: use committed `.githooks/` plus a root install script instead of adding Husky, move the advisory scheduled sandbox lane out of `ci.yml` instead of leaving it as a red-but-ignored CI job, and treat production verification as a post-merge `main` proof rather than a pre-merge branch-protection check.
- [x] 2026-04-01 09:34 EDT: Grilled the ExecPlan, resolved the hook mechanism, the advisory sandbox-lane strategy, the production verification strategy, and the post-merge semantics for production proof.
- [x] 2026-04-01 10:03 EDT: Implemented the repo-side hardening slice. Added committed `.githooks/`, a root hook installer, a shared release-scope detector, a hosted wait-for-host helper, a Vercel deployment wait helper, automatic billing detection in `Dev Staging Proof`, a dedicated `Production Release Proof` workflow, and a dedicated `Sandbox E2E Nightly` workflow so generic CI no longer contains the advisory deep lane.
- [x] 2026-04-01 10:20 EDT: Tightened the first implementation after review. Expanded the detector to cover workflow and QA-pack enforcement surfaces plus `apps/web/app/access-required/`, made manual workflow reruns classify the checked-out release automatically instead of defaulting billing proof to `false`, and made `Production Release Proof` wait for the exact Vercel production deployment for the release commit before it begins public-site QA.
- [x] 2026-04-01 10:16 EDT: Ran local validation for the repo-side changes. `bun run hooks:install`, `bun run precommit`, `bun run prepush`, `node qa/scripts/detect-release-scope.mjs --base=HEAD^ --head=HEAD`, `node qa/scripts/wait-for-host.mjs --url=http://example.com --path=/ --timeout_ms=10000 --interval_ms=1000`, `node --check qa/scripts/wait-for-vercel-production-deployment.mjs`, workflow YAML parsing, codebase JSON parsing, and `git diff --check` all passed.
- [x] 2026-04-01 10:41 EDT: Verified the canonical production QA persona prep path against `apps/web/.env.production` with `PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=apps/web/.env.production bun run qa:personas:prepare -- --pack=default_ship`. Both the no-access and entitled prod QA accounts already existed and the entitlement prep path completed cleanly.
- [x] 2026-04-01 10:43 EDT: Created the GitHub deployment environments `production-release-proof` and `production-billing-integration` via `gh api`.
- [x] 2026-04-01 10:45 EDT: Wrote the production rollout secrets via `gh`: environment secrets `PRODUCTION_QA_PERSONAS_LOCAL_JSON`, `PRODUCTION_WEB_ENV_LOCAL`, `PRODUCTION_CONVEX_CONFIG_JSON`, and `VERCEL_TOKEN` on both `production-release-proof` and `production-billing-integration`, plus `PRODUCTION_STRIPE_SECRET_KEY` and `PRODUCTION_STRIPE_WEBHOOK_SECRET` on `production-billing-integration`.
- [x] 2026-04-01 10:48 EDT: Enabled branch protection on `dev` with required PR status checks `static`, `integration`, `browser-smoke`, and `cli`, plus linear history, conversation resolution, stale-review dismissal, and admin enforcement.
- [x] 2026-04-01 10:49 EDT: Kept the deployment environments approval-free. Because only Parker and AI agents operate this repository, the live environment controls are branch policies plus environment-scoped secrets, not human reviewer gates or wait timers.

## Surprises & Discoveries

The repository already contains one completed ExecPlan, `docs/codex/2026-03-31-dev-staging-and-release-gates.md`, that established `dev` as integrated staging and `main` as production. This new plan must extend that model rather than reopen it. The current task is not branch-strategy design; it is hardening the enforcement around that existing strategy.

The repo already has the right browser packs and QA control-plane concepts. `qa/scripts/run-pack.mjs` defines `default_ship` and `billing_integration`, and `apps/web/playwright.config.ts` already supports both local-server smoke and hosted browser execution. The gap is not missing test primitives. The gap is when and how those primitives become required.

The repo also already accepts signed Vercel deployment webhooks at `apps/web/app/api/observability/vercel/route.ts`, but that route records failures and cancellations, not successful release verification. That means production proof should be modeled as a GitHub Actions workflow that runs browser-based verification against the public site, not as a passive webhook-only success signal.

The first implementation draft had one real release-safety hole: waiting only for `https://www.man-meets-ai.com` to return a healthy response could verify the previously live site instead of the newly released `main` commit. The corrected implementation adds `qa/scripts/wait-for-vercel-production-deployment.mjs` and requires `Production Release Proof` to wait for the exact Vercel production deployment for the release SHA before it starts public-site QA.

The local workspace's Node TLS trust is stricter than the shell `curl` trust bundle on this machine. During validation, `node` `fetch("https://example.com")` failed with `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, while `curl -I -L https://example.com` succeeded. The helper script itself was fine; the safe local validation path was to use `http://example.com` for a proof that the retry and success logic worked without depending on the host certificate store.

## Decision Log

Decision: create a new ExecPlan instead of reopening `docs/codex/2026-03-31-dev-staging-and-release-gates.md`.
Rationale: the earlier plan is already marked `done` and captured the branch and environment model. This work is a follow-on hardening slice that deserves its own living implementation record.
Date: 2026-04-01

Decision: keep the fast local `pre-commit` gate small, but add an enforced `pre-push` gate that runs the narrow web application confidence set: unit tests, contract tests, integration tests, and build.
Rationale: the feedback is specifically about local proof being too light. Running everything at `pre-commit` would make the inner loop unnecessarily slow, while `pre-push` is the right place to require code-level confidence without involving remote environments or billing side effects.
Date: 2026-04-01

Decision: add an in-repository git hook system instead of relying on docs that tell contributors to remember `bun run precommit`.
Rationale: the repo currently has no committed hook configuration. If the goal is real enforcement, the repository needs actual hook files and one setup path, not just script names.
Date: 2026-04-01

Decision: implement the local hook system with committed `.githooks/` files and a root install command that sets `git config core.hooksPath .githooks`, rather than adding Husky.
Rationale: this is the smallest enforcement mechanism that keeps the repo self-contained, avoids a new codebase dependency, and makes the hook path explicit to a novice.
Date: 2026-04-01

Decision: treat billing proof as mandatory for billing-sensitive releases, not literally for every change in the repository.
Rationale: forcing a real checkout handoff for a docs-only change would create noise and needless side effects. The safer and more honest rule is: if checkout, webhook, entitlement, access handoff, or billing configuration paths changed, billing proof must run automatically and cannot remain manual.
Date: 2026-04-01

Decision: implement billing-sensitivity as a repository-owned scope detector instead of a manual GitHub workflow input.
Rationale: manual opt-in is exactly the current weakness. A repo-local detector can classify a change based on touched files and drive both staging and production verification consistently.
Date: 2026-04-01

Decision: production verification should be a GitHub Actions workflow that targets `https://www.man-meets-ai.com`, writes artifacts, and runs `qa:run-pack` rather than a checklist that lives only in docs.
Rationale: the repo already knows how to run hosted QA against a target URL. Reusing that mechanism is smaller and safer than inventing a second verification system.
Date: 2026-04-01

Decision: the production verification workflow must wait for the exact Vercel production deployment for the release commit before it polls the public site and runs hosted QA.
Rationale: a plain public-domain readiness poll can go green against the previous production site while the new deployment is still building or waiting for alias assignment. Commit-aware deployment waiting is necessary to make the release evidence trustworthy.
Date: 2026-04-01

Decision: production verification is a required post-merge proof on `main`, not a pre-merge branch-protection check on the release pull request.
Rationale: the public site can only verify the deployed production release after `main` moves and Vercel rolls out. The pre-merge release safety signal remains `dev` staging proof on the same commit lineage.
Date: 2026-04-01

Decision: do not make GitHub Actions deploy the Vercel frontend.
Rationale: the repository contract in `docs/release-workflow.md` says Vercel owns production web deploys while GitHub owns release policy and Convex production deploys. This plan hardens verification after the Vercel deploy, not the ownership model itself.
Date: 2026-04-01

Decision: remove the advisory `e2e-sandbox` job from `.github/workflows/ci.yml` and, if the team wants to keep scheduled soak coverage, re-home it to a dedicated workflow that is clearly non-release and non-required.
Rationale: the current problem is not just that the job is non-blocking. It is that it lives inside `CI` while not participating in ordinary release safety. The blocking browser surface should be `dev` staging proof, while soak coverage can remain separate and honest about its role.
Date: 2026-04-01

Decision: name the shared diff classifier `qa/scripts/detect-release-scope.mjs`, name the public readiness helper `qa/scripts/wait-for-host.mjs`, and name the new production workflow `.github/workflows/production-release-proof.yml`.
Rationale: the repo already centers QA orchestration under `qa/scripts/`, so keeping the new helpers there makes the staging and production workflows easier to navigate for a novice.
Date: 2026-04-01

Decision: add aggregate `release_gate` jobs so the staging and production workflows emit one unambiguous result even when `billing_integration` is conditional.
Rationale: a conditional job alone is a weak operator signal. The aggregate gate can always run, fail when billing proof was required but missing, and stay green when billing proof was correctly skipped. That makes the `dev` branch promotion decision much clearer even though the integrated staging proof still happens after merge to `dev`.
Date: 2026-04-01

## Outcomes & Retrospective

The repo-side implementation is complete. Local contributors now have committed `.githooks/` files and a root `bun run hooks:install` command. `git commit` can run the fast gate and `git push` can run the new `prepush` code-proof gate. The shared release-scope detector exists at `qa/scripts/detect-release-scope.mjs`, the public readiness helper exists at `qa/scripts/wait-for-host.mjs`, and the Vercel deployment wait helper exists at `qa/scripts/wait-for-vercel-production-deployment.mjs`.

The workflow layer now reflects the intended release model. `.github/workflows/dev-staging-proof.yml` automatically detects billing-sensitive changes and runs `billing_integration` when needed instead of waiting for a manual checkbox. `.github/workflows/ci.yml` no longer carries the misleading advisory deep browser lane. That soak lane now lives in `.github/workflows/sandbox-e2e-nightly.yml`. Production now has a dedicated `.github/workflows/production-release-proof.yml` workflow that waits for the exact Vercel production deployment for the release commit, then runs hosted `default_ship`, and adds hosted `billing_integration` automatically when the release scope requires it.

The remaining work is small and policy-oriented, not implementation-oriented. The GitHub environments exist, the production secrets are present, and `dev` branch protection is on. GitHub environment required-reviewer rules were not enabled because the repository operates on a plan tier that rejected that protection rule with `HTTP 422`. The current live controls are branch protection, environment-scoped secrets, and the explicit workflow design.

## Context and Orientation

The local contributor gate now lives in the root `package.json`, `scripts/install-git-hooks.mjs`, and the committed `.githooks/` directory. `bun run check:fast` runs `bun run lint`, `bun run format:check`, and `bun run qa:validate`. `bun run precommit` delegates to that fast check. `bun run prepush` runs the code-level proof set: unit tests, contract tests, integration tests, and build. `bun run hooks:install` sets `git config core.hooksPath .githooks` so `git commit` and `git push` run the committed hook files instead of relying on memory or local shell aliases.

The code-centric CI workflow lives at `.github/workflows/ci.yml`. It now contains the always-on code-level jobs only: `static`, `cli`, `integration`, and `browser-smoke`. The old advisory `e2e-sandbox` job was removed from this file because a red-but-ignored deep browser lane inside generic CI was misleading. Scheduled or manual sandbox soak coverage now lives in `.github/workflows/sandbox-e2e-nightly.yml`.

The integrated staging proof workflow lives at `.github/workflows/dev-staging-proof.yml`. It writes `qa/personas.local.json` from a secret, writes `apps/web/.env.local` from a secret, configures Convex CLI auth, runs `bun run qa:run-pack -- --pack=default_ship`, and uses `qa/scripts/detect-release-scope.mjs` to decide whether `billing_integration` must also run. The aggregate `release_gate` job makes that conditional behavior legible because it always reports one pass or fail result for the staging candidate after the merge to `dev`.

The QA pack model lives in `qa/scripts/run-pack.mjs` and the docs in `qa/README.md`. `default_ship` already runs the QA control-plane validation, persona preparation, browser smoke, a codebase integration-ui subset, and an authenticated browser pack. `billing_integration` already runs persona preparation plus `apps/web`'s `test:e2e:sandbox:billing-integration`, and on local targets it also runs `stripe:dev:doctor` and `stripe:dev:verify`. These packs are good building blocks; they only need to be wired into the right release stages.

The browser runner configuration for local and hosted Playwright flows lives in `apps/web/playwright.config.ts`. The `browser-smoke` project covers shallow browser proof, while `sandbox-e2e` is the deeper authenticated browser project. Hosted runs are controlled by `PLAYWRIGHT_BASE_URL`, and local-server runs are controlled by `PLAYWRIGHT_USE_LOCAL_SERVER=1`.

The release and deployment contract lives in `docs/release-workflow.md`, `apps/web/content/docs/ship-live.mdx`, and `apps/web/content/docs/deploy-to-vercel.mdx`. Those docs already say `dev` is integrated staging, `main` is production, Vercel owns the web deploy, and Convex production deploys from GitHub Actions. They also already describe production verification commands such as:

    PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com QA_ENV_FILE=apps/web/.env.production bun run qa:run-pack -- --pack=default_ship

The gap is no longer missing enforcement code. The remaining gap is rollout outside the git tree: GitHub secrets, protected environments, and branch-protection rules still need to match the tracked workflow design.

For this plan, the key plain-English terms mean the following. A local hook is a git command that runs automatically on a contributor machine before a commit or push proceeds. Code-centric CI means the generic checks that can run with dummy env values and no live provider side effects. Staging proof means browser-driven proof against the integrated `dev` environment with real auth and Convex wiring. Billing proof means a safe checkout-to-access handoff run that exercises the actual payment integration path. Production verification means a GitHub Actions workflow that runs after `main` release activity and proves the live site still behaves correctly.

## Plan of Work

Start by creating the local enforcement path because it is the smallest self-contained slice and does not depend on secrets or GitHub environments. Add committed `.githooks/pre-commit` and `.githooks/pre-push` files, add a root `hooks:install` command that sets `core.hooksPath` to `.githooks`, keep `pre-commit` fast, add a new `pre-push` script, and document exactly what each hook does and does not do. The `pre-push` scope should stay code-only and side-effect free: web unit tests, contract tests, integration tests, and build. It must not run Playwright against hosted environments, Stripe listeners, or any billing pack.

Next, add a repository-owned release-scope detector. This should be a small script in the repo, not an inline pile of shell in workflow YAML and not a third-party policy service. Put it under `qa/scripts/` and have it accept explicit `--base` and `--head` refs so it works locally and in GitHub Actions. On push-triggered workflows, the default comparison should be `github.event.before` to `github.sha`. On manual reruns, the workflow should allow an explicit `force_billing` override because there may be no meaningful push diff. The detector should classify whether a change is billing-sensitive by inspecting touched paths for Stripe checkout code, webhook or Convex billing handlers, checkout-success handoff logic, product-access grant paths, relevant tests, and the deployment docs or env contracts that can change billing behavior. The script should produce machine-readable outputs so multiple workflows can use the same classification instead of re-implementing their own path lists.

Then harden the staging workflow. Remove the current manual-only shape for billing proof and make `default_ship` blocking in the real release path. The `dev` workflow should always run `default_ship`, and it should automatically run `billing_integration` when the scope detector says the change is billing-sensitive. The same workflow is the release-critical browser surface, so Playwright failure must fail the workflow. Upload artifacts on failure so a reviewer has evidence, not just a red check.

After that, remove the misleading advisory deep-browser lane from `.github/workflows/ci.yml`. If the team still wants nightly or manual sandbox soak coverage, move that logic into a separate workflow such as `.github/workflows/sandbox-e2e-nightly.yml` so CI remains honest about what is required.

After that, add repository-owned production verification. Create a new GitHub Actions workflow for `main` that first waits for the exact Vercel production deployment for the release commit through a repo-local helper that reads `.vercel/project.json` and uses `VERCEL_TOKEN`, then waits for the public site to be reachable, writes the production QA credentials and env file from secrets, runs the production `default_ship` hosted pack, and uploads artifacts and a job summary. When the scope detector says the release is billing-sensitive, the workflow should also run hosted `billing_integration` with `QA_ALLOW_BILLING_INTEGRATION=1`. This workflow is the replacement for “someone should remember to do the production browser pass.”

Finally, align the docs and rollout notes with the new enforcement model. Update the release docs so contributors know that the repo now owns the enforcement path. Update any QA docs that still talk about billing proof as opt-in. Record any remaining external rollout steps, such as adding new GitHub secrets or marking required checks in branch protection, in the ExecPlan and final summary rather than hiding them.

## Milestones

Milestone 1 establishes enforced local hooks. At the end of this milestone, a novice can clone the repo, install dependencies, run one repository command to set `core.hooksPath` to `.githooks`, and know that `git commit` runs the fast gate while `git push` runs the code-level proof set. The touched files should include the root `package.json`, `.githooks/pre-commit`, `.githooks/pre-push`, and the release documentation that explains the difference between `pre-commit` and `pre-push`. Run the hook target commands directly from the repository root to prove they work before relying on git to trigger them.

Milestone 2 creates a shared release-scope detector and uses it to harden staging proof. At the end of this milestone, `.github/workflows/dev-staging-proof.yml` should no longer depend on a manual workflow input for billing proof. A billing-sensitive push to `dev` should automatically run both `default_ship` and `billing_integration`, and a non-billing-sensitive push should still run blocking `default_ship`. Success is demonstrated by the detector producing stable outputs locally and by the workflow YAML clearly consuming those outputs.

Milestone 3 removes the misleading advisory browser lane from generic CI and leaves only honest required or clearly informational browser workflows. At the end of this milestone, the repository should no longer have a deep browser lane inside `CI` that is both non-blocking and detached from ordinary release flow. Success is demonstrated when `.github/workflows/ci.yml` no longer contains the red-but-ignored `e2e-sandbox` job and any preserved soak lane lives in a dedicated non-release workflow.

Milestone 4 adds repository-owned production verification. At the end of this milestone, a push to `main` should be able to trigger a GitHub Actions workflow that proves the public site through the same QA control-plane commands the docs currently tell a human to run manually. The touched files should include a new workflow file plus any supporting scripts such as a public-URL readiness poller, plus the docs that explain the new required secrets. Success is demonstrated by the workflow shape, required secrets list, artifact upload, and a documented local validation path for the reusable scripts.

Milestone 5 aligns the release documentation and rollout checklist. At the end of this milestone, `docs/release-workflow.md`, `apps/web/content/docs/ship-live.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, and `qa/README.md` should describe the same enforcement path. Success is demonstrated when a novice reading only the repo can understand which proof is automatic, which proof is conditional on billing-sensitive scope, and which remaining tasks still require GitHub or Vercel admin action outside the git tree.

## Concrete Steps

Work from the repository root unless a command says otherwise.

1. Reconfirm the current weak spots before changing code:

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,120p' package.json
    sed -n '1,220p' .github/workflows/ci.yml
    sed -n '1,220p' .github/workflows/dev-staging-proof.yml
    sed -n '1,220p' qa/scripts/run-pack.mjs

   Expected observation: `precommit` is only the fast QA and formatting gate, `e2e-sandbox` is scheduled or manual and uses `continue-on-error: true`, and `billing_integration` is guarded by a workflow input.

2. Implement the local hook system with committed `.githooks/`.

   Add `.githooks/pre-commit` and `.githooks/pre-push`, and add a root install command such as `bun run hooks:install` that executes:

    git config core.hooksPath .githooks

   Keep `bun run precommit` as the fast `git commit` target and add a new `bun run prepush` command that runs:

    bun run test:unit
    bun run test:contracts
    bun run test:integration
    bun run build

   Expected observation: both commands can be run directly without a git event, and the hook installer points `git` at the committed hook files.

3. Add a release-scope detector script.

   Create a new repo-local script, likely under `qa/scripts/`, that accepts a base ref and a head ref and prints machine-readable outputs such as:

    {
      "billingSensitive": true,
      "changedFiles": ["apps/web/app/api/stripe/checkout/route.ts", "..."]
    }

   The detector should classify billing-sensitive changes when the diff touches checkout session creation, Stripe or Convex webhook handling, checkout-success handoff logic, product-access grant logic, billing-focused browser tests, or release configuration that can alter the live payment path. Keep the path list in the repo so it can be reviewed and updated. In GitHub Actions push workflows, feed the detector `github.event.before` and `github.sha`. In `workflow_dispatch` reruns, allow an explicit manual `force_billing` input because there may be no useful base SHA.

4. Harden `.github/workflows/dev-staging-proof.yml`.

   Replace the manual-only `billing_integration` input path with detector-driven logic. The workflow should:

   - run on pushes to `dev`
   - always run blocking `default_ship`
   - run blocking `billing_integration` automatically when `billingSensitive` is `true`
   - still allow an explicit manual override through `workflow_dispatch` when someone needs a rerun without a useful diff
   - upload Playwright artifacts on failure

   Expected observation: the workflow YAML shows one detector job or step, then jobs that consume its outputs instead of relying on a human to check a box.

5. Remove the non-blocking deep-browser hole in `.github/workflows/ci.yml`.

   The current `e2e-sandbox` job is advisory because it is detached from the normal release path and marked `continue-on-error: true`. The implementation choice for this plan is explicit: remove it from `ci.yml`. If the team wants to preserve nightly or manual soak coverage, re-home that logic into a separate workflow file so it is clearly informational rather than pretending to be part of required CI. Do not leave a red-but-ignored deep browser job behind.

6. Add a new production verification workflow.

   Create a new workflow under `.github/workflows/` that runs on `push` to `main` and optionally on `workflow_dispatch`. It should:

   - materialize production QA personas and production env values from repository secrets
   - wait for the exact Vercel production deployment for the release commit by using a repo-local helper and `VERCEL_TOKEN`
   - poll the public site until it is reachable before running Playwright by using a repo-local helper script instead of ad hoc shell
   - run `bun run qa:run-pack -- --pack=default_ship --slug=prod-${{ github.run_id }}`
   - run `billing_integration` automatically when the scope detector says the release is billing-sensitive, or when `workflow_dispatch` explicitly forces it
   - upload Playwright artifacts and a readable job summary

   Use helpers such as `qa/scripts/wait-for-vercel-production-deployment.mjs` and `qa/scripts/wait-for-host.mjs` so the deployment and readiness logic is testable locally and reusable in reruns.

7. Update the release documentation.

   Edit `docs/release-workflow.md`, `apps/web/content/docs/ship-live.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, `qa/README.md`, and any other touched release-facing docs so they describe the new rule precisely: local commit is fast, local push is code-proof, `dev` runs blocking staging proof, billing-sensitive changes automatically get billing proof, and `main` triggers repository-owned production verification after release.

8. Keep this ExecPlan current.

   After each milestone, update `Progress`, add any real surprises, record decisions made during implementation, and append exact validation results.

## Validation and Acceptance

The work is only complete when the repository can prove each of the following with code, workflow configuration, or repeatable commands.

First, local enforcement must be real. A contributor must be able to install the hooks and then run the hook targets directly from the repository root. The commands below must pass locally before the hook wiring is considered safe:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run precommit
    bun run prepush

   Expected observation: `precommit` runs only the fast local gate, while `prepush` runs the four code-level proof commands without reaching out to hosted QA or Stripe.

Second, the release-scope detector must be demonstrably stable. Add at least one local validation command that compares two refs and shows whether a sample billing-sensitive diff is detected correctly. A likely shape is:

    cd /Users/parkerrex/Projects/ship-by-sunday
    node qa/scripts/<detector>.mjs --base=main --head=HEAD

   Expected observation: the script prints machine-readable output, exits successfully, and clearly states whether billing proof is required.

Third, workflow files must be syntactically and structurally valid. After editing workflows, run:

    cd /Users/parkerrex/Projects/ship-by-sunday
    ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |file| YAML.load_file(file) }; puts "workflow yaml ok"'

   Expected observation: `workflow yaml ok`

Fourth, repository docs and dependency manifests must stay parseable and clean:

    cd /Users/parkerrex/Projects/ship-by-sunday
    node -e 'JSON.parse(require("fs").readFileSync("package.json","utf8")); console.log("root codebase json ok")'
    node -e 'JSON.parse(require("fs").readFileSync("apps/web/package.json","utf8")); console.log("apps/web codebase json ok")'
    bun run qa:validate
    git diff --check

   Expected observation: both codebase files parse, `qa:validate` remains green, and `git diff --check` prints nothing.

Fifth, acceptance must be observable from the repo contract itself. A novice reading the final repository state must be able to answer these questions without chat history:

- What runs automatically on `git commit`?
- What runs automatically on `git push`?
- Which workflow proves `dev` staging is healthy?
- When is `billing_integration` required and who decides that?
- Which workflow verifies production after a `main` release?
- Which rollout tasks still require GitHub or Vercel admin access outside the repository?

Seventh, the merge semantics must be explicit in the final docs. A novice must be able to tell that `dev` staging proof is the pre-merge release gate and that production verification is post-merge evidence on `main`, not a check that can block the release pull request before the site exists.

Sixth, the production helper scripts must be locally sanity-checkable even though production secrets are not available in this workspace. If the implementation adds a host-wait helper, run it against a safe public URL or a local fixture and record the result in this plan.

## Idempotence and Recovery

The hook installation path must be safe to rerun. If the chosen hook installer writes a git config setting such as `core.hooksPath`, rerunning the installer should simply refresh the same setting and not duplicate files or require manual cleanup. If a contributor needs to opt out temporarily during debugging, document the supported recovery path, but do not make opt-out the default workflow.

The release-scope detector must be deterministic for the same pair of refs. If it cannot resolve a base ref in a local workspace or workflow checkout, it should fail loudly with a clear error rather than silently deciding that billing proof is unnecessary.

Workflow hardening should be additive before subtractive. Add the new detector and production verification workflow before deleting or repurposing any existing advisory lane. That way there is always at least one known path to the deeper browser evidence while the migration is in flight.

Production verification must be retry-safe. The workflow should use safe hosted QA commands and, when billing proof is required, only the existing safe no-cost billing method already documented by the repo. If a production verification run fails after the site is already deployed, the recovery path is to rerun the verification workflow with the same target secrets and inspect the uploaded Playwright artifacts. Do not treat a failed verification rerun as a reason to redeploy automatically from GitHub unless that policy is intentionally added later.

If new repository secrets or protected environments are required, document them in the plan and final summary as rollout tasks. The implementation is not allowed to pretend those secrets exist locally when they cannot be validated in this workspace.

## Artifacts and Notes

Useful evidence gathered during implementation:

    Hook installation transcript:
    - `bun run hooks:install`
      `Configured git hooks: /Users/parkerrex/Projects/ship-by-sunday/.githooks`

    Fast local gate transcript:
    - `bun run precommit`
      `Found 0 warnings and 0 errors.`
      `All matched files use the correct format.`
      `QA control plane is internally consistent.`

    Shared release-scope transcript:
    - `node qa/scripts/detect-release-scope.mjs --base=de8a01e^ --head=de8a01e`
      `billingSensitive: true`
      `billingSensitiveFiles: ["apps/web/app/api/stripe/checkout/route.ts", "..."]`

    Public readiness transcript:
    - `node qa/scripts/wait-for-host.mjs --url=http://example.com --path=/ --timeout_ms=10000 --interval_ms=1000`
      `{ "ready": true, "baseUrl": "http://example.com", "results": [{ "path": "/", "status": 200, "url": "http://example.com/" }] }`

    Workflow syntax transcript:
    - `ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |file| YAML.load_file(file) }; puts "workflow yaml ok"'`
      `workflow yaml ok`

    Aggregate gate follow-up transcript:
    - Re-ran `bun run precommit`
    - Re-ran workflow YAML parsing
    - Re-ran `git diff --check`

    Codebase parsing transcript:
    - `root codebase json ok`
    - `apps/web codebase json ok`

    Full local code-proof transcript:
    - `bun run prepush`
      `Test Files 105 passed (105)`
      `Test Files 1 passed (1)`
      `Test Files 26 passed (26)`
      `Compiled successfully`

    Diff hygiene transcript:
    - `git diff --check`
      no output

## Interfaces and Dependencies

The root `package.json` is the interface for local contributor gates. If this plan introduces `prepush`, the script name and command contract must be explicit and stable enough for docs and hooks to rely on it.

The chosen git hook system for this plan is committed `.githooks/` plus a root install command that sets `core.hooksPath`. There is no need to add Husky unless implementation proves the simpler path insufficient.

`qa/scripts/run-pack.mjs` is the execution interface for `default_ship` and `billing_integration`. This plan assumes those pack names stay stable and are reused by the workflows rather than duplicated with ad hoc Playwright invocations.

The new release-scope detector should be a repo-local script under `qa/scripts/` so both staging and production workflows can consume the same classification logic. Its interface should accept explicit refs or SHAs and emit machine-readable output that GitHub Actions can consume.

`.github/workflows/dev-staging-proof.yml` remains the integrated staging proof interface for `dev`. `.github/workflows/ci.yml` remains the generic code-centric CI interface for pull requests and `main`. This plan adds one new production verification workflow rather than overloading the existing CI file with production-only concerns.

If the team wants to preserve scheduled soak coverage, add a separate workflow file such as `.github/workflows/sandbox-e2e-nightly.yml`. That workflow must be clearly documented as informational and must not be confused with required release proof.

The production verification workflow depends on repository secrets that are not currently represented in the tracked files. The repo-side implementation uses these names: `PRODUCTION_QA_PERSONAS_LOCAL_JSON`, `PRODUCTION_WEB_ENV_LOCAL`, `PRODUCTION_CONVEX_CONFIG_JSON`, `PRODUCTION_STRIPE_SECRET_KEY`, and `PRODUCTION_STRIPE_WEBHOOK_SECRET`.

`apps/web/playwright.config.ts` is the browser dependency contract. Hosted verification depends on `PLAYWRIGHT_BASE_URL` and the existing `sandbox-e2e` and `browser-smoke` projects. Do not fork a second browser configuration unless the existing one proves insufficient.
