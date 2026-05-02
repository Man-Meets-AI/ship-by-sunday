# Research Pass: Generated Repo Operating System

## Question

How should Ship by Sunday make every newly generated customer repo immediately useful as an agentic engineering workspace with Programs, ExecPlans, prompt loops, skills, and validation?

## Findings

The generated repo zip is assembled through the review download path. `apps/web/app/api/download/repo/route.ts` authenticates and authorizes the request, `apps/web/app/api/download/repo/_server/downloads.ts` loads the customer's canonical project definition, `packages/blueprint-compiler/src/bundle/build-review-download-zip.ts` builds the archive, and `packages/blueprint-compiler/src/repo-generation/materialize-repo-snapshot.ts` materializes the customer-safe snapshot.

The customer repo already receives several agent-readiness surfaces. `packages/blueprint-compiler/src/repo-generation/render-generalized-starter-files.ts` renders root `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.agents/README.md`, `.agents/plans/README.md`, `.agents/skills/README.md`, workflow examples, and `docs/testing/`. `packages/blueprint-compiler/src/repo-generation/render-starter-project-onboarding.ts` renders `START-HERE.md` and the generated docs landing page. `packages/blueprint-compiler/src/repo-generation/render-starter-skills.ts` renders local wrapper skills for setup, Linear, Next.js, Convex, billing, and first-slice work. `packages/blueprint-compiler/src/repo-generation/starter-root-package-json.ts` owns root scripts in the downloaded repo.

The Build Pack already approximates an ExecPlan workflow through generated `docs/build/docs/readiness.md`, `agent-handoff.md`, `prompt.md`, `plans.md`, `implement.md`, `review.md`, and `documentation.md`. The completed `docs/programs/completed/2026-05-01-generated-repo-first-slice-autonomy/` Program made those docs much stronger, but it still leaves customer repos without the canonical Program and ExecPlan folder model.

The current customer-safe snapshot contract deliberately excludes `docs/PLANS.md`, `docs/exec-plans/**`, `docs/programs/**`, and `docs/prompts/program-*.md` in `packages/blueprint-compiler/src/repo-generation/customer-safe-snapshot-contract.ts`. That is correct for internal artifacts, but wrong for a generalized customer-safe operating pack. The solution is not to flip the exclusions and ship internal history. The solution is to render a clean, product-neutral customer pack.

The trace include contract in `packages/blueprint-compiler/src/repo-generation/repo-download-source-contract.ts` currently includes prompt assets matching `../../docs/prompts/exec-plan*.md` and `../../docs/prompts/execplan*.md`. It excludes Program prompts with the `docs/prompts/program-` fragment. New Program prompt assets for customers must either be generated explicitly or included as a generalized source set.

There is prompt naming drift. The customer snapshot currently renders four `execplan-*` prompt files through `packages/blueprint-compiler/src/blueprints/render-prompt-pack.ts`, while internal docs now treat dashed `exec-plan-*` files as the active repo-agent family. Any customer operating pack must decide whether generated repos use the older customer-local `execplan-*` contract, the newer `exec-plan-*` contract, or both with clear purpose.

Generated onboarding references some skill triggers that are not currently shipped as local skills or listed as external installs. The operating pack must test that every generated skill trigger is either present under `.agents/skills/**` or listed in `.agents/skills/external-skills.json`.

## Recommended Direction

New generated repos should ship an "Agentic Operating Pack" with these customer-safe surfaces:

- `docs/exec-plans/PLANS.md`
- `docs/exec-plans/README.md`
- `docs/exec-plans/active/index.md`
- `docs/exec-plans/completed/index.md`
- `docs/exec-plans/templates/exec-plan.md`
- `docs/programs/PROGRAMS.md`
- `docs/programs/README.md`
- `docs/programs/active/index.md`
- `docs/programs/completed/index.md`
- `docs/programs/templates/program.md`
- selected `docs/prompts/exec-plan-*.md`
- selected `docs/prompts/program-*.md`
- `.agents/skills/shared/exec-plan-*`
- `.agents/skills/shared/program-*`
- root scripts for `plans:lint`, `programs:lint`, and a combined agentic validation command

Generated repos should also receive a first Program packet only when it is truthful. For greenfield generated repos, that can be a `docs/programs/active/<date>-first-product-build/` packet derived from `docs/facts/project-definition.json`, `DESIGN.md`, and the Build Pack readiness model. It should choose the first child ExecPlan but should not pretend the whole customer roadmap is known.

The first implementation slice should stay compiler-owned, but it should reconcile current generated-repo source truth before rendering the full operating pack. It should align prompt naming, prompt contents, skill triggers, generated package-script promises, Build Pack paths, and customer-safe snapshot boundaries. It should not change auth, billing, checkout, Convex runtime, provider setup, app routes, intake schema, or homepage messaging.

## Validation Targets

The first slice should run focused compiler tests around generated repo materialization and then broader package checks. Likely tests include `packages/blueprint-compiler/tests/repo-generation.test.ts`, `packages/blueprint-compiler/tests/review-download-zip.test.ts`, `packages/blueprint-compiler/tests/customer-safe-snapshot-contract.test.ts`, and any clean-room replay coverage that parses generated docs.

## Watchpoints

Do not ship internal completed Programs or ExecPlans to customers. Do not make a hidden `postinstall` mutate their repo. Do not create a first Program packet that overstates certainty. Do not duplicate Build Pack readiness truth into a second inconsistent planning model.
