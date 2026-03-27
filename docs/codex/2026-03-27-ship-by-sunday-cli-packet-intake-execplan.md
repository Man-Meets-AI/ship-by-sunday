---
summary: "ExecPlan for turning Ship by Sunday into a Bun CLI that collects the canonical packet facts, reports readiness, and generates the same packet files and starter snapshot that the web Review flow produces. The plan starts by freezing the canonical fact contract so the CLI does not harden the current schema and documentation drift."
read_when: "Open this when you need to plan or implement a CLI-first Ship by Sunday intake flow that can be used by humans now and by agents later."
plan_status: "not_done"
---

# Turn Ship by Sunday into a Bun CLI packet intake and repo generator

This is a living execution plan for introducing a Bun CLI that asks the same packet-shaping questions as the current Ship by Sunday funnel, stores the answers locally, shows packet readiness, and generates the downloadable docs and starter snapshot without going through the web app. It is written so a fresh coding agent can implement the change end to end without prior chat context, and it must be updated as work proceeds.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this work, someone working from the repository root will be able to run a Bun command, answer the canonical Ship by Sunday intake questions in the terminal, and produce the same design pack, marketing pack, build pack, and starter snapshot repo that the web `/review` flow is meant to produce. This matters because the product is already packet-first in principle, but the current intake only exists as a web funnel backed by Convex and Clerk. A CLI makes the packet compiler usable without the teaching shell, gives operators and internal agents a direct path to generate customer-safe output, and forces the repository to treat the canonical fact contract as the real product. A human should be able to verify the change by running the CLI from the repo root, filling or importing facts, seeing readiness advance through Product, Design, Marketing, Build Plan, and Review, then generating a repo zip or directory whose contents match the existing review-download contract.

## Progress

- [x] 2026-03-27 13:28 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `packages/packet-compiler/AGENTS.md`, `docs/codex/PLANS.md`, and `docs/prompts/execplan-writer.md` before drafting this plan.
- [x] 2026-03-27 13:28 EDT — Inspected the current canonical schema and stage grouping in `packages/packet-compiler/src/canonical-project-definition/schema.ts` and `packages/packet-compiler/src/stages/stage-definitions.ts`.
- [x] 2026-03-27 13:28 EDT — Inspected the current web persistence and download path in `apps/web/convex/packet/projectDefinition.ts`, `apps/web/features/packet-flow/lib/packet-field-helpers.ts`, `apps/web/features/packet-flow/server/downloads.ts`, and `apps/web/features/packet-flow/components/packet-review-page.tsx`.
- [x] 2026-03-27 13:28 EDT — Inspected the packet and repo generation entry points in `packages/packet-compiler/src/server/rendered-packet-tree.ts`, `packages/packet-compiler/src/bundle/build-review-download-zip.ts`, `packages/packet-compiler/src/repo-generation/materialize-repo-snapshot.ts`, and `packages/packet-compiler/src/server/template-loader.ts`.
- [ ] Milestone 1 — Freeze the canonical CLI contract by resolving schema and documentation drift.
- [ ] Milestone 2 — Make `@manmeetsai/packet-compiler` safe to call from a CLI by centralizing repo-root resolution and shared field-presentation helpers.
- [ ] Milestone 3 — Add a new `packages/ship-by-sunday-cli/` workspace package and expose a root `bun run sbs` command.
- [ ] Milestone 4 — Implement local draft storage plus interactive and non-interactive intake commands that reuse the canonical stage definitions.
- [ ] Milestone 5 — Implement `review`, `export`, and `generate` commands that emit packet files and a starter snapshot from local facts.
- [ ] Milestone 6 — Add focused tests, root documentation, and end-to-end validation transcripts for the CLI workflow.

## Surprises & Discoveries

The repository already contains most of the product engine needed for a CLI. `packages/packet-compiler/src/stages/stage-definitions.ts` already defines the Product, Design, Marketing, Build Plan, and Review stage sequence, and `packages/packet-compiler/src/readiness/evaluate-packet-readiness.ts` already computes whether each artifact boundary is ready. That means the CLI should not invent a parallel question set. It should reuse this stage contract directly.

The current schema and the planning docs do not agree yet, and the CLI must not bake that mismatch in. The planning docs still mention fields such as `starter_repo_github_username`, `verification_plan`, `validation_commands`, and `rollback_plan`, while the live schema in `packages/packet-compiler/src/canonical-project-definition/schema.ts` does not define them. The live schema test in `packages/packet-compiler/tests/canonical-project-definition.test.ts` explicitly rejects legacy GitHub invite intake. The first CLI milestone therefore has to freeze one canonical fact contract before any terminal prompts are written.

The current packet compiler is not automatically CLI-safe because it assumes a specific working directory shape. `packages/packet-compiler/src/server/template-loader.ts` and `packages/packet-compiler/src/repo-generation/materialize-repo-snapshot.ts` both derive the repository root from `path.resolve(process.cwd(), "..", "..")`. That assumption works when code runs from the web app package or packet-compiler package, but it will resolve the wrong path if the future CLI is launched from the repository root, which is the correct user experience for `bun run sbs ...`. The plan must include a shared repo-root resolver or explicit root-path parameter before the CLI uses these compiler entry points.

The web app currently owns the field-presentation helpers even though they are really packet-contract knowledge. `apps/web/features/packet-flow/lib/packet-field-helpers.ts` knows which fact keys are arrays, which are long text, how to label fields, and how to serialize step patches. A CLI that duplicates those rules would drift immediately. The plan therefore treats these helpers as shared compiler-adjacent concerns that must move out of the web feature boundary.

Evidence from repo inspection:

    Canonical stage ids from packet-compiler
    - start
    - product
    - design
    - marketing
    - build-plan
    - review

    Schema drift examples found by search
    - docs mention: starter_repo_github_username
    - docs mention: verification_plan
    - docs mention: validation_commands
    - docs mention: rollback_plan
    - live schema rejects: starter_repo_github_username

## Decision Log

- Decision: The CLI is a first-class frontend to the existing packet compiler, not a new source of truth.
  Rationale: `packages/packet-compiler` already owns the canonical fact schema, stage definitions, readiness evaluation, packet rendering, and starter snapshot generation. Reusing those surfaces keeps the web funnel and the CLI aligned.
  Date/Author: 2026-03-27 / Codex

- Decision: The first implementation milestone is contract cleanup, not prompt scaffolding.
  Rationale: The planning docs and live schema currently disagree on several fact keys. A CLI would make that drift user-visible and harder to unwind if the contract is not frozen first.
  Date/Author: 2026-03-27 / Codex

- Decision: The CLI v1 will be local-first and file-backed, with no Convex, Clerk, or network dependency.
  Rationale: The user asked for Ship by Sunday to become a Bun CLI where someone answers the questions and gets the repo. A local-first design delivers that outcome directly and keeps the initial blast radius small.
  Date/Author: 2026-03-27 / Codex

- Decision: The CLI v1 will support both interactive stage prompting and non-interactive import/export commands.
  Rationale: The immediate use case is a human answering questions in a terminal, but the stated longer-term use case is an agent filling the same intake. Supporting JSON import and export from the start keeps the command surface agent-friendly without requiring agent automation in the first milestone.
  Date/Author: 2026-03-27 / Codex

- Decision: The CLI must run from the repository root through `bun run sbs ...`.
  Rationale: The product templates, starter repo source contract, and root package scripts all live at the repository root. Requiring a package-local working directory would be brittle and confusing.
  Date/Author: 2026-03-27 / Codex

- Decision: The CLI should use built-in runtime primitives rather than adding a prompt framework dependency.
  Rationale: The repo favors simple, explicit code. `node:readline/promises`, `node:fs/promises`, and spawning `$EDITOR` for long text are enough for v1 and avoid adding another CLI abstraction that future agents must learn.
  Date/Author: 2026-03-27 / Codex

- Decision: Field-presentation metadata must move into a shared packet-compiler-adjacent module before the CLI is built.
  Rationale: The current web-only helper module already encodes array fields, long-text fields, labels, and step serialization rules. The CLI must consume the same logic rather than copy it.
  Date/Author: 2026-03-27 / Codex

- Decision: Generation commands should refuse to overwrite an existing output path unless an explicit `--force` flag is present.
  Rationale: Repo snapshots and rendered docs are user-facing artifacts. Defaulting to safe writes makes the CLI idempotent and prevents accidental deletion of prior generated outputs.
  Date/Author: 2026-03-27 / Codex

## Outcomes & Retrospective

This section is future-facing because the plan is not implemented yet. The intended final outcome is a repository-root Bun CLI that can create or resume a local Ship by Sunday draft, gather the canonical packet facts, show what is still missing, and generate the same starter snapshot shape that the review download route produces today. The main known gap at plan time is contract cleanup: a future implementer must decide whether to align the planning docs down to the live schema, expand the schema to include the missing planning fields, or split the difference in a deliberate migration. If that decision stays fuzzy, the CLI work should stop after Milestone 1 rather than building the wrong intake surface.

## Context and Orientation

The current source of truth for packet facts is the canonical schema in `packages/packet-compiler/src/canonical-project-definition/schema.ts`. That file defines every stable fact that can customize the generated output, including product, design, marketing, pricing, validation, and placeholder-friendly operational fields such as `domain` and `support_email`. The helper functions exported from `packages/packet-compiler/src/canonical-project-definition/project-definition.ts` parse and create draft or complete project definitions around that schema.

The current question grouping is defined in `packages/packet-compiler/src/stages/stage-definitions.ts`. Each stage contains one or more steps, and each step names the fact keys it owns. The readiness boundary is computed in `packages/packet-compiler/src/readiness/evaluate-packet-readiness.ts`, which declares Product readiness from Product facts, Design readiness from Product plus Design facts, Marketing readiness from Design plus Marketing facts, Build readiness from Design plus Build Plan facts, and Review readiness from the union of Marketing and Build requirements. A CLI implementer should think of this as the stage contract, not as a loose suggestion.

The current web intake persists fact drafts in Convex through `apps/web/convex/packet/projectDefinition.ts`. That code accepts a stage id, a set of cleared field keys, and a patch of fact values, then merges those values into the stored draft. The web app’s `apps/web/features/packet-flow/lib/packet-field-helpers.ts` file currently owns human-facing labels, input kinds, and step serialization behavior. That is a boundary problem for this initiative because the CLI will need the same knowledge without depending on the web feature tree.

The generated output flow starts in `apps/web/features/packet-flow/server/downloads.ts`, which loads the authenticated project definition, parses it with `canonicalProjectFactsSchema`, and turns it into a full canonical definition. The actual generation happens inside `packages/packet-compiler`: `packages/packet-compiler/src/server/rendered-packet-tree.ts` renders the packet files under repo-root `docs/`, `packages/packet-compiler/src/bundle/build-review-download-zip.ts` builds the review zip, and `packages/packet-compiler/src/repo-generation/materialize-repo-snapshot.ts` assembles the starter repo tree. `packages/packet-compiler/src/server/template-loader.ts` loads the OpenAI packet templates and the shipped prompt assets from `docs/prompts/`.

The CLI initiative touches both repository shape and runtime assumptions. The root `package.json` currently has no `sbs` script and only one workspace package under `packages/`, namely `packet-compiler`. A new CLI package must therefore be added under `packages/ship-by-sunday-cli/` and exposed through the root script surface. Because the compiler currently resolves repository paths relative to `process.cwd()`, the CLI work must either pass an explicit repo root into the compiler entry points or centralize root resolution in a helper that works from the repository root.

For this plan, “interactive mode” means a terminal session where the CLI prompts the user field by field. “Non-interactive mode” means commands that read or write the draft definition from JSON files so another tool or agent can fill the same facts without using a TTY. “Starter snapshot” means the same customer-safe repo bundle already produced by `buildReviewDownloadZip()`, with generated files under repo-root `docs/`.

## Plan of Work

The work should begin by freezing the canonical fact contract. The implementer should audit the current Ship by Sunday packet docs against the live schema and stage definitions, choose the canonical field set for CLI v1, and update whichever side is wrong so the compiler, tests, and planning docs all name the same fields. This slice should stay tightly scoped to the fields that affect output files. Do not widen into broader curriculum cleanup, post-download execution flows, or provider setup.

Once the contract is frozen, the next step is to make `packet-compiler` reusable from a CLI context. This means moving field-presentation logic out of `apps/web/features/packet-flow/lib/packet-field-helpers.ts` into a shared module under `packages/packet-compiler/src/` or a sibling shared package, and it means replacing the current `process.cwd(), "..", ".."` root derivation with a repository-root resolver or explicit parameter that works when the user invokes `bun run sbs` from the repository root.

After the compiler is CLI-safe, the implementer should add a new workspace package under `packages/ship-by-sunday-cli/`. That package should expose one executable entry point, store draft state under a local hidden directory such as `.ship-by-sunday/`, and provide a thin command parser around a small set of opinionated commands. The package should not know how to render packet files by itself. It should call `@manmeetsai/packet-compiler` for validation, stage grouping, readiness, packet rendering, and repo snapshot generation.

With the package in place, the implementer should build the command surface in two passes. The first pass should create local storage, import/export, and review primitives so state can be inspected without prompts. The second pass should build interactive prompting that walks the stage contract, supports plain single-line values, one-item-per-line list values, and editor-backed multi-line values, and persists state after each field or step so interruptions are safe. Finally, the implementer should add focused tests, scripts, and documentation so a newcomer can run the CLI and verify that it generates a truthful starter snapshot end to end.

## Milestones

Milestone 1 freezes the canonical CLI contract. At the end of this milestone, the planning docs, the live canonical schema, and the stage definitions agree on the fact keys that the CLI will collect in v1. The files touched will include `docs/ship-by-sunday/packet-contract-and-question-map-2026-03-23.md`, `docs/ship-by-sunday/input-architecture-keep-kill-combine-2026-03-23.md`, and, only if needed, `packages/packet-compiler/src/canonical-project-definition/schema.ts`, its fixture, and its tests. Run the packet-compiler tests from `packages/packet-compiler` and confirm that the schema tests and readiness tests still pass. Success looks like a future implementer being able to answer “which fields does the CLI ask for?” by reading one consistent contract.

Milestone 2 makes the compiler reusable from a CLI. At the end of this milestone, the packet compiler no longer assumes it is being called from a package-specific working directory, and the field-presentation metadata needed by both web and CLI lives in a shared module outside the web feature tree. The files touched will likely include `packages/packet-compiler/src/server/template-loader.ts`, `packages/packet-compiler/src/repo-generation/materialize-repo-snapshot.ts`, a new repo-root helper module, a new shared field-metadata module, and the web helper import sites. Run the packet-compiler tests and the narrow web unit tests that exercise field presentation. Success looks like both the web app and a future CLI being able to ask or serialize the same fields without duplicating logic.

Milestone 3 scaffolds the CLI package and root command surface. At the end of this milestone, the repository has a new `packages/ship-by-sunday-cli/` package with `package.json`, `tsconfig.json`, a test configuration, and a single executable entry point, and the root `package.json` exposes `bun run sbs ...`. The command can parse subcommands and print help, but it does not need interactive intake yet. Run `bun run sbs --help` from the repository root and package-local typecheck and lint commands. Success looks like a newcomer being able to discover the CLI from the root scripts and invoke it without knowing the package internals.

Milestone 4 implements local draft storage plus intake and review commands. At the end of this milestone, the CLI can initialize a draft definition, import or export the draft as JSON, resume the first incomplete stage, run an interactive stage prompt, and print a review summary showing which facts or stages are missing. The files touched will include the CLI command handlers, the local storage adapter, and any shared serialization helpers. Run the CLI manually from the root, fill a partial draft, interrupt it, rerun it, and confirm that readiness advances correctly. Success looks like a human being able to complete Product and Design in the terminal and see Design readiness become true without touching the web UI.

Milestone 5 implements artifact generation. At the end of this milestone, the CLI can render packet files to a chosen output directory and generate the starter snapshot zip or unpacked repo directory using the same compiler entry points as the review flow. The files touched will include the generation command handlers and, if needed, compiler helper signatures that accept an explicit repo root path. Run the CLI with a complete fixture or imported draft and confirm that generated files appear under repo-root `docs/` inside the output tree, and that the repo zip unpacks into a slugified product folder. Success looks like the CLI producing the same user-facing artifact structure the web review download is expected to produce.

Milestone 6 closes the loop with tests and documentation. At the end of this milestone, the repository includes focused packet-compiler tests, focused CLI tests, a root-level usage note for `bun run sbs`, and short transcripts proving successful end-to-end usage. The files touched will include the new package tests and the relevant docs or README sections. Run package-local tests, root lint and typecheck for the touched surfaces, and one manual CLI walkthrough. Success looks like a fresh coding agent or operator being able to follow the repo docs, run the CLI, and validate the output without guessing.

## Concrete Steps

Work from the repository root unless a step explicitly says otherwise.

Begin by verifying the current contract drift and stage boundaries.

    pwd
    rg -n "starter_repo_github_username|verification_plan|validation_commands|rollback_plan" docs packages/packet-compiler apps/web -g '!**/node_modules/**'
    sed -n '1,260p' packages/packet-compiler/src/canonical-project-definition/schema.ts
    sed -n '1,260p' packages/packet-compiler/src/stages/stage-definitions.ts

Expected observation: the search should show drift between docs and schema, and the stage definition file should show the concrete Product, Design, Marketing, Build Plan, and Review step groupings the CLI must reuse.

During Milestone 1, update the docs and, only if deliberately chosen, the schema and tests so they agree. Validate the compiler package from its own directory.

    cd /Users/parkerrex/Projects/manmeetsai-workspace/packages/packet-compiler
    bun run test
    bun run typecheck

Expected observation: tests pass, and any schema change is reflected in fixtures and readiness behavior.

During Milestone 2, introduce a shared repo-root helper and shared field-metadata helper, then run the narrow package and web checks that prove nothing drifted.

    cd /Users/parkerrex/Projects/manmeetsai-workspace
    bun run --cwd packages/packet-compiler test
    bun run --cwd packages/packet-compiler typecheck
    bun run --cwd apps/web test:unit -- packet-step-save-feedback packet-stage-routes

Expected observation: packet-compiler still renders and evaluates readiness, and the web field helpers continue to work after being rewired to the shared metadata.

During Milestone 3, scaffold the CLI package and expose the root command.

    cd /Users/parkerrex/Projects/manmeetsai-workspace
    bun run sbs --help

Expected observation: the command prints usage text that includes the root command surface, even if the subcommands are still placeholders.

During Milestone 4, create a draft, export it, import it, and inspect readiness.

    cd /Users/parkerrex/Projects/manmeetsai-workspace
    bun run sbs init
    bun run sbs review
    bun run sbs export --out ./.ship-by-sunday/export.json
    bun run sbs import --file ./.ship-by-sunday/export.json

Expected observation: `init` creates the hidden local state directory, `review` shows missing stages or fields in human-readable form, and export then import is lossless.

During Milestone 5, generate a repo snapshot from a complete definition. The fastest safe route is to add a fixture import command or to import a JSON file based on `createCompleteProjectDefinition()`.

    cd /Users/parkerrex/Projects/manmeetsai-workspace
    bun run sbs generate repo --out ./tmp/sbs-cli-repo
    bun run sbs generate packet --out ./tmp/sbs-cli-packet

Expected observation: the repo output contains a slugified top-level folder with generated `docs/` content inside it, and the packet output contains the expected Design, Marketing, Build, facts, and prompt files.

At the end of the initiative, run the focused project checks for the touched surfaces.

    cd /Users/parkerrex/Projects/manmeetsai-workspace
    bun run --cwd packages/packet-compiler test
    bun run --cwd packages/packet-compiler typecheck
    bun run --cwd packages/ship-by-sunday-cli test
    bun run --cwd packages/ship-by-sunday-cli typecheck
    bun run lint

Expected observation: all touched package tests and typechecks pass, and repo lint only fails if there are unrelated pre-existing issues that must be documented in this plan.

## Validation and Acceptance

This initiative is complete only when a human can start from the repository root, run `bun run sbs init`, answer or import the canonical packet facts, run `bun run sbs review` to see accurate readiness, and run a generation command that produces the same packet and starter snapshot shape that the existing review flow expects. Acceptance is observable behavior, not internal structure. The CLI must prove that the Product, Design, Marketing, Build Plan, and Review progression is driven by `packetStageDefinitions` and `evaluatePacketReadiness()` rather than by a duplicate hand-maintained command list.

Validation must cover the contract, the CLI, and the generated artifacts. The packet-compiler tests must still pass after any schema, readiness, or repo-root changes. The CLI package must have focused tests for argument parsing, local storage, import/export, readiness reporting, and generation command behavior. One manual terminal walkthrough is mandatory because the user-visible value is the CLI experience itself. That walkthrough should show draft creation or import, partial readiness, completion, and artifact generation. If any repo-wide check is skipped because of unrelated failures, the plan must document the exact failing command and the unrelated files.

The output artifact acceptance bar is specific. A generated repo must unpack into a slugified product folder and contain generated files under repo-root `docs/` rather than in an ad hoc folder. The CLI must not require Clerk, Convex, or web sessions to generate the output. Placeholder-friendly fields such as `domain` and `support_email` must remain optional if the compiler contract still treats them that way. Existing web output behavior must continue to pass its focused tests, because the CLI is an additional frontend to the same compiler, not a fork.

## Idempotence and Recovery

All CLI state for v1 should live under a single local hidden directory such as `.ship-by-sunday/` at the repository root. Re-running `bun run sbs init` when a draft already exists should resume or confirm reuse rather than destroying work. Import operations should validate the input file before replacing the local draft. Export operations should be pure reads. Interactive stage commands should save after each field or after each step so a terminated terminal session only loses the current unsaved input, not the full draft.

Generation commands must be safe by default. If the target output path already exists, the command should refuse to overwrite it unless the caller passes `--force`. If a generation step fails midway, the CLI should either write to a temporary directory and rename on success or clean up the partial output and print the exact failure path. The compiler-facing repo-root helper should be deterministic and reusable so package-local and root-level invocations resolve the same template and snapshot paths.

If the implementer discovers that the live schema still needs new fields such as a rollback plan or validation commands, they must stop and update this ExecPlan before extending the CLI prompt surface. The safe fallback is to complete only Milestone 1, document the unresolved contract decision, and leave the CLI package unstarted rather than hardcoding an unstable field set.

## Artifacts and Notes

Important evidence from inspection that should remain true or be deliberately changed during implementation:

    Current shared compiler exports already suitable for CLI reuse
    - packetStageDefinitions
    - getPacketStageDefinition
    - evaluatePacketReadiness
    - createCanonicalProjectDefinition
    - createCanonicalProjectDefinitionDraft
    - parseCanonicalProjectDefinition

    Current compiler generation entry points
    - packages/packet-compiler/src/server/rendered-packet-tree.ts
    - packages/packet-compiler/src/bundle/build-review-download-zip.ts
    - packages/packet-compiler/src/repo-generation/materialize-repo-snapshot.ts

    Current web-only helper that should be shared
    - apps/web/features/packet-flow/lib/packet-field-helpers.ts

    Current CLI-hostile repo-root assumption
    - template-loader.ts uses path.resolve(process.cwd(), "..", "..")
    - materialize-repo-snapshot.ts uses path.resolve(process.cwd(), "..", "..")

When the work is implemented, add short terminal transcripts here that prove:

    bun run sbs --help
    bun run sbs init
    bun run sbs review
    bun run sbs generate repo --out ./tmp/sbs-cli-repo

The final transcript should show the generated output path and the slugified repo folder name.

## Interfaces and Dependencies

The CLI must depend on `@manmeetsai/packet-compiler` for the canonical project definition types, the stage definitions, readiness evaluation, and packet and repo generation entry points. The implementer should not re-declare `CanonicalProjectFactKey`, `PacketStageDefinition`, or readiness rules inside the CLI package. If the CLI needs field labels or input kinds, those should come from a shared helper module moved into `packages/packet-compiler/src/` or into a new shared package under `packages/`.

The new package should live at `packages/ship-by-sunday-cli/` and should follow the same tooling pattern as the other TypeScript package in this repo: Bun for execution, TypeScript for types, Oxlint and Oxformat for lint and formatting, and Vitest for focused tests. The root `package.json` should expose a simple `sbs` script so the user runs the CLI from the repository root with `bun run sbs ...`.

The CLI storage interface should be explicit and small. At minimum, it needs a local draft loader, local draft saver, import command, export command, and generation command interface. The draft data should use the canonical draft shape returned by `createCanonicalProjectDefinitionDraft()` so the CLI and the web flow stay interoperable at the data boundary even if they persist state differently.

The compiler package will need a repo-root interface that works in both web and CLI contexts. The cleanest acceptable shape is either a helper such as `resolveRepoRootPath()` consumed by template and snapshot loaders, or explicit optional parameters such as `repoRootPath` passed into the rendering and snapshot entry points. Choose one approach and apply it consistently. The important constraint is that `bun run sbs` from the repository root must load `docs/openai/*`, `docs/prompts/*`, and the tracked starter repo inputs correctly.
