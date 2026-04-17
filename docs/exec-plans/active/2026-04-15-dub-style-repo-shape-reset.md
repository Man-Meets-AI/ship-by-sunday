---
title: Reshape The Repo Into A Dub-Style Monorepo Without Losing Feature Boundaries
status: active
created_at: 2026-04-15
completed_at: null
summary: Rebuild the workspace, package, app, and test topology so Ship by Sunday feels as legible and mechanically simple as Dub while preserving the repo's feature-based app structure and Convex architecture.
post_build_recap: null
read_when:
  - Resuming the Dub-style repo-shape migration.
  - Deciding where a new app, package, feature, or test should live.
  - Validating the final structural cutover.
---

# Reshape The Repo Into A Dub-Style Monorepo Without Losing Feature Boundaries

This document is a living execution plan for turning the current repository into a clearer Dub-style monorepo with a thinner root control plane, cleaner package seams, a more predictable app topology, and a domain-first test layout that a newcomer can navigate without memorizing repo lore.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Right now the repo is in an awkward middle state. It already has the beginnings of a good monorepo shape, with `apps/web` as the main app and a few focused packages, but it still feels harder to navigate than it should because orchestration is manual, package contracts are only partly explicit, some feature folders are disciplined while others are sprawling, and the app mixes a clean feature-local story with legacy pockets that behave like their own internal framework. After this plan lands, the repository should feel closer to `~/Developer/dub` in the ways that matter: one obvious root control plane, a small set of honest packages, a web app whose top-level folders are easy to explain, clear boundaries between app-local code and package code, and tests that mirror the product areas instead of fighting the directory structure.

The result is not meant to be a literal copy of Dub. The user-visible win is that a maintainer can open the repo and immediately answer five questions: where the real app lives, where reusable contracts live, where to add a new feature, where to put a new test, and which root commands prove the change. The change works when a newcomer can navigate the repo from the root tree and the package manifests alone, without needing a tour of `features/*`, generated docs, or old naming leftovers to orient themselves.

## Progress

- [x] 2026-04-15 18:38 EDT — Read the root planning contract, docs index, architecture docs, app-specific rules, and the long-horizon planning skill so this plan follows the repo’s live ExecPlan format instead of a generic migration memo.
- [x] 2026-04-15 18:47 EDT — Compared the live Ship by Sunday workspace tree against `~/Developer/dub`, including root package manifests, workspace wiring, `turbo.json`, app/package counts, test harness placement, and GitHub workflow shapes.
- [x] 2026-04-15 18:58 EDT — Gathered six parallel subagent reports: three on Dub’s workspace, test, and app topology, and three on Ship by Sunday’s workspace, test, and app topology.
- [x] 2026-04-15 19:06 EDT — Confirmed that the active plan `docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md` already owns the CI and test-harness simplification slice. This plan now treats that work as a dependency, not a duplicate.
- [ ] Freeze the target root tree, package inventory, naming rules, and “copy this / do not copy this” contract before any large move or rename starts.
- [ ] Add the Dub-style root control plane: `turbo.json`, shared package task contracts, a real `packages/tsconfig` workspace, and one non-drifting root verification surface.
- [ ] Normalize package boundaries so all cross-workspace imports use explicit package entrypoints, package ownership is documented, and thin packages are either justified or merged.
- [ ] Reshape `apps/web` around one consistent feature topology, including the `course` and `blueprint-flow` areas that currently carry legacy names and uneven internal conventions.
- [ ] Split the lesson and workbench monolith into smaller, domain-named subfeatures, lift fake “shared” helpers out of `course`, and make content and test locality consistent across major product areas.
- [ ] Update docs, starter-generator references, and verification scripts so the new tree becomes the taught, enforced, and tested shape instead of just the current working tree.

## Surprises & Discoveries

The biggest research outcome is that Dub is useful as a model mostly at the workspace layer, not as a literal app-internal folder template. Dub’s best ideas are the thin root control plane, explicit package exports, a dedicated `packages/tsconfig` workspace, app-local `tests/` plus `playwright/`, and a package inventory that can be explained in one pass. Its weaker traits are also clear in the code: `apps/web/lib` is a catch-all, `apps/web/ui` plus `packages/ui` creates a three-tier reuse model that leaks in practice, and the app reaches into package source internals such as `@dub/utils/src/*`. This plan should copy the clarity, not the leakage.

Ship by Sunday’s current top-level shape is better than it first appears. The route layer is already mostly thin, `platform/` is a good app-local exception to the feature rule, `components/ui/` is a clean primitive bucket, and the blueprint packages form a sensible dependency chain from compiler to presentation to CLI and app. The confusion mostly comes from inconsistency rather than total disorder.

The highest-entropy area is not the whole app. It is `apps/web/features/course/lesson`, which currently contains 303 files, and especially `apps/web/features/course/lesson/workbench`, which has become an internal subsystem with 253 files of its own. Several files in that subtree exceed the repo’s stated component-size and boundary rules, including `sketch-upload-workbench.tsx`, `prompt-import-card.tsx`, and `reference-gallery-field-control.tsx`. The plan should therefore treat the lesson/workbench area as a dedicated migration slice, not as incidental cleanup.

One important structural leak is already present across workspace boundaries: `apps/web/convex/blueprint/stageReadiness.ts` imports directly from `../../../../packages/blueprint-compiler/src` instead of through the package entrypoint. That is exactly the kind of shortcut that turns a monorepo into a filesystem maze. Fixing these leaks is part of the structural work, not optional polish.

The docs are currently out of sync with the actual workspace inventory. `README.md` and `docs/design-docs/workspace-layout.md` both describe `apps/web`, the compiler, and the CLI, but they omit `@shipbysunday/blueprint-presentation` even though it is a real workspace dependency. That omission makes the package set feel more ad hoc than it actually is.

The existing active plan `2026-04-15-dub-style-ci-cd-test-harness-reset.md` changes the sequencing here. Tests and CI should not be redesigned a second time in this plan. Instead, this plan must absorb that work as the control-plane baseline and then reshape the remaining repo topology around it.

One additional repo-specific dependency matters before implementation starts. Any edit to `apps/web/app/**`, `apps/web/next.config.ts`, or other Next-owned runtime files must first read the relevant guide under `apps/web/node_modules/next/dist/docs/`, because this repo is on Next 16.2.0 and the root `AGENTS.md` explicitly warns that older instincts are unsafe here. The plan therefore treats app-routing and Next-config edits as a later milestone after the root control plane and package seams are already stabilized.

Evidence from the research pass:

    Current root workspaces:
    - apps/web
    - packages/blueprint-compiler
    - packages/blueprint-presentation
    - packages/ship-by-sunday-cli

    Current largest app feature buckets by file count:
    - 345 apps/web/features/course
    - 39 apps/web/features/blueprint-flow
    - 28 apps/web/features/marketing
    - 24 apps/web/features/auth

    Current lesson subtree:
    - 303 files under apps/web/features/course/lesson

    Dub’s reusable workspace patterns:
    - root package.json + pnpm-workspace.yaml + turbo.json
    - packages/tsconfig for shared TypeScript presets
    - app-local apps/web/tests and apps/web/playwright
    - explicit exports in packages such as @dub/ui and @dub/utils

## Decision Log

Decision: treat Dub as a workspace and control-plane reference, not as an app-internal folder template.
Rationale: Dub’s strongest patterns are its thin root orchestration and explicit package seams. Its broad `lib/` and `ui/` buckets are not compatible with this repo’s feature-based standards.
Date/Author: 2026-04-15 / Codex

Decision: keep Convex app-local under `apps/web/convex` throughout this initiative.
Rationale: the user explicitly called out Convex as the exception, and the current architecture already treats Convex as part of the web app’s runtime boundary.
Date/Author: 2026-04-15 / Codex

Decision: add a real `turbo.json` and shared workspace task contract instead of continuing to hand-maintain root script chains.
Rationale: manual `bun run --cwd ...` orchestration is the clearest root cause of drift between root scripts, package scripts, and GitHub workflows.
Date/Author: 2026-04-15 / Codex

Decision: introduce a `packages/tsconfig/` workspace and retire the single loose `packages/tsconfig.base.json` file.
Rationale: Dub’s `packages/tsconfig` pattern is one of the cleanest transferable ideas in the sibling repo, and this repo already needs separate presets for the app, internal packages, and possibly future library packages.
Date/Author: 2026-04-15 / Codex

Decision: do not extract a `packages/ui` workspace in the first pass.
Rationale: there is only one runtime app today, `components/ui/` is already disciplined, and extracting a UI package now would be imitation without a real reuse boundary.
Date/Author: 2026-04-15 / Codex

Decision: keep the current blueprint package chain unless the migration proves a package is fake.
Rationale: `blueprint-compiler -> blueprint-presentation -> app/CLI` is a real dependency gradient. The problem is weak documentation and a few boundary leaks, not obviously the existence of the packages themselves.
Date/Author: 2026-04-15 / Codex

Decision: rename and reshape feature folders only where the names hide real ownership problems.
Rationale: the goal is clarity, not churn. `course` and `blueprint-flow` deserve scrutiny because they hide legacy or process-driven names, while smaller well-structured areas such as `marketing` and `docs` do not.
Date/Author: 2026-04-15 / Codex

Decision: fold the active Dub-style CI plan into this initiative as a prerequisite milestone rather than reopening the same test-harness debate.
Rationale: the repo already has live structural work in motion under that plan. This plan should sequence around it and then carry the workspace refactor forward.
Date/Author: 2026-04-15 / Codex

Decision: use an additive rename strategy with temporary compatibility barrels or shims for any large feature-path move.
Rationale: the highest-risk failure mode in this repo is breaking route, test, or generator imports during a broad directory rename. Temporary compatibility seams keep each migration slice reversible and testable.
Date/Author: 2026-04-15 / Codex

Decision: treat generated starter docs and generator-owned path references as first-class writeback surfaces.
Rationale: this repo ships part of its structure through generated starter output. A path rename is incomplete if the generated surfaces still teach the old tree.
Date/Author: 2026-04-15 / Codex

## Outcomes & Retrospective

This section will be filled in as the migration lands. At plan creation time, the known likely wins are a thinner root control plane, a truthful package inventory, fewer naming leftovers, a less intimidating lesson/workbench tree, and a repo whose documentation matches the filesystem. The obvious risk is that a broad rename pass could create churn without enough architectural payoff. To avoid that, this plan deliberately sequences the control plane, package contracts, and feature ownership rules before any mass move of app files.

## Context and Orientation

The current repo is a Bun workspace with one dominant app and three focused packages. The root `package.json` owns the workspace list and manually delegates almost every command into `apps/web` or individual packages. There is no `turbo.json`, so the root behaves more like a script dispatcher than a true workspace control plane. The main app lives in `apps/web`, where `app/` contains route entrypoints, `features/` contains most product code, `platform/` contains app-local infra adapters, `convex/` contains the backend, `config/` contains the control plane, and `tests/` plus `playwright/` contain app-local verification. The internal packages live under `packages/` and currently cover blueprint compilation, blueprint presentation, and the local CLI.

The structural problem is not that there are too many top-level concepts. It is that those concepts do not all obey the same rules. Some areas, such as `apps/web/features/marketing`, are exemplary: configuration, content, render modeling, and render boundaries are all explicit. Other areas, such as `apps/web/features/auth/sign-in` and especially `apps/web/features/course/lesson/workbench`, mix routing glue, domain logic, shared helpers, and oversized UI files inside a tree that no longer matches the repo’s own stated boundaries. Similarly, the workspace package story is partly intentional but weakly taught: the compiler and CLI are obvious, while `blueprint-presentation` is easy to miss in the docs even though the app depends on it.

The target repo should look more like a clear monorepo and less like one app plus a pile of attached scripts. That means the root should expose one honest task graph, packages should have explicit contracts and clear ownership, and `apps/web` should feel like one opinionated app with stable top-level folders. It does not mean copying Dub’s internal `lib/` and `ui/` buckets or extracting packages just to imitate them.

The implementer should treat the target tree shown below as the intended end state, not as permission to rename every path in one pass. The safe sequence is: first map current imports and docs references, then establish compatibility shims where necessary, then move one domain at a time. In this repo, path changes have at least five downstream consumers: route files under `apps/web/app/**`, tests under `apps/web/tests/**`, Playwright smoke under `apps/web/playwright/**`, package consumers such as the CLI and Convex runtime, and generator-owned docs or starter files under `packages/blueprint-compiler/src/repo-generation/**`.

Current high-level tree:

    .
    ├── apps/
    │   └── web/
    │       ├── app/
    │       ├── components/ui/
    │       ├── config/
    │       ├── content/
    │       ├── convex/
    │       ├── features/
    │       │   ├── auth/
    │       │   ├── blog/
    │       │   ├── blueprint-flow/
    │       │   ├── checkout/
    │       │   ├── codex/
    │       │   ├── course/
    │       │   ├── docs/
    │       │   ├── execute-ship/
    │       │   ├── marketing/
    │       │   ├── observability/
    │       │   ├── product-access/
    │       │   ├── settings/
    │       │   ├── starter/
    │       │   ├── starter-repo/
    │       │   ├── workspace-home/
    │       │   └── workspace-navigation/
    │       ├── platform/
    │       ├── scripts/
    │       ├── tests/
    │       └── playwright/
    ├── packages/
    │   ├── blueprint-compiler/
    │   ├── blueprint-presentation/
    │   ├── ship-by-sunday-cli/
    │   └── tsconfig.base.json
    └── docs/

Target high-level tree after this initiative:

    .
    ├── apps/
    │   └── web/
    │       ├── app/
    │       ├── components/ui/
    │       ├── config/
    │       ├── content/
    │       ├── convex/
    │       ├── features/
    │       │   ├── auth/
    │       │   ├── blog/
    │       │   ├── blueprint/
    │       │   ├── checkout/
    │       │   ├── codex/
    │       │   ├── docs/
    │       │   ├── lessons/
    │       │   │   ├── artifacts/
    │       │   │   ├── library/
    │       │   │   ├── runtime/
    │       │   │   └── workbench/
    │       │   ├── marketing/
    │       │   ├── observability/
    │       │   ├── product-access/
    │       │   ├── starter/
    │       │   ├── starter-repo/
    │       │   └── workspace/
    │       │       ├── home/
    │       │       ├── navigation/
    │       │       └── review/
    │       ├── platform/
    │       ├── scripts/
    │       ├── tests/
    │       └── playwright/
    ├── packages/
    │   ├── blueprint-compiler/
    │   ├── blueprint-presentation/
    │   ├── ship-by-sunday-cli/
    │   └── tsconfig/
    │       ├── package.json
    │       ├── base.json
    │       ├── nextjs.json
    │       └── library.json
    ├── turbo.json
    └── docs/

The exact final feature names can still be adjusted during implementation, but the target rules should not. Every feature folder must describe one product or runtime area. Shared primitives stay in `components/ui/`. Infra stays in `platform/`. Convex stays in `convex/`. Tests stay app-local under `tests/` and browser specs stay under `playwright/`. Packages must exist only when they define a real reusable contract.

### In Scope

This plan owns the root workspace control plane, the introduction of `turbo.json`, the move from `packages/tsconfig.base.json` to a real `packages/tsconfig/` workspace, normalization of package scripts and exports, removal of cross-workspace source-path imports, documentation of the true package inventory, the feature-map cleanup inside `apps/web`, the breakup of the lesson/workbench monolith into smaller feature-local subtrees, a consistent policy for content and test locality, and updates to repo docs plus starter-generation docs that teach the new shape.

### Out Of Scope

This plan does not copy Dub’s business logic, route structure, host-based app layout, Prisma stack, or package internals. It does not move Convex out of `apps/web`. It does not extract `packages/ui` or `packages/utils` just to imitate Dub. It does not redesign the public product IA, marketing content, or lesson curriculum. It does not change runtime behavior unless a move or boundary cleanup requires a compatibility shim. It also does not reopen the already active Dub-style CI and test-harness reset except where this repo-shape work depends on its output.

## Plan of Work

Start by making the root of the repository truthful. The first implementation pass should add a real workspace task graph and a small set of standard package contracts so the repo stops pretending that manual root script chains are good enough. That means introducing `turbo.json`, creating a dedicated `packages/tsconfig/` workspace, and normalizing `build`, `lint`, `typecheck`, `test`, `format`, and `format:check` semantics across workspaces. During this phase, keep the old root commands alive as thin wrappers if needed so CI and local habits do not break mid-migration.

Once the root is honest, lock down package seams. Every cross-workspace dependency should flow through a declared package entrypoint rather than filesystem-relative imports into `packages/*/src`. Every existing package should get a short ownership description, clear exports, and a reason to exist. If `blueprint-presentation` remains intentionally thin, document that thinness as a UI-contract package. If any package cannot justify itself after inspection, merge it before the app refactor starts.

After the root and packages are stable, reshape `apps/web` around one naming and ownership model. The app already has good top-level buckets, so the work is mostly inside `features/`. Before renaming any feature folder, produce a one-file import and docs reference inventory with `rg` so the move can be scoped and reversed safely. Rename legacy or process-driven feature names only where the change creates a clearer ownership boundary. Consolidate `workspace-home` and `workspace-navigation` into a stable `workspace/` surface, move `blueprint-flow` toward a clearer `blueprint/` ownership model, and split the `course` tree into named lesson surfaces so `workbench`, lesson runtime, and optional library or browse behavior stop masquerading as one giant feature.

Only after the tree is understandable should tests and content be adjusted to match it. Keep the existing app-local `tests/` and `playwright/` model that already aligns with Dub’s strongest pattern, but make the test directory structure mirror the new feature names, remove stale parallel paths, and choose one consistent rule for where feature content lives. Finish by updating docs, starter-generator surfaces, and any scripts or build config that still teach the old tree. The writeback set at the end of the migration must include at least `README.md`, `docs/ARCHITECTURE.md`, `docs/design-docs/workspace-layout.md`, `docs/exec-plans/index.md` if the active-plan list changes, app-owned docs under `apps/web/content/docs/**` that mention the tree, and generator-owned docs or prompts under `packages/blueprint-compiler/src/repo-generation/**` that still emit old paths.

## Milestones

### Milestone 1: Freeze The Target Workspace Contract

At the end of this milestone, the repo has an explicit written contract for what belongs at the root, in `apps/web`, and in `packages/`, plus a no-ambiguity rule for when a new package is allowed. The main touched files are `package.json`, a new `turbo.json`, `docs/design-docs/workspace-layout.md`, `README.md`, `docs/ARCHITECTURE.md`, and this ExecPlan. Use this milestone to define package naming, task naming, the target tree, and the rename ledger before moving code. The rename ledger should list every current feature path that is expected to move, the target path, the route or package consumers that depend on it, and whether a temporary compatibility re-export is required.

Run `bun run format`, `bun run lint`, and `bun run typecheck` after the contract files land. Success looks like a root tree and docs set that a newcomer can read without guessing which parts are historical leftovers.

### Milestone 2: Install The Dub-Style Root Control Plane

At the end of this milestone, the root is no longer hand-orchestrating every package with long `bun run --cwd ...` chains. `turbo.json` exists, each workspace exposes a standard minimum task contract, and the root scripts delegate into Turbo rather than enumerating every workspace manually. Create `packages/tsconfig/` here and migrate internal packages to it. Touched files include the root `package.json`, new `turbo.json`, new `packages/tsconfig/package.json`, new config JSON files, and the package manifests plus `tsconfig.json` files for `blueprint-compiler`, `blueprint-presentation`, `ship-by-sunday-cli`, and `apps/web`.

Run the narrowest checks first: the package-specific `typecheck` and `test` commands for any workspace whose manifest changed, then `bun run format`, `bun run lint`, and `bun run typecheck` from the root. Success looks like a truthful root control plane with one place to understand task orchestration.

### Milestone 3: Make Package Boundaries Explicit And Honest

At the end of this milestone, every cross-workspace import flows through a declared package boundary, every package exports only intended surfaces, and the workspace inventory is fully documented. Fix direct source imports such as `apps/web/convex/blueprint/stageReadiness.ts`, document `blueprint-presentation` explicitly, and decide whether any package should merge or rename before app-level moves begin. Touched files include package `package.json` files, `next.config.ts`, direct import call sites, package `README.md` files, and repo docs that describe the workspace. This milestone should also confirm whether `apps/web` still needs `transpilePackages` for both internal packages after the import cleanup and whether any package requires an explicit additional export path before app callers can stop reaching into package internals.

Run focused package tests plus `bun run format`, `bun run lint`, and `bun run typecheck`. Success looks like a monorepo where package ownership is obvious and filesystem-relative shortcuts into `packages/*/src` are gone.

### Milestone 4: Reshape The App Feature Map

At the end of this milestone, `apps/web/features/` follows one consistent naming and subdivision model. Consolidate legacy micro-features where the split is too granular, rename legacy or process-oriented names where necessary, and establish a stable tree for `blueprint`, `workspace`, and `lessons`. This milestone should touch `apps/web/features/**`, route imports under `apps/web/app/**`, feature-local server modules, app-level docs, and any feature selectors that still depend on the old names. Before editing route or Next-owned files in this milestone, read the relevant Next 16 guidance under `apps/web/node_modules/next/dist/docs/` and note any repo-specific constraints in the plan if they materially affect the move.

This milestone is complete when the feature tree reads like a product map instead of an archaeological record. A maintainer should be able to open `apps/web/features/` and predict where blueprint work, lesson work, workspace nav work, and post-review work live without following transitive imports.

### Milestone 5: Break Up The Lesson And Workbench Monolith

At the end of this milestone, `apps/web/features/course/lesson` is no longer a pseudo-framework hidden inside one feature. Move truly shared lesson helpers into clearer homes, split the workbench into named subareas, and break oversized components and hooks into smaller feature-local modules that obey the repo’s component boundary rules. The central files here include `apps/web/features/course/lesson/workbench/renderer.tsx`, the large `modes/*`, `fields/*`, and `shared/*` files, `apps/web/features/course/lesson/lib/assert.ts`, and the lesson shell/index files. The first extraction from this milestone should be one small, low-risk shared helper move such as relocating `assert` and `assertNever` into an app-level shared surface, because that proves the boundary change without first entangling the largest UI files.

Run focused lesson/workbench tests at every slice, then broader `bun run test`, `bun run format`, `bun run lint`, and `bun run typecheck` before moving on. Success looks like a lesson tree where the routing shell, runtime shell, workbench renderer, field controls, and browse surfaces are separate and named accordingly.

### Milestone 6: Align Tests, Content, And Docs With The New Tree

At the end of this milestone, `apps/web/tests/` mirrors the new feature map, `apps/web/playwright/` remains the single browser-spec surface, content locality rules are consistent across marketing, docs, and blog, and the repo docs plus starter-generated docs teach the new structure. Touched files include `apps/web/tests/**`, `apps/web/playwright/**`, feature content helpers, `docs/design-docs/workspace-layout.md`, `docs/ARCHITECTURE.md`, `README.md`, and any generator-owned docs or prompts that still reference the old paths.

Run the full acceptance suite here: `bun run format`, `bun run lint`, `bun run typecheck`, `bun run test`, `bun run test:contracts`, `bun run build`, and `bun run test:e2e`. Success looks like the tree, docs, and verification surfaces all agreeing about the same repo shape.

## Concrete Steps

Work from `/Users/parkerrex/Developer/ship-by-sunday`.

Begin by capturing the baseline tree and contract files so each move can be compared against the same starting point:

    pwd
    git branch --show-current
    sed -n '1,220p' package.json
    sed -n '1,220p' docs/design-docs/workspace-layout.md
    find apps/web/features -maxdepth 2 -type d | sort
    find packages -maxdepth 2 -type f | sort

Expected observation: the root has no `turbo.json`, `packages/tsconfig.base.json` is a loose file rather than a workspace, `apps/web/features/course` dominates the feature tree, and if the work is starting on a fresh branch it should be based on the current `dev` branch per the repo PR workflow.

Add the workspace control plane next. Create `turbo.json`, create `packages/tsconfig/`, and update workspace manifests plus `tsconfig.json` files before moving feature code. Keep the root command names stable during the first pass by making them thin wrappers if necessary. Do not rename feature folders yet.

After Turbo and shared TS config are in place, search for cross-workspace leaks and remove them before any broad rename:

    rg -n "packages/.*/src" apps/web packages
    rg -n "\"workspace:\\*\"" apps/web/package.json packages/*/package.json
    rg -n "transpilePackages|outputFileTracingIncludes" apps/web/next.config.ts apps/web/config

Expected observation: direct source imports and package-consumption shortcuts are easy to list and can be fixed surgically.

Only then move into the app feature tree. Use `git mv` for path moves so the history stays readable. Rename the directories one domain at a time. Do not move `course`, `blueprint-flow`, `workspace-home`, `workspace-navigation`, and `execute-ship` in one giant patch. For each domain, generate the import and docs reference inventory first:

    rg -n "blueprint-flow|workspace-home|workspace-navigation|execute-ship|features/course" apps/web packages docs

Expected observation: each move has a finite, reviewable blast radius before files are relocated.

Move one surface, update imports, update tests, run focused checks, and only then continue.

During the lesson/workbench slice, measure component and hook size before splitting:

    find apps/web/features/course/lesson -type f | wc -l
    wc -l apps/web/features/course/lesson/workbench/renderer.tsx
    wc -l apps/web/features/course/lesson/workbench/modes/*.tsx | sort -nr | head

Expected observation: the lesson/workbench tree is big enough that splitting by named subarea is clearly justified rather than cosmetic.

After the app tree is stable, align the tests and docs:

    find apps/web/tests -maxdepth 2 -type d | sort
    find apps/web/playwright -maxdepth 2 -type f | sort
    rg -n "blueprint-flow|course/lesson|workspace-home|workspace-navigation|execute-ship" README.md docs apps/web/content apps/web/tests packages/blueprint-compiler/src/repo-generation

Expected observation: every old feature name that mattered structurally is discoverable through search, including generator-owned surfaces, which makes the cleanup mechanically checkable.

## Validation and Acceptance

Acceptance is structural and behavioral. Structurally, the root must expose one obvious control plane, `packages/` must contain only real packages with documented contracts, and `apps/web/features/` must read like a coherent product map. Behaviorally, the application must still build, the app-local and package-local tests must still pass, and the route layer must still resolve to the same runtime features after the moves.

The plan is complete only when all of the following are true. A newcomer can explain the root tree from `README.md` and `docs/design-docs/workspace-layout.md` alone. The root scripts no longer hard-code every workspace task chain manually. A search for `packages/*/src` imports from runtime call sites returns nothing intentional. The lesson/workbench area no longer contains oversized pseudo-shared files masquerading as one feature. The test tree mirrors the feature tree instead of carrying stale parallel names. The generated starter and docs surfaces no longer teach legacy feature paths.

Manual proof is also required at the end of the app-path migration. After the route and feature moves are complete, a maintainer should start the app and verify that the public homepage, the docs route, one protected blueprint route, `/review`, and one lesson route still load from the renamed feature tree without import or routing regressions. If that smoke cannot be expressed as a stable command in this repo, record the exact manual path and observation in `Artifacts and Notes` during implementation.

### Test Commands

These commands must pass before the full initiative is considered complete:

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run format

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run lint

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run typecheck

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run test

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run test:contracts

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run build

    Working directory: /Users/parkerrex/Developer/ship-by-sunday
    bun run test:e2e

In addition, every milestone slice should run narrower proof before the full suite. Package-manifest changes should rerun the touched package `typecheck` and `test` commands. Feature-path moves should rerun the smallest affected Vitest groups before the full root suite. The existing active CI-harness plan should remain green throughout, because this initiative depends on that thinner test and workflow surface.

## Idempotence and Recovery

This migration should be executed as a sequence of additive, verifiable slices rather than one giant tree rewrite. Use `git mv` for file and directory moves so history remains readable and partially completed renames can be inspected with normal Git tools. Do not delete compatibility imports or temporary alias shims until the affected routes, tests, and docs have been updated and validated in the same slice.

If the Turbo migration lands but package scripts are not yet standardized, keep the old root commands as thin wrappers and route them through the new task graph until parity is proven. If a feature rename breaks too many imports at once, restore the old path as a thin re-export barrel or local shim, finish the consuming updates, then remove the shim in the next slice. If a lesson/workbench split starts to widen scope, stop after extracting one named subarea, rerun focused tests, and only then continue with the next subarea.

If documentation drifts during the migration, treat that as a blocking bug rather than cleanup debt. This plan is specifically about making the repo legible. A tree move that leaves docs, starter output, or developer commands teaching the old shape is incomplete. Recovery in that case is simple: update the docs in the same slice before moving on, then rerun the doc-linked commands and tree searches that prove the old paths are gone.

If the active CI-harness plan changes root task names or workflow expectations while this plan is being implemented, stop and reconcile the two plans before continuing. The safe recovery is to update this plan’s command references and milestones to the new control-plane truth before making more repo-shape changes. Do not let the plans diverge into two competing definitions of the root command surface.

## Artifacts and Notes

Research-driven “copy this / do not copy this” summary:

    Copy from Dub:
    - thin root control plane
    - real workspace runner config
    - packages/tsconfig workspace
    - explicit package exports
    - app-local tests/ and playwright/

    Do not copy from Dub:
    - giant apps/web/lib catch-all
    - giant apps/web/ui catch-all
    - direct imports from package source internals
    - mixed-purpose packages that blur runtime, infra, and tooling ownership

Current feature pressure points:

    345 files under apps/web/features/course
    303 files under apps/web/features/course/lesson
    39 files under apps/web/features/blueprint-flow
    28 files under apps/web/features/marketing

Current root-control-plane pressure points:

    no turbo.json at the repository root
    packages/tsconfig.base.json is a loose file, not a workspace
    root scripts hard-code every workspace in package.json
    apps/web typecheck currently runs the serialized Next build

Known boundary leak to remove early:

    apps/web/convex/blueprint/stageReadiness.ts
    imports directly from ../../../../packages/blueprint-compiler/src

Sibling plan that already owns the test-harness simplification:

    docs/exec-plans/active/2026-04-15-dub-style-ci-cd-test-harness-reset.md

## Interfaces and Dependencies

This initiative depends on the root `package.json` workspace definition and command surface, the new `turbo.json`, the new `packages/tsconfig/` workspace, the package manifests under `packages/`, and the Next app’s package-consumption boundary in `apps/web/next.config.ts`. It also depends on the feature trees under `apps/web/features/`, the route entrypoints under `apps/web/app/`, the Convex runtime under `apps/web/convex/`, the app-local verification surfaces under `apps/web/tests/` and `apps/web/playwright/`, and the docs that teach the repo shape.

The external toolchain dependencies are Bun for package management and script execution, Turbo for workspace orchestration, Oxlint and Oxformat for JavaScript and TypeScript linting plus formatting, Vitest for package and app tests, Playwright for browser smoke, Next.js for the app runtime, and Convex for the backend runtime that must remain app-local. Any change to task names or file locations must preserve these toolchain boundaries or update the corresponding configs in the same slice.
