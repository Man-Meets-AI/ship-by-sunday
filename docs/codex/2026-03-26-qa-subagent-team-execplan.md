# Stand up a Codex-native QA subagent team

This is a living execution plan for turning the existing journey-first QA control plane into a Codex-native QA team with explicit subagent roles, one user-facing entrypoint, and repeatable review artifacts. It is written so a fresh coding agent can execute the work without prior chat context and must be updated as decisions, discoveries, validation results, and scope adjustments accumulate.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

Today the repository already has a strong QA source of truth in `qa/`, but it still behaves like a well-documented checklist, not like an actual team. After this change, a human should be able to say, in plain language, `go talk to our QA team about this feature`, and the repository-local Codex setup should know which specialist roles to delegate to, which QA files to read, how to map the feature to product journeys, how to identify stale or missing proof, and when to recommend or run browser evidence. The user-visible outcome is a QA experience that feels staffed: one lead, a few specialists, one consolidated verdict, and no second source of truth outside the existing `qa/` control plane.

The important behavioral proof is not only that files exist. It is that a fresh Codex session inside this repository can use repo-scoped role configs plus a shared `qa-team` skill to produce a structured answer with affected journeys, current proof, missing proof, recommended runs, and a release-confidence verdict. A second proof is that the underlying `qa/` control plane still validates cleanly and does not drift from the live `apps/web/tests/` tree while the new team layer is added.

## Progress

- [x] 2026-03-26 20:28 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, `docs/prompts/execplan-writer.md`, `qa/README.md`, `qa/AGENTS.md`, `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, `qa/scripts/run-pack.mjs`, `qa/scripts/validate.mjs`, root `package.json`, and the existing journey-first QA ExecPlan.
- [x] 2026-03-26 20:28 EDT — Confirmed that the repository already has the correct QA source-of-truth files and role language, but does not yet have a project-scoped `.codex/config.toml`, repo-scoped Codex role configs, a shared `qa-team` skill, or a first-class QA review artifact flow.
- [x] 2026-03-26 20:28 EDT — Confirmed the current control-plane blocker that must be fixed before the new team can be trusted: `bun run qa:validate` currently fails because `qa/test-inventory.csv` is missing a row for `apps/web/tests/integration-ui/execute-ship-page.test.tsx`.
- [ ] Repair the current QA control plane so `qa:validate` is green before any subagent orchestration is added.
- [ ] Add repo-scoped Codex subagent role configuration and a shared `qa-team` skill without creating a second QA truth outside `qa/`.
- [ ] Add a lightweight QA review artifact workflow so the lead agent and specialists leave a readable trail for each feature review.
- [ ] Validate the new team on a recent real feature diff and record the outcome in the plan and QA docs.

## Surprises & Discoveries

The repository is further along than a greenfield plan would suggest. `qa/AGENTS.md` already names the right operating roles, `qa/README.md` already describes packs and environments clearly, and `qa/scripts/run-pack.mjs` already codifies the packet-funnel integration-ui proof plus browser pack workflow. This work should therefore extend the existing operating system, not replace it with a parallel one.

The most important missing layer is Codex-specific, not QA-specific. There is no project `.codex/config.toml` yet, so Codex currently has no repo-scoped subagent roster for QA work. The official customization order also matters here: in practical repository terms, `AGENTS.md` defines conventions, skills package repeatable workflows, and subagents should be added after those layers exist rather than used as a substitute for them.

The current validator already proves why a real control plane matters. `bun run qa:validate` fails today with `qa/test-inventory.csv is missing an inventory row for apps/web/tests/integration-ui/execute-ship-page.test.tsx`. That means the first step of the new team cannot be role choreography; it must be making the existing source of truth accurate enough that the new roles are operating on live data.

The repo also already contains a workspace-local browser QA skill at `.agents/skills/qa-Browser/SKILL.md`. That is useful, but it is not the same thing as the QA team. The new QA team should treat `qa/` as the source of truth and use the browser-runner role only for repository-defined journeys. It should not move scenario ownership back into a skill folder.

Evidence from current repo inspection:

    bun run qa:validate
    Error: qa/test-inventory.csv is missing an inventory row for apps/web/tests/integration-ui/execute-ship-page.test.tsx

    qa/scripts/run-pack.mjs
    default_ship already runs qa:validate, qa:personas:prepare, browser smoke,
    the packet integration-ui suite, and the default-ship browser pack.

## Decision Log

Decision: extend the existing `qa/` operating system instead of designing a new QA surface.
Rationale: the repository already has the right source-of-truth files, journey IDs, pack vocabulary, and role language. Replacing that structure would create two competing QA systems and would directly violate the user’s goal of making what already exists better in a smart way.
Date/Author: 2026-03-26 / Codex

Decision: keep `qa/` as the only QA truth, and treat Codex subagents as an execution layer above it.
Rationale: `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, and `qa/AGENTS.md` should remain canonical because they are readable by both humans and agents. The `.codex/` role configs should tell Codex how to work, not redefine what QA means.
Date/Author: 2026-03-26 / Codex

Decision: use one lead role plus five specialist roles in the first version.
Rationale: the desired experience is “talk to our QA team,” but too many specialist roles will make the first rollout noisy and fragile. The smallest useful team is `qa-lead`, `journey-mapper`, `coverage-analyst`, `gap-reviewer`, `browser-runner`, and `release-summarizer`.
Date/Author: 2026-03-26 / Codex

Decision: rename the current `Test Auditor` responsibility into a broader `Coverage Analyst` responsibility in the Codex role layer.
Rationale: the user explicitly wants a coverage person, and this role already needs to reason about both `qa/test-inventory.csv` and `qa/coverage.csv`. Folding inventory drift and proof strength into one role keeps the roster smaller without losing responsibility.
Date/Author: 2026-03-26 / Codex

Decision: make the default QA-team interaction advisory-first and browser-execution-second.
Rationale: most feature reviews should start by mapping journeys and gaps before any environment-sensitive or destructive actions are taken. The browser-runner should execute only when a safe environment is declared or the user explicitly asks for a run.
Date/Author: 2026-03-26 / Codex

Decision: store transient team review artifacts under a new ignored `qa/reviews/local/` path and reserve `qa/runs/` for durable run evidence.
Rationale: a QA team assessment is not always the same thing as a browser run or ship report. Keeping advisory review artifacts separate avoids overloading `qa/runs/` with non-run documents while preserving the existing durable-evidence model.
Date/Author: 2026-03-26 / Codex

Decision: add a repo-scoped `.codex/config.toml` and per-role TOML files instead of relying on user-global configuration.
Rationale: the user wants this to be part of the repository’s agent developer experience. Checked-in role configs are the only way for new teammates and fresh Codex sessions to inherit the same QA team behavior.
Date/Author: 2026-03-26 / Codex

## Outcomes & Retrospective

This plan is future-facing because the implementation has not started yet. The intended outcome is a QA system with two clear layers: `qa/` remains the product-readable operating system, and Codex subagents become the execution and delegation layer that makes the system feel like a real team. The first version should give the user one natural-language entrypoint, one lead agent, a small specialist roster, and a predictable output contract.

The obvious risk is overbuilding orchestration before the existing control plane is clean. This plan intentionally starts with `qa:validate` health and inventory correctness before adding `.codex/` files or role prompts. A second risk is role sprawl. This plan avoids that by keeping the first roster to six roles total and by making browser execution opt-in or environment-gated rather than automatic on every feature.

If this work reveals that the subagent layer is useful but the artifact model is too heavy, the likely simplification is to keep the role configs and `qa-team` skill while collapsing the review artifacts back into one summary file. That simplification is acceptable later, but the first version should still leave behind enough written evidence that another agent can audit how the QA verdict was reached.

## Context and Orientation

The repository already has a journey-first QA operating system created in the earlier initiative documented at `docs/codex/2026-03-25-journey-first-qa-operating-system-execplan.md`. That work established the `qa/` control plane, the journey catalog in `qa/journeys.csv`, the coverage map in `qa/coverage.csv`, the full test inventory in `qa/test-inventory.csv`, the persona protocol in `qa/personas.json`, the run report template in `qa/templates/run-report.md`, the validator in `qa/scripts/validate.mjs`, and the pack orchestrator in `qa/scripts/run-pack.mjs`. This new plan is not allowed to replace that system. It must layer repo-scoped Codex role configuration and a team workflow on top of it.

The current QA system already has the right nouns. `qa/AGENTS.md` defines five responsibilities: scenario mapper, test auditor, browser runner, gap reviewer, and release summarizer. `qa/README.md` explains the pack model: `default_ship`, `extended`, and `billing_integration`. `qa/scripts/run-pack.mjs` already executes those packs in plain Node and Bun commands. The current packet-funnel proof is especially important because the `default_ship` pack already runs browser smoke, the packet integration-ui suite, and the default-ship Playwright browser pack. The new subagent team must understand and reuse those existing commands instead of inventing different ones.

The repository does not yet have a project `.codex/` directory. That means the project currently has no checked-in Codex role definitions and no repo-scoped multi-agent configuration. The shared-skill side does exist: `.agents/skills/` is already part of the repo and includes `.agents/skills/qa-Browser/SKILL.md`. In practical terms, this means the implementation can safely add a new checked-in `.codex/config.toml` plus `.codex/agents/*.toml`, and it can add a new `.agents/skills/qa-team/` skill without colliding with existing project-local Codex config.

The plain-language terms in this plan must stay stable. A “QA team” means one lead agent plus a small roster of specialist subagents with fixed responsibilities. A “role config” means the Codex TOML file that tells Codex when to pick a role and what that role owns. A “team skill” means the user-facing skill under `.agents/skills/qa-team/` that packages the workflow and trigger phrases so the user can say natural things like `go talk to our QA team about this feature`. An “advisory review” means journey mapping, proof analysis, and gap finding without automatically running browser commands. A “run evidence review” means the browser-runner executed safe checks and the release-summarizer wrote durable conclusions from the results.

The before and after repository shape should stay deliberately small:

    Before
    qa/
      AGENTS.md
      README.md
      journeys.csv
      coverage.csv
      test-inventory.csv
      scripts/
      templates/
      runs/
    .agents/skills/
      qa-Browser/

    After
    qa/
      AGENTS.md
      README.md
      journeys.csv
      coverage.csv
      test-inventory.csv
      scripts/
        run-pack.mjs
        team.mjs
        validate.mjs
      templates/
        run-report.md
        team-review.md
      reviews/
        README.md
      runs/
    .codex/
      config.toml
      agents/
        qa-lead.toml
        journey-mapper.toml
        coverage-analyst.toml
        gap-reviewer.toml
        browser-runner.toml
        release-summarizer.toml
    .agents/skills/
      qa-Browser/
      qa-team/

The names above are prescriptive for the first pass. A novice should not have to invent the role roster or decide where artifacts live.

## Plan of Work

Start by repairing the current QA source of truth, because the new team cannot credibly reason over a broken inventory. The first implementation slice should make `bun run qa:validate` pass again by reconciling `qa/test-inventory.csv` with the live `apps/web/tests/` tree and by confirming any new packet-funnel tests are properly represented. Do that before adding any `.codex/` files. The QA team should never be built on known-stale coverage data.

Once the control plane is clean, add repo-scoped Codex role configuration. Create `.codex/config.toml` with multi-agent enabled and a role roster that points to per-role config files under `.codex/agents/`. Those role files should be thin and repo-specific. Their job is to tell Codex which QA responsibility they own, which `qa/` files they must read first, which outputs they are allowed to produce, and what they must not do. For example, the browser-runner role should be explicit that it does not run destructive flows without a safe environment and that it must use the existing `qa:run-pack` and browser commands rather than ad hoc browsing.

After the role files exist, add a new shared skill at `.agents/skills/qa-team/`. This skill is the main user-facing entrypoint. It should explain when to use the QA team, what minimum inputs are required, and how the lead agent should orchestrate the specialist roles. The skill should not redefine the journey catalog or scenario packs. It should explicitly send the lead agent back to `qa/AGENTS.md`, `qa/README.md`, `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv` as the truth. The skill should also define the output contract for the lead agent: affected journeys, current proof, missing proof, recommended runs, findings, and release confidence.

Then add a small review-artifact layer. Create `qa/templates/team-review.md` plus `qa/reviews/README.md`, add `qa/reviews/local/` to `.gitignore`, and introduce a helper such as `qa/scripts/team.mjs` exposed as `bun run qa:team`. The helper should scaffold a dated local review folder or summary file using the current diff or an explicit base ref. It does not need to run Codex itself. Its main job is to give the QA lead and its specialists a predictable local place to write artifacts for each feature review. That keeps the team output repeatable and makes the subagent system easier to audit.

Finally, update the QA docs and validate the full flow on a real recent diff. `qa/AGENTS.md` should add a named `QA Lead` responsibility and rename or clarify the existing `Test Auditor` role into `Coverage Analyst`. `qa/README.md` should explain the difference between advisory reviews and browser-backed run evidence. The implementation must then prove the new team on a recent feature, such as the packet-stage save-feedback slice, by showing that the team maps it to `PACKET-02`, `PACKET-03`, `PACKET-04`, `PACKET-05`, and `PACKET-07`, recognizes the new integration-ui and unit proof, and correctly identifies whether browser evidence is still missing or already satisfied.

## Milestones

### Milestone 1: Restore QA control-plane health before adding subagents

At the end of this milestone, `bun run qa:validate` passes again, `qa/test-inventory.csv` includes every current file under `apps/web/tests/`, and the current packet-funnel proof files are represented accurately enough that the new team can trust the control plane. This milestone should touch `qa/test-inventory.csv`, possibly `qa/coverage.csv`, and `qa/scripts/validate.mjs` only if the validator itself needs adjustment for legitimate new test types.

Success for this milestone means a fresh agent can run `bun run qa:validate` from the repository root and get a clean result instead of the current missing-inventory-row error. That is the minimum trustworthy foundation for the rest of the plan.

### Milestone 2: Add repo-scoped Codex QA roles

At the end of this milestone, the repository has `.codex/config.toml` plus six role files under `.codex/agents/`: `qa-lead`, `journey-mapper`, `coverage-analyst`, `gap-reviewer`, `browser-runner`, and `release-summarizer`. The role descriptions should point Codex at the existing QA control plane and enforce the intended division of labor. `qa-lead` should be responsible for orchestration and consolidation only. It should not redo the specialist work itself unless subagent execution is unavailable.

Success means a human inspecting the checked-in config can see the roster clearly, and a Codex session in the trusted repo can select those roles without guessing. This is configuration proof, not just documentation proof.

### Milestone 3: Add the `qa-team` skill and review artifact workflow

At the end of this milestone, the repo has `.agents/skills/qa-team/SKILL.md`, a `qa/templates/team-review.md` template, a `qa/reviews/README.md` explainer, and a helper such as `bun run qa:team` that scaffolds a local review workspace for a feature diff. The skill must make the developer experience natural: “go talk to our QA team” should be a supported trigger phrase, and the skill should route the user into the lead-plus-specialists workflow without requiring them to remember role names or raw CSV files.

Success means a novice can look at the skill description, know when to use it, run the scaffold command if desired, and understand where the QA team’s local review artifacts will appear.

### Milestone 4: Align the existing QA docs and operating model with the new team

At the end of this milestone, `qa/AGENTS.md` and `qa/README.md` explain both the old control-plane layer and the new team layer in one coherent story. The role list in `qa/AGENTS.md` should match the checked-in Codex role names. The README should explain the advisory-first default and the conditions under which the browser-runner is allowed to execute pack commands.

Success means there is no ambiguity about whether `qa/` or `.codex/` is the source of truth. `qa/` must clearly remain the authority, and the new subagents must clearly be presented as the way Codex works with that authority.

### Milestone 5: Prove the QA team on a recent real feature diff

At the end of this milestone, the team has been exercised against one recent feature slice, ideally the packet-stage save-feedback change. The review should produce a local team artifact showing the affected journeys, existing proof, remaining gaps, recommended runs, and final QA confidence. If a safe environment is available and the user asks for execution, the browser-runner may also run the smallest relevant pack or targeted browser surface and the release-summarizer can convert that into durable evidence.

Success means the QA team feels real in practice, not only in files. A human should be able to ask the team about a feature and receive one coherent, role-backed answer.

## Concrete Steps

Work from `/Users/parkerrex/Projects/manmeetsai-workspace` unless a step says otherwise.

Start by re-checking the current QA control plane and confirming the current failure mode:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run qa:validate

Current expected observation before implementation:

    Error: qa/test-inventory.csv is missing an inventory row for apps/web/tests/integration-ui/execute-ship-page.test.tsx

Repair that inventory drift first. The smallest likely sequence is:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run qa:inventory:sync
    $ bun run qa:validate

The expected post-repair observation is a clean validator result with current journey, coverage, inventory, and persona counts.

When Milestone 2 starts, add the repo-scoped Codex config:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ mkdir -p .codex/agents

Create `.codex/config.toml` and the per-role files under `.codex/agents/`. The config should enable multi-agent support, define the six QA roles, and keep the descriptions short enough that a novice can understand them by reading the files directly. The role files should point back to `qa/AGENTS.md` and the relevant `qa/` CSV or Markdown files instead of embedding a second policy document inside TOML.

When Milestone 3 starts, create the user-facing skill and review scaffold:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ mkdir -p .agents/skills/qa-team
    $ mkdir -p qa/reviews

Add `.agents/skills/qa-team/SKILL.md`, `qa/templates/team-review.md`, `qa/reviews/README.md`, and a helper script such as `qa/scripts/team.mjs`. Register the helper in the root `package.json`, and add `qa/reviews/local/` to `.gitignore`. The helper should accept a feature slug and optional base ref, scaffold the local review artifact, and print the current diff paths so the lead agent has deterministic starting context.

Recommended command surface for the first implementation:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run qa:team -- --slug=packet-stage-save-feedback --base=main --dry-run

The expected observation is a created or planned local review artifact plus a short summary of the changed files and the recommended QA-team invocation. The helper does not need to launch Codex automatically in the first version.

When Milestone 4 starts, update the QA docs and validate the whole control plane again:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run qa:validate

The expected observation is still a clean validator result. If the validator is extended to assert the new `.codex/` or `qa/reviews/` assets, record that behavior in this plan once implementation proves it.

When Milestone 5 starts, prove the team on the packet-stage save-feedback feature or another recent packet-funnel diff. The minimum advisory proof should include:

    affected journeys: PACKET-02, PACKET-03, PACKET-04, PACKET-05, PACKET-07
    current proof: packet-stage integration-ui tests and packet-step classifier unit test
    gap judgment: browser pack still checks route reachability only unless stronger browser proof has been added by then
    verdict: merge-safe or ship-safe with stated confidence and remaining gaps

If a safe browser environment is declared and browser execution is requested, the runner should use the smallest relevant existing command instead of inventing a new one. Likely candidates are:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run qa:run-pack -- --pack=default_ship --dry-run

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx

Use `dev` first, then `prod`, and only when the environment is explicitly safe and correctly configured as described in `qa/README.md` and `qa/AGENTS.md`.

## Validation and Acceptance

Acceptance is behavior-first.

The first acceptance criterion is that the repo has one obvious QA-team entrypoint. A human should be able to read `.agents/skills/qa-team/SKILL.md` and know that “go talk to our QA team about this feature” is a supported request with a stable output shape.

The second acceptance criterion is that the QA team is repo-scoped and onboarding-friendly. A fresh Codex session in this trusted repository should inherit the same QA role roster through `.codex/config.toml` and `.codex/agents/*.toml` without requiring hidden user-global setup.

The third acceptance criterion is that the QA team does not create a second source of truth. Every specialist role must anchor to `qa/AGENTS.md`, `qa/README.md`, `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv` instead of inventing new scenario catalogs or coverage concepts elsewhere.

The fourth acceptance criterion is that the team feels staffed, not monolithic. The lead agent’s final answer must reflect distinct responsibilities: journey mapping, current-proof analysis, gap finding, optional browser execution, and release summary. A single freeform blob is not enough.

The fifth acceptance criterion is that the advisory-first workflow is safe by default. Asking the QA team about a feature should not automatically run payment flows, real production browser sweeps, or destructive actions unless the environment is declared safe and the user asked for execution.

The sixth acceptance criterion is that the underlying control plane remains healthy. `bun run qa:validate` must pass after the implementation, and any new QA-team-specific files that become part of the control plane should be checked by that validator or by an equally fast companion check.

The seventh acceptance criterion is that the system is proven on a recent real feature diff. A QA-team review of a recent packet-funnel change must produce an understandable verdict in product language, not implementation language.

The minimum validation set for this initiative should be:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run qa:inventory:sync
    $ bun run qa:validate
    $ bun run qa:team -- --slug=packet-stage-save-feedback --base=main --dry-run
    $ bun run build

If Codex CLI is available in the implementation environment, add a manual smoke proof:

    Open the trusted repo in Codex.
    Invoke the QA team with a recent feature request in plain language.
    Confirm that the lead delegates to the configured QA roles and returns one consolidated verdict.

If Codex CLI is not available in the implementation environment, the plan should record that limitation explicitly and treat the structural repo proof plus the scaffold command as the implementation-time validation surface.

## Idempotence and Recovery

This work should be safe to rerun because it mostly adds configuration, skills, templates, and validation on top of the existing QA control plane. Re-running `bun run qa:inventory:sync` and `bun run qa:validate` should never mutate product behavior or browser state. Re-running the team scaffold should either create a new dated local review artifact or update the requested local review area without overwriting durable `qa/runs/` evidence.

If the `.codex/` role layer becomes confusing, recover by narrowing responsibility, not by deleting the whole team. The safe fallback is: keep `qa-lead`, keep `journey-mapper`, keep `coverage-analyst`, keep `gap-reviewer`, and disable the browser-runner or release-summarizer role temporarily while the docs and artifact contracts are corrected. That still preserves the advisory team behavior.

If the `qa-team` skill grows into a second policy document, recover by deleting policy from the skill and moving it back into `qa/AGENTS.md`. The skill should stay orchestration-focused and should mostly point at the QA control plane rather than duplicate it.

If `qa:validate` starts failing because the test tree changes faster than the inventory, fix the inventory first and only then continue subagent work. A broken inventory is a hard blocker because the coverage and gap roles depend on it.

If local review artifacts become noisy, keep `qa/reviews/local/` ignored and prune old local review folders manually. Do not auto-delete durable `qa/runs/` evidence.

## Artifacts and Notes

The most important design constraint to preserve during implementation is that this is an extension of the current QA operating system, not a replacement. Useful proof snippets to keep during implementation:

    Current QA role source:
    qa/AGENTS.md already defines Scenario Mapper, Test Auditor, Browser Runner,
    Gap Reviewer, and Release Summarizer responsibilities.

    Current validator blocker:
    bun run qa:validate
    -> qa/test-inventory.csv is missing an inventory row for apps/web/tests/integration-ui/execute-ship-page.test.tsx

    Current packet-funnel pack behavior:
    qa/scripts/run-pack.mjs already runs browser smoke, the packet integration-ui suite,
    and the default-ship browser pack for default_ship.

    Desired final user invocation:
    "Go talk to our QA team about this feature."

    Desired final lead-agent output:
    affected journeys
    current proof
    missing proof
    recommended runs
    findings
    release confidence

The final implementation should record the exact role filenames, the final skill location, the final scaffold command, and one example local review artifact path here once they exist.

## Interfaces and Dependencies

`qa/AGENTS.md` is the most important dependency because it already contains the repository’s QA role language and pack rules. The new subagent layer must reuse and refine that file rather than bypass it.

`qa/README.md`, `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv` are required dependencies because they are the existing source of truth for journeys, coverage, and inventory. The new subagents must read these files before inspecting app code.

`qa/scripts/validate.mjs` is a required dependency because the new team cannot be trusted if the control plane is stale or malformed. The implementation should either extend this validator or add a closely related fast check for any new QA-team assets.

`qa/scripts/run-pack.mjs` is a required dependency for the browser-runner role. That role should call the existing pack runner or the existing integration-ui and browser commands, not invent separate browser rituals.

`package.json` at the repository root is a required dependency because it already exposes `qa:inventory:sync`, `qa:validate`, `qa:personas:prepare`, `qa:ship`, and `qa:run-pack`. The first version of the new team should add any new helper command there so the developer experience stays centralized.

`.agents/skills/` is a required dependency because the repo already uses shared checked-in skills and already contains `qa-Browser`. The new `qa-team` skill should live there as the user-facing trigger layer.

`.codex/config.toml` and `.codex/agents/*.toml` are new required interfaces for this plan. They are the repo-scoped Codex role definitions that make the QA team real for Codex sessions in this repository.

`qa/templates/run-report.md` remains the durable run-evidence template for executed packs. If the team review artifacts need a separate template, that should be added as `qa/templates/team-review.md` rather than overloading the ship-run template.

If the implementation adds a new local review artifact path such as `qa/reviews/local/`, it must also update `.gitignore` and document the difference between transient review artifacts and durable committed run evidence.
