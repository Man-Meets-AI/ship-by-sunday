# Build a journey-first QA operating system

This is a living execution plan for replacing low-confidence, implementation-led test sprawl with a product-readable QA operating system. It is written so a fresh coding agent can execute the work without prior chat context and must be updated as decisions, discoveries, validation results, and scope adjustments accumulate.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

The product has many tests, but there is no single place where a product manager can answer basic questions such as what journeys matter, which user type a test is proving, which tests are stale after route changes, and what browser flows were actually exercised before ship. After this change, a human should be able to open a root-level `qa/` folder and understand the product in plain English by journey bucket, starting persona, scenario pack, and current confidence state. A coding agent should then be able to use that same `qa/` folder to decide which tests to keep, which to delete, which browser flows to run, and which ship risks remain.

The user-visible outcome is a QA source of truth that speaks in product journeys instead of test filenames. For this repository, the first important realities are the signed-out visitor, the signed-in member without access, the signed-in member with access, and the real free-to-paid handoff. The protected product is packet-first, so the first ship-critical protected journeys also include `Start -> Product -> Design -> Marketing -> Build Plan -> Review`, plus settings and access recovery. Someone should be able to see the system working by opening the `qa/` folder, reading the glossary and journey catalog, preparing the required personas, running the matching browser flows, and then reading a short run report that says what passed, what failed, and what remained unverified.

## Progress

- [x] 2026-03-25 10:05 EDT — Read `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, `docs/prompts/execplan-grill.md`, `AGENTS.md`, `apps/web/AGENTS.md`, and the real route and test surfaces under `apps/web/`.
- [x] 2026-03-25 10:05 EDT — Locked the planning stance with the user: do not preserve the current project QA practice as the design baseline; treat existing tests and docs as audit input only.
- [x] 2026-03-25 10:14 EDT — Grill decision: removed legacy route aliases such as `/mission` and `/artifacts` from the customer-facing QA model because those routes are effectively gone and there are no live users requiring compatibility coverage.
- [x] 2026-03-25 10:18 EDT — Grill decision: v1 must include the canonical packet-first protected funnel, not only buyer/auth/access perimeter checks.
- [x] 2026-03-25 10:22 EDT — Grill decision: real `free -> paid` checkout remains in the QA system as a separate billing-integration pack, not a mandatory every-ship gate.
- [x] 2026-03-25 10:26 EDT — Grill decision: keep personas and journey buckets as separate fields in the data model, but present them together in the PM-facing sheet.
- [x] 2026-03-25 10:32 EDT — Grill decision: default ship coverage means majority coverage, specifically the homepage, auth entry and redirect, no-access recovery, the canonical packet funnel, review/download, settings, and checkout-success recovery. Docs, starter-repo access, and Codex connection move to an extended pack.
- [x] 2026-03-25 10:36 EDT — Grill decision: the outdated-test sweep must inventory the full current `apps/web/tests/` suite. At plan creation time this suite contains 101 files, including 74 unit tests.
- [x] 2026-03-25 10:37 EDT — Grill decision: restored the deleted plan into the canonical `docs/codex/` location after the untracked `.codex/` copy was accidentally removed.
- [x] 2026-03-25 10:41 EDT — Grill decision: the root `qa/` folder must fully own persona protocol and account-definition rules, with no dependency on legacy skill-local config.
- [x] 2026-03-25 10:45 EDT — Grill decision: committed `qa/` files define only the non-secret persona protocol and required fields; actual credentials remain local-only in ignored files inside the `qa/` zone.
- [x] 2026-03-25 10:49 EDT — Grill decision: baseline and ship reports are committed durable evidence, while ad hoc local dry-run reports are ignored.
- [x] 2026-03-25 13:42 EDT — Created the root `qa/` operating layer with `qa/README.md`, `qa/glossary.md`, `qa/AGENTS.md`, `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, `qa/personas.json`, `qa/personas.example.json`, `qa/personas.local.example.json`, `qa/templates/run-report.md`, and `qa/runs/README.md`.
- [x] 2026-03-25 13:42 EDT — Defined the initial journey taxonomy with 22 scenario IDs covering visitor entry, docs, auth, access recovery, the packet funnel, settings, starter repo, Codex, observability, and billing integration.
- [x] 2026-03-25 13:42 EDT — Inventoried the full current `apps/web/tests/` tree into `qa/test-inventory.csv` with 103 rows and explicit keep, rewrite, merge, or replace dispositions.
- [x] 2026-03-25 13:42 EDT — Replaced the operator-facing persona protocol with `qa/`-owned files plus ignored `qa/personas.local.json`, and added root commands for `qa:personas:prepare` and `qa:personas:reset`.
- [x] 2026-03-25 13:42 EDT — Added subagent instructions, fast validation, and scenario-pack report scaffolding through `qa/AGENTS.md`, `qa/scripts/validate.mjs`, `qa/scripts/generate-test-inventory.mjs`, and `qa/scripts/ship.mjs`.
- [x] 2026-03-25 14:18 EDT — Added `Gap Reviewer` as a first-class QA role in the operating model so unmapped or stale release-critical scenarios are reviewed explicitly instead of only being implied by CSV rows.
- [x] 2026-03-25 14:34 EDT — Rewrote the sandbox browser specs to use canonical packet routes and scenario-pack tags, replacing `/mission` and `/artifacts` assertions with `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, `/review`, and `/settings`.
- [x] 2026-03-25 14:34 EDT — Added an explicit `qa:run-pack` command plus tagged Playwright scripts for `default_ship` and `billing_integration`, so a fresh operator can see the exact pack ritual without guessing.
- [x] 2026-03-25 15:46 EDT — Ran the first committed baseline sweep against `https://www.man-meets-ai.com` and wrote `qa/runs/2026-03-25-default-ship-baseline.md`.
- [x] 2026-03-25 15:46 EDT — Recorded the first billing-integration sweep as explicitly blocked in `qa/runs/2026-03-25-billing-integration-blocked.md` because no safe test-payment environment could be confirmed.
- [x] 2026-03-25 16:02 EDT — Retried the pack on current `main`. Local `browser-smoke` passed on both `127.0.0.1` and `localhost`, the public hosted sandbox rerun still failed on the mission-vs-packet contract mismatch, and authenticated local sandbox attempts remained blocked by the current Playwright auth-bootstrap approach.

## Surprises & Discoveries

The repository already has multiple testing layers, but they describe implementation slices rather than the product model. `apps/web/tests/browser-smoke/app-smoke.spec.ts` proves the public shell and checkout-success recovery surface. `apps/web/tests/e2e/auth-protection.sandbox.spec.ts` and `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts` prove richer auth and entitlement behavior, but their meaning is trapped inside spec files instead of a PM-readable catalog.

The route tree has moved further than some old labels suggest. `apps/web/app/(workspace)/mission/page.tsx` now redirects to `routeConfig.start`, and `apps/web/app/(workspace)/artifacts/page.tsx` redirects to `routeConfig.review`. The canonical protected flow is now packet-first and lives at `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, `/review`, with `/settings` as a supporting protected surface. The plan must therefore treat those canonical routes as first-class and not inflate removed aliases into customer-facing scenarios.

The current real checkout handoff is still valuable, but it should not be forced into every ship gate. The repository already supports deterministic direct access grant through `apps/web/scripts/ensure-clerk-entitled-test-user.mjs`, which means access-granted flows can be verified without running Stripe every time. That allows the QA system to separate default ship coverage from billing-sensitive coverage.

The current test suite is large enough that a partial inventory would preserve the exact confidence problem this plan is meant to solve. At plan creation time, `apps/web/tests/` contains 101 files: 74 unit tests, 11 integration-ui tests, 7 integration tests, 4 end-to-end browser files, 1 browser-smoke spec, and a few support files. The audit must therefore cover the full suite even if only some packs are enforced first.

The current account-definition ownership is wrong for the desired end state. `apps/web/scripts/ensure-clerk-test-user.mjs` reads from `.agents/skills/QA-Browser/references/internal-test-accounts.json`, which means today’s protocol lives in a skill folder. The new QA zone must own that protocol outright.

During implementation, the live test tree had already grown beyond the plan-creation snapshot. The generated inventory found 103 `.ts` and `.tsx` files under `apps/web/tests/`, not 101, because the tree now includes the new observability helper tests that were untracked when the plan was written. The validator therefore needs to compare against the live filesystem instead of a frozen count.

The first attempt at `qa:personas:prepare` failed with a raw `ENOENT` when `qa/personas.local.json` was missing. That failure path is part of the control plane, not an edge case, because a fresh machine will hit it immediately. The persona loader and command wrapper now return a short actionable error that points at `qa/personas.local.example.json`.

The first control-plane draft described four subagent roles, but the data model already needed a fifth role in practice. `qa/coverage.csv` can mark gaps and stale browser proof, yet without an explicit `Gap Reviewer` responsibility those issues are easy to leave as passive spreadsheet facts. The operating model now promotes gap review into a named task.

The route rewrite revealed that the middle packet stages are not standalone marketing pages with unique layout chrome. `/product`, `/design`, `/marketing`, and `/build-plan` all render through the shared `PacketStagePage` shell. Stable browser assertions therefore need to combine the canonical URL with shared packet markers such as the visible stage label, `Stage status`, and `Save step`, rather than searching for bespoke page headings that do not exist.

The new pack runner is useful even before live credentials are present, because dry-run output is itself a validation surface. `qa:run-pack -- --pack=default_ship --dry-run` and the billing equivalent now print the exact command plan, which means a PM or operator can review the ritual before touching Clerk or Stripe.

The first real hosted baseline run exposed the main product risk immediately: the public domain `https://www.man-meets-ai.com` still serves the old mission-based workspace contract. On that domain, `/start` renders `Page not found` and offers an `Open workspace` link that points to `/mission`. That means the repo’s packet-first route contract is ahead of what the public deployment is currently serving.

The recent `mma-shipbysunday` Vercel deployments were not a usable fallback during the run. The alias URL returned `DEPLOYMENT_NOT_FOUND`, while older ready preview URLs were protected behind Vercel login. The only usable public baseline environment was the custom domain.

Retrying on fresh `main` changed one useful implementation detail but not the product finding. Local `browser-smoke` now passes cleanly on current `main`, which means the public shell and recovery surfaces are fine in the current code. The authenticated local sandbox lane is still blocked because Playwright `globalSetup` attempts to sign in before the local app is stably reachable. The hosted sandbox lane remains the trustworthy evidence source for protected-route behavior.

## Decision Log

2026-03-25 — Decision: this initiative is a clean-slate QA operating system, not an extension of the current QA practice. Rationale: the user explicitly does not trust the current tests or QA docs, and the goal is to create a PM-readable source of truth rather than inherit existing structure.

2026-03-25 — Decision: the canonical QA layer will live in a new root-level `qa/` folder. Rationale: this is a product and shipping concern for the whole repository, not only an `apps/web/tests/` concern, and the user wants one centralized zone under repository control.

2026-03-25 — Decision: the new QA source of truth will use Markdown plus CSV. Rationale: Markdown is best for definitions, instructions, and subagent behavior, while CSV is best for sortable journey catalogs, coverage maps, and test inventories that both humans and agents can parse cleanly.

2026-03-25 — Decision: removed legacy route aliases such as `/mission` and `/artifacts` from the customer-facing QA model. Rationale: the user confirmed those routes are effectively removed and there are no live users whose behavior requires compatibility coverage.

2026-03-25 — Decision: v1 must cover the canonical packet-first protected funnel, not only auth and access perimeter checks. Rationale: the real product contract in `apps/web/AGENTS.md` and `apps/web/app/(workspace)/` is `Start -> Product -> Design -> Marketing -> Build Plan -> Review`, so the QA system would be misleading if it modeled only sign-in and access handoff.

2026-03-25 — Decision: real checkout and access handoff remain in the QA system as a separate `billing_integration` pack rather than a default every-ship gate. Rationale: this preserves real billing confidence without forcing expensive or noisy Stripe browser runs on every ordinary change.

2026-03-25 — Decision: keep personas separate from journey buckets in the data model, but present them together in the PM-facing catalog. Rationale: journey buckets such as `Visitor FTUX`, `No-Access FTUX`, `Has-Access EUX`, and `Free -> Paid` are the easiest way to understand the product, while a separate persona field keeps browser execution and preparation precise and reusable.

2026-03-25 — Decision: "majority coverage" for the default ship pack means homepage, auth entry and redirect behavior, no-access recovery, the canonical packet funnel, review/download, settings, and checkout-success recovery. Rationale: this covers the main customer path and its critical support surfaces without bloating every ship with secondary modules.

2026-03-25 — Decision: docs, starter-repo access, and Codex connection belong to an `extended` pack in v1, not the default every-ship pack. Rationale: these are important surfaces, but they are secondary to the main buyer-to-workspace path and packet funnel.

2026-03-25 — Decision: model the packet funnel as one scenario per major stage boundary plus one umbrella end-to-end scenario. Rationale: this is specific enough to localize breakage while avoiding row explosion.

2026-03-25 — Decision: the audit must inventory the full current test suite, not only browser or ship-critical files. Rationale: the user’s confidence problem is about the meaning of the whole test tree, so a partial inventory would leave the main problem unsolved.

2026-03-25 — Decision: the root `qa/` folder must own the canonical persona protocol and account-definition contract. Rationale: the user explicitly wants one centralized zone under repository control instead of a dependency on skill-local files.

2026-03-25 — Decision: committed QA protocol files live in `qa/`, while actual credentials remain local-only. Rationale: the repository forbids secrets in source control, but the user wants the whole QA system to stay in one zone, so ignored local files inside `qa/` are the right compromise.

2026-03-25 — Decision: baseline and ship reports in `qa/runs/` are committed durable evidence, while ad hoc local dry-run reports are ignored. Rationale: release evidence should be reviewable over time, but experimental runs should not clutter git history.

2026-03-25 — Decision: generate `qa/test-inventory.csv` from a checked-in heuristic script rather than maintaining 100-plus rows entirely by hand. Rationale: the inventory must stay synced to the live `apps/web/tests/` tree, and a generator makes filesystem drift obvious instead of silently letting the CSV rot.

2026-03-25 — Decision: keep the existing sandbox browser specs in the inventory as `rewrite` targets instead of rewriting them in the same slice as the control plane. Rationale: the first slice needed a stable product-readable model and safe command surface before changing browser assertions tied to legacy `/mission` and `/artifacts` aliases.

2026-03-25 — Decision: the first `qa:ship` implementation scaffolds a dated local report and selected scenario list instead of auto-running the full browser pack. Rationale: this gives the repository one obvious reporting ritual immediately while deferring environment-sensitive execution logic until the canonical packet-route sweeps are rewritten.

2026-03-25 — Decision: add `Gap Reviewer` as a first-class QA role instead of treating gap review as an implicit side effect of `qa/coverage.csv`. Rationale: release-critical missing coverage needs an explicit owner or it will be noticed too late.

2026-03-25 — Decision: tag sandbox browser scenarios with `@default_ship`, `@billing_integration`, and `@extended` rather than relying on file names alone. Rationale: the same spec file can now hold multiple operational packs without forcing duplicate files or fuzzy grep conventions.

2026-03-25 — Decision: add `qa:run-pack` as the explicit pack orchestrator and require `QA_ALLOW_BILLING_INTEGRATION=1` for live billing runs. Rationale: the repository needs one obvious command for each pack, and billing must stay opt-in so a local typo cannot trigger a payment flow accidentally.

2026-03-25 — Decision: treat the public custom domain as the default baseline evidence source until a packet-first preview deployment is both healthy and publicly reachable. Rationale: local sandbox attempts were useful for fixing the runner, but the custom domain was the only environment that produced trustworthy customer-facing evidence.

2026-03-25 — Decision: block the first billing-integration sweep instead of guessing. Rationale: the reachable public domain was not explicitly confirmed as Stripe test-only, and payment confirmation is too risky to run on assumption.

2026-03-25 — Decision: document authenticated local sandbox execution as a current tooling limitation rather than pretending it is a stable lane. Rationale: local `browser-smoke` is working, but `globalSetup`-driven auth bootstrap is not yet a reliable match for Playwright’s local web-server lifecycle.

## Outcomes & Retrospective

The repository now has a real root-level QA control plane instead of a blank plan. A PM or coding agent can open `qa/` and see the glossary, 22 scenario rows, a coverage map with explicit `rewrite_required` and `gap` states, a 103-row inventory of the current automated suite, a committed persona protocol, a pack runner, and the first committed reports under `qa/runs/`.

The most important outcome is not that the pack went green. It is that the first baseline sweep made the current ship risk obvious: the public deployment is still serving `/mission` semantics while the repo and QA model now treat `/start -> /product -> /design -> /marketing -> /build-plan -> /review` as canonical. That is exactly the kind of product-readable mismatch this control plane was meant to surface.

The main remaining gap is deployment parity plus safe billing execution. `default_ship` now has committed evidence. `billing_integration` is explicitly blocked until a test-only payment environment is confirmed. The next slice should focus on getting a packet-first deployment live and public, then rerunning `default_ship` and finally unblocking `billing_integration`.

Known future follow-up areas already visible at plan creation time are mobile-specific journey packs, richer CI isolation for personas, and deeper automation for diff-to-scenario selection. Those are out of scope for the first slice unless they become necessary to make the base system coherent.

## Context and Orientation

This repository’s web application lives in `apps/web/`. Routes are defined in `apps/web/app/`, feature logic lives in `apps/web/features/`, and automated tests live in `apps/web/tests/`. The current test tree has several layers: `unit`, `contracts`, `integration`, `integration-ui`, `browser-smoke`, and `e2e`. These layers are useful inputs for the audit, but they are not the new model. The new model starts with product journeys and only then maps code-level tests onto those journeys.

The important current route surfaces, as seen in the real routes and tests, are the public landing page at `/`, the sign-in route at `/sign-in`, the checkout-success recovery route at `/checkout/success`, and the canonical packet-first protected routes at `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, `/review`, and `/settings`. `apps/web/app/(workspace)/mission/page.tsx` and `apps/web/app/(workspace)/artifacts/page.tsx` now redirect into canonical routes and should be treated as implementation leftovers rather than customer-facing journey anchors.

This plan uses a few plain-English terms that must remain stable. A "journey" is a meaningful product workstream that a human can describe, such as "member with access completes the packet stages." A "scenario ID" is the short stable identifier for one journey row, such as `CONV-01`. A "journey bucket" is the PM-facing grouping label, such as `Visitor FTUX`, `No-Access FTUX`, `Has-Access EUX`, or `Free -> Paid`. A "persona" is the named QA starting state needed to run a scenario, such as `signed_out`, `member_without_access`, or `member_with_access`. A "scenario pack" is the operational grouping used to decide when a scenario should run, such as `default_ship`, `extended`, or `billing_integration`. "FTUX" means first-time user experience. "EUX" means existing user experience. A "transition flow" means a movement between two states, such as signed-out visitor to signed-in member or free member to paid member. A "browser sweep" means a bounded run of browser checks against specific scenario IDs with a written pass/fail report.

The new root `qa/` folder is intentionally outside `apps/web/` because it is not only test code. It is the operating layer for shipping. The implementation should create `qa/AGENTS.md` to tell subagents how to update the catalog, how to pick scenarios from a diff, how to run browser sweeps, and how to write reports. The root `AGENTS.md` should then defer to `qa/AGENTS.md` for any task that changes user journeys, routes, auth behavior, checkout behavior, or release-critical browser coverage.

The implementation should preserve and adapt the existing useful infrastructure rather than discarding it blindly. `apps/web/playwright.config.ts` is still the real browser project and environment contract. `apps/web/scripts/ensure-clerk-test-user.mjs` and `apps/web/scripts/ensure-clerk-entitled-test-user.mjs` are still useful migration inputs. The repo commands in `apps/web/package.json` such as `bun run test:browser-smoke`, `bun run test:e2e:sandbox`, and the current Clerk helper commands are still useful references. What changes is the ownership boundary and the control plane above them.

## Plan of Work

First, create the root `qa/` folder and make it the official source of truth. This includes `qa/AGENTS.md`, a glossary that defines the taxonomy in plain English, a journey catalog CSV, a coverage CSV, a full-suite test-inventory CSV, a run-report template folder, and committed non-secret persona protocol files. The folder should be understandable on its own without requiring anyone to inspect the old test suite first.

Second, define the initial scenario taxonomy from the product outward. Start with the four product realities already confirmed in the repo and user discussion: signed out, signed in without access, signed in with access, and free-to-paid conversion. Expand these into journey buckets such as visitor FTUX, no-access FTUX, access-granted EUX, and free-to-paid transition. The access-granted bucket must include the canonical packet-first funnel at `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, and `/review`, and it should be modeled as one scenario per major stage boundary plus one end-to-end umbrella scenario.

Third, audit the existing tests against the new catalog. For every existing test file under `apps/web/tests/`, decide whether it stays as-is, should be renamed and remapped, should be rewritten, should be replaced with a scenario-driven browser sweep, or should be deleted. This audit must cover the full current suite, not just the browser and ship-critical subset.

Fourth, formalize deterministic QA personas. Replace the hidden assumption of "shared test users" with explicit persona names, preparation commands, and reset behavior. One persona should represent a member without entitlement, one should represent a member with entitlement, and the transition flow should use safe test payment data and a clear recovery path. The implementation may adapt the current Clerk preparation scripts, but the public interface and committed protocol must live under `qa/`.

Fifth, add the subagent operating model and release workflow. `qa/AGENTS.md` should define at least five responsibilities: a scenario mapper that reads diffs and selects affected scenario IDs, a test auditor that checks the catalog against the current test tree, a browser runner that exercises scenario flows, a gap reviewer that finds release-critical scenarios with no trustworthy proof or no recent browser evidence, and a release summarizer that writes the run report. The workflow must distinguish between the `default_ship`, `extended`, and `billing_integration` packs so agents do not run Stripe unnecessarily or omit majority-coverage surfaces.

Finally, wire the new model into repository practice. The root `AGENTS.md` should defer to `qa/AGENTS.md` for route, auth, entitlement, checkout, or release-surface work. A fast validation command should check the integrity of the QA catalog before commit or push. A broader browser sweep command should run before ship or as a targeted PR gate. Old QA docs should either point at the new system or be retired so there is only one operating model. The first implementation slice completed the handoff, validator, inventory sync, persona commands, and report scaffolder. This slice completed the canonical packet-route browser rewrite plus pack runner wiring, so the next implementation work should focus on live environment execution and committed run evidence.

## Milestones

### Milestone 1 — Establish the root `qa/` source-of-truth folder

At the end of this milestone, the repository has a root `qa/` folder with `qa/AGENTS.md`, a glossary, a journey-catalog template, a coverage template, a full-suite test-inventory template, a run-report template, and a committed non-secret persona protocol file. The root `AGENTS.md` should point future agents at `qa/AGENTS.md` for journey and release QA work.

Success means `rg --files qa` lists a coherent operating layer instead of nothing, and a novice can read `qa/AGENTS.md` plus `qa/glossary.md` and understand how the QA system is supposed to work.

### Milestone 2 — Define the first real journey catalog and coverage map

At the end of this milestone, `qa/journeys.csv` contains the first production-ready set of journey rows for the current app. The first slice must cover visitor landing and CTA behavior, sign-in and redirect behavior, no-access recovery, access-granted packet start, one scenario per major packet stage boundary, review/download, settings, checkout-success recovery, and free-to-paid handoff. Each row must declare its journey bucket, starting persona, ending persona, and scenario pack. `qa/coverage.csv` then maps each scenario ID to its proving mechanism and current confidence state.

Success means a product manager can answer "what matters before ship" by reading the catalog rather than by opening Playwright specs, and every release-critical path exists as an explicit row.

### Milestone 3 — Audit the existing test suite against the catalog

At the end of this milestone, every current test file under `apps/web/tests/` is represented in `qa/test-inventory.csv` with a disposition such as keep, rewrite, replace, merge, or delete. Any existing test that does not prove a current journey becomes a candidate for removal. Any important journey with no proving test becomes an explicit gap rather than an invisible assumption.

Success means the project no longer measures confidence by raw test count. Instead, it can say exactly which test files prove which scenarios and which test files are stale after the routing and product changes.

### Milestone 4 — Introduce deterministic QA personas and scenario-pack execution

At the end of this milestone, the repo has a clear persona model and preparation commands for the browser lane. The implementation may adapt the existing Clerk and entitlement scripts, but it must expose them through deliberate persona names, `qa/`-owned protocol files, and documented prepare/reset behavior. The default ship pack should exercise non-billing personas and the packet-first funnel. The real checkout browser flow should live in the separate `billing_integration` pack.

Success means a fresh agent can prepare the right persona, run a selected scenario pack, and write the result into a run report without guessing which account state is required.

### Milestone 5 — Make the new system part of shipping

At the end of this milestone, the repository has a lightweight QA validation step for local workflow and a larger scenario-driven release workflow for pull requests or ship readiness. The local step should validate the integrity and freshness of the `qa/` catalog and fail fast if scenario references or required columns are missing. The larger step should select affected scenarios from a diff, run the mapped browser and automated lanes, and write a dated report under `qa/runs/`, with a clear policy for which reports are committed ship evidence and which are ignored local scratch output.

Success means "ship" now has a repeatable ritual: read the changed scenarios, prepare personas, run the relevant packs, and publish a readable report. The report should be understandable by a PM without reading the code or test files.

## Concrete Steps

Begin in `/Users/parkerrex/Projects/manmeetsai-workspace` by inspecting the exact files that currently define routes, tests, browser projects, and persona preparation. This verifies the real starting point before any folder or protocol design begins.

    cd /Users/parkerrex/Projects/manmeetsai-workspace
    sed -n '1,260p' AGENTS.md
    sed -n '1,260p' apps/web/AGENTS.md
    sed -n '1,260p' apps/web/package.json
    sed -n '1,260p' apps/web/playwright.config.ts
    sed -n '1,220p' apps/web/tests/browser-smoke/app-smoke.spec.ts
    sed -n '1,260p' apps/web/tests/e2e/auth-protection.sandbox.spec.ts
    sed -n '1,260p' apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts
    sed -n '1,260p' apps/web/tests/e2e/auth-state.ts
    sed -n '1,260p' apps/web/tests/e2e/global-setup.ts
    sed -n '1,260p' apps/web/scripts/ensure-clerk-test-user.mjs
    sed -n '1,260p' apps/web/scripts/ensure-clerk-entitled-test-user.mjs
    find apps/web/tests -type f | wc -l

Expected observation: the repo already has useful auth and entitlement infrastructure, but the only human-readable layer is a runbook and the meaning of critical flows is still trapped inside tests.

Then create the root `qa/` folder with the first committed source-of-truth files. The minimum file set for this initiative is `qa/AGENTS.md`, `qa/glossary.md`, `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, `qa/templates/run-report.md`, `qa/personas.example.json`, `qa/personas.local.example.json`, and `qa/README.md` if the glossary alone is not enough to orient a new reader. Keep the language product-facing, not framework-facing.

After the folder exists, write the glossary before the CSV files. Define the journey buckets, persona vocabulary, scenario-pack vocabulary, severity terms, and what counts as release-critical for this repository. The glossary must define terms like FTUX, EUX, transition flow, scenario ID, persona, browser sweep, default ship pack, extended pack, billing-integration pack, and release report in plain English.

Once the glossary is stable, seed the first version of `qa/journeys.csv` with the current product realities visible in the repo. Use the existing route and browser surfaces to derive the first rows, but do not mirror old test names. The row labels must read like product workstreams. A good first slice is likely to include landing-to-CTA, sign-in with redirect, signed-out protected-route redirect, no-access protected recovery, packet start, one row each for Product, Design, Marketing, Build Plan, Review/Download, one umbrella packet-flow row, settings access, checkout-success recovery, and free-to-paid access handoff. Mark each row with its scenario pack so the default ship pack, extended pack, and billing-integration pack are operationally explicit.

After the journey catalog exists, create `qa/coverage.csv` and `qa/test-inventory.csv`. The coverage file should map scenario IDs to the proving mechanism, while the inventory file should list each current test file and its disposition. The inventory must include at least the file path, scenario IDs proved, current value, replacement path if any, and disposition rationale, and it must cover every current test file under `apps/web/tests/`.

When the catalog and inventory exist, implement the fast QA validation command. The exact script location can be chosen during implementation, but the command must verify at least these things: the CSV files have the required columns, every `coverage.csv` scenario ID exists in `journeys.csv`, every kept automated test in the inventory points to at least one real scenario ID, and the committed `qa/` persona protocol is present even when local credential files are absent.

Implemented in this slice as `qa/scripts/validate.mjs`, exposed through `bun run qa:validate`. The validator now checks file presence, CSV headers, scenario ID integrity, linked test paths, coverage-source paths, inventory-row completeness, and whether the inventory matches the live `apps/web/tests/` tree.

After the fast validator exists, implement the persona interface. The repo should expose a small command surface such as `qa:personas:prepare`, `qa:personas:reset`, `qa:validate`, and `qa:ship`, whether these commands are registered in the root `package.json`, delegated into `apps/web/package.json`, or wrapped by a root runner. The canonical persona protocol must now load from committed non-secret files in `qa/`, while actual local credentials should load from an ignored `qa/personas.local.json` or equivalent ignored file in the same folder.

Implemented in this slice as root `package.json` commands backed by `qa/scripts/personas.mjs`, `qa/scripts/ship.mjs`, and `qa/scripts/run-pack.mjs`. `qa:personas:reset` is safe and currently clears local Playwright auth state only. `qa:personas:prepare` provisions real personas when `qa/personas.local.json` and `.env.local` are present, and now fails with an actionable message instead of a stack trace when the local file is missing. `qa:run-pack` is now the explicit orchestrator for `default_ship`, `extended`, and `billing_integration`.

Then author `qa/AGENTS.md` so subagents know how to work. It must tell a scenario-mapper agent how to inspect a diff and list changed scenario IDs, tell a test-auditor agent how to update the inventory and coverage map, tell a browser-runner agent how to prepare personas and execute the selected flows, tell a gap-reviewer agent how to find important scenarios with no trustworthy automation or no recent browser evidence, and tell a release-summarizer agent how to write `qa/runs/YYYY-MM-DD-<slug>.md`. It must also distinguish between the `default_ship`, `extended`, and `billing_integration` packs so agents do not run Stripe checkout unnecessarily or omit important majority-coverage surfaces.

Implemented in this slice with explicit `qa:run-pack` examples and billing gating language. The browser-runner section now points at the tagged pack scripts and the gap-reviewer section points at `qa/coverage.csv` plus the latest report.

Finally, run the first real baseline sweep. Prepare the personas, run the fast validator, run the targeted automated lanes, run the critical browser scenarios, and write the dated reports. The first baseline sweep must cover the homepage, auth entry and redirect behavior, no-access recovery, the canonical packet funnel, review/download, settings, and checkout-success recovery. The free-to-paid handoff must also be captured in the system, but it should run as part of the billing-integration pack rather than the default every-ship pack.

This milestone is now complete in the repository sense. `qa/runs/2026-03-25-default-ship-baseline.md` captures the hosted public-domain baseline, and `qa/runs/2026-03-25-billing-integration-blocked.md` captures the explicit payment-safety block. The next operator no longer has to guess what “done so far” means.

## Validation and Acceptance

The work is not complete when files merely exist. It is complete when the new QA operating system can be demonstrated end to end.

Start with static and structural validation from `/Users/parkerrex/Projects/manmeetsai-workspace`.

    cd /Users/parkerrex/Projects/manmeetsai-workspace
    bun run lint
    bun run format:check
    bun run qa:validate

Success means the repo lint and format checks still pass and the new QA validator confirms that the catalog, coverage map, test inventory, and committed persona protocol are internally consistent.

Observed during implementation:

    bun run qa:inventory:sync
    Synced qa/test-inventory.csv with 103 test files.

    bun run qa:validate
    QA control plane is internally consistent.
    Journeys: 22
    Coverage rows: 38
    Inventory rows: 103
    Personas: 3

    cd apps/web
    PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com bunx playwright test --project=browser-smoke
    5 passed (1.6s)

    E2E_RUN_SANDBOX=1 PLAYWRIGHT_BASE_URL=https://www.man-meets-ai.com bun run --cwd apps/web test:e2e:sandbox:default-ship
    4 failed

    cd apps/web
    PLAYWRIGHT_USE_LOCAL_SERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:3100 bun run test:browser-smoke
    5 passed (53.3s)

    bun run qa:run-pack -- --pack=default_ship --dry-run
    {
      "status": "ok",
      "pack": "default_ship",
      "dryRun": true,
      "steps": [
        "qa:validate",
        "qa:personas:prepare -- --pack=default_ship",
        "qa:ship -- --pack=default_ship",
        "test:browser-smoke",
        "apps/web test:e2e:sandbox:default-ship"
      ]
    }

    bun run qa:run-pack -- --pack=billing_integration --dry-run
    {
      "status": "ok",
      "pack": "billing_integration",
      "dryRun": true,
      "steps": [
        "qa:validate",
        "qa:personas:prepare -- --pack=billing_integration",
        "qa:ship -- --pack=billing_integration",
        "apps/web test:e2e:sandbox:billing-integration"
      ]
    }

Then run the retained automated lanes that should remain valid for the first slice.

    bun run test:unit
    bun run test:integration
    set -a
    source apps/web/.env.local
    set +a
    bun run test:browser-smoke

Success means the retained automated lanes still pass after the catalog and inventory changes, and the browser-smoke lane still proves the public shell and checkout-success recovery surface.

Then prepare the browser personas and run the ship pack against a safe environment. If a hosted or sandbox environment is needed, set the required base URL and enable the sandbox lane explicitly.

    cd /Users/parkerrex/Projects/manmeetsai-workspace
    bun run qa:personas:prepare
    E2E_RUN_SANDBOX=1 PLAYWRIGHT_BASE_URL=<safe_base_url> bun run test:e2e:sandbox

Success means the browser lane can exercise no-access and access-granted personas, packet-funnel scenarios, settings, and recovery scenarios against a safe environment. The free-to-paid handoff belongs to the billing-integration pack and should run only when the environment is safe for payment confirmation. If the environment is not safe for payment confirmation, the report must mark the paid handoff as blocked rather than pretending it was covered.

Observed during implementation:

    bun run qa:personas:reset
    {
      "status": "ok",
      "message": "Cleared Playwright auth state. Remote Clerk and Convex personas are intentionally left in place; rerun qa:personas:prepare to refresh them."
    }

    bun run qa:personas:prepare
    {
      "status": "error",
      "message": "Missing qa/personas.local.json. Create it from qa/personas.local.example.json before preparing personas."
    }

`qa:personas:prepare` was intentionally not completed in this slice because the ignored local credential file is machine-specific. That limitation is now explicit and operator-friendly instead of hidden.

Observed during implementation:

    cd apps/web && bunx playwright test --project=sandbox-e2e --grep @default_ship --list
    Total: 4 tests in 2 files

    cd apps/web && bunx playwright test --project=sandbox-e2e --grep @billing_integration --list
    Total: 1 test in 1 file

This proves the new tagged browser packs are discoverable and syntactically valid even before live environment execution.

The final acceptance proof is human-readable. A product manager must be able to open `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, and the latest report in `qa/runs/` and answer these questions without opening code:

    Which journey buckets matter?
    Which personas matter?
    Which journeys are release-critical?
    Which journeys were actually exercised in the last sweep?
    Which tests are trusted, stale, or pending deletion?
    What still blocks confident ship?

If those questions cannot be answered from the `qa/` folder alone, the initiative is not done.

## Idempotence and Recovery

The `qa/` folder should be safe to regenerate and re-validate. Updating the glossary or catalog should not require deleting existing reports. The QA validator must be idempotent: running it multiple times should only report inconsistencies, never mutate product state.

Persona preparation must also be idempotent. If the preparation commands are run twice, the result should still be one correct no-access persona and one correct access-granted persona rather than duplicate or ambiguous identities. If an identity becomes corrupted or drifts, the reset command should explain how to restore it safely. If the product state depends on hosted Convex or Clerk configuration, the documentation must tell the operator how to refresh `.env.local`, update the ignored local file in `qa/`, and rerun the preparation without guesswork.

The current implementation satisfies the safe local side of that requirement. `qa:personas:reset` deletes only `apps/web/tests/e2e/.auth` and leaves remote identities alone. `qa:personas:prepare` reuses idempotent Clerk creation and Convex grant flows, but it now refuses to proceed until the operator creates `qa/personas.local.json` from the committed example.

The paid handoff flow is the risky part of the system and must stay safe by default. The workflow must stop before irreversible payment submission unless the environment is explicitly marked safe and test-only. If a browser sweep is interrupted halfway through a handoff run, the report should record the interruption and the operator should rerun only the affected scenario IDs rather than rerunning the entire release pack blindly.

Release evidence must also be safe to manage. Committed baseline or ship reports should use stable naming and small durable summaries. Ad hoc local dry-run reports should go to an ignored path so repeated experimentation does not flood git history.

Test deletion must be conservative. Do not delete a current test file until its inventory row says delete, the relevant scenario is already covered elsewhere or intentionally dropped, and the replacement coverage is visible in `qa/coverage.csv`. If an audit decision later turns out to be wrong, the inventory file and reports should make it easy to restore the deleted path deliberately rather than by guesswork.

## Artifacts and Notes

The first version of the journey catalog should be visibly simple. A short example row shape is:

    scenario_id,journey_bucket,start_persona,end_persona,lifecycle_stage,journey_name,preconditions,entry_point,plain_english_steps,expected_outcome,priority,scenario_pack,automation_status,manual_status,linked_tests,notes
    CONV-01,Free -> Paid,member_without_access,member_with_access,transition,Free to paid handoff,"Signed in without entitlement","/","User starts checkout, completes safe test payment, lands on checkout success, receives access, and enters the protected packet flow","User reaches the protected workspace without confusion",critical,billing_integration,planned,not_run,"apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts","Route names may change; scenario meaning should not"

The release report template should stay equally simple. A short example section shape is:

    Scope tested
    Pack: default_ship
    Personas used: signed_out, member_without_access, member_with_access
    Scenario IDs: VIS-01, AUTH-02, ACCESS-03, PACKET-04

    Passed
    VIS-01 landing CTA
    PACKET-04 product stage opens

    Findings
    high — REVIEW-01 download button disabled despite complete stage data

    Blocked
    None

The report policy should also be explicit. A committed baseline or ship report might live at:

    qa/runs/2026-03-25-baseline.md

An ignored local dry run might live at:

    qa/runs/local/2026-03-25-packet-funnel-dry-run.md

Observed during implementation:

    bun run qa:ship -- --pack=default_ship --slug=baseline
    {
      "status": "ok",
      "pack": "default_ship",
      "personas": ["signed_out", "member_without_access", "member_with_access"],
      "scenarioIds": ["VIS-01", "AUTH-01", "AUTH-02", "ACCESS-01", "ACCESS-02", "PACKET-01", "PACKET-02", "PACKET-03", "PACKET-04", "PACKET-05", "PACKET-06", "PACKET-07", "SETTINGS-01"],
      "reportPath": "qa/runs/local/2026-03-25-baseline-default_ship.md"
    }

    bun run qa:run-pack -- --pack=default_ship --dry-run
    {
      "status": "ok",
      "pack": "default_ship",
      "dryRun": true
    }

The existing repo already proves where the highest-value first scenarios live. Evidence at plan creation time:

    apps/web/tests/browser-smoke/app-smoke.spec.ts proves landing CTA, checkout-success recovery, SEO data, crawl endpoints, and sign-in noindex behavior.
    apps/web/tests/e2e/auth-protection.sandbox.spec.ts proves signed-out redirect, no-access recovery, access-granted entry, invalid-lesson 404 behavior, and protected-shell error handling.
    apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts proves no-access recovery, access-granted workspace entry, and the full paid handoff path.
    apps/web/features/packet-flow/components/packet-stage-page.tsx proves that each packet stage has save and progression behavior, which justifies stage-boundary scenarios instead of one coarse funnel row.

## Interfaces and Dependencies

The implementation must create and maintain a root `qa/` folder with at least these interfaces:

`qa/AGENTS.md` defines subagent roles, required inputs, allowed outputs, and how release reports are written.

`qa/glossary.md` defines journey buckets, lifecycle stages, scenario ID format, persona vocabulary, scenario-pack vocabulary, severity language, and what counts as ship-critical in this repository.

`qa/personas.json` is the canonical committed non-secret persona contract and required fields. `qa/personas.example.json` shows the full machine-readable shape, and ignored `qa/personas.local.json` supplies actual local credentials and environment-specific values.

`qa/journeys.csv` is the canonical journey catalog. It must include one row per meaningful user workstream.

`qa/coverage.csv` maps each scenario ID to its proving mechanism and current confidence state.

`qa/test-inventory.csv` tracks each existing automated test file and whether it stays, changes, merges, or is deleted.

`qa/runs/` stores dated run reports. These reports are the human-readable output of ship-time QA sweeps.

The implementation must also preserve and adapt these repository dependencies:

`apps/web/playwright.config.ts` remains the Playwright project definition and environment contract for browser runs.

`qa/scripts/generate-test-inventory.mjs` is the canonical inventory sync interface. It scans `apps/web/tests/` and writes `qa/test-inventory.csv`.

`qa/scripts/validate.mjs` is the fast integrity check for the control plane.

`qa/scripts/personas.mjs` exposes the operator-facing `prepare` and `reset` commands for QA personas.

`qa/scripts/ship.mjs` scaffolds local pack reports under `qa/runs/local/`.

`qa/scripts/run-pack.mjs` is the explicit scenario-pack runner. It validates the control plane, prepares personas, scaffolds a run report, and invokes the correct browser commands for `default_ship` or `billing_integration`. It treats billing as opt-in by requiring `QA_ALLOW_BILLING_INTEGRATION=1` for live execution.

`apps/web/scripts/ensure-clerk-test-user.mjs` and `apps/web/scripts/ensure-clerk-entitled-test-user.mjs` remain the implementation primitives for persona preparation, but the operator-facing interface now lives under root `qa:` commands.

`apps/web/tests/e2e/auth-state.ts` and `apps/web/tests/e2e/global-setup.ts` now use the persona-aligned `member_without_access` and `member_with_access` vocabulary for storage states. The tagged sandbox specs in `apps/web/tests/e2e/auth-protection.sandbox.spec.ts` and `apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts` are now the canonical browser packs for `default_ship`, `extended`, and `billing_integration`.

Authenticated local sandbox execution is still an implementation limitation. `apps/web/tests/e2e/global-setup.ts` can bootstrap auth against hosted environments, but it is not yet a stable match for the local Playwright web-server lifecycle.

`qa/runs/2026-03-25-default-ship-baseline.md` and `qa/runs/2026-03-25-billing-integration-blocked.md` are the first committed outputs of the operating system. They are now the durable evidence layer for this initiative.

The root `package.json` now exposes `qa:inventory:sync`, `qa:validate`, `qa:personas:prepare`, `qa:personas:reset`, and `qa:ship`. `apps/web/package.json` still exposes the underlying Playwright and browser-test commands that the QA control plane orchestrates.

The root `AGENTS.md` must explicitly defer to `qa/AGENTS.md` for any work that changes user journeys, route structure, auth behavior, entitlement behavior, checkout behavior, or release-surface browser coverage. Without that handoff, the new QA operating system will exist as files but not as actual team practice.
