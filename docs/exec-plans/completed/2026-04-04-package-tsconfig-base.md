---
summary: Factor the shared TypeScript compiler options used by the three non-web workspace packages into one base config while leaving `apps/web` on its own Next-specific tsconfig.
read_when: Open this when you need to remove duplicated TypeScript config from `packages/blueprint-compiler`, `packages/blueprint-presentation`, and `packages/ship-by-sunday-cli` without touching `apps/web`.
plan_status: done
---

# Add a shared TypeScript base config for the non-web packages

This document is a living execution plan. It should be updated as the work proceeds so a fresh contributor can resume from the file alone.

Maintain this ExecPlan in accordance with `.plans/PLANS.md` so its progress, decisions, and validation stay aligned with the repository contract.

## Purpose / Big Picture

Today the three non-web packages repeat the same TypeScript settings in three separate `tsconfig.json` files. After this change, those shared settings will live in one base file under `packages/`, each package will extend it, and `apps/web` will stay on its own Next-specific config path.

This matters because the next time the TypeScript settings need to change, a maintainer will edit one shared file instead of three copies. The change should not alter runtime behavior; the proof is that the package typechecks still pass and the web app keeps its own config unchanged.

## Progress

- [x] 2026-04-04 12:42 EDT — Read `AGENTS.md`, `.plans/PLANS.md`, `.docs/scripts.md`, the workspace manifests, and the non-web package tsconfig files; confirmed the three package configs are identical today and `apps/web` has a separate Next-specific config.
- [x] 2026-04-04 13:00 EDT — Created `packages/tsconfig.base.json` and switched the three non-web package configs to extend it while leaving `apps/web/tsconfig.json` untouched.
- [x] 2026-04-04 13:08 EDT — Validation exposed a stale `packages/blueprint-presentation/tests/blueprint-presentation.test.ts` assertion using the removed `"build-plan"` stage id; updated it to `"blueprint"` so the touched package could pass its own proof.
- [x] 2026-04-04 13:11 EDT — Ran the package and root validation commands successfully, including the direct formatter check for `packages/tsconfig.base.json`.

## Surprises & Discoveries

The three non-web package configs are byte-for-byte copies of the same `compilerOptions` block, so there is no package-specific variation to preserve in the shared base. That makes the migration a straight factor-out instead of a behavior change.

Another important discovery is that the root `bun run format`, `bun run lint`, and `bun run typecheck` scripts are wired to `apps/web` only. They are still required by the repo contract, but they do not prove the new shared package config is correct on their own, so package-level `format:check` and `typecheck` commands must be part of validation.

There is no existing `tsconfig.base.json` or similar shared config anywhere in the repo, and none of the workspace packages currently use `extends`. The change can therefore stay additive and local to `packages/`.

One more boundary matters for validation: the new shared base file will sit at `packages/tsconfig.base.json`, which is above the package directories. That means the package-local `format:check` scripts will not validate the new file automatically, so the plan needs one direct root-level formatter check for that sibling file.

Validation exposed a package-level type error in `packages/blueprint-presentation/tests/blueprint-presentation.test.ts`. The failing assertion still used the removed `"build-plan"` stage id even though the shared stage ids are now `"blueprint"` and `"review"`. The smallest honest recovery was to update the stale test to the canonical `"blueprint"` stage so the package could pass the validation the plan already required.

## Decision Log

Decision: Place the shared base at `packages/tsconfig.base.json` instead of the repo root.  
Rationale: The scope is explicitly the non-web workspace packages, and keeping the base under `packages/` makes it obvious that `apps/web` is excluded.  
Date/Author: 2026-04-04 / Codex

Decision: Move only the shared `compilerOptions` into the base file and keep each package's `include` list in its own `tsconfig.json`.  
Rationale: The `include` list is the package boundary, and keeping it local makes it obvious which files each package typechecks while still removing the duplicated compiler settings.  
Date/Author: 2026-04-04 / Codex

Decision: Do not change `apps/web/tsconfig.json` or any root workspace scripts for this initiative.  
Rationale: `apps/web` has a different compiler profile, and the existing root scripts already point at the web app; widening scope would add churn without changing behavior.  
Date/Author: 2026-04-04 / Codex

## Outcomes & Retrospective

Completed. The shared base file is in place, all three non-web package configs now extend it, and `apps/web/tsconfig.json` remained untouched. The only surprise during validation was the stale blueprint-presentation test assertion, which was corrected to the current stage id so the required package proof could pass.

## Context and Orientation

The repository root `package.json` defines the Bun workspace layout: `apps/web` and `packages/*`. The three target packages are `packages/blueprint-compiler`, `packages/blueprint-presentation`, and `packages/ship-by-sunday-cli`. Each package currently has its own `typecheck` script that runs `tsc --noEmit -p tsconfig.json`, plus `format:check` and `lint` scripts that operate inside that package directory.

Here, a “shared TypeScript base config” means one JSON file that holds the common `compilerOptions` block. A package `tsconfig.json` “extends” that base file when it inherits those options and then adds or overrides only the settings that are unique to that package, such as its `include` list. The non-web packages all currently share the same `compilerOptions` block and the same `include` list (`src/**/*.ts`, `tests/**/*.ts`, and `vitest.config.ts`), while `apps/web/tsconfig.json` is intentionally different because it includes DOM libraries, JSX, Next's TypeScript plugin, and path aliases for the web app.

That difference is why the shared base belongs under `packages/` and not in `apps/web`. The web app should remain on its own config path because it has a different target, different libs, and a Next-specific plugin that do not belong in the package base.

This change is internal. It should not add new runtime behavior, new package scripts, or any generated files. The only intended effect is to remove duplicated compiler settings from the non-web packages.

## Plan of Work

Create `packages/tsconfig.base.json` first, and copy the shared `compilerOptions` from one of the existing package configs without inventing new defaults. Keep the file limited to the shared settings only. Do not move the package `include` patterns into the base file unless a later discovery shows they truly belong there, because the current goal is to factor out the shared compiler options, not to create a workspace-wide project reference.

Then update `packages/blueprint-compiler/tsconfig.json`, `packages/blueprint-presentation/tsconfig.json`, and `packages/ship-by-sunday-cli/tsconfig.json` so each one extends `../tsconfig.base.json` and keeps only its local `include` array. Preserve the package entrypoint at `tsconfig.json` because the existing `typecheck` scripts already call `tsc --noEmit -p tsconfig.json` directly.

Leave `apps/web/tsconfig.json` unchanged. Its `jsx`, DOM libraries, Next plugin, and path aliases are intentionally different, so routing it through the shared package base would be the wrong abstraction for this initiative. No changes to the root workspace scripts are expected.

## Milestones

### Milestone 1 — Add the shared base config

At the end of this milestone, `packages/tsconfig.base.json` exists and contains the exact shared TypeScript compiler options currently duplicated across the three non-web packages. This milestone is independently verifiable by reading the new file and confirming that it holds only the common `compilerOptions` block.

### Milestone 2 — Convert the three non-web packages to inherit from the base

At the end of this milestone, `packages/blueprint-compiler/tsconfig.json`, `packages/blueprint-presentation/tsconfig.json`, and `packages/ship-by-sunday-cli/tsconfig.json` all extend `../tsconfig.base.json` and keep only their local `include` lists. `apps/web/tsconfig.json` must remain unchanged. This milestone is independently verifiable by reading the four tsconfig files and by checking that the web app was not touched.

### Milestone 3 — Prove the workspace still passes validation

At the end of this milestone, the package-level validation commands and the required root gates all pass. This milestone is independently verifiable by command output: each package `format:check` and `typecheck` command should exit cleanly, and the root `bun run format`, `bun run lint`, and `bun run typecheck` commands should also succeed.

## Concrete Steps

Work from the repository root unless a step explicitly says otherwise.

First, inspect the current package configs so the diff stays honest about what is being factored out:

    cd /Users/parkerrex/Projects/ship-by-sunday
    sed -n '1,120p' packages/blueprint-compiler/tsconfig.json
    sed -n '1,120p' packages/blueprint-presentation/tsconfig.json
    sed -n '1,120p' packages/ship-by-sunday-cli/tsconfig.json

Expected observation: the three files contain the same `compilerOptions` block and the same `include` list.

Next, add `packages/tsconfig.base.json` and update the three non-web package configs to extend it. Keep the package-local `include` arrays in the package files and leave `apps/web/tsconfig.json` alone.

Expected observation: the three non-web package configs become shorter, the shared compiler options exist in exactly one file, and `apps/web/tsconfig.json` remains byte-for-byte unchanged.

Then confirm the inheritance shape directly:

    cd /Users/parkerrex/Projects/ship-by-sunday
    rg -n '\"extends\"' packages/*/tsconfig.json
    git diff -- apps/web/tsconfig.json

Expected observation: all three non-web package configs point at the shared base, and there is no diff for `apps/web/tsconfig.json`.

Before relying on the package-local formatter commands, validate the new shared base file itself from the repository root:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bunx oxfmt -c .oxfmtrc.json --ignore-path .gitignore --check packages/tsconfig.base.json

Expected observation: `packages/tsconfig.base.json` is already correctly formatted even though it sits outside the package-local formatter script roots.

Validate the package-level commands next, because the root scripts do not exercise these configs:

    cd /Users/parkerrex/Projects/ship-by-sunday/packages/blueprint-compiler
    bun run format:check
    bun run typecheck

    cd /Users/parkerrex/Projects/ship-by-sunday/packages/blueprint-presentation
    bun run format:check
    bun run typecheck

    cd /Users/parkerrex/Projects/ship-by-sunday/packages/ship-by-sunday-cli
    bun run format:check
    bun run typecheck

Expected observation: no formatting diffs and no TypeScript diagnostics in any of the three packages.

Finish with the repository-required root gates:

    cd /Users/parkerrex/Projects/ship-by-sunday
    bun run format
    bun run lint
    bun run typecheck

Expected observation: all three commands exit cleanly. If any command reports unrelated worktree noise, stop and record the exact file list instead of widening the change.

## Validation and Acceptance

The change is complete when there is one shared file at `packages/tsconfig.base.json`, the three non-web package `tsconfig.json` files extend it, and `apps/web/tsconfig.json` is unchanged. A maintainer should be able to confirm that by reading the four files and seeing exactly one shared source of truth for the non-web package compiler options.

The direct command proof is that `bunx oxfmt -c .oxfmtrc.json --ignore-path .gitignore --check packages/tsconfig.base.json`, `bun run --cwd packages/blueprint-compiler format:check`, `bun run --cwd packages/blueprint-compiler typecheck`, `bun run --cwd packages/blueprint-presentation format:check`, `bun run --cwd packages/blueprint-presentation typecheck`, `bun run --cwd packages/ship-by-sunday-cli format:check`, and `bun run --cwd packages/ship-by-sunday-cli typecheck` all succeed, followed by the root `bun run format`, `bun run lint`, and `bun run typecheck` gates.

## Idempotence and Recovery

This change is safe to rerun because it only edits JSON config files. If a package fails after inheriting the base, restore that package's `tsconfig.json` from git, rerun its `typecheck`, and then move the mismatched option either back into the package file or into the shared base if it truly belongs to all three non-web packages.

There are no generated artifacts, migrations, caches, or external services involved. Recovery is just a config edit and another validation pass. If the shared base path turns out to be wrong, move it once and rerun the package typechecks; do not create a second base file.

## Artifacts and Notes

The most useful artifact to capture after implementation is the final diff showing the repeated `compilerOptions` blocks removed from the three package configs and replaced by one shared base file.

A good short proof snippet should look structurally like this:

    packages/tsconfig.base.json
    packages/blueprint-compiler/tsconfig.json
    packages/blueprint-presentation/tsconfig.json
    packages/ship-by-sunday-cli/tsconfig.json

And the validation transcript worth keeping is the successful command sequence with no diagnostics:

    $ bunx oxfmt -c .oxfmtrc.json --ignore-path .gitignore --check packages/tsconfig.base.json
    $ bun run --cwd packages/blueprint-compiler typecheck
    $ bun run --cwd packages/blueprint-presentation typecheck
    $ bun run --cwd packages/ship-by-sunday-cli typecheck
    $ bun run format
    $ bun run lint
    $ bun run typecheck

Keep the notes short. The important proof is that the shared base exists, the package configs are slimmed down, and the required commands exit with status 0.

## Interfaces and Dependencies

The new base file must be a valid TypeScript config JSON readable by `tsc`. Its `compilerOptions` should match the current shared settings exactly: `target: ES2022`, `lib: ["ES2022"]`, `module: ESNext`, `moduleResolution: Bundler`, `strict: true`, `noEmit: true`, `esModuleInterop: true`, `skipLibCheck: true`, `resolveJsonModule: true`, `isolatedModules: true`, and `types: ["node", "vitest/globals"]`.

Each non-web package `tsconfig.json` must keep its own `include` list for `src/**/*.ts`, `tests/**/*.ts`, and `vitest.config.ts`, because those paths define what each package's `typecheck` command reads. The root `package.json` scripts do not need to change, and `apps/web/tsconfig.json` must remain separate because it depends on the Next plugin, DOM libraries, JSX, and path aliases that are not shared by the non-web packages.

There are no external service dependencies for this work. The only dependency is TypeScript's normal `extends` behavior, where one `tsconfig.json` inherits options from another file and then applies its own local overrides.
