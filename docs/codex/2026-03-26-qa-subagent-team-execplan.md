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
- [x] 2026-03-26 21:26 EDT — Grilled the plan against the desired operating model. Locked the core phase-1 stance: chat-first `qa-lead` is the main product experience, specialist roles are optional support behind the scenes, local review artifacts are created only for material reviews, canonical `qa/` truth changes require a review-first confirmation step, and the lead may auto-run only the minimal safe local set (`qa:validate`, `qa:run-pack --dry-run`, and directly relevant focused `vitest` runs).
- [x] 2026-03-26 21:26 EDT — Locked the explicit execution rule for phase 1: when the user explicitly asks the QA team to run browser QA, `qa-lead` may delegate to `browser-runner` and use the existing browser and pack workflow under the current `qa/AGENTS.md` safety rules.
- [x] 2026-03-26 21:51 EDT — Closed Milestone 1. `bun run qa:validate` was already green in the current tree, but `bun run qa:inventory:sync` still degraded curated packet and execute mappings back to heuristic defaults. Updated `qa/scripts/generate-test-inventory.mjs` so sync preserves existing curated rows for known files and only falls back to heuristics for genuinely new files. Also repaired the two packet-stage inventory rows whose unquoted rationale commas made the CSV non-idempotent under parsing. Re-ran `bun run qa:inventory:sync` and `bun run qa:validate` successfully.
- [x] 2026-03-26 21:55 EDT — Closed Milestone 2. Added repo-scoped `.codex/config.toml` plus six QA role files under `.codex/agents/`, with `qa_lead` as the default lead-first role and the rest framed as optional support specialists.
- [x] 2026-03-26 21:56 EDT — Closed Milestones 3 and 4. Added `.agents/skills/qa-team/SKILL.md`, `qa/scripts/team.mjs`, `qa/templates/team-review.md`, `qa/reviews/README.md`, `.gitignore` coverage for `qa/reviews/local/`, and root `package.json` script wiring. Updated `qa/AGENTS.md`, `qa/README.md`, and `qa/scripts/validate.mjs` so the lead-first QA team is documented and checked by the fast validator.
- [x] 2026-03-26 22:00 EDT — Closed Milestone 5 with a negative feature verdict. Scaffolded `qa/reviews/local/2026-03-26-packet-stage-save-feedback.md`, ran the focused QA-team proof on the packet-stage save-feedback slice, and recorded the outcome. Structural QA-team proof is green (`qa:validate`, `qa:team --dry-run`, `codex --help`, `codex exec` smoke). The reviewed packet-flow slice itself is not merge-safe in the latest worktree state because the focused packet-stage integration-ui suite is red and `bun run --cwd apps/web lint` fails on packet-flow files.
- [x] 2026-03-26 22:25 EDT — Followed the negative packet-stage verdict to repair the in-scope regressions. Restored the packet-stage page count, first-missing-field focus after incomplete saves, and sidebar missing-field labels. The narrowed proof is green again: `tests/integration-ui/packet-stage-page.test.tsx`, `tests/integration-ui/packet-stage-sidebar.test.tsx`, and `tests/unit/packet-step-save-feedback.test.ts` now pass. Branch-wide `apps/web` lint is still red, but the remaining blockers are outside this narrowed packet-stage review (`features/observability/components/error-boundary-screen.tsx` and `components/ui/sparkles.tsx`).
- [x] 2026-03-26 22:26 EDT — Cleared the remaining branch-wide lint blockers with minimal unrelated cleanup in `features/observability/components/error-boundary-screen.tsx` and `components/ui/sparkles.tsx`. `bun run --cwd apps/web lint` is now green again.
- [x] 2026-03-26 22:27 EDT — Final validation passed for the implemented slice: `bun run qa:validate`, `bunx vitest run --project integration-ui tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx`, `bunx vitest run --project unit tests/unit/packet-step-save-feedback.test.ts`, `bun run --cwd apps/web lint`, and `bun run build`.
- [x] 2026-03-26 22:39 EDT — Completed the first concrete Phase 2 slice. Codified deterministic fan-out for material reviews in `.codex/agents/qa-lead.toml`, `.agents/skills/qa-team/SKILL.md`, `qa/AGENTS.md`, `qa/README.md`, `qa/templates/team-review.md`, and `qa/scripts/team.mjs`. `bun run qa:team -- --slug=packet-stage-save-feedback --base=main --dry-run` now emits explicit advisory and execution specialist plans.
- [x] 2026-03-26 22:40 EDT — Verified that the deeper delegation is real, not just documented. A bounded `codex exec` material-review smoke visibly spawned the advisory QA trio (`journey_mapper`, `coverage_analyst`, `gap_reviewer`) alongside the repo’s standard review helpers before producing the verdict.
- [x] 2026-03-26 22:42 EDT — Used the Phase 2 smoke findings to repair canonical QA-truth drift. Updated `qa/journeys.csv`, `qa/coverage.csv`, `qa/test-inventory.csv`, `qa/AGENTS.md`, and `qa/README.md` so the packet workbench is now described as autosave-backed save feedback plus a single `Continue` action instead of the stale two-intent save model. Added the newly present `apps/web/tests/unit/use-autosave.test.tsx` to inventory and revalidated the control plane.
- [x] 2026-03-26 22:38 EDT — Restored the broader packet-funnel QA contract after the Phase 2 smoke surfaced adjacent Start and Review regressions. Re-added the packet page titles expected by the integration-ui mocks, then reran `bun run --cwd apps/web test:integration:ui -- tests/integration-ui/packet-start-page.test.tsx tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-review-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx` successfully with 4 files and 12 tests passing.
- [x] 2026-03-26 22:45 EDT — Re-ran the broader validation surface on the latest state after the Phase 2 QA-truth alignment edits. `bun run qa:validate` is green with 126 inventory rows, and `bun run build` is green again.
- [x] 2026-03-26 22:47 EDT — Added command-backed review support to the local QA artifact workflow. `qa/scripts/team.mjs`, `qa/templates/team-review.md`, `qa/reviews/README.md`, `qa/README.md`, and `.agents/skills/qa-team/SKILL.md` now distinguish advisory versus command-backed reviews, carry an environment label, and preserve explicit command evidence for `release_summarizer`.
- [x] 2026-03-26 22:47 EDT — Fixed a real Phase 2 scaffold bug: `qa:team` argument parsing was truncating command strings that contained `=` (for example `--pack=default_ship`). Updated `qa/scripts/team.mjs` to split CLI arguments on the first `=` only, then revalidated both advisory and command-backed dry runs.
- [x] 2026-03-26 22:49 EDT — Generated and filled a real command-backed local review artifact at `qa/reviews/local/2026-03-26-packet-stage-save-feedback.md`. The artifact now records the actual command evidence (`qa:validate`, `qa:run-pack --dry-run`, the full packet integration-ui subset, the unit save-feedback test, lint, and build) and a release-summarizer-ready merge-confidence verdict.
- [x] 2026-03-26 23:37 EDT — Command-backed QA review surfaced another live control-plane drift: `apps/web/tests/unit/use-packet-stage-step-state.test.tsx` existed without an inventory row, causing `qa:validate` to fail. Added a curated row to `qa/test-inventory.csv` that maps it to the shared packet-workbench contract and revalidated the control plane at 127 inventory rows.
- [x] 2026-03-26 23:49 EDT — Ran the optional safe-environment browser proof on `dev-local`. `PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run qa:run-pack -- --pack=default_ship --slug=phase2-browser-proof` passed after aligning stale browser assertions with the current packet-stage and review-page copy. Browser smoke, the packet integration-ui subset, and the local-auth `@default_ship` Playwright lane all completed successfully. Recorded the result in `qa/runs/local/2026-03-26-phase2-browser-proof-default_ship.md` and upgraded the command-backed review artifact to a browser-backed `dev-local` verdict.

## Surprises & Discoveries

The repository is further along than a greenfield plan would suggest. `qa/AGENTS.md` already names the right operating roles, `qa/README.md` already describes packs and environments clearly, and `qa/scripts/run-pack.mjs` already codifies the packet-funnel integration-ui proof plus browser pack workflow. This work should therefore extend the existing operating system, not replace it with a parallel one.

The most important missing layer is Codex-specific, not QA-specific. There is no project `.codex/config.toml` yet, so Codex currently has no repo-scoped subagent roster for QA work. The official customization order also matters here: in practical repository terms, `AGENTS.md` defines conventions, skills package repeatable workflows, and subagents should be added after those layers exist rather than used as a substitute for them.

The current validator already proves why a real control plane matters. `bun run qa:validate` fails today with `qa/test-inventory.csv is missing an inventory row for apps/web/tests/integration-ui/execute-ship-page.test.tsx`. That means the first step of the new team cannot be role choreography; it must be making the existing source of truth accurate enough that the new roles are operating on live data.

The repo also already contains a workspace-local browser QA skill at `.agents/skills/qa-Browser/SKILL.md`. That is useful, but it is not the same thing as the QA team. The new QA team should treat `qa/` as the source of truth and use the browser-runner role only for repository-defined journeys. It should not move scenario ownership back into a skill folder.

The implementation needs a sharper split between “one strong QA mind” and “many visible roles” than the first draft stated. The user wants the product experience to feel like one strong QA lead that reads `qa/` and figures it out, not like a committee that the user has to manage explicitly. That means the phase-1 specialist roles should exist as optional support behind the scenes, and the final answer should surface role labels only when they materially help the explanation.

The control boundary around writes also needed to be frozen more precisely. The QA team can auto-create ignored local review artifacts for material reviews, and the lead can auto-run the minimal safe local set, but canonical `qa/coverage.csv`, `qa/test-inventory.csv`, and similar source-of-truth files should not change just because the user said “talk to QA.” The lead may prepare those changes, but it must ask for confirmation before applying them.

Milestone 1 revealed a subtler control-plane problem than the original missing-row blocker. In the current tree, `bun run qa:validate` was already green, but `bun run qa:inventory:sync` was not idempotent: it overwrote curated scenario mappings such as `EXECUTE-01`, `PACKET-09`, and `PACKET-08` with generic heuristic defaults. That meant the inventory looked healthy until someone refreshed it, at which point the QA semantics silently regressed.

The root cause was twofold. First, `qa/scripts/generate-test-inventory.mjs` always regenerated rows from filename heuristics instead of preserving the already-curated inventory entries for unchanged files. Second, two packet-stage inventory rows included comma-containing rationale text without CSV quoting, so any parser-based round-trip truncated them. The practical fix was to preserve existing rows for known files, use heuristics only for genuinely new files, and quote those packet-stage rationale fields so sync remains stable.

The recent-feature proof also exposed the exact behavior this QA team is supposed to make easy to see: infrastructure health and feature health are not the same thing. The lead-first QA layer validated cleanly and the `codex exec` smoke path did pick up the `qa-team` skill plus the repo-scoped QA roles, but the packet-flow slice it reviewed ended in a negative verdict on the latest worktree state. The focused unit save-feedback proof stayed green, while the focused integration-ui packet-stage suite later flipped red and `bun run --cwd apps/web lint` failed on packet-flow files. That is the right outcome for the system: the team worked, and it caught a real issue instead of papering it over.

Continuing execution also proved the value of keeping the review scope explicit. The packet-stage save-feedback slice was repairable without touching the broader unrelated lint blockers elsewhere in the branch. After restoring page-position feedback, first-invalid-field focus, and the sidebar’s human-readable missing-field labels, the narrowed packet-stage proof turned green again while branch-wide lint still stayed red on unrelated files. The QA artifact now reflects that narrower positive verdict instead of the earlier all-branch negative one.

The unrelated lint blockers also turned out to be cheap to clear once the packet-stage slice was stable again. That let the branch return to a green lint gate without reopening the packet-flow changeset or muddying the QA-team proof.

With build green as well, Phase 1 now has the stronger outcome the plan wanted: the repo-scoped QA team exists, the fast QA control-plane checks are green, the example packet-stage slice was reviewed and repaired back to green, and the standard app lint/build gates pass again.

The Phase 2 smoke uncovered a different class of problem than code regression: stale QA language. Once the lead actually fanned out to `journey_mapper`, `coverage_analyst`, and `gap_reviewer`, the specialists all converged on the same gap: the live packet workbench had moved to autosave-backed save feedback and a single `Continue` action, while the canonical QA rows still described “Save and continue / Save and stay.” That mismatch would have kept producing conservative or confusing QA verdicts even when the code was healthy.

The smoke also surfaced a new untracked test file, `apps/web/tests/unit/use-autosave.test.tsx`. That was useful evidence that the autosave model had become real enough to deserve canonical QA vocabulary, and it proved the inventory/validator discipline from Milestone 1 was still doing its job.

Later command-backed review work exposed the same class of issue again with `apps/web/tests/unit/use-packet-stage-step-state.test.tsx`. That repetition is useful, not alarming: it shows the stronger review workflow is actually exercising the control plane, not just the app code. The right response was the same as Milestone 1: keep the inventory truthful as the test tree evolves.

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

Decision: make chat-first `qa-lead` the primary product experience in phase 1.
Rationale: the user wants to say “go talk to our QA team” and have one strong QA mind figure it out from `qa/`. That means the lead experience is the product, while the rest of the roster is optional support.
Date/Author: 2026-03-26 / Codex

Decision: use a two-phase rollout.
Rationale: phase 1 should make the QA team genuinely useful fast with `qa-lead`, the `qa-team` skill, skeleton support roles, and tight safety rules. Phase 2 can deepen automatic delegation only after the lead-first workflow proves itself on real usage.
Date/Author: 2026-03-26 / Codex

Decision: keep specialist roles lightly visible in phase-1 answers.
Rationale: the user wants it to feel like a team, but not like a stitched committee memo. The lead should expose labeled role sections only when those roles materially contribute to the answer.
Date/Author: 2026-03-26 / Codex

Decision: allow auto-created ignored local review artifacts only for material reviews.
Rationale: the team should leave behind a useful trail when the review is substantial or command-backed, but not create a filesystem artifact for every lightweight opinion request.
Date/Author: 2026-03-26 / Codex

Decision: canonical `qa/` truth updates require a review-first confirmation step.
Rationale: the lead may prepare exact changes to `qa/coverage.csv` or `qa/test-inventory.csv`, but it should not silently mutate those files during an ordinary “talk to QA” interaction.
Date/Author: 2026-03-26 / Codex

Decision: the default safe local auto-run budget for `qa-lead` is minimal.
Rationale: phase-1 auto-run should be limited to `bun run qa:validate`, `bun run qa:run-pack -- --pack=<pack> --dry-run`, and directly relevant focused `vitest` runs. Broader integration or browser commands remain an explicit escalation.
Date/Author: 2026-03-26 / Codex

Decision: explicit browser-execution requests are in scope for phase 1.
Rationale: the user wants the team to “kinda do it all” when asked explicitly. The safest version is to let `qa-lead` delegate to `browser-runner` for explicit browser requests while keeping normal QA-team interactions advisory-first.
Date/Author: 2026-03-26 / Codex

Decision: `qa:inventory:sync` must preserve curated inventory rows for unchanged test files and use filename heuristics only for newly discovered files.
Rationale: the inventory file is both generated and curated. Rebuilding every row from heuristics makes the control plane look green while silently discarding richer QA mappings such as `EXECUTE-01`, `PACKET-08`, and `PACKET-09`. Preserving known rows keeps sync idempotent and still lets the script create starter rows for brand-new tests.
Date/Author: 2026-03-26 / Codex

Decision: material QA reviews should use deterministic specialist fan-out instead of ad hoc lead-only judgment.
Rationale: Phase 1 proved the lead-first experience worked, but the boundary between “lightweight question” and “material review” was still too soft. Phase 2 now makes feature diff reviews predictable: `journey_mapper`, `coverage_analyst`, and `gap_reviewer` fan out by default for material advisory reviews, while `browser_runner` and `release_summarizer` remain explicit escalation roles.
Date/Author: 2026-03-26 / Codex

Decision: the canonical QA truth must describe the live packet workbench as autosave-backed save feedback plus one primary `Continue` action.
Rationale: the packet-flow implementation and tests no longer expose the older dual save-intent model. Leaving the old wording in `qa/` would make the QA team conservative for the wrong reason and would turn valid behavior into apparent drift.
Date/Author: 2026-03-26 / Codex

## Outcomes & Retrospective

Implementation is complete for the current scope of this plan. The repository now has the intended two-layer QA system: `qa/` remains the product-readable operating system, and the repo-scoped Codex roles plus `qa-team` skill form the execution layer that makes the system feel like a real team. Phase 1 shipped the lead-first interface, support roster, local review artifacts, and validator-backed control-plane health. Phase 2 shipped deterministic material-review fan-out, command-backed artifact scaffolds, release-summarizer-ready verdict flow, and canonical QA-truth alignment with the live packet-workbench contract.

The obvious risk is overbuilding orchestration before the existing control plane is clean. This plan intentionally starts with `qa:validate` health and inventory correctness before adding `.codex/` files or role prompts. A second risk is role sprawl. This plan avoids that by keeping the first roster to six roles total and by making browser execution opt-in or environment-gated rather than automatic on every feature.

The first lesson from execution is that “green validator” was not enough. The inventory refresh path also had to preserve curated meaning, otherwise the QA layer would drift the next time someone ran the documented sync command. That gap is now closed.

The second lesson is that the real proof milestone should stay outcome-first. Phase 1 is complete because the QA team now exists as a real repo-scoped interface, not because the example feature was green. In fact, the more useful proof was that the team returned a structured negative verdict when the packet-flow worktree drifted into failing integration-ui and lint states.

The third lesson is that the QA artifact should track the latest scoped truth, not the first observed failure. The packet-stage slice was initially red, then repaired back to green in-scope, while unrelated branch-level lint blockers remained. The review artifact and this plan now both distinguish between those two states.

The fourth lesson is that better delegation quickly exposes truth drift. Once the lead reliably fanned out to the advisory specialists, the team became better at spotting when `qa/` itself was stale. That ended up being the real value of Phase 2: not more roles, but more reliable use of the existing ones and tighter alignment between repo reality and the control plane.

If this work reveals that the subagent layer is useful but the artifact model is too heavy, the likely simplification is to keep the role configs and `qa-team` skill while collapsing the review artifacts back into one summary file. That simplification is acceptable later, but the first version should still leave behind enough written evidence for material reviews that another agent can audit how the QA verdict was reached.

The optional browser follow-up was eventually run as well. That strengthened the final outcome beyond the minimum plan contract: the repo now has both advisory and command-backed QA-team workflows, plus a fresh `dev-local` browser-backed `default_ship` proof.

## Context and Orientation

The repository already has a journey-first QA operating system created in the earlier initiative documented at `docs/codex/2026-03-25-journey-first-qa-operating-system-execplan.md`. That work established the `qa/` control plane, the journey catalog in `qa/journeys.csv`, the coverage map in `qa/coverage.csv`, the full test inventory in `qa/test-inventory.csv`, the persona protocol in `qa/personas.json`, the run report template in `qa/templates/run-report.md`, the validator in `qa/scripts/validate.mjs`, and the pack orchestrator in `qa/scripts/run-pack.mjs`. This new plan is not allowed to replace that system. It must layer repo-scoped Codex role configuration and a team workflow on top of it.

The current QA system already has the right nouns. `qa/AGENTS.md` defines five responsibilities: scenario mapper, test auditor, browser runner, gap reviewer, and release summarizer. `qa/README.md` explains the pack model: `default_ship`, `extended`, and `billing_integration`. `qa/scripts/run-pack.mjs` already executes those packs in plain Node and Bun commands. The current packet-funnel proof is especially important because the `default_ship` pack already runs browser smoke, the packet integration-ui suite, and the default-ship Playwright browser pack. The new subagent team must understand and reuse those existing commands instead of inventing different ones. In phase 1, `qa-lead` is the primary behavior layer and the rest of the roster is support, not mandatory fan-out.

The repository does not yet have a project `.codex/` directory. That means the project currently has no checked-in Codex role definitions and no repo-scoped multi-agent configuration. The shared-skill side does exist: `.agents/skills/` is already part of the repo and includes `.agents/skills/qa-Browser/SKILL.md`. In practical terms, this means the implementation can safely add a new checked-in `.codex/config.toml` plus `.codex/agents/*.toml`, and it can add a new `.agents/skills/qa-team/` skill without colliding with existing project-local Codex config.

The plain-language terms in this plan must stay stable. A “QA team” means one lead agent plus a small roster of specialist subagents with fixed responsibilities. In phase 1, the lead is the primary product behavior and the specialists are optional support roles. A “role config” means the Codex TOML file that tells Codex when to pick a role and what that role owns. A “team skill” means the user-facing skill under `.agents/skills/qa-team/` that packages the workflow and trigger phrases so the user can say natural things like `go talk to our QA team about this feature`. An “advisory review” means journey mapping, proof analysis, and gap finding without automatically running browser commands. A “material review” means a QA-team interaction that is non-trivial because it touched multiple journeys, ran commands, or produced a meaningful verdict; those reviews may auto-create ignored local artifacts. A “run evidence review” means the browser-runner executed safe checks and the release-summarizer wrote durable conclusions from the results.

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

Once the control plane is clean, add repo-scoped Codex role configuration. Create `.codex/config.toml` with multi-agent enabled and a lead-first role roster that points to per-role config files under `.codex/agents/`. In phase 1, `qa-lead` is the real product experience. The specialist role files should exist as thin support configs, but the lead should be able to do the whole job itself and only delegate when it judges that specialist help materially improves the review. The role files should point back to `qa/AGENTS.md` and the relevant `qa/` CSV or Markdown files instead of embedding a second policy document inside TOML.

After the role files exist, add a new shared skill at `.agents/skills/qa-team/`. This skill is the main user-facing entrypoint. It should explain that the primary behavior is chat-first and lead-first: the user says something like `go talk to our QA team about this feature`, `qa-lead` reads `qa/`, and the lead may optionally delegate to support roles. The skill should not redefine the journey catalog or scenario packs. It should explicitly send the lead agent back to `qa/AGENTS.md`, `qa/README.md`, `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv` as the truth. The skill should also define the output contract for the lead agent: affected journeys, current proof, missing proof, recommended runs, findings, and release confidence, with light role labels only when support roles materially contributed.

Then add a small review-artifact layer. Create `qa/templates/team-review.md` plus `qa/reviews/README.md`, add `qa/reviews/local/` to `.gitignore`, and introduce a helper such as `qa/scripts/team.mjs` exposed as `bun run qa:team`. The helper should scaffold a dated local review folder or summary file using the current diff or an explicit base ref. It does not need to run Codex itself. Its main job is to support material reviews, not every lightweight chat. The lead may auto-create these ignored artifacts only when the review is substantial because it touched multiple journeys, ran commands, or produced a meaningful verdict.

Finally, update the QA docs and validate the full flow on a real recent diff. `qa/AGENTS.md` should add a named `QA Lead` responsibility and rename or clarify the existing `Test Auditor` role into `Coverage Analyst`. `qa/README.md` should explain the difference between advisory reviews, safe local auto-run, explicit browser execution, and durable run evidence. The implementation must then prove the new team on a recent feature, such as the packet-stage save-feedback slice, by showing that the team maps it to `PACKET-02`, `PACKET-03`, `PACKET-04`, `PACKET-05`, and `PACKET-07`, recognizes the new integration-ui and unit proof, and correctly identifies whether browser evidence is still missing or already satisfied.

## Milestones

### Milestone 1: Restore QA control-plane health before adding subagents

At the end of this milestone, `bun run qa:validate` passes again, `qa/test-inventory.csv` includes every current file under `apps/web/tests/`, and the current packet-funnel proof files are represented accurately enough that the new team can trust the control plane. This milestone should touch `qa/test-inventory.csv`, possibly `qa/coverage.csv`, and `qa/scripts/validate.mjs` only if the validator itself needs adjustment for legitimate new test types.

Success for this milestone means a fresh agent can run `bun run qa:validate` from the repository root and get a clean result instead of the current missing-inventory-row error. That is the minimum trustworthy foundation for the rest of the plan.

### Milestone 2: Phase 1 — Add `qa-lead` plus skeleton support roles

At the end of this milestone, the repository has `.codex/config.toml` plus `qa-lead.toml` and thin support-role files under `.codex/agents/` for `journey-mapper`, `coverage-analyst`, `gap-reviewer`, `browser-runner`, and `release-summarizer`. In phase 1, `qa-lead` is the real runtime contract. It should be able to do the whole job itself, while the support roles exist as optional helpers the lead may call when they add value. Normal QA-team use should not depend on visible multi-role fan-out.

Success means a human inspecting the checked-in config can see the roster clearly, and a Codex session in the trusted repo can select `qa-lead` as the default QA mind while still having support roles available behind the scenes. This is configuration proof, not just documentation proof.

### Milestone 3: Phase 1 — Add the `qa-team` skill and material-review artifact workflow

At the end of this milestone, the repo has `.agents/skills/qa-team/SKILL.md`, a `qa/templates/team-review.md` template, a `qa/reviews/README.md` explainer, and a helper such as `bun run qa:team` that scaffolds a local review workspace for a feature diff. The skill must make the developer experience natural: “go talk to our QA team” should be a supported trigger phrase, and the skill should route the user into the lead-first workflow without requiring them to remember role names or raw CSV files. Local review artifacts should be created only for material reviews, not every lightweight chat.

Success means a novice can look at the skill description, know when to use it, understand that chat-first `qa-lead` is the primary interface, run the scaffold command if desired, and understand where the QA team’s local review artifacts will appear.

### Milestone 4: Phase 1 — Align the existing QA docs and operating model with the new team

At the end of this milestone, `qa/AGENTS.md` and `qa/README.md` explain both the control-plane layer and the new lead-first team layer in one coherent story. The role list in `qa/AGENTS.md` should match the checked-in Codex role names, but it should also state that `qa-lead` is the main interface in phase 1 and that canonical `qa/` truth writes require confirmation. The README should explain the advisory-first default, the minimal safe local auto-run set, and the conditions under which the browser-runner is allowed to execute pack commands when explicitly asked.

Success means there is no ambiguity about whether `qa/` or `.codex/` is the source of truth. `qa/` must clearly remain the authority, and the new subagents must clearly be presented as the way Codex works with that authority.

### Milestone 5: Phase 1 proof plus Phase 2 boundary

At the end of this milestone, the team has been exercised against one recent feature slice, ideally the packet-stage save-feedback change. The review should produce a local team artifact for the material review showing the affected journeys, existing proof, remaining gaps, recommended runs, and final QA confidence. If the user explicitly asks for browser execution and a safe environment is available, `qa-lead` may delegate to `browser-runner` and use the existing browser workflow under `qa/AGENTS.md`. The milestone should also leave an explicit documented boundary that phase 2 is about deeper delegation and smarter fan-out, not about making the basic QA team useful for the first time.

Success means the QA team feels real in practice, not only in files. A human should be able to ask the team about a feature and receive one coherent, lightly role-labeled answer, and should also be able to explicitly request browser execution without leaving the QA-team workflow.

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

Create `.codex/config.toml` and the per-role files under `.codex/agents/`. The config should enable multi-agent support, define the lead-first QA roster, and keep the descriptions short enough that a novice can understand them by reading the files directly. `qa-lead` should be the obvious default. The support-role files should exist but should be framed as optional specialist helpers, not mandatory fan-out. The role files should point back to `qa/AGENTS.md` and the relevant `qa/` CSV or Markdown files instead of embedding a second policy document inside TOML.

When Milestone 3 starts, create the user-facing skill and review scaffold:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ mkdir -p .agents/skills/qa-team
    $ mkdir -p qa/reviews

Add `.agents/skills/qa-team/SKILL.md`, `qa/templates/team-review.md`, `qa/reviews/README.md`, and a helper script such as `qa/scripts/team.mjs`. Register the helper in the root `package.json`, and add `qa/reviews/local/` to `.gitignore`. The helper should accept a feature slug and optional base ref, scaffold the local review artifact, and print the current diff paths so the lead agent has deterministic starting context. The skill should also explicitly define the default safe local auto-run budget: `qa:validate`, `qa:run-pack -- --pack=<pack> --dry-run`, and directly relevant focused `vitest` runs only.

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

If a safe browser environment is declared and browser execution is explicitly requested, the lead may delegate to `browser-runner`, and the runner should use the smallest relevant existing command instead of inventing a new one. Likely candidates are:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run qa:run-pack -- --pack=default_ship --dry-run

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run --project integration-ui tests/integration-ui/packet-stage-page.test.tsx tests/integration-ui/packet-stage-sidebar.test.tsx

Use `dev` first, then `prod`, and only when the environment is explicitly safe and correctly configured as described in `qa/README.md` and `qa/AGENTS.md`.

## Validation and Acceptance

Acceptance is behavior-first.

The first acceptance criterion is that the repo has one obvious QA-team entrypoint. A human should be able to read `.agents/skills/qa-team/SKILL.md` and know that “go talk to our QA team about this feature” is a supported request with a stable output shape. Chat-first `qa-lead` is the primary contract; `bun run qa:team` is a support scaffold, not the main user experience.

The second acceptance criterion is that the QA team is repo-scoped and onboarding-friendly. A fresh Codex session in this trusted repository should inherit the same lead-first QA role roster through `.codex/config.toml` and `.codex/agents/*.toml` without requiring hidden user-global setup.

The third acceptance criterion is that the QA team does not create a second source of truth. Every specialist role must anchor to `qa/AGENTS.md`, `qa/README.md`, `qa/journeys.csv`, `qa/coverage.csv`, and `qa/test-inventory.csv` instead of inventing new scenario catalogs or coverage concepts elsewhere.

The fourth acceptance criterion is that the team feels staffed, not monolithic. The lead agent’s final answer must reflect distinct responsibilities: journey mapping, current-proof analysis, gap finding, optional browser execution, and release summary. In phase 1, those responsibilities should be lightly visible with labeled sections only when support roles materially contributed. A single freeform blob is not enough, but a forced every-role memo is also not required.

The fifth acceptance criterion is that the advisory-first workflow is safe by default. Asking the QA team about a feature should not automatically run payment flows, real production browser sweeps, or destructive actions unless the environment is declared safe and the user asked for execution. The default auto-run budget must stay limited to `qa:validate`, `qa:run-pack --dry-run`, and directly relevant focused `vitest` runs.

The sixth acceptance criterion is that the underlying control plane remains healthy. `bun run qa:validate` must pass after the implementation, and any new QA-team-specific files that become part of the control plane should be checked by that validator or by an equally fast companion check.

The seventh acceptance criterion is that the system is proven on a recent real feature diff. A QA-team review of a recent packet-funnel change must produce an understandable verdict in product language, not implementation language.

The eighth acceptance criterion is that canonical `qa/` truth remains controlled. During a normal QA-team interaction, the lead may prepare exact updates to files like `qa/coverage.csv` or `qa/test-inventory.csv`, but it must ask for confirmation before applying them.

The minimum validation set for this initiative should be:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run qa:inventory:sync
    $ bun run qa:validate
    $ bun run qa:team -- --slug=packet-stage-save-feedback --base=main --dry-run
    $ bun run build

If Codex CLI is available in the implementation environment, add a manual smoke proof:

    Open the trusted repo in Codex.
    Invoke the QA team with a recent feature request in plain language.
    Confirm that `qa-lead` returns one consolidated verdict, lightly labels specialist input when it materially contributed, auto-runs only the minimal safe local set by default, and can delegate browser execution when explicitly asked.

If Codex CLI is not available in the implementation environment, the plan should record that limitation explicitly and treat the structural repo proof plus the scaffold command as the implementation-time validation surface.

## Idempotence and Recovery

This work should be safe to rerun because it mostly adds configuration, skills, templates, and validation on top of the existing QA control plane. Re-running `bun run qa:inventory:sync` and `bun run qa:validate` should never mutate product behavior or browser state. Re-running the team scaffold should either create a new dated local review artifact or update the requested local review area without overwriting durable `qa/runs/` evidence.

If the `.codex/` role layer becomes confusing, recover by narrowing responsibility, not by deleting the whole team. The safe fallback is: keep `qa-lead`, keep the skeleton support-role files, and temporarily stop delegation from the lead while the docs and artifact contracts are corrected. That still preserves the lead-first team behavior.

If the `qa-team` skill grows into a second policy document, recover by deleting policy from the skill and moving it back into `qa/AGENTS.md`. The skill should stay orchestration-focused and should mostly point at the QA control plane rather than duplicate it.

If a normal QA-team chat starts trying to update canonical `qa/` files automatically, recover by disabling those writes and routing them back through the review-first confirmation path. Material local review artifacts can still be created automatically, but canonical truth must remain explicit.

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

    Phase-1 operating stance:
    qa-lead is the main QA mind
    support roles are optional helpers
    safe local auto-run is minimal
    browser execution requires an explicit ask
    canonical qa/ truth writes require confirmation

    Final phase-1 implementation:
    .codex/config.toml
    .codex/agents/qa-lead.toml
    .codex/agents/journey-mapper.toml
    .codex/agents/coverage-analyst.toml
    .codex/agents/gap-reviewer.toml
    .codex/agents/browser-runner.toml
    .codex/agents/release-summarizer.toml
    .agents/skills/qa-team/SKILL.md
    qa/scripts/team.mjs
    qa/templates/team-review.md
    qa/reviews/README.md

    Manual smoke proof:
    codex exec "Go talk to our QA team about the packet-stage-save-feedback feature diff against main..."
    -> skill activated, repo QA roles engaged, advisory-first QA verdict returned.

    Phase-2 delegation proof:
    codex exec material review smoke visibly spawned:
    journey_mapper
    coverage_analyst
    gap_reviewer
    plus the repo's standard read-only review helpers

    Material review artifact:
    qa/reviews/local/2026-03-26-packet-stage-save-feedback.md

    Browser-backed local run evidence:
    qa/runs/local/2026-03-26-phase2-browser-proof-default_ship.md

    Latest packet-flow verdict from that artifact:
    focused unit proof green
    focused packet-stage integration-ui proof green
    branch-wide apps/web lint green
    feature verdict: ship-safe on dev-local for the packet-funnel UI slice; hosted or prod evidence remains separate work when needed

    Canonical QA-truth alignment after Phase 2:
    qa/journeys.csv now describes autosave-backed save feedback plus one Continue action
    qa/coverage.csv now describes the stage-page proof in those same terms
    qa/test-inventory.csv includes apps/web/tests/unit/use-autosave.test.tsx

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
