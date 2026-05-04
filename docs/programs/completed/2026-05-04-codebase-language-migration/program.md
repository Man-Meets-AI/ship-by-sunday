---
program_id: codebase-language-migration
title: Codebase Language Migration
status: complete
created_at: 2026-05-04
completed_at: 2026-05-04
summary: Complete the direct repo rename to the codebase noun family across docs, paths, packages, generated output, and Program packets.
post_build_recap: Current Program packets, public blog copy, compiler-generated customer output, package presentation copy, generated mirror checks, Program lint, and focused app/compiler tests now use Codebase as the primary product noun.
read_when:
  - Resuming the codebase language rename.
  - Deciding whether a docs, Program, package, generated-output, route, or public-copy surface is still allowed to use non-codebase language.
  - Fixing path, title, frontmatter, mirror, or lint drift after the direct rename.
---

# Codebase Language Migration

This Program is a living initiative document. Update it whenever a child slice lands, the ordering changes, or validation changes the durable truth.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday now names the delivered artifact plainly: a codebase. The canonical noun is `codebase`, with `agent-ready codebase` available when public copy needs the value made explicit.

This Program is not an alias migration. It records and coordinates a direct non-compatible rename of the old noun family to `codebase`, `Codebase`, and `CODEBASE` as appropriate for prose, TypeScript, paths, package names, generated output, and environment-style constants. The work is complete only when current repo truth surfaces stop teaching or preserving the prior noun as a supported contract.

The initiative is moving in the right direction when active docs, Program packets, source docs, generated mirrors, route/package references, tests, and operator instructions all agree on `codebase`; path/title/frontmatter lint passes after renamed files move; and any remaining non-codebase language is limited to immutable provenance that a source document cannot truthfully rewrite.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/completed/2026-05-04-codebase-language-migration/`.

The runtime and web-app contract research is recorded in `research-pass-runtime-contracts.md`. The package, compiler, and generated-output research is recorded in `research-pass-package-generated-output.md`. The public and go-to-market language research is recorded in `research-pass-public-language.md`. The normalized direct contract track is `normalized-pass-direct-contract-rename.md`. The normalized product-language track is `normalized-pass-product-language.md`. The initiative decision is in `converged-decision-packet.md`. The ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. The risk review is in `cross-repo-review.md`. The current immutable implementation brief is `planning-brief-1.md`, and `current-planning-brief.txt` points at that brief.

## Current State

The direct Codebase language migration is complete at the Program level. Current route, package, compiler, Convex, generated-doc, and test surfaces use codebase-named files and identifiers, including `apps/web/app/(workspace)/codebase`, `apps/web/lib/codebase-flow`, `apps/web/convex/codebase.ts`, `packages/codebase-compiler`, `packages/codebase-presentation`, `docs/generated/openai-codebase`, and `docs/generated/ship-by-sunday-codebase`.

The final cleanup removed remaining current-language drift in public blog copy, generated Codebase README labels, generated customer onboarding copy, Codebase presentation placeholders, compiler fixture defaults, and tests that still asserted the old customer-facing language.

Root `README.md`, root `DESIGN.md`, active repo instructions, `docs/`, source instruction packs under `docs/openai/` and `docs/ship-by-sunday/`, generated mirrors under `docs/generated/`, Program packets, active ExecPlans, package docs, and public-readiness rules are current-truth surfaces. They use Codebase as the canonical product noun where they describe the delivered artifact.

Historical release evidence, original transcript source, completed planning records, compatibility-sensitive implementation identifiers, and source-pack folder names can retain older wording when rewriting would falsify provenance or break a real compatibility surface. They do not define the current product noun.

## Progress

- [x] 2026-05-04: Created the Codebase Language Migration Program packet from local repo scans and four read-only explorer passes.
- [x] 2026-05-04: Confirmed the rename touches public copy, web routes, Convex contracts, compiler packages, generated customer output, docs mirrors, tests, and release proof.
- [x] 2026-05-04: Reframed the Program as a direct non-compatible rename to `codebase`, not a staged alias migration.
- [x] 2026-05-04: Landed the docs and Program packet coherence slice inside docs-owned paths.
- [x] 2026-05-04: Validated Program lint, Program markdown metadata, generated mirror sync, and the owned-docs scan for lingering non-codebase noun matches.
- [x] 2026-05-04: Created and executed the final public/generated-output cleanup ExecPlan at `docs/exec-plans/completed/2026-05-04-codebase-language-final-output-cleanup.md`.
- [x] 2026-05-04: Replaced remaining primary customer-facing old-language assertions in public blog copy, generated Codebase materials labels, generated onboarding copy, compiler fixture defaults, package presentation placeholders, and focused tests.
- [x] 2026-05-04: Validated focused app blog/state tests, focused compiler renderer/generation/readiness tests, package presentation typecheck, public-readiness lint, generated-doc mirror sync, ExecPlan lint, Program lint, markdown metadata, and `git diff --check`.

## Decision Log

Decision: Use `codebase` as the canonical noun.
Rationale: The delivered object is literally a codebase. `Agent-ready codebase` is the external phrase when the buyer needs the value made explicit. Current public and internal surfaces should not preserve an older product noun.
Date: 2026-05-04

Decision: Treat this as a direct non-compatible rename.
Rationale: The user directive is to finish the rename, not design a compatibility window. Current code, docs, package paths, generated mirrors, and tests should converge on codebase names and prove the moved surfaces directly.
Date: 2026-05-04

Decision: Fix path, title, and frontmatter drift as part of the rename.
Rationale: Mechanical path renames can leave Program indexes, ExecPlan titles, summaries, `read_when` entries, and generated mirror names inconsistent. Those failures are part of the rename, not separate cleanup.
Date: 2026-05-04

Decision: Source and generated docs must move together.
Rationale: `docs/generated/**` is an enforced mirror surface. A generated file rename or content rename is valid only when the source or generation path produces the same result.
Date: 2026-05-04

Decision: Preserve provenance only where it is genuinely source evidence.
Rationale: Original transcripts and release evidence may need to retain historical wording. Active docs, Program packets, package docs, generated customer docs, and current operator instructions are not provenance exceptions.
Date: 2026-05-04

Decision: Preserve compatibility-sensitive implementation names while fixing visible output language.
Rationale: Local skill trigger names such as `$starter-core-setup`, source-pack folder names, and existing helper identifiers are compatibility surfaces. The final cleanup changed the customer-facing noun without widening into a behavioral rename of those contracts.
Date: 2026-05-04

## Slice Ledger

Completed child ExecPlan: `docs/exec-plans/completed/2026-05-04-codebase-language-final-output-cleanup.md`.

Slice 1 was the docs and Program packet coherence slice. It updated Program packet language, Program indexes, root docs, source docs, generated mirrors, and frontmatter/path references so they describe the direct codebase rename and pass Program, markdown, and generated-doc validation.

Slice 2 was the final public/generated-output cleanup. It updated public blog copy, generated Codebase materials labels, generated customer onboarding copy, compiler fixture defaults, package presentation placeholders, and focused tests.

Generated-output proof passed through `bun run docs:generated:check` and focused compiler renderer/generation tests.

The historical/provenance audit resolved to preserve original transcripts, completed historical planning records, source-pack folder names, and compatibility-sensitive implementation identifiers where rewriting would falsify evidence or break an existing contract.

## Next Slice

No required next slice remains inside this Program. Future product work can still rename compatibility-sensitive implementation identifiers, but that would be a separate behavioral contract change rather than required Codebase Language Migration completion.

## Risks and Watchpoints

Do not reintroduce an alias plan. The rename target is codebase, and validation should prove the new names directly.

Do not treat compatibility-sensitive implementation names as permission to reintroduce the older product noun in public copy or generated customer output.

Do not edit generated mirrors alone. If `docs:generated:check` reports drift, update the source or generation path when it is inside the owned docs surface; otherwise report the owning path.

Do not use completed historical evidence as a reason to keep current docs stale. Active docs and Program packets should describe the current codebase vocabulary.

Do not touch `.worktrees/`.

## Outcomes & Retrospective

This Program completed the direct Codebase language migration on 2026-05-04.

The work first made the Program packet and docs-owned truth surfaces coherent with the direct non-compatible rename. The final child ExecPlan then removed the remaining current-language drift from the public blog, generated Codebase materials label, generated customer README and onboarding copy, compiler default facts, package presentation placeholders, and focused tests.

The main lesson was that broad mechanical renames can pass structural lint while product-language drift remains in generated output and tests. The durable fix is to pair Program lint and generated mirror checks with targeted scans over current public copy and compiler-generated customer text.

Intentionally preserved older wording is limited to provenance records, source-pack folder names, local skill trigger names, and compatibility-sensitive implementation identifiers. Those names do not define the buyer-facing product noun.

## Validation and Acceptance

At Program completion, active docs and Program packets should state that the direct codebase rename is the current contract.

Path/title/frontmatter lint must pass for renamed Program docs and docs indexes.

Generated source and mirror docs must agree. If generated docs moved or changed, `bun run docs:generated:check` must pass or the remaining source/generation owner must be named explicitly.

The completion gates passed on 2026-05-04: focused app tests, focused compiler tests, package presentation typecheck, public-readiness lint, generated-doc mirror check, ExecPlan lint, Program lint, markdown metadata lint, and `git diff --check`.

## Artifacts and Notes

Useful current search anchors:

- `Codebase Language Migration`
- `docs/generated/ship-by-sunday-codebase`
- `docs/generated/openai-codebase`
- `packages/codebase-compiler`
- `packages/codebase-presentation`

Four read-only explorer passes originally fed this Program:

- runtime/web app scan for routes, Convex, auth, checkout, localStorage, tests, and release proof
- package/compiler scan for workspace package identity, TypeScript exports, generated output, and customer snapshot contracts
- public language scan for README, homepage, blog, docs, generated mirrors, public-readiness lint, and review/download copy
- migration sequencing scan for ordering, non-goals, and validation gates

Validation recorded on 2026-05-04:

- owned-docs old noun scan: no matches
- `bun run programs:lint`: pass
- `bun run markdown:lint -- --paths docs/programs`: pass
- `bun run docs:generated:check`: pass

Final validation recorded on 2026-05-04:

- targeted public/generated-output old noun scan: no matches in the final cleanup write set
- `bun run --cwd apps/web test:unit -- tests/unit/blog-metadata.test.ts tests/unit/blog-structured-data.test.ts tests/unit/blog-posts.test.ts tests/unit/codebase-page-state-model.test.ts tests/unit/use-codebase-page-state.test.tsx`: pass
- `bun run --cwd packages/codebase-compiler test -- codebase-renderers.test.ts repo-generation.test.ts canonical-project-definition.test.ts codebase-field-helpers.test.ts readiness.test.ts`: pass
- `bun run --cwd packages/codebase-presentation typecheck`: pass
- `bun run public-readiness:lint`: pass
- `bun run docs:generated:check`: pass
- `bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-04-codebase-language-final-output-cleanup.md`: pass after completion move
- `bun run programs:lint`: pass before completion move

## Interfaces and Dependencies

The Program depends on root docs, Program and ExecPlan lint, source docs under `docs/openai/` and `docs/ship-by-sunday/`, generated mirrors under `docs/generated/`, package docs under `packages/codebase-*`, the App Router workspace journey, Convex hosted data, generated Convex API types, compiler package exports, release proof, and root repo validation gates.

The key docs-owned interfaces are `README.md`, `DESIGN.md`, `AGENTS.md`, `GEMINI.md`, `CHANGELOG.md`, `todo.md`, `docs/index.md`, `docs/programs/**`, `docs/exec-plans/**`, `docs/openai/**`, `docs/ship-by-sunday/**`, and `docs/generated/**`.
