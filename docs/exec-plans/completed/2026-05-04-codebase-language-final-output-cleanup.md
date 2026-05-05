---
title: Codebase Language Final Output Cleanup
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Finish the remaining public and generated-output language cleanup so Codebase is the primary customer-facing noun.
post_build_recap: Public blog copy, compiler-generated Codebase output, package presentation placeholders, and focused tests now use Codebase as the primary customer-facing noun while preserving compatibility-sensitive implementation names.
program_id: codebase-language-migration
planning_brief: docs/programs/completed/2026-05-04-codebase-language-migration/planning-brief-1.md
read_when:
  - Finishing the Codebase Language Migration Program.
  - Updating public blog copy or generated customer Codebase output labels.
  - Checking why starter-named implementation details were not broadly renamed in this final cleanup.
---

# Codebase Language Final Output Cleanup

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday now sells and produces one customer-facing Codebase. The remaining program evidence showed that the docs gates already pass, but the public blog and generated customer output still present older phrases such as agent-ready packs and starter repo as the thing the customer receives. After this slice, the public article, generated Codebase README, generated onboarding copy, and codebase field placeholders should describe the delivered object as a Codebase, while keeping compatibility-sensitive implementation names such as `$starter-core-setup` untouched.

The observable outcome is simple: a targeted current-language scan no longer finds old customer-facing primary nouns in public blog copy, generated Codebase README/onboarding output, or Codebase intake placeholders; focused blog and compiler tests pass; and the owning Program can move to `docs/programs/completed/`.

## Progress

- [x] 2026-05-04 EDT: Created this final child ExecPlan from the active Codebase Language Migration Program.
- [x] 2026-05-04 EDT: Inspected the active Program packet, public language research, package/generated-output research, runtime contract research, app instructions, compiler instructions, root design guidance, Program lint, markdown lint, generated mirror check, and public-readiness lint before editing.
- [x] 2026-05-04 EDT: Updated public blog copy and tests so the article uses agent-ready Codebase language as the primary noun.
- [x] 2026-05-04 EDT: Updated generated customer Codebase output labels and onboarding copy without renaming compatibility-sensitive skill or file identifiers.
- [x] 2026-05-04 EDT: Ran focused blog, compiler, public-readiness, generated-doc, Program, plan, markdown, and diff validation.
- [x] 2026-05-04 EDT: Completed this ExecPlan and moved the owning Program to completed with a retrospective.

## Surprises & Discoveries

The initial Program gates already passed: `bun run programs:lint`, `bun run markdown:lint -- --paths docs/programs`, `bun run docs:generated:check`, and `bun run public-readiness:lint`. Targeted scans still found current public blog copy and generated output using older primary nouns, so the Program was not truthfully complete yet.

## Decision Log

Decision: Keep this slice to visible product language and generated customer copy.
Rationale: Function names, file names, package-local helper names, and local skill trigger names such as `$starter-core-setup` are implementation contracts and compatibility surfaces. Renaming them would broaden the slice without improving the customer-facing Codebase noun.
Date: 2026-05-04

Decision: Use Codebase language for the delivered object and use materials or guides for docs inside that Codebase.
Rationale: The Program's vocabulary rule allows design, marketing, build, and prompt materials as contents, but not agent-ready packs as the primary product noun.
Date: 2026-05-04

## Outcomes & Retrospective

This plan completed the final Codebase Language Migration cleanup. Public blog copy now frames the buyer-facing output as an agent-ready Codebase. Compiler-generated customer output now labels the delivered docs as Codebase Materials and describes onboarding, assistant guides, snapshot reasons, and setup instructions around the Codebase noun. Package presentation placeholders now say Codebase for the generated artifact.

The cleanup intentionally preserved compatibility-sensitive implementation names, including `$starter-*` local skill trigger names, source-pack folder names, and helper identifiers. The owning Program moved to `docs/programs/completed/2026-05-04-codebase-language-migration/`.

## Context and Orientation

The public blog lives at `apps/web/content/blog/the-operating-system-beats-the-prompt.mdx` and is covered by unit tests under `apps/web/tests/unit/blog-*.test.ts`. It is current buyer-facing copy, so it should not call agent-ready packs or a starter path the primary product outcome.

The compiler-generated customer output is produced under `packages/codebase-compiler/src/`. The most relevant files are `src/public-artifact-contract.ts`, `src/codebases/render-codebase-readme.ts`, `src/repo-generation/render-template-overrides.ts`, `src/repo-generation/render-generalized-starter-files.ts`, and `src/repo-generation/render-starter-project-onboarding.ts`. Those render strings that appear in the downloaded customer Codebase. The UI field copy in `packages/codebase-presentation/src/index.ts` supplies user-facing placeholders for Codebase intake.

Generated mirror docs under `docs/generated/**` are checked by `bun run docs:generated:check`, but this slice should not hand-edit generated mirrors. If source docs change, generated mirrors must still agree with source.

### In Scope

This plan includes public blog language, generated Codebase README copy, generated onboarding and assistant-guide copy, Codebase intake field placeholders, public artifact labels, tests that assert those strings, the final Program update, and the Program folder move to completed.

### Out Of Scope

This plan does not rename package files, helper functions, local skill trigger names, stage ids, route literals, Convex schemas, generated API namespaces, docs/source pack folder names, or historical/provenance records. It also does not change checkout, auth, entitlement, route behavior, generated archive format, or customer-safe snapshot file inclusion.

## Plan of Work

First update the public blog copy so the description, summary, headings, image alt text, body paragraphs, and captions use `Codebase`, `agent-ready Codebase`, `Codebase docs`, or `Codebase path` where the text means the delivered product. Keep the article's point intact: Ship by Sunday turns product truth into a durable codebase that agents can use.

Next update compiler public labels and generated README copy. Rename the public artifact label constant from an agent-ready packs label to a Codebase materials label, and make `renderCodebaseReadme` describe Design, Marketing, Build, and prompt materials as files inside the Codebase rather than separate packs as the product outcome.

Then update generated onboarding copy. In `render-template-overrides`, `render-generalized-starter-files`, and `render-starter-project-onboarding`, replace customer-facing phrases such as downloaded starter, starter repo, and starter path with downloaded Codebase, generated Codebase, or shipped Codebase. Preserve `$starter-*` skill names and implementation identifiers because those are existing generated skill contracts.

After that, update Codebase intake presentation placeholders in `packages/codebase-presentation/src/index.ts` so default examples say `Download the Codebase` and `AI-generated Codebase`. Update focused tests for changed expected strings, then run validation.

Finally update this ExecPlan to complete, update `program.md` with final status and retrospective, move the Program folder from active to completed, and update Program indexes.

## Milestones

The first milestone is public copy cleanup. It is complete when the blog article and blog tests no longer use agent-ready packs or starter path as the primary product outcome.

The second milestone is generated output cleanup. It is complete when the generated README, START-HERE content, generated app docs index, assistant guides, and Codebase presentation placeholders use Codebase language for customer-facing nouns while preserving local skill trigger names.

The third milestone is Program closure. It is complete when focused validation passes, this ExecPlan is complete, the Program has `status: complete`, `completed_at: 2026-05-04`, a real retrospective, and the folder lives under `docs/programs/completed/2026-05-04-codebase-language-migration/`.

## Concrete Steps

From the repo root, inspect the target files before editing:

    sed -n '1,140p' apps/web/content/blog/the-operating-system-beats-the-prompt.mdx
    sed -n '1,120p' packages/codebase-compiler/src/public-artifact-contract.ts
    sed -n '1,120p' packages/codebase-compiler/src/codebases/render-codebase-readme.ts
    sed -n '1,120p' packages/codebase-compiler/src/repo-generation/render-template-overrides.ts
    sed -n '1,380p' packages/codebase-compiler/src/repo-generation/render-starter-project-onboarding.ts
    sed -n '1,220p' packages/codebase-presentation/src/index.ts

After implementation, run focused tests and lint first:

    bun run --cwd apps/web test:unit -- tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-posts.test.ts
    bun run --cwd packages/codebase-compiler test -- codebase-renderers.test.ts repo-generation.test.ts
    bun run --cwd packages/codebase-presentation typecheck

Then run Program and docs validation:

    bun run public-readiness:lint
    bun run docs:generated:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-codebase-language-final-output-cleanup.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-codebase-language-final-output-cleanup.md docs/programs
    git diff --check

## Validation and Acceptance

This slice is accepted when current public blog copy and generated customer-facing output use Codebase language as the primary noun, focused tests pass, docs generated mirrors remain synced, and Program lint accepts the completed Program after it moves to `docs/programs/completed/`.

Compatibility-sensitive implementation names may remain when they are local skill names, file names, package helper names, or source-pack folder names rather than the product noun shown to buyers.

### Test Commands

Run these commands from the repo root:

    bun run --cwd apps/web test:unit -- tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-posts.test.ts
    bun run --cwd packages/codebase-compiler test -- codebase-renderers.test.ts repo-generation.test.ts
    bun run --cwd packages/codebase-presentation typecheck
    bun run public-readiness:lint
    bun run docs:generated:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-codebase-language-final-output-cleanup.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-codebase-language-final-output-cleanup.md docs/programs
    git diff --check

## Idempotence and Recovery

All edits are source text and tests. If a string change breaks a snapshot-style expectation, update the expectation only when the new wording reflects the Codebase contract. If generated docs drift, do not edit `docs/generated/**` alone; update the matching source or record the owning source path.

If the Program cannot move because validation finds unrelated active Program or ExecPlan drift, leave this plan and Program active, record the blocker with exact paths, and do not claim completion.

## Artifacts and Notes

Initial validation before this plan was created:

    bun run programs:lint: pass
    bun run markdown:lint -- --paths docs/programs: pass
    bun run docs:generated:check: pass
    bun run public-readiness:lint: pass

Targeted scans found current-language drift in:

    apps/web/content/blog/the-operating-system-beats-the-prompt.mdx
    packages/codebase-compiler/src/public-artifact-contract.ts
    packages/codebase-compiler/src/codebases/render-codebase-readme.ts
    packages/codebase-compiler/src/repo-generation/render-template-overrides.ts
    packages/codebase-compiler/src/repo-generation/render-generalized-starter-files.ts
    packages/codebase-compiler/src/repo-generation/render-starter-project-onboarding.ts
    packages/codebase-presentation/src/index.ts

Final validation passed:

    targeted public/generated-output old noun scan
    bun run --cwd apps/web test:unit -- tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-posts.test.ts tests/unit/codebase-page-state-model.test.ts tests/unit/use-codebase-page-state.test.tsx
    bun run --cwd packages/codebase-compiler test -- codebase-renderers.test.ts repo-generation.test.ts canonical-project-definition.test.ts codebase-field-helpers.test.ts readiness.test.ts
    bun run --cwd packages/codebase-presentation typecheck
    bun run public-readiness:lint
    bun run docs:generated:check
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-codebase-language-final-output-cleanup.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-04-codebase-language-final-output-cleanup.md docs/programs
    git diff --check

## Interfaces and Dependencies

This plan depends on the Codebase Language Migration Program at `docs/programs/completed/2026-05-04-codebase-language-migration/program.md`, the Program contract in `docs/programs/PROGRAMS.md`, the ExecPlan contract in `docs/exec-plans/PLANS.md`, app instructions in `apps/web/AGENTS.md`, compiler instructions in `packages/codebase-compiler/AGENTS.md`, public blog metadata tests, codebase compiler render tests, package presentation typecheck, `bun run docs:generated:check`, and `bun run public-readiness:lint`.
