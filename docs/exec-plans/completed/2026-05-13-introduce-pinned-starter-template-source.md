---
title: Introduce Pinned Starter Template Source
status: complete
created_at: 2026-05-13
completed_at: 2026-05-13
summary: Establish a repo-local pinned Starter template source boundary that future generator work can consume deterministically.
post_build_recap: Imported the sibling Starter skeleton into a repo-local source snapshot, pinned it by manifest digest, documented ownership and overlay rules, and added compiler-side validation plus tests.
program_id: starter-template-source-and-billing-proof
planning_brief: docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/planning-brief-2.md
read_when:
  - Resuming the pinned Starter template-source slice.
  - Updating the Starter template source snapshot.
  - Changing generated repo overlay or provenance rules.
---

# Introduce Pinned Starter Template Source

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Generated Starter repos need an ordinary source tree that can be audited, versioned, and improved like normal app code. Today, the app portion is still rendered by TypeScript string builders, which makes future app-template work brittle and encourages template behavior to live inside generator code. After this slice, the repository has a pinned `templates/starter-app/source` snapshot seeded from the sibling Next.js, Convex, Clerk, and Stripe skeleton, provenance metadata that records exactly what was imported, and compiler-side validation that proves the boundary is deterministic.

This slice does not switch customer downloads to the new template source. The user-visible result is a clear, validated source boundary that future slices can consume without reading `~/Developer/next-js-convex-clerk-stripe-template` at generation time.

## Progress

- [x] 2026-05-13 EDT: Created this child ExecPlan from `planning-brief-2.md`.
- [x] 2026-05-13 EDT: Read root `AGENTS.md`, `docs/exec-plans/PLANS.md`, `docs/programs/PROGRAMS.md`, `packages/codebase-compiler/AGENTS.md`, the current Program brief, current generator materialization code, and the sibling template's `AGENTS.md` and `README.md`.
- [x] 2026-05-13 EDT: Inspected the sibling source seed read-only and confirmed it is a local directory snapshot without a `.git` repository.
- [x] 2026-05-13 EDT: Imported the pinned sibling template source into `templates/starter-app/source` with dependency installs, git metadata, build output, and local env files excluded.
- [x] 2026-05-13 EDT: Added `templates/AGENTS.md`, `templates/starter-app/README.md`, and `templates/starter-app/template-source.json` with source provenance, digest, required files, excluded artifacts, and generated-overlay rules.
- [x] 2026-05-13 EDT: Added compiler-side validation in `packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts` and exported it through `packages/codebase-compiler/src/server.ts`.
- [x] 2026-05-13 EDT: Added `packages/codebase-compiler/tests/starter-template-source-contract.test.ts` to prove the manifest digest, expected architecture files, excluded local artifacts, and overlay boundary.
- [x] 2026-05-13 EDT: Validation passed: `bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts`.
- [x] 2026-05-13 EDT: Validation passed: `bun run --cwd packages/codebase-compiler typecheck`.
- [x] 2026-05-13 EDT: Validation passed: `bun run --cwd packages/codebase-compiler format:check` and `bun run --cwd packages/codebase-compiler lint`.
- [x] 2026-05-13 EDT: Validation passed: `bun run --cwd packages/codebase-compiler test`.
- [x] 2026-05-13 EDT: Validation passed: `bun run lint`, `bun run format:check`, `DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck`, and `bun run test:packages`.
- [x] 2026-05-13 EDT: Closeout limitation recorded: this checkout does not define a root `proof:ci` script, so that named gate could not run.
- [x] 2026-05-13 EDT: Updated the Program ledger and advanced the current planning brief to generator migration.

## Surprises & Discoveries

- 2026-05-13 EDT: `~/Developer/next-js-convex-clerk-stripe-template` is not a Git checkout. The pinned boundary therefore needs to pin by committed content digest, source path hint, capture date, and source inventory rather than by git commit.
- 2026-05-13 EDT: The sibling source seed has 131 non-`node_modules` files. That is small enough to import as a repo-local source snapshot in this slice without copying dependency installs or mutable build output.

## Decision Log

Decision: Store the customer-shaped template repo at `templates/starter-app/source`.
Rationale: The Program decided the template source belongs under `templates/starter-app/`, but provenance and ownership docs should live beside the source rather than inside the customer repo that future generator code copies.
Date: 2026-05-13

Decision: Pin the initial source snapshot by content digest instead of git commit.
Rationale: The sibling seed directory has no `.git` metadata. A deterministic digest over every file in `templates/starter-app/source` gives future agents an auditable pin and forces manifest updates when the snapshot changes.
Date: 2026-05-13

Decision: Validate the source boundary without changing `materializeRepoSnapshot` yet.
Rationale: Planning brief 2 asks for the template-source boundary before generator migration or ChatGPT implementation. Keeping current generated output unchanged avoids mixing source import, generator copy semantics, and product-domain migration in one slice.
Date: 2026-05-13

## Outcomes & Retrospective

This plan is complete. The repository now has a pinned Starter template source boundary at `templates/starter-app/source`, seeded from the sibling skeleton and pinned by a deterministic `contentDigest` in `templates/starter-app/template-source.json`. The source snapshot contains the sibling app architecture, including root package scripts, `src/` route groups, provider boundaries, Convex modules, billing routes, auth routes, docs, tests, and public assets, while excluding dependency installs, build output, git metadata, and local env files.

The source seed was a local directory snapshot rather than a Git checkout, so the durable pin is content-based. Future updates must modify the committed snapshot, update the manifest file count and digest, and rerun the compiler contract tests. Generated customer downloads still use the existing renderer path; that is intentional. The next slice should migrate generator materialization to consume this source snapshot before applying generated overlays.

## Context and Orientation

The current generated repo path starts in `packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts`. It builds a generation manifest, copies selected customer-safe files from this repo, renders generated template app files through `render-generated-template-app-files.ts`, renders generated design-system files, renders generalized starter files, and appends generated Codebase docs.

The new boundary introduced by this plan is separate from that live path. `templates/starter-app/source` will hold a repo-shaped snapshot of the sibling skeleton. `templates/starter-app/template-source.json` will record provenance, content digest, source root, key file expectations, and generated-overlay policy. `packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts` will validate that metadata and source tree so future generator work has a typed boundary to consume.

For this plan, "template source" means the repo-shaped source snapshot that future generated repos can start from. "Generated overlays" means files the generator is allowed to write over the template source, such as generated product facts, docs, Program material, ExecPlans, skills, product config, homepage copy, design-system output, and validation scripts.

### In Scope

This plan includes importing the sibling source seed into `templates/starter-app/source`, adding template-source provenance metadata, documenting ownership and update rules, defining generated-overlay rules, adding compiler-side validation helpers and tests, and updating the owning Program packet.

### Out Of Scope

This plan does not fetch mutable remote source, change the sibling template repository, implement the ChatGPT-style app, rename or remove the sibling Notes sample, change generated customer downloads to use the new template source, alter current generated repo output, add provider setup plans, or run live provider proof.

## Plan of Work

First, mechanically import the sibling template source from `~/Developer/next-js-convex-clerk-stripe-template` into `templates/starter-app/source`, excluding `node_modules`, `.git`, build output, local env files, and other machine-local artifacts. The imported source should remain repo-shaped, including root package files, `src/`, `convex/`, `public/`, and `.github/`.

Next, add template ownership docs. `templates/AGENTS.md` should explain that template files are not runtime app code and must not read from sibling paths at generation time. `templates/starter-app/README.md` should explain the source layout, provenance, update workflow, generated-overlay policy, and validation commands.

Then, add `templates/starter-app/template-source.json` with schema version `starter-template-source.v1`, source root `templates/starter-app/source`, the origin path hint, capture date, file count, content digest, required source files, excluded path segments, and generated-overlay policy.

After that, add a compiler-side contract module and tests. The module should load and validate the manifest, list the source files deterministically, compute the same content digest recorded in the manifest, reject forbidden local artifacts, and expose the allowed overlay paths. Tests should prove the source tree exists, contains the expected sibling architecture files, excludes mutable local artifacts, and matches the manifest digest.

Finally, update the Program ledger and current planning brief. The next slice after this one should be generator migration: using the pinned source as the input before applying current generated overlays, while preserving clean-room generated repo proof.

## Milestones

The first milestone is source import. It is complete when `templates/starter-app/source` exists, contains the expected sibling skeleton files, and excludes dependency installs and local env files.

The second milestone is provenance and docs. It is complete when the template manifest and docs tell future agents where the source lives, where it came from, how it is pinned, which overlays are allowed, and how to update it.

The third milestone is compiler validation. It is complete when package tests load the manifest, compute the content digest, assert key files, and reject local artifact paths.

The fourth milestone is Program closeout. It is complete when validation evidence is recorded, the ExecPlan is completed, and the Program current brief advances to the generator-migration slice.

## Concrete Steps

From the repository root, inspect the current source and generator surfaces:

    sed -n '1,220p' packages/codebase-compiler/src/repo-generation/materialize-repo-snapshot.ts
    sed -n '1,220p' packages/codebase-compiler/src/repo-generation/repo-download-source-contract.ts
    find /Users/bazelrex/Developer/next-js-convex-clerk-stripe-template -path '*/node_modules' -prune -o -type f -print | wc -l

Import the source snapshot mechanically, then compute the deterministic digest and write the manifest. Add or update:

    templates/AGENTS.md
    templates/starter-app/README.md
    templates/starter-app/template-source.json
    templates/starter-app/source/**
    packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts
    packages/codebase-compiler/tests/starter-template-source-contract.test.ts

Run focused validation first:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts
    bun run --cwd packages/codebase-compiler typecheck

Run planning and docs validation:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-introduce-pinned-starter-template-source.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-introduce-pinned-starter-template-source.md docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/program.md docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/planning-brief-2.md docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/planning-brief-3.md templates/AGENTS.md templates/starter-app/README.md

Before completion, run:

    bun run --cwd packages/codebase-compiler format:check
	bun run --cwd packages/codebase-compiler lint
	bun run lint
	bun run format:check
	DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
	bun run test:packages
	git diff --check

## Validation and Acceptance

The implementation is accepted when `templates/starter-app/source` is a repo-shaped source snapshot, `templates/starter-app/template-source.json` pins that snapshot by deterministic digest, docs explain the ownership and update contract, and compiler tests prove the manifest and source tree agree.

The generated customer repo output must not change in this slice. If a test shows generated output changed, stop and remove the migration behavior from this plan.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd packages/codebase-compiler test -- tests/starter-template-source-contract.test.ts
    bun run --cwd packages/codebase-compiler typecheck
    bun run --cwd packages/codebase-compiler format:check
	bun run --cwd packages/codebase-compiler lint
	bun run lint
	bun run format:check
	DISABLE_POSTHOG_SOURCE_MAP_UPLOAD=1 bun run typecheck
	bun run test:packages
	bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-13-introduce-pinned-starter-template-source.md
	bun run programs:lint
	bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-13-introduce-pinned-starter-template-source.md docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/program.md docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/planning-brief-2.md docs/programs/active/2026-05-13-starter-template-source-and-billing-proof/planning-brief-3.md templates/AGENTS.md templates/starter-app/README.md
	git diff --check

## Idempotence and Recovery

The import step is safe to repeat if it continues to exclude dependency installs, local env files, and build output. If the source snapshot changes, recompute the digest and update `template-source.json` in the same change. If validation fails because the content digest does not match, inspect whether a source file changed intentionally; update the manifest only after confirming the change belongs to the pinned snapshot.

Do not repair failures by reading the sibling path at generation time. The generator should eventually consume committed files under `templates/starter-app/source`, not a mutable workstation path.

## Artifacts and Notes

Sibling source seed:

    /Users/bazelrex/Developer/next-js-convex-clerk-stripe-template

Expected key imported paths:

    templates/starter-app/source/package.json
    templates/starter-app/source/src/app/(marketing)/page.tsx
    templates/starter-app/source/src/app/(app)/notes/page.tsx
    templates/starter-app/source/src/app/api/billing/checkout/route.ts
    templates/starter-app/source/convex/schema.ts
    templates/starter-app/source/convex/notes.ts

## Interfaces and Dependencies

The durable interface introduced by this plan is `starter-template-source.v1` in `templates/starter-app/template-source.json`, plus the compiler-side validation helpers in `packages/codebase-compiler/src/repo-generation/starter-template-source-contract.ts`. Future generator migration should depend on those helpers instead of hard-coding source paths or reading the sibling template directory.
