---
program_id: codebase-language-migration
title: Codebase Language Migration
status: active
created_at: 2026-05-04
completed_at: null
summary: Complete the direct repo rename to the codebase noun family across docs, paths, packages, generated output, and Program packets.
post_build_recap: null
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

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-04-codebase-language-migration/`.

The runtime and web-app contract research is recorded in `research-pass-runtime-contracts.md`. The package, compiler, and generated-output research is recorded in `research-pass-package-generated-output.md`. The public and go-to-market language research is recorded in `research-pass-public-language.md`. The normalized direct contract track is `normalized-pass-direct-contract-rename.md`. The normalized product-language track is `normalized-pass-product-language.md`. The initiative decision is in `converged-decision-packet.md`. The ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. The risk review is in `cross-repo-review.md`. The current immutable implementation brief is `planning-brief-1.md`, and `current-planning-brief.txt` points at that brief.

## Current State

The worktree already contains the broad mechanical rename to codebase paths and names. Current route, package, compiler, Convex, generated-doc, and test surfaces are expected to use codebase-named files and identifiers, including `apps/web/app/(workspace)/codebase`, `apps/web/lib/codebase-flow`, `apps/web/convex/codebase.ts`, `packages/codebase-compiler`, `packages/codebase-presentation`, `docs/generated/openai-codebase`, and `docs/generated/ship-by-sunday-codebase`.

The active risk is coherence drift after that direct rename: packet files can still describe a staged migration, indexes can point at old titles, generated mirrors can fall out of sync with source docs, and renamed ExecPlans or Program artifacts can fail path/title/frontmatter lint even when the content looks mechanically correct.

Root `README.md`, root `DESIGN.md`, active repo instructions, `docs/`, source instruction packs under `docs/openai/` and `docs/ship-by-sunday/`, generated mirrors under `docs/generated/`, active Program packets, active ExecPlans, package docs, and public-readiness rules are current-truth surfaces. They should use the codebase noun directly.

Historical release evidence, original transcript source, and completed planning records can retain immutable facts when rewriting them would falsify provenance. They should not, however, present the prior noun as a current supported product or contract.

## Progress

- [x] 2026-05-04: Created the Codebase Language Migration Program packet from local repo scans and four read-only explorer passes.
- [x] 2026-05-04: Confirmed the rename touches public copy, web routes, Convex contracts, compiler packages, generated customer output, docs mirrors, tests, and release proof.
- [x] 2026-05-04: Reframed the Program as a direct non-compatible rename to `codebase`, not a staged alias migration.
- [x] 2026-05-04: Landed the docs and Program packet coherence slice inside docs-owned paths.
- [x] 2026-05-04: Validated Program lint, Program markdown metadata, generated mirror sync, and the owned-docs scan for lingering non-codebase noun matches.
- [ ] 2026-05-04: Refresh the Program with the next direct cleanup slice after app/package owners finish their source-owned rename work.

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

## Slice Ledger

No child ExecPlan exists yet for this Program.

Planned Slice 1 is the docs and Program packet coherence slice. It should update Program packet language, Program indexes, root docs, source docs, generated mirrors, and frontmatter/path references so they describe the direct codebase rename and pass Program, markdown, and generated-doc validation.

Planned Slice 2 is the active app/docs reference sweep. It should update any remaining current docs or public-copy references that still describe old names, while respecting the owned write sets of concurrent app and package workers.

Planned Slice 3 is generated-output proof. It should run the generator or mirror check that proves source docs and generated docs agree after the direct rename.

Planned Slice 4 is package and route lint cleanup. It should fix any package, route, test, or release-proof references that still fail validation after the direct rename, with package and app owners handling their own code paths.

Planned Slice 5 is historical/provenance audit. It should decide which remaining non-codebase strings are immutable evidence and which are accidental current-truth drift.

## Next Slice

The exact next recommended slice is the current public language enforcement slice.

This slice is next because the Program packet now states the direct rename contract. The next worker should make public-readiness and current public/operator docs enforce codebase language, while app/package source edits remain with their owning workers.

## Risks and Watchpoints

Do not reintroduce an alias plan. The rename target is codebase, and validation should prove the new names directly.

Do not edit app or package source from this docs-owned slice. Record remaining app/package issues rather than crossing ownership.

Do not edit generated mirrors alone. If `docs:generated:check` reports drift, update the source or generation path when it is inside the owned docs surface; otherwise report the owning path.

Do not use completed historical evidence as a reason to keep current docs stale. Active docs and Program packets should describe the current codebase vocabulary.

Do not touch `.worktrees/`.

## Outcomes & Retrospective

This Program is active. Fill this section after implementation with what changed, which validation passed, which generated mirrors were synchronized, and which remaining issues belong to app/package owners or immutable provenance.

The intended final state is a repo where current language, paths, generated docs, package docs, Program packets, and validation gates all use codebase as the canonical noun.

## Validation and Acceptance

At Program completion, active docs and Program packets should state that the direct codebase rename is the current contract.

Path/title/frontmatter lint must pass for renamed Program docs and docs indexes.

Generated source and mirror docs must agree. If generated docs moved or changed, `bun run docs:generated:check` must pass or the remaining source/generation owner must be named explicitly.

The required docs-level gates for this slice are `bun run programs:lint`, `bun run markdown:lint -- --paths docs/programs`, and `bun run docs:generated:check` when feasible.

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

## Interfaces and Dependencies

The Program depends on root docs, Program and ExecPlan lint, source docs under `docs/openai/` and `docs/ship-by-sunday/`, generated mirrors under `docs/generated/`, package docs under `packages/codebase-*`, the App Router workspace journey, Convex hosted data, generated Convex API types, compiler package exports, release proof, and root repo validation gates.

The key docs-owned interfaces are `README.md`, `DESIGN.md`, `AGENTS.md`, `GEMINI.md`, `CHANGELOG.md`, `todo.md`, `docs/index.md`, `docs/programs/**`, `docs/exec-plans/**`, `docs/openai/**`, `docs/ship-by-sunday/**`, and `docs/generated/**`.
