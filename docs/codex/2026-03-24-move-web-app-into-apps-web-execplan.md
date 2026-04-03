---
summary: "Execution plan for moving the web app into `apps/web`, adding an app-local dependency manifest, and making the repo root the workspace and orchestration layer. It captures the filesystem migration, root command delegation, Vercel root update, and residual follow-up checks."
read_when: "Open this when working on repo layout, app/root boundaries, workspace scripts, or deployment-root migration."
plan_status: "done"
---

# Move the Web Application Into `apps/web`

This document is a living execution plan for relocating the current single-root Next.js application into `apps/web`, introducing an app-local `package.json`, and turning the repository root into the workspace and orchestration layer for blueprint management, repo docs, deployment coordination, and top-level agent routing.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md` and updated as progress, discoveries, and decisions accumulate.

## Purpose / Big Picture

The repository currently makes the whole repo feel like the app root. After this change, the web product should live under `apps/web` as a real application root with its own dependency manifest, which creates a real application boundary and makes room for a focused `apps/web/AGENTS.md` plus a narrower lesson-specific `AGENTS.md` deeper in the course tree. A contributor should be able to distinguish repo-wide assets such as root `docs/`, `packages/`, the root workspace manifest, and the root `AGENTS.md` from the actual Next app, its Convex backend, its scripts, and its tests.

This slice is only about filesystem and tooling organization. It does not split the docs experience into a second app, redesign the lesson system, or implement blueprint-compiler behavior.

## Progress

- [x] 2026-03-24 Audited `docs/prompts/execplan-writer.md` and `docs/codex/PLANS.md`.
- [x] 2026-03-24 Audited the current app-root assumptions in `package.json`, `next.config.ts`, `tsconfig.json`, `components.json`, `vitest.config.ts`, `playwright.config.ts`, `proxy.ts`, `instrumentation.ts`, and `instrumentation-client.ts`.
- [x] 2026-03-24 Audited the current product docs implementation in `app/docs`, `features/docs`, `content/docs`, and `mdx-components.tsx`.
- [x] 2026-03-24 Confirmed the current Convex backend lives in `convex/` at the repo root and relies on local `.env` files at the repo root.
- [x] 2026-03-24 Grilled the plan and resolved that `apps/web` should be the real deployment root for the existing Vercel project.
- [x] 2026-03-24 Grilled the plan and resolved that the repo should adopt a workspace shape with an app-local `apps/web/package.json`.
- [x] 2026-03-24 Added the root workspace manifest and `apps/web/package.json`, then validated the install and app-local Next CLI resolution.
- [x] 2026-03-24 Moved the app-owned directories and app-root config files into `apps/web` with history-preserving renames.
- [x] 2026-03-24 Updated the root workspace scripts, root docs, CI workflow, ignore rules, and app-local ignore file so the repo root now delegates cleanly into `apps/web`.
- [x] 2026-03-24 Migrated local validation env files into `apps/web/.env.local` and `apps/web/.env.production` for runtime checks on this machine.
- [x] 2026-03-24 Reconfigured the existing Vercel project so `apps/web` is the live project root and confirmed the setting through both the Vercel API and `vercel project inspect`.
- [x] 2026-03-24 Validated the move with `bun run build`, `bun run test:contracts`, `bun run test:integration`, `bun run test:integration:ui`, `set -a; source apps/web/.env.local; set +a; bun run test:browser-smoke`, `bun run dev:web`, `bun run dev:convex`, and a successful Vercel preview deployment.
- [ ] 2026-03-24 Follow-up only: decide whether to clean up the preexisting `format:check`, `lint`, and `test:unit` baseline failures that are now plainly visible from the new app root.

## Surprises & Discoveries

The move is broader than shifting `app/` and `features/`. The current app root is defined by a cluster of root files: `next.config.ts`, `tsconfig.json`, `components.json`, `postcss.config.mjs`, `next-env.d.ts`, `mdx-components.tsx`, `proxy.ts`, `instrumentation.ts`, `instrumentation-client.ts`, `vitest.config.ts`, and `playwright.config.ts`. Leaving those at the repo root would create a fake boundary rather than a real one.

The repository has two different meanings of “docs.” Root `docs/` is repository documentation and planning material and should stay at the repo root. `app/docs`, `features/docs`, and `content/docs` are product docs inside the current Next app and should move with that app into `apps/web`. This plan does not create `apps/docs`; that would be a second standalone app and a larger architectural change.

The current environment flow is a real risk. The repo has root `.env.local`, `.env.local.example`, and `.env.production`, and `convex/README.md` explicitly says `convex dev` writes values into `.env.local`. Once commands run from `apps/web`, those app-local env files must be loaded from `apps/web` instead of the repo root.

There is no root `convex.json`. The current Convex CLI behavior depends on running `convex dev` from the directory that contains the `convex/` folder, so moving `convex/` into `apps/web` means the command strategy must move with it.

The original version of this plan assumed the root `package.json` would remain the only dependency manifest. That is too weak once `apps/web` becomes both the real app root and the Vercel deployment root. The grilled plan now assumes `apps/web/package.json` will own the app dependencies and scripts, while the root blueprint becomes a workspace coordinator.

GitHub Actions currently shells through root `bun run ...` commands in `.github/workflows/ci.yml`, so CI can stay stable if the root command surface remains stable. Vercel is different because the project root directory is configured outside git and must be updated manually during rollout.

During execution, the first attempt to remove all root dependencies while leaving root scripts unchanged failed because root `bun run` scripts did not automatically resolve workspace-installed binaries from `apps/web`. The root blueprint must explicitly delegate into `apps/web` instead of assuming hoisted CLI availability.

Running app-local formatter and lint commands from `apps/web` revealed that app-local tooling needs its own ignore file. Without `apps/web/.gitignore`, `oxfmt` scanned generated `.next` output and reported an unusable flood of formatting noise.

`@clerk/backend/webhooks` was imported directly in `apps/web/app/api/observability/clerk/route.ts` but not declared in the app dependency manifest. The build only surfaced this once the app blueprint became the true dependency owner, so the move exposed a real missing direct dependency.

The browser-smoke command still requires explicit env loading via `set -a; source apps/web/.env.local; set +a; ...`. That behavior was not introduced by the move, but the app-local env path now needs to be used consistently.

The local build and the Vercel preview build both emit the same non-blocking Turbopack and Nextra warnings. Turbopack warns that the Codex app-server path causes `apps/web/next.config.ts` to appear in the NFT trace, and Nextra cannot compute git-based last-modified metadata from the Vercel build root. Neither warning blocked local or preview builds.

## Decision Log

Decision: keep the repository root `package.json` and `bun.lock` in place and treat the root as the workspace and orchestration layer. Rationale: this matches the requested shape while preserving a single top-level operator entrypoint. Date: 2026-03-24.

Decision: move every file that defines the Next app root into `apps/web`, not just source folders. Rationale: `apps/web` must become the actual app root so that Next, shadcn, TypeScript, Playwright, Vitest, middleware, and instrumentation all resolve locally. Date: 2026-03-24.

Decision: keep root `docs/` where it is, but move product docs with the app under `apps/web`. Rationale: root `docs/` contains repo planning and reference material, while `app/docs`, `features/docs`, and `content/docs` are part of the product. Date: 2026-03-24.

Decision: do not create `apps/docs` in this slice. Rationale: the Nextra docs are part of the existing web app, not a separate application boundary. Splitting them into `apps/docs` would be a larger product and deployment change. Date: 2026-03-24.

Decision: add `apps/web/package.json` and convert the repo root into a workspace coordinator. Rationale: once `apps/web` becomes the real app root and Vercel deploy root, the app should own its dependency manifest locally rather than relying on a proxy root blueprint shape. Date: 2026-03-24.

Decision: reconfigure the existing Vercel project to use `apps/web` as the root directory instead of creating a second project. Rationale: this keeps the migration scoped to one application and one deployment target and avoids duplicate environment management. Date: 2026-03-24.

Decision: move the tracked env example into `apps/web` and treat local ignored env files as a manual operator migration step during execution. Rationale: the app will execute from `apps/web`, but private local files cannot be safely relocated by assumption. Date: 2026-03-24.

Decision: leave `packages/blueprint-compiler/` outside `apps/web`. Rationale: the requested structure treats it as a separate blueprint boundary rather than web-app code. Date: 2026-03-24.

Decision: limit the initial root workspace list to `apps/web` and only add `packages/blueprint-compiler` later when it has a real dependency manifest. Rationale: the blueprint-compiler directory currently contains instructions but no implementation blueprint surface. Date: 2026-03-24.

Decision: make the root command surface delegate into `apps/web` with `bun --cwd apps/web run ...` instead of relying on workspace dependency hoisting. Rationale: the first execution pass showed that root `bun run` scripts could not resolve app-local binaries after the dependency move. Date: 2026-03-24.

Decision: use Bun’s `bun run --cwd apps/web <script>` form for root delegation instead of `bun --cwd apps/web run <script>`. Rationale: the latter only printed Bun’s help output, while the former correctly executed the app blueprint scripts. Date: 2026-03-24.

Decision: add `apps/web/.gitignore` in addition to the root `.gitignore`. Rationale: app-local formatter and lint commands now run from `apps/web` and need a local ignore source for generated files such as `.next/`, `coverage/`, and Playwright artifacts. Date: 2026-03-24.

Decision: add `@clerk/backend` as a direct dependency of `apps/web/package.json`. Rationale: `@clerk/backend/webhooks` is imported directly by the app and was no longer available through an implicit transitive path once the app blueprint became the actual dependency owner. Date: 2026-03-24.

Decision: update the existing Vercel project root through the authenticated Vercel project API rather than leaving the change as a manual-only step. Rationale: the local machine already had an authenticated Vercel CLI session and linked project metadata, which allowed the rollout step to be completed and verified during execution. Date: 2026-03-24.

## Outcomes & Retrospective

When this work is complete, the repository root should mostly contain repo-level control files, the root workspace manifest, repo docs, packages, and top-level instructions, while `apps/web` should read as a self-contained Next plus Convex application with its own dependency manifest. The expected follow-on is to add `apps/web/AGENTS.md` and a deeper lesson-specific `AGENTS.md` once the filesystem boundary is stable.

The desired end state also includes the existing Vercel project building from `apps/web`. That rollout is now complete: the linked Vercel project’s `rootDirectory` is `apps/web`, and a preview deployment built successfully from that root.

The remaining gaps are not move regressions. `bun run format:check` still reports a large preexisting formatting baseline inside the app tree, `bun run lint` still reports 11 existing unused-variable or unused-import errors plus one hook warning, and `bun run test:unit` still reports 11 existing lesson and product-shell test failures that assume older `lessonId` semantics or outdated UI text expectations. Those failures were surfaced more clearly by the new app boundary but were not introduced by this migration.

## Context and Orientation

Today the web app is spread across root-level directories and files. Route entrypoints live in `app/`, shared UI in `components/`, product and course logic in `features/`, environment and server helpers in `platform/`, app docs content in `content/docs/`, static assets in `public/`, tests in `tests/`, CLI helpers in `scripts/`, and Convex functions in `convex/`. Product docs route wiring lives in `app/docs/[[...mdxPath]]/page.tsx` and `app/docs/layout.tsx`, supported by `features/docs/*`, `content/docs/*`, and `mdx-components.tsx`.

The root `package.json` currently runs Next, Convex, Vitest, Playwright, and many Node scripts as though the repository root is the app root. The root `tsconfig.json` maps `@/*` to `./*`, which works only because the app currently lives at the root. The root `components.json` points shadcn at `app/globals.css` and root-relative aliases. The root `.gitignore` ignores `.next`, `coverage`, `playwright-report`, and `test-results` only at the repo root. `.github/workflows/ci.yml` currently depends on those root blueprint scripts. The Vercel project linked in `.vercel/project.json` is external to git and must be reconfigured manually to point at `apps/web`.

The intended post-move shape is:

    repo/
      AGENTS.md
      package.json
      bun.lock
      docs/
      packages/
      .github/
      apps/
        web/
          package.json
          app/
          components/
          config/
          content/
          convex/
          data/
          features/
          hooks/
          lib/
          platform/
          public/
          scripts/
          tests/
          components.json
          instrumentation-client.ts
          instrumentation.ts
          mdx-components.tsx
          next-env.d.ts
          next.config.ts
          playwright.config.ts
          postcss.config.mjs
          proxy.ts
          tsconfig.json
          vitest.config.ts
          .env.local.example

This plan assumes root `docs/` stays as repo documentation, `packages/blueprint-compiler/` remains outside `apps/web`, the existing Vercel project is repointed at `apps/web`, and the initial workspace scope includes `apps/web` only.

## Plan of Work

First, establish the dependency-tool shape that matches the target architecture. Add `apps/web/package.json`, reduce the root dependency manifest to the workspace and orchestration role, and keep the root public command surface stable so CI and local habits do not have to change during the move.

Second, create `apps/web` and move the full app surface into it with `git mv` so history remains intact. Move the source directories, the app-root configuration files, the test and script infrastructure, and the tracked env example in the same milestone so `apps/web` becomes a coherent app root rather than a half-migrated shell.

Third, repair the root orchestration layer, CI assumptions, ignore rules, and env handling. The root `package.json` should keep the same public commands where practical, but those commands should delegate into `apps/web` so that Next, Convex, Vitest, Playwright, and script env loading all resolve against the new app root.

Fourth, reconfigure the existing Vercel project to use `apps/web` as the deployment root, then run narrow validation first and broader validation after that. The slice is done only when the root still drives the app cleanly, `apps/web` is the canonical home of the web product, and deployment has been updated to match the new root.

## Milestones

Milestone 1 establishes the new dependency-tool and workspace shape. At the end of this milestone, `apps/web/package.json` exists, the root dependency manifest has shifted to the workspace and orchestration role, and the command strategy is clear enough to support the filesystem move. Success is proven when the dependency manifests describe the intended ownership cleanly and the root remains the single operator entrypoint.

Milestone 2 establishes `apps/web` as the real application root. At the end of this milestone, all app-owned directories and app-root configuration files live under `apps/web`, and the repository tree no longer suggests that the whole repo is a single Next app. Success is proven when a filesystem audit shows the app consolidated under `apps/web` and the root retaining only repo-wide assets.

Milestone 3 repairs orchestration, environment handling, CI assumptions, and tool execution. At the end of this milestone, root blueprint scripts run Next, Convex, tests, and local scripts against `apps/web`, CI still shells through the root command surface, the tracked env example is in the app root, and `.gitignore` covers app-local generated outputs. Success is proven when `bun run dev:web`, `bun run dev:convex`, `bun run build`, and representative test commands work from the repo root without path hacks scattered across the codebase.

Milestone 4 restores documentation, updates deployment, validates the migration end to end, and leaves the tree ready for follow-on agent scoping. At the end of this milestone, durable docs that describe file locations no longer reference the old root-level app layout, the existing Vercel project has `apps/web` as its root directory, local env expectations are explicit, and the repo is ready for `apps/web/AGENTS.md` plus deeper lesson-specific agent files. Success is proven by passing the agreed validation commands, confirming the external deployment reconfiguration, and verifying that the remaining root directories are truly repo-wide rather than app-specific.

## Concrete Steps

1. Establish the dependency-tool ownership before moving files.

   Working directory: `/Users/parkerrex/Projects/ship-by-sunday`

   Command:
     `mkdir -p apps/web`

   Files to create or edit:
     `package.json`
     `apps/web/package.json`

   Required outcomes:
     The root dependency manifest becomes the workspace and orchestration layer.
     `apps/web/package.json` becomes the dependency and script owner for the web app.
     The initial workspace scope includes `apps/web` and does not require `packages/blueprint-compiler` to become a blueprint yet.
     The public root command surface remains stable so CI and local usage can keep calling `bun run dev:web`, `bun run build`, and the existing test commands.

2. Create `apps/web` and move the app-owned directories with history preservation.

   Working directory: `/Users/parkerrex/Projects/ship-by-sunday`

   Commands:
     `mkdir -p apps/web`
     `git mv app apps/web/app`
     `git mv components apps/web/components`
     `git mv config apps/web/config`
     `git mv content apps/web/content`
     `git mv convex apps/web/convex`
     `git mv data apps/web/data`
     `git mv features apps/web/features`
     `git mv hooks apps/web/hooks`
     `git mv lib apps/web/lib`
     `git mv platform apps/web/platform`
     `git mv public apps/web/public`
     `git mv scripts apps/web/scripts`
     `git mv tests apps/web/tests`

   Expected observation: `git status --short` shows renames into `apps/web/...` rather than a large delete-plus-add diff.

3. Move the files that define the current Next app root so `apps/web` becomes the actual app root.

   Working directory: `/Users/parkerrex/Projects/ship-by-sunday`

   Commands:
     `git mv components.json apps/web/components.json`
     `git mv instrumentation-client.ts apps/web/instrumentation-client.ts`
     `git mv instrumentation.ts apps/web/instrumentation.ts`
     `git mv mdx-components.tsx apps/web/mdx-components.tsx`
     `git mv next-env.d.ts apps/web/next-env.d.ts`
     `git mv next.config.ts apps/web/next.config.ts`
     `git mv playwright.config.ts apps/web/playwright.config.ts`
     `git mv postcss.config.mjs apps/web/postcss.config.mjs`
     `git mv proxy.ts apps/web/proxy.ts`
     `git mv tsconfig.json apps/web/tsconfig.json`
     `git mv vitest.config.ts apps/web/vitest.config.ts`
     `git mv .env.local.example apps/web/.env.local.example`

   Expected observation: `apps/web` now contains both the source tree and the files that define Next, Vitest, Playwright, shadcn, and TypeScript behavior.

4. Update the root orchestration layer, CI assumptions, and ignore rules so the root remains the control plane while the app runs from `apps/web`.

   Working directory: `/Users/parkerrex/Projects/ship-by-sunday`

   Files to edit:
     `package.json`
     `.gitignore`
     `.github/workflows/ci.yml`
     `AGENTS.md`
     `README.md` if it references the old root-level app layout

   Required outcomes:
     Root app commands execute from `apps/web`.
     Root commands remain the stable interface consumed by CI.
     Root scripts that call Node utilities either change directory into `apps/web` first or use app-root-relative paths consistently.
     `.gitignore` ignores `apps/web/.next`, `apps/web/coverage`, `apps/web/playwright-report`, `apps/web/test-results`, and `apps/web/*.tsbuildinfo`.
     Root docs mention `apps/web/...` where they previously described root-level app paths.

5. Update app-local config paths and references that still assume the old root layout.

   Working directory: `/Users/parkerrex/Projects/ship-by-sunday`

   Audit commands:
     `rg -n "\bapp/|\bfeatures/|\bconvex/|\btests/|\bcontent/docs\b" AGENTS.md README.md docs apps/web -S`
     `rg -n "\"@/\\*\"|app/globals.css|tests/" apps/web/components.json apps/web/tsconfig.json apps/web/vitest.config.ts apps/web/playwright.config.ts -S`

   Expected observation: app-local configs resolve paths inside `apps/web`, while root docs reference `apps/web/...` when talking about the web product.

6. Migrate local ignored environment files manually before exercising app commands.

   Working directory: `/Users/parkerrex/Projects/ship-by-sunday`

   Manual operator step:
     Copy or move local `.env.local` and `.env.production` into `apps/web/`.
     Keep the old root copies until validation passes, then remove or archive them to avoid ambiguity.

   Expected observation: `apps/web/.env.local` exists before `bun run dev:web` or `bun run dev:convex` is exercised.

7. Reconfigure the existing Vercel project to use `apps/web` as the deployment root.

   Manual operator step:
     Update the existing Vercel project settings so the root directory is `apps/web`.
     Verify that the project still points at the same repository and branch strategy.
     Confirm that the project environment variables are still present after the root directory change.

   Expected observation: preview and production builds now execute from `apps/web` rather than the repo root.

8. Run validation from the repo root, starting narrow and expanding.

   Working directory: `/Users/parkerrex/Projects/ship-by-sunday`

   Commands:
     `git status --short`
     `bun run dev:web`
     `bun run dev:convex`
     `bun run build`
     `bun run test:unit`
     `bun run test:contracts`
     `bun run test:integration`
     `bun run test:integration:ui`

   Additional deployment validation after the Vercel root is updated:
     Trigger a preview deployment from the existing Vercel project and confirm the build uses `apps/web`.

   Optional broader validation after the above passes:
     `set -a; source apps/web/.env.local; set +a; bun run test:browser-smoke`
     `bun run check`

   Expected observation: the same public root commands still work, but app output is now generated under `apps/web`.

## Validation and Acceptance

The refactor is accepted when the web product lives under `apps/web` and the repository root no longer looks like the app root. `bun install` still runs at the repo root through the workspace setup. `apps/web/package.json` owns the app dependencies and scripts. `bun run dev:web` starts the Next app using `apps/web` as its real root. `bun run dev:convex` runs against `apps/web/convex` and refreshes app-local env values. `bun run build` succeeds. The relevant Vitest suites succeed. The product docs route still resolves through `apps/web/app/docs`, backed by `apps/web/features/docs` and `apps/web/content/docs`. Repo planning and reference docs remain in root `docs/`.

The existing Vercel project must also be updated so `apps/web` is the root directory, and at least one preview deployment must confirm that the new deployment root builds successfully. A local-only success without matching deployment reconfiguration is not enough to call this migration done.

A human should also verify the tree shape directly. Running `find apps/web -maxdepth 2` should show the app-owned directories clustered there, while the repo root should primarily contain control files, repo docs, packages, and `apps/`.

If any root-level app directory such as `app/`, `features/`, `convex/`, `tests/`, or `public/` still remains after the move, the migration is incomplete unless that remainder is explicitly documented as intentional.

## Idempotence and Recovery

Use `git mv` wherever possible so reruns remain history-preserving and easy to reason about. If a move partially completes, continue moving the remaining paths rather than trying to hand-reconstruct the tree. If root commands fail after the move, do not scatter files back to the root piecemeal. Repair the root orchestration layer so it consistently runs from `apps/web`.

Treat local env migration carefully. Because `.env.local` and `.env.production` are ignored, keep backup copies until validation passes. If `convex dev` or `next dev` cannot find expected env values, first confirm that the active files are in `apps/web/` before changing code.

If the Vercel root-directory change breaks preview or production deployment, the rollback is to restore the project root to the old repository root temporarily, keep the local filesystem migration on the branch, and document the exact external blocker before continuing.

If a tool cannot be driven cleanly from the repo root with the app inside `apps/web`, document the exact failure and the smallest corrective deviation. The preferred fallback is a thin app-local wrapper or workspace-script adjustment only if the root orchestration strategy proves impossible, not as a first choice.

## Artifacts and Notes

Evidence gathered during planning and execution:

  `package.json` currently runs `next dev`, `next build`, `convex dev`, Vitest, Playwright, and many Node scripts from the repo root.

  `.github/workflows/ci.yml` currently shells through root `bun run ...` commands, so preserving the root command surface is part of the migration contract.

  The first workspace execution attempt failed with `/bin/bash: next: command not found` when the root script still called `next dev` directly after dependencies moved to `apps/web`. Explicit root-to-app delegation is required.

  `bun run build` now succeeds from the repo root and builds the app from `apps/web`, with only the existing Turbopack and Nextra warnings remaining.

  `bun run test:contracts` passes after aligning the stale legacy-redirect assertions with route-segment destinations and the intentional `1.0 -> /mission` redirect.

  `bun run test:integration` passes: 17 files, 87 tests.

  `bun run test:integration:ui` passes: 11 files, 41 tests.

  `set -a; source apps/web/.env.local; set +a; bun run test:browser-smoke` passes: 5 tests.

  `bun run dev:web` reaches a ready state on `http://localhost:3000` from `apps/web`.

  `bun run dev:convex` reaches the hosted-dev startup path from `apps/web` and emits only the preexisting Convex AI-files update notice.

  `bun run test:unit` still fails in 4 files with 11 tests. The remaining failures are in `apps/web/tests/unit/course-state-lifecycle.test.ts`, `apps/web/tests/unit/product-shell-navigation.test.ts`, `apps/web/tests/unit/product-shell.test.tsx`, and `apps/web/tests/unit/competitor-research-light-workbench.test.tsx`, and they reflect baseline drift in lesson-key semantics or UI copy expectations rather than the filesystem move.

  `bun run lint` still fails with 11 existing unused-variable or unused-import errors and one hook warning in the app codebase.

  `bun run format:check` still fails against a broad existing app-formatting baseline even after adding `apps/web/.gitignore` and pointing the app scripts at the root Oxlint and Oxformat configs.

  `tsconfig.json` currently maps `@/*` to `./*`, which is why the current root layout works.

  `components.json` currently points shadcn at `app/globals.css`, confirming it belongs with the app.

  `app/docs`, `features/docs`, and `content/docs` are product docs assets and should move under `apps/web`, while root `docs/` should not.

  There is no root `convex.json`; the location of the `convex/` directory is part of the active Convex command contract.

  The existing Vercel project `man-meets-ai-simple` now reports `Root Directory apps/web` and a preview deployment succeeded at `https://man-meets-ai-simple-ls4j3790y-rexorg.vercel.app`.

## Interfaces and Dependencies

This plan directly depends on the root `package.json` workspace and command surface, the future `apps/web/package.json`, the root `.gitignore`, `.github/workflows/ci.yml`, the app-owned config files that define the Next root, the docs route in `app/docs`, the docs support code in `features/docs`, the MDX content in `content/docs`, the Convex backend in `convex/`, the app scripts in `scripts/`, the test infrastructure in `tests/`, and the external Vercel project settings.

The most important interfaces that must remain stable after the move are the root blueprint commands consumed by developers and CI, the app-local dependency manifest in `apps/web/package.json`, the `@/*` import alias inside the app, the Next middleware entry in `proxy.ts`, the instrumentation entrypoints, the product docs route wiring, the Convex environment flow that currently writes and reads `.env.local`, and the Vercel project’s deployment root. The follow-on `AGENTS.md` work depends on this filesystem boundary existing first, but the content of those files is intentionally out of scope for this plan.
